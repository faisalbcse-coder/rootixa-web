import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { getAllToolUsageEvents } from "@/lib/tools/tracker";
import { getVisitorEventsAndSessions, getCountryName } from "@/lib/analytics/tracker";

// Canonical Rootixa tools catalog
export const ROOTIXA_TOOLS = [
  {
    id: "qr-code",
    name: "QR & BAR Code Generator",
    category: "Utility / Branding",
    link: "/qr-code",
  },
  {
    id: "cv-builder",
    name: "Pro CV Builder",
    category: "Career / Documents",
    link: "#",
  },
  {
    id: "image-resizer",
    name: "Image Resizer & Crop",
    category: "Media / Images",
    link: "#",
  },
  {
    id: "bg-remover",
    name: "AI Background Remover & Enhancer",
    category: "AI / Photo",
    link: "#",
  },
  {
    id: "pdf-converter",
    name: "Image & PDF Converter",
    category: "Documents",
    link: "#",
  },
  {
    id: "invoice-generator",
    name: "Invoice Generator",
    category: "Business",
    link: "#",
  },
];

/**
 * Resolve date bounds based on selected range key.
 */
function resolveDateBounds(rangeKey) {
  const now = new Date();
  let days = 30;

  if (rangeKey === "7d") days = 7;
  else if (rangeKey === "30d") days = 30;
  else if (rangeKey === "90d") days = 90;
  else if (rangeKey === "year") days = 365;

  const durationMs = days * 24 * 60 * 60 * 1000;
  const currentStart = new Date(now.getTime() - durationMs);
  const previousStart = new Date(currentStart.getTime() - durationMs);
  const previousEnd = new Date(currentStart.getTime());

  return {
    rangeKey,
    days,
    now,
    currentStart,
    previousStart,
    previousEnd,
  };
}

/**
 * Calculate comparative delta percentage or count.
 */
function calculateDelta(currentVal, previousVal) {
  if (previousVal === 0 && currentVal === 0) {
    return {
      change: "0%",
      type: "neutral",
      label: "No change vs prev period",
    };
  }

  if (previousVal === 0 && currentVal > 0) {
    return {
      change: `+${currentVal}`,
      type: "positive",
      label: "First activity recorded",
    };
  }

  if (previousVal > 0 && currentVal === 0) {
    return {
      change: "-100%",
      type: "negative",
      label: "-100% vs prev period",
    };
  }

  const diff = currentVal - previousVal;
  const pct = ((diff / previousVal) * 100).toFixed(1);

  if (diff > 0) {
    return {
      change: `+${pct}%`,
      type: "positive",
      label: `+${pct}% vs prev period`,
    };
  } else if (diff < 0) {
    return {
      change: `${pct}%`,
      type: "negative",
      label: `${pct}% vs prev period`,
    };
  }

  return {
    change: "0%",
    type: "neutral",
    label: "Same as prev period",
  };
}

/**
 * Format duration in seconds to human readable (e.g. "2m 14s" or "< 1m")
 */
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "< 1m";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

/**
 * Format timestamp relative to now (e.g. "Just now", "2m ago")
 */
function formatRelativeTime(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

/**
 * Aggregates core analytics data across Supabase Auth, tool usage tracker,
 * and visitor session analytics.
 */
export async function getAnalyticsData(rangeKey = "30d") {
  const bounds = resolveDateBounds(rangeKey);
  const currentStartMs = bounds.currentStart.getTime();
  const previousStartMs = bounds.previousStart.getTime();
  const previousEndMs = bounds.previousEnd.getTime();
  const nowMs = bounds.now.getTime();

  // 1. Fetch Users from Supabase Auth
  let users = [];
  try {
    const service = createServiceClient();
    const { data: usersData, error: usersErr } = await service.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (!usersErr && usersData?.users) {
      users = usersData.users;
    }
  } catch (err) {
    console.error("Error loading users for analytics:", err);
  }

  // 2. Fetch Tool Events
  let toolEvents = [];
  try {
    toolEvents = await getAllToolUsageEvents();
  } catch (err) {
    console.error("Error loading tool events for analytics:", err);
  }

  // 3. Fetch Visitor Events & Sessions
  let rawPageViews = [];
  let rawSessions = [];
  try {
    const visitorData = await getVisitorEventsAndSessions();
    rawPageViews = visitorData.pageViews || [];
    rawSessions = visitorData.sessions || [];
  } catch (err) {
    console.error("Error loading visitor events:", err);
  }

  /* ------------------------------------------------------------------ */
  /* PRODUCT ANALYTICS (EXISTING RETAINED METRICS)                       */
  /* ------------------------------------------------------------------ */
  const totalUsers = users.length;

  const newUsersCurrent = users.filter((u) => {
    const t = new Date(u.created_at).getTime();
    return t >= currentStartMs && t <= nowMs;
  }).length;

  const newUsersPrevious = users.filter((u) => {
    const t = new Date(u.created_at).getTime();
    return t >= previousStartMs && t < previousEndMs;
  }).length;

  const newUsersDelta = calculateDelta(newUsersCurrent, newUsersPrevious);

  const usersPriorToPeriod = users.filter(
    (u) => new Date(u.created_at).getTime() < currentStartMs
  ).length;
  const totalUsersDelta = calculateDelta(totalUsers, usersPriorToPeriod);

  const activeUserIdsCurrent = new Set();
  const activeUserIdsPrevious = new Set();

  users.forEach((u) => {
    if (u.last_sign_in_at) {
      const t = new Date(u.last_sign_in_at).getTime();
      if (t >= currentStartMs && t <= nowMs) {
        activeUserIdsCurrent.add(u.id);
      } else if (t >= previousStartMs && t < previousEndMs) {
        activeUserIdsPrevious.add(u.id);
      }
    }
  });

  toolEvents.forEach((e) => {
    if (e.user_id && e.created_at) {
      const t = new Date(e.created_at).getTime();
      if (t >= currentStartMs && t <= nowMs) {
        activeUserIdsCurrent.add(e.user_id);
      } else if (t >= previousStartMs && t < previousEndMs) {
        activeUserIdsPrevious.add(e.user_id);
      }
    }
  });

  const activeUsersCurrentCount = activeUserIdsCurrent.size;
  const activeUsersPreviousCount = activeUserIdsPrevious.size;
  const activeUsersDelta = calculateDelta(activeUsersCurrentCount, activeUsersPreviousCount);

  const toolEventsCurrent = toolEvents.filter((e) => {
    if (!e.created_at) return false;
    const t = new Date(e.created_at).getTime();
    return t >= currentStartMs && t <= nowMs;
  });

  const toolEventsPrevious = toolEvents.filter((e) => {
    if (!e.created_at) return false;
    const t = new Date(e.created_at).getTime();
    return t >= previousStartMs && t < previousEndMs;
  });

  const toolUsesCurrentCount = toolEventsCurrent.length;
  const toolUsesPreviousCount = toolEventsPrevious.length;
  const toolUsesDelta = calculateDelta(toolUsesCurrentCount, toolUsesPreviousCount);

  // User Growth & Active Users timeline
  const numBuckets = Math.min(bounds.days, bounds.days <= 14 ? bounds.days : 14);
  const bucketDurationMs = (nowMs - currentStartMs) / numBuckets;

  const userGrowthChartData = [];
  const activeUsersChartData = [];
  const visitorsOverTimeChartData = [];

  for (let i = 0; i <= numBuckets; i++) {
    const bucketTime = new Date(currentStartMs + i * bucketDurationMs);
    const dateLabel = bucketTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const cumulativeUsers = users.filter(
      (u) => new Date(u.created_at).getTime() <= bucketTime.getTime()
    ).length;

    const windowStart = new Date(bucketTime.getTime() - bucketDurationMs);
    const activeInWindow = toolEvents.filter((e) => {
      const t = new Date(e.created_at).getTime();
      return t >= windowStart.getTime() && t <= bucketTime.getTime();
    }).length;

    userGrowthChartData.push({
      date: dateLabel,
      timestamp: bucketTime.toISOString(),
      value: cumulativeUsers,
    });

    activeUsersChartData.push({
      date: dateLabel,
      timestamp: bucketTime.toISOString(),
      value: activeInWindow,
    });
  }

  // Most used tools breakdown
  const toolUsageMap = {};
  toolEvents.forEach((e) => {
    const tid = e.tool_id || "unknown";
    toolUsageMap[tid] = (toolUsageMap[tid] || 0) + 1;
  });

  const totalTrackedEvents = toolEvents.length;
  const mostUsedTools = ROOTIXA_TOOLS.map((tool) => {
    const uses = toolUsageMap[tool.id] || 0;
    const share = totalTrackedEvents > 0 ? ((uses / totalTrackedEvents) * 100).toFixed(1) : "0.0";
    return {
      ...tool,
      uses,
      share: Number(share),
    };
  }).sort((a, b) => b.uses - a.uses);

  // New registrations timeline breakdown
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(nowMs - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(nowMs - 30 * 24 * 60 * 60 * 1000);

  const newUsersToday = users.filter(
    (u) => new Date(u.created_at).getTime() >= startOfToday.getTime()
  ).length;

  const newUsersWeek = users.filter(
    (u) => new Date(u.created_at).getTime() >= sevenDaysAgo.getTime()
  ).length;

  const newUsersMonth = users.filter(
    (u) => new Date(u.created_at).getTime() >= thirtyDaysAgo.getTime()
  ).length;

  /* ------------------------------------------------------------------ */
  /* VISITOR ANALYTICS LAYER (NEW REAL TRACKING DATA)                   */
  /* ------------------------------------------------------------------ */
  // Filter views and sessions by date bounds
  const currentViews = rawPageViews.filter((v) => {
    const t = new Date(v.created_at).getTime();
    return t >= currentStartMs && t <= nowMs;
  });

  const previousViews = rawPageViews.filter((v) => {
    const t = new Date(v.created_at).getTime();
    return t >= previousStartMs && t < previousEndMs;
  });

  const currentSessions = rawSessions.filter((s) => {
    const t = new Date(s.started_at).getTime();
    return t >= currentStartMs && t <= nowMs;
  });

  const previousSessions = rawSessions.filter((s) => {
    const t = new Date(s.started_at).getTime();
    return t >= previousStartMs && t < previousEndMs;
  });

  // Unique visitors in current and previous periods
  const currentVisitorIds = new Set(currentViews.map((v) => v.visitor_id));
  const previousVisitorIds = new Set(previousViews.map((v) => v.visitor_id));

  const uniqueVisitorsCount = currentVisitorIds.size;
  const previousVisitorsCount = previousVisitorIds.size;
  const visitorsDelta = calculateDelta(uniqueVisitorsCount, previousVisitorsCount);

  const pageViewsCount = currentViews.length;
  const previousPageViewsCount = previousViews.length;
  const pageViewsDelta = calculateDelta(pageViewsCount, previousPageViewsCount);

  const sessionsCount = currentSessions.length;
  const previousSessionsCount = previousSessions.length;
  const sessionsDelta = calculateDelta(sessionsCount, previousSessionsCount);

  // New vs Returning Visitors
  let newVisitorsCount = 0;
  let returningVisitorsCount = 0;

  currentVisitorIds.forEach((vid) => {
    // A visitor is returning if they had views prior to currentStartMs
    const hasPriorHistory = rawPageViews.some((v) => {
      return v.visitor_id === vid && new Date(v.created_at).getTime() < currentStartMs;
    });

    if (hasPriorHistory) {
      returningVisitorsCount += 1;
    } else {
      newVisitorsCount += 1;
    }
  });

  const newVisitorShare =
    uniqueVisitorsCount > 0
      ? Math.round((newVisitorsCount / uniqueVisitorsCount) * 100)
      : 0;
  const returningVisitorShare =
    uniqueVisitorsCount > 0
      ? Math.round((returningVisitorsCount / uniqueVisitorsCount) * 100)
      : 0;

  // Average Session Duration
  const totalDurationSeconds = currentSessions.reduce(
    (acc, s) => acc + (Number(s.duration_seconds) || 0),
    0
  );
  const avgSessionDurationSeconds =
    sessionsCount > 0 ? Math.round(totalDurationSeconds / sessionsCount) : 0;
  const avgDurationFormatted = formatDuration(avgSessionDurationSeconds);

  // Pages per Session
  const totalSessionPageViews = currentSessions.reduce(
    (acc, s) => acc + (Number(s.page_views_count) || 1),
    0
  );
  const pagesPerSession =
    sessionsCount > 0 ? (totalSessionPageViews / sessionsCount).toFixed(1) : "1.0";

  // Bounce Rate (% of sessions with only 1 page view and 0 duration)
  const bouncedSessions = currentSessions.filter(
    (s) => (s.page_views_count || 1) <= 1 && (s.duration_seconds || 0) < 10
  ).length;
  const bounceRate =
    sessionsCount > 0
      ? `${Math.round((bouncedSessions / sessionsCount) * 100)}%`
      : null;

  // Pages Analytics Table
  const pageMetricsMap = {};
  currentViews.forEach((v) => {
    const p = v.page_path || "/";
    if (!pageMetricsMap[p]) {
      pageMetricsMap[p] = {
        path: p,
        title: v.page_title || p,
        views: 0,
        visitorIds: new Set(),
        sessionIds: new Set(),
        totalDurationSeconds: 0,
      };
    }
    const item = pageMetricsMap[p];
    item.views += 1;
    item.visitorIds.add(v.visitor_id);
    item.sessionIds.add(v.session_id);
    item.totalDurationSeconds += Number(v.duration_seconds || 0);
  });

  const pagesAnalytics = Object.values(pageMetricsMap)
    .map((p) => {
      const uniqueV = p.visitorIds.size;
      const sess = p.sessionIds.size;
      const avgSec = p.views > 0 ? Math.round(p.totalDurationSeconds / p.views) : 0;
      return {
        path: p.path,
        title: p.title,
        views: p.views,
        uniqueVisitors: uniqueV,
        sessions: sess,
        avgTimeSeconds: avgSec,
        avgTimeFormatted: formatDuration(avgSec),
      };
    })
    .sort((a, b) => b.views - a.views);

  // Country Analytics
  const countryMetricsMap = {};
  let totalCountryViews = 0;
  currentViews.forEach((v) => {
    const code = (v.country_code || "Unknown").toUpperCase();
    if (!countryMetricsMap[code]) {
      countryMetricsMap[code] = {
        code,
        name: v.country_name || getCountryName(code),
        visitorIds: new Set(),
        sessionIds: new Set(),
        pageViews: 0,
      };
    }
    const c = countryMetricsMap[code];
    c.pageViews += 1;
    c.visitorIds.add(v.visitor_id);
    c.sessionIds.add(v.session_id);
    totalCountryViews += 1;
  });

  const countriesAnalytics = Object.values(countryMetricsMap)
    .map((c) => ({
      code: c.code,
      name: c.name,
      visitors: c.visitorIds.size,
      sessions: c.sessionIds.size,
      pageViews: c.pageViews,
      share:
        totalCountryViews > 0
          ? ((c.pageViews / totalCountryViews) * 100).toFixed(1)
          : "0.0",
    }))
    .sort((a, b) => b.visitors - a.visitors);

  const hasLocationData = countriesAnalytics.some(
    (c) => c.code !== "UNKNOWN" && c.code !== "XX"
  );

  // Traffic Sources
  const sourceMetricsMap = {};
  currentViews.forEach((v) => {
    const src = v.traffic_source || "Direct";
    if (!sourceMetricsMap[src]) {
      sourceMetricsMap[src] = {
        source: src,
        visitorIds: new Set(),
        sessionIds: new Set(),
        pageViews: 0,
      };
    }
    const s = sourceMetricsMap[src];
    s.pageViews += 1;
    s.visitorIds.add(v.visitor_id);
    s.sessionIds.add(v.session_id);
  });

  const trafficSourcesAnalytics = Object.values(sourceMetricsMap)
    .map((s) => ({
      source: s.source,
      visitors: s.visitorIds.size,
      sessions: s.sessionIds.size,
      pageViews: s.pageViews,
      share:
        pageViewsCount > 0
          ? ((s.pageViews / pageViewsCount) * 100).toFixed(1)
          : "0.0",
    }))
    .sort((a, b) => b.visitors - a.visitors);

  // UTM Campaigns Breakdown
  const utmMap = {};
  currentViews.forEach((v) => {
    if (v.utm_campaign || v.utm_source) {
      const key = `${v.utm_campaign || "(none)"} / ${v.utm_source || "(direct)"}`;
      if (!utmMap[key]) {
        utmMap[key] = {
          campaign: v.utm_campaign || "(none)",
          source: v.utm_source || "(direct)",
          medium: v.utm_medium || "-",
          count: 0,
        };
      }
      utmMap[key].count += 1;
    }
  });
  const utmCampaigns = Object.values(utmMap).sort((a, b) => b.count - a.count);

  // Device Category Analytics
  const deviceCounts = { Mobile: 0, Desktop: 0, Tablet: 0 };
  const browserCounts = {};
  const osCounts = {};

  currentViews.forEach((v) => {
    const dev = v.device_category || "Desktop";
    if (deviceCounts[dev] !== undefined) deviceCounts[dev] += 1;
    else deviceCounts.Desktop += 1;

    const b = v.browser || "Other";
    browserCounts[b] = (browserCounts[b] || 0) + 1;

    const o = v.os || "Other";
    osCounts[o] = (osCounts[o] || 0) + 1;
  });

  const totalDeviceViews = pageViewsCount || 1;
  const devicesBreakdown = [
    {
      name: "Mobile",
      count: deviceCounts.Mobile,
      share: Math.round((deviceCounts.Mobile / totalDeviceViews) * 100),
    },
    {
      name: "Desktop",
      count: deviceCounts.Desktop,
      share: Math.round((deviceCounts.Desktop / totalDeviceViews) * 100),
    },
    {
      name: "Tablet",
      count: deviceCounts.Tablet,
      share: Math.round((deviceCounts.Tablet / totalDeviceViews) * 100),
    },
  ];

  const browsersBreakdown = Object.entries(browserCounts)
    .map(([name, count]) => ({
      name,
      count,
      share: Math.round((count / totalDeviceViews) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const osBreakdown = Object.entries(osCounts)
    .map(([name, count]) => ({
      name,
      count,
      share: Math.round((count / totalDeviceViews) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Real-Time Active Visitors (Active in the last 5 minutes)
  const fiveMinutesAgoMs = Date.now() - 5 * 60 * 1000;
  const liveActiveSessions = rawSessions.filter((s) => {
    const t = new Date(s.last_activity_at || s.started_at).getTime();
    return t >= fiveMinutesAgoMs;
  });

  const liveVisitorsList = liveActiveSessions.map((s) => ({
    id: s.id,
    countryCode: s.country_code || "Unknown",
    countryName: s.country_name || getCountryName(s.country_code),
    currentPage: s.exit_page || s.entry_page || "/",
    deviceCategory: s.device_category || "Desktop",
    lastActiveFormatted: formatRelativeTime(s.last_activity_at || s.started_at),
  }));

  const liveVisitorsCount = liveActiveSessions.length;

  // Common Visitor Journeys (Flow Sequences across sessions)
  const journeyMap = {};
  currentSessions.forEach((s) => {
    const pages = Array.isArray(s.pages_visited)
      ? s.pages_visited
      : [s.entry_page, s.exit_page].filter(Boolean);

    // Dedup adjacent identical page views
    const pathSteps = [];
    pages.forEach((p) => {
      if (pathSteps.length === 0 || pathSteps[pathSteps.length - 1] !== p) {
        pathSteps.push(p);
      }
    });

    if (pathSteps.length > 0) {
      const flow = pathSteps.slice(0, 4).join(" → ");
      journeyMap[flow] = (journeyMap[flow] || 0) + 1;
    }
  });

  const visitorJourneys = Object.entries(journeyMap)
    .map(([flow, count]) => ({
      flow,
      count,
      share:
        sessionsCount > 0
          ? ((count / sessionsCount) * 100).toFixed(1)
          : "0.0",
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  /* ------------------------------------------------------------------ */
  /* SYNTHESIZED REAL INSIGHTS (COMBINING PRODUCT + VISITOR ANALYTICS)  */
  /* ------------------------------------------------------------------ */
  const insights = [];

  // 1. Visitor Insights
  if (uniqueVisitorsCount > 0) {
    insights.push({
      title: "Visitor Volume",
      description: `${uniqueVisitorsCount.toLocaleString()} unique visitor${
        uniqueVisitorsCount === 1 ? "" : "s"
      } logged ${pageViewsCount.toLocaleString()} page views across ${sessionsCount.toLocaleString()} sessions (${visitorsDelta.label}).`,
      type: visitorsDelta.type,
    });

    // Top Country
    const topCountry = countriesAnalytics.find(
      (c) => c.code !== "UNKNOWN" && c.code !== "XX"
    );
    if (topCountry && topCountry.visitors > 0) {
      insights.push({
        title: "Top Visitor Country",
        description: `${topCountry.name} generated the highest visitor traffic (${topCountry.visitors} visitors, ${topCountry.share}% of total views).`,
        type: "positive",
      });
    }

    // Top Visited Page
    const topPage = pagesAnalytics[0];
    if (topPage && topPage.views > 0) {
      insights.push({
        title: "Most Visited Page",
        description: `${topPage.path} is the most viewed route with ${topPage.views.toLocaleString()} views (${topPage.uniqueVisitors.toLocaleString()} unique visitors).`,
        type: "positive",
      });
    }

    // Device Split
    const topDevice = devicesBreakdown[0];
    if (topDevice && topDevice.share > 0) {
      insights.push({
        title: "Primary Device Access",
        description: `${topDevice.name} devices represent ${topDevice.share}% of all visitor browsing sessions on Rootixa.`,
        type: "neutral",
      });
    }

    // New vs Returning
    if (returningVisitorsCount > 0) {
      insights.push({
        title: "Visitor Retention",
        description: `${returningVisitorsCount} returning visitor${
          returningVisitorsCount === 1 ? "" : "s"
        } (${returningVisitorShare}% of total) revisited Rootixa during this period.`,
        type: "positive",
      });
    }
  }

  // 2. Product Insights (Retained)
  if (totalUsers > 0) {
    if (newUsersCurrent > 0) {
      insights.push({
        title: "Registration Growth",
        description: `${newUsersCurrent} new user account${
          newUsersCurrent === 1 ? "" : "s"
        } registered in this period (${newUsersDelta.label}).`,
        type: newUsersDelta.type,
      });
    }

    const topTool = mostUsedTools[0];
    if (topTool && topTool.uses > 0) {
      insights.push({
        title: "Leading Platform Tool",
        description: `${topTool.name} is the most-used tool with ${topTool.uses.toLocaleString()} operation${
          topTool.uses === 1 ? "" : "s"
        } logged (${topTool.share}% share).`,
        type: "positive",
      });
    }
  }

  return {
    rangeKey: bounds.rangeKey,
    days: bounds.days,
    dateBoundsLabel: `${bounds.currentStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} – ${bounds.now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`,

    // Product Overview 4 Cards (Existing)
    overview: {
      totalUsers: {
        value: totalUsers.toLocaleString(),
        change: totalUsersDelta.change,
        changeType: totalUsersDelta.type,
        label: totalUsersDelta.label,
      },
      newUsers: {
        value: newUsersCurrent.toLocaleString(),
        change: newUsersDelta.change,
        changeType: newUsersDelta.type,
        label: newUsersDelta.label,
      },
      activeUsers: {
        value: activeUsersCurrentCount.toLocaleString(),
        change: activeUsersDelta.change,
        changeType: activeUsersDelta.type,
        label: activeUsersDelta.label,
      },
      toolUses: {
        value: toolUsesCurrentCount.toLocaleString(),
        change: toolUsesDelta.change,
        changeType: toolUsesDelta.type,
        label: toolUsesDelta.label,
      },
    },

    // Charts (Existing)
    charts: {
      userGrowth: userGrowthChartData,
      activeUsers: activeUsersChartData,
    },

    // Tools & Registrations (Existing)
    mostUsedTools,
    totalTrackedEvents,
    newUsersBreakdown: {
      today: newUsersToday,
      thisWeek: newUsersWeek,
      thisMonth: newUsersMonth,
    },

    // Synthesized Insights
    insights,

    // VISITOR ANALYTICS LAYER (NEW)
    visitors: {
      overview: {
        uniqueVisitors: {
          value: uniqueVisitorsCount.toLocaleString(),
          change: visitorsDelta.change,
          changeType: visitorsDelta.type,
          label: visitorsDelta.label,
        },
        pageViews: {
          value: pageViewsCount.toLocaleString(),
          change: pageViewsDelta.change,
          changeType: pageViewsDelta.type,
          label: pageViewsDelta.label,
        },
        sessions: {
          value: sessionsCount.toLocaleString(),
          change: sessionsDelta.change,
          changeType: sessionsDelta.type,
          label: sessionsDelta.label,
        },
        newVisitors: {
          value: newVisitorsCount.toLocaleString(),
          share: `${newVisitorShare}%`,
          label: `${newVisitorShare}% of visitors`,
        },
        returningVisitors: {
          value: returningVisitorsCount.toLocaleString(),
          share: `${returningVisitorShare}%`,
          label: `${returningVisitorShare}% retention`,
        },
        avgDuration: {
          value: avgDurationFormatted,
          rawSeconds: avgSessionDurationSeconds,
          label: "Per browsing session",
        },
      },
      pages: pagesAnalytics,
      countries: countriesAnalytics,
      hasLocationData,
      trafficSources: trafficSourcesAnalytics,
      utmCampaigns,
      devices: devicesBreakdown,
      browsers: browsersBreakdown,
      operatingSystems: osBreakdown,
      visitorTypes: {
        new: { count: newVisitorsCount, share: newVisitorShare },
        returning: { count: returningVisitorsCount, share: returningVisitorShare },
      },
      sessionMetrics: {
        totalSessions: sessionsCount,
        avgDurationFormatted,
        pagesPerSession,
        bounceRate,
      },
      liveVisitors: {
        count: liveVisitorsCount,
        list: liveVisitorsList,
      },
      journeys: visitorJourneys,
    },
  };
}
