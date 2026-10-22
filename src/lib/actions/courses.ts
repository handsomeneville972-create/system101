"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabaseServer } from "@/lib/supabase-server";
import { parseVideoUrl } from "@/lib/video";

export type FormState = { error?: string; ok?: boolean };
export type UploadTarget = { path: string; token: string };

const MAX_PDF_BYTES = 20 * 1024 * 1024;
const LEVELS = ["beginner", "intermediate", "advanced"];

export async function prepareCourseUpload(input: {
  ext: string;
}): Promise<{ error: string } | UploadTarget> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const ext = input.ext.toLowerCase().replace(/^\./, "");
  if (ext !== "pdf") return { error: "Resource must be a PDF." };

  const admin = supabaseAdmin();
  const path = `${user.id}/course-${randomUUID()}.pdf`;
  const { data, error } = await admin.storage.from("course-files").createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not prepare upload." };

  return { path: data.path, token: data.token };
}

export async function createCourse(formData: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please sign in first." };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const level = String(formData.get("level") ?? "");
  const videoRaw = String(formData.get("video_url") ?? "").trim();
  const pdfPath = String(formData.get("pdf_path") ?? "");
  const tagsRaw = String(formData.get("tags") ?? "");
  const rights = formData.get("rights") === "on";

  if (!rights) return { error: "You must confirm you own the rights." };
  if (!title) return { error: "Title is required." };
  if (title.length > 100) return { error: "Title is too long." };
  if (description.length < 20) return { error: "Description must be at least 20 characters." };
  if (!LEVELS.includes(level)) return { error: "Pick a level." };

  const video = parseVideoUrl(videoRaw);
  if (!video) return { error: "Use a valid YouTube or Vimeo link." };

  let resourcePath: string | null = null;
  if (pdfPath) {
    if (!pdfPath.startsWith(`${user.id}/`) || !pdfPath.toLowerCase().endsWith(".pdf")) {
      return { error: "Invalid resource path." };
    }
    const folder = pdfPath.split("/").slice(0, -1).join("/");
    const name = pdfPath.split("/").pop()!;
    const admin = supabaseAdmin();
    const { data: list } = await admin.storage
      .from("course-files")
      .list(folder, { search: name, limit: 100 });
    const meta = (list ?? []).find((f) => f.name === name);
    if (!meta) return { error: "Resource file was not uploaded." };

    const size = Number((meta.metadata as { size?: number } | null)?.size ?? 0);
    const mime = String((meta.metadata as { mimetype?: string } | null)?.mimetype ?? "");
    if (size <= 0 || size > MAX_PDF_BYTES) return { error: "Resource must be under 20MB." };
    if (mime !== "application/pdf") return { error: "Resource must be a PDF." };
    resourcePath = pdfPath;
  }

  const tags = tagsRaw
    .split(/[\s,]+/)
    .map((t) => t.trim().replace(/^#/, ""))
    .filter(Boolean)
    .slice(0, 8);

  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("courses")
    .insert({
      title,
      description,
      level,
      video_provider: video.provider,
      video_id: video.id,
      video_hash: video.hash,
      video_url: video.url,
      pdf_path: resourcePath,
      tags: tags.length ? tags : null,
      status: "published",
      creator_id: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not publish." };

  revalidatePath("/decourse");
  redirect(`/decourse/${data.id}`);
}

export async function removeCourse(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");
  const id = String(formData.get("course_id") ?? "");
  if (!id) return;

  const sb = await supabaseServer();
  await sb.from("courses").update({ status: "removed" }).eq("id", id).eq("creator_id", user.id);

  revalidatePath("/decourse");
  redirect("/decourse");
}
