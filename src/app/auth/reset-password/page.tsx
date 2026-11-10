import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { getUser } from "@/lib/auth";

export const instant = false;

export const metadata: Metadata = {
  title: "Reset password · De`System",
  description: "Choose a new password for your De`System account.",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) redirect("/?mode=signin&error=auth");

  return <ResetPasswordForm email={user.email} />;
}
