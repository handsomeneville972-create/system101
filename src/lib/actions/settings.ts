"use server";

import { revalidatePath, updateTag } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";
import { INTERESTS } from "@/lib/domain";
import { TAGS } from "@/lib/cache";
import { actionRateLimit } from "@/lib/action-limit";

export type FormState = { error?: string; ok?: boolean };

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };
  const limited = await actionRateLimit("settings.save", user.id, {
    limit: 30,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const goals = String(formData.get("goals") ?? "").trim();

  if (displayName.length > 80) return { error: "Name is too long." };
  if (bio.length > 1000) return { error: "Bio is too long." };
  if (!INTERESTS.some((i) => i.slug === interest)) return { error: "Pick a valid interest." };

  const sb = await supabaseServer();
  const { error } = await sb
    .from("profiles")
    .update({
      display_name: displayName || null,
      interest,
      bio: bio || null,
      goals: goals || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  // display_name is embedded in public feeds.
  updateTag(TAGS.apps);
  updateTag(TAGS.ebooks);
  updateTag(TAGS.courses);
  revalidatePath("/settings");
  revalidatePath("/home");
  return { ok: true };
}
