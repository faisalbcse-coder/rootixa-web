"use client";

import React, { useState, useEffect } from "react";
import { AlignVerticalSpaceAround, X, FileText } from "lucide-react";

export function HeaderFooterModal({ isOpen, initialData, onSave, onClose }) {
  if (!isOpen) return null;

  return (
    <HeaderFooterDialog
      key={JSON.stringify(initialData)}
      initialData={initialData}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

function HeaderFooterDialog({ initialData, onSave, onClose }) {
  const [headerText, setHeaderText] = useState(initialData?.headerText || "");
  const [footerText, setFooterText] = useState(initialData?.footerText || "");
  const [pageNumberPos, setPageNumberPos] = useState(initialData?.pageNumberPos || "footer"); // "none" | "header" | "footer"
  const [pageNumberFormat, setPageNumberFormat] = useState(initialData?.pageNumberFormat || "page-x-of-y"); // "1" | "page-x" | "page-x-of-y"

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      headerText,
      footerText,
      pageNumberPos,
      pageNumberFormat,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="header-footer-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 transform animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <AlignVerticalSpaceAround className="w-4 h-4" />
            </div>
            <span id="header-footer-title">Header, Footer & Page Numbers</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Header Text */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Header (Repeats at top of pages)
            </label>
            <input
              type="text"
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
              placeholder="e.g. Company Name / Project Title"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Footer Text */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Document Footer (Repeats at bottom of pages)
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="e.g. Confidential / Draft"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Page Number Position */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Page Number Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "none", label: "None" },
                { id: "header", label: "Top (Header)" },
                { id: "footer", label: "Bottom (Footer)" },
              ].map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => setPageNumberPos(pos.id)}
                  className={`py-1.5 px-2 rounded-xl border text-center font-semibold transition cursor-pointer ${
                    pageNumberPos === pos.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Number Format */}
          {pageNumberPos !== "none" && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Numbering Format
              </label>
              <select
                value={pageNumberFormat}
                onChange={(e) => setPageNumberFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white outline-none cursor-pointer"
              >
                <option value="page-x-of-y">Page 1 of 5</option>
                <option value="page-x">Page 1</option>
                <option value="1">1, 2, 3</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition cursor-pointer"
            >
              Apply Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
