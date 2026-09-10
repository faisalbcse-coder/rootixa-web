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
  Maximize2,
  RefreshCw,
  FileCode,
  Tag,
  Barcode,
  Layers,
} from "lucide-react";
import { BARCODE_FORMATS, BARCODE_PRESETS } from "@/lib/barcode/types";
import {
  validateBarcodeData,
  assessBarcodeQuality,
} from "@/lib/barcode/validation";
import {
  exportBarcodeSvg,
  exportBarcodeRaster,
  exportBarcodePdf,
} from "@/lib/barcode/export";

export function BarcodeGenerator({
  isSubscribed = false,
  downloadCount = 0,
  onInitiateDownload,
  isExporting = false,
  setIsExporting = () => {},
}) {
  // Selected Barcode Format
  const [selectedFormatId, setSelectedFormatId] = useState("CODE128");
  const activeFormat = useMemo(() => {
    return (
      BARCODE_FORMATS.find((f) => f.id === selectedFormatId) ||
      BARCODE_FORMATS[0]
    );
  }, [selectedFormatId]);

  // Barcode Input Data
  const [barcodeInput, setBarcodeInput] = useState("ROOTIXA-128-PRO");
  const [autoCheckDigit, setAutoCheckDigit] = useState(true);

  // Customize Sub-tabs
  const [customizeTab, setCustomizeTab] = useState("dimensions"); // 'dimensions' | 'colors' | 'text' | 'presets'

  // Barcode Styling & Layout
  const [barcodeSettings, setBarcodeSettings] = useState({
    lineColor: "#000000",
    background: "#FFFFFF",
    width: 2,
    height: 80,
    margin: 15,
    displayValue: true,
    textPosition: "bottom",
    fontSize: 14,
    fontOptions: "bold",
  });

  // Export Settings
  const [exportFormat, setExportFormat] = useState("png"); // 'png' | 'jpeg' | 'webp' | 'svg' | 'pdf'
  const [exportWidth, setExportWidth] = useState(2000);
  const [pdfPaperSize, setPdfPaperSize] = useState("A4"); // 'A4' | 'A5' | 'Letter' | 'Fit'
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Render Target Ref
  const svgRef = useRef(null);

  // Validation State
  const validationResult = useMemo(() => {
    return validateBarcodeData(
      selectedFormatId,
      barcodeInput,
      autoCheckDigit
    );
  }, [selectedFormatId, barcodeInput, autoCheckDigit]);

  // Derived Error
  const effectiveError = validationResult.isValid
    ? ""
    : (validationResult.error || "Invalid barcode data.");

  // Quality Assessment
  const qualityAssessment = useMemo(() => {
    return assessBarcodeQuality({
      isValid: validationResult.isValid,
      lineColor: barcodeSettings.lineColor,
      background: barcodeSettings.background,
      margin: barcodeSettings.margin,
      width: barcodeSettings.width,
      height: barcodeSettings.height,
    });
  }, [validationResult.isValid, barcodeSettings]);

  // Handle format change
  const handleFormatSelect = (fmt) => {
    setSelectedFormatId(fmt.id);
    setBarcodeInput(fmt.defaultData);
  };

  // Handle preset application
  const applyPreset = (preset) => {
    setBarcodeSettings((prev) => ({
      ...prev,
      ...preset.settings,
    }));
  };

  // Render Barcode via JsBarcode
  useEffect(() => {
    if (!svgRef.current || !validationResult.isValid || !validationResult.finalData) {
      return;
    }

    try {
      JsBarcode(svgRef.current, validationResult.finalData, {
        format: selectedFormatId,
        lineColor: barcodeSettings.lineColor,
        background: barcodeSettings.background,
        width: Number(barcodeSettings.width),
        height: Number(barcodeSettings.height),
        margin: Number(barcodeSettings.margin),
        displayValue: Boolean(barcodeSettings.displayValue),
        textPosition: barcodeSettings.textPosition,
        fontSize: Number(barcodeSettings.fontSize),
        fontOptions: barcodeSettings.fontOptions,
        font: "ui-sans-serif, system-ui, -apple-system, sans-serif",
      });
    } catch (err) {
      console.warn("JsBarcode render error:", err);
    }
  }, [
    selectedFormatId,
    validationResult.finalData,
    validationResult.isValid,
    barcodeSettings,
  ]);

  // Copy Barcode Data Action
  const handleCopyData = async () => {
    const textToCopy = validationResult.finalData || barcodeInput;
    if (!textToCopy) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const ta = document.createElement("textarea");
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Execute the actual export
  const executeBarcodeDownload = useCallback(async () => {
    if (!svgRef.current || !validationResult.isValid) return;

    setIsExporting(true);
    const filename = `rootixa-barcode-${selectedFormatId.toLowerCase()}`;

    try {
      if (exportFormat === "svg") {
        exportBarcodeSvg(svgRef.current, `${filename}.svg`);
      } else if (exportFormat === "pdf") {
        await exportBarcodePdf({
          svgElement: svgRef.current,
          paperSize: pdfPaperSize,
          filename: `${filename}-${pdfPaperSize.toLowerCase()}.pdf`,
          barcodeValue: validationResult.finalData,
          barcodeFormat: activeFormat.name,
        });
      } else {
        await exportBarcodeRaster({
          svgElement: svgRef.current,
          format: exportFormat,
          exportWidth,
          filename: `${filename}.${exportFormat === "jpeg" ? "jpg" : exportFormat}`,
          background: barcodeSettings.background,
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
    validationResult.isValid,
    activeFormat.name,
    barcodeSettings.background,
    setIsExporting,
  ]);

  // Initiate download through parent quota system
  const handleDownloadClick = () => {
    if (effectiveError) return;
    if (onInitiateDownload) {
      onInitiateDownload(executeBarcodeDownload);
    } else {
      executeBarcodeDownload();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* ========================================================= */}
      {/* LEFT CONFIGURATION PANEL (7 cols)                         */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 space-y-6">
        {/* STEP 1: SELECT BARCODE TYPE */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Step 1
              </span>
              <h2 className="text-lg font-extrabold text-slate-900">
                Select Barcode Type
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              7 Industry Standards
            </span>
          </div>

          {/* Barcode Formats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BARCODE_FORMATS.map((fmt) => {
              const isSelected = selectedFormatId === fmt.id;
              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => handleFormatSelect(fmt)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/10"
                      : "border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {fmt.category}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
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
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    {fmt.subtitle}
                  </p>
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
            <span className="text-xs text-slate-400 font-medium">
              Standard: {activeFormat.name}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="barcode-data-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Barcode Value
              </label>
              <div className="relative">
                <input
                  id="barcode-data-input"
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder={activeFormat.placeholder}
                  className={`w-full px-4 py-3.5 rounded-2xl border text-sm font-semibold outline-none transition-all ${
                    !validationResult.isValid
                      ? "border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-200 bg-slate-50/50 text-slate-900 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20"
                  }`}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                {activeFormat.helper}
              </p>
            </div>

            {/* Auto Check Digit Option (For EAN-13, EAN-8, UPC-A, ITF-14) */}
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
                    Generate check digit automatically (Modulo 10)
                  </label>
                </div>

                {validationResult.computedCheckDigit !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
                    <span>Check Digit:</span>
                    <span className="text-sm font-black text-indigo-600">
                      {validationResult.computedCheckDigit}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Real-time Validation Status Badge */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all ${
                validationResult.isValid
                  ? "bg-emerald-50/80 border-emerald-200 text-emerald-800"
                  : "bg-rose-50/80 border-rose-200 text-rose-800"
              }`}
            >
              {validationResult.isValid ? (
                <>
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">
                    {validationResult.message || `✓ Valid ${activeFormat.name} data`}
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{validationResult.error}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* STEP 3: CUSTOMIZE BARCODE */}
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
            <p className="text-xs text-slate-400">Appearance & Dimensions</p>
          </div>

          {/* Sub-tabs Navigation */}
          <div className="flex items-center gap-1.5 mb-6 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: "dimensions", label: "Dimensions", icon: Sliders },
              { id: "colors", label: "Colors", icon: Palette },
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

          {/* TAB 1: DIMENSIONS */}
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
                      Width of a single unit bar
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
                  max="140"
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
                      Clear surrounding buffer for scanner beam recognition
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
              </div>
            </div>
          )}

          {/* TAB 2: COLORS */}
          {customizeTab === "colors" && (
            <div className="space-y-6">
              {/* Bar Color */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Barcode Line Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Classic Black", hex: "#000000" },
                    { label: "Dark Slate", hex: "#0F172A" },
                    { label: "Deep Indigo", hex: "#4F46E5" },
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
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
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
                    title="Custom color"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Background Color
                </label>
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
                          ? "border-indigo-600 bg-indigo-50 text-indigo-900"
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
                    title="Custom background color"
                  />
                </div>
              </div>

              {/* Contrast Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Optical Contrast Ratio:
                </span>
                <span className="font-extrabold text-indigo-600">
                  {qualityAssessment.contrastRatio.toFixed(1)}:1
                </span>
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
                    Human-Readable Barcode Value
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Print the encoded digits or text underneath/above the bars
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

                  {/* Font Size */}
                  <div className="space-y-2 border-t border-slate-100 pt-4">
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
                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 group-hover:underline">
                    Apply preset &rarr;
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
      <div className="lg:col-span-5 relative h-full">
        <div className="lg:sticky lg:top-20 space-y-5 lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pr-1.5 lg:pb-4 [scrollbar-width:thin]">
          {/* CENTERPIECE PREVIEW CARD */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 flex flex-col items-center">
            {/* Header: Live Badge & Quality Status */}
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
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )}
                <span>{qualityAssessment.label}</span>
              </div>
            </div>

            {/* Rendered Barcode Preview Surface */}
            <div
              className="p-5 rounded-2xl mb-4 border border-slate-200/90 flex flex-col justify-center items-center transition-all duration-200 shadow-xs max-w-full overflow-hidden w-full min-h-[160px]"
              style={{ backgroundColor: barcodeSettings.background }}
            >
              {effectiveError ? (
                <div className="py-8 text-center text-rose-600 space-y-1.5">
                  <AlertTriangle className="w-7 h-7 mx-auto opacity-70" />
                  <p className="text-xs font-bold">
                    {effectiveError}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Fix data input to preview barcode
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

            {/* Action Bar: Copy Barcode Data */}
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <span className="text-xs font-mono text-slate-500 truncate max-w-[200px]">
                {validationResult.finalData || barcodeInput}
              </span>
              <button
                type="button"
                onClick={handleCopyData}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Data</span>
                  </>
                )}
              </button>
            </div>

            {/* Quality Checklist */}
            <div className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs mb-4 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                <span>Scan Quality Checklist</span>
                <span className="text-indigo-600">
                  {qualityAssessment.checks.filter((c) => c.passed).length}/4 Passed
                </span>
              </div>
              {qualityAssessment.checks.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 text-[11px] text-slate-600"
                >
                  {check.passed ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span>{check.label}</span>
                </div>
              ))}
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
                      PDF Page Size
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Printable sheet dimensions
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
                    <option value="Fit">Fit to Barcode</option>
                  </select>
                </div>
              ) : exportFormat !== "svg" ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Export Resolution
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Rendered raster canvas width
                    </p>
                  </div>
                  <select
                    value={exportWidth}
                    onChange={(e) => setExportWidth(Number(e.target.value))}
                    className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value={1200}>Standard · 1200px</option>
                    <option value={2400}>High · 2400px</option>
                    <option value={3600}>Maximum · 3600px</option>
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center gap-2 text-xs text-indigo-900">
                  <FileCode className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-[11px] leading-snug">
                    Vector SVG exports infinitely scalable crisp lines suitable
                    for commercial printing.
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

              {/* Download Limit & Quota Status */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {exportFormat === "pdf"
                    ? `Printable PDF (${pdfPaperSize})`
                    : exportFormat === "svg"
                    ? "Vector SVG (Lossless)"
                    : `${exportWidth}px Raster`}
                </span>
                <span className="font-semibold text-slate-600">
                  Downloads:{" "}
                  {isSubscribed ? (
                    <span className="text-emerald-600 font-bold">Unlimited</span>
                  ) : (
                    `${downloadCount}/2 free`
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
