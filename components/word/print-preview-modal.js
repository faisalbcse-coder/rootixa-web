"use client";

import React, { useEffect } from "react";
import { Printer, X, Eye, FileText, Check } from "lucide-react";

export function PrintPreviewModal({
  isOpen,
  docTitle,
  pageSettings,
  totalPages,
  headerText,
  footerText,
  pageNumberPos,
  pageNumberFormat,
  html,
  onPrint,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-preview-title"
    >
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 id="print-preview-title" className="text-sm font-bold text-slate-900 dark:text-white">
                Print Preview &bull; {docTitle}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {pageSettings.paperSize.toUpperCase()} &bull; {pageSettings.orientation} &bull; {pageSettings.margins} margins &bull; {totalPages} {totalPages === 1 ? "page" : "pages"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scaled Preview Sheet Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/90 flex justify-center">
          <div
            className="bg-white text-slate-900 rounded shadow-2xl border border-slate-300 dark:border-slate-700 p-8 sm:p-12 w-full max-w-[700px] min-h-[900px] pointer-events-none select-none"
            style={{
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {/* Header Display */}
            {headerText && (
              <div className="pb-3 mb-6 border-b border-slate-200 text-xs text-slate-400 font-medium text-right flex justify-between">
                <span>{pageNumberPos === "header" ? `Page 1 of ${totalPages}` : ""}</span>
                <span>{headerText}</span>
              </div>
            )}

            {/* Document Content */}
            <div
              className="prose max-w-none text-slate-800"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* Footer Display */}
            {(footerText || pageNumberPos === "footer") && (
              <div className="pt-6 mt-12 border-t border-slate-200 text-xs text-slate-400 font-medium flex items-center justify-between">
                <span>{footerText}</span>
                <span>
                  {pageNumberPos === "footer"
                    ? pageNumberFormat === "page-x-of-y"
                      ? `Page 1 of ${totalPages}`
                      : pageNumberFormat === "page-x"
                      ? "Page 1"
                      : "1"
                    : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <span className="text-xs text-slate-500">
            Click Print to invoke browser print options (Select &ldquo;Save as PDF&rdquo; to export directly).
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onPrint();
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
