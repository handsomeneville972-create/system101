"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { prepareUpload, createEbook } from "@/lib/actions/ebooks";

const MAX_FILE_MB = 20;
const MAX_COVER_MB = 2;

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  epub: "application/epub+zip",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function UploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = (form.elements.namedItem("file") as HTMLInputElement).files?.[0];
    const cover = (form.elements.namedItem("cover") as HTMLInputElement).files?.[0];

    if (!file) return setError("Choose a PDF or EPUB file.");
    if (!cover) return setError("Choose a cover image.");
    const fileExt = extOf(file.name);
    const coverExt = extOf(cover.name);
    if (!MIME[fileExt] || !["pdf", "epub"].includes(fileExt)) {
      return setError("Book must be a PDF or EPUB.");
    }
    if (!["jpg", "jpeg", "png", "webp"].includes(coverExt)) {
      return setError("Cover must be JPG, PNG or WebP.");
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) return setError(`Book must be under ${MAX_FILE_MB}MB.`);
    if (cover.size > MAX_COVER_MB * 1024 * 1024) return setError(`Cover must be under ${MAX_COVER_MB}MB.`);

    setBusy(true);
    try {
      setStep("Preparing…");
      const prep = await prepareUpload({ fileExt, coverExt });
      if ("error" in prep) {
        setError(prep.error);
        return;
      }

      const sb = supabaseBrowser();

      setStep("Uploading book…");
      const up1 = await sb.storage
        .from("ebook-files")
        .uploadToSignedUrl(prep.file.path, prep.file.token, file, { contentType: MIME[fileExt] });
      if (up1.error) {
        setError(up1.error.message);
        return;
      }

      setStep("Uploading cover…");
      const up2 = await sb.storage
        .from("ebook-covers")
        .uploadToSignedUrl(prep.cover.path, prep.cover.token, cover, { contentType: MIME[coverExt] });
      if (up2.error) {
        setError(up2.error.message);
        return;
      }

      setStep("Publishing…");
      fd.set("file_path", prep.file.path);
      fd.set("cover_path", prep.cover.path);
      fd.delete("file");
      fd.delete("cover");

      const res = await createEbook(fd);
      if (res?.error) setError(res.error);
    } catch (err) {
      const msg = (err as Error).message || "Upload failed.";
      if (!msg.includes("NEXT_REDIRECT")) setError(msg);
    } finally {
      setBusy(false);
      setStep("");
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
      <input
        name="title"
        required
        placeholder="Title"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        required
        placeholder="Book description"
        rows={4}
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <textarea
        name="author_bio"
        required
        placeholder="About author"
        rows={3}
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <input
        name="tags"
        placeholder="Tags (comma separated, optional)"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <div className="flex flex-col gap-3">
        <label className="text-xs text-zinc-400">
          Book file — PDF/EPUB, max {MAX_FILE_MB}MB
          <input
            name="file"
            type="file"
            accept=".pdf,.epub"
            required
            className="mt-1 w-full text-sm text-zinc-400"
          />
        </label>
        <label className="text-xs text-zinc-400">
          Cover — JPG/PNG/WebP, max {MAX_COVER_MB}MB
          <input
            name="cover"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="mt-1 w-full text-sm text-zinc-400"
          />
        </label>
      </div>
      <input
        name="price"
        inputMode="decimal"
        placeholder="Price USD (blank = free, min $2.99 paid)"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input name="rights" type="checkbox" required /> I own the rights. Accept DMCA takedown.
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {busy && step && <p className="text-xs text-zinc-500">{step}</p>}
      <button
        disabled={busy}
        className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Publish"}
      </button>
    </form>
  );
}
