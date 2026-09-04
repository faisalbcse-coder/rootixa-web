import { Users, Eye, Compass, UserCheck, Repeat, Clock } from "lucide-react";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";

export function VisitorKpiCards({ overview }) {
  const {
    uniqueVisitors,
    pageViews,
    sessions,
    newVisitors,
    returningVisitors,
    avgDuration,
  } = overview;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* 1. Unique Visitors */}
      <AdminStatCard
        title="Unique Visitors"
        value={uniqueVisitors.value}
        change={uniqueVisitors.label}
        changeType={uniqueVisitors.changeType}
        icon={Users}
        state="success"
        isMock={false}
      />

      {/* 2. Page Views */}
      <AdminStatCard
        title="Page Views"
        value={pageViews.value}
        change={pageViews.label}
        changeType={pageViews.changeType}
        icon={Eye}
        state="success"
        isMock={false}
      />

      {/* 3. Total Sessions */}
      <AdminStatCard
        title="Total Sessions"
        value={sessions.value}
        change={sessions.label}
        changeType={sessions.changeType}
        icon={Compass}
        state="success"
        isMock={false}
      />

      {/* 4. New Visitors */}
      <AdminStatCard
        title="New Visitors"
        value={newVisitors.value}
        change={newVisitors.label}
        changeType="positive"
        icon={UserCheck}
        state="success"
        isMock={false}
      />

      {/* 5. Returning Visitors */}
      <AdminStatCard
        title="Returning Visitors"
        value={returningVisitors.value}
        change={returningVisitors.label}
        changeType="positive"
        icon={Repeat}
        state="success"
        isMock={false}
      />

      {/* 6. Avg. Session Duration */}
      <AdminStatCard
        title="Avg. Duration"
        value={avgDuration.value}
        change={avgDuration.label}
        changeType="neutral"
        icon={Clock}
        state="success"
        isMock={false}
      />
    </div>
  );
}
