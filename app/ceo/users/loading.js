import { Users, UserCheck, UserX, UserPlus } from "lucide-react";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";

export default function UsersLoading() {
  const cards = [
    { title: "Total Users", icon: Users },
    { title: "Active Users", icon: UserCheck },
    { title: "Inactive Users", icon: UserX },
    { title: "New Users", icon: UserPlus },
  ];

  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-32 rounded-xl bg-slate-200 animate-pulse mb-2" />
        <div className="h-4 w-64 rounded-lg bg-slate-100 animate-pulse" />
      </div>

      {/* 4 Skeleton Stat Cards */}
      <section aria-label="Loading User Statistics">
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

      {/* Search & Filter Bar Skeleton */}
      <div className="h-16 rounded-2xl border border-slate-200/80 bg-white p-4 animate-pulse" />

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 space-y-4">
        <div className="h-6 w-full rounded bg-slate-100 animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 w-full rounded-xl bg-slate-50 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
