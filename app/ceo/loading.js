export default function CeoLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b12] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 animate-pulse">
          <div className="h-4 w-4 rounded-md border-2 border-white/80 border-t-transparent animate-spin" />
        </div>
        <div className="h-2 w-24 rounded-full bg-slate-800 animate-pulse" />
      </div>
    </main>
  );
}
