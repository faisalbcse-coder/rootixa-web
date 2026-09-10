"use client";

import Link from "next/link";
import { Plane, ShieldCheck, Compass, Ticket, Radio } from "lucide-react";

export function AirSkyHeader({ activeNav = "ticket-generator" }) {
  const navItems = [
    { label: "Home", href: "/airsky", id: "home" },
    { label: "Book", href: "/airsky#generator", id: "book" },
    { label: "Manage Booking", href: "/airsky#generator", id: "manage" },
    { label: "Check-in", href: "/airsky#generator", id: "checkin" },
    { label: "Flight Status", href: "/airsky#generator", id: "status" },
  ];

  return (
    <header className="airsky-no-print w-full bg-slate-950 text-white border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md bg-slate-950/90">
      {/* Top micro bar with system status */}
      <div className="border-b border-slate-800/50 bg-slate-900/60 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              AirSky Operational Network
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">
              Pre-departure PNR & QR Engine v2.4
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hidden md:inline flex items-center gap-1">
              <Radio className="w-3 h-3 text-sky-400" />
              Direct GDS Sync Active
            </span>
            <span className="text-slate-300 font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
              IATA: AS | ICAO: ASK
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            href="/airsky"
            className="flex items-center gap-3 group transition-transform hover:scale-[1.01]"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20 ring-1 ring-white/20">
              <Plane className="w-5 h-5 text-white transform -rotate-45 transition-transform group-hover:-rotate-12 duration-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-widest text-xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-sky-200">
                  AIRSKY
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Airlines
                </span>
              </div>
              <span className="text-[10px] tracking-wider text-slate-400 uppercase -mt-0.5 font-medium">
                Premium Passenger Systems
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/airsky#generator"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-md shadow-sky-600/20 transition-all hover:shadow-sky-500/30"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Issue Ticket</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
