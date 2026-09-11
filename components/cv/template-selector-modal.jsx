"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { TEMPLATES } from "./templates/template-registry";
import { exportCvToPdf } from "@/lib/cv/cv-pdf-exporter";
import { createSampleCV } from "@/lib/cv/cv-types";
import { getPreviewCVData } from "./templates/template-helpers";

export function TemplateSelectorModal({
  isOpen,
  onClose,
  selectedTemplateId = "tech_modern",
  onSelectTemplate,
  cvData,
}) {
  // Find initial index matching current selectedTemplateId
  const initialIndex = useMemo(() => {
    const idx = TEMPLATES.findIndex((t) => t.id === selectedTemplateId);
    return idx >= 0 ? idx : 0;
  }, [selectedTemplateId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Sync index when modal opens with selectedTemplateId
  useEffect(() => {
    if (isOpen) {
      const idx = TEMPLATES.findIndex((t) => t.id === selectedTemplateId);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setDownloadSuccess(false);
    }
  }, [isOpen, selectedTemplateId]);

  // Keyboard navigation (<-, ->, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev < TEMPLATES.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : TEMPLATES.length - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTemplate = TEMPLATES[currentIndex] || TEMPLATES[0];
  const TemplateComponent = currentTemplate.component;

  // Always display a rich, formatted design so every template's styling is clearly visible
  const previewData = useMemo(() => getPreviewCVData(cvData), [cvData]);

  const handleApply = () => {
    onSelectTemplate(currentTemplate.id);
    onClose();
  };

  const handleDownloadSample = async () => {
    try {
      setIsDownloadingSample(true);
      setDownloadSuccess(false);
      const cleanName = currentTemplate.name.replace(/\s+/g, "_");
      await exportCvToPdf({
        elementId: "template-carousel-preview",
        fileName: `Rootixa_${cleanName}_Template_Sample.pdf`,
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Sample download failed:", err);
    } finally {
      setIsDownloadingSample(false);
    }
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : TEMPLATES.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < TEMPLATES.length - 1 ? prev + 1 : 0));
  };

  const isCurrentActive = selectedTemplateId === currentTemplate.id;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-carousel-title"
    >
      <div className="relative w-full max-w-5xl h-[94vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* ══════════════════════════════════════════════════════════
            MODAL HEADER: TEMPLATE INFO & COUNTER
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
                  {currentTemplate.badge}
                </span>
                <h2
                  id="template-carousel-title"
                  className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white"
                >
                  {currentTemplate.name}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  ({currentIndex + 1} of {TEMPLATES.length})
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
                {currentTemplate.description}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close template viewer"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            CAROUSEL BODY: LARGE 1-BY-1 PREVIEW & NAVIGATION ARROWS
        ══════════════════════════════════════════════════════════ */}
        <div className="relative flex-1 bg-slate-200/60 dark:bg-slate-950/80 overflow-y-auto flex items-start justify-center p-3 sm:p-6 select-none">
          {/* Floating Left Arrow */}
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous Template"
            className="fixed sm:absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition cursor-pointer"
            title="Previous Template (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Floating Right Arrow */}
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next Template"
            className="fixed sm:absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition cursor-pointer"
            title="Next Template (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Large A4 Paper Container */}
          <div className="flex flex-col items-center">
            <div
              className="relative shadow-2xl rounded-sm overflow-hidden bg-white text-slate-900 origin-top transition-transform duration-200"
              style={{
                width: "794px",
                minHeight: "1123px",
                transform: "scale(0.68)",
                transformOrigin: "top center",
                marginBottom: "-340px", // Compensate for scaled down blank space
              }}
            >
              <div id="template-carousel-preview" className="w-full min-h-full bg-white">
                <TemplateComponent cvData={previewData} />
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            BOTTOM THUMBNAIL FILMSTRIP
        ══════════════════════════════════════════════════════════ */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {TEMPLATES.map((tmpl, idx) => {
            const isViewing = idx === currentIndex;
            const isCurrentlySelected = selectedTemplateId === tmpl.id;

            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isViewing
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isCurrentlySelected
                    ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tmpl.name}</span>
                {isCurrentlySelected && (
                  <Check className="w-3 h-3 stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════
            MODAL ACTION BAR
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Download Sample PDF Button */}
          <button
            type="button"
            onClick={handleDownloadSample}
            disabled={isDownloadingSample}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Download an actual sample PDF of this design"
          >
            {isDownloadingSample ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Generating Sample...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Sample Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Download Sample PDF</span>
              </>
            )}
          </button>

          {/* Right Action: Apply Template */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
                isCurrentActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25"
              }`}
            >
              {isCurrentActive ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Currently Applied</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Use This Template</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
