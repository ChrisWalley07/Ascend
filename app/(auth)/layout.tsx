import { AscendLogo } from "@/components/brand/ascend-logo";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { APP_NAME } from "@/lib/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[45%] shrink-0 flex-col relative overflow-hidden">
        {/* Deep dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#111111]" />
        {/* Lime radial glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-15 blur-[80px] bg-lime" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <AscendLogo size="lg" showTagline />

          {/* Hero text */}
          <div className="max-w-sm">
            <h2 className="text-4xl font-bold tracking-tight text-foreground leading-tight">
              Train harder.
              <br />
              Track smarter.
              <br />
              <span className="text-lime">Keep ascending.</span>
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              The performance operating system for serious CrossFit athletes.
              Every rep tracked. Every PR celebrated. Every weakness exposed.
            </p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { value: "8", label: "Score categories" },
                { value: "∞", label: "Benchmarks tracked" },
                { value: "AI", label: "Coach insights" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-lime">{value}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground uppercase tracking-widest">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-[11px] text-muted-foreground/50">
            © 2025 {APP_NAME} — For athletes who keep rising.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <AscendLogo size="md" showTagline />
        </div>

        <div className="w-full max-w-sm">
          <SupabaseSetupNotice />
          {children}
        </div>
      </div>
    </div>
  );
}
