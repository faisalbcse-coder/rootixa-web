"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ToolLoadingOverlay } from "./tool-loading-overlay";

const ToolTransitionContext = createContext({
  openTool: () => {},
  isTransitioning: false,
});

export function ToolTransitionProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [toolName, setToolName] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparing your workspace");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const isCancelledRef = useRef(false);

  // Close overlay whenever pathname changes to the targetUrl
  useEffect(() => {
    if (isOpen && pathname === targetUrl) {
      // Destination reached
      const closeTimer = setTimeout(() => {
        setIsOpen(false);
        setProgress(100);
      }, 150);
      return () => clearTimeout(closeTimer);
    }
  }, [pathname, targetUrl, isOpen]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const runAnimation = useCallback(
    (name, url) => {
      isCancelledRef.current = false;
      setIsOpen(true);
      setToolName(name);
      setTargetUrl(url);
      setProgress(0);
      setHasError(false);
      setErrorMessage("");
      setStatusText("Preparing your workspace");

      // Start prefetching destination tool route immediately
      try {
        router.prefetch(url);
      } catch {
        // Ignore prefetch error
      }

      // Check prefers-reduced-motion
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const TOTAL_DURATION = prefersReducedMotion ? 200 : 3000; // 3 seconds target
      startTimeRef.current = performance.now();

      const animate = (currentTime) => {
        if (isCancelledRef.current) return;

        const elapsed = currentTime - startTimeRef.current;
        let currentProgress = 0;

        if (prefersReducedMotion) {
          currentProgress = Math.min(100, (elapsed / TOTAL_DURATION) * 100);
        } else {
          // 3-Stage Progression:
          // 0 to 2400ms: 0% -> 80% (first ~2.4s)
          // 2400 to 2800ms: 80% -> 95% (next ~0.4s)
          // 2800 to 3000ms: 95% -> 100% (final ~0.2s)
          if (elapsed <= 2400) {
            currentProgress = (elapsed / 2400) * 80;
            if (elapsed > 1200) setStatusText("Setting up components...");
          } else if (elapsed <= 2800) {
            currentProgress = 80 + ((elapsed - 2400) / 400) * 15;
            setStatusText("Optimizing workspace...");
          } else if (elapsed <= TOTAL_DURATION) {
            currentProgress = 95 + ((elapsed - 2800) / 200) * 5;
            setStatusText("Ready!");
          } else {
            currentProgress = 100;
          }
        }

        setProgress(currentProgress);

        if (elapsed < TOTAL_DURATION) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Completed progress
          setProgress(100);
          setStatusText("Opening...");

          // Navigate to destination tool
          try {
            router.push(url);
          } catch {
            setHasError(true);
            setErrorMessage("Failed to navigate to the selected tool.");
            return;
          }

          // Safety close fallback if router does not trigger pathname change (e.g. same page or hash)
          timeoutRef.current = setTimeout(() => {
            if (!isCancelledRef.current) {
              setIsOpen(false);
            }
          }, 600);
        }
      };

      // Watchdog timeout for navigation stalls
      timeoutRef.current = setTimeout(() => {
        if (!isCancelledRef.current && isOpen && progress < 100) {
          setHasError(true);
          setErrorMessage("Tool launch timed out. Please verify your connection.");
        }
      }, 9000);

      animFrameRef.current = requestAnimationFrame(animate);
    },
    [router, isOpen, progress]
  );

  const openTool = useCallback(
    (name, url) => {
      if (!url || url === "#") return;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      runAnimation(name, url);
    },
    [runAnimation]
  );

  const handleRetry = useCallback(() => {
    if (toolName && targetUrl) {
      runAnimation(toolName, targetUrl);
    }
  }, [toolName, targetUrl, runAnimation]);

  const handleCancel = useCallback(() => {
    isCancelledRef.current = true;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
    setProgress(0);
    setHasError(false);
  }, []);

  return (
    <ToolTransitionContext.Provider value={{ openTool, isTransitioning: isOpen }}>
      {children}
      <ToolLoadingOverlay
        isOpen={isOpen}
        toolName={toolName}
        progress={progress}
        statusText={statusText}
        hasError={hasError}
        errorMessage={errorMessage}
        onRetry={handleRetry}
        onCancel={handleCancel}
      />
    </ToolTransitionContext.Provider>
  );
}

export function useToolTransition() {
  return useContext(ToolTransitionContext);
}

/**
 * Drop-in replacement for tool links.
 * Preserves Ctrl/Cmd+click, middle click, and right click to open in new tab without hijacking.
 */
export function ToolLink({ href, toolName, children, className, onClick, ...props }) {
  const { openTool } = useToolTransition();

  const handleClick = (e) => {
    // If user is opening in a new tab or window, allow standard browser navigation
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    // If href is not a valid route, let default behavior happen
    if (!href || href === "#") {
      if (onClick) onClick(e);
      return;
    }

    e.preventDefault();
    if (onClick) onClick(e);
    openTool(toolName || "Tool", href);
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
