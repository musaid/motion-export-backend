import PDFDocument from 'pdfkit';
import type { InvoiceData, Seller } from './invoice.server';

const BRAND = '#6366f1';
const INK = '#18181b';
const MUTED = '#71717a';
const RULE = '#e4e4e7';

/** Bill-to details as shown on the page, after any admin overrides. */
export type InvoiceRecipient = {
  name: string;
  company: string;
  addressLines: string[];
  email: string;
};

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function dateOnly(value: string | null) {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'N/A';
  return [
    d.getUTCFullYear(),
    String(d.getUTCMonth() + 1).padStart(2, '0'),
    String(d.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Render the invoice as a PDF buffer.
 *
 * This redraws the layout in pdfkit's imperative API rather than converting the
 * HTML page — generating from the markup would mean shipping a headless browser
 * in the image. The two therefore have to be kept in step by hand; the figures
 * come from the same InvoiceData either way.
 */
export function renderInvoicePdf(
  invoice: InvoiceData,
  seller: Seller,
  billTo: InvoiceRecipient,
): Promise<Buffer> {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;

  // Header: seller identity, and the invoice number on the right.
  doc
    .fillColor(INK)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text(seller.name, left, 50);
  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(9)
    .text(seller.website, left, doc.y);

  doc
    .fillColor(BRAND)
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('INVOICE', left, 48, { align: 'right' });
  doc
    .fillColor(MUTED)
    .font('Helvetica')
    .fontSize(9)
    .text(invoice.invoiceNumber, left, 72, { align: 'right' });

  let y = 110;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(RULE).stroke();
  y += 22;

  // From / Bill to, side by side.
  const colRight = left + 260;
  const label = (text: string, x: number, yy: number) =>
    doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8).text(text, x, yy);

  label('FROM', left, y);
  label('BILL TO', colRight, y);
  y += 14;

  const fromLines = [
    seller.name,
    ...seller.addressLines,
    ...(seller.taxId ? [`Tax ID: ${seller.taxId}`] : []),
    seller.email,
  ];
  const toLines = [
    ...(billTo.name ? [billTo.name] : []),
    ...(billTo.company ? [billTo.company] : []),
    ...billTo.addressLines,
    billTo.email,
  ];

  doc.font('Helvetica').fontSize(9.5).fillColor(INK);
  let fy = y;
  for (const line of fromLines) {
    doc.text(line, left, fy, { width: 240 });
    fy = doc.y + 1;
  }
  let ty = y;
  for (const line of toLines) {
    doc.text(line, colRight, ty, { width: 240 });
    ty = doc.y + 1;
  }

  y = Math.max(fy, ty) + 18;

  // Dates and payment method.
  const meta: [string, string][] = [
    ['INVOICE DATE', dateOnly(invoice.issuedAt)],
    ...((invoice.paidAt ? [['DATE PAID', dateOnly(invoice.paidAt)]] : []) as [
      string,
      string,
    ][]),
    ...((invoice.paymentMethod
      ? [['PAYMENT METHOD', invoice.paymentMethod]]
      : []) as [string, string][]),
  ];
  let mx = left;
  for (const [k, v] of meta) {
    label(k, mx, y);
    doc
      .fillColor(INK)
      .font('Helvetica')
      .fontSize(9.5)
      .text(v, mx, y + 13);
    mx += 165;
  }
  y += 44;

  // Line items.
  doc.moveTo(left, y).lineTo(right, y).strokeColor(RULE).stroke();
  y += 8;
  doc.fillColor(INK).font('Helvetica-Bold').fontSize(9);
  doc.text('Description', left, y);
  doc.text('Qty', right - 150, y, { width: 40, align: 'right' });
  doc.text('Amount', right - 90, y, { width: 90, align: 'right' });
  y += 16;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(RULE).stroke();
  y += 12;

  doc.fillColor(INK).font('Helvetica').fontSize(9.5);
  doc.text(invoice.description, left, y, { width: 300 });
  doc.text('1', right - 150, y, { width: 40, align: 'right' });
  doc.text(money(invoice.amount, invoice.currency), right - 90, y, {
    width: 90,
    align: 'right',
  });
  doc
    .fillColor(MUTED)
    .font('Courier')
    .fontSize(8)
    .text(`License ${invoice.licenseKey}`, left, doc.y + 2);

  y = doc.y + 18;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(RULE).stroke();
  y += 10;

  // Totals, including any refund.
  const totalRow = (text: string, value: string, bold = false) => {
    doc
      .fillColor(bold ? INK : MUTED)
      .font(bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(bold ? 11 : 9.5);
    doc.text(text, right - 250, y, { width: 160, align: 'right' });
    doc.text(value, right - 90, y, { width: 90, align: 'right' });
    y += bold ? 18 : 15;
  };

  totalRow('Subtotal', money(invoice.amount, invoice.currency));
  if (invoice.amountRefunded > 0) {
    totalRow('Refunded', `-${money(invoice.amountRefunded, invoice.currency)}`);
  }
  totalRow(
    invoice.amountRefunded > 0 ? 'Net paid' : 'Total paid',
    money(invoice.netAmount, invoice.currency),
    true,
  );

  y += 6;
  const badge =
    invoice.netAmount === 0 && invoice.amount > 0
      ? 'REFUNDED IN FULL'
      : invoice.amountRefunded > 0
        ? 'PARTIALLY REFUNDED'
        : 'PAID IN FULL';
  doc
    .fillColor(BRAND)
    .font('Helvetica-Bold')
    .fontSize(8.5)
    .text(badge, left, y);

  // Footer references.
  y += 26;
  doc.moveTo(left, y).lineTo(right, y).strokeColor(RULE).stroke();
  y += 10;
  doc.fillColor(MUTED).font('Helvetica').fontSize(8);
  if (invoice.receiptNumber) {
    doc.text(`Stripe receipt: ${invoice.receiptNumber}`, left, y);
    y = doc.y;
  }
  if (invoice.stripeSessionId) {
    doc.text(`Ref: ${invoice.stripeSessionId}`, left, y);
    y = doc.y;
  }
  doc.text(
    `Thank you for your purchase. Questions? ${seller.email}`,
    left,
    y + 6,
  );

  doc.end();
  return done;
}
