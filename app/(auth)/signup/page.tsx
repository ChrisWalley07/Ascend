import Link from "next/link";
import { redirect } from "next/navigation";

import { signUpActionWithState } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth/auth-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { DEPARTMENTS, isValidDepartment } from "@/lib/departments";

type Props = {
  searchParams: Promise<{ department?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const department =
    params.department && isValidDepartment(params.department) ? params.department : null;
  const deptConfig = department ? DEPARTMENTS[department] : null;

  return (
    <AuthForm
      title="Create your athlete profile"
      description={
        deptConfig
          ? `Join ASCEND as a ${deptConfig.label} athlete — start tracking what matters.`
          : "Start measuring whether you are truly getting fitter."
      }
      action={signUpActionWithState}
      submitLabel="Create account"
      footer={
        <div className="w-full text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground hover:text-lime transition-colors font-medium">
            Log in
          </Link>
        </div>
      }
    >
      {department && <input type="hidden" name="department" value={department} />}
      {deptConfig && (
        <div className="rounded-xl border border-lime/20 bg-lime/8 px-3 py-2 text-xs text-lime">
          Department: <span className="font-semibold">{deptConfig.label}</span>
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Rich Froning"
          autoComplete="name"
          required
        />
      </div>
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
          autoComplete="new-password"
          required
        />
      </div>
    </AuthForm>
  );
}
