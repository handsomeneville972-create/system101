import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthExperience } from "@/components/auth/AuthExperience";
import { getUser } from "@/lib/auth";
import { safeNext } from "@/lib/auth-utils";

export const instant = false;

export const metadata: Metadata = {
  title: "Sign in · De`System",
  description:
    "Sign in to your rooms or create a member account. De`System is a members' network for builders.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Sign in · De`System",
    description:
      "Sign in to your rooms or create a member account. De`System is a members' network for builders.",
    url: "/",
    type: "website",
    images: ["/og-image.png"],
  },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; next?: string; error?: string }>;
}) {
  const user = await getUser();
  if (user) redirect("/home");

  const params = await searchParams;
  const initialMode = params.mode === "signup" ? "signup" : "signin";

  return (
    <AuthExperience
      initialMode={initialMode}
      authError={params.error}
      next={safeNext(params.next) ?? undefined}
    />
  );
}
