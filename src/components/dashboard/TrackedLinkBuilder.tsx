"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function TrackedLinkBuilder({ appId }: { appId: string }) {
  const [source, setSource] = useState("community");
  const [medium, setMedium] = useState("directory");
  const [campaign, setCampaign] = useState("");
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams();
  if (source.trim()) params.set("utm_source", source.trim().slice(0, 80));
  if (medium.trim()) params.set("utm_medium", medium.trim().slice(0, 80));
  if (campaign.trim()) params.set("utm_campaign", campaign.trim().slice(0, 80));
  const query = params.toString();
  const path = `/apps/${appId}${query ? `?${query}` : ""}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(
        new URL(path, window.location.origin).toString()
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Tracked link</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Share a tagged link; visits show up in this dashboard.
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="btn-pill inline-flex items-center gap-2 border hairline px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Field label="Source" value={source} onChange={setSource} placeholder="x" />
        <Field label="Medium" value={medium} onChange={setMedium} placeholder="social" />
        <Field
          label="Campaign"
          value={campaign}
          onChange={setCampaign}
          placeholder="launch"
        />
      </div>

      <p className="mt-2 truncate text-[11px] text-zinc-600">{path}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border hairline bg-black/40 px-2 py-1.5 text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-white/30"
      />
    </label>
  );
}
