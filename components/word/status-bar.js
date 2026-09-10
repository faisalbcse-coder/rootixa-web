"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  FileText,
  Globe,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export function StatusBar({
  currentPage = 1,
  totalPages = 1,
  wordsCount = 0,
  charsCount = 0,
  viewMode = "print", // "print" | "web"
  setViewMode,
  zoom = 100,
  setZoom,
  saveStatus = "saved",
}) {
  const handleZoomStep = (delta) => {
    setZoom((prev) => Math.min(200, Math.max(50, prev + delta)));
  };

  return (
    <footer className="rootixa-status-bar no-print shrink-0 select-none">
      {/* Left: Document Statistics & Language */}
      <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-400">
        <span className="font-bold text-slate-800 dark:text-slate-200">
          Page {currentPage} of {totalPages}
        </span>

        <div className="status-separator hidden sm:block" />

        <span className="hidden sm:inline">
          {wordsCount.toLocaleString()} {wordsCount === 1 ? "word" : "words"}
        </span>

        <div className="status-separator hidden md:block" />

        <span className="hidden md:inline">
          {charsCount.toLocaleString()} characters
        </span>

        <div className="status-separator hidden lg:block" />

        <span className="hidden lg:flex items-center gap-1">
          <Globe className="w-3 h-3 text-slate-400" />
          English (United States)
        </span>

        <div className="status-separator hidden sm:block" />

        <div className="flex items-center gap-1 text-[10.5px]">
          {saveStatus === "saving" ? (
            <span className="text-amber-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Saving
            </span>
          ) : saveStatus === "error" ? (
            <span className="text-rose-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Unsaved
            </span>
          ) : (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Right: View Modes & Interactive Zoom Slider */}
      <div className="flex items-center gap-2 text-[11px]">
        {/* View Mode Buttons (Print Layout vs Web Layout) */}
        <div className="flex items-center gap-0.5 mr-1">
          <button
            onClick={() => setViewMode("print")}
            className={`p-1 rounded cursor-pointer transition ${
              viewMode === "print"
                ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            title="Print Layout View"
          >
            <FileText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode("web")}
            className={`p-1 rounded cursor-pointer transition ${
              viewMode === "web"
                ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
            title="Web Layout View (Fluid Full-Width)"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="status-separator" />

        {/* Zoom Slider Control */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleZoomStep(-10)}
            disabled={zoom <= 50}
            className="p-0.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>

          <input
            type="range"
            min="50"
            max="200"
            step="5"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-16 sm:w-24 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            title={`Zoom: ${zoom}%`}
          />

          <button
            onClick={() => handleZoomStep(10)}
            disabled={zoom >= 200}
            className="p-0.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>

          <button
            onClick={() => setZoom(100)}
            className="w-9 text-center font-bold text-[10.5px] hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
            title="Reset Zoom to 100%"
          >
            {zoom}%
          </button>
        </div>
      </div>
    </footer>
  );
}
