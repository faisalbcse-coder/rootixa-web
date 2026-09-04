"use client";

import { useState } from "react";

export function AnalyticsChart({
  data = [],
  title,
  description,
  color = "indigo", // "indigo" | "emerald" | "violet"
  unit = "users",
  badgeText = null,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
        <div className="flex h-56 items-center justify-center text-xs text-slate-400">
          No data available for the selected period.
        </div>
      </div>
    );
  }

  // Calculate scales
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, 1);
  const minValue = 0;
  const range = maxValue - minValue;

  const width = 600;
  const height = 220;
  const paddingLeft = 36;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 32;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minValue) / range) * chartHeight;
    return { x, y, ...d };
  });

  // Construct SVG Path
  const linePath = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, "");

  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x},${paddingTop + chartHeight}
    L ${points[0].x},${paddingTop + chartHeight}
    Z
  `;

  // Colors map
  const strokeColor = color === "emerald" ? "#10b981" : color === "violet" ? "#8b5cf6" : "#6366f1";
  const gradientStart = color === "emerald" ? "#10b981" : color === "violet" ? "#8b5cf6" : "#6366f1";

  // Grid tick values
  const yTicks = [
    maxValue,
    Math.round(maxValue / 2),
    0,
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            {badgeText && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>

        {hoverIndex !== null && points[hoverIndex] && (
          <div className="text-right">
            <span className="text-base font-extrabold text-slate-900 leading-none">
              {points[hoverIndex].value.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {points[hoverIndex].date} ({unit})
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientStart} stopOpacity="0.28" />
              <stop offset="100%" stopColor={gradientStart} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {yTicks.map((val, i) => {
            const y = paddingTop + (i / 2) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#94a3b8"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#grad-${color})`} />

          {/* Crisp Line */}
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {points
            .filter((_, idx) => idx % Math.ceil(points.length / 6) === 0 || idx === points.length - 1)
            .map((pt, i) => (
              <text
                key={i}
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
                fontWeight="600"
              >
                {pt.date}
              </text>
            ))}

          {/* Interactive Touch/Mouse Nodes */}
          {points.map((pt, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible touch area */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

              {/* Visible dot on hover */}
              {hoverIndex === idx && (
                <>
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={paddingTop + chartHeight}
                    stroke={strokeColor}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="#ffffff"
                    stroke={strokeColor}
                    strokeWidth="3"
                  />
                </>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
