import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { getAllToolUsageEvents } from "@/lib/tools/tracker";

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
 * Aggregates core analytics data across Supabase Auth and tool usage tracker.
 */
export async function getAnalyticsData(rangeKey = "30d") {
  const bounds = resolveDateBounds(rangeKey);
  const service = createServiceClient();

  // 1. Fetch Users
  let users = [];
  try {
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

  const totalUsers = users.length;

  // Overview 1: New Users in current vs previous period
  const newUsersCurrent = users.filter((u) => {
    const t = new Date(u.created_at).getTime();
    return t >= bounds.currentStart.getTime() && t <= bounds.now.getTime();
  }).length;

  const newUsersPrevious = users.filter((u) => {
    const t = new Date(u.created_at).getTime();
    return t >= bounds.previousStart.getTime() && t < bounds.previousEnd.getTime();
  }).length;

  const newUsersDelta = calculateDelta(newUsersCurrent, newUsersPrevious);

  // Overview 2: Total Users comparison (growth vs start of current period)
  const usersPriorToPeriod = users.filter(
    (u) => new Date(u.created_at).getTime() < bounds.currentStart.getTime()
  ).length;
  const totalUsersDelta = calculateDelta(totalUsers, usersPriorToPeriod);

  // Overview 3: Active Users in current vs previous period
  // Active = user signed in during period OR logged a tool action during period
  const activeUserIdsCurrent = new Set();
  const activeUserIdsPrevious = new Set();

  users.forEach((u) => {
    if (u.last_sign_in_at) {
      const t = new Date(u.last_sign_in_at).getTime();
      if (t >= bounds.currentStart.getTime() && t <= bounds.now.getTime()) {
        activeUserIdsCurrent.add(u.id);
      } else if (t >= bounds.previousStart.getTime() && t < bounds.previousEnd.getTime()) {
        activeUserIdsPrevious.add(u.id);
      }
    }
  });

  toolEvents.forEach((e) => {
    if (e.user_id && e.created_at) {
      const t = new Date(e.created_at).getTime();
      if (t >= bounds.currentStart.getTime() && t <= bounds.now.getTime()) {
        activeUserIdsCurrent.add(e.user_id);
      } else if (t >= bounds.previousStart.getTime() && t < bounds.previousEnd.getTime()) {
        activeUserIdsPrevious.add(e.user_id);
      }
    }
  });

  const activeUsersCurrentCount = activeUserIdsCurrent.size;
  const activeUsersPreviousCount = activeUserIdsPrevious.size;
  const activeUsersDelta = calculateDelta(activeUsersCurrentCount, activeUsersPreviousCount);

  // Overview 4: Tool Uses in current vs previous period
  const toolEventsCurrent = toolEvents.filter((e) => {
    if (!e.created_at) return false;
    const t = new Date(e.created_at).getTime();
    return t >= bounds.currentStart.getTime() && t <= bounds.now.getTime();
  });

  const toolEventsPrevious = toolEvents.filter((e) => {
    if (!e.created_at) return false;
    const t = new Date(e.created_at).getTime();
    return t >= bounds.previousStart.getTime() && t < bounds.previousEnd.getTime();
  });

  const toolUsesCurrentCount = toolEventsCurrent.length;
  const toolUsesPreviousCount = toolEventsPrevious.length;
  const toolUsesDelta = calculateDelta(toolUsesCurrentCount, toolUsesPreviousCount);

  // 3. User Growth Timeline (Daily curve)
  // Step intervals based on range
  const numBuckets = Math.min(bounds.days, bounds.days <= 14 ? bounds.days : 14);
  const bucketDurationMs = (bounds.now.getTime() - bounds.currentStart.getTime()) / numBuckets;

  const userGrowthChartData = [];
  const activeUsersChartData = [];

  for (let i = 0; i <= numBuckets; i++) {
    const bucketTime = new Date(bounds.currentStart.getTime() + i * bucketDurationMs);
    const dateLabel = bucketTime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Cumulative users up to bucketTime
    const cumulativeUsers = users.filter(
      (u) => new Date(u.created_at).getTime() <= bucketTime.getTime()
    ).length;

    // Active interactions up to bucket window
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

  // 4. Most Used Tools Breakdown
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

  // 5. New Users Breakdown (Today, This Week, This Month)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(bounds.now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(bounds.now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newUsersToday = users.filter(
    (u) => new Date(u.created_at).getTime() >= startOfToday.getTime()
  ).length;

  const newUsersWeek = users.filter(
    (u) => new Date(u.created_at).getTime() >= sevenDaysAgo.getTime()
  ).length;

  const newUsersMonth = users.filter(
    (u) => new Date(u.created_at).getTime() >= thirtyDaysAgo.getTime()
  ).length;

  // 6. Quick Insights Generation
  const insights = [];

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
    } else {
      insights.push({
        title: "Tool Operations",
        description: "Tool usage tracking is active. Real operations are recorded as visitors generate QR codes and use tools.",
        type: "neutral",
      });
    }

    if (activeUsersCurrentCount > 0) {
      const activePct = ((activeUsersCurrentCount / totalUsers) * 100).toFixed(0);
      insights.push({
        title: "User Engagement",
        description: `${activeUsersCurrentCount} user${
          activeUsersCurrentCount === 1 ? "" : "s"
        } (${activePct}% of total) were active on Rootixa during this period.`,
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

    // Overview 4 Cards
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

    // Charts
    charts: {
      userGrowth: userGrowthChartData,
      activeUsers: activeUsersChartData,
    },

    // Tools
    mostUsedTools,
    totalTrackedEvents,

    // New Users Breakdown
    newUsersBreakdown: {
      today: newUsersToday,
      thisWeek: newUsersWeek,
      thisMonth: newUsersMonth,
    },

    // Insights
    insights,
  };
}
