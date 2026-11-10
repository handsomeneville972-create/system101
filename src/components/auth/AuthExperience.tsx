"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { AuthField } from "@/components/auth/AuthField";
import { AuthShell } from "@/components/auth/AuthShell";
import {
  EMAIL_PATTERN,
  friendlyAuthError,
  safeNext,
} from "@/lib/auth-utils";
import { supabaseBrowser } from "@/lib/supabase-browser";

type Mode = "signin" | "signup" | "forgot";
type Sent = "signup" | "magic" | "reset" | null;
type FieldName = "name" | "email" | "password" | "confirm" | "terms";
type FieldErrors = Partial<Record<FieldName, string>>;

type AuthExperienceProps = {
  initialMode: "signin" | "signup";
  authError?: string;
  next?: string;
};

const COPY: Record<
  Mode,
  { eyebrow: string; title: string; sub: string; submit: string; busy: string }
> = {
  signin: {
    eyebrow: "Members' access",
    title: "Welcome back.",
    sub: "Sign in to your rooms, your work, and the decisions you're part of.",
    submit: "Sign in",
    busy: "Signing in…",
  },
  signup: {
    eyebrow: "New member",
    title: "Create your account.",
    sub: "One account for every room you're voted into. Free to join.",
    submit: "Create account",
    busy: "Creating account…",
  },
  forgot: {
    eyebrow: "Account recovery",
    title: "Reset your password.",
    sub: "Enter the email on your account and we'll send a reset link.",
    submit: "Send reset link",
    busy: "Sending…",
  },
};

function initialAuthMessage(authError?: string) {
  if (!authError) return null;
  if (authError === "auth") {
    return "That link is no longer valid. Sign in again or request a new one.";
  }
  return "We couldn't complete that request. Try again.";
}

export function AuthExperience({
  initialMode,
  authError,
  next,
}: AuthExperienceProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(false);
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<Sent>(null);
  const [formError, setFormError] = useState<string | null>(
    initialAuthMessage(authError),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const termsRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = window.localStorage.getItem("ds.auth.email");
        if (saved) {
          setEmail(saved);
          setRemember(true);
        }
      } catch {
        // Storage can be unavailable in private browsing. Ignore.
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }, [mode]);

  useEffect(() => {
    if (!sent) return;
    window.requestAnimationFrame(() => successRef.current?.focus());
  }, [sent]);

  const copy = COPY[mode];

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setFieldErrors({});
    setFormError(null);
    setSent(null);
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
    if (nextMode !== "signup") {
      setTerms(false);
    }
  }

  function focusFirstError(errors: FieldErrors) {
    const order: FieldName[] = ["name", "email", "password", "confirm", "terms"];
    const first = order.find((field) => errors[field]);
    if (first === "name") nameRef.current?.focus();
    else if (first === "email") emailRef.current?.focus();
    else if (first === "password") passwordRef.current?.focus();
    else if (first === "confirm") confirmRef.current?.focus();
    else if (first === "terms") termsRef.current?.focus();
  }

  function validate() {
    const errors: FieldErrors = {};
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errors.email = "Enter your email address.";
    } else if (!EMAIL_PATTERN.test(cleanEmail)) {
      errors.email = "Enter a valid email address.";
    }

    if (mode === "signin") {
      if (!password) errors.password = "Enter your password.";
    }

    if (mode === "signup") {
      if (name.trim().length < 2) errors.name = "Enter your full name.";
      if (password.length < 8) errors.password = "Use at least 8 characters.";
      if (!confirm) errors.confirm = "Confirm your password.";
      else if (confirm !== password) errors.confirm = "Passwords don't match.";
      if (!terms) errors.terms = "Agree to the terms to continue.";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      focusFirstError(errors);
      return false;
    }
    return true;
  }

  function persistRemember() {
    try {
      if (remember) {
        window.localStorage.setItem("ds.auth.email", email.trim());
      } else {
        window.localStorage.removeItem("ds.auth.email");
      }
    } catch {
      // Storage can be unavailable in private browsing. Ignore.
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setFormError(null);
    if (!validate()) return;

    setBusy(true);

    try {
      const sb = supabaseBrowser();
      const origin = window.location.origin;

      if (mode === "signin") {
        const { error } = await sb.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setFormError(friendlyAuthError(error.message));
          return;
        }

        persistRemember();
        const target = safeNext(next) ?? "/home";
        router.push(target);
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
              display_name: name.trim(),
            },
            emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
          },
        });

        if (error) {
          setFormError(friendlyAuthError(error.message));
          return;
        }

        persistRemember();

        if (data.session) {
          router.push("/onboarding");
          router.refresh();
          return;
        }

        setSent("signup");
        return;
      }

      if (mode === "forgot") {
        const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
        });

        if (error) {
          setFormError(friendlyAuthError(error.message));
          return;
        }

        setSent("reset");
      }
    } catch {
      setFormError(
        "Something went wrong. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    if (busy) return;

    setFormError(null);
    setFieldErrors({});

    const cleanEmail = email.trim();
    if (!cleanEmail || !EMAIL_PATTERN.test(cleanEmail)) {
      setFieldErrors({
        email: "Enter your email first.",
      });
      emailRef.current?.focus();
      return;
    }

    setBusy(true);

    try {
      const sb = supabaseBrowser();
      const origin = window.location.origin;
      const target = safeNext(next);
      const callback = `${origin}/auth/callback${
        target ? `?next=${encodeURIComponent(target)}` : ""
      }`;

      const { error } = await sb.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: callback,
        },
      });

      if (error) {
        setFormError(friendlyAuthError(error.message));
        return;
      }

      setSent("magic");
    } catch {
      setFormError(
        "Something went wrong. Check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  function handleBackToSignIn() {
    setSent(null);
    setMode("signin");
    setPassword("");
    setConfirm("");
    setFieldErrors({});
    setFormError(null);
    setShowPassword(false);
    setShowConfirm(false);
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  return (
    <AuthShell>
      <section
        className="auth-card"
        aria-labelledby={sent ? "auth-success-title" : "auth-title"}
      >
        {sent ? (
          <SuccessPanel
            kind={sent}
            email={email.trim()}
            headingRef={successRef}
            onBack={handleBackToSignIn}
          />
        ) : (
          <div key={mode} className="auth-panel">
            <p className="auth-eyebrow">
              <span className="auth-eyebrow-dot" aria-hidden="true" />
              {copy.eyebrow}
            </p>
            <h1
              id="auth-title"
              ref={headingRef}
              tabIndex={-1}
              className="auth-title"
            >
              {copy.title}
            </h1>
            <p className="auth-sub">{copy.sub}</p>

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              {formError ? (
                <div className="auth-alert" role="alert">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              ) : null}

              {mode === "signup" ? (
                <AuthField
                  id="name"
                  label="Full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Your name"
                  error={fieldErrors.name}
                  inputRef={nameRef}
                  autoCapitalize="words"
                />
              ) : null}

              <AuthField
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                error={fieldErrors.email}
                inputRef={emailRef}
                autoCapitalize="none"
                spellCheck={false}
                inputMode="email"
              />

              {mode !== "forgot" ? (
                <AuthField
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  placeholder={
                    mode === "signup" ? "At least 8 characters" : "Your password"
                  }
                  error={fieldErrors.password}
                  hint={
                    mode === "signup"
                      ? "Use at least 8 characters."
                      : undefined
                  }
                  inputRef={passwordRef}
                  trailing={
                    <button
                      type="button"
                      className="auth-reveal"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
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
              ) : null}

              {mode === "signup" ? (
                <AuthField
                  id="confirm"
                  label="Confirm password"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
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
              ) : null}

              {mode === "signin" ? (
                <div className="auth-row">
                  <label className="auth-check" htmlFor="remember">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={remember}
                      onChange={(event) => setRemember(event.target.checked)}
                    />
                    <span className="auth-check-box" aria-hidden="true">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="auth-link"
                    onClick={() => switchMode("forgot")}
                  >
                    Forgot password?
                  </button>
                </div>
              ) : null}

              {mode === "signup" ? (
                <div>
                  <label
                    className="auth-check auth-check--terms"
                    htmlFor="terms"
                  >
                    <input
                      ref={termsRef}
                      id="terms"
                      type="checkbox"
                      checked={terms}
                      onChange={(event) => setTerms(event.target.checked)}
                      aria-invalid={fieldErrors.terms ? "true" : undefined}
                      aria-describedby={
                        fieldErrors.terms ? "terms-error" : undefined
                      }
                    />
                    <span className="auth-check-box" aria-hidden="true">
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    <span>
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                  {fieldErrors.terms ? (
                    <p id="terms-error" className="auth-error-text" role="alert">
                      <AlertCircle
                        className="mt-px h-3 w-3 shrink-0"
                        aria-hidden="true"
                      />
                      {fieldErrors.terms}
                    </p>
                  ) : null}
                </div>
              ) : null}

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
                    {copy.busy}
                  </>
                ) : (
                  <>
                    {mode === "forgot" ? (
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copy.submit}
                  </>
                )}
              </button>

              {mode === "signin" ? (
                <>
                  <div className="auth-divider">or</div>
                  <button
                    type="button"
                    className="auth-link auth-link--center"
                    onClick={handleMagicLink}
                    disabled={busy}
                  >
                    Email me a sign-in link instead
                  </button>
                </>
              ) : null}
            </form>

            <div className="auth-switch">
              {mode === "signin" ? (
                <>
                  New to De`System?{" "}
                  <button type="button" onClick={() => switchMode("signup")}>
                    Create an account
                  </button>
                </>
              ) : mode === "signup" ? (
                <>
                  Already a member?{" "}
                  <button type="button" onClick={() => switchMode("signin")}>
                    Sign in
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5"
                  onClick={() => switchMode("signin")}
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  Back to sign in
                </button>
              )}
            </div>

            {mode === "signup" ? (
              <p className="auth-legal-line">
                Free to join. Membership is decided by the room you apply to.
              </p>
            ) : null}
          </div>
        )}
      </section>
    </AuthShell>
  );
}

function SuccessPanel({
  kind,
  email,
  headingRef,
  onBack,
}: {
  kind: Exclude<Sent, null>;
  email: string;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
}) {
  const copy = {
    signup: {
      title: "Check your inbox.",
      body: `We sent a confirmation link to ${email}. Open it to finish creating your account.`,
      note: "The link can take a minute. Check spam if it doesn't arrive.",
    },
    magic: {
      title: "Check your inbox.",
      body: `We sent a sign-in link to ${email}. Open it on this device to continue.`,
      note: "The link expires after a short time. Request a fresh one if it has gone stale.",
    },
    reset: {
      title: "Check your inbox.",
      body: `If an account exists for ${email}, a reset link is on its way.`,
      note: "For security, we don't reveal whether an email is registered.",
    },
  }[kind];

  return (
    <div className="auth-success" role="status">
      <span className="auth-success-icon">
        {kind === "reset" ? (
          <KeyRound className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Mail className="h-5 w-5" aria-hidden="true" />
        )}
      </span>
      <h2 id="auth-success-title" ref={headingRef} tabIndex={-1}>
        {copy.title}
      </h2>
      <p>{copy.body}</p>
      <p className="auth-success-note">{copy.note}</p>
      <button type="button" className="auth-button auth-button--ghost" onClick={onBack}>
        Back to sign in
      </button>
    </div>
  );
}
