"use client";

import { useState, useEffect } from "react";
import {
  X,
  Download,
  Printer,
  FileDown,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { exportCvToPdf, printCv } from "@/lib/cv/cv-pdf-exporter";
import { generateSanitizedFilename } from "@/lib/cv/export-utils";
import { getTemplate } from "./templates/template-registry";

export function ExportModal({ isOpen, onClose, cvData }) {
  const [isExporting, setIsExporting] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  const template = getTemplate(cvData.design?.templateId || cvData.settings?.templateId);
  const TemplateComponent = template.component;
  const fileName = generateSanitizedFilename(cvData.personal?.fullName);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isExporting) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExporting, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setExportSuccess(false);
      setInfoMessage("");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setInfoMessage("");
    setExportSuccess(false);

    try {
      await exportCvToPdf({
        elementId: "cv-export-target",
        fileName,
        onProgress: (msg) => setProgressMsg(msg),
      });
      setExportSuccess(true);
    } catch (err) {
      console.warn("Direct PDF render notice, opening print preview fallback:", err);
      setInfoMessage("Opening print dialog — please select 'Save as PDF' destination.");
      printCv();
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintClick = () => {
    printCv();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
    >
      <div className="relative w-full max-w-xl flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* ══════════════════════════════════════════════════════════
            MODAL HEADER
        ══════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="export-dialog-title"
                className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white"
              >
                Download Your CV
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready to export in standard A4 format ({template.name} template)
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            aria-label="Close export dialog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MODAL BODY
        ══════════════════════════════════════════════════════════ */}
        <div className="p-6 space-y-4">
          {/* File Name Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">File to download:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
              {fileName}
            </span>
          </div>

          {/* Success Notification */}
          {exportSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>PDF downloaded successfully! Check your browser downloads folder.</span>
            </div>
          )}

          {/* Info / Fallback Notification */}
          {infoMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold animate-in fade-in duration-200">
              <Sparkles className="w-4 h-4 shrink-0 text-indigo-500" />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Action 1: Direct Download PDF */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPdf}
            className="w-full py-3.5 px-5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-60 text-white shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{progressMsg || "Generating PDF..."}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF File</span>
              </>
            )}
          </button>

          {/* Action 2: Print / Browser Save as PDF */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handlePrintClick}
            className="w-full py-3 px-5 rounded-2xl font-semibold text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print or Save as PDF (Native Vector)</span>
          </button>

          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 pt-1">
            Tip: In print preview, choose destination <strong>Save as PDF</strong> for 100% vector-sharp text.
          </p>
        </div>
      </div>
    </div>
  );
}
