"use client";

import React, { useState } from "react";
import {
  Check,
  Download,
  ArrowLeft,
  Eye,
  Loader2,
  Sparkles,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { TEMPLATES } from "../templates/template-registry";
import { COLOR_PRESETS } from "@/lib/cv/cv-types";

export function StepTemplate({
  cvData,
  selectedTemplateId = "harvard",
  onSelectTemplate,
  onColorChange,
  onDownloadPdf,
  isDownloadingPdf = false,
  onPrev,
  onOpenFullPreview,
}) {
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in-50 duration-300">
      {/* ─── Header: Select Template ─── */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-bold uppercase tracking-wider mb-2">
          Step 3 of 3
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Choose Your CV Design
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
          Every template is engineered to be 100% ATS-compliant and recruiter-approved. Your details have been seamlessly mapped.
        </p>

        {/* ─── Accent Color Swatches ─── */}
        <div className="mt-5 inline-flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 pl-2">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span>Theme Accent:</span>
          </span>
          <div className="flex items-center gap-2 pr-1">
            {COLOR_PRESETS.map((color) => {
              const isActive = (cvData?.design?.colors?.accent || "").toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onColorChange && onColorChange(color.hex)}
                  title={color.name}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                    isActive ? "ring-2 ring-offset-2 ring-indigo-600 dark:ring-indigo-400 scale-110 shadow-xs" : "hover:scale-105 opacity-85 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {isActive && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Template Cards Grid ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {TEMPLATES.map((tpl) => {
          const isSelected = tpl.id === selectedTemplateId;

          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl.id)}
              className={`group relative rounded-2xl bg-white dark:bg-[#0E1524] border-2 transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "border-indigo-600 dark:border-indigo-500 shadow-xl shadow-indigo-500/15 ring-2 ring-indigo-600/20"
                  : "border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-md"
              }`}
            >
              {/* Selected Badge Indicator */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 z-10 w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}

              {/* Realistic Miniature Mockup */}
              <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-center min-h-[160px] sm:min-h-[190px]">
                <div className="w-full max-w-[130px] sm:max-w-[150px] aspect-[1/1.38] bg-white text-slate-800 rounded-xs shadow-md border border-slate-200 p-2.5 flex flex-col justify-between select-none transform group-hover:scale-[1.02] transition-transform">
                  <div>
                    {tpl.id === "modern_split" ? (
                      <div className="flex gap-1.5 h-full">
                        <div className="w-[32%] bg-slate-800 rounded-xs p-1">
                          <div className="w-3 h-3 rounded-full bg-indigo-400 mb-1 mx-auto" />
                          <div className="w-full h-0.5 bg-slate-400 mb-0.5" />
                          <div className="w-2/3 h-0.5 bg-slate-400" />
                        </div>
                        <div className="flex-1">
                          <div className="w-4/5 h-1.5 bg-slate-900 rounded-xs mb-1" />
                          <div className="w-1/2 h-1 bg-indigo-500 rounded-xs mb-2" />
                          <div className="w-full h-0.5 bg-slate-200 mb-0.5" />
                          <div className="w-full h-0.5 bg-slate-200 mb-0.5" />
                          <div className="w-3/4 h-0.5 bg-slate-200" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`w-3/4 h-1.5 rounded-xs mb-1 ${
                            tpl.id === "harvard" ? "mx-auto bg-slate-950" : "bg-slate-900"
                          }`}
                        />
                        <div
                          className={`w-1/2 h-1 rounded-xs mb-1.5 ${
                            tpl.id === "harvard" ? "mx-auto bg-rose-900" : "bg-slate-400"
                          }`}
                        />
                        <div
                          className="w-full h-px mb-2"
                          style={{
                            backgroundColor:
                              tpl.id === "harvard" ? "#A51C30" : tpl.accentColor || "#e2e8f0",
                          }}
                        />
                        <div className="space-y-1">
                          <div className="w-full h-0.5 bg-slate-200 rounded-xs" />
                          <div className="w-full h-0.5 bg-slate-200 rounded-xs" />
                          <div className="w-4/5 h-0.5 bg-slate-200 rounded-xs" />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[6px] text-slate-400">
                    <span className="font-semibold text-slate-600 truncate">
                      {cvData?.personal?.fullName || "Your CV"}
                    </span>
                    <span className="text-[5px]">A4</span>
                  </div>
                </div>
              </div>

              {/* Template Details */}
              <div className="p-3 sm:p-3.5 bg-white dark:bg-[#0E1524]">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                    {tpl.name}
                  </h3>
                  {tpl.badge && (
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-xs shrink-0 ${
                        tpl.badge === "Ivy League"
                          ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                          : tpl.badge === "Popular"
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {tpl.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {tpl.tagline}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Rootixa Bottom Finish Bar ─── */}
      <div className="bg-white dark:bg-[#0E1524] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xl shadow-slate-200/40 dark:shadow-black/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-5 py-3 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Experiences</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Full Preview */}
          <button
            type="button"
            onClick={onOpenFullPreview}
            className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer flex-1 sm:flex-initial"
          >
            <Eye className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Full A4 Preview</span>
          </button>

          {/* Rootixa Signature Gradient Download Button */}
          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 active:scale-98 transition-all cursor-pointer flex-1 sm:flex-initial min-w-[210px]"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Resume</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
