import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { database } from '~/database/context';
import { licenses } from '~/database/schema';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY must be set in environment variables');
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-07-30.basil',
});

export type BillTo = {
  name: string;
  company: string;
  addressLines: string[];
  email: string;
};

export type InvoiceData = {
  invoiceNumber: string;
  issuedAt: string;
  paidAt: string | null;
  billTo: BillTo;
  description: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  receiptNumber: string | null;
  /** Total refunded against this charge, in major units. 0 when never refunded. */
  amountRefunded: number;
  /** What the customer is actually out of pocket: amount minus refunds. */
  netAmount: number;
  stripeSessionId: string | null;
  licenseKey: string;
  status: string;
  /** Stripe lookup failed; figures fall back to the values stored at purchase. */
  stripeUnavailable: boolean;
};

/**
 * Invoice number derived from the purchase date and the license UUID, so the
 * same license always yields the same number no matter how often it is
 * reprinted. Format: ME-YYYYMM-XXXXXX
 */
function buildInvoiceNumber(id: string, purchasedAt: string | null): string {
  const date = purchasedAt ? new Date(purchasedAt) : new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const suffix = id.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `ME-${year}${month}-${suffix}`;
}

function formatAddressLines(
  address: Stripe.Address | null | undefined,
): string[] {
  if (!address) return [];

  const cityLine = [address.postal_code, address.city]
    .filter(Boolean)
    .join(' ');

  return [
    address.line1,
    address.line2,
    cityLine,
    [address.state, address.country].filter(Boolean).join(', '),
  ].filter((line): line is string => Boolean(line && line.trim()));
}

/**
 * Build invoice data for a license. Figures come from Stripe when the purchase
 * has a checkout session, since Stripe is authoritative for what was actually
 * charged; admin-created (offline/free) licenses fall back to the values stored
 * on the license row.
 */
export async function getInvoiceData(
  licenseId: string,
): Promise<InvoiceData | null> {
  const [license] = await database()
    .select()
    .from(licenses)
    .where(eq(licenses.id, licenseId))
    .limit(1);

  if (!license) return null;

  const invoice: InvoiceData = {
    invoiceNumber: buildInvoiceNumber(license.id, license.purchasedAt),
    issuedAt:
      license.purchasedAt || license.createdAt || new Date().toISOString(),
    paidAt: license.purchasedAt,
    billTo: {
      name: '',
      company: '',
      addressLines: [],
      email: license.email,
    },
    description: 'Motion Export Pro — lifetime license',
    amount: license.amount || 0,
    currency: (license.currency || 'usd').toUpperCase(),
    paymentMethod: null,
    receiptNumber: null,
    amountRefunded: 0,
    netAmount: license.amount || 0,
    stripeSessionId: license.stripeSessionId,
    licenseKey: license.licenseKey,
    status: license.status || 'active',
    stripeUnavailable: false,
  };

  if (!license.stripeSessionId) {
    return invoice;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(
      license.stripeSessionId,
      { expand: ['payment_intent.latest_charge'] },
    );

    const details = session.customer_details;
    if (details) {
      invoice.billTo.name = details.name || '';
      invoice.billTo.email = details.email || invoice.billTo.email;
      invoice.billTo.addressLines = formatAddressLines(details.address);
    }

    if (session.amount_total != null) {
      invoice.amount = session.amount_total / 100;
    }
    if (session.currency) {
      invoice.currency = session.currency.toUpperCase();
    }

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent | null;
    const charge = paymentIntent?.latest_charge as Stripe.Charge | null;

    if (charge) {
      invoice.receiptNumber = charge.receipt_number;
      invoice.paidAt = new Date(charge.created * 1000).toISOString();
      invoice.amountRefunded = (charge.amount_refunded || 0) / 100;

      const card = charge.payment_method_details?.card;
      if (card) {
        const brand = card.brand
          ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
          : 'Card';
        invoice.paymentMethod = `${brand} •••• ${card.last4}`;
      } else if (charge.payment_method_details?.type) {
        invoice.paymentMethod = charge.payment_method_details.type;
      }
    }
  } catch (error) {
    // Stripe is unreachable or the session has been purged; the invoice still
    // renders from stored values, flagged so the admin knows figures are local.
    console.error('Failed to load Stripe details for invoice:', error);
    invoice.stripeUnavailable = true;
  }

  invoice.netAmount = Math.max(0, invoice.amount - invoice.amountRefunded);

  return invoice;
}

export type Seller = {
  name: string;
  addressLines: string[];
  taxId: string;
  email: string;
  website: string;
};

/**
 * Seller block. Defaults to brand-only; set the env vars to add a legal entity
 * name, postal address, or tax/VAT number without touching the template.
 * Blank values are omitted from the rendered invoice.
 */
export function getSeller(): Seller {
  return {
    name: process.env.INVOICE_SELLER_NAME || 'Motion Export',
    addressLines: (process.env.INVOICE_SELLER_ADDRESS || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    taxId: process.env.INVOICE_TAX_ID || '',
    email: process.env.INVOICE_SUPPORT_EMAIL || 'support@motionexport.com',
    website: 'motionexport.com',
  };
}
