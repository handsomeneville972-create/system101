"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth";
import { INTERESTS } from "@/lib/domain";
import { actionRateLimit } from "@/lib/action-limit";
import { checkUsername, usernameError } from "@/lib/username";

export type OnboardingState = { error?: string };

export async function signOut() {
  const sb = await supabaseServer();
  await sb.auth.signOut();
  redirect("/");
}

function dateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const user = await requireUser();
  const limited = await actionRateLimit("onboarding.complete", user.id, {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const interest = String(formData.get("interest") ?? "").trim();
  const goals = String(formData.get("goals") ?? "").trim();
  const usernameCheck = checkUsername(String(formData.get("username") ?? ""));

  if (!displayName || displayName.length > 60) {
    return { error: "Display name is required (60 characters max)." };
  }
  if (!usernameCheck.ok) return { error: usernameError(usernameCheck) };
  if (!INTERESTS.some((p) => p.slug === interest)) {
    return { error: "Pick a valid interest." };
  }
  if (goals.length > 200) return { error: "Goals are too long." };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("set_username", {
    p_username: usernameCheck.username,
  });
  if (error) return { error: error.message };

  const usernameResult = (data ?? {}) as {
    status?: string;
    next_change_at?: string | null;
  };
  if (usernameResult.status === "taken") return { error: "That username is taken." };
  if (usernameResult.status === "reserved") return { error: "That username is reserved." };
  if (usernameResult.status === "invalid") {
    return { error: usernameError({ ok: false, username: usernameCheck.username, reason: "format" }) };
  }
  if (usernameResult.status === "cooldown") {
    return {
      error: `You can change your username again on ${
        usernameResult.next_change_at ? dateLabel(usernameResult.next_change_at) : "a later date"
      }.`,
    };
  }
  if (
    usernameResult.status !== "ok" &&
    usernameResult.status !== "unchanged"
  ) {
    return { error: "Could not save your username." };
  }

  const { error: profileError } = await sb
    .from("profiles")
    .update({
      display_name: displayName,
      interest,
      goals: goals || null,
    })
    .eq("id", user.id);
  if (profileError) return { error: profileError.message };

  revalidatePath("/home");
  revalidatePath("/onboarding");
  redirect("/home");
}
