"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import JsBarcode from "jsbarcode";
import {
  Printer,
  Download,
  Copy,
  Check,
  FileText,
  Upload,
  Layers,
  Sliders,
  Grid,
  Sparkles,
  QrCode,
  Barcode,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
  Type,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  PAGE_SIZES,
  SHEET_PRESETS,
  calculateSheetLayout,
  parseCsvInput,
  expandItemsWithCopies,
} from "@/lib/print-sheet/sheet-calculator";
import { exportSheetPdf } from "@/lib/print-sheet/pdf-generator";
import { BARCODE_FORMATS } from "@/lib/barcode/types";

// Miniature SVG barcode renderer for each label cell in live preview
function BarcodeCellGraphic({ value, format }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: format === "GS1_128" ? "CODE128" : format,
        lineColor: "#000000",
        background: "transparent",
        width: 1.5,
        height: 35,
        margin: 2,
        displayValue: false,
      });
    } catch {
      // Fallback if barcode value is invalid for chosen format
    }
  }, [value, format]);

  return (
    <svg
      ref={svgRef}
      className="max-h-full max-w-full block mx-auto select-none pointer-events-none"
    />
  );
}

export function LabelSheetMaker({
  currentQrPayload = "https://rootixa.com",
  currentBarcodeData = "ROOTIXA-128-PRO",
  currentBarcodeFormat = "CODE128",
  initialCodeType = "qr",
  onBack = null,
}) {
  // Input Source: 'current' | 'paste' | 'csv'
  const [inputSource, setInputSource] = useState("current");

  // Code Type: 'qr' | 'barcode'
  const [codeType, setCodeType] = useState(initialCodeType || "qr");
  const [barcodeFormat, setBarcodeFormat] = useState(currentBarcodeFormat || "CODE128");

  useEffect(() => {
    if (initialCodeType) {
      setCodeType(initialCodeType);
    }
  }, [initialCodeType]);

  useEffect(() => {
    if (currentBarcodeFormat) {
      setBarcodeFormat(currentBarcodeFormat);
    }
  }, [currentBarcodeFormat]);

  // Source Data States
  const [currentCopies, setCurrentCopies] = useState(30); // 30 copies fills standard A4 3x10
  const [pastedListText, setPastedListText] = useState(
    "ITEM-001\nITEM-002\nITEM-003\nITEM-004\nITEM-005"
  );
  const [pastedCopies, setPastedCopies] = useState(1);
  const [csvItems, setCsvItems] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");

  // Sheet & Page Settings
  const [selectedPresetId, setSelectedPresetId] = useState("a4-3x10");
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState("portrait");
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(10);
  const [gapX, setGapX] = useState(2.5);
  const [gapY, setGapY] = useState(0);
  const [marginTop, setMarginTop] = useState(10);
  const [marginBottom, setMarginBottom] = useState(10);
  const [marginLeft, setMarginLeft] = useState(7);
  const [marginRight, setMarginRight] = useState(7);
  const [autoSize, setAutoSize] = useState(true);
  const [customLabelWidth, setCustomLabelWidth] = useState(63.5);
  const [customLabelHeight, setCustomLabelHeight] = useState(25.4);

  // Label Content Elements
  const [showCode, setShowCode] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showValue, setShowValue] = useState(true);
  const [borderStyle, setBorderStyle] = useState("dashed"); // 'none' | 'dashed' | 'solid'
  const [codeSizeRatio, setCodeSizeRatio] = useState(0.85); // 0.7, 0.85, 0.95

  // Preview Pagination & Zoom
  const [currentPage, setCurrentPage] = useState(1);
  const [previewZoom, setPreviewZoom] = useState(100); // 75, 100, 125
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Apply Preset
  const handleApplyPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setPageSize(preset.pageSize);
    setOrientation(preset.orientation);
    setCols(preset.cols);
    setRows(preset.rows);
    setMarginTop(preset.marginTop);
    setMarginBottom(preset.marginBottom);
    setMarginLeft(preset.marginLeft);
    setMarginRight(preset.marginRight);
    setGapX(preset.gapX);
    setGapY(preset.gapY);
    setAutoSize(preset.autoSize);
  };

  // CSV File Handler
  const handleCsvUpload = (file) => {
    if (!file) return;
    setCsvError("");
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        const parsed = parseCsvInput(text);
        if (parsed.length === 0) {
          setCsvError("No valid rows found in this CSV file.");
        } else {
          setCsvItems(parsed);
        }
      } catch (err) {
        setCsvError("Failed to parse CSV file. Ensure valid text format.");
      }
    };
    reader.readAsText(file);
  };

  // Compile Raw Items list based on selected Input Source
  const rawItems = useMemo(() => {
    if (inputSource === "current") {
      const activeVal =
        codeType === "qr"
          ? currentQrPayload || "https://rootixa.com"
          : currentBarcodeData || "ROOTIXA-128-PRO";
      return [
        {
          value: activeVal,
          title: codeType === "qr" ? "Rootixa QR" : "Product SKU",
          subtitle: "Standard Label",
          copies: currentCopies,
        },
      ];
    }

    if (inputSource === "paste") {
      const lines = pastedListText
        .split(/\r\n|\n|\r/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      return lines.map((line, idx) => ({
        value: line,
        title: `Item #${idx + 1}`,
        subtitle: "",
        copies: pastedCopies,
      }));
    }

    if (inputSource === "csv") {
      return csvItems;
    }

    return [];
  }, [
    inputSource,
    codeType,
    currentQrPayload,
    currentBarcodeData,
    currentCopies,
    pastedListText,
    pastedCopies,
    csvItems,
  ]);

  // Expand with copies to get final print labels
  const allLabels = useMemo(() => {
    return expandItemsWithCopies(
      rawItems,
      inputSource === "current" ? currentCopies : pastedCopies
    );
  }, [rawItems, inputSource, currentCopies, pastedCopies]);

  // Compute Layout Geometry
  const layout = useMemo(() => {
    return calculateSheetLayout({
      pageSize,
      orientation,
      cols,
      rows,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      gapX,
      gapY,
      autoSize,
      customLabelWidth,
      customLabelHeight,
      totalItemsCount: allLabels.length,
    });
  }, [
    pageSize,
    orientation,
    cols,
    rows,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    gapX,
    gapY,
    autoSize,
    customLabelWidth,
    customLabelHeight,
    allLabels.length,
  ]);

  // Keep currentPage within bounds
  useEffect(() => {
    if (currentPage > layout.totalPages) {
      setCurrentPage(layout.totalPages);
    }
  }, [layout.totalPages, currentPage]);

  // Slice items for currently viewed page
  const currentPageLabels = useMemo(() => {
    const startIdx = (currentPage - 1) * layout.labelsPerPage;
    return allLabels.slice(startIdx, startIdx + layout.labelsPerPage);
  }, [allLabels, currentPage, layout.labelsPerPage]);

  // Trigger PDF Generation
  const handleDownloadPdf = async () => {
    if (allLabels.length === 0) return;
    setIsExportingPdf(true);
    try {
      await exportSheetPdf({
        items: allLabels,
        layout,
        codeType,
        barcodeFormat,
        showCode,
        showTitle,
        showSubtitle,
        showValue,
        borderStyle,
        codeSizeRatio,
        filename: `rootixa-labels-${layout.pageSize.toLowerCase()}-${codeType}.pdf`,
      });
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Direct Browser Print
  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* HEADER CARD: TITLE & SUMMARY                             */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white text-xs font-bold text-slate-700 hover:text-indigo-600 transition shadow-2xs cursor-pointer mr-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Studio</span>
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500">
              Print-Ready Multi-Label Sheet Maker
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Print Sheet & Label Studio
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Arrange multiple QR codes or barcodes onto standard Avery & ISO paper sheets (A4, Letter) with exact millimeter margins for printing.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleDirectPrint}
            disabled={allLabels.length === 0 || !layout.fits}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Open native browser print dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={allLabels.length === 0 || !layout.fits || isExportingPdf}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
          >
            {isExportingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExportingPdf ? "Generating PDF…" : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN TWO-PANEL WORKSPACE                                  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT CONFIGURATION PANEL (5 cols on desktop, independent scroll) */}
        <div className="lg:col-span-5 space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:sticky lg:top-[76px] lg:pr-3 lg:pb-6 [scrollbar-width:thin] panel-scrollbar">
          
          {/* STEP 1: INPUT SOURCE & CODE TYPE */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Step 1
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Data Source & Format
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {allLabels.length} Label{allLabels.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Code Type Switcher: QR Code vs Barcode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Code Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCodeType("qr")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                    codeType === "qr"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Code Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCodeType("barcode")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
                    codeType === "barcode"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <Barcode className="w-4 h-4" />
                  <span>Barcode Sheet</span>
                </button>
              </div>
            </div>

            {/* Barcode Standard (if Barcode chosen) */}
            {codeType === "barcode" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Barcode Standard
                </label>
                <select
                  value={barcodeFormat}
                  onChange={(e) => setBarcodeFormat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {BARCODE_FORMATS.map((fmt) => (
                    <option key={fmt.id} value={fmt.id}>
                      {fmt.name} ({fmt.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Data Source Tabs */}
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Input Source
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: "current", label: "Current Code" },
                  { id: "paste", label: "Paste List" },
                  { id: "csv", label: "CSV Upload" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setInputSource(s.id)}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all text-center cursor-pointer ${
                      inputSource === s.id
                        ? "bg-white text-indigo-600 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Source Content: 1. Current Code */}
            {inputSource === "current" && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Loaded Studio Value:</span>
                  <span className="font-mono font-bold text-indigo-600 truncate max-w-[160px]">
                    {codeType === "qr" ? currentQrPayload : currentBarcodeData}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="current-copies-input" className="text-xs font-bold text-slate-700">
                    Copies to generate:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="current-copies-input"
                      type="number"
                      min="1"
                      max="500"
                      value={currentCopies}
                      onChange={(e) => setCurrentCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCurrentCopies(layout.labelsPerPage)}
                      className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-indigo-100"
                      title="Fill one full page"
                    >
                      Fill Page ({layout.labelsPerPage})
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Source Content: 2. Paste List */}
            {inputSource === "paste" && (
              <div className="space-y-3">
                <div>
                  <textarea
                    rows={4}
                    value={pastedListText}
                    onChange={(e) => setPastedListText(e.target.value)}
                    placeholder="Enter one code per line..."
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 outline-none resize-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter one code per line. Each line generates a distinct label.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="pasted-copies-input" className="text-xs font-bold text-slate-700">
                    Copies per item:
                  </label>
                  <input
                    id="pasted-copies-input"
                    type="number"
                    min="1"
                    max="50"
                    value={pastedCopies}
                    onChange={(e) => setPastedCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center outline-none"
                  />
                </div>
              </div>
            )}

            {/* Source Content: 3. CSV Upload */}
            {inputSource === "csv" && (
              <div className="space-y-3">
                <div
                  onClick={() => document.getElementById("sheet-csv-file-picker")?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group transition"
                >
                  <input
                    id="sheet-csv-file-picker"
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleCsvUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <FileText className="w-6 h-6 text-indigo-600 mb-1 group-hover:scale-105 transition-transform" />
                  <p className="text-xs font-bold text-slate-800">
                    {csvFileName ? csvFileName : "Upload CSV file"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Columns supported: Value, Title, Subtitle, Copies
                  </p>
                </div>

                {csvError && (
                  <p className="text-xs text-rose-600 font-medium">{csvError}</p>
                )}

                {csvItems.length > 0 && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 font-bold">
                    <span>✓ Loaded {csvItems.length} records</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvItems([]);
                        setCsvFileName("");
                      }}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: PAGE & GRID GEOMETRY */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Step 2
                </span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Page & Grid Presets
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {layout.labelsPerPage} labels / page
              </span>
            </div>

            {/* Presets Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Standard Sheet Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SHEET_PRESETS.map((p) => {
                  const isSelected = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 shadow-2xs ring-1 ring-indigo-600"
                          : "border-slate-200 bg-slate-50/60 hover:bg-slate-100"
                      }`}
                    >
                      <span className="font-extrabold text-xs text-slate-900">{p.name}</span>
                      <span className="text-[10px] font-bold text-indigo-600 mt-0.5">{p.badge}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Page Size & Orientation */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Page Size
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value);
                    setSelectedPresetId("custom");
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">Letter (8.5 × 11 in)</option>
                  <option value="A5">A5 (148 × 210 mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Orientation
                </label>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-100 rounded-xl">
                  {["portrait", "landscape"].map((ori) => (
                    <button
                      key={ori}
                      type="button"
                      onClick={() => {
                        setOrientation(ori);
                        setSelectedPresetId("custom");
                      }}
                      className={`py-1 text-xs font-bold rounded-lg transition capitalize cursor-pointer ${
                        orientation === ori
                          ? "bg-white text-indigo-600 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {ori}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Columns & Rows */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">Columns</span>
                  <span className="font-mono font-bold text-indigo-600">{cols}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={cols}
                  onChange={(e) => {
                    setCols(parseInt(e.target.value, 10));
                    setSelectedPresetId("custom");
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-slate-700 uppercase tracking-wider">Rows</span>
                  <span className="font-mono font-bold text-indigo-600">{rows}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={rows}
                  onChange={(e) => {
                    setRows(parseInt(e.target.value, 10));
                    setSelectedPresetId("custom");
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Margins & Gaps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-100 pt-3 text-xs">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Top (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={marginTop}
                  onChange={(e) => {
                    setMarginTop(Number(e.target.value));
                    setSelectedPresetId("custom");
                  }}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Bottom (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={marginBottom}
                  onChange={(e) => {
                    setMarginBottom(Number(e.target.value));
                    setSelectedPresetId("custom");
                  }}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Left/Right (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={marginLeft}
                  onChange={(e) => {
                    setMarginLeft(Number(e.target.value));
                    setMarginRight(Number(e.target.value));
                    setSelectedPresetId("custom");
                  }}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">H-Gap (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={gapX}
                  onChange={(e) => {
                    setGapX(Number(e.target.value));
                    setSelectedPresetId("custom");
                  }}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Warning if dimensions do not fit */}
            {!layout.fits && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{layout.warning}</span>
              </div>
            )}
          </div>

          {/* STEP 3: LABEL CONTENT & APPEARANCE */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Step 3
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">
                Label Content & Sizing
              </h3>
            </div>

            {/* Elements Toggles */}
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCode}
                  onChange={(e) => setShowCode(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded"
                />
                <span>Show Code</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTitle}
                  onChange={(e) => setShowTitle(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded"
                />
                <span>Show Title</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showValue}
                  onChange={(e) => setShowValue(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded"
                />
                <span>Show Value</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSubtitle}
                  onChange={(e) => setShowSubtitle(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded"
                />
                <span>Show Subtitle</span>
              </label>
            </div>

            {/* Border Style */}
            <div className="border-t border-slate-100 pt-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Label Border / Cutting Guides
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "dashed", label: "Dashed (Cut)" },
                  { id: "solid", label: "Solid Outline" },
                  { id: "none", label: "No Border" },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBorderStyle(b.id)}
                    className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      borderStyle === b.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Size Ratio */}
            <div className="border-t border-slate-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider">Code Sizing</span>
                <span className="font-bold text-indigo-600">
                  {codeSizeRatio === 0.7 ? "Small (70%)" : codeSizeRatio === 0.85 ? "Medium (85%)" : "Large (95%)"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { ratio: 0.7, label: "Small" },
                  { ratio: 0.85, label: "Medium" },
                  { ratio: 0.95, label: "Large" },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setCodeSizeRatio(s.ratio)}
                    className={`py-1 px-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                      codeSizeRatio === s.ratio
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT LIVE PREVIEW & EXPORT PANEL (7 cols on desktop, sticky on desktop) */}
        <div className="lg:col-span-7 lg:sticky lg:top-[76px] lg:self-start w-full">
          <div className="space-y-5 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1.5 lg:pb-6 [scrollbar-width:thin] panel-scrollbar">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 space-y-5">
            
            {/* Preview Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Interactive Print Preview</span>
                </div>
                <p className="text-xs text-slate-400">
                  {layout.pageSize} · {layout.orientation} · {layout.labelWidth} × {layout.labelHeight} mm
                </p>
              </div>

              {/* Multi-Page Navigation Controls */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold font-mono px-2 text-slate-700">
                  Page {currentPage} of {layout.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(layout.totalPages, p + 1))}
                  disabled={currentPage >= layout.totalPages}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Paper Surface Wrapper */}
            <div className="bg-slate-200/70 p-4 sm:p-6 rounded-2xl overflow-x-auto flex justify-center shadow-inner">
              
              {/* Paper Surface with true aspect ratio representation */}
              <div
                className="bg-white shadow-xl transition-all relative border border-slate-300"
                style={{
                  width: `${layout.pageWidth * 2.8}px`,
                  minHeight: `${layout.pageHeight * 2.8}px`,
                  paddingTop: `${layout.marginTop * 2.8}px`,
                  paddingBottom: `${layout.marginBottom * 2.8}px`,
                  paddingLeft: `${layout.marginLeft * 2.8}px`,
                  paddingRight: `${layout.marginRight * 2.8}px`,
                }}
              >
                {/* Grid Layout of Labels */}
                <div
                  className="grid w-full h-full"
                  style={{
                    gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
                    columnGap: `${layout.gapX * 2.8}px`,
                    rowGap: `${layout.gapY * 2.8}px`,
                  }}
                >
                  {currentPageLabels.map((item, idx) => {
                    return (
                      <div
                        key={item.id || idx}
                        className={`p-2 flex flex-col justify-between items-center text-center bg-white overflow-hidden transition ${
                          borderStyle === "dashed"
                            ? "border border-dashed border-slate-300"
                            : borderStyle === "solid"
                            ? "border border-slate-400"
                            : "border border-transparent"
                        }`}
                        style={{
                          height: `${layout.labelHeight * 2.8}px`,
                        }}
                      >
                        {/* Title */}
                        {showTitle && item.title && (
                          <span className="text-[10px] font-bold text-slate-900 truncate w-full leading-tight">
                            {item.title}
                          </span>
                        )}

                        {/* Code Graphic */}
                        {showCode && item.value && (
                          <div className="flex-1 flex items-center justify-center w-full min-h-0 my-0.5">
                            {codeType === "qr" ? (
                              <QRCodeSVG
                                value={item.value}
                                size={Math.min(90, Math.floor(layout.labelHeight * 1.5))}
                                level="M"
                                className="max-h-full max-w-full"
                              />
                            ) : (
                              <BarcodeCellGraphic
                                value={item.value}
                                format={barcodeFormat}
                              />
                            )}
                          </div>
                        )}

                        {/* Value / Subtitle */}
                        {showValue && item.value && (
                          <span className="font-mono text-[9px] font-bold text-slate-600 truncate w-full leading-tight">
                            {item.value}
                          </span>
                        )}
                        {showSubtitle && item.subtitle && (
                          <span className="text-[8px] text-slate-400 truncate w-full leading-tight">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Statistics & Print Notice Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2 border-t border-slate-100 pt-3">
              <span className="font-medium">
                Total: <strong className="text-slate-900">{allLabels.length} labels</strong> ({layout.labelsPerPage} per page across {layout.totalPages} pages)
              </span>
              <span className="text-[11px] text-slate-400">
                Print tip: Set scale to 100% (Actual Size) in printer settings.
              </span>
            </div>

            {/* Privacy Guarantee Statement */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px]">
                <strong>Private by design:</strong> All codes, CSV lists, and sheet PDFs are computed locally in your browser with zero data stored by Rootixa.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
