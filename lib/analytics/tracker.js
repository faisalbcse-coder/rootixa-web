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
    // Keep max 5000 recent pageViews in local JSON buffer to avoid unbounded growth
    if (store.pageViews.length > 5000) {
      store.pageViews = store.pageViews.slice(-5000);
    }
    fs.writeFileSync(LOCAL_STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write visitor analytics local store:", err);
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

  // 1. Dual Store: Update Local Store
  try {
    const store = readLocalStore();
    store.pageViews.push(viewEvent);

    // Update or create session
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

  // 2. Dual Store: Attempt writing to Supabase (if configured)
  try {
    const service = createServiceClient();
    await service.from("page_views").insert(viewEvent);

    // Upsert session in Supabase
    await service.from("visitor_sessions").upsert(
      {
        id: sessionId,
        visitor_id: visitorId,
        user_id: userId,
        entry_page: pagePath,
        exit_page: pagePath,
        traffic_source: trafficSource,
        utm_source: utmSource || null,
        utm_medium: utmMedium || null,
        utm_campaign: utmCampaign || null,
        device_category: deviceCategory,
        browser,
        os,
        country_code: countryCode,
        country_name: resolvedCountryName,
        last_activity_at: now,
      },
      { onConflict: "id" }
    );
  } catch {
    // Graceful fallback; local store guarantees tracking
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

  // Update local session
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

  // Attempt database update
  try {
    const service = createServiceClient();
    await service
      .from("visitor_sessions")
      .update({
        last_activity_at: now,
        exit_page: pagePath,
      })
      .eq("id", sessionId);
  } catch {}

  return { success: true };
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
