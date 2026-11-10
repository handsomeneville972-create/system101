import { notFound, redirect } from "next/navigation";
import { PayoutDecision } from "@/components/admin/PayoutDecision";
import { isAdmin } from "@/lib/admin";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { shortDate, usd } from "@/lib/money";

export const instant = false;

type PayoutRow = {
  id: string;
  seller_id: string;
  amount_cents: number;
  status: "requested" | "paid" | "rejected";
  note: string | null;
  requested_at: string;
  decided_at: string | null;
};

const TH =
  "px-3 py-2 text-left text-[11px] font-medium uppercase tracking-widest text-zinc-500";
const TD = "px-3 py-2.5 text-sm text-zinc-300";

export default async function AdminPayoutsPage() {
  const user = await getUser();
  if (!user) redirect("/?mode=signin&next=/admin/payouts");
  if (!isAdmin(user.email)) notFound();

  const admin = supabaseAdmin();
  const { data } = await admin
    .from("payout_requests")
    .select("id, seller_id, amount_cents, status, note, requested_at, decided_at")
    .order("requested_at", { ascending: false })
    .limit(100);

  const requests = (data as PayoutRow[] | null) ?? [];
  const sellerIds = [...new Set(requests.map((row) => row.seller_id))];

  const [{ data: profiles }, { data: accounts }] = await Promise.all([
    sellerIds.length
      ? admin.from("profiles").select("id, display_name").in("id", sellerIds)
      : Promise.resolve({ data: [] }),
    sellerIds.length
      ? admin
          .from("payout_accounts")
          .select("user_id, bank_name, account_name, account_number, country, currency")
          .in("user_id", sellerIds)
      : Promise.resolve({ data: [] }),
  ]);

  const names = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const banks = new Map((accounts ?? []).map((a) => [a.user_id, a]));

  const pending = requests.filter((row) => row.status === "requested");
  const decided = requests.filter((row) => row.status !== "requested");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Payouts</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Review requests and mark them paid after you send the transfer.
      </p>

      <div className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-sm font-medium">Requested</h2>
          <span className="text-[11px] text-zinc-500">{pending.length} open</span>
        </div>

        {pending.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-zinc-500">
            Nothing waiting.
          </p>
        ) : (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b hairline">
                  <th className={TH}>Seller</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Bank</th>
                  <th className={TH}>Requested</th>
                  <th className={TH}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((row) => {
                  const bank = banks.get(row.seller_id);
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-white/[0.04] last:border-0"
                    >
                      <td className={TD}>{names.get(row.seller_id) ?? "Member"}</td>
                      <td className="px-3 py-2.5 text-sm text-white">
                        {usd(row.amount_cents)}
                      </td>
                      <td className={TD}>
                        {bank
                          ? `${bank.bank_name} · ${bank.account_number} · ${bank.account_name}${
                              bank.country ? ` (${bank.country})` : ""
                            }`
                          : "No payout details"}
                      </td>
                      <td className={TD}>{shortDate(row.requested_at)}</td>
                      <td className="px-3 py-2.5">
                        <PayoutDecision id={row.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div className="card mt-4 overflow-hidden">
          <h2 className="px-4 pt-4 text-sm font-medium">History</h2>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b hairline">
                  <th className={TH}>Seller</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Decided</th>
                  <th className={TH}>Note</th>
                </tr>
              </thead>
              <tbody>
                {decided.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className={TD}>{names.get(row.seller_id) ?? "Member"}</td>
                    <td className={TD}>{usd(row.amount_cents)}</td>
                    <td className={TD}>{row.status}</td>
                    <td className={TD}>
                      {row.decided_at ? shortDate(row.decided_at) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-zinc-500">
                      {row.note ?? "—"}
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
