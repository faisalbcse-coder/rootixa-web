import { AirSkyHeader } from "@/components/airsky/airsky-header";

export const metadata = {
  title: "AirSky — Airline Ticket + PNR + QR Verification System",
  description:
    "Official AirSky Airlines digital boarding pass generator and real-time PNR verification portal.",
};

export default function AirSkyLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Print-specific style block */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .airsky-no-print {
            display: none !important;
          }
          .airsky-boarding-pass {
            max-width: 100% !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 1px solid #334155 !important;
            break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Scoped AirSky Navigation */}
      <AirSkyHeader />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Scoped Airline Footer */}
      <footer className="airsky-no-print border-t border-slate-900 bg-slate-950 text-slate-400 py-8 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-widest text-slate-300">AIRSKY</span>
            <span>&copy; {new Date().getFullYear()} AirSky Aviation Group. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Electronic Boarding Protocol</span>
            <span>&bull;</span>
            <span>IATA Resolution 722f Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
