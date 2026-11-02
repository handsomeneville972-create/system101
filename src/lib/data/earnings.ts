import { supabaseServer } from "@/lib/supabase-server";

export type EarningSale = {
  id: string;
  ebook_id: string;
  book_title: string;
  amount_cents: number;
  fee_cents: number;
  net_cents: number;
  created_at: string;
};

export type PayoutRequest = {
  id: string;
  amount_cents: number;
  status: "requested" | "paid" | "rejected";
  note: string | null;
  requested_at: string;
  decided_at: string | null;
};

export type Earnings = {
  gross_cents: number;
  fee_cents: number;
  net_cents: number;
  paid_cents: number;
  available_cents: number;
  sales: EarningSale[];
  payouts: PayoutRequest[];
};

export type PayoutAccount = {
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  country: string | null;
  currency: string | null;
  updated_at: string | null;
};

export async function sellerEarnings(): Promise<Earnings | null> {
  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("seller_earnings");
  if (error || !data) {
    if (error) console.error("seller_earnings failed:", error.message);
    return null;
  }
  return data as Earnings;
}

export async function payoutAccount(): Promise<PayoutAccount | null> {
  const sb = await supabaseServer();
  const { data } = await sb
    .from("payout_accounts")
    .select("bank_name, account_name, account_number, country, currency, updated_at")
    .maybeSingle();
  return (data as PayoutAccount | null) ?? null;
}

export function payoutMinimumCents() {
  return Number(process.env.PAYOUT_MIN_CENTS ?? 1000);
}
