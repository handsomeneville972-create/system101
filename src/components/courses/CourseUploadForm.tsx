"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { prepareCourseUpload, createCourse } from "@/lib/actions/courses";

const MAX_PDF_MB = 20;

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function CourseUploadForm() {
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const resource = (form.elements.namedItem("resource") as HTMLInputElement).files?.[0];

    if (resource) {
      if (extOf(resource.name) !== "pdf") return setError("Resource must be a PDF.");
      if (resource.size > MAX_PDF_MB * 1024 * 1024) {
        return setError(`Resource must be under ${MAX_PDF_MB}MB.`);
      }
    }

    setBusy(true);
    try {
      if (resource) {
        setStep("Preparing…");
        const prep = await prepareCourseUpload({ ext: "pdf" });
        if ("error" in prep) {
          setError(prep.error);
          return;
        }

        setStep("Uploading notes…");
        const sb = supabaseBrowser();
        const up = await sb.storage
          .from("course-files")
          .uploadToSignedUrl(prep.path, prep.token, resource, { contentType: "application/pdf" });
        if (up.error) {
          setError(up.error.message);
          return;
        }
        fd.set("pdf_path", prep.path);
        fd.delete("resource");
      }

      setStep("Publishing…");
      const res = await createCourse(fd);
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
    <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
      <input
        name="title"
        required
        maxLength={100}
        placeholder="Course title"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        required
        placeholder="What will people learn?"
        rows={4}
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <select
        name="level"
        required
        defaultValue="beginner"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <input
        name="video_url"
        required
        placeholder="YouTube or Vimeo link"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <input
        name="tags"
        placeholder="Tags (comma separated, optional)"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <label className="block text-xs text-zinc-400">
        Notes — PDF, max {MAX_PDF_MB}MB (optional)
        <input
          name="resource"
          type="file"
          accept=".pdf,application/pdf"
          className="mt-1 w-full text-sm text-zinc-400"
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input name="rights" type="checkbox" required /> I own the rights to this course.
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {busy && step && <p className="text-xs text-zinc-500">{step}</p>}
      <button
        disabled={busy}
        className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        {busy ? "Publishing…" : "Publish course"}
      </button>
    </form>
  );
}
