export default function LoadingProfile() {
  return (
    <div className="min-h-screen gradient-radial-lime">
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-6 lg:px-8 lg:py-8">
        <div className="animate-pulse rounded-3xl border border-white/8 bg-card p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="h-24 w-24 rounded-full bg-white/10 sm:h-28 sm:w-28" />
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-white/10" />
                <div className="h-7 w-48 rounded bg-white/10" />
                <div className="h-4 w-28 rounded bg-white/10" />
              </div>
            </div>
            <div className="h-9 w-28 rounded-xl bg-white/10" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="h-28 rounded-2xl bg-white/8" />
            <div className="h-28 rounded-2xl bg-white/8" />
            <div className="h-28 rounded-2xl bg-white/8" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-4 w-32 rounded bg-white/10" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/6 animate-pulse" />
            ))}
          </div>
        </div>

        <div className="space-y-6 border-t border-border/60 pt-8">
          <div className="h-5 w-40 rounded bg-white/10" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/6 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

