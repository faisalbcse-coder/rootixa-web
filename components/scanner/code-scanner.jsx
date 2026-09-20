"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Lock,
  Unlock,
  QrCode,
  Barcode,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  UserCheck,
  MapPin,
  Calendar,
  Share2,
  Smartphone,
  Eye,
  X,
  FileImage,
  Info,
} from "lucide-react";
import {
  normalizeBarcodeFormat,
  detectContentType,
  inspectUrlSafety,
} from "@/lib/scanner/decoder";

export function CodeScanner() {
  // Scanner Mode: 'camera' | 'upload'
  const [scanMethod, setScanMethod] = useState("camera");

  // Camera Management States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraList, setCameraList] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);

  // File Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Scan Result State
  const [scanResult, setScanResult] = useState(null); // { text, format, contentType, urlSafety, timestamp }
  const [copiedText, setCopiedText] = useState(false);

  // Instance Reference for Html5Qrcode
  const html5QrCodeRef = useRef(null);
  const readerElementId = "rootixa-qr-barcode-reader";
  const fileReaderElementId = "rootixa-file-hidden-reader";

  // Stop Camera cleanly and release hardware tracks
  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Error while stopping camera:", err);
      }
    }
    setIsCameraActive(false);
    setIsInitializingCamera(false);
  }, []);

  // Process a successful detection from camera or file
  const handleScanSuccess = useCallback((decodedText, decodedResult) => {
    const rawFormat = decodedResult?.result?.format?.formatName || decodedResult?.result?.format || "QR_CODE";
    const normalizedFormat = normalizeBarcodeFormat(rawFormat, decodedText);
    const contentType = detectContentType(decodedText, normalizedFormat);
    const urlSafety = inspectUrlSafety(decodedText);

    // Stop active camera scan immediately once detected
    stopCamera();

    setScanResult({
      rawText: decodedText,
      format: normalizedFormat,
      contentType,
      urlSafety,
      timestamp: new Date().toLocaleTimeString(),
    });
  }, [stopCamera]);

  // Start Camera Stream
  const startCamera = useCallback(async (cameraIdToUse) => {
    setCameraError("");
    setIsInitializingCamera(true);

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

      // Stop previous instance if running
      if (html5QrCodeRef.current?.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.AZTEC,
        Html5QrcodeSupportedFormats.PDF_417,
      ];

      const html5Qr = new Html5Qrcode(readerElementId, {
        formatsToSupport,
        verbose: false,
      });
      html5QrCodeRef.current = html5Qr;

      // Query available video devices
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameraList(devices);
        }
      } catch {}

      const cameraConfig = cameraIdToUse || { facingMode: "environment" };

      await html5Qr.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.max(200, Math.floor(minEdge * 0.75));
            return { width: edgeSize, height: edgeSize };
          },
          aspectRatio: 1.0,
        },
        (text, result) => {
          handleScanSuccess(text, result);
        },
        () => {
          // Frame error (silently ignore non-detections during video streaming)
        }
      );

      setIsCameraActive(true);
    } catch (err) {
      console.warn("Camera startup error:", err);
      const msg = String(err).toLowerCase();
      if (msg.includes("permission") || msg.includes("notallowederror")) {
        setCameraError("Camera permission was denied. Please allow camera access in your browser or use the Image Upload option.");
      } else if (msg.includes("notfound") || msg.includes("devicesnotfound")) {
        setCameraError("No camera found on this device. Please upload an image instead.");
      } else {
        setCameraError("Unable to start camera. Camera may be in use by another app, or permissions are restricted.");
      }
      setIsCameraActive(false);
    } finally {
      setIsInitializingCamera(false);
    }
  }, [handleScanSuccess]);

  // Process File with Html5Qrcode
  const processImageFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setUploadError("Please provide a valid image file (PNG, JPG, WEBP, GIF, SVG, BMP).");
      return;
    }

    setUploadError("");
    setIsProcessingFile(true);
    setUploadedFileName(file.name);

    // Create thumbnail preview
    const reader = new FileReader();
    reader.onload = (e) => setUploadedImagePreview(e.target?.result);
    reader.readAsDataURL(file);

    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");

      const formatsToSupport = [
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
        Html5QrcodeSupportedFormats.ITF,
        Html5QrcodeSupportedFormats.CODABAR,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.AZTEC,
        Html5QrcodeSupportedFormats.PDF_417,
      ];

      const html5Qr = new Html5Qrcode(fileReaderElementId, {
        formatsToSupport,
        verbose: false,
      });

      const decodedText = await html5Qr.scanFile(file, false);
      html5Qr.clear();

      if (decodedText) {
        handleScanSuccess(decodedText, { result: { format: "QR_CODE" } });
      } else {
        setUploadError("No QR code or barcode could be detected in this image.");
      }
    } catch (err) {
      console.warn("File scanning failure:", err);
      setUploadError("No QR code or barcode detected. Try uploading a clearer image with higher contrast or lighting.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Clipboard Paste Handler (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (scanResult) return;
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image/")) {
            const file = items[i].getAsFile();
            if (file) {
              setScanMethod("upload");
              processImageFile(file);
              break;
            }
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [scanResult]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Stop camera if user switches to upload tab
  useEffect(() => {
    if (scanMethod === "upload" && isCameraActive) {
      stopCamera();
    }
  }, [scanMethod, isCameraActive, stopCamera]);

  // Reset Scanner State for another scan
  const handleScanAgain = () => {
    setScanResult(null);
    setUploadedImagePreview(null);
    setUploadedFileName("");
    setUploadError("");
    setCameraError("");
    if (scanMethod === "camera") {
      startCamera(selectedCameraId);
    }
  };

  // Copy Result to Clipboard
  const handleCopyResult = async () => {
    if (!scanResult?.rawText) return;
    const ok = await copyToClipboard(scanResult.rawText);
    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden element required by Html5Qrcode for file processing */}
      <div id={fileReaderElementId} className="hidden" aria-hidden="true" />

      {/* HEADER CARD: SCANNER TITLE & TABS */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              Phase B
            </span>
            <span className="text-xs font-semibold text-slate-500">
              100% Client-Side Detection
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            QR & Barcode Scanner
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Scan QR codes and retail/logistics barcodes in real-time using your device camera or by uploading an image.
          </p>
        </div>

        {/* Scanner Method Switcher: Camera vs Upload */}
        {!scanResult && (
          <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 self-start sm:self-auto shrink-0 shadow-inner">
            <button
              type="button"
              onClick={() => setScanMethod("camera")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                scanMethod === "camera"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>
            <button
              type="button"
              onClick={() => setScanMethod("upload")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                scanMethod === "upload"
                  ? "bg-white text-indigo-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
          </div>
        )}
      </div>

      {/* MAIN WORKSPACE: SCANNER OR RESULT VIEW */}
      {!scanResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* PRIMARY SCANNING VIEWPORT (8 cols on desktop) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200/80 space-y-5">
            
            {scanMethod === "camera" ? (
              /* CAMERA SCANNER */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Live Camera View
                    </h3>
                    <p className="text-xs text-slate-500">
                      Position a QR code or barcode inside the scanning frame.
                    </p>
                  </div>

                  {/* Camera Controls & Device Selector */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {cameraList.length > 1 && (
                      <select
                        value={selectedCameraId}
                        onChange={(e) => {
                          setSelectedCameraId(e.target.value);
                          if (isCameraActive) {
                            startCamera(e.target.value);
                          }
                        }}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                      >
                        {cameraList.map((cam) => (
                          <option key={cam.id} value={cam.id}>
                            {cam.label || `Camera ${cam.id.slice(0, 5)}`}
                          </option>
                        ))}
                      </select>
                    )}

                    {isCameraActive ? (
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>Stop Camera</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startCamera(selectedCameraId)}
                        disabled={isInitializingCamera}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-60"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isInitializingCamera ? "Requesting Camera…" : "Start Camera"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Camera Error Message */}
                {cameraError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Camera Access Error</p>
                      <p className="mt-0.5 text-rose-700 leading-relaxed">{cameraError}</p>
                      <button
                        type="button"
                        onClick={() => setScanMethod("upload")}
                        className="mt-2 inline-flex items-center text-xs font-bold text-rose-800 hover:underline cursor-pointer"
                      >
                        Switch to Image Upload Scanner →
                      </button>
                    </div>
                  </div>
                )}

                {/* Live Camera Viewport Container */}
                <div className="relative rounded-3xl overflow-hidden bg-slate-950 aspect-square sm:aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
                  {/* Html5Qrcode video render target */}
                  <div
                    id={readerElementId}
                    className="w-full h-full object-cover [&>video]:w-full [&>video]:h-full [&>video]:object-cover"
                  />

                  {/* Reticle / Viewfinder Frame Overlay (shown when active) */}
                  {isCameraActive && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="relative w-64 h-64 border-2 border-dashed border-indigo-400/70 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] flex items-center justify-center">
                        {/* Corner Reticles */}
                        <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-xl" />
                        <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-xl" />
                        <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-xl" />
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-xl" />

                        {/* Animated Laser Scanning Line */}
                        <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_rgb(52,211,153)] animate-pulse" />
                      </div>
                    </div>
                  )}

                  {/* Placeholder overlay when camera is not running */}
                  {!isCameraActive && !cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-900/90 text-white space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-indigo-400 shadow-inner">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base">Camera is Stopped</h4>
                        <p className="text-xs text-slate-400 max-w-sm mt-1">
                          Click "Start Camera" to scan codes with your webcam or mobile camera.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startCamera(selectedCameraId)}
                        disabled={isInitializingCamera}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>{isInitializingCamera ? "Opening Camera…" : "Start Camera"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* IMAGE UPLOAD & DROPZONE SCANNER */
              <div className="space-y-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Upload Code Image
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select an image, drag & drop a file, or paste a screenshot with <kbd className="font-mono bg-slate-100 px-1 py-0.5 rounded border border-slate-200">Ctrl+V</kbd>.
                  </p>
                </div>

                {/* Dropzone Container */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 transition-all flex flex-col items-center justify-center text-center group cursor-pointer ${
                    isDragging
                      ? "border-indigo-600 bg-indigo-50/50 scale-[0.99]"
                      : "border-slate-300 bg-slate-50/60 hover:bg-slate-100/70 hover:border-indigo-400"
                  }`}
                  onClick={() => document.getElementById("barcode-file-picker")?.click()}
                >
                  <input
                    id="barcode-file-picker"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 mb-3 shadow-xs group-hover:scale-105 transition-transform">
                    {isProcessingFile ? (
                      <RefreshCw className="w-7 h-7 animate-spin text-indigo-600" />
                    ) : (
                      <Upload className="w-7 h-7" />
                    )}
                  </div>

                  <p className="font-extrabold text-sm text-slate-800">
                    {isProcessingFile ? "Scanning image locally…" : "Click to select or drop image here"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports PNG, JPG, WEBP, GIF, SVG, BMP (Processed 100% locally)
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs">
                    <Copy className="w-3.5 h-3.5" />
                    <span>Tip: You can also paste directly using Ctrl+V</span>
                  </div>
                </div>

                {/* Image Upload Error Alert */}
                {uploadError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Detection Unsuccessful</p>
                      <p className="mt-0.5 text-rose-700 leading-relaxed">{uploadError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PRIVACY & SECURITY STATEMENT */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-900 font-bold">Private Scanning:</strong> QR codes and barcodes are decoded 100% locally on your device. Rootixa does not store, transmit, or record your scanned images or decoded text.
              </p>
            </div>
          </div>

          {/* SIDEBAR: SUPPORTED FORMATS & TIPS (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Supported Standards
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
                    2D Matrix Codes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["QR Code", "Data Matrix", "Aztec", "PDF417"].map((f) => (
                      <span key={f} className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg font-bold text-indigo-700 text-[11px]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1.5">
                    1D Linear Barcodes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["EAN-13", "EAN-8", "UPC-A", "UPC-E", "Code 128", "Code 39", "ITF-14", "Codabar", "GS1-128"].map((f) => (
                      <span key={f} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 text-[11px]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500 space-y-2">
                <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                  Scanning Tips
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                  <li>Hold code steady and center it inside the frame.</li>
                  <li>Ensure adequate lighting without harsh screen glare.</li>
                  <li>For small barcodes, move closer to fill the viewfinder.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* RESULT VIEW PANEL */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/80 space-y-6 max-w-4xl mx-auto">
          
          {/* Header Banner: Code Detected */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                  Success
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  Code Detected
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-700">
                {scanResult.format}
              </span>
              <span className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                {scanResult.contentType.label}
              </span>
            </div>
          </div>

          {/* Raw Decoded Content Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Decoded Content (Raw Value)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                {scanResult.rawText.length} character{scanResult.rawText.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="relative">
              <textarea
                readOnly
                rows={Math.min(8, Math.max(3, Math.ceil(scanResult.rawText.length / 60)))}
                value={scanResult.rawText}
                className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900 select-all outline-none resize-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* URL SAFETY INSPECTION (IF PAYLOAD IS A URL) */}
          {scanResult.contentType.isUrl && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {scanResult.urlSafety.isHttps ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <Lock className="w-3.5 h-3.5" />
                      <span>HTTPS Encrypted</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>HTTP Unencrypted</span>
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-500 truncate max-w-xs">
                    Destination: <strong className="text-slate-800">{scanResult.urlSafety.hostname}</strong>
                  </span>
                </div>

                <a
                  href={scanResult.urlSafety.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Safety Notice: Links open in a new tab. Never open unverified links from unknown sources.
              </p>
            </div>
          )}

          {/* PARSED WI-FI CREDENTIALS CARD */}
          {scanResult.contentType.type === "wifi" && scanResult.contentType.details && (
            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <Wifi className="w-4 h-4 text-indigo-600" />
                <span>Wi-Fi Network Configuration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-700">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Network SSID</span>
                  <span className="font-mono font-bold text-slate-900">{scanResult.contentType.details.ssid || "(Hidden)"}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Security</span>
                  <span className="font-mono font-bold text-slate-900">{scanResult.contentType.details.encryption}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-[10px] uppercase text-slate-400 font-bold block">Password</span>
                  <span className="font-mono font-bold text-slate-900">{scanResult.contentType.details.password || "(None)"}</span>
                </div>
              </div>
            </div>
          )}

          {/* PARSED VCARD CONTACT CARD */}
          {scanResult.contentType.type === "vcard" && scanResult.contentType.details && (
            <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-900">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                <span>Contact Card (vCard)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700">
                {scanResult.contentType.details.name && (
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Full Name</span>
                    <span className="font-bold text-slate-900">{scanResult.contentType.details.name}</span>
                  </div>
                )}
                {scanResult.contentType.details.organization && (
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Organization</span>
                    <span className="font-bold text-slate-900">{scanResult.contentType.details.organization}</span>
                  </div>
                )}
                {scanResult.contentType.details.phone && (
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Phone</span>
                    <a href={`tel:${scanResult.contentType.details.phone}`} className="font-mono font-bold text-indigo-600 hover:underline">
                      {scanResult.contentType.details.phone}
                    </a>
                  </div>
                )}
                {scanResult.contentType.details.email && (
                  <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block">Email</span>
                    <a href={`mailto:${scanResult.contentType.details.email}`} className="font-mono font-bold text-indigo-600 hover:underline">
                      {scanResult.contentType.details.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS: COPY RESULT & SCAN AGAIN */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleCopyResult}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                copiedText
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800"
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Result Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Result</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleScanAgain}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Scan Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
