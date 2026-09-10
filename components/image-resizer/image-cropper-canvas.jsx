"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Move, Check, X, RotateCcw } from "lucide-react";

/**
 * Interactive Image Cropper Canvas Component
 * Renders the transformed image and an interactive, touch-friendly crop overlay box.
 */
export function ImageCropperCanvas({
  image,
  rotation = 0,
  flipH = false,
  flipV = false,
  crop,
  setCrop,
  isCropping = false,
  aspectRatio = null, // null for free, number for fixed
  onApplyCrop,
  onCancelCrop,
}) {
  const containerRef = useRef(null);
  const imageCanvasRef = useRef(null);

  // Drag interaction state
  const [dragState, setDragState] = useState(null); // { type: 'move' | 'nw' | 'ne' | ... , startX, startY, initialCrop }

  // Intrinsic dimensions of the rotated image
  const normRot = ((rotation % 360) + 360) % 360;
  const isRotated90 = normRot === 90 || normRot === 270;
  const origW = image ? (image.naturalWidth || image.width) : 800;
  const origH = image ? (image.naturalHeight || image.height) : 600;
  const imgW = isRotated90 ? origH : origW;
  const imgH = isRotated90 ? origW : origH;

  // Scale ratio: preview displayed pixels per image natural pixel
  const [scale, setScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Update scale on resize
  const updateDimensions = useCallback(() => {
    if (!containerRef.current || !imgW || !imgH) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (!clientWidth) return;

    // Available space for canvas
    const maxW = clientWidth;
    const maxH = Math.max(300, Math.min(650, clientHeight || 500));

    const scaleW = maxW / imgW;
    const scaleH = maxH / imgH;
    const fitScale = Math.min(scaleW, scaleH, 1); // Do not upscale beyond 100%

    setScale(fitScale);
    setContainerSize({
      width: Math.round(imgW * fitScale),
      height: Math.round(imgH * fitScale),
    });
  }, [imgW, imgH]);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  // Render the preview image on canvas with current rotation & flip
  useEffect(() => {
    if (!image || !imageCanvasRef.current || !containerSize.width) return;
    const canvas = imageCanvasRef.current;
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;
    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((normRot * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const drawW = isRotated90 ? canvas.height : canvas.width;
    const drawH = isRotated90 ? canvas.width : canvas.height;

    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [image, containerSize, normRot, flipH, flipV, isRotated90]);

  // Pointer drag handling for crop box & handles
  const handlePointerDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({
      type,
      startX: e.clientX,
      startY: e.clientY,
      initialCrop: { ...crop },
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e) => {
      const dx = (e.clientX - dragState.startX) / scale;
      const dy = (e.clientY - dragState.startY) / scale;
      const init = dragState.initialCrop;
      let nextCrop = { ...init };

      if (dragState.type === "move") {
        nextCrop.x = Math.max(0, Math.min(imgW - init.width, init.x + dx));
        nextCrop.y = Math.max(0, Math.min(imgH - init.height, init.y + dy));
      } else {
        // Handle resizing
        let newX = init.x;
        let newY = init.y;
        let newW = init.width;
        let newH = init.height;

        if (dragState.type.includes("e")) {
          newW = Math.max(30, Math.min(imgW - newX, init.width + dx));
        }
        if (dragState.type.includes("w")) {
          const maxLeftMove = init.width - 30;
          const clampedDx = Math.min(maxLeftMove, Math.max(-init.x, dx));
          newX = init.x + clampedDx;
          newW = init.width - clampedDx;
        }
        if (dragState.type.includes("s")) {
          newH = Math.max(30, Math.min(imgH - newY, init.height + dy));
        }
        if (dragState.type.includes("n")) {
          const maxTopMove = init.height - 30;
          const clampedDy = Math.min(maxTopMove, Math.max(-init.y, dy));
          newY = init.y + clampedDy;
          newH = init.height - clampedDy;
        }

        // Apply aspect ratio constraint if fixed
        if (aspectRatio) {
          if (dragState.type === "e" || dragState.type === "w") {
            newH = newW / aspectRatio;
            if (newY + newH > imgH) {
              newH = imgH - newY;
              newW = newH * aspectRatio;
            }
          } else if (dragState.type === "n" || dragState.type === "s") {
            newW = newH * aspectRatio;
            if (newX + newW > imgW) {
              newW = imgW - newX;
              newH = newW / aspectRatio;
            }
          } else {
            // Corner handles
            newH = newW / aspectRatio;
            if (newY + newH > imgH) {
              newH = imgH - newY;
              newW = newH * aspectRatio;
            }
          }
        }

        nextCrop = {
          x: Math.round(Math.max(0, newX)),
          y: Math.round(Math.max(0, newY)),
          width: Math.round(Math.min(imgW - newX, newW)),
          height: Math.round(Math.min(imgH - newY, newH)),
        };
      }

      setCrop(nextCrop);
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragState, scale, imgW, imgH, aspectRatio, setCrop]);

  // Crop box position in preview pixels
  const boxX = (crop?.x || 0) * scale;
  const boxY = (crop?.y || 0) * scale;
  const boxW = (crop?.width || imgW) * scale;
  const boxH = (crop?.height || imgH) * scale;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center p-3 sm:p-6 bg-slate-900/5 dark:bg-black/30 rounded-3xl overflow-hidden min-h-[380px] max-h-[640px] select-none"
    >
      <div
        className="relative shadow-xl rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          width: containerSize.width || "auto",
          height: containerSize.height || "auto",
        }}
      >
        {/* Rendered transformed base canvas */}
        <canvas
          ref={imageCanvasRef}
          className="block max-w-full max-h-full object-contain"
        />

        {/* Interactive Crop Overlay */}
        {isCropping && (
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{ width: containerSize.width, height: containerSize.height }}
          >
            {/* Darkened outer backdrop using SVG cut-out mask */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={boxX}
                    y={boxY}
                    width={boxW}
                    height={boxH}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="rgba(15, 23, 42, 0.65)"
                mask="url(#crop-mask)"
              />
            </svg>

            {/* Draggable & Resizable Active Crop Box */}
            <div
              className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)] pointer-events-auto cursor-move group"
              style={{
                left: boxX,
                top: boxY,
                width: boxW,
                height: boxH,
              }}
              onPointerDown={(e) => handlePointerDown(e, "move")}
            >
              {/* Rule of Thirds Grid Lines */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-60">
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-r border-b border-white/40" />
                <div className="border-b border-white/40" />
                <div className="border-r border-white/40" />
                <div className="border-r border-white/40" />
                <div />
              </div>

              {/* Floating Dimension Pill */}
              <div className="absolute -top-7 left-0 bg-slate-950/90 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-md shadow-md pointer-events-none whitespace-nowrap">
                {Math.round(crop.width)} × {Math.round(crop.height)} px
              </div>

              {/* Quick Center Move Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
                <Move className="w-8 h-8 text-white drop-shadow-md" />
              </div>

              {/* 8 Grab Handles (Touch-friendly 14px size with hover expand) */}
              {[
                { type: "nw", style: "top-[-7px] left-[-7px] cursor-nwse-resize" },
                { type: "ne", style: "top-[-7px] right-[-7px] cursor-nesw-resize" },
                { type: "sw", style: "bottom-[-7px] left-[-7px] cursor-nesw-resize" },
                { type: "se", style: "bottom-[-7px] right-[-7px] cursor-nwse-resize" },
                { type: "n", style: "top-[-6px] left-[calc(50%-6px)] cursor-ns-resize" },
                { type: "s", style: "bottom-[-6px] left-[calc(50%-6px)] cursor-ns-resize" },
                { type: "w", style: "top-[calc(50%-6px)] left-[-6px] cursor-ew-resize" },
                { type: "e", style: "top-[calc(50%-6px)] right-[-6px] cursor-ew-resize" },
              ].map((h) => (
                <div
                  key={h.type}
                  className={`absolute w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm shadow-md transition-transform hover:scale-125 ${h.style}`}
                  onPointerDown={(e) => handlePointerDown(e, h.type)}
                />
              ))}
            </div>

            {/* In-Canvas Floating Action Buttons during Crop Mode */}
            <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={onCancelCrop}
                className="bg-white/95 dark:bg-slate-800/95 hover:bg-slate-100 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={onApplyCrop}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
