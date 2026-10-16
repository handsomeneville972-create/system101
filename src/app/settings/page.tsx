"use client";
import { useState } from "react";

const surfaces = ["home", "ebooku", "suggy", "apps"] as const;

export default function Settings() {
  const [visible, setVisible] = useState<Record<string, boolean>>({
    home: true, ebooku: true, suggy: true, apps: true,
  });
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="card mt-6 p-6">
        <h2 className="font-medium">Support button visibility</h2>
        <p className="text-sm text-zinc-400">Toggle per location. Reversible.</p>
        <div className="mt-4 space-y-3">
          {surfaces.map((s) => (
            <label key={s} className="flex items-center justify-between text-sm">
              <span className="capitalize">{s}</span>
              <input
                type="checkbox"
                checked={visible[s]}
                onChange={(e) => setVisible({ ...visible, [s]: e.target.checked })}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
