"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export type FormState = { error?: string; ok?: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinNotify(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const surface = String(formData.get("surface") ?? "");

  if (!EMAIL_RE.test(email) || email.length > 254) return { error: "Enter a valid email." };
  if (surface !== "apps" && surface !== "decourse") return { error: "Unknown list." };

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("notify_requests")
    .upsert({ email, surface }, { onConflict: "email,surface", ignoreDuplicates: true });

  if (error) return { error: "Could not save. Try again." };
  return { ok: true };
}
