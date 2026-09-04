import { redirect } from "next/navigation";
import { Wrench, CheckCircle, AlertTriangle, Activity } from "lucide-react";
import { getAdminContext } from "@/lib/auth";
import { getToolsStats, getToolsList } from "@/lib/admin/tools-data";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";
import { ToolsClientView } from "./components/tools-client-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tools Management | Rootixa Console",
  description: "Monitor and manage Rootixa platform tools and operational statuses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CeoToolsPage() {
  const adminContext = await getAdminContext();
  if (!adminContext) {
    redirect("/ceo");
  }

  const [stats, tools] = await Promise.all([
    getToolsStats(),
    getToolsList(),
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Tools Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor, inspect, and configure operational statuses across Rootixa&apos;s tool suite.
          </p>
        </div>

        {/* Global Catalog Count Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {stats.live.value} Live / {stats.total.value} Available
          </span>
        </div>
      </div>

      {/* Tools KPI Statistics Cards */}
      <section aria-label="Tools Overview Statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard
            title="Total Catalog Tools"
            value={stats.total.value}
            change={stats.total.label}
            changeType="neutral"
            icon={Wrench}
            state={stats.total.state}
          />
          <AdminStatCard
            title="Live (Active)"
            value={stats.live.value}
            change={stats.live.label}
            changeType="positive"
            icon={CheckCircle}
            state={stats.live.state}
          />
          <AdminStatCard
            title="In Maintenance"
            value={stats.maintenance.value}
            change={stats.maintenance.label}
            changeType={stats.maintenance.value === "0" ? "neutral" : "negative"}
            icon={AlertTriangle}
            state={stats.maintenance.state}
          />
          <AdminStatCard
            title="Total Operations"
            value={stats.operations.value}
            change={stats.operations.label}
            changeType="positive"
            icon={Activity}
            state={stats.operations.state}
          />
        </div>
      </section>

      {/* Interactive Tools Directory Client View */}
      <section aria-label="Tools Directory">
        <ToolsClientView initialTools={tools} />
      </section>
    </div>
  );
}
