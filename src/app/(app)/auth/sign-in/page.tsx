import { SignInForm } from "@/components/auth/SignInForm";

export const instant = false;

export default async function SignIn({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <SignInForm authError={error === "auth"} />;
}
