import { NextResponse } from "next/server";
import { recordPageView, recordHeartbeat } from "@/lib/analytics/tracker";

/**
 * Lightweight User-Agent parser for device, browser, and OS detection.
 */
function parseUserAgent(ua = "") {
  const uaLower = ua.toLowerCase();

  // 1. Device category
  let deviceCategory = "Desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceCategory = "Tablet";
  } else if (
    /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    deviceCategory = "Mobile";
  }

  // 2. Browser
  let browser = "Other";
  if (uaLower.includes("edg/")) browser = "Edge";
  else if (uaLower.includes("chrome/") && !uaLower.includes("edg/")) browser = "Chrome";
  else if (uaLower.includes("safari/") && !uaLower.includes("chrome/")) browser = "Safari";
  else if (uaLower.includes("firefox/")) browser = "Firefox";
  else if (uaLower.includes("opr/") || uaLower.includes("opera/")) browser = "Opera";

  // 3. Operating System
  let os = "Other";
  if (uaLower.includes("windows")) os = "Windows";
  else if (uaLower.includes("android")) os = "Android";
  else if (uaLower.includes("iphone") || uaLower.includes("ipad") || uaLower.includes("ipod")) os = "iOS";
  else if (uaLower.includes("mac os") || uaLower.includes("macintosh")) os = "macOS";
  else if (uaLower.includes("linux")) os = "Linux";

  return { deviceCategory, browser, os };
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      type = "page_view",
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
      activeDurationSeconds = 15,
    } = body;

    // Do not track executive console routes
    if (pagePath && (pagePath.startsWith("/ceo") || pagePath.startsWith("/api"))) {
      return NextResponse.json({ success: false, ignored: true });
    }

    if (!visitorId || !sessionId) {
      return NextResponse.json({ error: "visitorId and sessionId are required" }, { status: 400 });
    }

    if (type === "heartbeat") {
      await recordHeartbeat({
        visitorId,
        sessionId,
        pagePath,
        activeDurationSeconds,
      });
      return NextResponse.json({ success: true });
    }

    // Extract headers for approximate geolocation and client classification
    const headers = request.headers;
    const userAgent = headers.get("user-agent") || "";
    const { deviceCategory, browser, os } = parseUserAgent(userAgent);

    // Approximate geolocation from edge CDN headers (NEVER storing raw IP)
    const countryCode =
      headers.get("x-vercel-ip-country") ||
      headers.get("cf-ipcountry") ||
      headers.get("x-country-code") ||
      "Unknown";

    const region = headers.get("x-vercel-ip-country-region") || "";
    const city = headers.get("x-vercel-ip-city") || "";

    const result = await recordPageView({
      visitorId,
      sessionId,
      userId,
      pagePath: pagePath || "/",
      pageTitle,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      deviceCategory,
      browser,
      os,
      countryCode,
      region,
      city,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error processing visitor analytics event:", err);
    return NextResponse.json({ error: "Failed to process analytics event" }, { status: 500 });
  }
}
