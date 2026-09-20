"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import JsBarcode from "jsbarcode";
import {
  Check,
  AlertTriangle,
  Download,
  Copy,
  CheckCircle,
  Sliders,
  Palette,
  Sparkles,
  Info,
  ShieldCheck,
  Eye,
  Type,
  RefreshCw,
  FileCode,
  Tag,
  Barcode,
  Layers,
  FileText,
  X,
  Printer,
} from "lucide-react";
import {
  BARCODE_FORMATS,
  BARCODE_CATEGORIES,
  BARCODE_PRESETS,
} from "@/lib/barcode/types";
import {
  validateBarcodeData,
  assessBarcodeQuality,
  GS1_AI_SPEC,
} from "@/lib/barcode/validation";
import {
  exportBarcodeSvg,
  exportBarcodeRaster,
  exportBarcodePdf,
  generateBarcodeFilename,
  copyBarcodeSvgMarkup,
  copyToClipboard,
} from "@/lib/barcode/export";

export function BarcodeGenerator({
  isSubscribed = false,
  downloadCount = 0,
  onInitiateDownload,
  onOpenPrintSheet = null,
  isExporting = false,
  setIsExporting = () => {},
}) {
  // Category Filter State
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  // Selected Barcode Format
  const [selectedFormatId, setSelectedFormatId] = useState("CODE128");
  const activeFormat = useMemo(() => {
    return (
      BARCODE_FORMATS.find((f) => f.id === selectedFormatId) ||
      BARCODE_FORMATS[0]
    );
  }, [selectedFormatId]);

  // Barcode Input Data
  const [barcodeInput, setBarcodeInput] = useState(activeFormat.defaultData);
  const [autoCheckDigit, setAutoCheckDigit] = useState(true);

  // Customize Tabs: 'appearance' | 'dimensions' | 'text' | 'presets'
  const [customizeTab, setCustomizeTab] = useState("appearance");

  // Styling & Dimension Controls
  const [barcodeSettings, setBarcodeSettings] = useState({
    lineColor: "#000000",
    background: "#FFFFFF",
    isTransparentBg: false,
    width: 2,
    height: 80,
    margin: 15,
    displayValue: true,
    textPosition: "bottom", // 'bottom' | 'top'
    fontSize: 14,
    fontOptions: "bold", // 'bold' | 'italic' | ''
    textAlign: "center", // 'center' | 'left' | 'right'
    textMargin: 3,
  });

  // Export Configuration
  const [exportFormat, setExportFormat] = useState("png"); // 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf'
  const [exportWidth, setExportWidth] = useState(2400);
  const [pdfPaperSize, setPdfPaperSize] = useState("A4"); // 'A4' | 'A5' | 'Letter' | 'Fit'
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [showGs1Guide, setShowGs1Guide] = useState(false);

  // Render Target Ref
  const svgRef = useRef(null);

  // Filtered Formats list based on selected category
  const filteredFormats = useMemo(() => {
    if (selectedCategoryId === "all") return BARCODE_FORMATS;
    return BARCODE_FORMATS.filter((f) => f.categoryId === selectedCategoryId);
  }, [selectedCategoryId]);

  // Validation State
  const validationResult = useMemo(() => {
    return validateBarcodeData(
      selectedFormatId,
      barcodeInput,
      autoCheckDigit
    );
  }, [selectedFormatId, barcodeInput, autoCheckDigit]);

  // Readability / Scan Quality Assessment
  const qualityAssessment = useMemo(() => {
    return assessBarcodeQuality({
      isValid: validationResult.isValid,
      lineColor: barcodeSettings.lineColor,
      background: barcodeSettings.background,
      isTransparentBg: barcodeSettings.isTransparentBg,
      margin: barcodeSettings.margin,
      width: barcodeSettings.width,
      height: barcodeSettings.height,
      displayValue: barcodeSettings.displayValue,
      fontSize: barcodeSettings.fontSize,
    });
  }, [validationResult.isValid, barcodeSettings]);

  // Derived Error message
  const effectiveError = validationResult.isValid
    ? ""
    : (validationResult.error || "Invalid barcode data.");

  // Handle format switch
  const handleFormatSelect = (fmt) => {
    setSelectedFormatId(fmt.id);
    setBarcodeInput(fmt.defaultData);
  };

  // Handle Preset application
  const applyPreset = (preset) => {
    setBarcodeSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
  };

  // Reset to default settings for the active format
  const handleResetSettings = () => {
    const classic = BARCODE_PRESETS.find((p) => p.id === "classic");
    if (classic) {
      applyPreset(classic);
    }
    setBarcodeInput(activeFormat.defaultData);
  };

  // One-click Fix Checksum
  const handleFixChecksum = () => {
    if (validationResult.suggestedFix) {
      setBarcodeInput(validationResult.suggestedFix);
    }
  };

  // Quick insert GS1 Application Identifier tag
  const handleInsertGs1Ai = (aiCode, sampleVal) => {
    const addition = `(${aiCode})${sampleVal}`;
    if (!barcodeInput.trim()) {
      setBarcodeInput(addition);
    } else {
      setBarcodeInput(`${barcodeInput}${addition}`);
    }
  };

  // Render Barcode via JsBarcode into SVG target
  useEffect(() => {
    if (!svgRef.current || !validationResult.isValid || !validationResult.finalData) {
      return;
    }

    try {
      // Clear previous children
      while (svgRef.current.firstChild) {
        svgRef.current.removeChild(svgRef.current.firstChild);
      }

      const isGs1 = activeFormat.isGs1;
      const targetFormat = activeFormat.jsbarcodeFormat;
      const effectiveBg = barcodeSettings.isTransparentBg ? "transparent" : barcodeSettings.background;

      const jsBarcodeOptions = {
        format: targetFormat,
        lineColor: barcodeSettings.lineColor,
        background: effectiveBg,
        width: Number(barcodeSettings.width),
        height: Number(barcodeSettings.height),
        margin: Number(barcodeSettings.margin),
        displayValue: Boolean(barcodeSettings.displayValue),
        textPosition: barcodeSettings.textPosition,
        fontSize: Number(barcodeSettings.fontSize),
        fontOptions: barcodeSettings.fontOptions,
        textAlign: barcodeSettings.textAlign,
        textMargin: Number(barcodeSettings.textMargin),
        font: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      };

      // GS1-128 specific options
      if (isGs1) {
        jsBarcodeOptions.ean128 = true;
        if (validationResult.displayText) {
          jsBarcodeOptions.text = validationResult.displayText;
        }
      }

      // UPC-E specific display text
      if (selectedFormatId === "UPCE" && validationResult.displayText) {
        jsBarcodeOptions.text = validationResult.displayText;
      }

      JsBarcode(svgRef.current, validationResult.finalData, jsBarcodeOptions);
    } catch (err) {
      console.warn("JsBarcode render error:", err);
    }
  }, [
    selectedFormatId,
    activeFormat,
    validationResult.finalData,
    validationResult.displayText,
    validationResult.isValid,
    barcodeSettings,
  ]);

  // Copy Barcode Value to Clipboard
  const handleCopyValue = async () => {
    const textToCopy = validationResult.displayText || validationResult.finalData || barcodeInput;
    if (!textToCopy) return;

    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopiedValue(true);
      setTimeout(() => setCopiedValue(false), 2000);
    }
  };

  // Copy SVG Vector to Clipboard
  const handleCopySvg = async () => {
    if (!svgRef.current || !validationResult.isValid) return;

    const ok = await copyBarcodeSvgMarkup(svgRef.current);
    if (ok) {
      setCopiedSvg(true);
      setTimeout(() => setCopiedSvg(false), 2000);
    }
  };

  // Execute the actual download
  const executeBarcodeDownload = useCallback(async () => {
    if (!svgRef.current || !validationResult.isValid) return;

    setIsExporting(true);
    const valueForName = validationResult.displayText || validationResult.finalData || barcodeInput;
    const filename = generateBarcodeFilename(selectedFormatId, valueForName, exportFormat);

    try {
      if (exportFormat === "svg") {
        exportBarcodeSvg(svgRef.current, filename);
      } else if (exportFormat === "pdf") {
        await exportBarcodePdf({
          svgElement: svgRef.current,
          paperSize: pdfPaperSize,
          filename,
          barcodeValue: validationResult.displayText || validationResult.finalData,
          barcodeFormat: activeFormat.name,
        });
      } else {
        await exportBarcodeRaster({
          svgElement: svgRef.current,
          format: exportFormat,
          exportWidth,
          filename,
          background: barcodeSettings.background,
          isTransparentBg: barcodeSettings.isTransparentBg,
        });
      }

      // Track platform usage event
      try {
        fetch("/api/tools/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolId: "barcode-generator",
            status: "success",
            format: selectedFormatId,
          }),
        }).catch(() => {});
      } catch {}

      setIsDownloaded(true);
      setTimeout(() => setIsDownloaded(false), 3000);
    } catch (err) {
      console.error("Barcode download failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, [
    exportFormat,
    exportWidth,
    pdfPaperSize,
    selectedFormatId,
    validationResult.finalData,
    validationResult.displayText,
    validationResult.isValid,
    barcodeInput,
    activeFormat.name,
    barcodeSettings.background,
    barcodeSettings.isTransparentBg,
    setIsExporting,
  ]);

  // Initiate download via parent quota limit system
  const handleDownloadClick = () => {
    if (effectiveError) return;
    if (onInitiateDownload) {
      onInitiateDownload(executeBarcodeDownload);
    } else {
      executeBarcodeDownload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
      {/* ========================================================= */}
      {/* LEFT CONFIGURATION PANEL (7 cols, independent scroll)     */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:sticky lg:top-[76px] lg:pr-3 lg:pb-6 [scrollbar-width:thin] panel-scrollbar">
        
        {/* STEP 1: SELECT BARCODE STANDARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Step 1
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                Select Barcode Standard
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full w-fit">
              9 Standards Supported
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mb-4 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
            {BARCODE_CATEGORIES.map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Barcode Formats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredFormats.map((fmt) => {
              const isSelected = selectedFormatId === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => handleFormatSelect(fmt)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/10"
                      : "border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {fmt.category}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900 mt-1">
                          {fmt.name}
                        </h3>
                      </div>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full border border-slate-300 group-hover:border-indigo-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {fmt.subtitle}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[140px]" title={fmt.inputRequirements}>
                      {fmt.inputRequirements}
                    </span>
                    <span className="font-mono text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                      {fmt.example}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: ENTER BARCODE DATA */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Step 2
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                Enter Barcode Data
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Standard: <strong className="text-indigo-600">{activeFormat.name}</strong>
              </span>
              <button
                type="button"
                onClick={() => setBarcodeInput(activeFormat.defaultData)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                title="Reset input to standard example value"
              >
                Insert Example
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Main Input Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="barcode-data-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Barcode Value
                </label>
                <span className="text-[11px] text-slate-400">
                  {barcodeInput.length} character{barcodeInput.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="relative">
                <input
                  id="barcode-data-input"
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder={activeFormat.placeholder}
                  className={`w-full px-4 py-3.5 pr-10 rounded-2xl border text-sm font-mono font-semibold outline-none transition-all ${
                    !validationResult.isValid
                      ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                />
                {barcodeInput && (
                  <button
                    type="button"
                    onClick={() => setBarcodeInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 transition cursor-pointer"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* GS1-128 Application Identifier Assistant */}
            {activeFormat.isGs1 && (
              <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>GS1 Application Identifier Assistant</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGs1Guide(!showGs1Guide)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    {showGs1Guide ? "Hide Guide" : "View AI Guide"}
                  </button>
                </div>

                {/* Quick Insert AI Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleInsertGs1Ai("01", "01234567890128")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer shadow-2xs"
                  >
                    + (01) GTIN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertGs1Ai("10", "BATCH982")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer shadow-2xs"
                  >
                    + (10) Batch / Lot
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertGs1Ai("17", "261231")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer shadow-2xs"
                  >
                    + (17) Expiry Date
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertGs1Ai("21", "SN987654")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer shadow-2xs"
                  >
                    + (21) Serial No.
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertGs1Ai("00", "101234567890123456")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-[11px] font-bold text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition cursor-pointer shadow-2xs"
                  >
                    + (00) SSCC
                  </button>
                </div>

                {/* Collapsible GS1 Guide Table */}
                {showGs1Guide && (
                  <div className="pt-2 border-t border-indigo-100 text-xs">
                    <p className="text-[11px] text-indigo-900 font-semibold mb-2">
                      GS1-128 encodes data paired with parenthesized Application Identifiers. Variable-length fields are automatically delimited with FNC1.
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 [scrollbar-width:thin]">
                      {Object.entries(GS1_AI_SPEC).map(([ai, spec]) => (
                        <div key={ai} className="flex items-center justify-between text-[11px] bg-white/80 p-1.5 rounded border border-indigo-100">
                          <span className="font-mono font-bold text-indigo-700">({ai}) {spec.name}</span>
                          <span className="text-slate-500">{spec.desc} ({spec.fixed ? `${spec.length} digits` : `1-${spec.maxLength} chars`})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auto Check Digit Option (For EAN-13, EAN-8, UPC-A, UPC-E, ITF-14) */}
            {activeFormat.supportsAutoCheckDigit && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <input
                    id="toggle-auto-check-digit"
                    type="checkbox"
                    checked={autoCheckDigit}
                    onChange={(e) => setAutoCheckDigit(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="toggle-auto-check-digit"
                    className="text-xs font-bold text-slate-800 cursor-pointer select-none"
                  >
                    Generate / Correct Check Digit Automatically (Modulo 10)
                  </label>
                </div>

                {validationResult.computedCheckDigit !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
                    <span>Computed Check Digit:</span>
                    <span className="text-sm font-black text-indigo-600">
                      {validationResult.computedCheckDigit}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Real-time Validation Status Alert */}
            <div
              className={`p-3.5 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all ${
                validationResult.isValid
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                  : "bg-rose-50/80 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-start gap-2">
                {validationResult.isValid ? (
                  <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block">
                    {validationResult.isValid
                      ? validationResult.message || `✓ Valid ${activeFormat.name} data`
                      : "✕ Invalid Data"}
                  </span>
                  {!validationResult.isValid && (
                    <span className="text-[11px] font-medium text-rose-700 mt-0.5 block leading-snug">
                      {validationResult.error}
                    </span>
                  )}
                </div>
              </div>

              {/* 1-Click Fix Checksum button if applicable */}
              {!validationResult.isValid && validationResult.suggestedFix && (
                <button
                  type="button"
                  onClick={handleFixChecksum}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                >
                  Fix Checksum →
                </button>
              )}
            </div>

            {/* Contextual Input Guidance */}
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/60 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span><strong>Allowed Characters:</strong> {activeFormat.allowedCharset}</span>
              <span><strong>Requirement:</strong> {activeFormat.inputRequirements}</span>
            </div>
          </div>
        </div>

        {/* STEP 3: PROFESSIONAL CUSTOMIZATION PANEL */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Step 3
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                Customize Barcode
              </h2>
            </div>
            <p className="text-xs text-slate-400">Appearance, Dimensions, Text & Presets</p>
          </div>

          {/* Sub-tabs Navigation */}
          <div className="flex items-center gap-1.5 mb-6 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: "appearance", label: "Appearance", icon: Palette },
              { id: "dimensions", label: "Dimensions", icon: Sliders },
              { id: "text", label: "Readable Text", icon: Type },
              { id: "presets", label: "Presets", icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = customizeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCustomizeTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: APPEARANCE */}
          {customizeTab === "appearance" && (
            <div className="space-y-6">
              {/* Bar Color */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Barcode Line Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Classic Black", hex: "#000000" },
                    { label: "Dark Slate", hex: "#0F172A" },
                    { label: "Deep Indigo", hex: "#4338CA" },
                    { label: "Navy Blue", hex: "#1E3A8A" },
                    { label: "Dark Emerald", hex: "#065F46" },
                  ].map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() =>
                        setBarcodeSettings((prev) => ({ ...prev, lineColor: c.hex }))
                      }
                      className={`h-9 px-3 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                        barcodeSettings.lineColor === c.hex
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.label}</span>
                    </button>
                  ))}
                  <input
                    type="color"
                    value={barcodeSettings.lineColor}
                    onChange={(e) =>
                      setBarcodeSettings((prev) => ({ ...prev, lineColor: e.target.value }))
                    }
                    className="w-9 h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer bg-white"
                    title="Choose custom line color"
                  />
                </div>
              </div>

              {/* Background Color & Transparency */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Background Color
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={barcodeSettings.isTransparentBg}
                      onChange={(e) =>
                        setBarcodeSettings((prev) => ({
                          ...prev,
                          isTransparentBg: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                    />
                    <span>Transparent Background</span>
                  </label>
                </div>

                {!barcodeSettings.isTransparentBg ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { label: "Pure White", hex: "#FFFFFF" },
                      { label: "Soft Slate", hex: "#F8FAFC" },
                      { label: "Warm White", hex: "#FFFBEB" },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() =>
                          setBarcodeSettings((prev) => ({ ...prev, background: c.hex }))
                        }
                        className={`h-9 px-3 rounded-xl text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                          barcodeSettings.background === c.hex
                            ? "border-indigo-600 bg-indigo-50 text-indigo-900 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span>{c.label}</span>
                      </button>
                    ))}
                    <input
                      type="color"
                      value={barcodeSettings.background}
                      onChange={(e) =>
                        setBarcodeSettings((prev) => ({ ...prev, background: e.target.value }))
                      }
                      className="w-9 h-9 p-0.5 rounded-xl border border-slate-200 cursor-pointer bg-white"
                      title="Choose custom background color"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                    <p className="font-semibold">Transparent background active</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Exported in true transparency for PNG, WEBP, and SVG. Will be flattened to pure white for JPEG.
                    </p>
                  </div>
                )}
              </div>

              {/* Contrast Readout */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">
                    Optical Scanner Contrast Ratio:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Minimum recommended for retail: 4.5:1 (Optimal: 7.0:1)
                  </span>
                </div>
                <span className="font-extrabold text-sm text-indigo-600 font-mono">
                  {qualityAssessment.contrastRatio.toFixed(1)}:1
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: DIMENSIONS */}
          {customizeTab === "dimensions" && (
            <div className="space-y-6">
              {/* Bar Width */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wider">
                      Bar Width / Density
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Width of an individual module bar
                    </p>
                  </div>
                  <span className="font-mono text-indigo-600 font-bold">
                    {barcodeSettings.width}px
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.2"
                  value={barcodeSettings.width}
                  onChange={(e) =>
                    setBarcodeSettings((prev) => ({
                      ...prev,
                      width: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Barcode Height */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wider">
                      Barcode Height
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Vertical bar height in pixels
                    </p>
                  </div>
                  <span className="font-mono text-indigo-600 font-bold">
                    {barcodeSettings.height}px
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="150"
                  step="5"
                  value={barcodeSettings.height}
                  onChange={(e) =>
                    setBarcodeSettings((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Quiet Zone Margin */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800 uppercase tracking-wider">
                      Quiet Zone Margin
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Blank buffer space around barcode required by laser scanners
                    </p>
                  </div>
                  <span className="font-mono text-indigo-600 font-bold">
                    {barcodeSettings.margin}px
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="35"
                  step="1"
                  value={barcodeSettings.margin}
                  onChange={(e) =>
                    setBarcodeSettings((prev) => ({
                      ...prev,
                      margin: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>6px (Tight)</span>
                  <span className={barcodeSettings.margin >= 14 ? "text-emerald-600 font-bold" : "text-amber-600"}>
                    {barcodeSettings.margin >= 14 ? "✓ Standard Compliant (>=14px)" : "Caution: Quiet zone is narrow"}
                  </span>
                  <span>35px (Generous)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: READABLE TEXT */}
          {customizeTab === "text" && (
            <div className="space-y-6">
              {/* Show Value Toggle */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <label
                    htmlFor="toggle-barcode-text"
                    className="block text-xs font-extrabold text-slate-900 cursor-pointer"
                  >
                    Display Human-Readable Text
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Print the encoded digits or text underneath or above the bars
                  </p>
                </div>
                <input
                  id="toggle-barcode-text"
                  type="checkbox"
                  checked={barcodeSettings.displayValue}
                  onChange={(e) =>
                    setBarcodeSettings((prev) => ({
                      ...prev,
                      displayValue: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {barcodeSettings.displayValue && (
                <>
                  {/* Text Position */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Text Position
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "bottom", label: "Below Bars" },
                        { id: "top", label: "Above Bars" },
                      ].map((pos) => (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() =>
                            setBarcodeSettings((prev) => ({
                              ...prev,
                              textPosition: pos.id,
                            }))
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            barcodeSettings.textPosition === pos.id
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size & Weight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 uppercase tracking-wider">
                          Font Size
                        </span>
                        <span className="font-mono text-indigo-600 font-bold">
                          {barcodeSettings.fontSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="22"
                        step="1"
                        value={barcodeSettings.fontSize}
                        onChange={(e) =>
                          setBarcodeSettings((prev) => ({
                            ...prev,
                            fontSize: parseInt(e.target.value, 10),
                          }))
                        }
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Font Weight
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: "bold", label: "Bold" },
                          { id: "", label: "Normal" },
                        ].map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() =>
                              setBarcodeSettings((prev) => ({
                                ...prev,
                                fontOptions: w.id,
                              }))
                            }
                            className={`py-2 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                              barcodeSettings.fontOptions === w.id
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {w.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Text Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "center", label: "Center" },
                        { id: "left", label: "Left" },
                        { id: "right", label: "Right" },
                      ].map((al) => (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() =>
                            setBarcodeSettings((prev) => ({
                              ...prev,
                              textAlign: al.id,
                            }))
                          }
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            barcodeSettings.textAlign === al.id
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {al.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: PRESETS */}
          {customizeTab === "presets" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BARCODE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 hover:border-indigo-300 transition-all text-left group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {preset.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 group-hover:underline">
                    Apply preset →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PREVIEW & EXPORT PANEL (5 cols, sticky on desktop)   */}
      {/* ========================================================= */}
      <div className="lg:col-span-5 lg:sticky lg:top-[76px] lg:self-start w-full">
        <div className="space-y-5 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1.5 lg:pb-6 [scrollbar-width:thin] panel-scrollbar">
          
          {/* CENTERPIECE PREVIEW CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 flex flex-col items-center">
            
            {/* Header: Live Badge & Readability Status */}
            <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>Live Barcode</span>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  qualityAssessment.status === "excellent"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : qualityAssessment.status === "warning"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {qualityAssessment.status === "excellent" ? (
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{qualityAssessment.label}</span>
              </div>
            </div>

            {/* Rendered Barcode Preview Surface */}
            <div
              className={`p-5 rounded-2xl mb-4 border border-slate-200/90 flex flex-col justify-center items-center transition-all duration-200 shadow-xs max-w-full overflow-hidden w-full min-h-[160px] relative ${
                barcodeSettings.isTransparentBg
                  ? "bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0px]"
                  : ""
              }`}
              style={{
                backgroundColor: barcodeSettings.isTransparentBg
                  ? "#FFFFFF"
                  : barcodeSettings.background,
              }}
            >
              {effectiveError ? (
                <div className="py-8 text-center text-rose-600 space-y-1.5">
                  <AlertTriangle className="w-7 h-7 mx-auto opacity-70" />
                  <p className="text-xs font-bold">
                    {effectiveError}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Fix data input above to render barcode
                  </p>
                </div>
              ) : (
                <div className="max-w-full overflow-x-auto flex justify-center py-2">
                  <svg
                    ref={svgRef}
                    id="barcode-render-svg"
                    className="max-w-full h-auto block select-none"
                  />
                </div>
              )}
            </div>

            {/* Action Bar: Copy Barcode Value & Copy SVG */}
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2 flex-wrap">
              <span className="text-xs font-mono text-slate-500 truncate max-w-[160px]" title={validationResult.displayText || validationResult.finalData || barcodeInput}>
                {validationResult.displayText || validationResult.finalData || barcodeInput}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyValue}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    copiedValue
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                  title="Copy encoded text or formatted GS1 value"
                >
                  {copiedValue ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Value</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopySvg}
                  disabled={Boolean(effectiveError)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    copiedSvg
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                  title="Copy raw SVG vector XML to clipboard"
                >
                  {copiedSvg ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>SVG Copied!</span>
                    </>
                  ) : (
                    <>
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Copy SVG</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetSettings}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  title="Reset settings to defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scan Quality & Readability Checklist */}
            <div className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-4 space-y-2">
              <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                <span>Scan Readability Checklist</span>
                <span className="text-indigo-600 font-extrabold">
                  {qualityAssessment.passedCount}/{qualityAssessment.totalChecks} Passed
                </span>
              </div>
              <div className="space-y-1">
                {qualityAssessment.checks.map((check, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[11px] text-slate-600"
                  >
                    {check.status === "passed" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : check.status === "warning" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    ) : check.status === "info" ? (
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    )}
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Options & Download */}
            <div className="w-full space-y-3.5">
              {/* Format Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Export Format
                </label>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {[
                    { id: "png", label: "PNG" },
                    { id: "jpeg", label: "JPG" },
                    { id: "webp", label: "WEBP" },
                    { id: "svg", label: "SVG" },
                    { id: "pdf", label: "PDF" },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setExportFormat(fmt.id)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                        exportFormat === fmt.id
                          ? "bg-white text-indigo-600 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution or PDF Paper Size */}
              {exportFormat === "pdf" ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      PDF Page Format
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Printable spec sheet or label
                    </p>
                  </div>
                  <select
                    value={pdfPaperSize}
                    onChange={(e) => setPdfPaperSize(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="A4">A4 · 210 × 297 mm</option>
                    <option value="A5">A5 · 148 × 210 mm</option>
                    <option value="Letter">Letter · 216 × 279 mm</option>
                    <option value="Fit">Fit to Label (110 mm)</option>
                  </select>
                </div>
              ) : exportFormat !== "svg" ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Export Resolution
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Raster canvas render width
                    </p>
                  </div>
                  <select
                    value={exportWidth}
                    onChange={(e) => setExportWidth(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value={1200}>Standard · 1200px</option>
                    <option value={2400}>High DPI · 2400px</option>
                    <option value={3600}>Maximum · 3600px</option>
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2 text-xs text-indigo-900">
                  <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-[11px] leading-snug">
                    Vector SVG preserves lossless lines for commercial printing and laser cutters.
                  </span>
                </div>
              )}

              {/* Primary Download Button */}
              <button
                type="button"
                onClick={handleDownloadClick}
                disabled={isExporting || Boolean(effectiveError)}
                className={`w-full py-4 rounded-2xl font-extrabold shadow-lg transition-all flex justify-center items-center gap-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
                  isDownloaded
                    ? "bg-emerald-600 text-white shadow-emerald-500/20"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25 hover:-translate-y-0.5"
                }`}
              >
                {isDownloaded ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                <span>
                  {isDownloaded
                    ? "Downloaded Successfully!"
                    : isExporting
                    ? "Generating high-res barcode…"
                    : "Download Barcode"}
                </span>
              </button>

              {/* Print Sheet / Multi-Label Maker Option */}
              {onOpenPrintSheet && (
                <button
                  type="button"
                  onClick={() => onOpenPrintSheet(barcodeInput, selectedFormatId)}
                  disabled={Boolean(effectiveError)}
                  className="w-full py-3.5 px-4 rounded-2xl font-bold border-2 border-dashed border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-300 text-indigo-700 transition-all flex justify-center items-center gap-2 text-xs sm:text-sm cursor-pointer shadow-2xs hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Printer className="w-4 h-4 text-indigo-600 transition-transform group-hover:scale-110" />
                  <span>Print Sheet / Label Maker</span>
                </button>
              )}

              {/* Format & Ready Status */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {exportFormat === "pdf"
                    ? `Printable PDF (${pdfPaperSize})`
                    : exportFormat === "svg"
                    ? "Vector SVG (Lossless)"
                    : `${exportWidth}px ${exportFormat.toUpperCase()}`}
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> High-Resolution Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
