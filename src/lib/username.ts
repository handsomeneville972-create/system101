export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;

// Lowercase handle, 3–20 chars, starts and ends with a letter or number.
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_]{1,18}[a-z0-9])$/;

const RESERVED = new Set([
  "admin",
  "api",
  "apps",
  "auth",
  "dashboard",
  "decourse",
  "desystem",
  "ebooku",
  "findem",
  "groups",
  "help",
  "home",
  "inbox",
  "messages",
  "moderator",
  "notifications",
  "official",
  "onboarding",
  "privacy",
  "root",
  "settings",
  "staff",
  "suggy",
  "support",
  "system",
  "terms",
]);

export type UsernameCheck =
  | { ok: true; username: string }
  | { ok: false; username: string; reason: "format" | "reserved" };

export function normalizeUsername(value: string): string {
  return value.trim().replace(/^@+/, "").toLowerCase();
}

export function checkUsername(value: string): UsernameCheck {
  const username = normalizeUsername(value);
  if (!USERNAME_PATTERN.test(username)) {
    return { ok: false, username, reason: "format" };
  }
  if (RESERVED.has(username)) {
    return { ok: false, username, reason: "reserved" };
  }
  return { ok: true, username };
}

export function usernameError(
  check: Extract<UsernameCheck, { ok: false }>
): string {
  if (check.reason === "reserved") return "That username is reserved.";
  return "Use 3–20 lowercase letters, numbers or underscores. Start and end with a letter or number.";
}
