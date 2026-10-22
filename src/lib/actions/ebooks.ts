"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";

export type FormState = { error?: string; ok?: boolean };

export type UploadTarget = { path: string; token: string };

const FILE_EXT: Record<string, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
};
const COVER_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_COVER_BYTES = 2 * 1024 * 1024;

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
  fileExt: string;
  coverExt: string;
}): Promise<{ error: string } | { file: UploadTarget; cover: UploadTarget }> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const fileExt = input.fileExt.toLowerCase().replace(/^\./, "");
  const coverExt = input.coverExt.toLowerCase().replace(/^\./, "");
  if (!FILE_EXT[fileExt]) return { error: "Book must be a PDF or EPUB." };
  if (!COVER_EXT[coverExt]) return { error: "Cover must be JPG, PNG or WebP." };

  const admin = supabaseAdmin();
  const filePath = `${user.id}/${randomUUID()}.${fileExt}`;
  const coverPath = `${user.id}/${randomUUID()}.${coverExt}`;

  const f = await admin.storage.from("ebook-files").createSignedUploadUrl(filePath);
  if (f.error || !f.data) return { error: f.error?.message ?? "Could not prepare upload." };
  const c = await admin.storage.from("ebook-covers").createSignedUploadUrl(coverPath);
  if (c.error || !c.data) return { error: c.error?.message ?? "Could not prepare cover upload." };

  return {
    file: { path: f.data.path, token: f.data.token },
    cover: { path: c.data.path, token: c.data.token },
  };
}

export async function createEbook(formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const authorBio = String(formData.get("author_bio") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const filePath = String(formData.get("file_path") ?? "");
  const coverPath = String(formData.get("cover_path") ?? "");
  const tagsRaw = String(formData.get("tags") ?? "");
  const rights = formData.get("rights") === "on";

  if (!title) return { error: "Title is required." };
  if (!description) return { error: "Description is required." };
  if (!authorBio) return { error: "Author bio is required." };
  if (!rights) return { error: "You must confirm you own the rights." };
  if (!filePath.startsWith(`${user.id}/`)) return { error: "Invalid upload path." };
  if (!coverPath.startsWith(`${user.id}/`)) return { error: "Invalid cover path." };

  const fileExt = extOf(filePath);
  const coverExt = extOf(coverPath);
  if (!FILE_EXT[fileExt]) return { error: "Book must be a PDF or EPUB." };
  if (!COVER_EXT[coverExt]) return { error: "Cover must be JPG, PNG or WebP." };

  let priceCents = 0;
  if (priceRaw) {
    const usd = Number(priceRaw);
    if (!Number.isFinite(usd) || usd < 0) return { error: "Invalid price." };
    priceCents = Math.round(usd * 100);
    if (priceCents !== 0 && priceCents < 299) return { error: "Paid minimum is $2.99." };
  }

  const fileMeta = await objectMeta("ebook-files", filePath);
  if (!fileMeta) return { error: "Book file was not uploaded." };
  const coverMeta = await objectMeta("ebook-covers", coverPath);
  if (!coverMeta) return { error: "Cover file was not uploaded." };

  const fileSize = Number((fileMeta.metadata as { size?: number } | null)?.size ?? 0);
  const coverSize = Number((coverMeta.metadata as { size?: number } | null)?.size ?? 0);
  const fileType = String((fileMeta.metadata as { mimetype?: string } | null)?.mimetype ?? "");
  const coverType = String((coverMeta.metadata as { mimetype?: string } | null)?.mimetype ?? "");

  const maxFileMb = MAX_FILE_BYTES / 1024 / 1024;
  const maxCoverMb = MAX_COVER_BYTES / 1024 / 1024;
  if (fileSize <= 0 || fileSize > MAX_FILE_BYTES) return { error: `Book must be 1 byte–${maxFileMb}MB.` };
  if (coverSize <= 0 || coverSize > MAX_COVER_BYTES) return { error: `Cover must be 1 byte–${maxCoverMb}MB.` };
  if (!Object.values(FILE_EXT).includes(fileType)) return { error: "Unexpected book file type." };
  if (!Object.values(COVER_EXT).includes(coverType)) return { error: "Unexpected cover file type." };

  const tags = tagsRaw
    .split(/[\s,]+/)
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 8);

  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("ebooks")
    .insert({
      title,
      description,
      author_bio: authorBio,
      price_cents: priceCents,
      currency: "USD",
      file_path: filePath,
      cover_path: coverPath,
      tags: tags.length ? tags : null,
      status: "published",
      uploader_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not publish." };

  revalidatePath("/ebooku");
  redirect(`/ebooku/${data.id}`);
}

export async function createReview(prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in to review." };

  const ebookId = String(formData.get("ebook_id") ?? "");
  const rating = Number(formData.get("rating") ?? 0);
  const body = String(formData.get("body") ?? "").trim();

  if (!ebookId) return { error: "Missing book." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Rating must be 1–5." };

  const sb = await supabaseServer();
  const { error } = await sb.from("reviews").upsert(
    {
      ebook_id: ebookId,
      user_id: user.id,
      rating,
      body: body || null,
    },
    { onConflict: "ebook_id,user_id" }
  );
  if (error) return { error: error.message };

  revalidatePath(`/ebooku/${ebookId}`);
  return { ok: true };
}

export async function removeEbook(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");
  const id = String(formData.get("ebook_id") ?? "");
  if (!id) return;

  const sb = await supabaseServer();
  await sb.from("ebooks").update({ status: "removed" }).eq("id", id).eq("uploader_id", user.id);

  revalidatePath("/ebooku");
  redirect("/ebooku");
}
