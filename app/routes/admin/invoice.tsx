import {
  data,
  Link,
  useSearchParams,
  type ShouldRevalidateFunctionArgs,
} from 'react-router';
import * as React from 'react';
import { requireAdmin } from '~/lib/auth.server';
import { getInvoiceData, getSeller } from '~/lib/invoice.server';
import { formatDateOnly } from '~/lib/format';
import type { Route } from './+types/invoice';

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireAdmin(request);

  const invoice = await getInvoiceData(params.licenseId);
  if (!invoice) {
    throw data('License not found', { status: 404 });
  }

  return data({ invoice, seller: getSeller() });
}

/**
 * Bill-to edits live in the query string, but they are presentational only —
 * nothing in the loader depends on them. Without this guard React Router
 * revalidates on every search-param change, so each keystroke fired another
 * Stripe request and typing crawled.
 */
export function shouldRevalidate({
  currentParams,
  nextParams,
}: ShouldRevalidateFunctionArgs) {
  return currentParams.licenseId !== nextParams.licenseId;
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  return [
    {
      title: loaderData
        ? `Invoice ${loaderData.invoice.invoiceNumber} — Motion Export`
        : 'Invoice — Motion Export',
    },
  ];
}

const BRAND = '#6366f1';

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** The Motion Export mark, with an explicit stroke so it survives printing. */
function Logo() {
  return (
    <svg
      viewBox="0 0 32 32"
      width="40"
      height="40"
      fill="none"
      aria-label="Motion Export"
      style={{ color: BRAND }}
    >
      <path
        d="M21.899 20.101c1.491-1.078 2.827-2.339 3.976-3.752.166-.205.166-.493 0-.697-1.149-1.413-2.485-2.674-3.976-3.752M10.101 20.101c-1.491-1.078-2.827-2.339-3.976-3.752-.166-.205-.166-.493 0-.697 1.149-1.413 2.485-2.674 3.976-3.752"
        stroke={BRAND}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.343 22.721c-.233-2.213-.087-4.455.437-6.629l.171-.711.149-.531c.572-2.049 1.474-3.985 2.665-5.735"
        stroke={BRAND}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminInvoice({ loaderData }: Route.ComponentProps) {
  const { invoice, seller } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [editing, setEditing] = React.useState(false);

  // Bill-to edits are held in local state so typing is instant, and mirrored
  // into the URL so a finished invoice stays a shareable link. Driving the
  // inputs from the URL directly made every keystroke wait on a navigation.
  const [billTo, setBillTo] = React.useState(() => ({
    name: searchParams.get('name') ?? invoice.billTo.name,
    company: searchParams.get('company') ?? invoice.billTo.company,
    address:
      searchParams.get('address') ?? invoice.billTo.addressLines.join('\n'),
    email: searchParams.get('email') ?? invoice.billTo.email,
  }));

  const { name: billName, company: billCompany, email: billEmail } = billTo;

  const addressLines = billTo.address
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  function updateField(key: keyof typeof billTo, value: string) {
    setBillTo((prev) => ({ ...prev, [key]: value }));
  }

  // Mirror the edits into the URL once typing settles, so the address bar
  // stays copyable without a navigation on every character.
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      // Always set, even when empty: an empty value is a deliberate "clear
      // this field", which must win over the Stripe-supplied fallback.
      for (const [key, value] of Object.entries(billTo)) {
        next.set(key, value);
      }
      if (next.toString() !== searchParams.toString()) {
        setSearchParams(next, { replace: true, preventScrollReset: true });
      }
    }, 400);
    return () => clearTimeout(timer);
    // searchParams is intentionally omitted: including it would re-run this
    // effect from its own write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billTo]);

  return (
    <div className="invoice-print-root">
      <style>{`
        @media print {
          .no-print { display: none !important; }

          /* The admin shell lives outside this route: the mobile navbar (with
             its hamburger) and the desktop sidebar both render ahead of the
             page. Print has no viewport width, so the lg:hidden header is not
             hidden and both were landing on the paper above the logo. */
          body > * { visibility: hidden; }
          .invoice-print-root,
          .invoice-print-root * { visibility: visible; }
          .invoice-print-root {
            position: absolute;
            inset: 0 auto auto 0;
            width: 100%;
          }

          .invoice-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }
          @page { margin: 18mm; }
        }
      `}</style>

      {/* Toolbar — never printed */}
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/admin/licenses"
          className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          &larr; Back to licenses
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {editing ? 'Done editing' : 'Edit bill-to'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: BRAND }}
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      {invoice.stripeUnavailable && (
        <div className="no-print mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          Could not reach Stripe. Amounts below come from the values stored at
          purchase time.
        </div>
      )}

      {editing && (
        <div className="no-print mb-6 space-y-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Customers often need the invoice addressed to their employer rather
            than to the name used at checkout. Edits are saved in this page's
            URL.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Name</span>
              <input
                type="text"
                value={billName}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Full name"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Company</span>
              <input
                type="text"
                value={billCompany}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Company name"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">
                Address (one line per row)
              </span>
              <textarea
                value={billTo.address}
                onChange={(e) => updateField('address', e.target.value)}
                rows={3}
                placeholder={
                  '181 Fremont Street, 27th Floor\nSan Francisco, CA\nUS'
                }
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                type="email"
                value={billEmail}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
            </label>
          </div>
        </div>
      )}

      {/* The invoice itself */}
      <div className="invoice-sheet mx-auto max-w-3xl rounded-lg bg-white p-10 text-zinc-900 shadow-sm ring-1 ring-zinc-950/5 print:ring-0">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <div className="text-lg font-semibold">{seller.name}</div>
              <div className="text-sm text-zinc-500">{seller.website}</div>
            </div>
          </div>
          <div className="text-right">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: BRAND }}
            >
              INVOICE
            </h1>
            <div className="mt-1 font-mono text-sm text-zinc-600">
              {invoice.invoiceNumber}
            </div>
          </div>
        </div>

        <hr className="my-8 border-zinc-200" />

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              From
            </div>
            <div className="text-sm leading-relaxed">
              <div className="font-medium">{seller.name}</div>
              {seller.addressLines.map((line, i) => (
                <div key={i} className="text-zinc-600">
                  {line}
                </div>
              ))}
              {seller.taxId && (
                <div className="text-zinc-600">Tax ID: {seller.taxId}</div>
              )}
              <div className="text-zinc-600">{seller.email}</div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Bill to
            </div>
            <div className="text-sm leading-relaxed">
              {billName && <div className="font-medium">{billName}</div>}
              {billCompany && <div className="font-medium">{billCompany}</div>}
              {addressLines.map((line, i) => (
                <div key={i} className="text-zinc-600">
                  {line}
                </div>
              ))}
              <div className="text-zinc-600">{billEmail}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Invoice date
            </div>
            <div className="text-sm">{formatDateOnly(invoice.issuedAt)}</div>
          </div>
          {invoice.paidAt && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Date paid
              </div>
              <div className="text-sm">{formatDateOnly(invoice.paidAt)}</div>
            </div>
          )}
          {invoice.paymentMethod && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Payment method
              </div>
              <div className="text-sm">{invoice.paymentMethod}</div>
            </div>
          )}
        </div>

        <table className="mt-10 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300">
              <th className="pb-2 text-left font-semibold">Description</th>
              <th className="pb-2 text-right font-semibold">Qty</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100">
              <td className="py-4">
                <div>{invoice.description}</div>
                <div className="mt-1 font-mono text-xs text-zinc-500">
                  License {invoice.licenseKey}
                </div>
              </td>
              <td className="py-4 text-right align-top">1</td>
              <td className="py-4 text-right align-top">
                {formatMoney(invoice.amount, invoice.currency)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="pt-4 text-right text-zinc-600">
                Subtotal
              </td>
              <td className="pt-4 text-right">
                {formatMoney(invoice.amount, invoice.currency)}
              </td>
            </tr>
            {invoice.amountRefunded > 0 && (
              <tr>
                <td colSpan={2} className="pt-2 text-right text-zinc-600">
                  Refunded
                </td>
                <td className="pt-2 text-right text-zinc-600">
                  &minus;{formatMoney(invoice.amountRefunded, invoice.currency)}
                </td>
              </tr>
            )}
            <tr>
              <td
                colSpan={2}
                className="pt-2 text-right text-base font-semibold"
              >
                {invoice.amountRefunded > 0 ? 'Net paid' : 'Total paid'}
              </td>
              <td className="pt-2 text-right text-base font-semibold">
                {formatMoney(invoice.netAmount, invoice.currency)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div
          className="mt-8 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
          style={{ backgroundColor: `${BRAND}1a`, color: BRAND }}
        >
          {invoice.netAmount === 0 && invoice.amount > 0
            ? 'Refunded in full'
            : invoice.amountRefunded > 0
              ? 'Partially refunded'
              : 'Paid in full'}
        </div>

        <hr className="my-8 border-zinc-200" />

        <div className="space-y-1 text-xs text-zinc-500">
          {invoice.receiptNumber && (
            <div>Stripe receipt: {invoice.receiptNumber}</div>
          )}
          {invoice.stripeSessionId && (
            <div className="font-mono">Ref: {invoice.stripeSessionId}</div>
          )}
          <div className="pt-2">
            Thank you for your purchase. Questions? {seller.email}
          </div>
        </div>
      </div>
    </div>
  );
}
