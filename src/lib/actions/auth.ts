"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth";
import { INTERESTS } from "@/lib/domain";

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();
  const sb = await supabaseServer();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim();
  const goals = String(formData.get("goals") ?? "").trim();

  if (!display_name || display_name.length > 60) throw new Error("Display name is required.");
  if (!INTERESTS.some((p) => p.slug === interest)) throw new Error("Pick a valid interest.");
  if (goals.length > 200) throw new Error("Goals are too long.");

  const { error } = await sb
    .from("profiles")
    .upsert({ id: user.id, display_name, interest, goals: goals || null });
  if (error) throw new Error(error.message);

  redirect("/home");
}
