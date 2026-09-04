import { 
  Users, 
  Wrench, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Database, 
  Layers, 
  LayoutGrid 
} from "lucide-react";
import { getAdminContext } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/admin/dashboard-data";
import { CeoLoginForm } from "./login-form";
import { AdminStatCard } from "./components/admin-stat-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Console Access | Rootixa",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CeoPage() {
  const adminContext = await getAdminContext();

  // Guard: If unauthenticated or not an active admin in public.admins, show the stealth login portal
  if (!adminContext) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b12] px-4 py-12 text-slate-100">
        {/* Subtle executive radial ambient glows */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />

        {/* Main Terminal Card */}
        <section className="relative w-full max-w-md rounded-3xl border border-slate-800/90 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          {/* Top bar with system badge */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-white">
                Rootixa<span className="text-indigo-400">.</span>
              </span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Encrypted Portal</span>
            </span>
          </div>

          {/* Title */}
          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
              Executive Gateway
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
              Administrative Console
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
              Authorized management personnel only. All access attempts are timestamped and logged.
            </p>
          </div>

          {/* Login Form */}
          <CeoLoginForm />

          <div className="mt-6 border-t border-slate-800/60 pt-4 text-center">
            <p className="text-[10px] text-slate-500 tracking-wide">
              Rootixa Security Protocol &bull; Private Access Only
            </p>
          </div>
        </section>
      </main>
    );
  }

  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor and manage your Rootixa platform.
          </p>
        </div>

        {/* Four Real Platform Statistics Cards */}
        <section aria-label="Platform Statistics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Total Users (Connected to Supabase Auth) */}
            <AdminStatCard
              title="Total Users"
              value={data.users.value}
              change={data.users.label}
              changeType={data.users.state === "success" ? "positive" : "negative"}
              icon={Users}
              state={data.users.state}
              isMock={false}
            />

            {/* Card 2: Tool Usage (Connected to Tool Tracking Foundation) */}
            <AdminStatCard
              title="Tool Usage"
              value={data.toolUsage.value}
              change={data.toolUsage.label}
              changeType={data.toolUsage.state === "success" ? "positive" : "neutral"}
              icon={Wrench}
              state={data.toolUsage.state}
              isMock={false}
            />

            {/* Card 3: AI Usage (Clean Unavailable / Not Connected State) */}
            <AdminStatCard
              title="AI Usage"
              value={data.aiUsage.value}
              change={data.aiUsage.label}
              changeType="neutral"
              icon={Sparkles}
              state={data.aiUsage.state}
              isMock={false}
            />

            {/* Card 4: System Status (Live Health Check: App + DB) */}
            <AdminStatCard
              title="System Status"
              value={data.system.value}
              change={data.system.label}
              changeType={data.system.state === "success" ? "positive" : "negative"}
              icon={Activity}
              state={data.system.state}
              isMock={false}
            />
          </div>
        </section>

        {/* Data Architecture Overview */}
        <section aria-label="Overview">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Database className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Real Data Layer Connected
                  </h2>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Dashboard statistics are powered by live backend queries and unified health monitoring.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Console
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Auth Users</p>
                </div>
                <p className="text-sm font-bold text-slate-800">Supabase Auth Integrated</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Direct aggregation of registered platform accounts without client-side data leaks.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tool Tracking</p>
                </div>
                <p className="text-sm font-bold text-slate-800">Reusable Tracking Engine</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Lightweight event collector with dual persistence, ready for all Rootixa tools.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">System Probe</p>
                </div>
                <p className="text-sm font-bold text-slate-800">Live Health Verification</p>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Continuous round-trip latency probe verifying application and database availability.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
  );
}
