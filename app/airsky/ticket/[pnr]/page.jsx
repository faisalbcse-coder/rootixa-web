import { getPNR } from "@/lib/airsky/pnr-database";
import { TicketClientView } from "./ticket-client-view";
import Link from "next/link";
import { AlertCircle, Plane } from "lucide-react";

export async function generateMetadata({ params }) {
  const { pnr } = await params;
  const upper = (pnr || "").toUpperCase();
  const flight = getPNR(upper);

  return {
    title: flight
      ? `AirSky Boarding Pass — ${flight.flightNumber} (${flight.pnr})`
      : "AirSky Ticket View",
    description: flight
      ? `Official AirSky electronic boarding pass for flight ${flight.flightNumber} from ${flight.originCode} to ${flight.destinationCode}.`
      : "View AirSky boarding pass.",
  };
}

export default async function TicketPage({ params }) {
  const { pnr } = await params;
  const upper = (pnr || "").toUpperCase();
  const ticketRecord = getPNR(upper);

  if (!ticketRecord) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">Ticket Not Found</h2>
            <p className="text-xs text-slate-400">
              No flight booking matches PNR{" "}
              <strong className="text-rose-400 font-mono">{upper}</strong>.
            </p>
          </div>
          <Link
            href="/airsky"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all"
          >
            <Plane className="w-4 h-4" />
            <span>Go to Ticket Generator</span>
          </Link>
        </div>
      </div>
    );
  }

  return <TicketClientView pnr={upper} initialTicket={ticketRecord} />;
}
