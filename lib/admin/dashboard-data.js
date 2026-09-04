import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { getTotalToolUsage } from "@/lib/tools/tracker";

/**
 * Fetch total registered users directly from Supabase Auth.
 */
async function fetchTotalUsers() {
  try {
    const service = createServiceClient();
    const { data, error } = await service.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      console.error("Failed to fetch auth users:", error.message);
      return {
        value: "Unable to load",
        state: "error",
        label: "Database query failed",
      };
    }

    const total = typeof data?.total === "number" ? data.total : data?.users?.length || 0;
    return {
      value: total.toLocaleString(),
      state: "success",
      label: total === 1 ? "1 registered user" : `${total.toLocaleString()} registered users`,
    };
  } catch (err) {
    console.error("fetchTotalUsers exception:", err);
    return {
      value: "Unable to load",
      state: "error",
      label: "User database unreachable",
    };
  }
}

/**
 * Fetch total platform tool operations from the tracking foundation.
 */
async function fetchToolUsageStats() {
  try {
    const { total } = await getTotalToolUsage();

    if (total === 0) {
      return {
        value: "0",
        state: "empty",
        label: "No operations logged yet",
      };
    }

    return {
      value: total.toLocaleString(),
      state: "success",
      label: total === 1 ? "1 operation logged" : `${total.toLocaleString()} operations logged`,
    };
  } catch (err) {
    console.error("fetchToolUsageStats exception:", err);
    return {
      value: "Unable to load",
      state: "error",
      label: "Tracking service offline",
    };
  }
}

/**
 * Inspect AI usage state.
 * Currently Rootixa has no AI processing backend configured.
 */
function getAiUsageStats() {
  return {
    value: "Not connected",
    state: "unavailable",
    label: "Tracking unavailable (AI not configured)",
  };
}

/**
 * Health check: Probe Next.js application runtime and Supabase database availability.
 */
async function probeSystemStatus() {
  const t0 = Date.now();
  try {
    const service = createServiceClient();
    const { error } = await service.from("admins").select("id", { count: "exact", head: true });
    const latency = Date.now() - t0;

    if (error && error.code !== "PGRST116") {
      return {
        value: "Degraded",
        state: "error",
        label: `Database connection error (${error.code || "unknown"})`,
        latencyMs: latency,
      };
    }

    return {
      value: "System Operational",
      state: "success",
      label: `App & Database healthy (~${latency}ms)`,
      latencyMs: latency,
    };
  } catch {
    return {
      value: "Degraded",
      state: "error",
      label: "Database unreachable",
      latencyMs: null,
    };
  }
}

/**
 * Aggregated server-side dashboard statistics loader.
 * Executes all checks in parallel with zero client bloat.
 */
export async function getAdminDashboardData() {
  const [usersRes, toolsRes, systemRes] = await Promise.all([
    fetchTotalUsers(),
    fetchToolUsageStats(),
    probeSystemStatus(),
  ]);

  const aiRes = getAiUsageStats();

  return {
    users: usersRes,
    toolUsage: toolsRes,
    aiUsage: aiRes,
    system: systemRes,
  };
}
