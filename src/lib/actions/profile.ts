"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";

export type FormState = { error?: string; ok?: boolean };

export type AvatarTarget = { path: string; token: string };

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const EXT_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export async function prepareAvatarUpload(input: {
  ext: string;
}): Promise<{ error: string } | AvatarTarget> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const ext = input.ext.toLowerCase().replace(/^\./, "");
  if (!EXT_MIME[ext]) return { error: "Use JPG, PNG or WebP." };

  const admin = supabaseAdmin();
  const path = `${user.id}/avatar-${randomUUID()}.${ext}`;
  const { data, error } = await admin.storage.from("avatars").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not prepare upload." };

  return { path: data.path, token: data.token };
}

export async function setAvatar(formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const path = String(formData.get("avatar_path") ?? "");
  if (!path.startsWith(`${user.id}/`)) return { error: "Invalid upload path." };

  const ext = extOf(path);
  if (!EXT_MIME[ext]) return { error: "Use JPG, PNG or WebP." };

  const folder = path.split("/").slice(0, -1).join("/");
  const name = path.split("/").pop()!;
  const admin = supabaseAdmin();
  const { data: list } = await admin.storage.from("avatars").list(folder, { search: name, limit: 100 });
  const meta = (list ?? []).find((f) => f.name === name);
  if (!meta) return { error: "Avatar was not uploaded." };

  const size = Number((meta.metadata as { size?: number } | null)?.size ?? 0);
  const mime = String((meta.metadata as { mimetype?: string } | null)?.mimetype ?? "");
  if (size <= 0 || size > MAX_AVATAR_BYTES) return { error: "Avatar must be under 2MB." };
  if (!Object.values(EXT_MIME).includes(mime)) return { error: "Unexpected avatar type." };

  const sb = await supabaseServer();
  const { data: old } = await sb
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { error } = await sb.from("profiles").update({ avatar_url: path }).eq("id", user.id);
  if (error) return { error: error.message };

  const oldPath = (old?.avatar_url as string | null) ?? null;
  if (oldPath && oldPath !== path && oldPath.startsWith(`${user.id}/`)) {
    await admin.storage.from("avatars").remove([oldPath]);
  }

  revalidatePath("/settings");
  revalidatePath(`/u/${user.id}`);
  return { ok: true };
}

export async function removeAvatar(): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const sb = await supabaseServer();
  const { data } = await sb
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const path = (data?.avatar_url as string | null) ?? null;
  const { error } = await sb.from("profiles").update({ avatar_url: null }).eq("id", user.id);
  if (error) return { error: error.message };

  if (path && path.startsWith(`${user.id}/`)) {
    await supabaseAdmin().storage.from("avatars").remove([path]);
  }

  revalidatePath("/settings");
  revalidatePath(`/u/${user.id}`);
  return { ok: true };
}
