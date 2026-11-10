"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import { friendlyAuthError } from "@/lib/auth-utils";
import { supabaseBrowser } from "@/lib/supabase-browser";

type FieldErrors = { password?: string; confirm?: string };

export function ResetPasswordForm({ email }: { email: string | null }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setFormError(null);

    const errors: FieldErrors = {};
    if (password.length < 8) errors.password = "Use at least 8 characters.";
    if (!confirm) errors.confirm = "Confirm your new password.";
    else if (confirm !== password) errors.confirm = "Passwords don't match.";

    setFieldErrors(errors);
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }
    if (errors.confirm) {
      confirmRef.current?.focus();
      return;
    }

    setBusy(true);

    try {
      const sb = supabaseBrowser();
      const { error } = await sb.auth.updateUser({ password });

      if (error) {
        setFormError(friendlyAuthError(error.message));
        return;
      }

      setDone(true);
      window.requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setFormError(
        "Something went wrong. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <section
        className="auth-card"
        aria-labelledby={done ? "reset-done-title" : "reset-title"}
      >
        {done ? (
          <div className="auth-success" role="status">
            <span className="auth-success-icon">
              <Check className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 id="reset-done-title" ref={successRef} tabIndex={-1}>
              Password updated.
            </h2>
            <p>
              {email ? `You're signed in as ${email}. ` : "You're signed in. "}
              Use your new password the next time you sign in.
            </p>
            <Link href="/home" className="auth-button">
              Continue to your rooms
            </Link>
          </div>
        ) : (
          <div className="auth-panel">
            <p className="auth-eyebrow">
              <span className="auth-eyebrow-dot" aria-hidden="true" />
              Account recovery
            </p>
            <h1 id="reset-title" className="auth-title">
              Choose a new password.
            </h1>
            <p className="auth-sub">
              {email
                ? `Setting a new password for ${email}.`
                : "Set a new password for your account."}
            </p>

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              {formError ? (
                <div className="auth-alert" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              ) : null}

              <AuthField
                id="password"
                label="New password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                error={fieldErrors.password}
                hint="Use at least 8 characters."
                inputRef={passwordRef}
                trailing={
                  <button
                    type="button"
                    className="auth-reveal"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <AuthField
                id="confirm"
                label="Confirm new password"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                placeholder="Repeat your new password"
                error={fieldErrors.confirm}
                inputRef={confirmRef}
                trailing={
                  <button
                    type="button"
                    className="auth-reveal"
                    onClick={() => setShowConfirm((current) => !current)}
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    aria-pressed={showConfirm}
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <button
                type="submit"
                className="auth-button"
                disabled={busy}
                aria-busy={busy || undefined}
              >
                {busy ? (
                  <>
                    <Loader2
                      className="auth-spinner h-4 w-4"
                      aria-hidden="true"
                    />
                    Updating…
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" aria-hidden="true" />
                    Update password
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              <Link href="/home" className="auth-link">
                Skip and continue to your rooms
              </Link>
            </div>
          </div>
        )}
      </section>
    </AuthShell>
  );
}
