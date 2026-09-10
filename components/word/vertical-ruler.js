"use client";

import React from "react";

export function VerticalRuler({
  paperSize = "a4",
  orientation = "portrait",
  margins = "normal",
}) {
  const isLandscape = orientation === "landscape";
  const isLetter = paperSize === "letter";
  const sheetHeight = isLandscape
    ? isLetter
      ? 816
      : 794
    : isLetter
    ? 1056
    : 1123;

  let topMarginPx = 72;
  let bottomMarginPx = 64;
  if (margins === "narrow") {
    topMarginPx = 36;
    bottomMarginPx = 36;
  } else if (margins === "moderate") {
    topMarginPx = 54;
    bottomMarginPx = 54;
  } else if (margins === "wide") {
    topMarginPx = 72;
    bottomMarginPx = 64;
  }

  const activeHeight = sheetHeight - topMarginPx - bottomMarginPx;

  const pxPerInch = 96;
  const subStep = pxPerInch / 4; // 1/4 inch

  const ticks = [];
  for (let px = 0; px <= sheetHeight; px += subStep) {
    const inchVal = px / pxPerInch;
    const isMajor = Math.abs(inchVal - Math.round(inchVal)) < 0.01;
    const isHalf = Math.abs(inchVal - (Math.floor(inchVal) + 0.5)) < 0.01;

    ticks.push({
      px,
      isMajor,
      isHalf,
      inchNumber: isMajor ? Math.round(inchVal) : null,
    });
  }

  return (
    <div
      className="rootixa-ruler-vertical no-print border-y border-slate-300 dark:border-slate-700 select-none mr-2 hidden md:block"
      style={{ height: `${sheetHeight}px`, minHeight: `${sheetHeight}px` }}
      title="Vertical Document Ruler (in inches)"
    >
      {/* Top Margin Zone */}
      <div
        className="absolute left-0 right-0 top-0 bg-slate-200/80 dark:bg-slate-800/80"
        style={{ height: `${topMarginPx}px` }}
      />

      {/* Active Body Zone */}
      <div
        className="absolute left-0 right-0 bg-white dark:bg-slate-900"
        style={{ top: `${topMarginPx}px`, height: `${activeHeight}px` }}
      />

      {/* Bottom Margin Zone */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-slate-200/80 dark:bg-slate-800/80"
        style={{ height: `${bottomMarginPx}px` }}
      />

      {/* Vertical Ticks */}
      <div className="relative w-full h-full">
        {ticks.map((t, idx) => (
          <div key={idx}>
            {t.isMajor ? (
              <>
                <div
                  className="absolute right-0 h-px bg-slate-400 w-2.5"
                  style={{ top: `${t.px}px` }}
                />
                <span
                  className="absolute left-1 font-semibold text-[8.5px] text-slate-500 dark:text-slate-400 select-none"
                  style={{ top: `${t.px - 6}px` }}
                >
                  {t.inchNumber}
                </span>
              </>
            ) : t.isHalf ? (
              <div
                className="absolute right-0 h-px bg-slate-300 dark:bg-slate-600 w-1.5"
                style={{ top: `${t.px}px` }}
              />
            ) : (
              <div
                className="absolute right-0 h-px bg-slate-200 dark:bg-slate-700 w-1"
                style={{ top: `${t.px}px` }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
