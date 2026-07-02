export default function LoadingDashboard() {
  return (
    <div className="mx-auto max-w-lg space-y-5 px-5 py-6 lg:px-8 lg:py-8">
      <div className="mx-auto h-[220px] w-[220px] rounded-full bg-white/5 animate-pulse" />
      <div className="surface h-48 animate-pulse bg-white/5" />
      <div className="h-20 rounded-xl bg-white/5 animate-pulse" />
    </div>
  );
}
