"use client";

import { useEffect, useState, useId } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Plane, ShieldCheck, Luggage, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export function BoardingPass({ ticket, id = "airsky-boarding-pass" }) {
  const [originUrl, setOriginUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );

  if (!ticket) return null;

  // Real verification URL encoded into the QR code
  const verificationUrl = originUrl
    ? `${originUrl}/airsky/verify/${ticket.pnr}`
    : `https://rootixa.com/airsky/verify/${ticket.pnr}`;

  return (
    <div
      id={id}
      className="airsky-boarding-pass w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 transition-all duration-300 relative"
      style={{
        background: "linear-gradient(135deg, #0b1329 0%, #0d1b38 50%, #081126 100%)",
      }}
    >
      {/* Decorative top airline accent bar */}
      <div className="h-2.5 w-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

      {/* Main Ticket Body: Split into Main Pass (left) and Boarding Stub (right) */}
      <div className="flex flex-col lg:flex-row relative">
        {/* ================= LEFT / MAIN PASS ================= */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10 space-y-6">
          {/* Header Row: Airline + Boarding Pass Label + Flight Status */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-500/20 ring-1 ring-white/20">
                <Plane className="w-5 h-5 text-white transform -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-widest text-xl text-white">
                    {ticket.airline || "AIRSKY"}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    Official Pass
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono tracking-wider">
                  INTERNATIONAL AIR TRANSPORT PASS
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="font-black tracking-widest text-xs uppercase text-sky-400">
                BOARDING PASS
              </span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{ticket.status || "VALID"}</span>
              </div>
            </div>
          </div>

          {/* Route Display: DAC → RUH with flight graphic */}
          <div className="bg-slate-950/60 rounded-2xl p-5 border border-slate-800/80">
            <div className="grid grid-cols-3 items-center text-center">
              {/* Origin */}
              <div className="text-left">
                <span className="block text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
                  {ticket.originCode}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-300 block">
                  {ticket.originCity}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {ticket.originTerminal || "Terminal 2"}
                </span>
              </div>

              {/* Flight Path Visualization */}
              <div className="flex flex-col items-center justify-center px-2">
                <span className="text-xs font-mono font-bold text-sky-400 tracking-wider mb-1">
                  {ticket.flightNumber}
                </span>
                <div className="w-full flex items-center gap-1 relative">
                  <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                  <div className="flex-1 h-[2px] bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 relative">
                    <Plane className="w-4 h-4 text-sky-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 uppercase font-medium">
                  Non-Stop
                </span>
              </div>

              {/* Destination */}
              <div className="text-right">
                <span className="block text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-mono">
                  {ticket.destinationCode}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-300 block">
                  {ticket.destinationCity}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  {ticket.destinationTerminal || "Terminal 1"}
                </span>
              </div>
            </div>
          </div>

          {/* Passenger & Flight Details Grid */}
          <div className="space-y-4">
            {/* Passenger Name Banner */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-0.5">
                PASSENGER NAME
              </span>
              <span className="text-lg sm:text-xl font-bold text-white tracking-wide uppercase font-sans">
                {ticket.passengerName}
              </span>
            </div>

            {/* Flight Metrics Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  PNR
                </span>
                <span className="font-mono text-base font-extrabold text-sky-400">
                  {ticket.pnr}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  DATE
                </span>
                <span className="text-sm font-bold text-slate-100">
                  {ticket.departureDate}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  SEAT
                </span>
                <span className="font-mono text-base font-extrabold text-white">
                  {ticket.seat}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  CLASS
                </span>
                <span className="text-sm font-bold text-sky-300 uppercase">
                  {ticket.bookingClass}
                </span>
              </div>
            </div>

            {/* Boarding, Gate, Time Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-sky-950/40 to-blue-950/40 p-3 rounded-xl border border-sky-600/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                  BOARDING TIME
                </span>
                <span className="font-mono text-lg font-black text-white">
                  {ticket.boardingTime}
                </span>
              </div>

              <div className="bg-gradient-to-br from-sky-950/40 to-blue-950/40 p-3 rounded-xl border border-sky-600/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 block">
                  GATE
                </span>
                <span className="font-mono text-lg font-black text-amber-300">
                  {ticket.gate}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  DEPARTURE
                </span>
                <span className="font-mono text-sm font-bold text-slate-200">
                  {ticket.departureTime}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  BAGGAGE
                </span>
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  <Luggage className="w-3.5 h-3.5 text-slate-400" />
                  {ticket.baggage || "2 x 23kg"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Notice */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>Gate closes 20 minutes prior to departure</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              AIRCRAFT: {ticket.aircraft}
            </span>
          </div>
        </div>

        {/* ================= PERFORATION SEPARATOR ================= */}
        <div className="relative flex lg:flex-col items-center justify-between w-full lg:w-auto px-4 lg:px-0 py-2 lg:py-4">
          {/* Top Notch / Left Notch */}
          <div className="hidden lg:block w-7 h-7 rounded-full bg-slate-950 -mt-10 border border-slate-700/60 shadow-inner z-10" />
          
          {/* Dashed Line */}
          <div className="w-full lg:w-0 lg:h-full border-b-2 lg:border-b-0 lg:border-r-2 border-dashed border-slate-600/70 my-2 lg:my-0" />
          
          {/* Bottom Notch / Right Notch */}
          <div className="hidden lg:block w-7 h-7 rounded-full bg-slate-950 -mb-10 border border-slate-700/60 shadow-inner z-10" />
        </div>

        {/* ================= RIGHT / TEAR-OFF STUB ================= */}
        <div className="w-full lg:w-72 bg-slate-950/80 p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800/80 relative">
          <div>
            {/* Stub Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="font-extrabold text-sm tracking-wider text-white">
                AIRSKY
              </span>
              <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-700/40">
                FLIGHT {ticket.flightNumber}
              </span>
            </div>

            {/* Passenger on Stub */}
            <div className="space-y-3 text-xs mb-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  PASSENGER
                </span>
                <span className="font-bold text-slate-100 uppercase truncate block">
                  {ticket.passengerName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    SEAT
                  </span>
                  <span className="font-mono text-base font-extrabold text-white">
                    {ticket.seat}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    GATE
                  </span>
                  <span className="font-mono text-base font-extrabold text-amber-300">
                    {ticket.gate}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    PNR
                  </span>
                  <span className="font-mono font-bold text-sky-400">
                    {ticket.pnr}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    CLASS
                  </span>
                  <span className="font-bold text-slate-300 uppercase">
                    {ticket.bookingClass}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  ROUTE
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {ticket.originCode} → {ticket.destinationCode}
                </span>
              </div>
            </div>
          </div>

          {/* Real Scannable QR Code Section */}
          <div className="pt-3 border-t border-slate-800 flex flex-col items-center text-center">
            <div className="p-2.5 bg-white rounded-xl shadow-lg ring-1 ring-slate-200 inline-block">
              <QRCodeSVG
                value={verificationUrl}
                size={118}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="mt-2 text-center">
              <span className="text-[10px] font-mono font-semibold text-slate-300 block">
                SCAN TO VERIFY
              </span>
              <span className="text-[9px] text-slate-400 font-mono block max-w-[170px] truncate">
                /airsky/verify/{ticket.pnr}
              </span>
            </div>

            {/* Barcode graphic on stub bottom */}
            <div className="w-full mt-3 pt-2 border-t border-slate-800/60 flex justify-center opacity-70">
              <div className="h-6 flex items-end gap-[2px] overflow-hidden">
                {[
                  3, 1, 4, 2, 1, 5, 2, 4, 1, 3, 2, 5, 1, 4, 2, 1, 3, 5, 2, 1, 4, 2, 3, 1, 5,
                  2, 4, 1, 3, 2, 1, 4, 3, 2, 5, 1, 2, 4,
                ].map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-400"
                    style={{
                      width: `${w}px`,
                      height: `${14 + (idx % 5) * 2}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
