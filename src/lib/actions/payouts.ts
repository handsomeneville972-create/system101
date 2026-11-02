"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";
import { payoutMinimumCents } from "@/lib/data/earnings";

export type PayoutFormState = { error?: string; ok?: boolean };

export async function savePayoutAccount(
  _prev: PayoutFormState,
  formData: FormData
): Promise<PayoutFormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const bankName = String(formData.get("bank_name") ?? "").trim();
  const accountName = String(formData.get("account_name") ?? "").trim();
  const accountNumber = String(formData.get("account_number") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim();

  if (!bankName || !accountName || !accountNumber) {
    return { error: "Add your bank, account name and account number." };
  }
  if (bankName.length > 80 || accountName.length > 80) {
    return { error: "Keep bank and account names under 80 characters." };
  }
  if (!/^[A-Za-z0-9 -]{4,34}$/.test(accountNumber)) {
    return { error: "Check the account number." };
  }

  const sb = await supabaseServer();
  const { error } = await sb.from("payout_accounts").upsert(
    {
      user_id: user.id,
      bank_name: bankName,
      account_name: accountName,
      account_number: accountNumber,
      country: country || null,
      currency: currency || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: "Could not save payout details." };

  revalidatePath("/settings/payouts");
  revalidatePath("/dashboard/earnings");
  return { ok: true };
}

export async function requestPayout(
  _prev: PayoutFormState,
  _formData: FormData
): Promise<PayoutFormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const sb = await supabaseServer();
  const minimum = payoutMinimumCents();
  const { data, error } = await sb.rpc("request_payout", {
    p_min_cents: minimum,
  });

  if (error) return { error: "Could not request a payout." };

  const result = data as { ok?: boolean; error?: string } | null;
  if (result?.error) return { error: result.error };

  revalidatePath("/dashboard/earnings");
  return { ok: true };
}

export async function decidePayout(
  id: string,
  status: "paid" | "rejected",
  note?: string
): Promise<PayoutFormState> {
  const user = await getUser();
  if (!user || !isAdmin(user.email)) return { error: "Not allowed." };
  if (!id) return { error: "Missing payout." };

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("payout_requests")
    .update({
      status,
      note: note?.trim() || null,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "requested");

  if (error) return { error: "Could not update the payout." };

  revalidatePath("/admin/payouts");
  revalidatePath("/dashboard/earnings");
  return { ok: true };
}
