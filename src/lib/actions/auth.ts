"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth";

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();
  const sb = await supabaseServer();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const profession = String(formData.get("profession") ?? "").trim();
  const goals = String(formData.get("goals") ?? "").trim();

  const { error } = await sb
    .from("profiles")
    .upsert({ id: user.id, display_name, profession, goals });
  if (error) throw new Error(error.message);

  redirect("/home");
}
