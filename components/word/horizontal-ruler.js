"use client";

import React from "react";

export function HorizontalRuler({
  paperSize = "a4",
  orientation = "portrait",
  margins = "normal",
}) {
  // Determine pixel width matching CSS
  const isLandscape = orientation === "landscape";
  const isLetter = paperSize === "letter";
  const sheetWidth = isLandscape
    ? isLetter
      ? 1056
      : 1123
    : isLetter
    ? 816
    : 794;

  // Margin widths in pixels
  let leftMarginPx = 72;
  let rightMarginPx = 72;
  if (margins === "narrow") {
    leftMarginPx = 36;
    rightMarginPx = 36;
  } else if (margins === "moderate") {
    leftMarginPx = 54;
    rightMarginPx = 54;
  } else if (margins === "wide") {
    leftMarginPx = 108;
    rightMarginPx = 108;
  }

  const activeWidth = sheetWidth - leftMarginPx - rightMarginPx;

  // Total inches on the ruler (~96px per inch)
  const pxPerInch = 96;
  const totalInches = Math.ceil(sheetWidth / pxPerInch);

  // Generate tick marks
  const ticks = [];
  const numSubdivisions = 8; // 1/8th inch
  const subStep = pxPerInch / numSubdivisions;

  for (let px = 0; px <= sheetWidth; px += subStep) {
    const inchVal = px / pxPerInch;
    const isMajor = Math.abs(inchVal - Math.round(inchVal)) < 0.01;
    const isHalf = Math.abs(inchVal - (Math.floor(inchVal) + 0.5)) < 0.01;
    const isQuarter = Math.abs(inchVal - (Math.floor(inchVal) + 0.25)) < 0.01 || Math.abs(inchVal - (Math.floor(inchVal) + 0.75)) < 0.01;

    ticks.push({
      px,
      isMajor,
      isHalf,
      isQuarter,
      inchNumber: isMajor ? Math.round(inchVal) : null,
    });
  }

  return (
    <div
      className="rootixa-ruler-bar no-print border-x border-slate-300 dark:border-slate-700"
      style={{ width: `${sheetWidth}px`, maxWidth: `${sheetWidth}px` }}
      title="Horizontal Document Ruler (in inches)"
    >
      {/* Left Shaded Margin Zone */}
      <div
        className="ruler-margin-zone bg-slate-200/80 dark:bg-slate-800/80"
        style={{ left: 0, width: `${leftMarginPx}px` }}
      />

      {/* Active Printable White Body Zone */}
      <div
        className="absolute top-0 bottom-0 bg-white dark:bg-slate-900"
        style={{ left: `${leftMarginPx}px`, width: `${activeWidth}px` }}
      />

      {/* Right Shaded Margin Zone */}
      <div
        className="ruler-margin-zone bg-slate-200/80 dark:bg-slate-800/80"
        style={{ right: 0, width: `${rightMarginPx}px` }}
      />

      {/* Tick Marks & Numbers */}
      <div className="ruler-ticks w-full h-full relative">
        {ticks.map((t, idx) => (
          <div key={idx}>
            {t.isMajor ? (
              <>
                <div
                  className="ruler-tick-major dark:bg-slate-400"
                  style={{ left: `${t.px}px` }}
                />
                <span
                  className="ruler-num dark:text-slate-400 select-none"
                  style={{ left: `${t.px}px` }}
                >
                  {t.inchNumber}
                </span>
              </>
            ) : t.isHalf ? (
              <div
                className="ruler-tick-minor dark:bg-slate-600"
                style={{ left: `${t.px}px`, height: "7px" }}
              />
            ) : t.isQuarter ? (
              <div
                className="ruler-tick-minor dark:bg-slate-600"
                style={{ left: `${t.px}px`, height: "5px" }}
              />
            ) : (
              <div
                className="ruler-tick-minor dark:bg-slate-700"
                style={{ left: `${t.px}px`, height: "3px" }}
              />
            )}
          </div>
        ))}

        {/* First-Line Indent Marker (Top Triangle ▼) */}
        <div
          className="ruler-marker-indent"
          style={{ left: `${leftMarginPx}px`, top: 0 }}
          title="First Line Indent"
        >
          <svg width="10" height="7" viewBox="0 0 10 7" className="fill-slate-600 dark:fill-slate-300">
            <polygon points="0,0 10,0 5,7" />
          </svg>
        </div>

        {/* Left / Hanging Indent Marker (Bottom Triangle ▲ + Box ■) */}
        <div
          className="ruler-marker-indent"
          style={{ left: `${leftMarginPx}px`, bottom: 0 }}
          title="Left Indent"
        >
          <div className="flex flex-col items-center">
            <svg width="10" height="6" viewBox="0 0 10 6" className="fill-slate-600 dark:fill-slate-300">
              <polygon points="5,0 0,6 10,6" />
            </svg>
            <div className="w-2.5 h-1.5 bg-slate-600 dark:bg-slate-300" />
          </div>
        </div>

        {/* Right Margin Marker (Bottom Triangle ▲) */}
        <div
          className="ruler-marker-indent"
          style={{ left: `${sheetWidth - rightMarginPx}px`, bottom: 0 }}
          title="Right Margin"
        >
          <svg width="10" height="6" viewBox="0 0 10 6" className="fill-slate-600 dark:fill-slate-300">
            <polygon points="5,0 0,6 10,6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
