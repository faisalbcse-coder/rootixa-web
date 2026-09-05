import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createServiceClient } from "@/lib/supabase/service";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

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
    console.error("Failed to initialize local feedback store:", err);
  }
}

function readLocalFeedbacks() {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(LOCAL_FEEDBACK_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.feedbacks) ? parsed.feedbacks : [];
  } catch {
    return [];
  }
}

function writeLocalFeedbacks(feedbacks) {
  ensureLocalStore();
  try {
    fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify({ feedbacks }, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write feedback to local store:", err);
  }
}

/**
 * Save user feedback across dual stores (Supabase + local resilient JSON).
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

  // Always write to local JSON store first
  const feedbacks = readLocalFeedbacks();
  feedbacks.unshift(record);
  writeLocalFeedbacks(feedbacks);

  // Attempt to write to Supabase if configured
  try {
    const service = createServiceClient();
    await service.from("feedback").insert({
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
  } catch {
    // Supabase table optional; fallback to local JSON
  }

  return { success: true, referenceId, feedback: record };
}

/**
 * Retrieve all feedbacks for Admin with optional status and category filters.
 */
export async function getAllFeedbacksForAdmin({ status = null, category = null } = {}) {
  // Try Supabase first
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
    // Fall back to local store
  }

  const list = readLocalFeedbacks();
  return list.filter((item) => {
    if (status && status !== "all" && item.status !== status) return false;
    if (category && category !== "all" && item.category !== category) return false;
    return true;
  });
}

/**
 * Admin Reply to Feedback: records reply, updates status, and logs timestamp.
 */
export async function replyToFeedback({
  feedbackId,
  adminReply,
  adminName = "Rootixa Admin",
  newStatus = "replied",
}) {
  const repliedAt = new Date().toISOString();
  const cleanReply = String(adminReply || "").trim();

  // Update in local JSON
  const feedbacks = readLocalFeedbacks();
  const index = feedbacks.findIndex((f) => f.id === feedbackId);
  let updatedRecord = null;

  if (index !== -1) {
    feedbacks[index] = {
      ...feedbacks[index],
      admin_reply: cleanReply,
      admin_name: adminName,
      replied_at: repliedAt,
      status: newStatus,
    };
    updatedRecord = feedbacks[index];
    writeLocalFeedbacks(feedbacks);
  }

  // Update in Supabase
  try {
    const service = createServiceClient();
    await service
      .from("feedback")
      .update({
        admin_reply: cleanReply,
        admin_name: adminName,
        replied_at: repliedAt,
        status: newStatus,
      })
      .eq("id", feedbackId);
  } catch {
    // Graceful fallback
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
    // Fall back to local store
  }

  const list = readLocalFeedbacks();
  const filtered = category ? list.filter((item) => item.category === category) : list;
  return filtered.slice(0, limit);
}
