"use client";

import { useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { prepareAvatarUpload, setAvatar, removeAvatar } from "@/lib/actions/profile";

const MAX_MB = 2;
const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function AvatarUploader({ currentUrl }: { currentUrl: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  function pick(f: File | null) {
    setOk(false);
    setError("");
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function save() {
    if (!file || busy) return;
    setError("");
    setOk(false);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!MIME[ext]) return setError("Use JPG, PNG or WebP.");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`Photo must be under ${MAX_MB}MB.`);

    setBusy(true);
    try {
      const prep = await prepareAvatarUpload({ ext });
      if ("error" in prep) {
        setError(prep.error);
        return;
      }
      const sb = supabaseBrowser();
      const up = await sb.storage
        .from("avatars")
        .uploadToSignedUrl(prep.path, prep.token, file, { contentType: MIME[ext] });
      if (up.error) {
        setError(up.error.message);
        return;
      }
      const fd = new FormData();
      fd.set("avatar_path", prep.path);
      const res = await setAvatar(fd);
      if (res.error) {
        setError(res.error);
        return;
      }
      setOk(true);
      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError((err as Error).message || "Could not save photo.");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    if (busy) return;
    setBusy(true);
    setError("");
    setOk(false);
    const res = await removeAvatar();
    if (res.error) setError(res.error);
    else {
      setOk(true);
      pick(null);
      if (inputRef.current) inputRef.current.value = "";
    }
    setBusy(false);
  }

  const shown = preview ?? currentUrl;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border hairline bg-white/5">
        {shown ? (
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-600">
            No photo
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-zinc-400"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!file || busy}
            className="btn-pill bg-white px-4 py-2 text-xs font-medium text-black disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save photo"}
          </button>
          {(currentUrl || preview) && (
            <button
              type="button"
              onClick={clear}
              disabled={busy}
              className="btn-pill border hairline px-4 py-2 text-xs text-zinc-300 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {ok && <p className="text-xs text-zinc-400">Saved.</p>}
        <p className="text-xs text-zinc-600">JPG, PNG or WebP. Max {MAX_MB}MB.</p>
      </div>
    </div>
  );
}
