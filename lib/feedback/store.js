import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");
const CLOUD_STORAGE_BUCKET = "feedback_store";
const CLOUD_STORAGE_FILE = "feedbacks.json";

function ensureLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_FEEDBACK_FILE)) {
      fs.writeFileSync(
        LOCAL_FEEDBACK_FILE,
        JSON.stringify({ feedbacks: [] }, null, 2),
        "utf8"
      );
    }
  } catch (err) {
    // Read-only filesystem in serverless environments
  }
}

function readLocalFeedbacks() {
  try {
    ensureLocalStore();
    if (fs.existsSync(LOCAL_FEEDBACK_FILE)) {
      const raw = fs.readFileSync(LOCAL_FEEDBACK_FILE, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed.feedbacks) ? parsed.feedbacks : [];
    }
  } catch {
    // Ignore local read errors in serverless
  }
  return [];
}

function writeLocalFeedbacks(feedbacks) {
  try {
    ensureLocalStore();
    fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify({ feedbacks }, null, 2), "utf8");
  } catch {
    // Non-fatal if filesystem is read-only (e.g. Vercel)
  }
}

async function readCloudStorageFeedbacks() {
  try {
    const service = createServiceClient();
    const { data: blob, error } = await service.storage
      .from(CLOUD_STORAGE_BUCKET)
      .download(CLOUD_STORAGE_FILE);

    if (!error && blob) {
      const text = await blob.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.feedbacks)) {
        return parsed.feedbacks;
      }
    }
  } catch (err) {
    // Cloud storage read warning
  }
  return [];
}

async function writeCloudStorageFeedbacks(feedbacks) {
  try {
    const service = createServiceClient();
    await service.storage
      .from(CLOUD_STORAGE_BUCKET)
      .upload(CLOUD_STORAGE_FILE, JSON.stringify({ feedbacks }, null, 2), {
        upsert: true,
        contentType: "application/json",
      });
    return true;
  } catch (err) {
    console.warn("Failed to sync feedbacks to Supabase storage:", err);
    return false;
  }
}

/**
 * Save user feedback across 3 resilient tiers:
 * 1. Supabase Postgres table (if created)
 * 2. Supabase Cloud Storage (primary cloud persistence for Vercel/serverless)
 * 3. Local resilient JSON (for offline local development)
 */
export async function saveFeedback({
  category = "suggestion",
  rating = 5,
  tool_name = "General",
  title = "",
  message,
  user_name = "Community Member",
  user_email,
  device_info = "",
  wants_reply = true,
  attachment = null,
}) {
  const referenceId = `RTX-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const cleanTitle = title && title.trim().length > 0 
    ? title.trim() 
    : (message.trim().slice(0, 50) + (message.length > 50 ? "..." : ""));

  const record = {
    id: referenceId,
    category: ["suggestion", "bug", "review", "inquiry"].includes(category) ? category : "suggestion",
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    tool_name: String(tool_name || "General").trim(),
    title: cleanTitle,
    message: String(message || "").trim(),
    user_name: String(user_name || "Community Member").trim(),
    user_email: String(user_email || "").trim(),
    device_info: String(device_info || "").trim(),
    wants_reply: Boolean(wants_reply),
    attachment: attachment && typeof attachment === "object" ? attachment : null,
    status: "pending",
    admin_reply: null,
    admin_name: null,
    replied_at: null,
    created_at: new Date().toISOString(),
  };

  // Tier 1: Try Postgres table insert
  let savedToPostgres = false;
  try {
    const service = createServiceClient();
    const { error: dbError } = await service.from("feedback").insert({
      id: record.id,
      category: record.category,
      rating: record.rating,
      tool_name: record.tool_name,
      title: record.title,
      message: record.message,
      user_name: record.user_name,
      user_email: record.user_email,
      device_info: record.device_info || null,
      wants_reply: record.wants_reply,
      attachment: record.attachment,
      status: record.status,
      created_at: record.created_at,
    });
    if (!dbError) {
      savedToPostgres = true;
    }
  } catch {
    // Postgres table may not be migrated yet
  }

  // Tier 2: Cloud Storage sync (guarantees cross-serverless persistence on Vercel)
  try {
    const cloudList = await readCloudStorageFeedbacks();
    cloudList.unshift(record);
    await writeCloudStorageFeedbacks(cloudList);
  } catch (err) {
    console.warn("Cloud storage sync failed in saveFeedback:", err);
  }

  // Tier 3: Local file system write (for local offline dev)
  try {
    const localFeedbacks = readLocalFeedbacks();
    localFeedbacks.unshift(record);
    writeLocalFeedbacks(localFeedbacks);
  } catch {
    // Ignore read-only filesystem
  }

  return { success: true, referenceId, feedback: record };
}

/**
 * Retrieve all feedbacks for Admin with optional status and category filters.
 * Queries Postgres first, falls back to Supabase Cloud Storage, then to local store.
 */
export async function getAllFeedbacksForAdmin({ status = null, category = null } = {}) {
  // 1. Try Postgres DB
  try {
    const service = createServiceClient();
    let query = service
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fall back to Cloud Storage
  }

  // 2. Try Supabase Cloud Storage
  try {
    const cloudFeedbacks = await readCloudStorageFeedbacks();
    if (cloudFeedbacks.length > 0) {
      return cloudFeedbacks.filter((item) => {
        if (status && status !== "all" && item.status !== status) return false;
        if (category && category !== "all" && item.category !== category) return false;
        return true;
      });
    }
  } catch {
    // Fall back to local store
  }

  // 3. Try Local Store
  const localList = readLocalFeedbacks();
  return localList.filter((item) => {
    if (status && status !== "all" && item.status !== status) return false;
    if (category && category !== "all" && item.category !== category) return false;
    return true;
  });
}

/**
 * Admin Reply to Feedback: records reply, updates status, and logs timestamp across all tiers.
 */
export async function replyToFeedback({
  feedbackId,
  adminReply,
  adminName = "Rootixa Admin",
  newStatus = "replied",
}) {
  const repliedAt = new Date().toISOString();
  const cleanReply = String(adminReply || "").trim();
  let updatedRecord = null;

  // 1. Update in Postgres DB
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("feedback")
      .update({
        admin_reply: cleanReply,
        admin_name: adminName,
        replied_at: repliedAt,
        status: newStatus,
      })
      .eq("id", feedbackId)
      .select()
      .single();

    if (!error && data) {
      updatedRecord = data;
    }
  } catch {
    // Fall back
  }

  // 2. Update in Cloud Storage
  try {
    const cloudFeedbacks = await readCloudStorageFeedbacks();
    const cIdx = cloudFeedbacks.findIndex((f) => f.id === feedbackId);
    if (cIdx !== -1) {
      cloudFeedbacks[cIdx] = {
        ...cloudFeedbacks[cIdx],
        admin_reply: cleanReply,
        admin_name: adminName,
        replied_at: repliedAt,
        status: newStatus,
      };
      if (!updatedRecord) updatedRecord = cloudFeedbacks[cIdx];
      await writeCloudStorageFeedbacks(cloudFeedbacks);
    }
  } catch (err) {
    console.warn("Failed to update reply in cloud storage:", err);
  }

  // 3. Update in Local Store
  try {
    const localFeedbacks = readLocalFeedbacks();
    const lIdx = localFeedbacks.findIndex((f) => f.id === feedbackId);
    if (lIdx !== -1) {
      localFeedbacks[lIdx] = {
        ...localFeedbacks[lIdx],
        admin_reply: cleanReply,
        admin_name: adminName,
        replied_at: repliedAt,
        status: newStatus,
      };
      if (!updatedRecord) updatedRecord = localFeedbacks[lIdx];
      writeLocalFeedbacks(localFeedbacks);
    }
  } catch {
    // Ignore read-only filesystem
  }

  return {
    success: true,
    feedback: updatedRecord,
  };
}

/**
 * Retrieve recent feedbacks for display on public pages.
 */
export async function getRecentFeedbacks({ limit = 10, category = null } = {}) {
  // 1. Try Postgres DB
  try {
    const service = createServiceClient();
    let query = service
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fall back
  }

  // 2. Try Cloud Storage
  try {
    const cloudFeedbacks = await readCloudStorageFeedbacks();
    if (cloudFeedbacks.length > 0) {
      const filtered = category ? cloudFeedbacks.filter((item) => item.category === category) : cloudFeedbacks;
      return filtered.slice(0, limit);
    }
  } catch {
    // Fall back
  }

  // 3. Try Local Store
  const localList = readLocalFeedbacks();
  const filtered = category ? localList.filter((item) => item.category === category) : localList;
  return filtered.slice(0, limit);
}
