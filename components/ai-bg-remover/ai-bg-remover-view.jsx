"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  UploadCloud,
  Sparkles,
  Layers,
  Palette,
  Sliders,
  Download,
  Check,
  RefreshCw,
  Trash2,
  FileImage,
  Info,
  ShieldCheck,
  Zap,
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
  Move,
  Maximize2,
  ChevronsLeftRight,
  Split,
  Eye,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { BeforeAfterSlider } from "./before-after-slider";
import {
  BACKGROUND_TYPES,
  COLOR_SWATCHES,
  GRADIENT_PRESETS,
  ENHANCE_MODES,
  VIEW_MODES,
  DEFAULT_TRANSFORM,
} from "@/lib/ai-bg-remover/types";
import { imageProcessingService } from "@/lib/ai-bg-remover/service";
import {
  compositeImage,
  exportCanvasToBlob,
  generateDownloadFilename,
  triggerFileDownload,
} from "@/lib/ai-bg-remover/compositor";

export function AIBgRemoverView() {
  const [mounted, setMounted] = useState(false);

  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Usage stats state
  const [usageCount, setUsageCount] = useState(0);

  // Sync initial client state after mount to avoid hydration mismatch
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      try {
        const savedTheme = localStorage.getItem("rootixa_theme");
        if (savedTheme) {
          setDarkMode(savedTheme === "dark");
        } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          setDarkMode(true);
        }
      } catch {
        // ignore
      }
      setUsageCount(imageProcessingService.getUsageCount());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (!mounted) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("rootixa_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("rootixa_theme", "light");
    }
  }, [darkMode, mounted]);

  // Uploaded Image State
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [originalSize, setOriginalSize] = useState(0);
  const [originalMime, setOriginalMime] = useState("image/jpeg");
  const [isDragOver, setIsDragOver] = useState(false);

  // Processed Canvas Pipeline State
  // subjectCanvas holds the subject with transparent background (or enhanced image)
  const [subjectCanvas, setSubjectCanvas] = useState(null);
  const [rawMaskBlob, setRawMaskBlob] = useState(null);
  const rawMaskUrl = useMemo(() => {
    if (!rawMaskBlob) return null;
    return URL.createObjectURL(rawMaskBlob);
  }, [rawMaskBlob]);
  const [isBgRemoved, setIsBgRemoved] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [enhancedMode, setEnhancedMode] = useState(null);

  // Processing Progress States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Editor Tabs: 'ai' | 'background' | 'subject' | 'export'
  const [activeTab, setActiveTab] = useState("ai");

  // View Mode: 'slider' | 'split' | 'result'
  const [viewMode, setViewMode] = useState(VIEW_MODES.SLIDER);

  // Background Customization State
  const [bgType, setBgType] = useState(BACKGROUND_TYPES.TRANSPARENT);
  const [solidColor, setSolidColor] = useState("#FFFFFF");
  const [gradientSettings, setGradientSettings] = useState(GRADIENT_PRESETS[0]);
  const [bgImageFile, setBgImageFile] = useState(null);
  const [bgImageElement, setBgImageElement] = useState(null);

  // Subject Transform State
  const [transform, setTransform] = useState(DEFAULT_TRANSFORM);

  // Export State
  const [exportFormat, setExportFormat] = useState("png"); // 'png' | 'jpg' | 'webp'
  const [exportQuality, setExportQuality] = useState(92);
  const [exportNotice, setExportNotice] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const fileInputRef = useRef(null);
  const bgFileInputRef = useRef(null);

  // Clean format byte size
  const formatBytes = (bytes, decimals = 1) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Handle Image File Loading
  const handleLoadFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please upload a valid image file (JPG, PNG, WebP, etc.)");
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setErrorMessage("File size exceeds 30MB limit. Please upload a smaller image.");
      return;
    }

    setErrorMessage("");
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setImageFile(file);
      setImageSrc(url);
      setOriginalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setOriginalSize(file.size);
      setOriginalMime(file.type);

      // Initialize subject canvas with original image
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      setSubjectCanvas(canvas);
      setRawMaskBlob(null);
      setIsBgRemoved(false);
      setIsEnhanced(false);
      setEnhancedMode(null);
      setBgType(BACKGROUND_TYPES.TRANSPARENT);
      setTransform(DEFAULT_TRANSFORM);
      setActiveTab("ai");
      setViewMode(VIEW_MODES.SLIDER);
    };

    img.onerror = () => {
      setErrorMessage("Could not parse image. The file may be corrupted.");
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, []);

  // Global Clipboard Paste Listener
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData && e.clipboardData.items) {
        for (let i = 0; i < e.clipboardData.items.length; i++) {
          const item = e.clipboardData.items[i];
          if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              handleLoadFile(blob);
              break;
            }
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleLoadFile]);

  // Load Custom Background Image
  const handleLoadBgImage = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBgImageFile(file);
      setBgImageElement(img);
      setBgType(BACKGROUND_TYPES.IMAGE);
    };
    img.src = url;
  };

  // Perform AI Background Removal
  const handleRemoveBackground = async () => {
    if (!subjectCanvas) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const inputSource = (!isEnhanced && imageFile) ? imageFile : subjectCanvas;
      const result = await imageProcessingService.removeBackground(
        inputSource,
        (step, pct) => {
          setProcessingStep(step);
          setProcessingProgress(pct);
        }
      );

      setSubjectCanvas(result.canvas);
      setRawMaskBlob(result.rawMaskBlob || null);
      setIsBgRemoved(true);
      setUsageCount(imageProcessingService.getUsageCount());
      setActiveTab("background");
    } catch (err) {
      setErrorMessage(
        err.message || "Failed to remove background. Please try another image."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Perform AI Image Enhancement
  const handleEnhance = async (mode = ENHANCE_MODES.AUTO) => {
    if (!subjectCanvas) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const result = await imageProcessingService.enhanceImage(
        subjectCanvas,
        mode,
        (step, pct) => {
          setProcessingStep(step);
          setProcessingProgress(pct);
        }
      );

      setSubjectCanvas(result.canvas);
      setIsEnhanced(true);
      setEnhancedMode(mode);
      setUsageCount(imageProcessingService.getUsageCount());
    } catch (err) {
      setErrorMessage(
        err.message || "Enhancement failed. Please try another image."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset to Original Image
  const handleResetToOriginal = () => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      setSubjectCanvas(canvas);
      setRawMaskBlob(null);
      setIsBgRemoved(false);
      setIsEnhanced(false);
      setEnhancedMode(null);
      setBgType(BACKGROUND_TYPES.TRANSPARENT);
      setTransform(DEFAULT_TRANSFORM);
      setErrorMessage("");
    };
    img.src = imageSrc;
  };

  // Live Composited Output Canvas
  const compositedCanvas = useMemo(() => {
    if (!subjectCanvas) return null;
    return compositeImage({
      subjectCanvas,
      bgType,
      bgColor: solidColor,
      bgGradient: gradientSettings,
      bgImage: bgImageElement,
      transform,
    });
  }, [subjectCanvas, bgType, solidColor, gradientSettings, bgImageElement, transform]);

  // Output Dimensions
  const currentOutputDimensions = useMemo(() => {
    if (!compositedCanvas) return originalDimensions;
    return {
      width: compositedCanvas.width,
      height: compositedCanvas.height,
    };
  }, [compositedCanvas, originalDimensions]);

  // Handle Final Image Download
  const handleDownload = async () => {
    if (!compositedCanvas) return;
    setIsExporting(true);
    setExportNotice("");

    try {
      const { blob, notice } = await exportCanvasToBlob({
        canvas: compositedCanvas,
        format: exportFormat,
        quality: exportQuality / 100,
        bgType,
      });

      if (notice) {
        setExportNotice(notice);
      }

      const filename = generateDownloadFilename(
        imageFile?.name || "rootixa-image",
        isEnhanced,
        isBgRemoved,
        exportFormat
      );

      triggerFileDownload(blob, filename);
      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (err) {
      setErrorMessage("Download generation failed: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Aspect Ratio for Preview
  const previewAspectRatio = useMemo(() => {
    if (originalDimensions.width && originalDimensions.height) {
      return originalDimensions.width / originalDimensions.height;
    }
    return 16 / 9;
  }, [originalDimensions]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-fuchsia-500 selection:text-white">
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-fuchsia-600/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  Rootixa<span className="text-fuchsia-600">.</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                  AI Studio
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200 dark:border-slate-800">
              <Link
                href="/"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/tools"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                All Tools
              </Link>
              <Link
                href="/image-resizer"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                Image Resizer
              </Link>
              <Link
                href="/qr-code"
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
              >
                QR Studio
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Usage Counter Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-fuchsia-50 dark:bg-fuchsia-950/40 border border-fuchsia-200 dark:border-fuchsia-900/50 text-[11px] font-bold text-fuchsia-700 dark:text-fuchsia-300">
              <Zap className="w-3.5 h-3.5 text-fuchsia-500" />
              <span suppressHydrationWarning>AI Ops: {mounted ? usageCount : 0}</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Toggle theme"
              suppressHydrationWarning
            >
              {mounted && darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tools"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Tools Directory
            </Link>
            <Link
              href="/image-resizer"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              Image Resizer & Crop
            </Link>
          </div>
        )}
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
          <Link href="/" className="hover:text-fuchsia-600 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link href="/tools" className="hover:text-fuchsia-600 transition-colors">
            Tools
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            AI Background Remover & Enhancer
          </span>
        </nav>

        {/* Hero Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-800 dark:text-fuchsia-300 text-xs font-bold mb-3 border border-fuchsia-200 dark:border-fuchsia-800/40">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />
              <span>Real In-Browser Neural Vision</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Background Remover & Enhancer
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-2xl">
              Remove backgrounds and enhance your images with AI in seconds. 100% private, client-side processing with custom colors, gradients, and 2× super-resolution upscaling.
            </p>
          </div>

          {/* Privacy Guarantee Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium self-start md:self-end">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{imageProcessingService.getPrivacyStatement()}</span>
          </div>
        </div>

        {/* Error Notification Alert with Retry Action */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5 sm:mt-0" />
              <div className="font-medium">{errorMessage}</div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleRemoveBackground}
                className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Retry
              </button>
              <button
                onClick={() => setErrorMessage("")}
                className="text-rose-500 hover:text-rose-700 p-0.5 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. WORKSPACE: UPLOAD CARD vs INTERACTIVE EDITOR */}
        {!imageSrc ? (
          /* ========================================================
             INITIAL UPLOAD SCREEN
             ======================================================== */
          <div className="w-full max-w-3xl mx-auto my-6">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleLoadFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`group relative rounded-3xl border-2 border-dashed p-10 sm:p-16 text-center cursor-pointer transition-all duration-200 shadow-xl ${
                isDragOver
                  ? "border-fuchsia-500 bg-fuchsia-50/60 dark:bg-fuchsia-950/30 scale-[1.01]"
                  : "border-slate-300 dark:border-slate-800 hover:border-fuchsia-500/70 bg-white dark:bg-slate-900/70 hover:bg-slate-50/70 dark:hover:bg-slate-900"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleLoadFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-fuchsia-500/10 to-indigo-500/10 dark:from-fuchsia-500/20 dark:to-indigo-500/20 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner mb-6">
                <UploadCloud className="w-10 h-10" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Upload an image
              </h2>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2">
                Drag & drop your image here, or{" "}
                <span className="text-fuchsia-600 dark:text-fuchsia-400 underline underline-offset-4">
                  browse files
                </span>
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <Clipboard className="w-3.5 h-3.5 text-fuchsia-500" />
                  Paste image (Ctrl+V)
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  JPG, PNG, WebP, BMP up to 30MB
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  100% In-Browser Privacy
                </span>
              </div>
            </div>

            {/* Quick Demo Previews */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600 mx-auto flex items-center justify-center mb-2 font-bold">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Portrait Cutouts</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Isolate people and faces with clean, natural hair edges.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center mb-2 font-bold">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">E-Commerce Products</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Clean transparent cuts for white Amazon/Shopify backdrops.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center mb-2 font-bold">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">2× AI Upscaling</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Restore clarity and double image resolution for printing.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
             ACTIVE EDITOR WORKSPACE
             ======================================================== */
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: PREVIEW CARD & COMPARISON (7 COLS) */}
            <div className="w-full lg:col-span-7 flex flex-col gap-4">
              {/* Top View Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                {/* View Mode Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode(VIEW_MODES.SLIDER)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === VIEW_MODES.SLIDER
                        ? "bg-white dark:bg-slate-900 text-fuchsia-600 dark:text-fuchsia-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split Slider</span>
                  </button>

                  <button
                    onClick={() => setViewMode(VIEW_MODES.SPLIT)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === VIEW_MODES.SPLIT
                        ? "bg-white dark:bg-slate-900 text-fuchsia-600 dark:text-fuchsia-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Side-by-Side</span>
                  </button>

                  <button
                    onClick={() => setViewMode(VIEW_MODES.RESULT)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      viewMode === VIEW_MODES.RESULT
                        ? "bg-white dark:bg-slate-900 text-fuchsia-600 dark:text-fuchsia-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Result Only</span>
                  </button>
                </div>

                {/* Replace & Reset Quick Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetToOriginal}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Revert to original uploaded image"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Revert</span>
                  </button>

                  <button
                    onClick={() => {
                      setImageSrc(null);
                      setImageFile(null);
                      setSubjectCanvas(null);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">New Image</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Preview Display */}
              <div className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[360px] flex items-center justify-center p-2 sm:p-4">
                {/* Visual Processing State Overlay */}
                {isProcessing && (
                  <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-fuchsia-500/20 animate-ping" />
                      <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-fuchsia-400 animate-pulse" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      {processingStep || "Processing image..."}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Running in-browser vision calculations without sending data to servers.
                    </p>
                    <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 transition-all duration-300 rounded-full"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* View Mode 1: Interactive Split-Slider */}
                {viewMode === VIEW_MODES.SLIDER && (
                  <BeforeAfterSlider
                    originalSrc={imageSrc}
                    processedCanvas={compositedCanvas}
                    aspectRatio={previewAspectRatio}
                    beforeLabel="Original"
                    afterLabel={isBgRemoved ? "Background Removed" : "Active Preview"}
                    className="w-full"
                  />
                )}

                {/* View Mode 2: Side-by-Side Dual View */}
                {viewMode === VIEW_MODES.SPLIT && (
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center aspect-video sm:aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold">
                        Original
                      </span>
                    </div>

                    <div
                      className="relative rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center aspect-video sm:aspect-square"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                      }}
                    >
                      {compositedCanvas && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={compositedCanvas.toDataURL("image/png")}
                          alt="Processed"
                          className="w-full h-full object-contain"
                        />
                      )}
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-bold">
                        {isBgRemoved ? "Cutout" : "Result"}
                      </span>
                    </div>
                  </div>
                )}

                {/* View Mode 3: Full Result Canvas with Checkerboard */}
                {viewMode === VIEW_MODES.RESULT && (
                  <div
                    className="relative w-full rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{
                      aspectRatio: `${previewAspectRatio}`,
                      maxHeight: "68vh",
                      backgroundImage:
                        bgType === BACKGROUND_TYPES.TRANSPARENT
                          ? "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)"
                          : "none",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                    }}
                  >
                    {compositedCanvas && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={compositedCanvas.toDataURL("image/png")}
                        alt="Final Result"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Image Metadata Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Original</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">
                      {originalDimensions.width} × {originalDimensions.height} px
                    </span>
                  </div>
                  <div className="w-px h-6 bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">File Size</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">
                      {formatBytes(originalSize)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Output</span>
                    <span className="text-fuchsia-600 dark:text-fuchsia-400 font-bold">
                      {currentOutputDimensions.width} × {currentOutputDimensions.height} px
                      {isEnhanced && enhancedMode === ENHANCE_MODES.UPSCALE_2X && " (2× UHD)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* DEV ONLY: AI MASK INSPECTOR (Requirement 14) */}
              {process.env.NODE_ENV === "development" && rawMaskUrl && (
                <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-dashed border-amber-400/50 text-xs">
                  <div className="flex items-center justify-between mb-3 text-amber-700 dark:text-amber-300 font-bold font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      <span>DEBUG ONLY: AI SEGMENTATION MASK INSPECTOR</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-[9px] uppercase font-mono">
                      Dev Mode
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageSrc} alt="Original" className="w-full aspect-video object-contain" />
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">1. Original Image</span>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-black border border-slate-700/50 p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={rawMaskUrl} alt="Raw Neural Mask" className="w-full aspect-video object-contain" />
                      <span className="text-[10px] text-amber-400 font-semibold block mt-1">2. Raw AI Mask</span>
                    </div>
                    <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/50 p-1">
                      {compositedCanvas && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={compositedCanvas.toDataURL("image/png")} alt="Final Cutout" className="w-full aspect-video object-contain" />
                      )}
                      <span className="text-[10px] text-emerald-400 font-semibold block mt-1">3. Final Cutout</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: CONTROLS & SETTINGS PANEL (5 COLS) */}
            <div className="w-full lg:col-span-5 flex flex-col gap-4">
              {/* Tab Navigation */}
              <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setActiveTab("ai")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "ai"
                      ? "bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Tools</span>
                </button>

                <button
                  onClick={() => setActiveTab("background")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "background"
                      ? "bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Backdrop</span>
                </button>

                <button
                  onClick={() => setActiveTab("subject")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "subject"
                      ? "bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>Subject</span>
                </button>

                <button
                  onClick={() => setActiveTab("export")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "export"
                      ? "bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>
              </div>

              {/* CARD: ACTIVE TAB SETTINGS */}
              <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                {/* ========================================================
                    TAB 1: AI TOOLS (Background Removal & Enhancement)
                    ======================================================== */}
                {activeTab === "ai" && (
                  <div className="space-y-6">
                    {/* Primary Background Removal Action */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          1. Background Isolation
                        </label>
                        {isBgRemoved && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" /> Cutout Active
                          </span>
                        )}
                      </div>

                      <button
                        onClick={handleRemoveBackground}
                        disabled={isProcessing}
                        className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/20 hover:shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{isBgRemoved ? "Re-calculate Cutout" : "Remove Background"}</span>
                      </button>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        Extracts people, products, or animals onto a crystal-clear transparent canvas.
                      </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          2. AI Image Enhancer
                        </label>
                        {isEnhanced && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-md">
                            <Check className="w-3 h-3" /> Enhanced
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => handleEnhance(ENHANCE_MODES.AUTO)}
                          disabled={isProcessing}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-left transition-all cursor-pointer"
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Auto Enhance
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            Clarity, unsharp mask & adaptive contrast tone mapping.
                          </p>
                        </button>

                        <button
                          onClick={() => handleEnhance(ENHANCE_MODES.UPSCALE_2X)}
                          disabled={isProcessing}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-fuchsia-500 dark:hover:border-fuchsia-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-left transition-all cursor-pointer"
                        >
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                            Upscale 2×
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                            Doubles resolution grid with bicubic resampling.
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    TAB 2: BACKGROUND CUSTOMIZATION
                    ======================================================== */}
                {activeTab === "background" && (
                  <div className="space-y-6">
                    {/* Background Type Radio Selector */}
                    <div>
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-3">
                        Backdrop Mode
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          onClick={() => setBgType(BACKGROUND_TYPES.TRANSPARENT)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                            bgType === BACKGROUND_TYPES.TRANSPARENT
                              ? "border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] [background-size:6px_6px]" />
                          <span>Transparent</span>
                        </button>

                        <button
                          onClick={() => setBgType(BACKGROUND_TYPES.SOLID)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                            bgType === BACKGROUND_TYPES.SOLID
                              ? "border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 bg-indigo-600" />
                          <span>Solid Color</span>
                        </button>

                        <button
                          onClick={() => setBgType(BACKGROUND_TYPES.GRADIENT)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                            bgType === BACKGROUND_TYPES.GRADIENT
                              ? "border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <div className="w-5 h-5 rounded bg-gradient-to-r from-orange-400 to-pink-500" />
                          <span>Gradient</span>
                        </button>

                        <button
                          onClick={() => setBgType(BACKGROUND_TYPES.IMAGE)}
                          className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                            bgType === BACKGROUND_TYPES.IMAGE
                              ? "border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          <FileImage className="w-5 h-5 text-emerald-500" />
                          <span>Custom Pic</span>
                        </button>
                      </div>
                    </div>

                    {/* Sub-option: Solid Color Palette */}
                    {bgType === BACKGROUND_TYPES.SOLID && (
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Color Swatches
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {COLOR_SWATCHES.map((swatch) => (
                            <button
                              key={swatch.id}
                              onClick={() => setSolidColor(swatch.color)}
                              className={`w-7 h-7 rounded-lg border transition-transform ${
                                solidColor.toUpperCase() === swatch.color.toUpperCase()
                                  ? "scale-110 border-fuchsia-600 shadow-md ring-2 ring-fuchsia-400/30"
                                  : "border-slate-300 dark:border-slate-700 hover:scale-105"
                              }`}
                              style={{ backgroundColor: swatch.color }}
                              title={swatch.label}
                            />
                          ))}
                        </div>

                        {/* Custom Hex Picker Input */}
                        <div className="flex items-center gap-3 pt-2">
                          <input
                            type="color"
                            value={solidColor}
                            onChange={(e) => setSolidColor(e.target.value)}
                            className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-transparent"
                          />
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                              #
                            </span>
                            <input
                              type="text"
                              value={solidColor.replace("#", "")}
                              onChange={(e) => setSolidColor("#" + e.target.value)}
                              maxLength={6}
                              className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase focus:outline-hidden focus:ring-2 focus:ring-fuchsia-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-option: Gradient Presets */}
                    {bgType === BACKGROUND_TYPES.GRADIENT && (
                      <div className="space-y-4 pt-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          Design Gradients
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {GRADIENT_PRESETS.map((grad) => (
                            <button
                              key={grad.id}
                              onClick={() => setGradientSettings(grad)}
                              className={`p-2 rounded-xl border text-[11px] font-bold text-left transition-all ${
                                gradientSettings.id === grad.id
                                  ? "border-fuchsia-600 ring-2 ring-fuchsia-500/20 shadow-xs"
                                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                              }`}
                            >
                              <div
                                className="w-full h-7 rounded-lg mb-1.5"
                                style={{
                                  background: `linear-gradient(${grad.angle}deg, ${grad.start}, ${grad.end})`,
                                }}
                              />
                              <span className="truncate block text-slate-800 dark:text-slate-200">
                                {grad.label}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Angle Slider */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-xs font-semibold mb-1">
                            <span className="text-slate-600 dark:text-slate-400">Angle Direction</span>
                            <span className="font-mono text-fuchsia-600">{gradientSettings.angle}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={gradientSettings.angle}
                            onChange={(e) =>
                              setGradientSettings({
                                ...gradientSettings,
                                angle: parseInt(e.target.value, 10),
                              })
                            }
                            className="w-full accent-fuchsia-600 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {/* Sub-option: Custom Background Image Upload */}
                    {bgType === BACKGROUND_TYPES.IMAGE && (
                      <div className="space-y-3 pt-2">
                        <input
                          ref={bgFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleLoadBgImage(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />

                        {bgImageFile ? (
                          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2.5 truncate">
                              <FileImage className="w-4 h-4 text-fuchsia-500 shrink-0" />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                {bgImageFile.name}
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                setBgImageFile(null);
                                setBgImageElement(null);
                                setBgType(BACKGROUND_TYPES.TRANSPARENT);
                              }}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Remove background image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => bgFileInputRef.current?.click()}
                            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-fuchsia-500 flex flex-col items-center gap-2 transition-colors cursor-pointer"
                          >
                            <UploadCloud className="w-6 h-6 text-fuchsia-500" />
                            <span>Upload Backdrop Image</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ========================================================
                    TAB 3: SUBJECT POSITIONING & SCALE
                    ======================================================== */}
                {activeTab === "subject" && (
                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Subject Scale</span>
                        <span className="font-mono text-fuchsia-600 font-bold">
                          {Math.round(transform.scale * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="1.8"
                        step="0.05"
                        value={transform.scale}
                        onChange={(e) =>
                          setTransform({ ...transform, scale: parseFloat(e.target.value) })
                        }
                        className="w-full accent-fuchsia-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Horizontal Offset (X)</span>
                        <span className="font-mono text-slate-500">{transform.x} px</span>
                      </div>
                      <input
                        type="range"
                        min="-250"
                        max="250"
                        step="5"
                        value={transform.x}
                        onChange={(e) =>
                          setTransform({ ...transform, x: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-fuchsia-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Vertical Offset (Y)</span>
                        <span className="font-mono text-slate-500">{transform.y} px</span>
                      </div>
                      <input
                        type="range"
                        min="-250"
                        max="250"
                        step="5"
                        value={transform.y}
                        onChange={(e) =>
                          setTransform({ ...transform, y: parseInt(e.target.value, 10) })
                        }
                        className="w-full accent-fuchsia-600 cursor-pointer"
                      />
                    </div>

                    <button
                      onClick={() => setTransform(DEFAULT_TRANSFORM)}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Center & Reset Transform
                    </button>
                  </div>
                )}

                {/* ========================================================
                    TAB 4: EXPORT & DOWNLOAD
                    ======================================================== */}
                {activeTab === "export" && (
                  <div className="space-y-5">
                    {/* Format Selector */}
                    <div>
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                        Export Format
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["png", "jpg", "webp"].map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => setExportFormat(fmt)}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase transition-all ${
                              exportFormat === fmt
                                ? "border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 text-fuchsia-600 dark:text-fuchsia-400 shadow-xs"
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>

                      {/* Format Transparency Notice */}
                      {exportFormat === "jpg" && bgType === BACKGROUND_TYPES.TRANSPARENT && (
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>JPG does not support transparency. Output will have a solid white background.</span>
                        </p>
                      )}
                      {exportFormat === "png" && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Recommended format for full alpha-channel transparency.</span>
                        </p>
                      )}
                    </div>

                    {/* Quality Slider (JPG & WebP only) */}
                    {exportFormat !== "png" && (
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700 dark:text-slate-300">Image Quality</span>
                          <span className="font-mono text-fuchsia-600 font-bold">{exportQuality}%</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="100"
                          value={exportQuality}
                          onChange={(e) => setExportQuality(parseInt(e.target.value, 10))}
                          className="w-full accent-fuchsia-600 cursor-pointer"
                        />
                      </div>
                    )}

                    {exportNotice && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        {exportNotice}
                      </div>
                    )}

                    {/* Primary Download Action */}
                    <button
                      onClick={handleDownload}
                      disabled={isExporting}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-fuchsia-600/20 hover:shadow-fuchsia-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isDownloaded ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-300" />
                          <span>Downloaded Successfully!</span>
                        </>
                      ) : isExporting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Preparing File...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download Image</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. EDUCATIONAL SEO & FAQ SECTION */}
        <section className="mt-16 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white text-center mb-4">
              Professional AI Cutouts with Complete Privacy
            </h2>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
              Learn how Rootixa isolates subjects, prevents edge halos, and restores pixel fidelity directly in your browser.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-950/60 text-fuchsia-600 flex items-center justify-center mb-4 font-extrabold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  Zero Server Uploads
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Unlike traditional cloud background removers that store your private photos on remote servers, Rootixa runs 100% locally on your device using client-side Web vision.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-4 font-extrabold">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  2× Super-Resolution
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upscale low-resolution photos to double their width and height with bicubic spatial interpolation and unsharp masking for sharp banners and print media.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4 font-extrabold">
                  <Palette className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  Instant Backdrop Fill
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Swap plain backgrounds for modern studio gradients, solid brand colors, or your own custom uploaded scene without ever re-calling the AI engine.
                </p>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h3>

              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Is Rootixa AI Background Remover really free?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Yes. All background removals, enhancements, and transparent PNG downloads are 100% free with no watermarks or hidden subscriptions.
                  </p>
                </div>

                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    How does the Before / After comparison slider work?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Simply drag the white vertical handle left or right with your mouse or finger to view the original photo overlaid with the transparent cutout result in real time.
                  </p>
                </div>

                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Why does my downloaded JPG have a white background?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    The JPEG file standard does not support alpha-channel transparency. If you need a transparent background for graphic design or overlays, choose PNG or WebP format.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Can I enhance the image before removing the background?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Yes! You can run Auto Enhance or 2× Upscaling either before or after extracting the background. The pipeline operates flexibly to suit your workflow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 5. FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-fuchsia-600 rounded-xl flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Rootixa<span className="text-fuchsia-600">.</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Free online tools for work, study, and everyday digital tasks. Fast, clean, and private utilities right in your browser.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Popular Tools
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <li>
                  <Link href="/ai-background-remover" className="hover:text-fuchsia-600 text-fuchsia-600 dark:text-fuchsia-400 font-bold flex items-center gap-1.5">
                    <span>AI Background Remover</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      Live
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/image-resizer" className="hover:text-fuchsia-600 transition-colors">
                    Image Resizer & Crop
                  </Link>
                </li>
                <li>
                  <Link href="/qr-code" className="hover:text-fuchsia-600 transition-colors">
                    QR & Barcode Studio
                  </Link>
                </li>
                <li>
                  <Link href="/lorem-ipsum" className="hover:text-fuchsia-600 transition-colors">
                    Lorem Ipsum Generator
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <li>
                  <Link href="/tools" className="hover:text-fuchsia-600 transition-colors">
                    All Tools Directory
                  </Link>
                </li>
                <li>
                  <Link href="/#why-rootixa" className="hover:text-fuchsia-600 transition-colors">
                    Why Rootixa
                  </Link>
                </li>
                <li>
                  <Link href="/feedback" className="hover:text-fuchsia-600 transition-colors">
                    Feedback & Suggestions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Rootixa. All rights reserved. 100% In-Browser Privacy.
          </div>
        </div>
      </footer>
    </div>
  );
}
