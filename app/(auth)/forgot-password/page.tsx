import Link from "next/link";

import { forgotPasswordActionWithState } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Reset your password"
      description="We'll send a reset link to your inbox."
      action={forgotPasswordActionWithState}
      submitLabel="Send reset link"
      footer={
        <div className="w-full text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="text-foreground hover:text-lime transition-colors font-medium"
          >
            Back to login
          </Link>
        </div>
      }
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="athlete@ascend.app"
          autoComplete="email"
          required
        />
      </div>
    </AuthForm>
  );
}
