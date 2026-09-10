"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BoardingPass } from "@/components/airsky/boarding-pass";
import { TicketActions } from "@/components/airsky/ticket-actions";
import { getTicketData, getSavedPassengerName } from "@/lib/airsky/pnr-database";
import { ArrowLeft, Ticket, ShieldCheck, CheckCircle2 } from "lucide-react";

export function TicketClientView({ pnr, initialTicket }) {
  const [ticket] = useState(() => {
    const savedName = typeof window !== "undefined" ? getSavedPassengerName(pnr) : null;
    return getTicketData(pnr, savedName || "");
  });

  return (
    <div className="w-full flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Return link */}
        <div className="airsky-no-print flex items-center justify-between">
          <Link
            href="/airsky"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to AirSky Portal</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirmed Booking</span>
          </div>
        </div>

        {/* Boarding Pass Component */}
        <BoardingPass ticket={ticket || initialTicket} />

        {/* Ticket Actions */}
        <TicketActions
          ticket={ticket || initialTicket}
          onReset={() => {
            window.location.href = "/airsky#generator";
          }}
        />
      </div>
    </div>
  );
}
