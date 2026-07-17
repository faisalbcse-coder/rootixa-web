"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Link as LinkIcon, Type, Wifi, Mail, Download, Palette, CheckCircle, LayoutGrid, 
  ArrowLeft, ImagePlus, Trash2, X, Send, Sliders, ChevronDown, Settings, 
  Zap, FileImage, Grid, Printer
} from 'lucide-react';

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
    wifiSsid: '', wifiPassword: '', wifiEncryption: 'WPA', 
    email: '' 
  });

  const [qrSettings, setQrSettings] = useState({
    fgColor: '#4F46E5', bgColor: '#FFFFFF',
    logo: null, logoSize: 0.4, 
    format: 'png',
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
  
  const [openAccordion, setOpenAccordion] = useState('design'); 
  
  const qrRef = useRef(null);
  const qrCodeInstance = useRef(null);

  useEffect(() => {
    import('qr-code-styling').then(({ default: QRCodeStyling }) => {
      qrCodeInstance.current = new QRCodeStyling({
        width: 260, height: 260, margin: 10,
        imageOptions: { hideBackgroundDots: true, imageSize: qrSettings.logoSize, margin: 5 }
      });
      if (qrRef.current) {
        qrRef.current.innerHTML = ''; 
        qrCodeInstance.current.append(qrRef.current);
      }
      updateQRCode();
    });
    
    const savedCount = localStorage.getItem('qr_dl_count');
    if (savedCount) setDownloadCount(parseInt(savedCount));
    
    const subscribed = localStorage.getItem('qr_user_subscribed');
    if (subscribed === 'true') setIsSubscribed(true);
  }, []);

  const getFinalQRValue = () => {
    if (activeTab === 'wifi') return `WIFI:T:${qrData.wifiEncryption};S:${qrData.wifiSsid};P:${qrData.wifiPassword};;`;
    if (activeTab === 'email') return `mailto:${qrData.email}`;
    if (activeTab === 'text') return qrData.text || ' ';
    return qrData.url || 'https://rootixa.com';
  };

  const updateQRCode = () => {
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
  };

  useEffect(() => { updateQRCode(); }, [qrData, activeTab, qrSettings]);

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

  const executeDownload = (shouldIncrement = false) => {
    if (!qrCodeInstance.current) return;
    qrCodeInstance.current.download({ name: "Rootixa-Premium-QR", extension: qrSettings.format });
    
    if (shouldIncrement && !isSubscribed) {
      const newCount = downloadCount + 1;
      setDownloadCount(newCount);
      localStorage.setItem('qr_dl_count', newCount);
    }
    setShowModal(false);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  const handleEmailSubmit = () => {
    if (!userEmail || !userEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    localStorage.setItem('qr_user_subscribed', 'true');
    setIsSubscribed(true);
    executeDownload(false);
  };

  // === WiFi Print Poster Logic ===
  const handlePrintWifi = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    const qrDataUrl = canvas.toDataURL('image/png');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Free WiFi Sign</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff; text-align: center; color: #1f2937; }
            .container { border: 2px dashed #cbd5e1; padding: 40px; border-radius: 30px; max-width: 600px; margin: 20px; }
            h1 { font-size: 3.5rem; color: #4F46E5; margin: 0 0 10px 0; letter-spacing: -1px; }
            .subtitle { font-size: 1.5rem; color: #6b7280; margin-bottom: 40px; }
            .qr-box { padding: 20px; border: 4px solid #f1f5f9; border-radius: 24px; display: inline-block; margin-bottom: 40px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            img { width: 350px; height: 350px; }
            .network-info { background: #f8fafc; padding: 25px 40px; border-radius: 20px; font-size: 1.5rem; }
            .label { font-size: 1rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5px; font-weight: bold; }
            .value { font-weight: 800; font-size: 2rem; color: #0f172a; margin-bottom: 20px; }
            .value:last-child { margin-bottom: 0; }
            .footer { margin-top: 30px; font-size: 1rem; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Dear Valuable Customer</h1>
            <div class="subtitle">Enjoy our complimentary high-speed WiFi. Scan to connect instantly!</div>
            
            <div class="qr-box">
              <img src="${qrDataUrl}" />
            </div>
            
            <div class="network-info">
              <div class="label">Network Name</div>
              <div class="value">${qrData.wifiSsid || 'Guest WiFi'}</div>
              
              <div class="label">Password</div>
              <div class="value">${qrData.wifiPassword || 'None'}</div>
            </div>
            
            <div class="footer">Powered by Rootixa QR Generator</div>
          </div>
          <script>
            setTimeout(() => { window.print(); window.close(); }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-800 pb-20">
      
      {/* Lead Generation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4"><Zap className="w-8 h-8" /></div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Unlock Unlimited</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              You've reached your free download limit. Enter your email to unlock unlimited high-res downloads forever.
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
          <a href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600"><ArrowLeft className="w-4 h-4" /> Back to Home</a>
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
                  <div ref={qrRef} className="rounded-xl overflow-hidden" />
                </div>

                <div className="w-full">
                  {/* GLOBAL EXPORT SETTINGS */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl mb-4">
                     <span className="text-sm font-bold text-gray-600 flex items-center gap-1"><FileImage className="w-4 h-4"/> Format:</span>
                     <select value={qrSettings.format} onChange={e => handleSettingChange('format', e.target.value)} className="bg-transparent font-bold text-indigo-600 outline-none cursor-pointer">
                       <option value="png">PNG (High Res)</option>
                       <option value="jpeg">JPG</option>
                       <option value="webp">WEBP</option>
                       <option value="svg">SVG (Vector)</option>
                     </select>
                  </div>

                  {/* Print WiFi Sign Button */}
                  {activeTab === 'wifi' && (
                    <button 
                      onClick={handlePrintWifi}
                      className="w-full mb-3 py-3 rounded-xl font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all flex justify-center items-center gap-2"
                    >
                      <Printer className="w-4 h-4" /> Print Free WiFi Poster
                    </button>
                  )}

                  <button 
                    onClick={initiateDownload}
                    className={`w-full py-4 rounded-xl font-bold shadow-md transition-all flex justify-center items-center gap-2 ${
                      isDownloaded ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {isDownloaded ? <CheckCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                    {isDownloaded ? 'Saved Successfully!' : `Download QR Code`}
                  </button>
                  
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