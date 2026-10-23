"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";

export type FormState = { error?: string; ok?: boolean };

export type UploadTarget = { path: string; token: string };

const ICON_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const SCREENSHOT_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const MAX_ICON_BYTES = 2 * 1024 * 1024;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const MAX_SCREENSHOTS = 3;

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

async function objectMeta(bucket: string, path: string) {
  const parts = path.split("/");
  const name = parts.pop()!;
  const folder = parts.join("/");
  const admin = supabaseAdmin();
  const { data } = await admin.storage.from(bucket).list(folder, { search: name, limit: 100 });
  return (data ?? []).find((f) => f.name === name) ?? null;
}

export async function prepareUpload(input: {
  iconExt: string;
  screenshotExts: string[];
}): Promise<{ error: string } | { icon: UploadTarget; screenshots: UploadTarget[] }> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const iconExt = input.iconExt.toLowerCase().replace(/^\./, "");
  if (!ICON_EXT[iconExt]) return { error: "Icon must be JPG, PNG or WebP." };

  for (const ext of input.screenshotExts) {
    const e = ext.toLowerCase().replace(/^\./, "");
    if (!SCREENSHOT_EXT[e]) return { error: "Screenshots must be JPG, PNG or WebP." };
  }

  if (input.screenshotExts.length > MAX_SCREENSHOTS) {
    return { error: `Maximum ${MAX_SCREENSHOTS} screenshots.` };
  }

  const admin = supabaseAdmin();
  const iconPath = `${user.id}/${randomUUID()}.${iconExt}`;

  const i = await admin.storage.from("app-icons").createSignedUploadUrl(iconPath);
  if (i.error || !i.data) return { error: i.error?.message ?? "Could not prepare icon upload." };

  const screenshots: UploadTarget[] = [];
  for (let i2 = 0; i2 < input.screenshotExts.length; i2++) {
    const ext = input.screenshotExts[i2].toLowerCase().replace(/^\./, "");
    const path = `${user.id}/${randomUUID()}.${ext}`;
    const s = await admin.storage.from("app-screenshots").createSignedUploadUrl(path);
    if (s.error || !s.data) return { error: s.error?.message ?? "Could not prepare screenshot upload." };
    screenshots.push({ path: s.data.path, token: s.data.token });
  }

  return {
    icon: { path: i.data.path, token: i.data.token },
    screenshots,
  };
}

export async function createApp(formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const title = String(formData.get("title") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const developerBio = String(formData.get("developer_bio") ?? "").trim();
  const iconPath = String(formData.get("icon_path") ?? "");
  const screenshotPathsRaw = String(formData.get("screenshot_paths") ?? "");
  const repoUrl = String(formData.get("repo_url") ?? "").trim();
  const license = String(formData.get("license") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const tagsRaw = String(formData.get("tags") ?? "");
  const alternativeTo = String(formData.get("alternative_to") ?? "").trim();
  const websiteUrl = String(formData.get("website_url") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  const rights = formData.get("rights") === "on";

  if (!title) return { error: "Title is required." };
  if (!description) return { error: "Description is required." };
  if (!iconPath) return { error: "App icon is required." };
  if (!rights) return { error: "You must confirm you own the rights." };
  if (!iconPath.startsWith(`${user.id}/`)) return { error: "Invalid upload path." };

  const iconExt = extOf(iconPath);
  if (!ICON_EXT[iconExt]) return { error: "Icon must be JPG, PNG or WebP." };

  const screenshotPaths = screenshotPathsRaw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  for (const p of screenshotPaths) {
    if (!p.startsWith(`${user.id}/`)) return { error: "Invalid screenshot path." };
    const ext = extOf(p);
    if (!SCREENSHOT_EXT[ext]) return { error: "Screenshots must be JPG, PNG or WebP." };
  }

  const iconMeta = await objectMeta("app-icons", iconPath);
  if (!iconMeta) return { error: "App icon was not uploaded." };
  const iconSize = Number((iconMeta.metadata as { size?: number } | null)?.size ?? 0);
  const iconType = String((iconMeta.metadata as { mimetype?: string } | null)?.mimetype ?? "");
  if (iconSize <= 0 || iconSize > MAX_ICON_BYTES) return { error: "Icon must be 1 byte–2MB." };
  if (!Object.values(ICON_EXT).includes(iconType)) return { error: "Unexpected icon file type." };

  for (const p of screenshotPaths) {
    const meta = await objectMeta("app-screenshots", p);
    if (!meta) return { error: "A screenshot was not uploaded." };
    const size = Number((meta.metadata as { size?: number } | null)?.size ?? 0);
    const type = String((meta.metadata as { mimetype?: string } | null)?.mimetype ?? "");
    if (size <= 0 || size > MAX_SCREENSHOT_BYTES) return { error: "Screenshot must be 1 byte–5MB." };
    if (!Object.values(SCREENSHOT_EXT).includes(type)) return { error: "Unexpected screenshot file type." };
  }

  const tags = tagsRaw
    .split(/[\s,]+/)
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 8);

  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("apps")
    .insert({
      title,
      tagline: tagline || null,
      description,
      developer_bio: developerBio || null,
      icon_path: iconPath,
      screenshot_paths: screenshotPaths.length ? screenshotPaths : null,
      repo_url: repoUrl || null,
      license: license || null,
      category: category || null,
      tags: tags.length ? tags : null,
      alternative_to: alternativeTo || null,
      website_url: websiteUrl || null,
      contact_email: contactEmail || null,
      status: "draft",
      uploader_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create listing." };

  revalidatePath("/apps");
  redirect(`/apps/publish/checkout/${data.id}`);
}

export async function removeApp(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");
  const id = String(formData.get("app_id") ?? "");
  if (!id) return;

  const sb = await supabaseServer();
  await sb.from("apps").update({ status: "removed" }).eq("id", id).eq("uploader_id", user.id);

  revalidatePath("/apps");
  redirect("/apps");
}
