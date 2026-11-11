"use client";

import { useState } from "react";
import { Check, Download, Loader2 } from "lucide-react";

export function DownloadButton({
  endpoint,
  label = "Download",
  againLabel = "Download again",
}: {
  endpoint: string;
  label?: string;
  againLabel?: string;
}) {
  const [preparing, setPreparing] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    if (preparing) return;
    setError("");
    setPreparing(true);

    try {
      const res = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!res.ok || !data?.url) {
        setError(data?.error ?? "Download didn't start. Try again.");
        return;
      }

      window.location.assign(data.url);
      setStarted(true);
    } catch {
      setError("Download didn't start. Try again.");
    } finally {
      setPreparing(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={download}
          disabled={preparing}
          aria-busy={preparing || undefined}
          className="btn-pill inline-flex items-center gap-2 bg-white px-6 py-2.5 text-sm font-medium text-black disabled:opacity-50"
        >
          {preparing ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download size={15} aria-hidden="true" />
          )}
          {preparing ? "Preparing…" : started ? againLabel : label}
        </button>
        <p
          role="status"
          aria-live="polite"
          className={
            started
              ? "inline-flex items-center gap-1.5 text-xs text-zinc-400"
              : "sr-only"
          }
        >
          {started ? (
            <>
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Download started.
            </>
          ) : null}
        </p>
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
