"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, X, Loader2 } from "lucide-react";

export function ToolStatusDialog({
  tool,
  targetStatus,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}) {
  const [notice, setNotice] = useState("");

  if (!isOpen || !tool) return null;

  const isGoingLive = targetStatus === "live";
  const isGoingMaintenance = targetStatus === "maintenance";

  const title = isGoingLive
    ? "Set Tool to Live (Active)"
    : isGoingMaintenance
    ? "Enable Maintenance Mode"
    : "Set Tool to In Development";

  const description = isGoingLive
    ? `Are you sure you want to activate "${tool.name}"? The tool will be marked as fully operational and available to users.`
    : isGoingMaintenance
    ? `Setting "${tool.name}" to maintenance will flag the tool as undergoing scheduled updates or temporary service.`
    : `Setting "${tool.name}" to In Development marks it as an upcoming platform capability.`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ toolId: tool.id, status: targetStatus, notice });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isPending}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isGoingLive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : isGoingMaintenance
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-indigo-50 text-indigo-600 border border-indigo-100"
            }`}
          >
            {isGoingLive ? (
              <CheckCircle className="h-6 w-6" />
            ) : isGoingMaintenance ? (
              <AlertTriangle className="h-6 w-6" />
            ) : (
              <Clock className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-1">
            <h2
              id="status-dialog-title"
              className="text-lg font-bold text-slate-900"
            >
              {title}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Status Indicator */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 uppercase tracking-wider">
              Target Status:
            </span>
            <span
              className={`font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                isGoingLive
                  ? "bg-emerald-100 text-emerald-800"
                  : isGoingMaintenance
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-200 text-slate-800"
              }`}
            >
              {targetStatus}
            </span>
          </div>

          {/* Optional notice if putting into maintenance */}
          {isGoingMaintenance && (
            <div>
              <label
                htmlFor="maintenance-notice"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Maintenance Notice / Reason (Optional)
              </label>
              <textarea
                id="maintenance-notice"
                rows={2}
                value={notice}
                onChange={(e) => setNotice(e.target.value)}
                placeholder="e.g. Scheduled engine upgrade or API rate limiter tuning"
                className="w-full text-xs rounded-xl border border-slate-200 p-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 ${
                isGoingLive
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : isGoingMaintenance
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Confirm Change"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
