"use client";

import { useId, useState, type RefObject } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Small pill file-picker used by every upload surface. The native input stays
 * in the form (visually hidden) so FormData and validation keep working.
 */
export function FilePicker({
  name,
  accept,
  label,
  changeLabel,
  hint,
  icon: Icon,
  fileName,
  inputRef,
  onSelect,
}: {
  name: string;
  accept: string;
  label: string;
  changeLabel: string;
  hint?: string;
  icon: LucideIcon;
  /** Controlled filename. Omit to let the picker track its own selection. */
  fileName?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  onSelect?: (files: FileList | null) => void;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const [picked, setPicked] = useState("");
  const shown = fileName !== undefined ? fileName : picked;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          aria-describedby={hint ? hintId : undefined}
          className="peer sr-only"
          onChange={(event) => {
            const files = event.target.files;
            setPicked(
              Array.from(files ?? [])
                .map((file) => file.name)
                .join(", "),
            );
            onSelect?.(files);
          }}
        />
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border hairline bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10 peer-focus-visible:ring-2 peer-focus-visible:ring-white/40"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {shown ? changeLabel : label}
        </label>
        <span className="min-w-0 truncate text-xs text-zinc-400">
          {shown || "No file chosen"}
        </span>
      </div>
      {hint ? (
        <p id={hintId} className="mt-1 text-[11px] text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
