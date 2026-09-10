"use client";

import React, { useState } from "react";
import { X, Sliders, LayoutTemplate } from "lucide-react";

export function PageSetupDialog({
  isOpen,
  onClose,
  pageSettings,
  onSavePageSettings,
}) {
  const [margins, setMargins] = useState(pageSettings.margins || "normal");
  const [orientation, setOrientation] = useState(pageSettings.orientation || "portrait");
  const [paperSize, setPaperSize] = useState(pageSettings.paperSize || "a4");
  const [columns, setColumns] = useState(pageSettings.columns || "1");

  if (!isOpen) return null;

  const handleApply = () => {
    onSavePageSettings({
      margins,
      orientation,
      paperSize,
      columns,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Title Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Page Setup
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Margins */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Margins:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "normal", label: "Normal (1 in / 2.54 cm)" },
                { id: "narrow", label: "Narrow (0.5 in / 1.27 cm)" },
                { id: "moderate", label: "Moderate (0.75 in)" },
                { id: "wide", label: "Wide (1.5 in / 3.8 cm)" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMargins(m.id)}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    margins === m.id
                      ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orientation */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Orientation:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrientation("portrait")}
                className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                  orientation === "portrait"
                    ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Portrait (Vertical)
              </button>
              <button
                type="button"
                onClick={() => setOrientation("landscape")}
                className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                  orientation === "landscape"
                    ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Landscape (Horizontal)
              </button>
            </div>
          </div>

          {/* Paper Size & Columns */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Paper Size:
              </label>
              <select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="a4">A4 (210 x 297 mm)</option>
                <option value="letter">Letter (8.5 x 11 in)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Columns:
              </label>
              <select
                value={columns}
                onChange={(e) => setColumns(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
              >
                <option value="1">1 Column (Default)</option>
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
