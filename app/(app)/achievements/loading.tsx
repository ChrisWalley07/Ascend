export default function LoadingAchievements() {
  return (
    <div className="px-5 py-6 lg:px-8 lg:py-8 space-y-6">
      <div className="surface p-5 animate-pulse">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="mt-3 h-8 w-56 rounded bg-white/10" />
        <div className="mt-5 h-2.5 w-full rounded bg-white/6" />
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/20 p-4 sm:grid-cols-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-white/6" />
        ))}
      </div>

      <div className="flex gap-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-white/6" />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-pulse">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-white/6" />
        ))}
      </div>
    </div>
  );
}
