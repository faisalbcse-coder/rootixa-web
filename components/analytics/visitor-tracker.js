"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function generateId(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
}

// 30 minutes session inactivity timeout in ms
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function getOrCreateVisitorId() {
  if (typeof window === "undefined") return null;
  try {
    let vid = localStorage.getItem("rootixa_vid");
    if (!vid) {
      vid = generateId("vid");
      localStorage.setItem("rootixa_vid", vid);
    }
    return vid;
  } catch {
    return generateId("vid");
  }
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return null;
  try {
    const now = Date.now();
    const storedSession = sessionStorage.getItem("rootixa_sid");
    const lastActivity = Number(sessionStorage.getItem("rootixa_sid_last") || 0);

    if (storedSession && now - lastActivity < SESSION_TIMEOUT_MS) {
      sessionStorage.setItem("rootixa_sid_last", String(now));
      return storedSession;
    }

    // New session
    const newSid = generateId("sid");
    sessionStorage.setItem("rootixa_sid", newSid);
    sessionStorage.setItem("rootixa_sid_last", String(now));
    return newSid;
  } catch {
    return generateId("sid");
  }
}

export function VisitorTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef(null);
  const heartbeatTimer = useRef(null);

  useEffect(() => {
    if (!pathname) return;

    // Do not track executive CEO admin pages
    if (pathname.startsWith("/ceo") || pathname.startsWith("/api")) {
      return;
    }

    const currentUrl = `${pathname}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    if (lastTrackedPath.current === currentUrl) return;
    lastTrackedPath.current = currentUrl;

    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();

    if (!visitorId || !sessionId) return;

    const utmSource = searchParams?.get("utm_source") || "";
    const utmMedium = searchParams?.get("utm_medium") || "";
    const utmCampaign = searchParams?.get("utm_campaign") || "";
    const utmTerm = searchParams?.get("utm_term") || "";
    const utmContent = searchParams?.get("utm_content") || "";

    const payload = {
      type: "page_view",
      visitorId,
      sessionId,
      pagePath: pathname,
      pageTitle: typeof document !== "undefined" ? document.title : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    };

    // Send pageview
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon("/api/analytics/track", blob);
      } else {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Best-effort tracking, never break user experience
    }
  }, [pathname, searchParams]);

  // Periodic heartbeat while tab is active and visible (every 30 seconds)
  useEffect(() => {
    if (!pathname || pathname.startsWith("/ceo") || pathname.startsWith("/api")) {
      return;
    }

    const sendHeartbeat = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      const visitorId = getOrCreateVisitorId();
      const sessionId = getOrCreateSessionId();
      if (!visitorId || !sessionId) return;

      const payload = {
        type: "heartbeat",
        visitorId,
        sessionId,
        pagePath: pathname,
        activeDurationSeconds: 30,
      };

      try {
        fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {});
      } catch {}
    };

    heartbeatTimer.current = setInterval(sendHeartbeat, 30000);

    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
    };
  }, [pathname]);

  return null;
}
