"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutGrid,
  Undo2,
  Redo2,
  Save,
  Printer,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export function WriterTopBar({
  docTitle,
  onTitleChange,
  editor,
  saveStatus,
  onManualSave,
  onOpenPrintPreview,
  focusMode,
  setFocusMode,
  isFullscreen,
  toggleFullscreen,
}) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-10 px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 select-none z-30 no-print">
      {/* Left: Brand + Document Title */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-1.5 group shrink-0"
          title="Rootixa Homepage"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-md flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <LayoutGrid className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-white tracking-tight hidden sm:inline">
            Rootixa<span className="text-indigo-600 font-extrabold">.</span>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 ml-1">
              Writer
            </span>
          </span>
        </Link>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

        {/* Quick Access Toolbar (Undo / Redo / Save / Print) */}
        <div className="flex items-center gap-0.5">
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 cursor-pointer"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onManualSave}
            className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
            title="Save (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          </button>
          <button
            onClick={onOpenPrintPreview}
            className="p-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
            title="Print (Ctrl+P)"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Editable Document Title */}
        <div className="flex items-center gap-1 min-w-0">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:block" />
          <input
            type="text"
            value={docTitle}
            onChange={onTitleChange}
            placeholder="Untitled Document"
            aria-label="Document Name"
            className="text-xs font-semibold text-slate-900 dark:text-slate-100 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-800 px-2 py-0.5 rounded border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 outline-none transition w-32 sm:w-48 md:w-64 truncate"
          />
        </div>
      </div>

      {/* Right: Save Status & Window Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Save Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
            saveStatus === "saving"
              ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40"
              : saveStatus === "error"
              ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
              : "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40"
          }`}
          title={
            saveStatus === "saving"
              ? "Saving to local storage..."
              : saveStatus === "error"
              ? "Unable to save locally"
              : "Document saved locally"
          }
        >
          {saveStatus === "saving" ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="hidden sm:inline text-[10px]">Saving...</span>
            </>
          ) : saveStatus === "error" ? (
            <>
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span className="hidden sm:inline text-[10px]">Unsaved</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline text-[10px]">Saved</span>
            </>
          )}
        </div>

        {/* Focus Mode Button */}
        <button
          onClick={() => setFocusMode(!focusMode)}
          className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer hidden sm:flex items-center"
          title="Distraction-Free Focus Mode"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer hidden md:flex items-center"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Window"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* All Tools Link */}
        <Link
          href="/tools"
          className="px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1"
          title="Browse All Rootixa Tools"
        >
          <ArrowLeft className="w-3 h-3" />
          <span className="hidden sm:inline">Tools</span>
        </Link>
      </div>
    </header>
  );
}
