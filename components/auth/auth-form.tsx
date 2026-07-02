"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type AuthState = { error?: string; success?: string };

type AuthFormProps = {
  title: string;
  description: string;
  action: (state: AuthState | undefined, payload: FormData) => Promise<AuthState>;
  submitLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthForm({
  title,
  description,
  action,
  submitLabel,
  children,
  footer,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-4">
        {children}

        {/* Error state */}
        {state?.error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{state.error}</p>
          </div>
        )}

        {/* Success state */}
        {state?.success && (
          <div className="flex items-start gap-2.5 rounded-xl border border-lime/20 bg-lime/8 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
            <p className="text-sm text-lime">{state.success}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 font-semibold"
          disabled={pending}
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Please wait…
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      </form>

      {/* Footer */}
      {footer && (
        <div className="mt-6 pt-6 border-t border-white/7">
          {footer}
        </div>
      )}
    </div>
  );
}
