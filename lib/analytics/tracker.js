import "server-only";

import fs from "fs";
import path from "path";
import { createServiceClient } from "@/lib/supabase/service";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_STORE_FILE = path.join(DATA_DIR, "visitor-analytics.json");

// Ensure local persistence store exists
function ensureLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOCAL_STORE_FILE)) {
      fs.writeFileSync(
        LOCAL_STORE_FILE,
        JSON.stringify({ pageViews: [], sessions: {} }, null, 2),
        "utf8"
      );
    }
  } catch (err) {
    console.error("Failed to initialize visitor analytics local store:", err);
  }
}

function readLocalStore() {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(LOCAL_STORE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return {
      pageViews: Array.isArray(parsed.pageViews) ? parsed.pageViews : [],
      sessions: parsed.sessions && typeof parsed.sessions === "object" ? parsed.sessions : {},
    };
  } catch {
    return { pageViews: [], sessions: {} };
  }
}

function writeLocalStore(store) {
  ensureLocalStore();
  try {
    if (store.pageViews.length > 5000) {
      store.pageViews = store.pageViews.slice(-5000);
    }
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    // Gracefully handle read-only filesystems on serverless environments
  }
}

/**
 * Categorize referrer string into a standardized traffic channel.
 */
export function categorizeReferrer(referrer, utmSource = null) {
  if (utmSource) {
    const src = utmSource.toLowerCase().trim();
    if (src.includes("google")) return "Google / Organic Search";
    if (src.includes("facebook") || src.includes("fb")) return "Facebook";
    if (src.includes("youtube")) return "YouTube";
    if (src.includes("twitter") || src === "x") return "Twitter / X";
    if (src.includes("linkedin")) return "LinkedIn";
    if (src.includes("newsletter") || src.includes("email")) return "Email / Newsletter";
    return utmSource;
  }

  if (!referrer || referrer === "" || referrer === "direct") {
    return "Direct";
  }

  try {
    const parsed = new URL(referrer);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("rootixa.com") || host.includes("localhost") || host.includes("vercel.app")) {
      return "Direct";
    }
    if (host.includes("google.")) return "Google / Organic Search";
    if (host.includes("bing.") || host.includes("yahoo.") || host.includes("duckduckgo.") || host.includes("ecosia.")) {
      return "Other Search";
    }
    if (host.includes("facebook.") || host.includes("fb.com")) return "Facebook";
    if (host.includes("youtube.") || host.includes("youtu.be")) return "YouTube";
    if (host.includes("twitter.") || host.includes("t.co") || host.includes("x.com")) return "Twitter / X";
    if (host.includes("linkedin.") || host.includes("lnkd.in")) return "LinkedIn";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("reddit.")) return "Reddit";

    return `Referral (${host.replace(/^www\./, "")})`;
  } catch {
    return "Referral";
  }
}

/**
 * Country code to friendly English name helper.
 */
export function getCountryName(code) {
  if (!code || code === "Unknown" || code === "XX") return "Unknown Location";
  const map = {
    BD: "Bangladesh",
    SA: "Saudi Arabia",
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    IN: "India",
    PK: "Pakistan",
    AE: "United Arab Emirates",
    MY: "Malaysia",
    SG: "Singapore",
    QA: "Qatar",
    KW: "Kuwait",
    OM: "Oman",
    DE: "Germany",
    FR: "France",
    AU: "Australia",
    IT: "Italy",
    JP: "Japan",
    KR: "South Korea",
    BR: "Brazil",
    NL: "Netherlands",
    SE: "Sweden",
    TR: "Turkey",
    EG: "Egypt",
  };
  return map[code.toUpperCase()] || code.toUpperCase();
}

/**
 * Format timestamp relative to now (e.g. "Just now", "2m ago")
 */
export function formatRelativeTime(date) {
  if (!date) return "Just now";
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
 * Record a page view event across Rootixa.
 */
export async function recordPageView({
  visitorId,
  sessionId,
  userId = null,
  pagePath,
  pageTitle = "",
  referrer = "",
  utmSource = "",
  utmMedium = "",
  utmCampaign = "",
  utmTerm = "",
  utmContent = "",
  deviceCategory = "Desktop",
  browser = "Other",
  os = "Other",
  countryCode = "Unknown",
  countryName = "",
  region = "",
  city = "",
}) {
  const now = new Date().toISOString();
  const trafficSource = categorizeReferrer(referrer, utmSource);
  const resolvedCountryName = countryName || getCountryName(countryCode);

  const viewEvent = {
    visitor_id: String(visitorId || "anon"),
    session_id: String(sessionId || "sess"),
    user_id: userId || null,
    page_path: String(pagePath || "/"),
    page_title: String(pageTitle || ""),
    referrer: String(referrer || ""),
    traffic_source: trafficSource,
    utm_source: utmSource || null,
    utm_medium: utmMedium || null,
    utm_campaign: utmCampaign || null,
    utm_term: utmTerm || null,
    utm_content: utmContent || null,
    device_category: deviceCategory || "Desktop",
    browser: browser || "Other",
    os: os || "Other",
    country_code: countryCode || "Unknown",
    country_name: resolvedCountryName,
    region: region || null,
    city: city || null,
    duration_seconds: 0,
    created_at: now,
  };

  // 1. Update Local Store
  try {
    const store = readLocalStore();
    store.pageViews.push(viewEvent);

    let session = store.sessions[sessionId];
    const isNewVisitor = !Object.values(store.sessions).some(
      (s) => s.visitor_id === visitorId && s.id !== sessionId
    );

    if (!session) {
      session = {
        id: sessionId,
        visitor_id: visitorId,
        user_id: userId,
        is_new_visitor: isNewVisitor,
        entry_page: pagePath,
        exit_page: pagePath,
        page_views_count: 1,
        duration_seconds: 0,
        traffic_source: trafficSource,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        device_category: deviceCategory,
        browser,
        os,
        country_code: countryCode,
        country_name: resolvedCountryName,
        pages_visited: [pagePath],
        started_at: now,
        last_activity_at: now,
      };
    } else {
      session.page_views_count = (session.page_views_count || 1) + 1;
      session.exit_page = pagePath;
      session.last_activity_at = now;
      if (!session.pages_visited) session.pages_visited = [session.entry_page];
      session.pages_visited.push(pagePath);
    }
    store.sessions[sessionId] = session;
    writeLocalStore(store);
  } catch (err) {
    console.error("Local page view logging error:", err);
  }

  // 2. Write to Supabase (Remote DB)
  try {
    const service = createServiceClient();
    await service.from("page_views").insert(viewEvent);

    // Check if session exists in Supabase
    const { data: existingSession } = await service
      .from("visitor_sessions")
      .select("id, page_views_count, entry_page")
      .eq("id", sessionId)
      .maybeSingle();

    if (!existingSession) {
      await service.from("visitor_sessions").insert({
        id: sessionId,
        visitor_id: visitorId,
        user_id: userId,
        is_new_visitor: true,
        entry_page: pagePath || "/",
        exit_page: pagePath || "/",
        page_views_count: 1,
        duration_seconds: 0,
        traffic_source: trafficSource,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        device_category: deviceCategory,
        browser,
        os,
        country_code: countryCode,
        country_name: resolvedCountryName,
        started_at: now,
        last_activity_at: now,
      });
    } else {
      await service
        .from("visitor_sessions")
        .update({
          exit_page: pagePath || "/",
          page_views_count: (existingSession.page_views_count || 1) + 1,
          last_activity_at: now,
        })
        .eq("id", sessionId);
    }
  } catch (err) {
    console.warn("Supabase page_view insert warning:", err);
  }

  return { success: true, timestamp: now };
}

/**
 * Record a heartbeat to update session activity & duration.
 */
export async function recordHeartbeat({
  visitorId,
  sessionId,
  pagePath,
  activeDurationSeconds = 15,
}) {
  const now = new Date().toISOString();

  // 1. Update local store
  try {
    const store = readLocalStore();
    const session = store.sessions[sessionId];
    if (session) {
      session.last_activity_at = now;
      session.duration_seconds = (session.duration_seconds || 0) + Number(activeDurationSeconds || 0);
      if (pagePath) session.exit_page = pagePath;
      store.sessions[sessionId] = session;
      writeLocalStore(store);
    }
  } catch (err) {
    console.error("Local heartbeat update error:", err);
  }

  // 2. Update Supabase
  try {
    const service = createServiceClient();
    const { data: existing } = await service
      .from("visitor_sessions")
      .select("id, duration_seconds")
      .eq("id", sessionId)
      .maybeSingle();

    if (existing) {
      await service
        .from("visitor_sessions")
        .update({
          last_activity_at: now,
          exit_page: pagePath,
          duration_seconds: (existing.duration_seconds || 0) + Number(activeDurationSeconds || 0),
        })
        .eq("id", sessionId);
    } else {
      await service.from("visitor_sessions").insert({
        id: sessionId,
        visitor_id: visitorId,
        entry_page: pagePath || "/",
        exit_page: pagePath || "/",
        page_views_count: 1,
        duration_seconds: Number(activeDurationSeconds || 0),
        started_at: now,
        last_activity_at: now,
      });
    }
  } catch (err) {
    console.warn("Supabase heartbeat update warning:", err);
  }

  return { success: true };
}

/**
 * Returns real-time active visitors (active within last 2.5 minutes).
 */
export async function getLiveVisitors() {
  const thresholdMs = Date.now() - 150 * 1000;
  const thresholdIso = new Date(thresholdMs).toISOString();

  let sessions = [];
  try {
    const service = createServiceClient();
    const { data, error } = await service
      .from("visitor_sessions")
      .select("*")
      .gte("last_activity_at", thresholdIso)
      .order("last_activity_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      sessions = data;
    }
  } catch (err) {
    console.warn("Live visitors DB query:", err);
  }

  // Fallback to local store if DB returns empty
  if (sessions.length === 0) {
    const local = readLocalStore();
    sessions = Object.values(local.sessions || {}).filter((s) => {
      const t = new Date(s.last_activity_at || s.started_at).getTime();
      return t >= thresholdMs;
    });
  }

  const list = sessions.map((s) => ({
    id: s.id,
    countryCode: s.country_code || "Unknown",
    countryName: s.country_name || getCountryName(s.country_code),
    currentPage: s.exit_page || s.entry_page || "/",
    deviceCategory: s.device_category || "Desktop",
    lastActiveFormatted: formatRelativeTime(s.last_activity_at || s.started_at),
  }));

  return {
    count: list.length,
    list,
  };
}

/**
 * Returns all raw page views and sessions across DB and local store.
 */
export async function getVisitorEventsAndSessions() {
  let dbPageViews = null;
  let dbSessions = null;

  try {
    const service = createServiceClient();
    const [viewsRes, sessionsRes] = await Promise.all([
      service
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20000),
      service
        .from("visitor_sessions")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(10000),
    ]);

    if (!viewsRes.error && Array.isArray(viewsRes.data) && viewsRes.data.length > 0) {
      dbPageViews = viewsRes.data;
    }
    if (!sessionsRes.error && Array.isArray(sessionsRes.data) && sessionsRes.data.length > 0) {
      dbSessions = sessionsRes.data;
    }
  } catch {
    // Fallback to local store
  }

  const localStore = readLocalStore();
  const pageViews = dbPageViews || localStore.pageViews || [];
  const sessions = dbSessions || Object.values(localStore.sessions || {});

  return { pageViews, sessions };
}
