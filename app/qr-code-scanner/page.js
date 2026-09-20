"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  ArrowLeft,
  Camera,
  ShieldCheck,
  Sparkles,
  QrCode,
  Barcode,
  CheckCircle2,
  FileImage,
  Smartphone,
  Lock,
  Zap,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { CodeScanner } from "@/components/scanner/code-scanner";

const FAQ_ITEMS = [
  {
    q: "Is it safe to scan QR codes and barcodes with Rootixa?",
    a: "Yes, 100%. All decoding happens locally in your browser using client-side WebAssembly and JavaScript. Your camera stream and uploaded images are never sent or stored on any remote server.",
  },
  {
    q: "Which barcode and QR formats are supported?",
    a: "We support all major industry standards: QR Code, EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF-14, Codabar, Data Matrix, Aztec, and PDF417.",
  },
  {
    q: "Can I scan a barcode or QR code from an image or screenshot?",
    a: "Yes! Simply switch to the 'Upload Image' tab, drag and drop any image (PNG, JPG, WEBP, GIF, SVG, BMP), or paste from your clipboard with Ctrl+V (or Cmd+V on Mac).",
  },
  {
    q: "Why does the camera request permission?",
    a: "Your browser requires explicit permission to access your webcam or mobile camera to capture video frames in real-time. You can revoke access at any time in your browser settings.",
  },
];

export default function QrCodeScannerPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Rootixa QR & Barcode Scanner",
    url: "https://rootixa.com/qr-code-scanner",
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free online QR code and barcode reader. Scan directly via camera or upload images with 100% private client-side decoding.",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://rootixa.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "All Tools",
        item: "https://rootixa.com/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "QR & Barcode Scanner",
        item: "https://rootixa.com/qr-code-scanner",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/70 to-slate-100 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* TOP APPLICATION BAR */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">All Tools</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                Rootixa
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                Scanner
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/qr-code"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all shadow-2xs cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Open Generator</span>
            </Link>
          </div>
        </div>
      </header>

      {/* PAGE HERO HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200/70 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold mb-2 shadow-2xs">
              <Camera className="w-3.5 h-3.5" />
              <span>Real-Time Camera & File Decoder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
              QR Code & Barcode Scanner
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              Instant, secure detection for QR codes and retail barcodes. Scan with your device camera or upload image files with 100% private, client-side processing.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>100% Private (No Uploads)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>12+ Code Formats</span>
            </span>
          </div>
        </div>
      </div>

      {/* MAIN SCANNER WORKSPACE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <CodeScanner />

        {/* PROMO CROSS-BANNER: CREATE CODES */}
        <div className="mt-12 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-indigo-800/50">
          <div className="space-y-1 text-center md:text-left">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              Need to Create Codes?
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Professional QR & Barcode Generator
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/80 max-w-xl">
              Design branded QR codes with custom logos, dot shapes, and colors, or produce GS1-compliant retail barcodes with vector PDF & SVG export.
            </p>
          </div>
          <Link
            href="/qr-code"
            className="px-6 py-3 bg-white hover:bg-slate-100 text-indigo-950 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-lg hover:shadow-xl shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Open Generator Studio</span>
          </Link>
        </div>

        {/* FEATURES & SPECS GRID */}
        <section className="mt-16 space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              High-Precision Scanning Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Engineered for speed, security, and broad format compatibility across desktops, tablets, and smartphones.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Live Camera Viewfinder
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seamless real-time video stream processing with automatic camera selection, environment camera toggle, and responsive viewfinder framing.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                <FileImage className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Image Upload & Clipboard Paste
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Drag and drop screenshots, photos, and files or simply paste images directly using Ctrl+V from anywhere on your clipboard.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                Zero Cloud Uploads
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                All decoding logic executes right inside your browser memory. Your camera video, photos, and scanned payloads are completely private.
              </p>
            </div>
          </div>
        </section>

        {/* SUPPORTED FORMATS PILLS */}
        <section className="mt-14 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
            Supported 1D & 2D Symbologies
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {[
              "QR Code",
              "EAN-13",
              "EAN-8",
              "UPC-A",
              "UPC-E",
              "Code 128",
              "Code 39",
              "ITF-14",
              "Codabar",
              "Data Matrix",
              "Aztec",
              "PDF417",
            ].map((fmt) => (
              <span
                key={fmt}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>{fmt}</span>
              </span>
            ))}
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="mt-14 space-y-4 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
