import { Users, UserPlus, Activity, Wrench } from "lucide-react";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";

export default function AnalyticsLoading() {
  const cards = [
    { title: "Total Users", icon: Users },
    { title: "New Users", icon: UserPlus },
    { title: "Active Users", icon: Activity },
    { title: "Tool Uses", icon: Wrench },
  ];

  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <div className="h-8 w-36 rounded-xl bg-slate-200 animate-pulse mb-2" />
          <div className="h-4 w-72 rounded-lg bg-slate-100 animate-pulse" />
        </div>
        <div className="h-10 w-36 rounded-2xl bg-slate-100 animate-pulse" />
      </div>

      {/* 4 Skeleton Stat Cards */}
      <section aria-label="Loading Overview Cards">
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

      {/* 2 Skeleton Charts */}
      <section aria-label="Loading Charts">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse" />
          <div className="h-72 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse" />
        </div>
      </section>

      {/* Tools Section Skeleton */}
      <section aria-label="Loading Tools Analytics">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse" />
          <div className="h-80 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse" />
        </div>
      </section>
    </div>
  );
}
