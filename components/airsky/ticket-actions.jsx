"use client";

import { useState } from "react";
import Link from "next/link";
import { Printer, Download, ShieldCheck, RefreshCw, CheckCircle2, Loader2 } from "lucide-react";

export function TicketActions({ ticket, onReset, targetElementId = "airsky-boarding-pass" }) {
  const [downloading, setDownloading] = useState(false);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownload = async () => {
    if (typeof window === "undefined" || !ticket) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById(targetElementId);
      if (!element) {
        throw new Error("Boarding pass element not found");
      }

      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#070d1e",
      });

      const imageUri = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `AirSky_BoardingPass_${ticket.pnr}_${ticket.passengerName.replace(/\s+/g, "_")}.png`;
      link.href = imageUri;
      link.click();
    } catch (err) {
      console.error("Failed to generate ticket image:", err);
      // Fallback: prompt print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="airsky-no-print w-full max-w-4xl mx-auto mt-6 space-y-4">
      {/* Success Confirmation Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-emerald-300">
              Ticket Generated Successfully
            </h4>
            <p className="text-xs text-emerald-400/80">
              Boarding pass is authenticated for PNR{" "}
              <strong className="font-mono text-emerald-200">{ticket.pnr}</strong>.
            </p>
          </div>
        </div>

        <Link
          href={`/airsky/verify/${ticket.pnr}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-colors"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verify Live</span>
        </Link>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Print Ticket */}
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow-md transition-all hover:scale-[1.02]"
        >
          <Printer className="w-4 h-4 text-sky-400" />
          <span>Print Ticket</span>
        </button>

        {/* Download Ticket */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 shadow-md transition-all hover:scale-[1.02] disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
              <span>Rendering...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-sky-400" />
              <span>Download Ticket</span>
            </>
          )}
        </button>

        {/* View Verification */}
        <Link
          href={`/airsky/verify/${ticket.pnr}`}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all hover:scale-[1.02]"
        >
          <ShieldCheck className="w-4 h-4 text-white" />
          <span>View Verification</span>
        </Link>

        {/* Generate Another */}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-800 transition-all"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Generate Another</span>
        </button>
      </div>
    </div>
  );
}
