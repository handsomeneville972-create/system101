import { redirect } from "next/navigation";

export const instant = false;

export default async function SignInRedirect({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const params = new URLSearchParams({ mode: "signin" });
  if (next) params.set("next", next);
  if (error) params.set("error", error);
  redirect(`/?${params.toString()}`);
}
