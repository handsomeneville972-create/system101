"use client";

import { AlertCircle } from "lucide-react";
import type { ChangeEvent, ReactNode, Ref } from "react";

type AuthFieldProps = {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  inputRef?: Ref<HTMLInputElement>;
  trailing?: ReactNode;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  spellCheck?: boolean;
  inputMode?: "text" | "email";
};

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  placeholder,
  error,
  hint,
  inputRef,
  trailing,
  autoCapitalize,
  spellCheck,
  inputMode,
}: AuthFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">
        {label}
      </label>
      <div className="auth-input-wrap">
        <input
          ref={inputRef}
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          autoCapitalize={autoCapitalize}
          spellCheck={spellCheck}
          inputMode={inputMode}
          className={
            trailing ? "auth-input auth-input--password" : "auth-input"
          }
        />
        {trailing}
      </div>
      {error ? (
        <p id={`${id}-error`} className="auth-error-text" role="alert">
          <AlertCircle className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="auth-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
