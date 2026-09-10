"use client";

import { User, Sparkles, X } from "lucide-react";

export function PassengerInput({ value, onChange, error }) {
  const sampleName = "MD Ariful Islam";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="passenger-name-input"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          Passenger Name <span className="text-rose-400">*</span>
        </label>
        <button
          type="button"
          onClick={() => onChange(sampleName)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 hover:text-sky-300 transition-colors px-2 py-0.5 rounded bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20"
          title="Autofill sample name"
        >
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>Use Sample: {sampleName}</span>
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-400 transition-colors">
          <User className="w-4 h-4" />
        </div>
        <input
          id="passenger-name-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter passenger full name"
          autoComplete="off"
          className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none transition-all duration-200 ${
            error
              ? "border-rose-500/80 focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
              : "border-slate-700/80 hover:border-slate-600 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          }`}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear passenger name"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-400 flex items-center gap-1.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-slate-400">
          Enter name matching government-issued photo ID or passport.
        </p>
      )}
    </div>
  );
}
