import fs from "fs";
import path from "path";
import { createServiceClient } from "@/lib/supabase/service";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_STORE_FILE = path.join(DATA_DIR, "tool-usage.json");

function ensureLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORE_FILE)) {
      fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify({ events: [] }, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to initialize local tool usage store:", err);
  }
}

function readLocalEvents() {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(LOCAL_STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.events) ? parsed.events : [];
  } catch {
    return [];
  }
}

function writeLocalEvent(event) {
  ensureLocalStore();
  try {
    const events = readLocalEvents();
    events.push(event);
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify({ events }, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write event to local store:", err);
  }
}

/**
 * Record a tool usage event across the platform.
 * Reusable by any Rootixa tool (QR code, PDF, Image Resizer, CV builder, etc.)
 */
export async function recordToolUsage({
  toolId,
  userId = null,
  status = "success",
  durationMs = 0,
}) {
  const event = {
    tool_id: String(toolId || "unknown"),
    user_id: userId || null,
    status: status === "failure" ? "failure" : "success",
    duration_ms: Math.max(0, Number(durationMs) || 0),
    created_at: new Date().toISOString(),
  };

  // Always write to local backup store to guarantee persistence
  writeLocalEvent(event);

  // Attempt to write to Supabase if configured and table exists
  try {
    const service = createServiceClient();
    await service.from("tool_usage").insert({
      tool_id: event.tool_id,
      user_id: event.user_id,
      status: event.status,
      duration_ms: event.duration_ms,
      created_at: event.created_at,
    });
  } catch {
    // Gracefully handled; local store guarantees counting
  }

  return { success: true, timestamp: event.created_at };
}

/**
 * Returns the total count of tool operations.
 * Prioritizes database count, falling back to the local tracking store.
 */
export async function getTotalToolUsage() {
  try {
    const service = createServiceClient();
    const { count, error } = await service
      .from("tool_usage")
      .select("*", { count: "exact", head: true });

    if (!error && typeof count === "number") {
      return { total: count, source: "database" };
    }
  } catch {
    // Database table not available or network error
  }

  // Fallback to resilient local tracking store
  const localEvents = readLocalEvents();
  return { total: localEvents.length, source: "local" };
}

/**
 * Returns tool operations count and recent history for a specific user.
 */
export async function getUserToolUsage(userId) {
  if (!userId) return { count: 0, events: [] };
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("tool_usage")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error && Array.isArray(data) && data.length > 0) {
      return { count: data.length, events: data };
    }
  } catch {
    // Fallback to local store
  }

  const localEvents = readLocalEvents().filter((e) => e.user_id === userId);
  return {
    count: localEvents.length,
    events: localEvents.slice(-10).reverse(),
  };
}

/**
 * Returns all logged tool usage events across database and local store.
 */
export async function getAllToolUsageEvents() {
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("tool_usage")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback to local store
  }

  return readLocalEvents();
}
