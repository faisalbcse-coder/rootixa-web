"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getTicketData,
  isValidPNR,
  getSavedPassengerName,
} from "@/lib/airsky/pnr-database";
import {
  ShieldCheck,
  ShieldAlert,
  Plane,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Ticket,
  ArrowRight,
  Lock,
  Search,
  ExternalLink,
} from "lucide-react";

export function VerificationCard({ pnr }) {
  const [animStage, setAnimStage] = useState(0); // 0: verifying, 1: checking, 2: complete
  const [ticket, setTicket] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [verificationTime, setVerificationTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );
  const [manualInput, setManualInput] = useState("");

  const cleanPNR = (pnr || "").trim().toUpperCase();

  useEffect(() => {
    // Step 1 animation: Verifying PNR... (350ms)
    const timer1 = setTimeout(() => {
      setAnimStage(1);
    }, 350);

    // Step 2 animation: Checking ticket... (350ms)
    const timer2 = setTimeout(() => {
      setAnimStage(2);
      const valid = isValidPNR(cleanPNR);
      setIsValid(valid);

      if (valid) {
        // Resolve saved customized passenger or fallback to default
        const savedName = getSavedPassengerName(cleanPNR);
        const data = getTicketData(cleanPNR, savedName);
        setTicket(data);
      }
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [cleanPNR]);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 sm:py-12">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link
          href="/airsky"
          className="inline-flex items-center gap-2.5 group transition-transform hover:scale-105 mb-2"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Plane className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <span className="text-2xl font-black tracking-widest text-white">
            AIRSKY
          </span>
        </Link>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
          <Lock className="w-3.5 h-3.5 text-sky-400" />
          <span>Official Ticket Verification System</span>
        </div>
      </div>

      {/* Main Verification Container */}
      <div className="bg-slate-900/95 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-sky-950/40 relative overflow-hidden">
        {/* Verification Animation Stages */}
        {animStage < 2 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-400 animate-spin animate-reverse" />
              <div className="absolute inset-0 flex items-center justify-center text-sky-400">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white transition-all">
                {animStage === 0 ? "Verifying PNR..." : "Checking ticket..."}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Querying AirSky Flight Registry for:{" "}
                <span className="text-sky-300 font-bold">{cleanPNR || "N/A"}</span>
              </p>
            </div>
          </div>
        ) : isValid && ticket ? (
          /* ================= VALID STATE ================= */
          <div className="space-y-6 animate-fadeIn">
            {/* Valid Badge */}
            <div className="text-center pb-5 border-b border-slate-800">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounceOnce">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span className="text-emerald-400">✓</span> VALID
              </h1>
              <p className="text-xs font-semibold text-emerald-400 mt-1 uppercase tracking-wider">
                Ticket Verified Successfully
              </p>
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                Verified at: {verificationTime}
              </span>
            </div>

            {/* Passenger & Flight Overview */}
            <div className="space-y-3.5">
              {/* Passenger Name */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
                  PASSENGER
                </span>
                <span className="text-xl font-extrabold text-white tracking-wide block uppercase font-sans">
                  {ticket.passengerName}
                </span>
              </div>

              {/* PNR & Flight Number */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
                    PNR
                  </span>
                  <span className="font-mono text-lg font-black text-sky-400">
                    {ticket.pnr}
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
                    FLIGHT
                  </span>
                  <span className="font-mono text-lg font-black text-white">
                    {ticket.flightNumber}
                  </span>
                </div>
              </div>

              {/* Route */}
              <div className="bg-gradient-to-r from-sky-950/40 via-slate-900 to-blue-950/40 p-4 rounded-2xl border border-sky-800/40">
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 block mb-1">
                  ROUTE
                </span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black font-mono text-white block">
                      {ticket.originCode}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {ticket.originCity}
                    </span>
                  </div>

                  <div className="flex flex-col items-center px-4">
                    <Plane className="w-5 h-5 text-sky-400" />
                    <span className="text-[10px] text-slate-400 uppercase font-mono mt-0.5">
                      Direct
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-white block">
                      {ticket.destinationCode}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {ticket.destinationCity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Flight Details Matrix */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    SEAT
                  </span>
                  <span className="font-mono text-base font-extrabold text-white">
                    {ticket.seat}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    CLASS
                  </span>
                  <span className="text-xs font-bold text-sky-300 uppercase">
                    {ticket.bookingClass}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    GATE
                  </span>
                  <span className="font-mono text-base font-extrabold text-amber-300">
                    {ticket.gate}
                  </span>
                </div>
              </div>

              {/* Departure & Boarding Times */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span className="text-slate-300 font-medium">
                    {ticket.departureDate} at {ticket.departureTime}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase">Boarding:</span>
                  <span className="font-mono font-bold text-white">
                    {ticket.boardingTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Security Stamp */}
            <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center justify-between font-mono">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Status: VALID & ACTIVE</span>
              </div>
              <span className="text-[10px] text-emerald-400/70">
                {ticket.securityToken || `SEC-${cleanPNR}`}
              </span>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-2">
              <Link
                href={`/airsky/ticket/${cleanPNR}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.02]"
              >
                <Ticket className="w-4 h-4" />
                <span>View Full Boarding Pass</span>
              </Link>

              <Link
                href="/airsky"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all border border-slate-700"
              >
                <span>Back to AirSky Portal</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ================= INVALID STATE ================= */
          <div className="space-y-6 text-center animate-fadeIn">
            {/* Cross Icon Badge */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <XCircle className="w-10 h-10 stroke-[2.5]" />
            </div>

            {/* Failure Titles */}
            <div className="space-y-1">
              <div className="text-3xl font-black text-rose-400 tracking-tight">
                ✕ INVALID
              </div>
              <h2 className="text-xl font-black text-white tracking-wide">
                PNR NOT FOUND
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-2">
                This ticket could not be verified. The booking reference provided does
                not exist in the AirSky reservation database or has been invalidated.
              </p>
            </div>

            {/* Queried Code Display */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 inline-block font-mono text-xs text-slate-400">
              Searched Reference:{" "}
              <strong className="text-rose-400 font-bold tracking-wider">
                {cleanPNR || "EMPTY"}
              </strong>
            </div>

            {/* Quick Test Another PNR */}
            <div className="pt-4 border-t border-slate-800/80 text-left space-y-3">
              <label
                htmlFor="verify-another-pnr"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Try Valid PNR:
              </label>
              <div className="flex gap-2">
                <input
                  id="verify-another-pnr"
                  type="text"
                  placeholder="e.g. AS7K2P"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
                <Link
                  href={manualInput.trim() ? `/airsky/verify/${manualInput.trim()}` : "#"}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </Link>
              </div>

              {/* Sample valid PNR chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400">Available:</span>
                {["AS7K2P", "AS9M4Q", "AS3X8L"].map((code) => (
                  <Link
                    key={code}
                    href={`/airsky/verify/${code}`}
                    className="text-[11px] font-mono font-bold text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20"
                  >
                    {code}
                  </Link>
                ))}
              </div>
            </div>

            {/* Return Button */}
            <div className="pt-2">
              <Link
                href="/airsky"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-all border border-slate-700"
              >
                <span>Return to AirSky Portal</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Security Footer Note */}
      <div className="mt-6 text-center text-[11px] text-slate-400">
        <p>AirSky Global Reservation Verification Protocol &bull; 256-bit Encrypted</p>
      </div>
    </div>
  );
}
