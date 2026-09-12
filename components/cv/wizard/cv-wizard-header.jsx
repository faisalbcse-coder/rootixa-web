"use client";

import React from "react";
import Link from "next/link";
import {
  User,
  Briefcase,
  Palette,
  Eye,
  Sparkles,
  RotateCcw,
  LayoutGrid,
  Check,
  ArrowLeft,
} from "lucide-react";

export function CVWizardHeader({
  currentStep = 1,
  onStepClick,
  onOpenPreview,
  onLoadSample,
  onReset,
}) {
  const steps = [
    { id: 1, label: "Personal", short: "1. Info", icon: User },
    { id: 2, label: "Experiences", short: "2. History", icon: Briefcase },
    { id: 3, label: "Template & Finish", short: "3. Template", icon: Palette },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#090E17]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* ─── 1. Authentic Rootixa Brand Logo ─── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 cursor-pointer group"
              aria-label="Rootixa Homepage"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-all duration-300">
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  CV Builder
                </span>
              </div>
            </Link>
          </div>

          {/* ─── 2. Rootixa Sleek Progress Stepper ─── */}
          <div className="flex-1 max-w-md mx-2 sm:mx-auto">
            <nav aria-label="Progress" className="relative flex items-center justify-between">
              {/* Background Connecting Bar */}
              <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-[2px] bg-slate-200 dark:bg-slate-800 z-0 pointer-events-none" />

              {/* Active Filled Progress Bar */}
              <div
                className="absolute top-1/2 left-4 -translate-y-1/2 h-[2px] bg-gradient-to-r from-violet-600 to-indigo-600 z-0 transition-all duration-300 pointer-events-none"
                style={{
                  width:
                    currentStep === 1
                      ? "0%"
                      : currentStep === 2
                      ? "50%"
                      : "calc(100% - 32px)",
                }}
              />

              {steps.map((step) => {
                const isCompleted = step.id < currentStep;
                const isActive = step.id === currentStep;
                const StepIcon = step.icon;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => onStepClick && onStepClick(step.id)}
                    className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-hidden"
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-md shadow-indigo-500/30 scale-105 font-bold"
                          : isCompleted
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <StepIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <span
                      className={`mt-1 text-[10px] sm:text-xs font-semibold tracking-wide transition-colors ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400 font-bold"
                          : isCompleted
                          ? "text-slate-800 dark:text-slate-200"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
                      }`}
                    >
                      <span className="hidden sm:inline">{step.label}</span>
                      <span className="sm:hidden">{step.short}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ─── 3. Right Action Items ─── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Live Preview Button */}
            <button
              type="button"
              onClick={onOpenPreview}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 px-3 py-1.5 sm:py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs active:scale-95"
              title="Preview your CV in real-time A4 format"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Preview CV</span>
            </button>

            {/* Load Sample Demo */}
            {onLoadSample && (
              <button
                type="button"
                onClick={onLoadSample}
                className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-xl transition-colors"
                title="Fill with professional sample data"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Sample</span>
              </button>
            )}

            {/* Reset */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="hidden xl:flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-500 px-2 py-1.5 rounded-xl transition-colors"
                title="Reset CV content"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
