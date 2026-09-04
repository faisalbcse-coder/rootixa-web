import { Wrench, CheckCircle, AlertTriangle, Activity } from "lucide-react";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";

export default function ToolsLoading() {
  const cards = [
    { title: "Total Catalog Tools", icon: Wrench },
    { title: "Live Tools", icon: CheckCircle },
    { title: "In Maintenance", icon: AlertTriangle },
    { title: "Total Operations", icon: Activity },
  ];

  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-44 rounded-xl bg-slate-200 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded-lg bg-slate-100 animate-pulse" />
      </div>

      {/* 4 Skeleton Stat Cards */}
      <section aria-label="Loading Tools Statistics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <AdminStatCard
              key={c.title}
              title={c.title}
              value=""
              change=""
              icon={c.icon}
              state="loading"
            />
          ))}
        </div>
      </section>

      {/* Search & Filter Skeleton */}
      <div className="h-16 rounded-2xl border border-slate-200/80 bg-white p-4 animate-pulse" />

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
        <div className="h-6 w-full rounded bg-slate-100 animate-pulse" />
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-12 w-full rounded-xl bg-slate-50 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
