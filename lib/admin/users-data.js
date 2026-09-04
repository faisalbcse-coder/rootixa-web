import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import { getUserToolUsage } from "@/lib/tools/tracker";

/**
 * Determine whether a Supabase Auth user is inactive.
 * Considers both ban timestamp and app_metadata status.
 */
export function isUserInactive(u) {
  if (!u) return false;
  const isBanned = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
  const isMarkedInactive = u.app_metadata?.status === "inactive";
  return isBanned || isMarkedInactive;
}

/**
 * Compute real user statistics across the entire user base.
 */
export async function getUserStats() {
  try {
    const service = createServiceClient();
    const { data, error } = await service.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error || !data) {
      console.error("Error fetching user stats:", error?.message);
      return {
        total: { value: "—", label: "Failed to load", state: "error" },
        active: { value: "—", label: "Failed to load", state: "error" },
        inactive: { value: "—", label: "Failed to load", state: "error" },
        newUsers: { value: "—", label: "Failed to load", state: "error" },
      };
    }

    const users = data.users || [];
    const totalCount = typeof data.total === "number" ? data.total : users.length;
    let activeCount = 0;
    let inactiveCount = 0;
    let newCount = 0;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    for (const u of users) {
      if (isUserInactive(u)) {
        inactiveCount++;
      } else {
        activeCount++;
      }

      if (u.created_at && new Date(u.created_at).getTime() >= sevenDaysAgo) {
        newCount++;
      }
    }

    return {
      total: {
        value: totalCount.toLocaleString(),
        label: `${totalCount} registered account${totalCount === 1 ? "" : "s"}`,
        state: "success",
      },
      active: {
        value: activeCount.toLocaleString(),
        label: `${activeCount} enabled user${activeCount === 1 ? "" : "s"}`,
        state: "success",
      },
      inactive: {
        value: inactiveCount.toLocaleString(),
        label: `${inactiveCount} suspended/banned`,
        state: "success",
      },
      newUsers: {
        value: newCount.toLocaleString(),
        label: `${newCount} joined this week`,
        state: "success",
      },
    };
  } catch (err) {
    console.error("Exception calculating user stats:", err);
    return {
      total: { value: "—", label: "Service error", state: "error" },
      active: { value: "—", label: "Service error", state: "error" },
      inactive: { value: "—", label: "Service error", state: "error" },
      newUsers: { value: "—", label: "Service error", state: "error" },
    };
  }
}

/**
 * Fetch, filter, sort, and paginate users with tool usage enrichment.
 * Sanitizes all output to ensure zero secrets or sensitive auth hashes are leaked.
 */
export async function getUsersList({
  page = 1,
  perPage = 20,
  search = "",
  status = "all",
  sort = "newest",
} = {}) {
  try {
    const service = createServiceClient();
    const { data, error } = await service.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (error || !data) {
      console.error("Error fetching users list:", error?.message);
      return {
        items: [],
        total: 0,
        totalPages: 1,
        page: 1,
        perPage,
        error: "Unable to load users. Please try again.",
      };
    }

    // Sanitize user records
    let records = (data.users || []).map((u) => {
      const name =
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        (u.email ? u.email.split("@")[0] : "Unnamed User");

      return {
        id: u.id,
        email: u.email || "No email",
        name,
        avatarUrl: u.user_metadata?.avatar_url || null,
        status: isUserInactive(u) ? "inactive" : "active",
        joinedAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
        bannedUntil: u.banned_until || null,
        emailVerified: Boolean(u.user_metadata?.email_verified || u.email_confirmed_at),
        phone: u.phone || null,
      };
    });

    // 1. Search filtering
    const cleanSearch = String(search || "").trim().toLowerCase();
    if (cleanSearch) {
      records = records.filter(
        (r) =>
          r.name.toLowerCase().includes(cleanSearch) ||
          r.email.toLowerCase().includes(cleanSearch) ||
          r.id.toLowerCase().includes(cleanSearch)
      );
    }

    // 2. Status filtering
    if (status === "active") {
      records = records.filter((r) => r.status === "active");
    } else if (status === "inactive") {
      records = records.filter((r) => r.status === "inactive");
    }

    // 3. Sorting
    records.sort((a, b) => {
      if (sort === "oldest") {
        return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
      }
      if (sort === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sort === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      // Default: "newest"
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    });

    const total = records.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const validPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
    const start = (validPage - 1) * perPage;
    const pagedItems = records.slice(start, start + perPage);

    // Enrich current page items with tool usage
    const enrichedItems = await Promise.all(
      pagedItems.map(async (item) => {
        const usage = await getUserToolUsage(item.id);
        return {
          ...item,
          toolUsageCount: usage.count,
        };
      })
    );

    return {
      items: enrichedItems,
      total,
      totalPages,
      page: validPage,
      perPage,
      error: null,
    };
  } catch (err) {
    console.error("Exception in getUsersList:", err);
    return {
      items: [],
      total: 0,
      totalPages: 1,
      page: 1,
      perPage,
      error: "Failed to retrieve users due to an unexpected error.",
    };
  }
}

/**
 * Fetch detailed user metadata and tool activity for the user details modal.
 */
export async function getUserDetails(userId) {
  if (!userId) return null;
  try {
    const service = createServiceClient();
    const { data, error } = await service.auth.admin.getUserById(userId);

    if (error || !data?.user) {
      return null;
    }

    const u = data.user;
    const usage = await getUserToolUsage(u.id);

    return {
      id: u.id,
      email: u.email || "No email",
      name:
        u.user_metadata?.full_name ||
        u.user_metadata?.name ||
        (u.email ? u.email.split("@")[0] : "Unnamed User"),
      avatarUrl: u.user_metadata?.avatar_url || null,
      status: isUserInactive(u) ? "inactive" : "active",
      joinedAt: u.created_at,
      lastSignInAt: u.last_sign_in_at || null,
      bannedUntil: u.banned_until || null,
      emailVerified: Boolean(u.user_metadata?.email_verified || u.email_confirmed_at),
      phone: u.phone || null,
      appMetadata: {
        provider: u.app_metadata?.provider || "email",
        providers: u.app_metadata?.providers || ["email"],
      },
      toolUsage: {
        totalOperations: usage.count,
        recentOperations: usage.events,
      },
    };
  } catch (err) {
    console.error("Exception in getUserDetails:", err);
    return null;
  }
}
