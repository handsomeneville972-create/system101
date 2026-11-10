"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * Submit button that reads its parent form's pending state. Works from a
 * Server Component form because useFormStatus follows React's form context.
 */
export function SubmitButton({
  children,
  pendingText,
  className,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      {...rest}
      type={rest.type ?? "submit"}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(className, "disabled:opacity-50")}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
