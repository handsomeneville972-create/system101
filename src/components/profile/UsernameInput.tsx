"use client";

import { useEffect, useId, useState } from "react";
import { usernameStatus } from "@/lib/actions/username";
import { normalizeUsername } from "@/lib/username";

type Feedback = { tone: "muted" | "good" | "bad"; text: string } | null;

function feedbackFor(
  value: string,
  status: Awaited<ReturnType<typeof usernameStatus>> | null
): Feedback {
  if (!value) return { tone: "muted", text: "3–20 lowercase letters, numbers or underscores." };
  if (!status) return null;

  switch (status.status) {
    case "ok":
      return status.self
        ? { tone: "muted", text: "This is your current username." }
        : { tone: "good", text: "Available." };
    case "taken":
      return { tone: "bad", text: "That username is taken." };
    case "reserved":
      return { tone: "bad", text: "That username is reserved." };
    case "invalid":
      return { tone: "bad", text: "Use 3–20 letters, numbers or underscores." };
    default:
      return null;
  }
}

export function UsernameInput({
  name = "username",
  defaultValue = "",
  disabled = false,
  autoFocus = false,
}: {
  name?: string;
  defaultValue?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState(defaultValue);
  const [checked, setChecked] = useState<{
    value: string;
    status: Awaited<ReturnType<typeof usernameStatus>>;
  } | null>(null);

  const normalized = normalizeUsername(value);

  useEffect(() => {
    if (!normalized) return;

    let live = true;
    const timer = setTimeout(async () => {
      try {
        const next = await usernameStatus(normalized);
        if (live) setChecked({ value: normalized, status: next });
      } catch {
        if (live) setChecked(null);
      }
    }, 400);

    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [normalized]);

  const status = checked?.value === normalized ? checked.status : null;
  const feedback = feedbackFor(normalized, status);

  return (
    <div>
      <label htmlFor={id} className="text-xs text-zinc-400">
        Username
      </label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-500">
          @
        </span>
        <input
          id={id}
          name={name}
          value={value}
          onChange={(event) =>
            setValue(event.target.value.replace(/^@+/, "").toLowerCase())
          }
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={20}
          placeholder="username"
          className="w-full rounded-md border hairline bg-black py-2 pl-7 pr-3 text-sm lowercase disabled:opacity-60"
          aria-describedby={`${id}-help`}
        />
      </div>
      <p
        id={`${id}-help`}
        className={`mt-1.5 text-xs ${
          feedback?.tone === "good"
            ? "text-emerald-400"
            : feedback?.tone === "bad"
              ? "text-red-400"
              : "text-zinc-500"
        }`}
      >
        {feedback?.text ?? " "}
      </p>
    </div>
  );
}
