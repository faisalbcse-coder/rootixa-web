"use client";

import { useState } from "react";
import { TicketGenerator } from "@/components/airsky/ticket-generator";
import { BoardingPass } from "@/components/airsky/boarding-pass";
import { TicketActions } from "@/components/airsky/ticket-actions";
import { getTicketData } from "@/lib/airsky/pnr-database";
import {
  Plane,
  ShieldCheck,
  QrCode,
  Sparkles,
  ChevronRight,
  Globe2,
  CheckCircle2,
} from "lucide-react";

export default function AirSkyPage() {
  // Pre-load default state with MD Ariful Islam + AS7K2P
  const [currentTicket, setCurrentTicket] = useState(() =>
    getTicketData("AS7K2P", "MD Ariful Islam")
  );
  const [hasGenerated, setHasGenerated] = useState(true);

  const handleTicketGenerated = (ticket) => {
    setCurrentTicket(ticket);
    setHasGenerated(true);
  };

  const handleReset = () => {
    const el = document.getElementById("generator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="w-full flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-20">
      {/* Hero Banner */}
      <section className="airsky-no-print relative overflow-hidden border-b border-slate-800/80 bg-slate-950 py-12 sm:py-16 px-4">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 left-1/4 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center space-y-4 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AirSky Digital Flight Experience</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Premium Airline Boarding Pass{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">
              & Instant QR Verification
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Generate flight boarding passes with encrypted digital signatures and
            live scannable QR verification across 10 active global flight records.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>10 Predefined PNR Routes</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-sky-400" />
              <span>Real Scannable QR Codes</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Instant Status Validation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Step 1 & 2: Ticket Generator Form */}
        <section>
          <TicketGenerator
            onTicketGenerated={handleTicketGenerated}
            initialPNR="AS7K2P"
          />
        </section>

        {/* Step 3: Generated Ticket Result & Actions */}
        {currentTicket && (
          <section id="generated-ticket-section" className="pt-4 space-y-6">
            <div className="airsky-no-print text-center space-y-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active Boarding Pass Preview</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Official Boarding Pass — {currentTicket.pnr}
              </h3>
              <p className="text-xs text-slate-400">
                This boarding pass features a live QR code scannable with any mobile phone camera.
              </p>
            </div>

            {/* Boarding Pass Card */}
            <BoardingPass ticket={currentTicket} />

            {/* Action Bar (Print, Download, View Verification, Generate Another) */}
            <TicketActions ticket={currentTicket} onReset={handleReset} />
          </section>
        )}
      </div>
    </div>
  );
}
