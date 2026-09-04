"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Link as LinkIcon, Type, Wifi, Mail, Phone, MessageSquare, MessageCircle, 
  UserCheck, MapPin, Calendar, Share2, Smartphone, Download, CheckCircle, 
  ArrowLeft, ImagePlus, Trash2, X, Send, Sliders, Settings, Zap, 
  Grid, Printer, AlertTriangle, ShieldCheck, Sparkles, Check, Info,
  RotateCcw, Palette, Layers, Eye, Compass, SunDim
} from 'lucide-react';
import {
  buildQRPayload,
  checkPayloadCapacity,
  isValidCoordinate,
  isValidPhone,
  isValidUrl,
  isValidEmail,
  sanitizePhoneNumber,
  sanitizeWhatsAppNumber,
  normalizeUrl
} from '@/lib/qr/payload-builder';
import {
  evaluateScanSafety,
  getGradientRotation,
  DESIGN_PRESETS
} from '@/lib/qr/design-safety';

const PREVIEW_SIZE = 300;
const POSTER_PRESETS = {
  A4: { label: 'A4 · 210 × 297 mm', width: 210, height: 297 },
  B4: { label: 'B4 · 250 × 353 mm', width: 250, height: 353 },
  Letter: { label: 'Letter · 216 × 279 mm', width: 216, height: 279 },
};

// 12 Supported QR Content Types Definition
const QR_TYPES = [
  { id: 'text', name: 'Plain Text', category: 'info', icon: Type, helper: 'Scan to view raw text or notes.' },
  { id: 'url', name: 'Website URL', category: 'links', icon: LinkIcon, helper: 'Scan to open website in browser.' },
  { id: 'wifi', name: 'Wi-Fi Network', category: 'info', icon: Wifi, helper: 'Scan to automatically connect to Wi-Fi.' },
  { id: 'email', name: 'Email Message', category: 'communication', icon: Mail, helper: 'Scan to draft an email message.' },
  { id: 'phone', name: 'Phone Call', category: 'communication', icon: Phone, helper: 'Scan to call this phone number.' },
  { id: 'sms', name: 'SMS Message', category: 'communication', icon: MessageSquare, helper: 'Scan to open a new SMS with this message.' },
  { id: 'whatsapp', name: 'WhatsApp', category: 'communication', icon: MessageCircle, helper: 'Scan to open a WhatsApp conversation.' },
  { id: 'vcard', name: 'Contact / vCard', category: 'info', icon: UserCheck, helper: 'Scan to save this contact to address book.' },
  { id: 'location', name: 'Location', category: 'info', icon: MapPin, helper: 'Scan to open this location on a map.' },
  { id: 'event', name: 'Calendar Event', category: 'info', icon: Calendar, helper: 'Scan to add this event to a compatible calendar.' },
  { id: 'social', name: 'Social Media', category: 'links', icon: Share2, helper: 'Scan to open this social profile or page.' },
  { id: 'app', name: 'App Download', category: 'links', icon: Smartphone, helper: 'Scan to download the app directly from the store.' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Types (12)' },
  { id: 'links', label: 'Web & Apps' },
  { id: 'communication', label: 'Communication' },
  { id: 'info', label: 'Info & Utilities' },
];

// Advertisement Placeholder Component
const AdSpace = ({ className = "", text = "Advertisement Space" }) => (
  <div className={`bg-slate-50/80 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 font-semibold text-xs tracking-wider uppercase overflow-hidden relative group ${className}`}>
    <span className="relative z-10 text-center px-4">{text}</span>
  </div>
);

function isValidHex(hex) {
  return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
}

export default function QRCodeGenerator() {
  const [activeTab, setActiveTab] = useState('text');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customizeTab, setCustomizeTab] = useState('styles');
  
  // Comprehensive QR Data State for all 12 types
  const [qrData, setQrData] = useState({
    text: 'Hello from Rootixa!',
    url: 'https://rootixa.com', 
    wifiSsid: '', 
    wifiPassword: '', 
    wifiEncryption: 'WPA', 
    wifiTitle: 'FREE WiFi', 
    wifiSubtitle: 'Scan the code to connect instantly',
    email: '',
    emailSubject: '',
    emailBody: '',
    phone: '',
    smsPhone: '',
    smsMessage: '',
    whatsappPhone: '',
    whatsappMessage: '',
    vcardFullName: '',
    vcardOrg: '',
    vcardTitle: '',
    vcardPhone: '',
    vcardEmail: '',
    vcardWebsite: '',
    vcardAddress: '',
    geoLat: '',
    geoLng: '',
    geoName: '',
    eventTitle: '',
    eventStartDate: '',
    eventStartTime: '',
    eventEndDate: '',
    eventEndTime: '',
    eventLocation: '',
    eventDescription: '',
    socialPlatform: 'instagram',
    socialUrl: '',
    appAndroidUrl: '',
    appIosUrl: '',
    appName: '',
    appTarget: 'auto',
  });

  // Phase 3 Advanced QR Design Settings
  const [qrSettings, setQrSettings] = useState({
    // Colors & Gradient
    fgColor: '#000000', 
    bgColor: '#FFFFFF',
    isTransparentBg: false,
    isGradient: false,
    gradientStart: '#000000',
    gradientEnd: '#4F46E5',
    gradientDirection: 'diagonal', // 'horizontal', 'vertical', 'diagonal', 'radial'
    
    // Pattern & Eyes
    dotStyle: 'square', 
    eyeFrameStyle: 'square', 
    eyeDotStyle: 'square', 
    customEyeColor: false,
    eyeFrameColor: '#000000',
    eyeDotColor: '#000000',

    // Branding & Logo
    logo: null, 
    logoSize: 0.30, 
    logoBg: 'none', // 'none', 'white'

    // Spacing & Output
    margin: 12,
    errorCorrection: 'H',
    format: 'png',
    exportSize: 2048,
  });

  const [logoFileName, setLogoFileName] = useState('');

  // Lead Generation & Tracking State
  const [downloadCount, setDownloadCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // WiFi Poster State
  const [posterPreview, setPosterPreview] = useState(null);
  const [posterSettings, setPosterSettings] = useState({ paper: 'A4', width: 210, height: 297 });
  const [isPosterPreparing, setIsPosterPreparing] = useState(false);
  const [posterError, setPosterError] = useState('');
  
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);

  // Real-time Modular QR Payload Builder
  const currentPayload = useMemo(() => {
    return buildQRPayload(activeTab, qrData);
  }, [activeTab, qrData]);

  // Payload Capacity & Density Check
  const capacityInfo = useMemo(() => {
    return checkPayloadCapacity(currentPayload, qrSettings.errorCorrection);
  }, [currentPayload, qrSettings.errorCorrection]);

  // Real Measurable Scan Safety Evaluation
  const scanSafety = useMemo(() => {
    return evaluateScanSafety(qrSettings);
  }, [qrSettings]);

  // Field Validations for active tab
  const activeHelper = useMemo(() => {
    const found = QR_TYPES.find(t => t.id === activeTab);
    return found ? found.helper : 'Scan with any mobile camera.';
  }, [activeTab]);

  const isUrlInvalid = activeTab === 'url' && qrData.url.trim() !== '' && !isValidUrl(qrData.url);
  const isEmailInvalid = activeTab === 'email' && qrData.email.trim() !== '' && !isValidEmail(qrData.email);
  const isPhoneInvalid = activeTab === 'phone' && qrData.phone.trim() !== '' && !isValidPhone(qrData.phone);
  const isSmsPhoneInvalid = activeTab === 'sms' && qrData.smsPhone.trim() !== '' && !isValidPhone(qrData.smsPhone);
  const isWhatsappPhoneInvalid = activeTab === 'whatsapp' && qrData.whatsappPhone.trim() !== '' && !isValidPhone(qrData.whatsappPhone);
  const isGeoInvalid = activeTab === 'location' && (qrData.geoLat.trim() !== '' || qrData.geoLng.trim() !== '') && !isValidCoordinate(qrData.geoLat, qrData.geoLng);
  const isSocialInvalid = activeTab === 'social' && qrData.socialUrl.trim() !== '' && qrData.socialUrl.includes('://') && !isValidUrl(qrData.socialUrl);
  const isAppInvalid = activeTab === 'app' && (
    (qrData.appAndroidUrl.trim() !== '' && !isValidUrl(qrData.appAndroidUrl)) ||
    (qrData.appIosUrl.trim() !== '' && !isValidUrl(qrData.appIosUrl))
  );

  // Filtered types based on selected category pill
  const filteredTypes = useMemo(() => {
    if (selectedCategory === 'all') return QR_TYPES;
    return QR_TYPES.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const updateQRCode = useCallback(() => {
    if (!qrCodeInstance.current) return;

    // Build dotsOptions with solid or gradient fill
    const dotsOptions = {
      type: qrSettings.dotStyle,
      ...(qrSettings.isGradient
        ? {
            gradient: {
              type: qrSettings.gradientDirection === 'radial' ? 'radial' : 'linear',
              rotation: getGradientRotation(qrSettings.gradientDirection),
              colorStops: [
                { offset: 0, color: qrSettings.gradientStart || '#000000' },
                { offset: 1, color: qrSettings.gradientEnd || '#4F46E5' }
              ]
            }
          }
        : { color: qrSettings.fgColor })
    };

    // Build cornersSquareOptions
    const cornersSquareOptions = {
      type: qrSettings.eyeFrameStyle,
      color: qrSettings.customEyeColor ? (qrSettings.eyeFrameColor || qrSettings.fgColor) : qrSettings.fgColor
    };

    // Build cornersDotOptions
    const cornersDotOptions = {
      type: qrSettings.eyeDotStyle,
      color: qrSettings.customEyeColor ? (qrSettings.eyeDotColor || qrSettings.fgColor) : qrSettings.fgColor
    };

    // Build backgroundOptions
    const backgroundOptions = {
      color: qrSettings.isTransparentBg ? 'transparent' : qrSettings.bgColor
    };

    qrCodeInstance.current.update({
      data: currentPayload,
      margin: qrSettings.margin,
      dotsOptions,
      backgroundOptions,
      cornersSquareOptions,
      cornersDotOptions,
      image: qrSettings.logo,
      qrOptions: { errorCorrectionLevel: qrSettings.errorCorrection },
      imageOptions: { 
        hideBackgroundDots: true, 
        imageSize: qrSettings.logoSize, 
        margin: qrSettings.logoBg === 'white' ? 12 : 8 
      }
    });
  }, [currentPayload, qrSettings]);

  useEffect(() => {
    let isActive = true;
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      if (!isActive) return;
      qrCodeInstance.current = new QRCodeStyling({
        width: PREVIEW_SIZE, 
        height: PREVIEW_SIZE, 
        margin: 12,
        data: 'Hello from Rootixa!',
        dotsOptions: { color: '#000000', type: 'square' },
        backgroundOptions: { color: '#FFFFFF' },
        cornersSquareOptions: { type: 'square', color: '#000000' },
        cornersDotOptions: { type: 'square', color: '#000000' },
        qrOptions: { errorCorrectionLevel: 'H' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.30, margin: 8 }
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

  const handleApplyPreset = (presetKey) => {
    const preset = DESIGN_PRESETS[presetKey];
    if (!preset) return;
    setQrSettings(prev => ({
      ...prev,
      ...preset.settings
    }));
  };

  const handleResetDesign = () => {
    setQrSettings(prev => ({
      ...prev,
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: false,
      gradientStart: '#000000',
      gradientEnd: '#4F46E5',
      gradientDirection: 'diagonal',
      dotStyle: 'square',
      eyeFrameStyle: 'square',
      eyeDotStyle: 'square',
      customEyeColor: false,
      eyeFrameColor: '#000000',
      eyeDotColor: '#000000',
      logo: null,
      logoSize: 0.30,
      logoBg: 'none',
      margin: 12,
      errorCorrection: 'H',
    }));
    setLogoFileName('');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        handleSettingChange('logo', event.target.result);
        if (qrSettings.errorCorrection === 'L' || qrSettings.errorCorrection === 'M') {
          handleSettingChange('errorCorrection', 'H'); // Automatic best practice
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    handleSettingChange('logo', null);
    setLogoFileName('');
  };

  const initiateDownload = () => {
    if (isSubscribed) executeDownload(false);
    else if (downloadCount >= 2) setShowModal(true);
    else executeDownload(true); 
  };

  const withExportResolution = async (callback) => {
    if (!qrCodeInstance.current) return null;
    const ratio = qrSettings.exportSize / PREVIEW_SIZE;
    const exportMargin = Math.round(qrSettings.margin * ratio);
    
    // Safety guard for JPG format when transparent background is selected
    const isJpgWithTransparency = qrSettings.format === 'jpeg' && qrSettings.isTransparentBg;

    qrCodeInstance.current.update({ 
      width: qrSettings.exportSize, 
      height: qrSettings.exportSize, 
      margin: exportMargin,
      ...(isJpgWithTransparency ? { backgroundOptions: { color: '#FFFFFF' } } : {})
    });
    try {
      return await callback(qrCodeInstance.current);
    } finally {
      qrCodeInstance.current.update({ 
        width: PREVIEW_SIZE, 
        height: PREVIEW_SIZE, 
        margin: qrSettings.margin,
        ...(isJpgWithTransparency ? { backgroundOptions: { color: 'transparent' } } : {})
      });
    }
  };

  const executeDownload = async (shouldIncrement = false) => {
    if (!qrCodeInstance.current) return;
    setIsExporting(true);
    try {
      await withExportResolution((qrCode) => qrCode.download({ name: `Rootixa-QR-${activeTab}`, extension: qrSettings.format }));
      try {
        fetch("/api/tools/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ toolId: "qr-code", status: "success", qrType: activeTab }),
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
    } catch {
      setPosterError('Could not prepare poster download. Please try again.');
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

  const dotPatternOptions = [
    { id: 'square', label: 'Classic Square', desc: 'Standard crisp blocks' },
    { id: 'dots', label: 'Rounded Dots', desc: 'Modern circular elements' },
    { id: 'rounded', label: 'Soft Rounded', desc: 'Curved module corners' },
    { id: 'classy', label: 'Classy Style', desc: 'Subtle diamond cut' },
    { id: 'classy-rounded', label: 'Classy Rounded', desc: 'Refined smooth contours' },
    { id: 'extra-rounded', label: 'Extra Rounded', desc: 'Pill-shaped aesthetic' },
  ];

  const eyeFrameOptions = [
    { id: 'square', label: 'Sharp Square', desc: 'Standard square outer box' },
    { id: 'extra-rounded', label: 'Smooth Rounded', desc: 'Curved modern corners' },
    { id: 'dot', label: 'Circular Ring', desc: 'Concentric circular frame' },
  ];

  const eyeDotOptions = [
    { id: 'square', label: 'Sharp Square', desc: 'Classic center module' },
    { id: 'dot', label: 'Circular Dot', desc: 'Round center pupil' },
  ];

  const errorCorrectionOptions = [
    { id: 'L', label: 'Low (7%)', desc: 'Best for simple data & maximum scan density' },
    { id: 'M', label: 'Medium (15%)', desc: 'Standard for everyday clean print codes' },
    { id: 'Q', label: 'Quartile (25%)', desc: 'High resilience against surface scratches' },
    { id: 'H', label: 'High (30%)', desc: 'Strongest recovery · Required with brand logos' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 pb-20">

      {/* WiFi Poster Modal */}
      {posterPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="mx-auto my-4 w-full max-w-5xl rounded-3xl bg-white p-5 shadow-2xl md:p-7">
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">Printable Signage</p>
                <h2 className="text-2xl font-extrabold text-slate-900">WiFi Poster Preview</h2>
                <p className="mt-1 text-sm text-slate-500">Your network details and QR code formatted for immediate printing.</p>
              </div>
              <button 
                onClick={() => setPosterPreview(null)} 
                className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer" 
                aria-label="Close poster preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
              <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Paper size</label>
                <select 
                  value={posterSettings.paper} 
                  onChange={(event) => selectPosterPaper(event.target.value)} 
                  className="mb-4 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {Object.entries(POSTER_PRESETS).map(([key, preset]) => (
                    <option key={key} value={key}>{preset.label}</option>
                  ))}
                  <option value="custom">Custom Dimensions</option>
                </select>

                {posterSettings.paper === 'custom' && (
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <label className="text-xs font-bold text-slate-500">
                      Width (mm)
                      <input 
                        type="number" 
                        min="100" 
                        max="1000" 
                        value={posterSettings.width} 
                        onChange={(event) => setPosterSettings((current) => ({ ...current, width: Number(event.target.value) || 100 }))} 
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-800 outline-none focus:border-indigo-500" 
                      />
                    </label>
                    <label className="text-xs font-bold text-slate-500">
                      Height (mm)
                      <input 
                        type="number" 
                        min="100" 
                        max="1400" 
                        value={posterSettings.height} 
                        onChange={(event) => setPosterSettings((current) => ({ ...current, height: Number(event.target.value) || 100 }))} 
                        className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-800 outline-none focus:border-indigo-500" 
                      />
                    </label>
                  </div>
                )}

                <p className="mb-5 rounded-xl bg-indigo-50 p-3 text-xs leading-5 text-indigo-700 font-medium">
                  {posterSettings.width} × {posterSettings.height} mm · Single-page layout
                </p>

                <button 
                  onClick={downloadWifiPoster} 
                  disabled={isPosterPreparing} 
                  className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Poster PNG
                </button>

                <button 
                  onClick={printWifiPoster} 
                  disabled={isPosterPreparing} 
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-wait disabled:opacity-70 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Directly
                </button>

                {posterError && <p className="mt-3 text-xs font-medium text-rose-600">{posterError}</p>}
              </aside>

              <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-2xl bg-slate-200 p-5">
                <div 
                  className="w-full max-w-[420px] shrink-0 bg-slate-50 p-5 text-center shadow-xl rounded-2xl" 
                  style={{ aspectRatio: `${posterSettings.width} / ${posterSettings.height}` }}
                >
                  <div className="flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-inner">
                    <h3 className="text-xl font-extrabold text-indigo-600">{qrData.wifiTitle || 'FREE WiFi'}</h3>
                    <p className="mt-1 text-xs text-slate-500">{qrData.wifiSubtitle || 'Scan the code to connect instantly'}</p>
                    <div className="my-auto rounded-2xl border-4 border-slate-100 bg-white p-2 shadow-sm">
                      <Image src={posterPreview.qrDataUrl} alt="WiFi QR code" width={144} height={144} unoptimized className="w-36 max-w-full" />
                    </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 mb-2">Unlock Unlimited Exports</h3>
            <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">
              You have used your 2 free trial downloads. Enter your email address to unlock unlimited high-resolution QR downloads.
            </p>
            <div className="space-y-3">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                value={userEmail} 
                onChange={(e) => setUserEmail(e.target.value)}
              />
              <button 
                onClick={handleEmailSubmit} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer text-sm"
              >
                Unlock Unlimited Access <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-4">
              Instant activation &bull; Zero spam policy
            </p>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-3.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> 
            <span>Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Rootixa<span className="text-indigo-600">.</span>
            </span>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 hidden sm:inline-block">
              QR Studio
            </span>
          </div>
        </div>
      </header>

      {/* Page Title & Intro */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 3 &bull; Advanced QR Design & Branding Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Professional QR Studio
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Design production-grade branded QR codes with gradients, custom eye frames, logos, and real-time scan safety intelligence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ISO/IEC 18004 Standard</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT CONFIGURATION PANEL (7 cols)                         */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6">

            {/* STEP 1: CONTENT INPUT CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Step 1</span>
                  <h2 className="text-lg font-extrabold text-slate-900">Select Data Type</h2>
                </div>
                <p className="text-xs text-slate-400 font-medium">{activeHelper}</p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 mb-4 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                {CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isActive 
                          ? 'bg-white text-indigo-600 shadow-2xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* 12-Type Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                {filteredTypes.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button 
                      key={tab.id} 
                      onClick={() => setActiveTab(tab.id)} 
                      type="button"
                      className={`flex flex-col items-start p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                        isActive 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20' 
                          : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                      role="tab"
                      aria-selected={isActive}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                        {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-xs font-bold leading-tight">{tab.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC CONTENT INPUT FIELDS (12 Types) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">

                {/* 1. Plain Text (Placed First) */}
                {activeTab === 'text' && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex justify-between items-center">
                      <label htmlFor="qr-text-input" className="block text-xs font-bold text-slate-700">
                        Raw Text Content <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {qrData.text.length} characters
                      </span>
                    </div>
                    <textarea 
                      id="qr-text-input"
                      value={qrData.text} 
                      onChange={e => handleDataChange('text', e.target.value)} 
                      rows={4} 
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white resize-none transition" 
                      placeholder="Enter plain text, notes, serial numbers, or a message..." 
                    />
                    <p className="text-[11px] text-slate-400">
                      Scanners will immediately display this raw text upon scanning.
                    </p>
                  </div>
                )}

                {/* 2. Website URL */}
                {activeTab === 'url' && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label htmlFor="qr-url-input" className="block text-xs font-bold text-slate-700">
                      Website URL <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      id="qr-url-input"
                      type="url"
                      value={qrData.url} 
                      onChange={e => handleDataChange('url', e.target.value)} 
                      className={`w-full px-4 py-3.5 bg-slate-50 rounded-2xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition ${
                        isUrlInvalid 
                          ? 'border-amber-400 focus:border-amber-500 bg-amber-50/20' 
                          : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                      }`}
                      placeholder="https://example.com" 
                    />
                    {isUrlInvalid && (
                      <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Please enter a valid URL (e.g., https://example.com)
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Scanners will automatically open this link in their default browser.
                    </p>
                  </div>
                )}

                {/* 3. Wi-Fi */}
                {activeTab === 'wifi' && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label htmlFor="wifi-ssid" className="block text-xs font-bold text-slate-700">
                        Network Name (SSID) <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        id="wifi-ssid"
                        value={qrData.wifiSsid} 
                        onChange={e => handleDataChange('wifiSsid', e.target.value)} 
                        className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white" 
                        placeholder="e.g. MyHome_WiFi_5G" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label htmlFor="wifi-password" className="block text-xs font-bold text-slate-700">
                          Password
                        </label>
                        <input 
                          id="wifi-password"
                          type="text"
                          value={qrData.wifiPassword} 
                          onChange={e => handleDataChange('wifiPassword', e.target.value)} 
                          className="w-full px-4 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="Network password" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="wifi-encryption" className="block text-xs font-bold text-slate-700">
                          Security Type
                        </label>
                        <select 
                          id="wifi-encryption"
                          value={qrData.wifiEncryption} 
                          onChange={e => handleDataChange('wifiEncryption', e.target.value)} 
                          className="w-full px-3.5 py-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 cursor-pointer"
                        >
                          <option value="WPA">WPA / WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">None (Open)</option>
                        </select>
                      </div>
                    </div>

                    {/* Optional Signage Headline details for WiFi Poster */}
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800">
                        <Printer className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Printable Signage Details (Optional)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="wifi-title" className="mb-1 block text-[11px] font-semibold text-slate-600">Headline</label>
                          <input 
                            id="wifi-title"
                            value={qrData.wifiTitle} 
                            maxLength={48} 
                            onChange={e => handleDataChange('wifiTitle', e.target.value)} 
                            className="w-full rounded-xl border border-indigo-200/80 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500" 
                            placeholder="FREE WiFi" 
                          />
                        </div>
                        <div>
                          <label htmlFor="wifi-sub" className="mb-1 block text-[11px] font-semibold text-slate-600">Subheadline</label>
                          <input 
                            id="wifi-sub"
                            value={qrData.wifiSubtitle} 
                            maxLength={90} 
                            onChange={e => handleDataChange('wifiSubtitle', e.target.value)} 
                            className="w-full rounded-xl border border-indigo-200/80 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500" 
                            placeholder="Scan the code to connect instantly" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Email */}
                {activeTab === 'email' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label htmlFor="email-recipient" className="block text-xs font-bold text-slate-700">
                        Recipient Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        id="email-recipient"
                        value={qrData.email} 
                        onChange={e => handleDataChange('email', e.target.value)} 
                        type="email" 
                        className={`w-full px-4 py-3.5 bg-slate-50 rounded-2xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition ${
                          isEmailInvalid 
                            ? 'border-amber-400 focus:border-amber-500 bg-amber-50/20' 
                            : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                        }`}
                        placeholder="recipient@example.com" 
                      />
                      {isEmailInvalid && (
                        <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Please enter a valid email address
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email-subject" className="block text-xs font-bold text-slate-700">
                        Subject Line (Optional)
                      </label>
                      <input 
                        id="email-subject"
                        value={qrData.emailSubject} 
                        onChange={e => handleDataChange('emailSubject', e.target.value)} 
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white" 
                        placeholder="e.g. Feedback regarding Rootixa" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email-body" className="block text-xs font-bold text-slate-700">
                        Message Body (Optional)
                      </label>
                      <textarea 
                        id="email-body"
                        value={qrData.emailBody} 
                        onChange={e => handleDataChange('emailBody', e.target.value)} 
                        rows={3} 
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white resize-none transition" 
                        placeholder="Default message template pre-filled for the sender..." 
                      />
                    </div>
                  </div>
                )}

                {/* 5. Phone Call */}
                {activeTab === 'phone' && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label htmlFor="phone-input" className="block text-xs font-bold text-slate-700">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      id="phone-input"
                      type="tel"
                      value={qrData.phone} 
                      onChange={e => handleDataChange('phone', e.target.value)} 
                      className={`w-full px-4 py-3.5 bg-slate-50 rounded-2xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition ${
                        isPhoneInvalid 
                          ? 'border-amber-400 focus:border-amber-500 bg-amber-50/20' 
                          : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                      }`}
                      placeholder="+880 1712-345678" 
                    />
                    {isPhoneInvalid && (
                      <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Please enter a valid telephone number with country code.
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Scan to call this phone number immediately on any smartphone.
                    </p>
                  </div>
                )}

                {/* 6. SMS */}
                {activeTab === 'sms' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label htmlFor="sms-phone" className="block text-xs font-bold text-slate-700">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        id="sms-phone"
                        type="tel"
                        value={qrData.smsPhone} 
                        onChange={e => handleDataChange('smsPhone', e.target.value)} 
                        className={`w-full px-4 py-3.5 bg-slate-50 rounded-2xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition ${
                          isSmsPhoneInvalid 
                            ? 'border-amber-400 focus:border-amber-500 bg-amber-50/20' 
                            : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                        }`}
                        placeholder="+880 1712-345678" 
                      />
                      {isSmsPhoneInvalid && (
                        <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Please enter a valid phone number.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label htmlFor="sms-message" className="block text-xs font-bold text-slate-700">
                          Pre-filled Message (Optional)
                        </label>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {qrData.smsMessage.length} chars
                        </span>
                      </div>
                      <textarea 
                        id="sms-message"
                        value={qrData.smsMessage} 
                        onChange={e => handleDataChange('smsMessage', e.target.value)} 
                        rows={3} 
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white resize-none transition" 
                        placeholder="Hello, I would like to inquire about..." 
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Scan to open a new SMS with this message prefilled.
                    </p>
                  </div>
                )}

                {/* 7. WhatsApp */}
                {activeTab === 'whatsapp' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label htmlFor="wa-phone" className="block text-xs font-bold text-slate-700">
                        WhatsApp Number (with Country Code) <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        id="wa-phone"
                        type="tel"
                        value={qrData.whatsappPhone} 
                        onChange={e => handleDataChange('whatsappPhone', e.target.value)} 
                        className={`w-full px-4 py-3.5 bg-slate-50 rounded-2xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition ${
                          isWhatsappPhoneInvalid 
                            ? 'border-amber-400 focus:border-amber-500 bg-amber-50/20' 
                            : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                        }`}
                        placeholder="8801712345678 (no symbols or spaces)" 
                      />
                      {isWhatsappPhoneInvalid && (
                        <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Please enter digits with country code (e.g. 8801712345678).
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="wa-msg" className="block text-xs font-bold text-slate-700">
                        Prefilled Message (Optional)
                      </label>
                      <textarea 
                        id="wa-msg"
                        value={qrData.whatsappMessage} 
                        onChange={e => handleDataChange('whatsappMessage', e.target.value)} 
                        rows={3} 
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white resize-none transition" 
                        placeholder="Hello from Rootixa! Let's connect." 
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Scan to open a WhatsApp conversation with this message prefilled.
                    </p>
                  </div>
                )}

                {/* 8. Contact / vCard */}
                {activeTab === 'vcard' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label htmlFor="vcard-name" className="block text-xs font-bold text-slate-700">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          id="vcard-name"
                          value={qrData.vcardFullName} 
                          onChange={e => handleDataChange('vcardFullName', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="Jane Doe" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="vcard-org" className="block text-xs font-bold text-slate-700">
                          Organization / Company
                        </label>
                        <input 
                          id="vcard-org"
                          value={qrData.vcardOrg} 
                          onChange={e => handleDataChange('vcardOrg', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="Rootixa Technologies" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="vcard-title" className="block text-xs font-bold text-slate-700">
                          Job Title
                        </label>
                        <input 
                          id="vcard-title"
                          value={qrData.vcardTitle} 
                          onChange={e => handleDataChange('vcardTitle', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="Lead Engineer" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="vcard-phone" className="block text-xs font-bold text-slate-700">
                          Phone Number
                        </label>
                        <input 
                          id="vcard-phone"
                          type="tel"
                          value={qrData.vcardPhone} 
                          onChange={e => handleDataChange('vcardPhone', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="+880 1712-345678" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="vcard-email" className="block text-xs font-bold text-slate-700">
                          Email Address
                        </label>
                        <input 
                          id="vcard-email"
                          type="email"
                          value={qrData.vcardEmail} 
                          onChange={e => handleDataChange('vcardEmail', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="jane@example.com" 
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label htmlFor="vcard-web" className="block text-xs font-bold text-slate-700">
                          Website
                        </label>
                        <input 
                          id="vcard-web"
                          value={qrData.vcardWebsite} 
                          onChange={e => handleDataChange('vcardWebsite', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="https://example.com" 
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label htmlFor="vcard-addr" className="block text-xs font-bold text-slate-700">
                          Physical Address
                        </label>
                        <input 
                          id="vcard-addr"
                          value={qrData.vcardAddress} 
                          onChange={e => handleDataChange('vcardAddress', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="Dhaka, Bangladesh" 
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Scan to save this contact directly into your phone address book (vCard 3.0).
                    </p>
                  </div>
                )}

                {/* 9. Location */}
                {activeTab === 'location' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="geo-lat" className="block text-xs font-bold text-slate-700">
                          Latitude (-90 to 90) <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          id="geo-lat"
                          type="number"
                          step="any"
                          value={qrData.geoLat} 
                          onChange={e => handleDataChange('geoLat', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="23.8103" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="geo-lng" className="block text-xs font-bold text-slate-700">
                          Longitude (-180 to 180) <span className="text-rose-500">*</span>
                        </label>
                        <input 
                          id="geo-lng"
                          type="number"
                          step="any"
                          value={qrData.geoLng} 
                          onChange={e => handleDataChange('geoLng', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="90.4125" 
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                        <label htmlFor="geo-name" className="block text-xs font-bold text-slate-700">
                          Location Name (Optional)
                        </label>
                        <input 
                          id="geo-name"
                          value={qrData.geoName} 
                          onChange={e => handleDataChange('geoName', e.target.value)} 
                          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                          placeholder="Rootixa HQ, Gulshan, Dhaka" 
                        />
                      </div>
                    </div>
                    {isGeoInvalid && (
                      <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Latitude must be between -90 and 90, Longitude between -180 and 180.
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Scan to open this location in Apple Maps, Google Maps, or supported navigation apps.
                    </p>
                  </div>
                )}

                {/* 10. Calendar Event */}
                {activeTab === 'event' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label htmlFor="event-title" className="block text-xs font-bold text-slate-700">
                        Event Title <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        id="event-title"
                        value={qrData.eventTitle} 
                        onChange={e => handleDataChange('eventTitle', e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                        placeholder="Quarterly Product Launch" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label htmlFor="event-start-date" className="block text-xs font-bold text-slate-700">
                          Start Date
                        </label>
                        <input 
                          id="event-start-date"
                          type="date"
                          value={qrData.eventStartDate} 
                          onChange={e => handleDataChange('eventStartDate', e.target.value)} 
                          className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="event-start-time" className="block text-xs font-bold text-slate-700">
                          Start Time
                        </label>
                        <input 
                          id="event-start-time"
                          type="time"
                          value={qrData.eventStartTime} 
                          onChange={e => handleDataChange('eventStartTime', e.target.value)} 
                          className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="event-end-date" className="block text-xs font-bold text-slate-700">
                          End Date
                        </label>
                        <input 
                          id="event-end-date"
                          type="date"
                          value={qrData.eventEndDate} 
                          onChange={e => handleDataChange('eventEndDate', e.target.value)} 
                          className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer" 
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="event-end-time" className="block text-xs font-bold text-slate-700">
                          End Time
                        </label>
                        <input 
                          id="event-end-time"
                          type="time"
                          value={qrData.eventEndTime} 
                          onChange={e => handleDataChange('eventEndTime', e.target.value)} 
                          className="w-full px-4 py-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white cursor-pointer" 
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="event-loc" className="block text-xs font-bold text-slate-700">
                        Location / Venue (Optional)
                      </label>
                      <input 
                        id="event-loc"
                        value={qrData.eventLocation} 
                        onChange={e => handleDataChange('eventLocation', e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white" 
                        placeholder="Grand Ballroom, Dhaka or Zoom link" 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="event-desc" className="block text-xs font-bold text-slate-700">
                        Description (Optional)
                      </label>
                      <textarea 
                        id="event-desc"
                        value={qrData.eventDescription} 
                        onChange={e => handleDataChange('eventDescription', e.target.value)} 
                        rows={2} 
                        className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 outline-none focus:border-indigo-500 focus:bg-white resize-none" 
                        placeholder="Event agenda and details..." 
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Scan to add this event to a compatible calendar (Apple Calendar, Google Calendar, Outlook).
                    </p>
                  </div>
                )}

                {/* 11. Social Media */}
                {activeTab === 'social' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Select Platform
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { id: 'instagram', label: 'Instagram' },
                          { id: 'facebook', label: 'Facebook' },
                          { id: 'youtube', label: 'YouTube' },
                          { id: 'tiktok', label: 'TikTok' },
                          { id: 'linkedin', label: 'LinkedIn' },
                          { id: 'x', label: 'X (Twitter)' },
                          { id: 'other', label: 'Other' },
                        ].map(p => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleDataChange('socialPlatform', p.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                              qrData.socialPlatform === p.id 
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="social-url" className="block text-xs font-bold text-slate-700">
                        Profile URL or Username <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        id="social-url"
                        value={qrData.socialUrl} 
                        onChange={e => handleDataChange('socialUrl', e.target.value)} 
                        className={`w-full px-4 py-3.5 bg-slate-50 rounded-2xl border text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition ${
                          isSocialInvalid 
                            ? 'border-amber-400 focus:border-amber-500 bg-amber-50/20' 
                            : 'border-slate-200 focus:border-indigo-500 focus:bg-white'
                        }`}
                        placeholder="e.g. rootixa or https://instagram.com/rootixa" 
                      />
                      {isSocialInvalid && (
                        <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Please enter a valid profile URL or handle.
                        </p>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Scan to open this social profile or page.
                    </p>
                  </div>
                )}

                {/* 12. App Download */}
                {activeTab === 'app' && (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="space-y-1.5">
                      <label htmlFor="app-android" className="block text-xs font-bold text-slate-700">
                        Google Play Store URL (Android)
                      </label>
                      <input 
                        id="app-android"
                        type="url"
                        value={qrData.appAndroidUrl} 
                        onChange={e => handleDataChange('appAndroidUrl', e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white" 
                        placeholder="https://play.google.com/store/apps/details?id=..." 
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="app-ios" className="block text-xs font-bold text-slate-700">
                        Apple App Store URL (iOS)
                      </label>
                      <input 
                        id="app-ios"
                        type="url"
                        value={qrData.appIosUrl} 
                        onChange={e => handleDataChange('appIosUrl', e.target.value)} 
                        className="w-full px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white" 
                        placeholder="https://apps.apple.com/app/..." 
                      />
                    </div>

                    {qrData.appAndroidUrl && qrData.appIosUrl && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Primary Target Store
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleDataChange('appTarget', 'android')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                              qrData.appTarget === 'android' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            Android Play Store
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDataChange('appTarget', 'ios')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer border ${
                              qrData.appTarget === 'ios' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            Apple App Store
                          </button>
                        </div>
                      </div>
                    )}

                    {isAppInvalid && (
                      <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> At least one valid app store URL is required.
                      </p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Scan to download the app directly from the official store.
                    </p>
                  </div>
                )}

              </div>

              {/* Real-time Content Capacity Warning Guard */}
              {capacityInfo.isLarge && (
                <div className="mt-5 rounded-2xl bg-amber-50/90 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-800 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Large Content Warning</p>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      Your content is large ({capacityInfo.length} characters) for this QR configuration. Try shortening the content or reducing error correction to ensure quick scanning on low-end cameras.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* STEP 2: CUSTOMIZE & DESIGN STUDIO CARD */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Step 2</span>
                  <h2 className="text-lg font-extrabold text-slate-900">Customize QR Design</h2>
                </div>
                <button
                  type="button"
                  onClick={handleResetDesign}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  title="Reset all visual styling properties to default black-and-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Design</span>
                </button>
              </div>

              {/* Customization Sub-Navigation */}
              <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1 text-xs font-semibold overflow-x-auto no-scrollbar">
                {[
                  { id: 'styles', label: 'Quick Styles', icon: Sparkles },
                  { id: 'pattern', label: 'Pattern & Eyes', icon: Grid },
                  { id: 'colors', label: 'Colors & Fill', icon: Palette },
                  { id: 'branding', label: 'Brand Logo', icon: ImagePlus },
                  { id: 'spacing', label: 'Margin & Safety', icon: Sliders },
                ].map(sub => {
                  const Icon = sub.icon;
                  const isCurrent = customizeTab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setCustomizeTab(sub.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                        isCurrent 
                          ? 'bg-white font-bold text-indigo-600 shadow-xs' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SUBSECTION 1: QUICK STYLES / PRESETS */}
              {customizeTab === 'styles' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Curated Style Presets
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Click any preset to immediately style your QR code. Your data content remains 100% untouched.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {Object.entries(DESIGN_PRESETS).map(([key, preset]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleApplyPreset(key)}
                        className="p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-indigo-500 text-left transition group cursor-pointer shadow-2xs hover:shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-600 transition">
                            {preset.name}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md">
                            Preset
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          {preset.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBSECTION 2: PATTERN & EYES */}
              {customizeTab === 'pattern' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Dot Style Selection */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      QR Dot Pattern
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {dotPatternOptions.map(opt => {
                        const isSelected = qrSettings.dotStyle === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSettingChange('dotStyle', opt.id)}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs' 
                                : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
                            }`}
                          >
                            <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                            <span className="text-[10px] text-slate-500 mt-1 leading-snug">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Corner Eye Frame Style Selection */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Outer Eye Frame Shape
                      </label>
                      <span className="text-[10px] text-slate-400">Position locator border</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {eyeFrameOptions.map(opt => {
                        const isSelected = qrSettings.eyeFrameStyle === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSettingChange('eyeFrameStyle', opt.id)}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs' 
                                : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
                            }`}
                          >
                            <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                            <span className="text-[10px] text-slate-500 mt-1 leading-snug">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inner Eye Dot / Ball Selection */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                        Inner Eye Ball Shape
                      </label>
                      <span className="text-[10px] text-slate-400">Center finder pupil</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {eyeDotOptions.map(opt => {
                        const isSelected = qrSettings.eyeDotStyle === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSettingChange('eyeDotStyle', opt.id)}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs' 
                                : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
                            }`}
                          >
                            <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                            <span className="text-[10px] text-slate-500 mt-1 leading-snug">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Eye Custom Colors Toggle & Pickers */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Custom Eye Colors</p>
                        <p className="text-[10px] text-slate-500">Color the finder pattern eyes independently from modules</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={qrSettings.customEyeColor} 
                          onChange={e => handleSettingChange('customEyeColor', e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {qrSettings.customEyeColor && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {/* Frame Color */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase">Eye Frame</span>
                            <input 
                              type="text" 
                              value={qrSettings.eyeFrameColor} 
                              maxLength={7}
                              onChange={e => handleSettingChange('eyeFrameColor', e.target.value.toUpperCase())}
                              className="bg-white px-2 py-1 border border-slate-200 rounded font-mono text-xs font-bold w-20 mt-1" 
                            />
                          </div>
                          <input 
                            type="color" 
                            value={isValidHex(qrSettings.eyeFrameColor) ? qrSettings.eyeFrameColor : '#000000'}
                            onChange={e => handleSettingChange('eyeFrameColor', e.target.value.toUpperCase())}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" 
                          />
                        </div>

                        {/* Ball / Pupil Color */}
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <span className="block text-[10px] font-bold text-slate-500 uppercase">Eye Ball</span>
                            <input 
                              type="text" 
                              value={qrSettings.eyeDotColor} 
                              maxLength={7}
                              onChange={e => handleSettingChange('eyeDotColor', e.target.value.toUpperCase())}
                              className="bg-white px-2 py-1 border border-slate-200 rounded font-mono text-xs font-bold w-20 mt-1" 
                            />
                          </div>
                          <input 
                            type="color" 
                            value={isValidHex(qrSettings.eyeDotColor) ? qrSettings.eyeDotColor : '#000000'}
                            onChange={e => handleSettingChange('eyeDotColor', e.target.value.toUpperCase())}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200" 
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBSECTION 3: COLORS & GRADIENT */}
              {customizeTab === 'colors' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Foreground Mode: Solid vs Gradient */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Foreground Fill Mode</p>
                        <p className="text-[10px] text-slate-500">Choose between a single solid color or smooth gradient</p>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleSettingChange('isGradient', false)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            !qrSettings.isGradient ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Solid
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSettingChange('isGradient', true)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            qrSettings.isGradient ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Gradient
                        </button>
                      </div>
                    </div>

                    {!qrSettings.isGradient ? (
                      /* Solid Color Selector */
                      <div className="p-4 border border-slate-200/90 rounded-2xl bg-slate-50/60 flex items-center justify-between gap-4">
                        <div>
                          <label htmlFor="fg-hex" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Foreground Color (Dots)
                          </label>
                          <input 
                            id="fg-hex"
                            type="text" 
                            value={qrSettings.fgColor} 
                            maxLength={7}
                            onChange={e => {
                              const val = e.target.value.toUpperCase();
                              handleSettingChange('fgColor', val.startsWith('#') ? val : `#${val}`);
                            }} 
                            className="bg-white px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-800 outline-none w-24" 
                          />
                        </div>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-xs border-2 border-white ring-1 ring-slate-200 shrink-0">
                          <input 
                            type="color" 
                            value={isValidHex(qrSettings.fgColor) ? qrSettings.fgColor : '#000000'} 
                            onChange={e => handleSettingChange('fgColor', e.target.value.toUpperCase())} 
                            className="absolute -top-3 -left-3 w-20 h-20 cursor-pointer" 
                            aria-label="Foreground color picker"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Gradient Controls */
                      <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/60 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Start Color */}
                          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 uppercase">Start Color</span>
                              <input 
                                type="text" 
                                value={qrSettings.gradientStart} 
                                maxLength={7}
                                onChange={e => handleSettingChange('gradientStart', e.target.value.toUpperCase())}
                                className="font-mono text-xs font-bold text-slate-800 outline-none w-20 mt-1" 
                              />
                            </div>
                            <input 
                              type="color" 
                              value={isValidHex(qrSettings.gradientStart) ? qrSettings.gradientStart : '#000000'}
                              onChange={e => handleSettingChange('gradientStart', e.target.value.toUpperCase())}
                              className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200" 
                            />
                          </div>

                          {/* End Color */}
                          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-500 uppercase">End Color</span>
                              <input 
                                type="text" 
                                value={qrSettings.gradientEnd} 
                                maxLength={7}
                                onChange={e => handleSettingChange('gradientEnd', e.target.value.toUpperCase())}
                                className="font-mono text-xs font-bold text-slate-800 outline-none w-20 mt-1" 
                              />
                            </div>
                            <input 
                              type="color" 
                              value={isValidHex(qrSettings.gradientEnd) ? qrSettings.gradientEnd : '#4F46E5'}
                              onChange={e => handleSettingChange('gradientEnd', e.target.value.toUpperCase())}
                              className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200" 
                            />
                          </div>
                        </div>

                        {/* Direction Pills */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
                            Gradient Direction
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                              { id: 'diagonal', label: 'Diagonal ↘' },
                              { id: 'horizontal', label: 'Horizontal →' },
                              { id: 'vertical', label: 'Vertical ↓' },
                              { id: 'radial', label: 'Radial ⊙' },
                            ].map(dir => (
                              <button
                                key={dir.id}
                                type="button"
                                onClick={() => handleSettingChange('gradientDirection', dir.id)}
                                className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                                  qrSettings.gradientDirection === dir.id 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {dir.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Mode: Solid vs Transparent */}
                  <div className="border-t border-slate-100 pt-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Background Surface</p>
                        <p className="text-[10px] text-slate-500">Solid color or transparent canvas</p>
                      </div>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => handleSettingChange('isTransparentBg', false)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            !qrSettings.isTransparentBg ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Solid
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSettingChange('isTransparentBg', true)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                            qrSettings.isTransparentBg ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                          }`}
                        >
                          Transparent
                        </button>
                      </div>
                    </div>

                    {!qrSettings.isTransparentBg ? (
                      <div className="p-4 border border-slate-200/90 rounded-2xl bg-slate-50/60 flex items-center justify-between gap-4">
                        <div>
                          <label htmlFor="bg-hex" className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                            Background Color
                          </label>
                          <input 
                            id="bg-hex"
                            type="text" 
                            value={qrSettings.bgColor} 
                            maxLength={7}
                            onChange={e => {
                              const val = e.target.value.toUpperCase();
                              handleSettingChange('bgColor', val.startsWith('#') ? val : `#${val}`);
                            }} 
                            className="bg-white px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-800 outline-none w-24" 
                          />
                        </div>
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-xs border-2 border-white ring-1 ring-slate-200 shrink-0">
                          <input 
                            type="color" 
                            value={isValidHex(qrSettings.bgColor) ? qrSettings.bgColor : '#FFFFFF'} 
                            onChange={e => handleSettingChange('bgColor', e.target.value.toUpperCase())} 
                            className="absolute -top-3 -left-3 w-20 h-20 cursor-pointer" 
                            aria-label="Background color picker"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Transparent Canvas Active</p>
                          <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                            Exported PNG and SVG will have no background fill. Note: JPG does not support transparency and will automatically use a clean white background upon export.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBSECTION 4: BRAND LOGO */}
              {customizeTab === 'branding' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="p-4 sm:p-5 border border-dashed border-slate-300 rounded-2xl bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                        {qrSettings.logo ? (
                          <Image src={qrSettings.logo} alt="Logo preview" width={36} height={36} className="object-contain max-w-full max-h-full rounded-md" unoptimized />
                        ) : (
                          <ImagePlus className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {qrSettings.logo ? (logoFileName || 'Custom Brand Logo') : 'Embed Brand Logo'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          PNG, JPG, or SVG. Auto-centered with quiet margin cutout.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {qrSettings.logo ? (
                        <button 
                          onClick={handleRemoveLogo} 
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      ) : (
                        <label className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl cursor-pointer transition shadow-xs">
                          <ImagePlus className="w-3.5 h-3.5" />
                          <span>Upload Logo</span>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {qrSettings.logo && (
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                      {/* Logo Size Selector & Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">Logo Scale Size</span>
                          <span className="font-mono text-indigo-600 font-bold">{Math.round(qrSettings.logoSize * 100)}%</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {[
                            { label: 'Small', size: 0.20 },
                            { label: 'Medium', size: 0.30 },
                            { label: 'Large', size: 0.38 },
                          ].map(s => (
                            <button
                              key={s.label}
                              type="button"
                              onClick={() => handleSettingChange('logoSize', s.size)}
                              className={`py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
                                Math.abs(qrSettings.logoSize - s.size) < 0.03
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {s.label} ({Math.round(s.size * 100)}%)
                            </button>
                          ))}
                        </div>
                        <input 
                          type="range" 
                          min="0.15" 
                          max="0.40" 
                          step="0.01" 
                          value={qrSettings.logoSize} 
                          onChange={e => handleSettingChange('logoSize', parseFloat(e.target.value))} 
                          className="w-full accent-indigo-600 cursor-pointer" 
                        />
                        <p className="text-[10px] text-slate-400">
                          Capped at 40% to guarantee QR readability. Error correction level is maintained at High.
                        </p>
                      </div>

                      {/* Logo Background Cutout Card */}
                      <div className="border-t border-slate-200/80 pt-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">Logo Background Cutout</p>
                          <p className="text-[10px] text-slate-500">Adds generous white clearance around the logo</p>
                        </div>
                        <div className="flex bg-slate-200/70 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleSettingChange('logoBg', 'none')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                              qrSettings.logoBg === 'none' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            Standard Cutout
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSettingChange('logoBg', 'white')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                              qrSettings.logoBg === 'white' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600'
                            }`}
                          >
                            Wide Margin
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-indigo-50/70 border border-indigo-100 p-3.5 flex items-start gap-2 text-xs text-indigo-800">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed">
                      <strong>Best Practice:</strong> Use square logos with transparent backgrounds. Error correction level is automatically recommended at High (30%) to preserve full scannability.
                    </p>
                  </div>
                </div>
              )}

              {/* SUBSECTION 5: SPACING, ERROR CORRECTION & SCAN SAFETY */}
              {customizeTab === 'spacing' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  {/* Quiet Zone Margin Adjustment */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-slate-800 uppercase tracking-wider">Quiet Zone / QR Margin</p>
                        <p className="text-[10px] text-slate-500">Surrounding clear border required for scanner orientation</p>
                      </div>
                      <span className="font-mono text-indigo-600 font-bold">{qrSettings.margin}px</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {[
                        { label: 'Compact', margin: 6 },
                        { label: 'Standard', margin: 12 },
                        { label: 'Generous', margin: 20 },
                      ].map(m => (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => handleSettingChange('margin', m.margin)}
                          className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                            qrSettings.margin === m.margin 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {m.label} ({m.margin}px)
                        </button>
                      ))}
                    </div>

                    <input 
                      type="range" 
                      min="4" 
                      max="28" 
                      step="2" 
                      value={qrSettings.margin} 
                      onChange={e => handleSettingChange('margin', parseInt(e.target.value))} 
                      className="w-full accent-indigo-600 cursor-pointer" 
                    />
                  </div>

                  {/* Error Correction Selection */}
                  <div className="space-y-2 border-t border-slate-100 pt-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Error Correction Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {errorCorrectionOptions.map(opt => {
                        const isSelected = qrSettings.errorCorrection === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSettingChange('errorCorrection', opt.id)}
                            className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs' 
                                : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/70'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                            </div>
                            <span className="text-[11px] text-slate-500 mt-1 leading-snug">{opt.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AD SPACE (Clean Non-Intrusive Bottom Banner) */}
            <AdSpace className="w-full h-20" text="Sponsored Workspace Partner" />

          </div>

          {/* ========================================================= */}
          {/* RIGHT PREVIEW & DOWNLOAD CARD (5 cols, sticky on desktop)  */}
          {/* ========================================================= */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              
              {/* CENTERPIECE PREVIEW CARD */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 flex flex-col items-center">
                
                {/* Live Preview & Scan Safety Indicator Header */}
                <div className="w-full flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span>Live Preview</span>
                  </div>

                  {/* Scan Safety Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    scanSafety.status === 'excellent' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : scanSafety.status === 'warning'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {scanSafety.status === 'excellent' && <ShieldCheck className="w-3.5 h-3.5" />}
                    {scanSafety.status === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                    {scanSafety.status === 'unsafe' && <X className="w-3.5 h-3.5" />}
                    <span>{scanSafety.label}</span>
                  </div>
                </div>

                {/* QR Canvas Centerpiece Surface */}
                <div 
                  className={`p-4 rounded-2xl mb-4 border border-slate-200/90 flex justify-center items-center transition-colors duration-300 shadow-sm max-w-full overflow-hidden ${
                    qrSettings.isTransparentBg ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-50' : ''
                  }`}
                  style={!qrSettings.isTransparentBg ? { backgroundColor: qrSettings.bgColor } : undefined}
                >
                  <div ref={qrRef} className="rounded-xl overflow-hidden [&>canvas]:max-w-full [&>canvas]:h-auto flex justify-center items-center" />
                </div>

                {/* Live Scan Safety Status Feedback Box */}
                <div className={`w-full p-3 rounded-2xl border text-xs mb-4 ${
                  scanSafety.status === 'excellent'
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : scanSafety.status === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider mb-0.5">
                    <span>Scan Safety Assessment</span>
                    <span>Contrast: {scanSafety.contrastRatio.toFixed(1)}:1</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {scanSafety.issues.length > 0 ? scanSafety.issues[0] : scanSafety.summary}
                  </p>
                </div>

                {/* Format & Quality Selectors */}
                <div className="w-full space-y-3.5">
                  {/* Format Selector Pills */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Export Format
                      </label>
                      {qrSettings.isTransparentBg && qrSettings.format === 'jpeg' && (
                        <span className="text-[10px] text-amber-600 font-bold">White BG used for JPG</span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl">
                      {[
                        { id: 'png', label: 'PNG' },
                        { id: 'jpeg', label: 'JPG' },
                        { id: 'webp', label: 'WEBP' },
                        { id: 'svg', label: 'SVG' }
                      ].map(fmt => (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => handleSettingChange('format', fmt.id)}
                          className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                            qrSettings.format === fmt.id 
                              ? 'bg-white text-indigo-600 shadow-2xs' 
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution Selector */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Resolution</p>
                      <p className="text-[10px] text-slate-500">Pixel dimension of downloaded raster file</p>
                    </div>
                    <select 
                      value={qrSettings.exportSize} 
                      onChange={e => handleSettingChange('exportSize', Number(e.target.value))} 
                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value={1024}>Standard · 1024px</option>
                      <option value={2048}>High · 2048px</option>
                      <option value={4096}>Maximum · 4096px</option>
                    </select>
                  </div>

                  {/* Optional WiFi Signage Button */}
                  {activeTab === 'wifi' && (
                    <button 
                      onClick={openWifiPosterPreview}
                      disabled={isPosterPreparing}
                      type="button"
                      className="w-full py-2.5 rounded-xl font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition flex justify-center items-center gap-2 text-xs disabled:cursor-wait disabled:opacity-70 cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" /> 
                      <span>{isPosterPreparing ? 'Preparing layout…' : 'Preview & Print WiFi Poster'}</span>
                    </button>
                  )}

                  {/* Primary Download Button */}
                  <button 
                    onClick={initiateDownload}
                    disabled={isExporting}
                    type="button"
                    className={`w-full py-4 rounded-2xl font-extrabold shadow-lg transition-all flex justify-center items-center gap-2.5 text-sm disabled:cursor-wait disabled:opacity-80 cursor-pointer ${
                      isDownloaded 
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25 hover:-translate-y-0.5'
                    }`}
                  >
                    {isDownloaded ? <CheckCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    <span>{isDownloaded ? 'Downloaded Successfully!' : isExporting ? 'Generating high-res file…' : 'Download QR Code'}</span>
                  </button>

                  {/* Download Limit & Status */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{qrSettings.format === 'svg' ? 'Vector SVG (infinite scale)' : `${qrSettings.exportSize} × ${qrSettings.exportSize}px`}</span>
                    <span className="font-semibold text-slate-600">
                      Downloads: {isSubscribed ? <span className="text-emerald-600 font-bold">Unlimited</span> : `${downloadCount}/2 free`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sidebar Support / Help Note */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 text-xs text-slate-500 space-y-1 shadow-2xs">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Professional Design Standards
                </p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Rootixa QR Studio renders vector SVGs and pixel-perfect rasters with standards-compliant module positioning and guaranteed corner finder visibility.
                </p>
              </div>

            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
