"use client";

import { useState } from "react";
import { PassengerInput } from "./passenger-input";
import { PNRSelector } from "./pnr-selector";
import { getTicketData, saveGeneratedTicket } from "@/lib/airsky/pnr-database";
import { Ticket, Sparkles, AlertCircle } from "lucide-react";

export function TicketGenerator({ onTicketGenerated, initialPNR = "AS7K2P" }) {
  const [passengerName, setPassengerName] = useState("MD Ariful Islam");
  const [selectedPNR, setSelectedPNR] = useState(initialPNR);
  const [errors, setErrors] = useState({ passenger: "", pnr: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = { passenger: "", pnr: "" };
    let hasError = false;

    if (!passengerName.trim()) {
      newErrors.passenger = "Please enter passenger name.";
      hasError = true;
    }

    if (!selectedPNR) {
      newErrors.pnr = "Please select a PNR.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    setIsSubmitting(true);

    // Build ticket data
    const ticket = getTicketData(selectedPNR, passengerName);
    
    // Save to localStorage for verification & standalone ticket routes
    saveGeneratedTicket(selectedPNR, passengerName);

    setTimeout(() => {
      setIsSubmitting(false);
      if (onTicketGenerated) {
        onTicketGenerated(ticket);
      }

      // Smooth scroll to generated ticket
      const el = document.getElementById("generated-ticket-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  return (
    <div
      id="generator"
      className="airsky-no-print w-full max-w-4xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative mb-8 pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-3">
          <Ticket className="w-3.5 h-3.5" />
          <span>Flight Reservation & Issuance Portal</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Generate Airline Boarding Pass
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Enter passenger details and choose one of the 10 active PNR records to generate
          an official AirSky electronic boarding pass equipped with live QR verification.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="relative space-y-7">
        {/* Step 1: Passenger Name */}
        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Passenger Information
            </span>
          </div>
          <PassengerInput
            value={passengerName}
            onChange={(val) => {
              setPassengerName(val);
              if (errors.passenger) setErrors((prev) => ({ ...prev, passenger: "" }));
            }}
            error={errors.passenger}
          />
        </div>

        {/* Step 2: Select PNR */}
        <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Select Verified PNR & Flight Route
            </span>
          </div>
          <PNRSelector
            selectedPNR={selectedPNR}
            onSelect={(pnr) => {
              setSelectedPNR(pnr);
              if (errors.pnr) setErrors((prev) => ({ ...prev, pnr: "" }));
            }}
            error={errors.pnr}
          />
        </div>

        {/* Global Error Banner */}
        {(errors.passenger || errors.pnr) && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              {errors.passenger || errors.pnr}
            </span>
          </div>
        )}

        {/* Step 3: Generate Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Selected:{" "}
            <strong className="text-white font-mono">{selectedPNR || "None"}</strong> | Passenger:{" "}
            <strong className="text-white">{passengerName || "Not specified"}</strong>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:via-blue-500 hover:to-indigo-500 shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 border border-white/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? "Generating Pass..." : "Generate Ticket"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
