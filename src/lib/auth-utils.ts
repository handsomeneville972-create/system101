export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Only allow same-origin, in-app destinations. Auth routes are excluded so a
 * stale `next` value can never bounce the user back into the form.
 */
export function safeNext(value?: string | null) {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\")) return null;
  if (value.startsWith("/auth/")) return null;
  return value;
}

export function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "That email and password don't match. Try again, reset your password, or use a sign-in link.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Confirm your email first. Check your inbox for the confirmation link.";
  }
  if (normalized.includes("user already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (
    normalized.includes("signups not allowed") ||
    normalized.includes("user not found")
  ) {
    return "We couldn't find an account with that email. Create one instead.";
  }
  if (normalized.includes("password should be at least")) {
    return "Use at least 8 characters for your password.";
  }
  if (
    normalized.includes("for security purposes") ||
    normalized.includes("rate limit")
  ) {
    return "Please wait a moment before trying again.";
  }
  if (normalized.includes("new password should be different")) {
    return "Choose a password you haven't used here before.";
  }
  if (normalized.includes("unable to validate email")) {
    return "That email address doesn't look right. Check it and try again.";
  }

  return message;
}
