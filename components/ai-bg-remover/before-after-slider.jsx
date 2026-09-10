"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { ChevronsLeftRight } from "lucide-react";

export function BeforeAfterSlider({
  originalSrc,
  processedCanvas,
  aspectRatio = 1,
  beforeLabel = "Original",
  afterLabel = "AI Result",
  className = "",
}) {
  const [sliderPos, setSliderPos] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Compute data URL directly via useMemo without cascading setState
  const processedDataUrl = useMemo(() => {
    if (!processedCanvas) return "";
    try {
      return processedCanvas.toDataURL("image/png");
    } catch {
      return "";
    }
  }, [processedCanvas]);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    if (e.touches[0]) handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMove = (e) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className={`relative w-full select-none overflow-hidden rounded-2xl cursor-ew-resize group bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 ${className}`}
      style={{
        aspectRatio: aspectRatio > 0 ? `${aspectRatio}` : "16/9",
        maxHeight: "68vh",
      }}
    >
      {/* Background Layer: Processed Result with Checkerboard */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      >
        {processedDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={processedDataUrl}
            alt={afterLabel}
            className="w-full h-full object-contain pointer-events-none"
          />
        ) : (
          <div className="text-slate-400 text-xs font-semibold">Processing...</div>
        )}

        {/* After / Processed Badge */}
        <span className="absolute bottom-4 right-4 z-10 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide shadow-md border border-white/10">
          {afterLabel}
        </span>
      </div>

      {/* Foreground Layer: Original Image (GPU-accelerated CSS clip-path polygon) */}
      <div
        className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-900 pointer-events-none"
        style={{
          clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
        }}
      >
        {originalSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={originalSrc}
            alt={beforeLabel}
            className="w-full h-full object-contain"
          />
        )}

        {/* Before / Original Badge */}
        <span className="absolute bottom-4 left-4 z-10 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold tracking-wide shadow-md border border-white/10">
          {beforeLabel}
        </span>
      </div>

      {/* Vertical Slider Divider Line */}
      <div
        className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none transition-transform"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Draggable Circle Knob */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-lg flex items-center justify-center border-2 border-fuchsia-600 transition-transform group-hover:scale-110 active:scale-95">
          <ChevronsLeftRight className="w-4 h-4 text-fuchsia-600" />
        </div>
      </div>
    </div>
  );
}
