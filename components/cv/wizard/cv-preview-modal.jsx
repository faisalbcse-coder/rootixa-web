"use client";

import React, { useState } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Printer,
  Sparkles,
} from "lucide-react";
import { CVDocument } from "../cv-document";
import { printCv } from "@/lib/cv/cv-pdf-exporter";

export function CVPreviewModal({
  isOpen = false,
  onClose,
  cvData,
  onDownloadPdf,
  isDownloadingPdf,
}) {
  const [zoom, setZoom] = useState(0.85);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50 duration-200"
    >
      <div className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-100 dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* ─── Modal Top Toolbar ─── */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Live A4 Document Preview
            </h2>
            <span className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-medium">
              Standard 210 × 297 mm
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1 min-w-[36px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print */}
            <button
              type="button"
              onClick={() => printCv()}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Print document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Scrollable Document Viewport ─── */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
          <div
            className="transition-transform duration-150 origin-top shadow-2xl"
            style={{ transform: `scale(${zoom})` }}
          >
            <CVDocument cvData={cvData} />
          </div>
        </div>
      </div>
    </div>
  );
}
