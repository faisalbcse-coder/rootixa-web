"use client";

import { useState } from "react";
import { 
  X, 
  User, 
  Mail, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Copy, 
  Check, 
  Wrench, 
  Activity,
  KeyRound
} from "lucide-react";

export function UserDetailsModal({ user, onClose }) {
  const [copiedId, setCopiedId] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formattedJoined = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown";

  const formattedLastActive = user.lastSignInAt
    ? new Date(user.lastSignInAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never signed in";

  const isInactive = user.status === "inactive";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-base shadow-sm">
              {initials}
            </div>
            <div>
              <h3 id="user-details-title" className="text-base font-bold text-slate-900 leading-tight">
                {user.name}
              </h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            aria-label="Close user details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="mt-5 space-y-4 text-xs">
          {/* Status & Verification Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs ${
                isInactive
                  ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isInactive ? "bg-rose-500" : "bg-emerald-500"
                }`}
              />
              Account {isInactive ? "Inactive / Suspended" : "Active"}
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-[11px] ${
                user.emailVerified
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {user.emailVerified ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" /> Email Verified
                </>
              ) : (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" /> Email Unverified
                </>
              )}
            </span>
          </div>

          {/* User ID with Copy */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium text-slate-500">
                <KeyRound className="h-3.5 w-3.5 text-slate-400" /> User Identifier (UUID)
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                title="Copy UUID to clipboard"
              >
                {copiedId ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <code className="mt-1.5 block font-mono text-[11px] text-slate-700 break-all select-all">
              {user.id}
            </code>
          </div>

          {/* Detail Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-500 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" /> Registration Date
              </span>
              <p className="font-semibold text-slate-900">{formattedJoined}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Last Active
              </span>
              <p className="font-semibold text-slate-900">{formattedLastActive}</p>
            </div>
          </div>

          {/* Tool Activity Summary */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-2 font-bold text-slate-800">
                <Wrench className="h-4 w-4 text-indigo-600" /> Tool Usage Summary
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                {user.toolUsageCount || 0} operations logged
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {user.toolUsageCount > 0
                ? `This user has completed ${user.toolUsageCount} tool action(s) across the platform.`
                : "No tool usage activity recorded yet for this user."}
            </p>
          </div>

          {/* Security Notice */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Rootixa Privacy Protocol: Passwords and authentication secrets are encrypted and inaccessible.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
