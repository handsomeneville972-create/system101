"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";
import { INTERESTS } from "@/lib/domain";

export type FormState = { error?: string; ok?: boolean };

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const goals = String(formData.get("goals") ?? "").trim();

  if (displayName.length > 80) return { error: "Name is too long." };
  if (bio.length > 1000) return { error: "Bio is too long." };
  if (!INTERESTS.some((i) => i.slug === interest)) return { error: "Pick a valid interest." };

  const donate_surfaces = {
    home: formData.get("donate_home") === "on",
    ebooku: formData.get("donate_ebooku") === "on",
    suggy: formData.get("donate_suggy") === "on",
    apps: formData.get("donate_apps") === "on",
  };

  const sb = await supabaseServer();
  const { error } = await sb
    .from("profiles")
    .update({
      display_name: displayName || null,
      interest,
      bio: bio || null,
      goals: goals || null,
      donate_surfaces,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/home");
  return { ok: true };
}
