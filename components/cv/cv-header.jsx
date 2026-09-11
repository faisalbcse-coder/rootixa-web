"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  Eye,
  PenLine,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export function CVHeader({
  documentTitle,
  onTitleChange,
  onReset,
  activeView, // "editor" | "preview"
  onViewToggle,
  onDownloadPdf,
  isDownloadingPdf = false,
}) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleConfirmReset = () => {
    onReset();
    setShowConfirmReset(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* ─── Left: Rootixa CV Builder Branding ─── */}
          <div className="flex items-center gap-3.5 min-w-0">
            <Link
              href="/tools"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Back to Tools"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                    Rootixa
                  </span>
                  <span className="text-base font-medium text-indigo-600 dark:text-indigo-400">
                    CV Builder
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                    Pro
                  </span>
                </div>
                <span className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Create a job-ready resume in minutes
                </span>
              </div>
            </Link>
          </div>

          {/* ─── Right: Primary Clean Actions ─── */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mobile View Toggle (Editor vs Preview) */}
            <div className="lg:hidden flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => onViewToggle("editor")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeView === "editor"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    : "text-slate-500"
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => onViewToggle("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeView === "preview"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                    : "text-slate-500"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* Primary Action: Download PDF */}
            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={onDownloadPdf}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-60 text-white shadow-md shadow-indigo-600/25 transition cursor-pointer"
              title="Download print-ready PDF"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Subtle Reset Menu */}
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Clear all data and start fresh"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Confirm Reset Modal ─── */}
      {showConfirmReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Start a New Blank CV?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will clear your current CV details. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition cursor-pointer"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
