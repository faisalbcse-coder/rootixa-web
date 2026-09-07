"use client";

import React from "react";
import { LayoutGrid, AlertCircle, RefreshCw, X } from "lucide-react";

export function ToolLoadingOverlay({
  isOpen,
  toolName,
  progress,
  statusText = "Preparing your workspace",
  hasError,
  errorMessage,
  onRetry,
  onCancel,
}) {
  const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!isOpen}
      aria-label={`Opening ${toolName || "Tool"}`}
      className={`fixed inset-0 z-[9999] flex items-center justify-center px-4 transition-all duration-300 ease-out ${
        isOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-98 pointer-events-none"
      } bg-white/95 dark:bg-[#090E17]/95 backdrop-blur-xl text-slate-900 dark:text-white select-none`}
    >
      {/* Gentle ambient background aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md mx-auto text-center flex flex-col items-center">
        {/* Brand Mark & Title */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
          </span>
        </div>

        {hasError ? (
          /* Error State */
          <div className="w-full bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3.5">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Unable to open this tool
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
              {errorMessage || "The tool failed to respond in time. Please try again."}
            </p>

            <div className="flex items-center gap-3 w-full">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                type="button"
                onClick={onRetry}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          </div>
        ) : (
          /* Active Loading State */
          <div className="w-full flex flex-col items-center">
            {/* Dynamic Tool Name Heading */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-7 px-2">
              Opening {toolName || "Tool"}...
            </h2>

            {/* Horizontal Rounded Progress Bar */}
            <div
              className="w-72 sm:w-80 max-w-[85vw] h-2.5 bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-200/70 dark:border-slate-700/60 shadow-inner mb-3.5"
              role="progressbar"
              aria-valuenow={roundedProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 rounded-full transition-all duration-75 ease-out shadow-xs"
                style={{ width: `${roundedProgress}%` }}
              />
            </div>

            {/* Percentage Text Below Bar */}
            <div className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200 tracking-tight font-mono mb-2">
              {roundedProgress}%
            </div>

            {/* Small Status Text */}
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-normal">
              {statusText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
