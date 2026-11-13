"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { getUser } from "@/lib/auth";
import { actionRateLimit } from "@/lib/action-limit";
import { checkUsername, usernameError } from "@/lib/username";

export type UsernameState = {
  error?: string;
  ok?: boolean;
  username?: string;
  nextChangeAt?: string | null;
};

export type UsernameStatus = {
  status: string;
  username?: string;
  next_change_at?: string | null;
  self?: boolean;
};

function dateLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function usernameStatus(value: string): Promise<UsernameStatus> {
  const user = await getUser();
  if (!user) return { status: "auth_required" };

  const limited = await actionRateLimit("username.check", user.id, {
    limit: 180,
    windowMs: 60_000,
  });
  if (limited) return { status: "rate_limited" };

  const check = checkUsername(value);
  if (!check.ok) return { status: check.reason };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("username_status", {
    p_username: check.username,
  });
  if (error) return { status: "error" };
  return (data ?? { status: "error" }) as UsernameStatus;
}

export async function saveUsername(
  _prev: UsernameState,
  formData: FormData
): Promise<UsernameState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const limited = await actionRateLimit("username.save", user.id, {
    limit: 12,
    windowMs: 60 * 60_000,
  });
  if (limited) return { error: limited };

  const check = checkUsername(String(formData.get("username") ?? ""));
  if (!check.ok) return { error: usernameError(check) };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc("set_username", {
    p_username: check.username,
  });
  if (error) return { error: error.message };

  const result = (data ?? {}) as {
    status?: string;
    username?: string;
    next_change_at?: string | null;
  };

  switch (result.status) {
    case "ok":
    case "unchanged":
      revalidatePath("/settings");
      revalidatePath("/home");
      revalidatePath(`/u/${user.id}`);
      return {
        ok: true,
        username: result.username ?? check.username,
        nextChangeAt: result.next_change_at ?? null,
      };
    case "cooldown":
      return {
        error: `You can change your username again on ${
          result.next_change_at ? dateLabel(result.next_change_at) : "a later date"
        }.`,
      };
    case "taken":
      return { error: "That username is taken." };
    case "reserved":
      return { error: "That username is reserved." };
    case "invalid":
      return { error: usernameError({ ok: false, username: check.username, reason: "format" }) };
    default:
      return { error: "Could not save username." };
  }
}
