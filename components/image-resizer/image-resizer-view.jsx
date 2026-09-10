"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  UploadCloud,
  ImagePlus,
  Sliders,
  Crop as CropIcon,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Lock,
  Unlock,
  Download,
  Check,
  RefreshCw,
  Trash2,
  FileImage,
  Info,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Home,
  Wrench,
  Star,
  MessageSquare,
  LayoutGrid,
  Menu,
  X,
  Clipboard,
  AlertTriangle,
} from "lucide-react";
import { ImageCropperCanvas } from "./image-cropper-canvas";
import {
  loadImage,
  formatBytes,
  sanitizeFilename,
  calculateAspectRatioDimensions,
  processImageCanvas,
  canvasToBlob,
  triggerDownload,
} from "@/lib/image-resizer/processor";
import {
  ASPECT_RATIOS,
  PERCENTAGE_PRESETS,
  DIMENSION_PRESETS,
} from "@/lib/image-resizer/presets";

export function ImageResizerView() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const savedTheme = localStorage.getItem("rootixa_theme");
      if (savedTheme) return savedTheme === "dark";
      return (
        window.matchMedia("(prefers-color-scheme: dark)").matches ||
        document.documentElement.classList.contains("dark")
      );
    } catch {
      return false;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Sync Dark Mode
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", darkMode);
    } catch {
      // Ignore
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    try {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("rootixa_theme", next ? "dark" : "light");
    } catch {
      // Ignore
    }
  };

  // Image Source State
  const [imageElement, setImageElement] = useState(null);
  const [imageMeta, setImageMeta] = useState(null); // { name, size, type, width, height }
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Controls Navigation Tab
  const [activeTab, setActiveTab] = useState("resize"); // 'resize' | 'crop' | 'transform' | 'export'

  // Resize Settings
  const [resizeMode, setResizeMode] = useState("pixels"); // 'pixels' | 'percentage'
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [percentageScale, setPercentageScale] = useState(100);

  // Transform Settings
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Crop Settings
  const [isCropping, setIsCropping] = useState(false);
  const [cropRatioId, setCropRatioId] = useState("free");
  const [crop, setCrop] = useState(null); // { x, y, width, height }
  const [appliedCrop, setAppliedCrop] = useState(null);

  // Export Settings
  const [exportFormat, setExportFormat] = useState("image/jpeg"); // 'image/jpeg' | 'image/png' | 'image/webp'
  const [exportQuality, setExportQuality] = useState(90); // 1-100
  const [isProcessingExport, setIsProcessingExport] = useState(false);
  const [estimatedSize, setEstimatedSize] = useState("");

  // Transformed Image Dimensions (after 90/270 deg rotation)
  const transformedDimensions = useMemo(() => {
    if (!imageElement) return { width: 0, height: 0 };
    const norm = ((rotation % 360) + 360) % 360;
    const isRotated = norm === 90 || norm === 270;
    const w = imageElement.naturalWidth || imageElement.width;
    const h = imageElement.naturalHeight || imageElement.height;
    return {
      width: isRotated ? h : w,
      height: isRotated ? w : h,
    };
  }, [imageElement, rotation]);

  // Handle Image File Loading
  const handleFile = useCallback(async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image file (JPG, PNG, WebP, GIF, or AVIF).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("This image exceeds 50MB. Please select a smaller file for safe browser processing.");
      return;
    }

    setUploadError("");
    try {
      const img = await loadImage(file);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;

      setImageElement(img);
      setImageMeta({
        name: file.name || "uploaded-image",
        size: file.size || 0,
        type: file.type || "image/jpeg",
        width: w,
        height: h,
      });

      // Initialize default controls
      setResizeWidth(w);
      setResizeHeight(h);
      setPercentageScale(100);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setCrop({ x: 0, y: 0, width: w, height: h });
      setAppliedCrop(null);
      setIsCropping(false);

      // Default format matching original if PNG or WebP, else JPEG
      if (file.type === "image/png") setExportFormat("image/png");
      else if (file.type === "image/webp") setExportFormat("image/webp");
      else setExportFormat("image/jpeg");
    } catch (err) {
      console.error("Failed to load image:", err);
      setUploadError("Unable to decode this image format in your browser.");
    }
  }, []);

  // Drag and Drop Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Clipboard Paste Support
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFile]);

  // Update width when user types in pixels
  const handleWidthChange = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      setResizeWidth(val);
      return;
    }

    setResizeWidth(num);

    if (lockAspectRatio) {
      const currentCropW = appliedCrop ? appliedCrop.width : transformedDimensions.width;
      const currentCropH = appliedCrop ? appliedCrop.height : transformedDimensions.height;
      const ratio = currentCropW / currentCropH;
      const res = calculateAspectRatioDimensions({
        changedField: "width",
        newValue: num,
        aspectRatio: ratio,
      });
      setResizeHeight(res.height);
    }
  };

  // Update height when user types in pixels
  const handleHeightChange = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num <= 0) {
      setResizeHeight(val);
      return;
    }

    setResizeHeight(num);

    if (lockAspectRatio) {
      const currentCropW = appliedCrop ? appliedCrop.width : transformedDimensions.width;
      const currentCropH = appliedCrop ? appliedCrop.height : transformedDimensions.height;
      const ratio = currentCropW / currentCropH;
      const res = calculateAspectRatioDimensions({
        changedField: "height",
        newValue: num,
        aspectRatio: ratio,
      });
      setResizeWidth(res.width);
    }
  };

  // Percentage Scaling
  const handlePercentageChange = (pct) => {
    setPercentageScale(pct);
    const baseW = appliedCrop ? appliedCrop.width : transformedDimensions.width;
    const baseH = appliedCrop ? appliedCrop.height : transformedDimensions.height;
    setResizeWidth(Math.max(1, Math.round((baseW * pct) / 100)));
    setResizeHeight(Math.max(1, Math.round((baseH * pct) / 100)));
  };

  // Apply Dimension Preset
  const applyDimensionPreset = (preset) => {
    setResizeMode("pixels");
    setResizeWidth(preset.width);
    setResizeHeight(preset.height);
  };

  // Crop Aspect Ratio Selection
  const activeAspectRatioValue = useMemo(() => {
    const found = ASPECT_RATIOS.find((a) => a.id === cropRatioId);
    return found ? found.ratio : null;
  }, [cropRatioId]);

  const handleSelectCropRatio = (ratioId) => {
    setCropRatioId(ratioId);
    setIsCropping(true);

    const found = ASPECT_RATIOS.find((a) => a.id === ratioId);
    const ratio = found ? found.ratio : null;

    const baseW = transformedDimensions.width;
    const baseH = transformedDimensions.height;

    if (!ratio) {
      // Free crop
      setCrop({ x: 0, y: 0, width: baseW, height: baseH });
    } else {
      let targetW = baseW;
      let targetH = Math.round(targetW / ratio);

      if (targetH > baseH) {
        targetH = baseH;
        targetW = Math.round(targetH * ratio);
      }

      const offsetX = Math.round((baseW - targetW) / 2);
      const offsetY = Math.round((baseH - targetH) / 2);

      setCrop({
        x: Math.max(0, offsetX),
        y: Math.max(0, offsetY),
        width: targetW,
        height: targetH,
      });
    }
  };

  // Crop Position Shortcuts
  const alignCrop = (position) => {
    if (!crop) return;
    const baseW = transformedDimensions.width;
    const baseH = transformedDimensions.height;
    let nextX = crop.x;
    let nextY = crop.y;

    if (position === "center") {
      nextX = Math.round((baseW - crop.width) / 2);
      nextY = Math.round((baseH - crop.height) / 2);
    } else if (position === "top") {
      nextY = 0;
    } else if (position === "bottom") {
      nextY = baseH - crop.height;
    } else if (position === "left") {
      nextX = 0;
    } else if (position === "right") {
      nextX = baseW - crop.width;
    }

    setCrop((prev) => ({
      ...prev,
      x: Math.max(0, nextX),
      y: Math.max(0, nextY),
    }));
  };

  // Apply Crop Action
  const handleApplyCrop = () => {
    if (!crop) return;
    setAppliedCrop({ ...crop });
    setIsCropping(false);
    // Update resize inputs to match crop dimensions
    setResizeWidth(crop.width);
    setResizeHeight(crop.height);
  };

  // Cancel Crop Action
  const handleCancelCrop = () => {
    setIsCropping(false);
    if (appliedCrop) {
      setCrop({ ...appliedCrop });
    } else {
      setCrop({
        x: 0,
        y: 0,
        width: transformedDimensions.width,
        height: transformedDimensions.height,
      });
    }
  };

  // Rotation & Flip Handlers
  const handleRotate = (deg) => {
    const nextRot = ((rotation + deg) % 360 + 360) % 360;
    setRotation(nextRot);
    setAppliedCrop(null);
    setIsCropping(false);
  };

  // Reset Everything to Original
  const handleReset = () => {
    if (!imageElement) return;
    const w = imageElement.naturalWidth || imageElement.width;
    const h = imageElement.naturalHeight || imageElement.height;
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCrop({ x: 0, y: 0, width: w, height: h });
    setAppliedCrop(null);
    setIsCropping(false);
    setResizeWidth(w);
    setResizeHeight(h);
    setPercentageScale(100);
    setCropRatioId("free");
  };

  // Estimate output size when dimensions or quality change
  useEffect(() => {
    if (!imageElement || isCropping) return;

    let cancel = false;
    const timer = setTimeout(async () => {
      try {
        const canvas = processImageCanvas({
          image: imageElement,
          rotation,
          flipH,
          flipV,
          crop: appliedCrop,
          targetWidth: Number(resizeWidth) || 100,
          targetHeight: Number(resizeHeight) || 100,
        });

        const blob = await canvasToBlob(canvas, exportFormat, exportQuality / 100);
        if (!cancel) {
          setEstimatedSize(formatBytes(blob.size));
        }
      } catch {
        // Ignore estimation errors
      }
    }, 300);

    return () => {
      cancel = true;
      clearTimeout(timer);
    };
  }, [
    imageElement,
    rotation,
    flipH,
    flipV,
    appliedCrop,
    resizeWidth,
    resizeHeight,
    exportFormat,
    exportQuality,
    isCropping,
  ]);

  // Process & Download Image
  const handleDownload = async () => {
    if (!imageElement) return;
    setIsProcessingExport(true);

    try {
      const canvas = processImageCanvas({
        image: imageElement,
        rotation,
        flipH,
        flipV,
        crop: appliedCrop,
        targetWidth: Number(resizeWidth) || transformedDimensions.width,
        targetHeight: Number(resizeHeight) || transformedDimensions.height,
      });

      const blob = await canvasToBlob(canvas, exportFormat, exportQuality / 100);

      const ext =
        exportFormat === "image/png"
          ? "png"
          : exportFormat === "image/webp"
          ? "webp"
          : "jpg";

      const filename = sanitizeFilename(imageMeta?.name || "image", "-resized", ext);
      triggerDownload(blob, filename);

      // Track platform usage event
      try {
        fetch("/api/tools/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolId: "image-resizer",
            status: "success",
            format: ext,
            width: resizeWidth,
            height: resizeHeight,
          }),
        }).catch(() => {});
      } catch {}
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to process image export. Please check memory limits.");
    } finally {
      setIsProcessingExport(false);
    }
  };

  const navLinkClass =
    "text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3.5 py-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all flex items-center gap-1.5";

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        darkMode ? "dark bg-[#090E17] text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* ============================================================
          1. HEADER & NAVBAR
      ============================================================ */}
      <header
        className={`w-full sticky z-40 transition-all duration-300 ${
          isScrolled
            ? "top-3 px-4"
            : "top-0 px-0 bg-slate-50/85 dark:bg-[#090E17]/85 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 shadow-2xs"
        }`}
      >
        <nav
          aria-label="Main Navigation"
          className={`max-w-7xl mx-auto transition-all duration-300 flex justify-between items-center ${
            isScrolled
              ? "bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-full px-6 py-2.5"
              : "py-3.5 px-4 sm:px-6 lg:px-8"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer group"
            aria-label="Rootixa Homepage"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950/60 group-hover:scale-105 transition-all duration-300">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/70 shadow-2xs backdrop-blur-xs">
            <Link href="/" className={navLinkClass}>
              <Home className="w-3.5 h-3.5 text-indigo-500" /> Home
            </Link>
            <Link href="/#popular-tools" className={navLinkClass}>
              <Wrench className="w-3.5 h-3.5" /> Popular Tools
            </Link>
            <Link href="/tools" className={navLinkClass}>
              <LayoutGrid className="w-3.5 h-3.5" /> All Tools
            </Link>
            <Link href="/#why-rootixa" className={navLinkClass}>
              <ShieldCheck className="w-3.5 h-3.5" /> Why Rootixa
            </Link>
            <Link href="/feedback" className={navLinkClass}>
              <MessageSquare className="w-3.5 h-3.5" /> Feedback
            </Link>
          </div>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="relative w-14 h-8 flex items-center bg-slate-200 dark:bg-slate-700/80 rounded-full p-1 cursor-pointer transition-colors duration-300 border border-slate-300/50 dark:border-slate-600/50 shadow-inner group hover:bg-slate-300 dark:hover:bg-slate-600"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="flex justify-between w-full px-1.5 absolute inset-0 items-center z-0">
                <Moon className="w-3.5 h-3.5 text-slate-400 dark:text-indigo-300 transition-colors" />
                <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-slate-500 transition-colors" />
              </div>
              <div
                className={`w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-300 ease-out flex items-center justify-center z-10 ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              >
                {darkMode ? (
                  <Moon className="w-3 h-3 text-indigo-500" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500" />
                )}
              </div>
            </button>

            <Link
              href="/tools"
              className="bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-xs font-bold transition border border-indigo-200/60 dark:border-indigo-800/60"
            >
              All Tools Directory
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-full transition cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* ============================================================
          2. PAGE HERO & TITLE
      ============================================================ */}
      <main className="flex-1 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-5"
          >
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Tools
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-semibold">
              Image Resizer & Crop
            </span>
          </nav>

          {/* Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/70 dark:border-slate-800/70 pb-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/70 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% In-Browser & Privacy Safe</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Image Resizer & Crop
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Resize and crop your images online with precise dimensions, aspect ratios, and easy export.
              </p>
            </div>

            {/* Privacy Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold self-start sm:self-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Your image is processed locally in your browser</span>
            </div>
          </div>

          {/* ============================================================
              3. WORKSPACE: UPLOAD ZONE OR TWO-COLUMN EDITOR
          ============================================================ */}
          {!imageElement ? (
            /* INITIAL EMPTY / UPLOAD STATE */
            <div className="max-w-4xl mx-auto my-8">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-3xl p-8 sm:p-14 text-center transition-all flex flex-col items-center justify-center relative ${
                  isDraggingOver
                    ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 scale-[1.01]"
                    : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif, image/avif"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                  Upload an image
                </h2>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Drag & drop your image here
                </p>
                <p className="text-xs text-slate-400 max-w-sm mb-6">
                  JPG, PNG, WebP and other common image formats supported. No server upload.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/45 transition flex items-center gap-2 cursor-pointer"
                  >
                    <ImagePlus className="w-4 h-4" />
                    <span>Choose Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const items = await navigator.clipboard.read();
                        for (const item of items) {
                          for (const type of item.types) {
                            if (type.startsWith("image/")) {
                              const blob = await item.getType(type);
                              handleFile(blob);
                              return;
                            }
                          }
                        }
                        alert("No image found on clipboard. Copy an image first, or press Ctrl+V directly.");
                      } catch {
                        alert("Clipboard access denied or not supported. Press Ctrl+V directly to paste.");
                      }
                    }}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Clipboard className="w-4 h-4 text-indigo-500" />
                    <span>Paste Image (Ctrl+V)</span>
                  </button>
                </div>

                {uploadError && (
                  <div className="mt-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* EDITOR WORKSPACE: TWO COLUMN LAYOUT */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ========================================================= */}
              {/* LEFT COLUMN: IMAGE PREVIEW & CROPPER CANVAS (7 cols)       */}
              {/* ========================================================= */}
              <div className="lg:col-span-7 space-y-4">
                {/* Image Top Info Bar */}
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileImage className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                        {imageMeta?.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Original: {imageMeta?.width} × {imageMeta?.height} px · {formatBytes(imageMeta?.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCropping(!isCropping)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isCropping
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                          : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <CropIcon className="w-3.5 h-3.5" />
                      <span>{isCropping ? "Cropping Active" : "Crop Area"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      Replace
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Main Interactive Canvas Surface */}
                <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-3 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                  <ImageCropperCanvas
                    image={imageElement}
                    rotation={rotation}
                    flipH={flipH}
                    flipV={flipV}
                    crop={crop}
                    setCrop={setCrop}
                    isCropping={isCropping}
                    aspectRatio={activeAspectRatioValue}
                    onApplyCrop={handleApplyCrop}
                    onCancelCrop={handleCancelCrop}
                  />

                  {/* Crop Status Indicator */}
                  {appliedCrop && !isCropping && (
                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300">
                      <span className="font-semibold">
                        Cropped region active ({Math.round(appliedCrop.width)} × {Math.round(appliedCrop.height)} px)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCrop(null);
                          setCrop({
                            x: 0,
                            y: 0,
                            width: transformedDimensions.width,
                            height: transformedDimensions.height,
                          });
                          setResizeWidth(transformedDimensions.width);
                          setResizeHeight(transformedDimensions.height);
                        }}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Clear Crop
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================= */}
              {/* RIGHT COLUMN: CONTROL PANEL (5 cols)                      */}
              {/* ========================================================= */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 shadow-xs border border-slate-200/80 dark:border-slate-800">
                  {/* Tool Category Tabs */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 overflow-x-auto no-scrollbar">
                    {[
                      { id: "resize", label: "Resize", icon: Sliders },
                      { id: "crop", label: "Crop", icon: CropIcon },
                      { id: "transform", label: "Transform", icon: RotateCw },
                      { id: "export", label: "Export", icon: Download },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                            isActive
                              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* ---------------------------------------------------- */}
                  {/* TAB 1: RESIZE                                        */}
                  {/* ---------------------------------------------------- */}
                  {activeTab === "resize" && (
                    <div className="space-y-6">
                      {/* Resize Mode: Pixels vs Percentage */}
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Resize By
                        </label>
                        <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setResizeMode("pixels")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              resizeMode === "pixels"
                                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                                : "text-slate-500"
                            }`}
                          >
                            Pixels
                          </button>
                          <button
                            type="button"
                            onClick={() => setResizeMode("percentage")}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              resizeMode === "percentage"
                                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                                : "text-slate-500"
                            }`}
                          >
                            Percentage
                          </button>
                        </div>
                      </div>

                      {/* Pixels Input Mode */}
                      {resizeMode === "pixels" ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Width (px)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10000"
                                value={resizeWidth}
                                onChange={(e) => handleWidthChange(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                Height (px)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10000"
                                value={resizeHeight}
                                onChange={(e) => handleHeightChange(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-600"
                              />
                            </div>
                          </div>

                          {/* Aspect Ratio Lock Button */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setLockAspectRatio(!lockAspectRatio)}
                              className={`w-full p-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${
                                lockAspectRatio
                                  ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                              }`}
                            >
                              {lockAspectRatio ? (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Lock aspect ratio (ON)</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Aspect ratio unlocked (OFF)</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Percentage Mode */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              Scale Image
                            </span>
                            <span className="font-mono font-extrabold text-indigo-600">
                              {percentageScale}%
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            {PERCENTAGE_PRESETS.map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handlePercentageChange(pct)}
                                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                                  percentageScale === pct
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>

                          <input
                            type="range"
                            min="10"
                            max="200"
                            step="5"
                            value={percentageScale}
                            onChange={(e) => handlePercentageChange(Number(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Dimension Presets Dropdown / Quick Picks */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Popular Dimension Presets
                        </label>
                        <div className="space-y-3">
                          {DIMENSION_PRESETS.map((group) => (
                            <div key={group.category} className="space-y-1.5">
                              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                {group.category}
                              </p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {group.items.map((p) => (
                                  <button
                                    key={p.name}
                                    type="button"
                                    onClick={() => applyDimensionPreset(p)}
                                    className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 text-left transition group cursor-pointer"
                                  >
                                    <p className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                      {p.name}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-mono">
                                      {p.width} × {p.height}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TAB 2: CROP                                          */}
                  {/* ---------------------------------------------------- */}
                  {activeTab === "crop" && (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Aspect Ratio Presets
                          </label>
                          {isCropping && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Interactive box active
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {ASPECT_RATIOS.map((ar) => {
                            const isSelected = cropRatioId === ar.id;
                            return (
                              <button
                                key={ar.id}
                                type="button"
                                onClick={() => handleSelectCropRatio(ar.id)}
                                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                                  isSelected
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {ar.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Alignment Shortcuts */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Align Crop Area
                        </label>
                        <div className="grid grid-cols-5 gap-1.5">
                          {[
                            { id: "center", label: "Center" },
                            { id: "top", label: "Top" },
                            { id: "bottom", label: "Bottom" },
                            { id: "left", label: "Left" },
                            { id: "right", label: "Right" },
                          ].map((al) => (
                            <button
                              key={al.id}
                              type="button"
                              onClick={() => alignCrop(al.id)}
                              className="py-1.5 px-2 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition text-center cursor-pointer"
                            >
                              {al.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Crop Action Buttons */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!isCropping) {
                              setIsCropping(true);
                            } else {
                              handleApplyCrop();
                            }
                          }}
                          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CropIcon className="w-4 h-4" />
                          <span>{isCropping ? "Apply Selected Crop" : "Open Crop Box"}</span>
                        </button>

                        {appliedCrop && (
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCrop(null);
                              setCrop({
                                x: 0,
                                y: 0,
                                width: transformedDimensions.width,
                                height: transformedDimensions.height,
                              });
                            }}
                            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                          >
                            Reset Crop
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TAB 3: TRANSFORM (ROTATE & FLIP)                     */}
                  {/* ---------------------------------------------------- */}
                  {activeTab === "transform" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Rotation ({rotation}°)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleRotate(-90)}
                            className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 text-indigo-500" />
                            <span>Rotate 90° Left</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRotate(90)}
                            className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <RotateCw className="w-4 h-4 text-indigo-500" />
                            <span>Rotate 90° Right</span>
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Flip Orientation
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setFlipH(!flipH)}
                            className={`py-3 px-3 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer text-xs font-bold ${
                              flipH
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <FlipHorizontal className="w-4 h-4" />
                            <span>Flip Horizontal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFlipV(!flipV)}
                            className={`py-3 px-3 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer text-xs font-bold ${
                              flipV
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <FlipVertical className="w-4 h-4" />
                            <span>Flip Vertical</span>
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reset All Transforms</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ---------------------------------------------------- */}
                  {/* TAB 4: EXPORT                                        */}
                  {/* ---------------------------------------------------- */}
                  {activeTab === "export" && (
                    <div className="space-y-6">
                      {/* Format Selector */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Export Format
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "image/jpeg", label: "JPG" },
                            { id: "image/png", label: "PNG" },
                            { id: "image/webp", label: "WebP" },
                          ].map((fmt) => (
                            <button
                              key={fmt.id}
                              type="button"
                              onClick={() => setExportFormat(fmt.id)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer ${
                                exportFormat === fmt.id
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {fmt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality Slider (for JPG & WebP) */}
                      {exportFormat !== "image/png" && (
                        <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              Image Quality
                            </span>
                            <span className="font-mono font-bold text-indigo-600">
                              {exportQuality}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="100"
                            step="1"
                            value={exportQuality}
                            onChange={(e) => setExportQuality(Number(e.target.value))}
                            className="w-full accent-indigo-600 cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Before / After Specs */}
                      <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Original Size:</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {imageMeta?.width} × {imageMeta?.height} px ({formatBytes(imageMeta?.size)})
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                            <span className="text-slate-500">Output Size:</span>
                            <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                              {Math.round(resizeWidth)} × {Math.round(resizeHeight)} px
                              {estimatedSize ? ` (~${estimatedSize})` : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Primary Download CTA (Always Visible) */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <button
                      type="button"
                      onClick={handleDownload}
                      disabled={isProcessingExport || !resizeWidth || !resizeHeight}
                      className="w-full py-4 rounded-2xl font-extrabold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 transition flex items-center justify-center gap-2.5 text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isProcessingExport ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{isProcessingExport ? "Processing Image…" : "Download Image"}</span>
                    </button>

                    <p className="text-[11px] text-center text-slate-400">
                      Processed directly in your browser with high-quality resampling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================
              4. EDUCATIONAL & SEO GUIDE SECTION
          ============================================================ */}
          <div className="mt-16 bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 space-y-8">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Info className="w-5 h-5" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider">
                About Rootixa Image Resizer & Crop
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  High-Fidelity Resizing
                </h3>
                <p>
                  Uses hardware-accelerated bicubic canvas interpolation to prevent pixelation and maintain clarity. Lock the aspect ratio to prevent distorted stretching across web and social dimensions.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Interactive Visual Cropper
                </h3>
                <p>
                  Cut unwanted background elements and align your subject with rule-of-thirds grid lines. Choose standard ratios like 1:1, 16:9, or 9:16 for YouTube, Instagram, or presentation slides.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Zero Server Uploads
                </h3>
                <p>
                  Your images never leave your device. All decoding, cropping, resizing, and encoding are performed 100% inside your browser, guaranteeing complete privacy and zero latency.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Private & Secure Client Processing
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Zero Network Latency
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Universal Web, Social & Print Formats
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
          5. ROOTIXA FOOTER
      ============================================================ */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090E17] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
                </span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Free online tools for work, study, and everyday tasks. Fast, clean, and private
                digital utilities right in your browser.
              </p>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Tools
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li>
                  <Link
                    href="/image-resizer"
                    className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5"
                  >
                    <span>Image Resizer & Crop</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      Live
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/qr-code"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    QR & Barcode Studio
                  </Link>
                </li>
                <li>
                  <Link
                    href="/lorem-ipsum"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Lorem Ipsum Generator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    All Tools Directory
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li>
                  <Link
                    href="/#popular-tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Popular Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#why-rootixa"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Why Rootixa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Feedback & Suggestions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400 text-center">
            <p>&copy; {new Date().getFullYear()} Rootixa. All rights reserved.</p>
            <p>
              A product Of{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wide">
                SW-IT
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
