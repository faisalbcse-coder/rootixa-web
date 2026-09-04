"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Link as LinkIcon, Type, Wifi, Mail, Download, Palette, CheckCircle, LayoutGrid, 
  ArrowLeft, ImagePlus, Trash2, X, Send, Sliders, ChevronDown, Settings, 
  Zap, FileImage, Grid, Printer
} from 'lucide-react';

const PREVIEW_SIZE = 320;
const POSTER_PRESETS = {
  A4: { label: 'A4 · 210 × 297 mm', width: 210, height: 297 },
  B4: { label: 'B4 · 250 × 353 mm', width: 250, height: 353 },
  Letter: { label: 'Letter · 216 × 279 mm', width: 216, height: 279 },
};

// === Advertisement Placeholder Component ===
const AdSpace = ({ className, text = "Advertisement Space" }) => (
  <div className={`bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-sm tracking-widest uppercase shadow-inner overflow-hidden relative group ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-tr from-gray-50 to-gray-100 opacity-50"></div>
    <span className="relative z-10 text-center px-4">{text}</span>
  </div>
);

// Accordion Component
const Accordion = ({ id, title, icon, isOpen, onToggle, children }) => (
  <div className="border border-gray-100 rounded-2xl mb-4 bg-white shadow-sm transition-all overflow-hidden">
    <button onClick={() => onToggle(isOpen ? '' : id)} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 font-bold text-gray-800">{icon} {title}</div>
      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="p-5 border-t border-gray-100">{children}</div>
    </div>
  </div>
);

export default function QRCodeGenerator() {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('url');
  
  // Data State
  const [qrData, setQrData] = useState({
    url: 'https://rootixa.com', 
    text: '', 
    wifiSsid: '', wifiPassword: '', wifiEncryption: 'WPA', wifiTitle: 'FREE WiFi', wifiSubtitle: 'Scan the code to connect instantly',
    email: '' 
  });

  const [qrSettings, setQrSettings] = useState({
    fgColor: '#4F46E5', bgColor: '#FFFFFF',
    logo: null, logoSize: 0.4, 
    format: 'png',
    exportSize: 2048,
    dotStyle: 'square', 
    eyeFrameStyle: 'square', 
    eyeDotStyle: 'square', 
    errorCorrection: 'H',
  });

  // Lead Generation & Tracking
  const [downloadCount, setDownloadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterSettings, setPosterSettings] = useState({ paper: 'A4', width: 210, height: 297 });
  const [isPosterPreparing, setIsPosterPreparing] = useState(false);
  const [posterError, setPosterError] = useState('');
  
  const [openAccordion, setOpenAccordion] = useState('design'); 
  
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);

  const getFinalQRValue = useCallback(() => {
    if (activeTab === 'wifi') return `WIFI:T:${qrData.wifiEncryption};S:${qrData.wifiSsid};P:${qrData.wifiPassword};;`;
    if (activeTab === 'email') return `mailto:${qrData.email}`;
    if (activeTab === 'text') return qrData.text || ' ';
    return qrData.url || 'https://rootixa.com';
  }, [activeTab, qrData]);

  const updateQRCode = useCallback(() => {
    if (!qrCodeInstance.current) return;
    qrCodeInstance.current.update({
      data: getFinalQRValue(),
      dotsOptions: { color: qrSettings.fgColor, type: qrSettings.dotStyle },
      backgroundOptions: { color: qrSettings.bgColor },
      cornersSquareOptions: { type: qrSettings.eyeFrameStyle, color: qrSettings.fgColor },
      cornersDotOptions: { type: qrSettings.eyeDotStyle, color: qrSettings.fgColor },
      image: qrSettings.logo,
      qrOptions: { errorCorrectionLevel: qrSettings.errorCorrection },
      imageOptions: { hideBackgroundDots: true, imageSize: qrSettings.logoSize, margin: 8 }
    });
  }, [getFinalQRValue, qrSettings]);

  useEffect(() => {
    let isActive = true;
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (!isActive) return;
      qrCodeInstance.current = new QRCodeStyling({
        width: PREVIEW_SIZE, height: PREVIEW_SIZE, margin: 12,
        data: 'https://rootixa.com',
        dotsOptions: { color: '#4F46E5', type: 'square' },
        backgroundOptions: { color: '#FFFFFF' },
        cornersSquareOptions: { type: 'square', color: '#4F46E5' },
        cornersDotOptions: { type: 'square', color: '#4F46E5' },
        qrOptions: { errorCorrectionLevel: 'H' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 8 }
      });
      if (qrRef.current) qrCodeInstance.current.append(qrRef.current);
    });
    return () => { isActive = false; };
  }, []);

  useEffect(() => {
    const restoreSavedDownloadState = () => {
      setDownloadCount(Number(localStorage.getItem('qr_dl_count') || 0));
      setIsSubscribed(localStorage.getItem('qr_user_subscribed') === 'true');
    };
    const timer = window.setTimeout(restoreSavedDownloadState, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => { updateQRCode(); }, [updateQRCode]);

  const handleDataChange = (field, value) => setQrData(prev => ({ ...prev, [field]: value }));
  const handleSettingChange = (field, value) => setQrSettings(prev => ({ ...prev, [field]: value }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => handleSettingChange('logo', event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const initiateDownload = () => {
    if (isSubscribed) executeDownload(false);
    else if (downloadCount >= 2) setShowModal(true);
    else executeDownload(true); 
  };

  const withExportResolution = async (callback) => {
    if (!qrCodeInstance.current) return null;

    qrCodeInstance.current.update({ width: qrSettings.exportSize, height: qrSettings.exportSize, margin: 48 });
    try {
      return await callback(qrCodeInstance.current);
    } finally {
      qrCodeInstance.current.update({ width: PREVIEW_SIZE, height: PREVIEW_SIZE, margin: 12 });
    }
  };

  const executeDownload = async (shouldIncrement = false) => {
    if (!qrCodeInstance.current) return;
    setIsExporting(true);
    try {
      await withExportResolution((qrCode) => qrCode.download({ name: "Rootixa-QR", extension: qrSettings.format }));
      // Non-blocking platform usage tracking
      try {
        fetch("/api/tools/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolId: "qr-code", status: "success" }),
        }).catch(() => {});
      } catch {}
    } finally {
      setIsExporting(false);
    }
    
    if (shouldIncrement && !isSubscribed) {
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);
      localStorage.setItem('qr_dl_count', newCount);
    }
    setShowModal(false);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  const handleEmailSubmit = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    localStorage.setItem('qr_user_subscribed', 'true');
    setIsSubscribed(true);
    await executeDownload(false);
  };

  const blobToDataUrl = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const openWifiPosterPreview = async () => {
    if (!qrCodeInstance.current || isPosterPreparing) return;
    setIsPosterPreparing(true);
    setPosterError('');
    try {
      const imageBlob = await withExportResolution((qrCode) => qrCode.getRawData('png'));
      setPosterPreview({ qrDataUrl: await blobToDataUrl(imageBlob) });
    } finally {
      setIsPosterPreparing(false);
    }
  };

  const selectPosterPaper = (paper) => {
    if (paper === 'custom') return setPosterSettings((current) => ({ ...current, paper }));
    const preset = POSTER_PRESETS[paper];
    setPosterSettings({ paper, width: preset.width, height: preset.height });
  };

  const createPosterDataUrl = async () => {
    if (!posterPreview) return null;
    const longestSide = Math.max(posterSettings.width, posterSettings.height);
    const pixelsPerMm = Math.min(11.81, 5000 / longestSide);
    const width = Math.round(posterSettings.width * pixelsPerMm);
    const height = Math.round(posterSettings.height * pixelsPerMm);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    const scale = Math.min(width / 210, height / 297);
    const roundedRect = (x, y, rectWidth, rectHeight, radius) => {
      context.beginPath();
      context.roundRect(x, y, rectWidth, rectHeight, radius);
      context.fill();
    };
    const drawText = (text, y, font, color, maxWidth) => {
      context.font = font;
      context.fillStyle = color;
      context.textAlign = 'center';
      const words = text.split(' ');
      let line = '';
      const lines = [];
      words.forEach((word) => {
        const nextLine = `${line}${word} `;
        if (context.measureText(nextLine).width > maxWidth && line) {
          lines.push(line.trim());
          line = `${word} `;
        } else line = nextLine;
      });
      lines.push(line.trim());
      const lineHeight = Number(font.match(/(\d+)px/)?.[1] || 16) * 1.35;
      lines.forEach((lineText, index) => context.fillText(lineText, width / 2, y + index * lineHeight));
      return y + lines.length * lineHeight;
    };

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    const padding = 15 * scale;
    context.fillStyle = '#f8fafc';
    roundedRect(padding, padding, width - padding * 2, height - padding * 2, 8 * scale);
    let y = 42 * scale;
    y = drawText(qrData.wifiTitle || 'FREE WiFi', y, `800 ${11 * scale}px Arial`, '#4f46e5', width - padding * 4) + 7 * scale;
    y = drawText(qrData.wifiSubtitle || 'Scan the code to connect instantly', y, `500 ${4.3 * scale}px Arial`, '#64748b', width - padding * 5) + 9 * scale;
    const qrImage = await new Promise((resolve, reject) => {
      const image = new window.Image();
      image.decoding = 'sync';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = posterPreview.qrDataUrl;
    });
    if (!qrImage.naturalWidth || !qrImage.naturalHeight) throw new Error('QR image could not be prepared.');
    if (qrImage.decode) await qrImage.decode();
    const qrSize = Math.min(width * 0.62, height * 0.36);
    const qrX = (width - qrSize) / 2;
    context.fillStyle = '#ffffff';
    roundedRect(qrX - 5 * scale, y - 5 * scale, qrSize + 10 * scale, qrSize + 10 * scale, 5 * scale);
    context.imageSmoothingEnabled = false;
    context.drawImage(qrImage, qrX, y, qrSize, qrSize);
    y += qrSize + 16 * scale;
    context.fillStyle = '#e0e7ff';
    roundedRect(padding * 2, y, width - padding * 4, 35 * scale, 5 * scale);
    y = drawText('NETWORK NAME', y + 9 * scale, `700 ${3 * scale}px Arial`, '#64748b', width - padding * 5) + 3 * scale;
    y = drawText(qrData.wifiSsid || 'Guest WiFi', y, `800 ${6 * scale}px Arial`, '#0f172a', width - padding * 5) + 9 * scale;
    y = drawText('PASSWORD', y, `700 ${3 * scale}px Arial`, '#64748b', width - padding * 5) + 3 * scale;
    drawText(qrData.wifiPassword || 'None', y, `800 ${6 * scale}px Arial`, '#0f172a', width - padding * 5);
    context.font = `500 ${2.6 * scale}px Arial`;
    context.fillStyle = '#94a3b8';
    context.textAlign = 'center';
    context.fillText('Powered by Rootixa QR Generator', width / 2, height - 24 * scale);
    return canvas.toDataURL('image/png');
  };

  const downloadWifiPoster = async () => {
    setIsPosterPreparing(true);
    setPosterError('');
    try {
      const dataUrl = await createPosterDataUrl();
      if (!dataUrl) throw new Error('Poster preview is not ready.');
      const link = document.createElement('a');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `Rootixa-WiFi-Poster-${posterSettings.paper}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setPosterError('Download তৈরি করা যায়নি। আবার চেষ্টা করুন।');
    } finally {
      setIsPosterPreparing(false);
    }
  };

  const printWifiPoster = async () => {
    setIsPosterPreparing(true);
    try {
      const dataUrl = await createPosterDataUrl();
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`<html><head><title>Rootixa WiFi Poster</title><style>@page { size: ${posterSettings.width}mm ${posterSettings.height}mm; margin: 0; } body { margin: 0; } img { display: block; width: ${posterSettings.width}mm; height: ${posterSettings.height}mm; }</style></head><body><img src="${dataUrl}" onload="window.print()" /></body></html>`);
      printWindow.document.close();
    } finally {
      setIsPosterPreparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-800 pb-20">

      {posterPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="mx-auto my-4 w-full max-w-5xl rounded-3xl bg-white p-5 shadow-2xl md:p-7">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">WiFi poster</p>
                <h2 className="text-2xl font-extrabold text-slate-900">Preview before print or download</h2>
                <p className="mt-1 text-sm text-slate-500">Your selected content is automatically kept on one page.</p>
              </div>
              <button onClick={() => setPosterPreview(null)} className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close poster preview"><X /></button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Paper size</label>
                <select value={posterSettings.paper} onChange={(event) => selectPosterPaper(event.target.value)} className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500">
                  {Object.entries(POSTER_PRESETS).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}
                  <option value="custom">Custom size</option>
                </select>
                {posterSettings.paper === 'custom' && (
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <label className="text-xs font-bold text-slate-500">Width (mm)<input type="number" min="100" max="1000" value={posterSettings.width} onChange={(event) => setPosterSettings((current) => ({ ...current, width: Number(event.target.value) || 100 }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-800 outline-none focus:border-indigo-500" /></label>
                    <label className="text-xs font-bold text-slate-500">Height (mm)<input type="number" min="100" max="1400" value={posterSettings.height} onChange={(event) => setPosterSettings((current) => ({ ...current, height: Number(event.target.value) || 100 }))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-800 outline-none focus:border-indigo-500" /></label>
                  </div>
                )}
                <p className="mb-5 rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-700">{posterSettings.width} × {posterSettings.height} mm · One-page layout</p>
                <button onClick={downloadWifiPoster} disabled={isPosterPreparing} className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70"><Download className="w-4 h-4" /> Download poster PNG</button>
                <button onClick={printWifiPoster} disabled={isPosterPreparing} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-wait disabled:opacity-70"><Printer className="w-4 h-4" /> Print this size</button>
                {posterError && <p className="mt-3 text-xs font-medium text-rose-600">{posterError}</p>}
              </aside>

              <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-2xl bg-slate-200 p-5">
                <div className="w-full max-w-[430px] shrink-0 bg-slate-50 p-5 text-center shadow-xl" style={{ aspectRatio: `${posterSettings.width} / ${posterSettings.height}` }}>
                  <div className="flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white px-4 py-5">
                    <h3 className="text-xl font-extrabold text-indigo-600">{qrData.wifiTitle || 'FREE WiFi'}</h3>
                    <p className="mt-1 text-xs text-slate-500">{qrData.wifiSubtitle || 'Scan the code to connect instantly'}</p>
                    <div className="my-auto rounded-2xl border-4 border-slate-100 bg-white p-2 shadow-sm"><Image src={posterPreview.qrDataUrl} alt="WiFi QR code" width={144} height={144} unoptimized className="w-36 max-w-full" /></div>
                    <div className="w-full rounded-xl bg-indigo-50 px-3 py-3">
                      <p className="text-[9px] font-bold tracking-widest text-slate-500">NETWORK NAME</p>
                      <p className="truncate text-sm font-extrabold text-slate-900">{qrData.wifiSsid || 'Guest WiFi'}</p>
                      <p className="mt-2 text-[9px] font-bold tracking-widest text-slate-500">PASSWORD</p>
                      <p className="truncate text-sm font-extrabold text-slate-900">{qrData.wifiPassword || 'None'}</p>
                    </div>
                    <p className="mt-3 text-[9px] text-slate-400">Powered by Rootixa QR Generator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lead Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Unlock Unlimited</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              You&apos;ve reached your free download limit. Enter your email to unlock unlimited high-res downloads forever.
            </p>
            <input 
              type="email" placeholder="your@email.com" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={userEmail} onChange={(e) => setUserEmail(e.target.value)}
            />
            <button onClick={handleEmailSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-indigo-600/20">
              Unlock & Download <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 py-4 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
          <span className="text-xl font-extrabold text-gray-900">Rootixa<span className="text-indigo-600">.</span></span>
        </div>
      </nav>

      {/* AD SPACE 1: TOP BANNER (Perfect for Leaderboard Ads) */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <AdSpace className="w-full h-[90px]" text="Top Banner Ad Space (728x90)" />
      </div>

      {/* Header & Toggle */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">QR Code Generator</h1>
            <p className="text-sm text-gray-500">Create, customize, and track dynamic QR codes.</p>
          </div>
          <div className="flex items-center bg-gray-100 p-1.5 rounded-full relative w-full md:w-auto">
            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow transition-all duration-300 ease-out ${isAdvanced ? 'left-[calc(50%+3px)]' : 'left-1.5'}`}></div>
            <button onClick={() => setIsAdvanced(false)} className={`relative flex-1 md:w-32 py-2 text-sm font-bold z-10 transition-colors ${!isAdvanced ? 'text-indigo-600' : 'text-gray-500'}`}>Basic Mode</button>
            <button onClick={() => setIsAdvanced(true)} className={`relative flex-1 md:w-32 py-2 text-sm font-bold flex items-center justify-center gap-1 z-10 transition-colors ${isAdvanced ? 'text-indigo-600' : 'text-gray-500'}`}>
              <Sliders className="w-3.5 h-3.5" /> Advanced
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">1. QR Content</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { id: 'url', name: 'URL', icon: <LinkIcon className="w-4 h-4" /> },
                  { id: 'text', name: 'Text', icon: <Type className="w-4 h-4" /> },
                  { id: 'wifi', name: 'WiFi', icon: <Wifi className="w-4 h-4" /> },
                  { id: 'email', name: 'Email', icon: <Mail className="w-4 h-4" /> }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                    {tab.icon} {tab.name}
                  </button>
                ))}
              </div>

              {activeTab === 'url' && <input value={qrData.url} onChange={e => handleDataChange('url', e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-indigo-500 transition-all" placeholder="https://example.com" />}
              {activeTab === 'text' && <textarea value={qrData.text} onChange={e => handleDataChange('text', e.target.value)} rows="3" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-indigo-500 resize-none transition-all" placeholder="Enter your text..." />}
              {activeTab === 'wifi' && (
                <div className="space-y-4">
                  <input value={qrData.wifiSsid} onChange={e => handleDataChange('wifiSsid', e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-indigo-500" placeholder="Network Name (SSID)" />
                  <div className="flex gap-4">
                    <input value={qrData.wifiPassword} onChange={e => handleDataChange('wifiPassword', e.target.value)} className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-indigo-500" placeholder="Password" />
                    <select value={qrData.wifiEncryption} onChange={e => handleDataChange('wifiEncryption', e.target.value)} className="w-1/3 p-4 bg-gray-50 border rounded-2xl font-bold outline-none focus:border-indigo-500">
                      <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option>
                    </select>
                  </div>
                  <div className="grid gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-indigo-700">Poster headline</label>
                      <input value={qrData.wifiTitle} maxLength={48} onChange={e => handleDataChange('wifiTitle', e.target.value)} className="w-full rounded-xl border border-indigo-100 bg-white p-3 text-sm font-bold text-gray-800 outline-none focus:border-indigo-500" placeholder="FREE WiFi" />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-indigo-700">Poster subheadline</label>
                      <input value={qrData.wifiSubtitle} maxLength={90} onChange={e => handleDataChange('wifiSubtitle', e.target.value)} className="w-full rounded-xl border border-indigo-100 bg-white p-3 text-sm text-gray-800 outline-none focus:border-indigo-500" placeholder="Scan the code to connect instantly" />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'email' && (
                <input value={qrData.email} onChange={e => handleDataChange('email', e.target.value)} type="email" className="w-full p-4 bg-gray-50 border rounded-2xl outline-none focus:border-indigo-500 transition-all" placeholder="Recipient Email Address" />
              )}
            </div>

            {/* Design Controls */}
            {!isAdvanced ? (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-lg font-bold mb-4">2. Basic Design</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-2xl border flex items-center justify-between">
                    <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">QR Color</label>
                       <span className="font-mono text-sm text-gray-800">{qrSettings.fgColor}</span>
                    </div>
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                      <input type="color" value={qrSettings.fgColor} onChange={e => handleSettingChange('fgColor', e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border flex items-center justify-between">
                    <div>
                       <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Background</label>
                       <span className="font-mono text-sm text-gray-800">{qrSettings.bgColor}</span>
                    </div>
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                      <input type="color" value={qrSettings.bgColor} onChange={e => handleSettingChange('bgColor', e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Add Logo</span>
                  {qrSettings.logo ? (
                    <button onClick={() => handleSettingChange('logo', null)} className="text-red-500 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg">Remove</button>
                  ) : (
                    <label className="bg-indigo-600 text-white text-xs font-bold py-2 px-4 rounded-lg cursor-pointer">Upload <input type="file" onChange={handleLogoUpload} className="hidden" /></label>
                  )}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 space-y-4">
                <Accordion id="design" title="QR Pattern & Colors" icon={<Grid className="w-5 h-5 text-indigo-500" />} isOpen={openAccordion === 'design'} onToggle={setOpenAccordion}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">QR Dot Pattern</label>
                       <select value={qrSettings.dotStyle} onChange={e => handleSettingChange('dotStyle', e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none font-medium">
                         <option value="square">Standard Squares</option><option value="dots">Rounded Dots (Modern)</option>
                         <option value="rounded">Soft Rounded</option><option value="classy">Classy Style</option>
                         <option value="classy-rounded">Classy Rounded</option><option value="extra-rounded">Extra Rounded</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Eye Frame Shape</label>
                       <select value={qrSettings.eyeFrameStyle} onChange={e => handleSettingChange('eyeFrameStyle', e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none font-medium">
                         <option value="square">Sharp Square</option><option value="dot">Circular Dot</option><option value="extra-rounded">Extra Rounded Square</option>
                       </select>
                    </div>
                    
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">
                      <div className="p-3 border rounded-xl bg-gray-50 flex items-center justify-between">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Foreground</label>
                          <input type="text" value={qrSettings.fgColor} onChange={e => handleSettingChange('fgColor', e.target.value)} className="bg-transparent font-mono text-sm outline-none w-20" />
                        </div>
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                          <input type="color" value={qrSettings.fgColor} onChange={e => handleSettingChange('fgColor', e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                        </div>
                      </div>
                      <div className="p-3 border rounded-xl bg-gray-50 flex items-center justify-between">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Background</label>
                          <input type="text" value={qrSettings.bgColor} onChange={e => handleSettingChange('bgColor', e.target.value)} className="bg-transparent font-mono text-sm outline-none w-20" />
                        </div>
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                          <input type="color" value={qrSettings.bgColor} onChange={e => handleSettingChange('bgColor', e.target.value)} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Accordion>

                <Accordion id="logo" title="Logo & Branding" icon={<ImagePlus className="w-5 h-5 text-pink-500" />} isOpen={openAccordion === 'logo'} onToggle={setOpenAccordion}>
                   <div className="space-y-6">
                     <div className="flex items-center justify-between p-4 border border-dashed border-gray-300 rounded-2xl bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">Brand Logo</p>
                          <p className="text-xs text-gray-500">Auto-centered with background cutout</p>
                        </div>
                        {qrSettings.logo ? (
                          <button onClick={() => handleSettingChange('logo', null)} className="text-red-500 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1"><Trash2 className="w-4 h-4"/> Remove</button>
                        ) : (
                          <label className="bg-indigo-600 text-white text-sm font-bold py-2 px-4 rounded-xl cursor-pointer">Upload File<input type="file" onChange={handleLogoUpload} className="hidden" /></label>
                        )}
                     </div>
                     {qrSettings.logo && (
                       <div>
                         <div className="flex justify-between text-xs font-bold text-gray-500 mb-2"><span>Logo Scale Size</span> <span>{Math.round(qrSettings.logoSize * 100)}%</span></div>
                         <input type="range" min="0.1" max="0.5" step="0.05" value={qrSettings.logoSize} onChange={e => handleSettingChange('logoSize', parseFloat(e.target.value))} className="w-full accent-indigo-600" />
                       </div>
                     )}
                   </div>
                </Accordion>
                
                <Accordion id="advanced" title="Advanced Settings" icon={<Settings className="w-5 h-5 text-slate-600" />} isOpen={openAccordion === 'advanced'} onToggle={setOpenAccordion}>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Error Correction Level</label>
                     <select value={qrSettings.errorCorrection} onChange={e => handleSettingChange('errorCorrection', e.target.value)} className="w-full p-3 bg-gray-50 border rounded-xl outline-none font-medium">
                       <option value="L">Low (Best for simple designs)</option>
                       <option value="M">Medium (Standard)</option>
                       <option value="Q">Quartile</option>
                       <option value="H">High (Required for Logos)</option>
                     </select>
                   </div>
                </Accordion>
              </div>
            )}
          </div>

          {/* RIGHT PANEL (Sticky Wrapper for Both Preview & Ads) */}
          <div className="lg:col-span-4">
            {/* The single sticky wrapper container */}
            <div className="sticky top-28 space-y-6">
              
              {/* Box 1: Preview & Download Card */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col items-center">
                
                {/* Premium Center Badge */}
                <div className="relative mb-6">
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-20"></div>
                  <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-100 text-indigo-700 text-xs font-bold shadow-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Live Preview
                  </div>
                </div>

                {/* Engine Canvas */}
                <div 
                  className="p-4 rounded-2xl mb-8 border border-gray-200 flex justify-center items-center transition-colors duration-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)]"
                  style={{ backgroundColor: qrSettings.bgColor }}
                >
                  <div ref={qrRef} className="rounded-xl overflow-hidden [&>canvas]:max-w-full [&>canvas]:h-auto" />
                </div>

                <div className="w-full">
                  {/* GLOBAL EXPORT SETTINGS */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl mb-3">
                     <span className="text-sm font-bold text-gray-600 flex items-center gap-1"><FileImage className="w-4 h-4"/> Format:</span>
                     <select value={qrSettings.format} onChange={e => handleSettingChange('format', e.target.value)} className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer">
                       <option value="png">PNG (High Res)</option>
                       <option value="jpeg">JPG</option>
                       <option value="webp">WEBP</option>
                       <option value="svg">SVG (Vector)</option>
                     </select>
                  </div>

                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl mb-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-700">Export quality</p>
                        <p className="text-[11px] text-gray-500">Higher resolution for print and sharp scanning.</p>
                      </div>
                      <select value={qrSettings.exportSize} onChange={e => handleSettingChange('exportSize', Number(e.target.value))} className="shrink-0 bg-white border border-indigo-100 rounded-lg px-2 py-1.5 text-sm font-bold text-indigo-700 outline-none cursor-pointer">
                        <option value={1024}>Standard · 1024px</option>
                        <option value={2048}>High · 2048px</option>
                        <option value={4096}>Maximum · 4096px</option>
                      </select>
                    </div>
                  </div>

                  {/* Print WiFi Sign Button */}
                  {activeTab === 'wifi' && (
                    <button 
                      onClick={openWifiPosterPreview}
                      disabled={isPosterPreparing}
                      className="w-full mb-3 py-3 rounded-xl font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all flex justify-center items-center gap-2 disabled:cursor-wait disabled:opacity-70"
                    >
                      <Printer className="w-4 h-4" /> {isPosterPreparing ? 'Preparing poster…' : 'Preview WiFi Poster'}
                    </button>
                  )}

                  <button 
                    onClick={initiateDownload}
                    disabled={isExporting}
                    className={`w-full py-4 rounded-xl font-bold shadow-md transition-all flex justify-center items-center gap-2 disabled:cursor-wait disabled:opacity-80 ${
                      isDownloaded ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {isDownloaded ? <CheckCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    {isDownloaded ? 'Saved Successfully!' : isExporting ? 'Preparing high-quality file…' : 'Download QR Code'}
                  </button>

                  <p className="text-[11px] text-gray-400 text-center mt-3">SVG stays perfectly sharp at every size.</p>
                  
                  <p className="text-[11px] text-gray-400 text-center uppercase font-bold tracking-wider mt-4">
                    Download Limit: {isSubscribed ? <span className="text-emerald-500 font-extrabold tracking-widest">Unlimited</span> : `${downloadCount}/2`}
                  </p>
                </div>
              </div>

              {/* Box 2: SIDEBAR AD (Moves safely together with the Preview box) */}
              <AdSpace className="w-full h-[250px]" text="Sidebar Ad Space (300x250)" />
              
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
