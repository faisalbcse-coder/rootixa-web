"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Printer, Download, ArrowLeft, ShieldCheck, AlertTriangle, X, Check,
  Sparkles, FileText, CheckCircle, Sliders, Grid, RefreshCw, Layers,
  Scissors, Maximize2, Smartphone, Utensils, Wifi, UserCheck, Share2, Star
} from 'lucide-react';
import {
  PAPER_SIZES,
  COPY_OPTIONS,
  BUSINESS_LAYOUT_PRESETS,
  calculateCardDimensions,
  checkPrintFit,
  calculateAutoFitQrSize,
  evaluatePrintSafety,
  INCH_TO_MM
} from '@/lib/qr/print-engine';
import {
  generatePrintPdf,
  generatePrintSvg,
  generatePrintCanvas
} from '@/lib/qr/pdf-builder';

export default function PrintBusinessStudio({
  qrData,
  qrSettings,
  activeTab,
  currentPayload,
  scanSafety,
  qrCodeInstance,
  onSwitchToSingle,
  withExportResolution,
  blobToDataUrl
}) {
  // Print & Paper State
  const [layoutType, setLayoutType] = useState('standard');
  const [paper, setPaper] = useState('A4');
  const [customWidthMm, setCustomWidthMm] = useState(210);
  const [customHeightMm, setCustomHeightMm] = useState(297);
  const [customUnit, setCustomUnit] = useState('mm');
  const [orientation, setOrientation] = useState('portrait');
  const [copies, setCopies] = useState(4);
  const [qrSizeMm, setQrSizeMm] = useState(45);

  // Margins & Spacing (mm)
  const [marginLeftMm, setMarginLeftMm] = useState(15);
  const [marginRightMm, setMarginRightMm] = useState(15);
  const [marginTopMm, setMarginTopMm] = useState(15);
  const [marginBottomMm, setMarginBottomMm] = useState(15);
  const [spacingHMm, setSpacingHMm] = useState(8);
  const [spacingVMm, setSpacingVMm] = useState(8);

  // Typography & Labels
  const [showTitle, setShowTitle] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [title, setTitle] = useState('Scan with Camera');
  const [subtitle, setSubtitle] = useState('Point your camera to scan this code');
  const [textAlign, setTextAlign] = useState('center');

  // Business Card Info
  const [businessCardInfo, setBusinessCardInfo] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    website: '',
  });

  // Print Aids
  const [showCuttingGuides, setShowCuttingGuides] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // Initialize Business Card data from single QR state if available
  useEffect(() => {
    setBusinessCardInfo({
      name: qrData.vcardFullName || '',
      title: qrData.vcardTitle || '',
      phone: qrData.vcardPhone || qrData.phone || qrData.whatsappPhone || '',
      email: qrData.vcardEmail || qrData.email || '',
      website: qrData.vcardWebsite || qrData.url || '',
    });
  }, [qrData]);

  // Update labels when layout preset changes
  const handleSelectLayout = (newLayoutId) => {
    setLayoutType(newLayoutId);
    const preset = BUSINESS_LAYOUT_PRESETS[newLayoutId];
    if (!preset) return;

    setQrSizeMm(preset.defaultQrSizeMm);
    setShowTitle(preset.showTitle);
    setShowSubtitle(preset.showSubtitle);
    setTextAlign(preset.textAlign);

    if (newLayoutId === 'wifi') {
      setTitle(qrData.wifiTitle || 'Free Guest Wi-Fi');
      setSubtitle(qrData.wifiSsid ? `Network: ${qrData.wifiSsid}` : 'Scan to connect instantly');
    } else if (newLayoutId === 'restaurant') {
      setTitle(preset.defaultTitle);
      setSubtitle(preset.defaultSubtitle);
    } else if (newLayoutId === 'review') {
      setTitle(preset.defaultTitle);
      setSubtitle(preset.defaultSubtitle);
    } else if (newLayoutId === 'social') {
      setTitle(preset.defaultTitle);
      setSubtitle(qrData.socialPlatform ? `@${qrData.socialPlatform} profile` : preset.defaultSubtitle);
    } else if (newLayoutId === 'contact') {
      setTitle(qrData.vcardFullName ? `Connect with ${qrData.vcardFullName}` : preset.defaultTitle);
      setSubtitle(preset.defaultSubtitle);
    } else if (newLayoutId === 'standard') {
      setTitle(preset.defaultTitle);
      setSubtitle(preset.defaultSubtitle);
    }
  };

  // Generate QR Data URL for Print Preview and Export
  useEffect(() => {
    let isCancelled = false;
    const loadPreviewImage = async () => {
      if (!qrCodeInstance?.current) return;
      try {
        const blob = await qrCodeInstance.current.getRawData('png');
        if (!isCancelled && blob) {
          const url = await blobToDataUrl(blob);
          setQrDataUrl(url);
        }
      } catch {
        // Fallback: wait for next render cycle
      }
    };
    const timer = setTimeout(loadPreviewImage, 50);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [qrCodeInstance, currentPayload, qrSettings, blobToDataUrl]);

  // Calculate effective paper dimensions (in mm)
  const paperDimensions = useMemo(() => {
    let w = 210;
    let h = 297;
    if (paper === 'Custom') {
      const multiplier = customUnit === 'in' ? INCH_TO_MM : 1;
      w = Number(customWidthMm) * multiplier || 210;
      h = Number(customHeightMm) * multiplier || 297;
    } else {
      const p = PAPER_SIZES[paper] || PAPER_SIZES.A4;
      w = p.widthMm;
      h = p.heightMm;
    }

    if (orientation === 'landscape' && w < h) {
      return { widthMm: h, heightMm: w };
    } else if (orientation === 'portrait' && w > h) {
      return { widthMm: h, heightMm: w };
    }
    return { widthMm: w, heightMm: h };
  }, [paper, customWidthMm, customHeightMm, customUnit, orientation]);

  // Calculate card dimensions
  const cardDimensions = useMemo(() => {
    return calculateCardDimensions({
      layoutType,
      qrSizeMm,
      showTitle,
      showSubtitle,
      title,
      subtitle,
    });
  }, [layoutType, qrSizeMm, showTitle, showSubtitle, title, subtitle]);

  // Calculate print fit and placement items
  const fitResult = useMemo(() => {
    return checkPrintFit({
      paperWidthMm: paperDimensions.widthMm,
      paperHeightMm: paperDimensions.heightMm,
      copies,
      cardWidthMm: cardDimensions.widthMm,
      cardHeightMm: cardDimensions.heightMm,
      marginLeftMm,
      marginRightMm,
      marginTopMm,
      marginBottomMm,
      spacingHMm,
      spacingVMm,
    });
  }, [paperDimensions, copies, cardDimensions, marginLeftMm, marginRightMm, marginTopMm, marginBottomMm, spacingHMm, spacingVMm]);

  // Print Safety Assessment
  const printSafety = useMemo(() => {
    return evaluatePrintSafety({
      qrSizeMm,
      fitResult,
      scanSafety,
      logoSize: qrSettings.logoSize,
      hasLogo: Boolean(qrSettings.logo),
      marginQuietZone: qrSettings.margin,
    });
  }, [qrSizeMm, fitResult, scanSafety, qrSettings]);

  // Auto-fit handler
  const handleAutoFit = () => {
    const optimalSize = calculateAutoFitQrSize({
      paperWidthMm: paperDimensions.widthMm,
      paperHeightMm: paperDimensions.heightMm,
      copies,
      layoutType,
      showTitle,
      showSubtitle,
      title,
      subtitle,
      marginLeftMm,
      marginRightMm,
      marginTopMm,
      marginBottomMm,
      spacingHMm,
      spacingVMm,
    });
    setQrSizeMm(optimalSize);
  };

  // EXPORT 1: PDF Download
  const handleExportPdf = async () => {
    if (!qrDataUrl || !fitResult.fits) return;
    setIsExporting(true);
    setExportSuccessMsg('');
    try {
      // Get ultra-high-resolution QR blob (2048px) for crisp vector-like print
      let highResDataUrl = qrDataUrl;
      if (withExportResolution) {
        try {
          const highResBlob = await withExportResolution((qrCode) => qrCode.getRawData('png'));
          highResDataUrl = await blobToDataUrl(highResBlob);
        } catch {}
      }

      const pdfBlob = await generatePrintPdf({
        paperWidthMm: paperDimensions.widthMm,
        paperHeightMm: paperDimensions.heightMm,
        items: fitResult.items,
        qrImagePngDataUrl: highResDataUrl,
        layoutType,
        showTitle,
        showSubtitle,
        title,
        subtitle,
        businessCardData: businessCardInfo,
        showCuttingGuides,
        showSafeArea,
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rootixa-Print-${paper}-${copies}copies-${layoutType}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setExportSuccessMsg('PDF Downloaded!');
      setTimeout(() => setExportSuccessMsg(''), 3500);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // EXPORT 2: Scalable SVG Download
  const handleExportSvg = () => {
    if (!qrDataUrl || !fitResult.fits) return;
    setIsExporting(true);
    try {
      const svgBlob = generatePrintSvg({
        paperWidthMm: paperDimensions.widthMm,
        paperHeightMm: paperDimensions.heightMm,
        items: fitResult.items,
        qrImagePngDataUrl: qrDataUrl,
        layoutType,
        showTitle,
        showSubtitle,
        title,
        subtitle,
        businessCardData: businessCardInfo,
        showCuttingGuides,
        showSafeArea,
      });

      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rootixa-Print-${paper}-${copies}copies-${layoutType}.svg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setExportSuccessMsg('SVG Downloaded!');
      setTimeout(() => setExportSuccessMsg(''), 3500);
    } finally {
      setIsExporting(false);
    }
  };

  // EXPORT 3: 300 DPI PNG Raster Download
  const handleExportPng = async () => {
    if (!qrDataUrl || !fitResult.fits) return;
    setIsExporting(true);
    try {
      let highResDataUrl = qrDataUrl;
      if (withExportResolution) {
        try {
          const highResBlob = await withExportResolution((qrCode) => qrCode.getRawData('png'));
          highResDataUrl = await blobToDataUrl(highResBlob);
        } catch {}
      }

      const canvas = await generatePrintCanvas({
        paperWidthMm: paperDimensions.widthMm,
        paperHeightMm: paperDimensions.heightMm,
        items: fitResult.items,
        qrImagePngDataUrl: highResDataUrl,
        layoutType,
        showTitle,
        showSubtitle,
        title,
        subtitle,
        businessCardData: businessCardInfo,
        showCuttingGuides,
        showSafeArea,
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Rootixa-Print-${paper}-${copies}copies-300dpi.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setExportSuccessMsg('300 DPI PNG Downloaded!');
        setTimeout(() => setExportSuccessMsg(''), 3500);
      }, 'image/png');
    } finally {
      setIsExporting(false);
    }
  };

  // EXPORT 4: Direct Native Browser Print
  const handleNativePrint = async () => {
    if (!qrDataUrl || !fitResult.fits) return;
    setIsExporting(true);
    try {
      const canvas = await generatePrintCanvas({
        paperWidthMm: paperDimensions.widthMm,
        paperHeightMm: paperDimensions.heightMm,
        items: fitResult.items,
        qrImagePngDataUrl: qrDataUrl,
        layoutType,
        showTitle,
        showSubtitle,
        title,
        subtitle,
        businessCardData: businessCardInfo,
        showCuttingGuides,
        showSafeArea,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <html>
          <head>
            <title>Rootixa Print Sheet</title>
            <style>
              @page {
                size: ${paperDimensions.widthMm}mm ${paperDimensions.heightMm}mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background: #ffffff;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              img {
                width: ${paperDimensions.widthMm}mm;
                height: ${paperDimensions.heightMm}mm;
                display: block;
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print(); setTimeout(() => window.close(), 1000);" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } finally {
      setIsExporting(false);
    }
  };

  // Paper Aspect Ratio for responsive preview container
  const previewAspectRatio = paperDimensions.widthMm / paperDimensions.heightMm;

  return (
    <div className="space-y-6">
      
      {/* SECTION HEADER & RETURN ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSwitchToSingle}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Back to Single QR Customizer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/70">
                Phase 6
              </span>
              <h1 className="text-xl font-extrabold text-slate-900">Print & Business Studio</h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Prepare your customized QR code for real-world printing with multi-copy sheets, business cards, and cutting guides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSwitchToSingle}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            Edit QR Design
          </button>
        </div>
      </div>

      {/* 12-COLUMN MAIN STUDIO LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: PRINT CONFIGURATION CONTROLS (7 cols)        */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. BUSINESS LAYOUT PRESET SELECTOR */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Preset Layout</span>
                <h2 className="text-base font-extrabold text-slate-900">Select Presentation Format</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Does not alter QR payload</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'standard', name: 'Standard QR', icon: QrCodeIcon, badge: 'Versatile' },
                { id: 'business_card', name: 'Business Card', icon: UserCheck, badge: '85×55mm' },
                { id: 'restaurant', name: 'Restaurant / Menu', icon: Utensils, badge: 'Table Tent' },
                { id: 'wifi', name: 'Wi-Fi Sign', icon: Wifi, badge: 'Network' },
                { id: 'contact', name: 'Contact Card', icon: FileText, badge: 'Networking' },
                { id: 'social', name: 'Social Media', icon: Share2, badge: 'Follow Us' },
                { id: 'review', name: 'Review Stand', icon: Star, badge: '5-Star' },
              ].map((item) => {
                const isSelected = layoutType === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectLayout(item.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/20 text-indigo-950'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-tight">{item.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PAPER SIZE & ORIENTATION */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Paper Sheet</span>
                <h2 className="text-base font-extrabold text-slate-900">Paper Size & Orientation</h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {paperDimensions.widthMm.toFixed(1)} × {paperDimensions.heightMm.toFixed(1)} mm
              </span>
            </div>

            {/* Paper Size Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(PAPER_SIZES).map((p) => {
                const isSelected = paper === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaper(p.id)}
                    className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-semibold'
                    }`}
                  >
                    <p className="text-xs">{p.name}</p>
                  </button>
                );
              })}
            </div>

            {/* Custom Dimensions Form */}
            {paper === 'Custom' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Width</label>
                  <input
                    type="number"
                    min="30"
                    max="1000"
                    value={customWidthMm}
                    onChange={(e) => setCustomWidthMm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Height</label>
                  <input
                    type="number"
                    min="30"
                    max="1000"
                    value={customHeightMm}
                    onChange={(e) => setCustomHeightMm(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Unit</label>
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="mm">mm</option>
                    <option value="in">inches</option>
                  </select>
                </div>
              </div>
            )}

            {/* Orientation Switcher */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-bold text-slate-600 mr-2">Orientation:</span>
              <button
                type="button"
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  orientation === 'portrait'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                  orientation === 'landscape'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Landscape
              </button>
            </div>
          </div>

          {/* 3. COPIES & PHYSICAL SIZE */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Layout & Density</span>
                <h2 className="text-base font-extrabold text-slate-900">Copies & Physical Dimensions</h2>
              </div>
              <button
                type="button"
                onClick={handleAutoFit}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                title="Automatically calculate the largest QR size that fits on the page"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Fit Page</span>
              </button>
            </div>

            {/* Copies Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Number of Copies per Page: <span className="text-indigo-600">{copies} copies</span> ({fitResult.cols} × {fitResult.rows} grid)
              </label>
              <div className="grid grid-cols-6 gap-2">
                {COPY_OPTIONS.map((num) => {
                  const isSelected = copies === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCopies(num)}
                      className={`py-2 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {num}×
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Physical QR Size Control */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Physical QR Code Size</p>
                  <p className="text-[11px] text-slate-500">Real printed width on physical paper</p>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="15"
                    max="160"
                    value={qrSizeMm}
                    onChange={(e) => setQrSizeMm(Math.max(15, Number(e.target.value)))}
                    className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-center text-slate-900 outline-none"
                  />
                  <span className="text-xs font-bold text-slate-500">mm</span>
                </div>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="1"
                value={qrSizeMm}
                onChange={(e) => setQrSizeMm(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                <span>15 mm (Compact)</span>
                <span>40 mm (Standard)</span>
                <span>80+ mm (Signage)</span>
              </div>
            </div>

            {/* Margins & Spacing Grid */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-700">Margins & Spacing (mm)</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Page Margin</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={marginLeftMm}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setMarginLeftMm(v);
                      setMarginRightMm(v);
                      setMarginTopMm(v);
                      setMarginBottomMm(v);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">QR Spacing</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={spacingHMm}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSpacingHMm(v);
                      setSpacingVMm(v);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Card Width</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600">
                    {cardDimensions.widthMm.toFixed(0)} mm
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Card Height</label>
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-600">
                    {cardDimensions.heightMm.toFixed(0)} mm
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* 4. LABELS & BUSINESS CARD INFORMATION */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Card Content</span>
                <h2 className="text-base font-extrabold text-slate-900">
                  {layoutType === 'business_card' ? 'Business Card Details' : 'Labels & Typography'}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Appears on printed cards</span>
            </div>

            {/* Business Card Specific Fields */}
            {layoutType === 'business_card' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={businessCardInfo.name}
                      onChange={(e) => setBusinessCardInfo({ ...businessCardInfo, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Designation / Role</label>
                    <input
                      type="text"
                      value={businessCardInfo.title}
                      onChange={(e) => setBusinessCardInfo({ ...businessCardInfo, title: e.target.value })}
                      placeholder="e.g. Software Architect"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={businessCardInfo.phone}
                      onChange={(e) => setBusinessCardInfo({ ...businessCardInfo, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={businessCardInfo.email}
                      onChange={(e) => setBusinessCardInfo({ ...businessCardInfo, email: e.target.value })}
                      placeholder="hello@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Website</label>
                    <input
                      type="text"
                      value={businessCardInfo.website}
                      onChange={(e) => setBusinessCardInfo({ ...businessCardInfo, website: e.target.value })}
                      placeholder="rootixa.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Title and Subtitle Controls */
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showTitle}
                        onChange={(e) => setShowTitle(e.target.checked)}
                        className="rounded text-indigo-600 cursor-pointer"
                      />
                      <span>Print Header / Title</span>
                    </label>
                  </div>
                  {showTitle && (
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Scan with Camera"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showSubtitle}
                        onChange={(e) => setShowSubtitle(e.target.checked)}
                        className="rounded text-indigo-600 cursor-pointer"
                      />
                      <span>Print Description / Subtitle</span>
                    </label>
                  </div>
                  {showSubtitle && (
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Point your camera to connect"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 5. PRINT AIDS (CUTTING GUIDES & SAFE AREA) */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Print Marks & Aids</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={showCuttingGuides}
                  onChange={(e) => setShowCuttingGuides(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-slate-500" /> Cutting / Trim Guides
                  </p>
                  <p className="text-[10px] text-slate-500">Corner crop marks for easy scissor or guillotine trimming</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={showSafeArea}
                  onChange={(e) => setShowSafeArea(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Safe Printable Area
                  </p>
                  <p className="text-[10px] text-slate-500">5mm dashed boundary indicator inside paper edge</p>
                </div>
              </label>
            </div>
          </div>

          {/* 6. PRINT SAFETY FEEDBACK BOX */}
          <div className={`rounded-3xl p-5 border text-xs ${
            printSafety.status === 'unsafe'
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : printSafety.status === 'warning'
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center justify-between font-bold mb-2">
              <div className="flex items-center gap-2">
                {printSafety.status === 'unsafe' && <X className="w-4 h-4 text-rose-600" />}
                {printSafety.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {printSafety.status === 'excellent' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                <span className="text-sm font-extrabold">{printSafety.label}</span>
              </div>
              <span className="text-[11px]">
                {fitResult.fits ? '✓ Fits on Paper' : '✕ Does Not Fit'}
              </span>
            </div>

            {printSafety.issues.length > 0 && (
              <div className="space-y-1 mb-2 font-medium text-[11px]">
                {printSafety.issues.map((iss, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <span className="shrink-0">•</span>
                    <span>{iss.message}</span>
                  </p>
                ))}
              </div>
            )}

            {printSafety.warnings.length > 0 && (
              <div className="space-y-1 font-medium text-[11px] opacity-90">
                {printSafety.warnings.map((warn, idx) => (
                  <p key={idx} className="flex items-start gap-1.5">
                    <span className="shrink-0">⚠</span>
                    <span>{warn}</span>
                  </p>
                ))}
              </div>
            )}

            {!fitResult.fits && (
              <div className="mt-3 pt-2 border-t border-rose-200 flex items-center justify-between">
                <span className="font-semibold text-[11px]">Click to auto-calculate optimal size:</span>
                <button
                  type="button"
                  onClick={handleAutoFit}
                  className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 transition cursor-pointer"
                >
                  ⚡ Auto-Fit Size
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: LIVE PRINT SHEET PREVIEW & EXPORTS (5 cols)  */}
        {/* ========================================================= */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">

            {/* PREVIEW CONTAINER CARD */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 flex flex-col items-center">
              
              {/* Preview Header */}
              <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                  </span>
                  <span>Print Sheet Preview</span>
                </div>

                <div className="text-[11px] font-bold text-slate-500">
                  {copies} {copies === 1 ? 'Copy' : 'Copies'} on {paper}
                </div>
              </div>

              {/* Physical Dimensions Dimension Tag */}
              <div className="w-full px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-semibold mb-4 flex items-center justify-between">
                <span>Sheet: {paperDimensions.widthMm.toFixed(0)} × {paperDimensions.heightMm.toFixed(0)} mm</span>
                <span>QR: {qrSizeMm} mm</span>
                <span>Grid: {fitResult.cols} × {fitResult.rows}</span>
              </div>

              {/* VIRTUAL PAPER SHEET PREVIEW */}
              <div className="w-full flex justify-center bg-slate-100/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80 overflow-hidden shadow-inner">
                <div 
                  className="w-full max-w-[340px] bg-white rounded-md shadow-md border border-slate-300 relative transition-all duration-300 overflow-hidden"
                  style={{
                    aspectRatio: `${previewAspectRatio}`,
                  }}
                >
                  {/* Safe Area Indicator in Preview */}
                  {showSafeArea && (
                    <div 
                      className="absolute border border-dashed border-emerald-500/60 pointer-events-none z-10"
                      style={{
                        top: `${(5 / paperDimensions.heightMm) * 100}%`,
                        bottom: `${(5 / paperDimensions.heightMm) * 100}%`,
                        left: `${(5 / paperDimensions.widthMm) * 100}%`,
                        right: `${(5 / paperDimensions.widthMm) * 100}%`,
                      }}
                    />
                  )}

                  {/* Render Repeated QR Cards in Grid */}
                  {fitResult.items.map((item) => {
                    const leftPct = (item.x / paperDimensions.widthMm) * 100;
                    const topPct = (item.y / paperDimensions.heightMm) * 100;
                    const widthPct = (item.width / paperDimensions.widthMm) * 100;
                    const heightPct = (item.height / paperDimensions.heightMm) * 100;

                    return (
                      <div
                        key={item.index}
                        className="absolute bg-slate-50 border border-slate-200/80 rounded-[3px] p-1 flex flex-col items-center justify-between shadow-2xs overflow-hidden transition-all"
                        style={{
                          left: `${leftPct}%`,
                          top: `${topPct}%`,
                          width: `${widthPct}%`,
                          height: `${heightPct}%`,
                        }}
                      >
                        {/* Trim marks visualizer */}
                        {showCuttingGuides && (
                          <>
                            <span className="absolute -top-1 -left-1 text-[8px] text-slate-400 font-mono">⌜</span>
                            <span className="absolute -top-1 -right-1 text-[8px] text-slate-400 font-mono">⌝</span>
                            <span className="absolute -bottom-1 -left-1 text-[8px] text-slate-400 font-mono">⌞</span>
                            <span className="absolute -bottom-1 -right-1 text-[8px] text-slate-400 font-mono">⌟</span>
                          </>
                        )}

                        {layoutType === 'business_card' ? (
                          <div className="w-full h-full flex items-center justify-between p-1">
                            <div className="flex-1 pr-1 text-left overflow-hidden">
                              <p className="text-[7px] font-extrabold text-slate-900 truncate">{businessCardInfo.name || 'Your Name'}</p>
                              <p className="text-[5px] font-bold text-indigo-600 truncate">{businessCardInfo.title || 'Job Title'}</p>
                              <p className="text-[5px] text-slate-500 truncate mt-0.5">{businessCardInfo.phone || '+1 555-0100'}</p>
                              <p className="text-[5px] text-slate-500 truncate">{businessCardInfo.email || 'hello@site.com'}</p>
                            </div>
                            <div className="shrink-0 w-2/5 aspect-square bg-white rounded border border-slate-200 flex items-center justify-center overflow-hidden">
                              {qrDataUrl ? (
                                <img src={qrDataUrl} alt="QR" className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full bg-slate-200 animate-pulse" />
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            {showTitle && title && (
                              <p className="text-[6px] font-extrabold text-slate-900 truncate w-full text-center px-0.5">
                                {title}
                              </p>
                            )}

                            <div className="w-full flex-1 flex items-center justify-center p-0.5">
                              {qrDataUrl ? (
                                <img src={qrDataUrl} alt="QR" className="max-w-full max-h-full object-contain" />
                              ) : (
                                <div className="w-12 h-12 bg-slate-200 rounded animate-pulse" />
                              )}
                            </div>

                            {layoutType === 'review' && (
                              <div className="flex justify-center text-amber-400 text-[6px] my-0.5">
                                ★★★★★
                              </div>
                            )}

                            {showSubtitle && subtitle && (
                              <p className="text-[5px] font-medium text-slate-500 truncate w-full text-center px-0.5">
                                {subtitle}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OVERFLOW WARNING IF APPLICABLE */}
              {!fitResult.fits && (
                <div className="w-full mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>Layout exceeds printable page margins. Reduce size or click Auto-Fit.</span>
                </div>
              )}

              {/* EXPORT BUTTONS & ACTIONS */}
              <div className="w-full space-y-2.5 mt-5">
                {/* Primary PDF Print Button */}
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isExporting || !fitResult.fits}
                  className="w-full py-3.5 rounded-2xl font-extrabold shadow-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25 transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isExporting ? 'Generating Print File…' : 'Download Print PDF'}</span>
                </button>

                {/* Secondary Vector & Raster Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleExportSvg}
                    disabled={isExporting || !fitResult.fits}
                    className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer text-center disabled:opacity-50"
                    title="Export vector SVG sheet"
                  >
                    SVG Sheet
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPng}
                    disabled={isExporting || !fitResult.fits}
                    className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer text-center disabled:opacity-50"
                    title="Export 300 DPI PNG sheet"
                  >
                    300 DPI PNG
                  </button>

                  <button
                    type="button"
                    onClick={handleNativePrint}
                    disabled={isExporting || !fitResult.fits}
                    className="py-2.5 px-2 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-1"
                    title="Open browser print window"
                  >
                    <Printer className="w-3 h-3" /> Print
                  </button>
                </div>

                {exportSuccessMsg && (
                  <p className="text-center text-xs font-bold text-emerald-600 flex items-center justify-center gap-1.5 pt-1">
                    <CheckCircle className="w-4 h-4" /> {exportSuccessMsg}
                  </p>
                )}
              </div>

            </div>

            {/* Print Tips & Standards Badge */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs text-slate-500 space-y-1 shadow-2xs">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Print Production Standards
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                PDFs are generated at exact ISO/ANSI dimensions with 300+ DPI graphics and vector crop lines, ready for office printers and professional print shops.
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

function QrCodeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="5" height="5" x="3" y="3" rx="1" />
      <rect width="5" height="5" x="16" y="3" rx="1" />
      <rect width="5" height="5" x="3" y="16" rx="1" />
      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
      <path d="M21 21v.01" />
      <path d="M12 7v3a2 2 0 0 1-2 2H7" />
      <path d="M3 12h.01" />
      <path d="M12 3h.01" />
      <path d="M12 16v.01" />
      <path d="M16 12h1" />
      <path d="M21 12v.01" />
      <path d="M12 21v-1" />
    </svg>
  );
}
