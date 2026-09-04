import { redirect } from "next/navigation";
import { Users, UserPlus, Activity, Wrench, Globe2, Layers } from "lucide-react";
import { getAdminContext } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/admin/analytics-data";
import { AdminStatCard } from "@/app/ceo/components/admin-stat-card";
import { AnalyticsDateRange } from "./components/analytics-date-range";
import { AnalyticsSectionNav } from "./components/analytics-section-nav";
import { AnalyticsChart } from "./components/analytics-chart";
import { ToolsUsageSection } from "./components/tools-usage-section";
import { QuickInsightsCard } from "./components/quick-insights-card";
import { VisitorKpiCards } from "./components/visitor-kpi-cards";
import { LiveVisitorsCard } from "./components/live-visitors-card";
import { PagesAnalyticsTable } from "./components/pages-analytics-table";
import { CountryAnalyticsSection } from "./components/country-analytics-section";
import { TrafficSourcesSection } from "./components/traffic-sources-section";
import { DevicesAnalyticsSection } from "./components/devices-analytics-section";
import { VisitorJourneySection } from "./components/visitor-journey-section";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics | Rootixa Console",
  description: "Understand how visitors and users interact with Rootixa.",
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
  const tab = String(resolvedParams?.tab || "all");

  const data = await getAnalyticsData(range);

  const showVisitorSection = tab === "all" || tab === "visitors";
  const showProductSection = tab === "all" || tab === "product";

  return (
    <div className="space-y-8">
      {/* 1. Page Header with Section Switcher and Date Range Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real telemetry across visitor traffic and platform product operations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <AnalyticsSectionNav activeTab={tab} />
          <AnalyticsDateRange currentRange={range} />
        </div>
      </div>

      {/* ============================================================= */}
      {/* VISITOR ANALYTICS LAYER                                       */}
      {/* ============================================================= */}
      {showVisitorSection && (
        <div className="space-y-8">
          {/* Section Divider / Title */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Globe2 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Visitor Analytics
                </h2>
                <p className="text-xs text-slate-500">
                  Who and where visitors are arriving from, pages viewed, and live presence.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {data.dateBoundsLabel}
            </span>
          </div>

          {/* 1. Visitor KPI Cards (6 metrics) */}
          <section aria-label="Visitor Key Metrics">
            <VisitorKpiCards overview={data.visitors.overview} />
          </section>

          {/* 2. Real-Time Live Visitors */}
          <section aria-label="Real Time Online Visitors">
            <LiveVisitorsCard liveVisitors={data.visitors.liveVisitors} />
          </section>

          {/* 3. Pages Analytics Table */}
          <section aria-label="Page Analytics">
            <PagesAnalyticsTable pages={data.visitors.pages} />
          </section>

          {/* 4. Countries & Geographic Distribution */}
          <section aria-label="Geographic Analytics">
            <CountryAnalyticsSection
              countries={data.visitors.countries}
              hasLocationData={data.visitors.hasLocationData}
            />
          </section>

          {/* 5. Traffic Sources & UTM Campaigns */}
          <section aria-label="Traffic Sources">
            <TrafficSourcesSection
              trafficSources={data.visitors.trafficSources}
              utmCampaigns={data.visitors.utmCampaigns}
            />
          </section>

          {/* 6. Devices, Browsers, OS & Session Overview */}
          <section aria-label="Device and Session Analytics">
            <DevicesAnalyticsSection
              devices={data.visitors.devices}
              browsers={data.visitors.browsers}
              operatingSystems={data.visitors.operatingSystems}
              visitorTypes={data.visitors.visitorTypes}
              sessionMetrics={data.visitors.sessionMetrics}
            />
          </section>

          {/* 7. Common Visitor Journeys */}
          <section aria-label="Visitor Navigation Journeys">
            <VisitorJourneySection journeys={data.visitors.journeys} />
          </section>
        </div>
      )}

      {/* ============================================================= */}
      {/* PRODUCT ANALYTICS LAYER (EXISTING RETAINED METRICS)           */}
      {/* ============================================================= */}
      {showProductSection && (
        <div className="space-y-8">
          {/* Section Divider / Title */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Layers className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Product & Tool Analytics
                </h2>
                <p className="text-xs text-slate-500">
                  Registered account activity, operational tool tracking, and user engagement.
                </p>
              </div>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              Registered Accounts
            </span>
          </div>

          {/* 1. Overview 4 Metric Cards */}
          <section aria-label="Product Key Performance Indicators">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdminStatCard
                title="Total Users"
                value={data.overview.totalUsers.value}
                change={data.overview.totalUsers.label}
                changeType={data.overview.totalUsers.changeType}
                icon={Users}
                state="success"
                isMock={false}
              />
              <AdminStatCard
                title="New Users"
                value={data.overview.newUsers.value}
                change={data.overview.newUsers.label}
                changeType={data.overview.newUsers.changeType}
                icon={UserPlus}
                state="success"
                isMock={false}
              />
              <AdminStatCard
                title="Active Users"
                value={data.overview.activeUsers.value}
                change={data.overview.activeUsers.label}
                changeType={data.overview.activeUsers.changeType}
                icon={Activity}
                state="success"
                isMock={false}
              />
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

          {/* 2. User Growth & Active Engagement Charts */}
          <section aria-label="Product Analytics Charts">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart
                data={data.charts.userGrowth}
                title="User Growth"
                description={`Cumulative account registrations (${data.dateBoundsLabel})`}
                color="indigo"
                unit="users"
                badgeText="Growth Curve"
              />
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

          {/* 3. Most Used Tools & Usage Distribution */}
          <section aria-label="Tool Usage Analytics">
            <ToolsUsageSection
              tools={data.mostUsedTools}
              totalTrackedEvents={data.totalTrackedEvents}
            />
          </section>

          {/* 4. New Registrations Breakdown & Synthesized Quick Insights */}
          <section aria-label="Activity Insights">
            <QuickInsightsCard
              insights={data.insights}
              newUsersBreakdown={data.newUsersBreakdown}
            />
          </section>
        </div>
      )}
    </div>
  );
}
