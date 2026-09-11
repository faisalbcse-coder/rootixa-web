"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  LayoutTemplate,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Sparkles,
  ChevronDown,
  Layers,
} from "lucide-react";
import { CVDocument } from "./cv-document";
import { TEMPLATES } from "./templates/template-registry";
import { getPreviewCVData } from "./templates/template-helpers";

export function CVPreview({
  cvData,
  activeTemplateName = "Modern",
  selectedTemplateId = "tech_modern",
  onSelectTemplate,
  onOpenTemplates,
}) {
  const containerRef = useRef(null);
  const docRef = useRef(null);
  const dropdownRef = useRef(null);

  const [zoom, setZoom] = useState(0.8);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Rich preview data: guarantees full layout visibility even if user hasn't typed all sections yet
  const displayData = useMemo(() => getPreviewCVData(cvData), [cvData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsTemplateMenuOpen(false);
      }
    };
    if (isTemplateMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isTemplateMenuOpen]);

  // Auto-fit scale to container width
  const computeFitScale = useCallback(() => {
    if (!containerRef.current) return;
    const rawWidth = containerRef.current.clientWidth;
    if (rawWidth < 100) return; // Layout not settled yet

    const containerWidth = rawWidth - 48; // padding
    const docWidth = 794; // Standard A4 width in px

    if (containerWidth < docWidth) {
      const targetScale = Math.max(0.4, Math.min(1, containerWidth / docWidth));
      setZoom(Number(targetScale.toFixed(2)));
    } else {
      setZoom(0.85);
    }
  }, []);

  // Compute on mount and container resize
  useEffect(() => {
    computeFitScale();

    const el = containerRef.current;
    if (!el) return;

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => computeFitScale());
      ro.observe(el);
    }

    window.addEventListener("resize", computeFitScale);
    return () => {
      window.removeEventListener("resize", computeFitScale);
      if (ro) ro.disconnect();
    };
  }, [computeFitScale]);

  const handleZoomIn = () => setZoom((prev) => Math.min(1.3, Number((prev + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))));

  return (
    <div className="flex flex-col h-full rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/60 overflow-hidden shadow-xs">
      {/* ─── Clean Header: Template Switcher & Quick Controls ─── */}
      <div className="relative flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-xs shrink-0 z-20">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs tracking-tight">
            Preview
          </span>
          {displayData._isSamplePreview && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Template Demo</span>
            </span>
          )}
        </div>

        {/* ─── Right: Template Selector & Zoom Controls ─── */}
        <div className="flex items-center gap-2">
          {/* Zoom In / Out / Reset */}
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom out"
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[11px] font-mono font-bold min-w-[34px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom in"
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={computeFitScale}
              title="Fit to screen"
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition cursor-pointer text-[10px] font-bold"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* ─── One-Click Template Switcher Dropdown ─── */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsTemplateMenuOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold transition cursor-pointer shadow-2xs group"
              title="Change CV template design"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>Template:</span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 font-black">
                {activeTemplateName || "Modern"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition group-hover:translate-y-0.5" />
            </button>

            {/* Template Dropdown Menu */}
            {isTemplateMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 max-h-[75vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    Select Template
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {TEMPLATES.length} Designs
                  </span>
                </div>

                <div className="py-1 space-y-1">
                  {TEMPLATES.map((tmpl) => {
                    const isSelected = selectedTemplateId === tmpl.id;
                    return (
                      <button
                        key={tmpl.id}
                        type="button"
                        onClick={() => {
                          onSelectTemplate?.(tmpl.id);
                          setIsTemplateMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition cursor-pointer ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                        }`}
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {tmpl.name}
                            </span>
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {tmpl.badge}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {tmpl.tagline}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {onOpenTemplates && (
                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsTemplateMenuOpen(false);
                        onOpenTemplates();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition cursor-pointer shadow-xs"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Browse All in Large Carousel</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
            minHeight: `${1123 * zoom}px`,
            height: `${1123 * zoom}px`,
            transition: "width 0.15s ease-out, min-height 0.15s ease-out, height 0.15s ease-out",
          }}
          className="mx-auto relative shrink-0"
        >
          <div
            ref={docRef}
            style={{
              width: "794px",
              minHeight: "1123px",
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              transition: "transform 0.15s ease-out",
            }}
          >
            <CVDocument cvData={displayData} />
          </div>
        </div>
      </div>
    </div>
  );
}
