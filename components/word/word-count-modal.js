"use client";

import React, { useEffect } from "react";
import { FileText, X, Clock, Type, AlignLeft } from "lucide-react";

export function WordCountModal({ isOpen, stats, onClose }) {
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

  const { words = 0, characters = 0, charactersNoSpaces = 0, paragraphs = 0 } = stats || {};
  const readingTimeMin = Math.max(1, Math.ceil(words / 200));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="word-count-title"
    >
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 transform animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <span id="word-count-title">Word Count & Statistics</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Words</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {words.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Characters (with spaces)
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {characters.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Characters (no spaces)
            </span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {charactersNoSpaces.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Paragraphs</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              {paragraphs.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Estimated Reading Time
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
              ~{readingTimeMin} min
            </span>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer shadow-xs shadow-indigo-600/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
