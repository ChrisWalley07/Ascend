export default function LoadingAnalytics() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
      <div className="surface p-5 animate-pulse">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="mt-3 h-8 w-52 rounded bg-white/10" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="surface h-56 animate-pulse bg-white/5" />
        <div className="surface h-56 animate-pulse bg-white/5" />
        <div className="surface h-56 animate-pulse bg-white/5" />
      </div>

      <div className="surface h-[260px] animate-pulse bg-white/5" />
    </div>
  );
}

