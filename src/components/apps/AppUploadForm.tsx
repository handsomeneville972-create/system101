"use client";

import { useRef, useState } from "react";
import { ImageUp, Minus, Plus } from "lucide-react";
import { FilePicker } from "@/components/ui/file-picker";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { prepareUpload, createApp } from "@/lib/actions/apps";

const MAX_ICON_MB = 2;
const MAX_SCREENSHOT_MB = 5;
const MAX_SCREENSHOTS = 3;

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function AppUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [screenshotCount, setScreenshotCount] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const icon = (form.elements.namedItem("icon") as HTMLInputElement).files?.[0];
    const screenshots = (fd.getAll("screenshots") as File[]).filter((f) => f && f.size > 0);

    if (!icon) return setError("Choose an app icon.");
    const iconExt = extOf(icon.name);
    if (!["jpg", "jpeg", "png", "webp"].includes(iconExt)) {
      return setError("Icon must be JPG, PNG or WebP.");
    }
    if (icon.size > MAX_ICON_MB * 1024 * 1024) return setError(`Icon must be under ${MAX_ICON_MB}MB.`);

    const screenshotExts: string[] = [];
    for (const s of screenshots) {
      const se = extOf(s.name);
      if (!["jpg", "jpeg", "png", "webp"].includes(se)) {
        return setError("Screenshots must be JPG, PNG or WebP.");
      }
      if (s.size > MAX_SCREENSHOT_MB * 1024 * 1024) {
        return setError(`Each screenshot must be under ${MAX_SCREENSHOT_MB}MB.`);
      }
      screenshotExts.push(se);
    }

    if (screenshotExts.length > MAX_SCREENSHOTS) {
      return setError(`Maximum ${MAX_SCREENSHOTS} screenshots.`);
    }

    setBusy(true);
    try {
      setStep("Preparing uploads…");
      const prep = await prepareUpload({ iconExt, screenshotExts });
      if ("error" in prep) {
        setError(prep.error);
        return;
      }

      const sb = supabaseBrowser();

      setStep("Uploading icon…");
      const up1 = await sb.storage
        .from("app-icons")
        .uploadToSignedUrl(prep.icon.path, prep.icon.token, icon, { contentType: MIME[iconExt] });
      if (up1.error) {
        setError(up1.error.message);
        return;
      }

      if (screenshots.length > 0) {
        setStep("Uploading screenshots…");
        for (let i = 0; i < screenshots.length; i++) {
          const ext = screenshotExts[i];
          const up2 = await sb.storage
            .from("app-screenshots")
            .uploadToSignedUrl(prep.screenshots[i].path, prep.screenshots[i].token, screenshots[i], {
              contentType: MIME[ext],
            });
          if (up2.error) {
            setError(up2.error.message);
            return;
          }
        }
      }

      setStep("Creating listing…");
      fd.set("icon_path", prep.icon.path);
      fd.set("screenshot_paths", prep.screenshots.map((s) => s.path).join(","));
      fd.delete("icon");
      fd.delete("screenshots");

      const res = await createApp(fd);
      if (res?.error) setError(res.error);
    } catch (err) {
      const msg = (err as Error).message || "Upload failed.";
      if (!msg.includes("NEXT_REDIRECT")) setError(msg);
    } finally {
      setBusy(false);
      setStep("");
    }
  }

  function addScreenshot() {
    if (screenshotCount < MAX_SCREENSHOTS) setScreenshotCount(screenshotCount + 1);
  }

  function removeScreenshot() {
    if (screenshotCount > 0) setScreenshotCount(screenshotCount - 1);
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
      <input
        name="title"
        required
        placeholder="App name"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <input
        name="tagline"
        placeholder="One-line tagline (optional)"
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        required
        placeholder="What does your app do?"
        rows={4}
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <textarea
        name="developer_bio"
        placeholder="Tell potential users who you are (optional)"
        rows={3}
        className="w-full rounded-md border hairline bg-black px-3 py-2 text-sm"
      />
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="category"
          placeholder="Category (e.g. Productivity)"
          className="rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
        <input
          name="tags"
          placeholder="Tags (comma separated)"
          className="rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="repo_url"
          placeholder="Repository URL (optional)"
          className="rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
        <input
          name="website_url"
          placeholder="App website URL (optional)"
          className="rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="license"
          placeholder="License (e.g. MIT)"
          className="rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
        <input
          name="alternative_to"
          placeholder="Alternative to (e.g. Figma)"
          className="rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="contact_email"
          inputMode="email"
          placeholder="Contact email"
          className="rounded-md border hairline bg-black px-3 py-2 text-sm"
        />
      </div>

      <FilePicker
        name="icon"
        accept="image/jpeg,image/png,image/webp"
        icon={ImageUp}
        label="Choose app icon"
        changeLabel="Change app icon"
        hint={`JPG, PNG or WebP · max ${MAX_ICON_MB}MB · square`}
      />

      <div className="space-y-2">
        <p className="text-xs text-zinc-400">
          Screenshots (up to {MAX_SCREENSHOTS}) — JPG/PNG/WebP, max {MAX_SCREENSHOT_MB}MB each
        </p>
        {Array.from({ length: screenshotCount }).map((_, i) => (
          <FilePicker
            key={i}
            name="screenshots"
            accept="image/jpeg,image/png,image/webp"
            icon={ImageUp}
            label={`Choose screenshot ${i + 1}`}
            changeLabel={`Change screenshot ${i + 1}`}
          />
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addScreenshot}
            disabled={screenshotCount >= MAX_SCREENSHOTS}
            className="inline-flex items-center gap-1.5 rounded-full border hairline bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add screenshot
          </button>
          {screenshotCount > 0 && (
            <button
              type="button"
              onClick={removeScreenshot}
              className="inline-flex items-center gap-1.5 rounded-full border hairline px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-red-400"
            >
              <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
      </div>

      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input name="rights" type="checkbox" required /> I own the rights. Accept DMCA takedown.
      </label>

      <div className="text-xs text-zinc-500">
        Only you can see this until you publish. No charge until then.
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
      {busy && step && <p className="text-xs text-zinc-500">{step}</p>}
      <button
        disabled={busy}
        className="btn-pill bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        {busy ? "Creating…" : "Continue"}
      </button>
    </form>
  );
}
