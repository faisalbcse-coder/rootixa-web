"use client";

import { useState, useRef, useEffect } from "react";
import { LayoutTemplate } from "lucide-react";
import { CVDocument } from "./cv-document";

export function CVPreview({
  cvData,
  onOpenTemplates,
  activeTemplateName = "Modern",
}) {
  const containerRef = useRef(null);
  const docRef = useRef(null);
  const [zoom, setZoom] = useState(0.85);

  // Auto-fit to container width so standard A4 fits smoothly without horizontal overflow
  useEffect(() => {
    const computeFitScale = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.clientWidth - 48; // padding
      const docWidth = 794; // Standard A4 width in px

      if (containerWidth < docWidth) {
        const targetScale = Math.max(0.35, Math.min(1, containerWidth / docWidth));
        setZoom(Number(targetScale.toFixed(2)));
      } else {
        setZoom(0.9);
      }
    };

    computeFitScale();
    window.addEventListener("resize", computeFitScale);
    return () => window.removeEventListener("resize", computeFitScale);
  }, []);

  return (
    <div className="flex flex-col h-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 overflow-hidden shadow-xs">
      {/* ─── Clean Header: Template Selector ONLY ─── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs tracking-tight">
          Preview
        </span>

        {/* The ONLY Template Change Option */}
        {onOpenTemplates && (
          <button
            type="button"
            onClick={onOpenTemplates}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition cursor-pointer shadow-2xs group"
            title="Change CV template design"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span>Template:</span>
            <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-black">
              {activeTemplateName || "Modern"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Change ▾</span>
          </button>
        )}
      </div>

      {/* ─── Scrollable Document Canvas Viewport ─── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start scroll-smooth"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div
          style={{
            width: `${794 * zoom}px`,
            transition: "width 0.15s ease-out",
          }}
          className="mx-auto"
        >
          <div
            ref={docRef}
            style={{
              width: "794px",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
            }}
          >
            <CVDocument cvData={cvData} />
          </div>
        </div>
      </div>
    </div>
  );
}
