"use client";

import { getAllPNRs } from "@/lib/airsky/pnr-database";
import { Plane, Check, ArrowRight } from "lucide-react";

export function PNRSelector({ selectedPNR, onSelect, error }) {
  const pnrs = getAllPNRs();

  const getClassBadge = (bookingClass) => {
    switch (bookingClass) {
      case "First Class":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "Business":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "Premium Economy":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
          Select PNR & Flight <span className="text-rose-400">*</span>
        </label>
        <span className="text-[11px] text-slate-400 font-medium">
          10 Active GDS Records
        </span>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent rounded-xl p-1 ${
          error ? "ring-1 ring-rose-500/50 bg-rose-950/10" : ""
        }`}
      >
        {pnrs.map((item) => {
          const isSelected = selectedPNR === item.pnr;
          return (
            <button
              key={item.pnr}
              type="button"
              onClick={() => onSelect(item.pnr)}
              className={`text-left p-3 rounded-xl border transition-all duration-200 relative group flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-br from-sky-950/60 to-blue-950/60 border-sky-400 ring-2 ring-sky-500/40 shadow-lg shadow-sky-900/30"
                  : "bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
              }`}
            >
              {/* Top Row: PNR code & Class badge */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-extrabold tracking-wider px-2 py-0.5 rounded-md border ${
                      isSelected
                        ? "bg-sky-500 text-slate-950 border-sky-300 shadow-sm"
                        : "bg-slate-800 text-sky-400 border-slate-700"
                    }`}
                  >
                    {item.pnr}
                  </span>
                  <span className="text-xs font-bold text-slate-200">
                    {item.flightNumber}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getClassBadge(
                    item.bookingClass
                  )}`}
                >
                  {item.bookingClass}
                </span>
              </div>

              {/* Middle Row: Route */}
              <div className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">{item.originCode}</span>
                  <span className="text-[11px] text-slate-400">({item.originCity})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400 mx-0.5" />
                  <span className="font-bold text-slate-100">{item.destinationCode}</span>
                  <span className="text-[11px] text-slate-400">({item.destinationCity})</span>
                </div>
              </div>

              {/* Bottom Row: Date & Seat info */}
              <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span>{item.departureDate}</span>
                <div className="flex items-center gap-2">
                  <span>Seat: <strong className="text-slate-300">{item.seat}</strong></span>
                  <span>Gate: <strong className="text-slate-300">{item.gate}</strong></span>
                </div>
              </div>

              {/* Selected Checkmark Indicator */}
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-400 flex items-center gap-1.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-slate-400">
          Select any of the 10 verified flight PNR routes to generate your boarding pass.
        </p>
      )}
    </div>
  );
}
