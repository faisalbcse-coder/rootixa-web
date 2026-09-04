import { redirect } from "next/navigation";
import { Users, UserPlus, Activity, Wrench } from "lucide-react";
import { getAdminContext } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/admin/analytics-data";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";
import { AnalyticsDateRange } from "./components/analytics-date-range";
import { AnalyticsChart } from "./components/analytics-chart";
import { ToolsUsageSection } from "./components/tools-usage-section";
import { QuickInsightsCard } from "./components/quick-insights-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics | Rootixa Console",
  description: "Understand how people are using Rootixa.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CeoAnalyticsPage({ searchParams }) {
  const adminContext = await getAdminContext();
  if (!adminContext) {
    redirect("/ceo");
  }

  const resolvedParams = await searchParams;
  const range = String(resolvedParams?.range || "30d");

  const data = await getAnalyticsData(range);

  return (
    <div className="space-y-8">
      {/* 1. Page Header with Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Understand how people are using Rootixa.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <AnalyticsDateRange currentRange={range} />
        </div>
      </div>

      {/* 2. Overview 4 Metric Cards */}
      <section aria-label="Key Performance Indicators">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <AdminStatCard
            title="Total Users"
            value={data.overview.totalUsers.value}
            change={data.overview.totalUsers.label}
            changeType={data.overview.totalUsers.changeType}
            icon={Users}
            state="success"
            isMock={false}
          />

          {/* New Users */}
          <AdminStatCard
            title="New Users"
            value={data.overview.newUsers.value}
            change={data.overview.newUsers.label}
            changeType={data.overview.newUsers.changeType}
            icon={UserPlus}
            state="success"
            isMock={false}
          />

          {/* Active Users */}
          <AdminStatCard
            title="Active Users"
            value={data.overview.activeUsers.value}
            change={data.overview.activeUsers.label}
            changeType={data.overview.activeUsers.changeType}
            icon={Activity}
            state="success"
            isMock={false}
          />

          {/* Tool Uses */}
          <AdminStatCard
            title="Tool Uses"
            value={data.overview.toolUses.value}
            change={data.overview.toolUses.label}
            changeType={data.overview.toolUses.changeType}
            icon={Wrench}
            state="success"
            isMock={false}
          />
        </div>
      </section>

      {/* 3. User Growth & Active Engagement Charts */}
      <section aria-label="Visual Analytics Charts">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <AnalyticsChart
            data={data.charts.userGrowth}
            title="User Growth"
            description={`Cumulative account registrations (${data.dateBoundsLabel})`}
            color="indigo"
            unit="users"
            badgeText="Growth Curve"
          />

          {/* Active Users Engagement Chart */}
          <AnalyticsChart
            data={data.charts.activeUsers}
            title="Active Users Activity"
            description={`Platform operations and actions (${data.dateBoundsLabel})`}
            color="emerald"
            unit="actions"
            badgeText="Engagement"
          />
        </div>
      </section>

      {/* 4. Most Used Tools & Usage Distribution */}
      <section aria-label="Tool Usage Analytics">
        <ToolsUsageSection
          tools={data.mostUsedTools}
          totalTrackedEvents={data.totalTrackedEvents}
        />
      </section>

      {/* 5. New Registrations Breakdown & Quick Insights */}
      <section aria-label="Activity Insights">
        <QuickInsightsCard
          insights={data.insights}
          newUsersBreakdown={data.newUsersBreakdown}
        />
      </section>
    </div>
  );
}
