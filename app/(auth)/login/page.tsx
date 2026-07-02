import Link from "next/link";
import { redirect } from "next/navigation";

import { loginActionWithState } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <AuthForm
      title="Welcome back"
      description="Log in to continue tracking your performance."
      action={loginActionWithState}
      submitLabel="Log in"
      footer={
        <div className="flex w-full items-center justify-between text-sm">
          <Link
            href="/signup"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            New athlete? Create account
          </Link>
          <Link
            href="/forgot-password"
            className="text-muted-foreground hover:text-lime transition-colors text-xs"
          >
            Forgot password
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
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>
    </AuthForm>
  );
}
