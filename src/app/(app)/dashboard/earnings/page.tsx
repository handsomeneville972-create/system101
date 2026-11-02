import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet } from "lucide-react";
import { RequestPayoutButton } from "@/components/dashboard/RequestPayoutButton";
import { StatCard } from "@/components/dashboard/StatCard";
import { getUser } from "@/lib/auth";
import { payoutAccount, payoutMinimumCents, sellerEarnings } from "@/lib/data/earnings";
import { shortDate, usd } from "@/lib/money";

export const instant = false;

const STATUS_LABEL: Record<string, string> = {
  requested: "In review",
  paid: "Paid",
  rejected: "Rejected",
};

const STATUS_STYLE: Record<string, string> = {
  requested: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  paid: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  rejected: "border-red-400/30 bg-red-400/10 text-red-300",
};

const TH =
  "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-widest text-zinc-500";
const TD = "px-3 py-2.5 text-sm text-zinc-300";

export default async function EarningsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in?next=/dashboard/earnings");

  const [earnings, account] = await Promise.all([sellerEarnings(), payoutAccount()]);

  if (!earnings) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Earnings</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Could not load earnings. Refresh to try again.
        </p>
      </div>
    );
  }

  const minimum = payoutMinimumCents();
  const hasAccount = Boolean(account?.account_number);
  const pending = earnings.payouts.find((payout) => payout.status === "requested");
  const canRequest = hasAccount && !pending && earnings.available_cents >= minimum;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Earnings</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Sales from your books. You keep 90% of each sale.
          </p>
        </div>
        <Link
          href="/settings/payouts"
          className="text-xs text-zinc-400 underline hover:text-zinc-200"
        >
          Payout details
        </Link>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Gross sales" value={usd(earnings.gross_cents)} />
        <StatCard
          label="Platform fee"
          value={usd(earnings.fee_cents)}
          hint="10% of each sale"
        />
        <StatCard label="Net earnings" value={usd(earnings.net_cents)} />
        <StatCard
          label="Available"
          value={usd(earnings.available_cents)}
          hint={
            earnings.paid_cents > 0
              ? `${usd(earnings.paid_cents)} requested or paid`
              : undefined
          }
        />
      </div>

      <div className="card mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium">Payout</h2>
            <p className="mt-1 text-xs text-zinc-400">
              {hasAccount
                ? `${account?.bank_name} · ${account?.account_number}`
                : "Add your payout details to request a payout."}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Minimum {usd(minimum)}. Payouts are reviewed manually.
            </p>
          </div>

          {!hasAccount ? (
            <Link
              href="/settings/payouts"
              className="btn-pill bg-white px-5 py-2 text-sm font-medium text-black"
            >
              Add payout details
            </Link>
          ) : pending ? (
            <span className="text-xs text-zinc-500">
              {usd(pending.amount_cents)} in review
            </span>
          ) : canRequest ? (
            <RequestPayoutButton label={`Request ${usd(earnings.available_cents)}`} />
          ) : (
            <span className="text-xs text-zinc-500">
              Reach {usd(minimum)} to request a payout.
            </span>
          )}
        </div>
      </div>

      <div className="card mt-4 overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 pt-4">
          <h2 className="text-sm font-medium">Sales</h2>
          <span className="text-[11px] text-zinc-500">
            {earnings.sales.length} {earnings.sales.length === 1 ? "sale" : "sales"}
          </span>
        </div>

        {earnings.sales.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Wallet className="mx-auto h-6 w-6 text-zinc-600" aria-hidden />
            <p className="mt-3 text-sm text-zinc-400">No sales yet.</p>
            <p className="mt-1 text-xs text-zinc-500">
              Publish a paid book and your sales land here.
            </p>
            <Link
              href="/ebooku/upload"
              className="btn-pill mt-4 inline-flex bg-white px-5 py-2 text-sm font-medium text-black"
            >
              Upload a book
            </Link>
          </div>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b hairline">
                  <th className={TH}>Date</th>
                  <th className={TH}>Book</th>
                  <th className={TH}>Gross</th>
                  <th className={TH}>Fee</th>
                  <th className={TH}>You</th>
                </tr>
              </thead>
              <tbody>
                {earnings.sales.map((sale) => (
                  <tr key={sale.id} className="border-b border-white/[0.04] last:border-0">
                    <td className={TD}>{shortDate(sale.created_at)}</td>
                    <td className={TD}>
                      <Link
                        href={`/ebooku/${sale.ebook_id}`}
                        className="hover:text-white"
                      >
                        {sale.book_title}
                      </Link>
                    </td>
                    <td className={TD}>{usd(sale.amount_cents)}</td>
                    <td className="px-3 py-2.5 text-sm text-zinc-500">
                      −{usd(sale.fee_cents)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-white">
                      {usd(sale.net_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {earnings.payouts.length > 0 && (
        <div className="card mt-4 overflow-hidden">
          <h2 className="px-4 pt-4 text-sm font-medium">Payout history</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[420px]">
              <thead>
                <tr className="border-b hairline">
                  <th className={TH}>Requested</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Note</th>
                </tr>
              </thead>
              <tbody>
                {earnings.payouts.map((payout) => (
                  <tr
                    key={payout.id}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className={TD}>{shortDate(payout.requested_at)}</td>
                    <td className={TD}>{usd(payout.amount_cents)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${
                          STATUS_STYLE[payout.status]
                        }`}
                      >
                        {STATUS_LABEL[payout.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-zinc-500">
                      {payout.note ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
