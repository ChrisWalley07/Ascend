import Link from "next/link";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl shadow-black/20">
        <h1 className="text-xl font-semibold tracking-tight">Reset Password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Password reset confirmation is connected. You can now finish this flow with a dedicated secure update form.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-foreground hover:underline">
          Return to login
        </Link>
      </div>
    </div>
  );
}
