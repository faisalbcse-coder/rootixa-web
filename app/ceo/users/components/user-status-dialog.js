"use client";

import { AlertTriangle, CheckCircle2, LoaderCircle, X } from "lucide-react";

export function UserStatusDialog({
  isOpen,
  user,
  targetStatus, // "active" | "inactive"
  isPending,
  onConfirm,
  onClose,
}) {
  if (!isOpen || !user) return null;

  const isDeactivating = targetStatus === "inactive";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                isDeactivating
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
              }`}
            >
              {isDeactivating ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 id="status-dialog-title" className="text-base font-bold text-slate-900 leading-tight">
                {isDeactivating ? "Deactivate user?" : "Activate user?"}
              </h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed">
          {isDeactivating ? (
            <p>
              Are you sure you want to deactivate <strong className="text-slate-900 font-bold">{user.name}</strong>?
              This account will be suspended and the user will be blocked from signing in to Rootixa.
            </p>
          ) : (
            <p>
              Are you sure you want to activate <strong className="text-slate-900 font-bold">{user.name}</strong>?
              This account will be restored and allowed full access to sign in and use platform tools.
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirm(user.id, targetStatus)}
            disabled={isPending}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-60 ${
              isDeactivating
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
            }`}
          >
            {isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                <span>{isDeactivating ? "Deactivating..." : "Activating..."}</span>
              </>
            ) : (
              <span>{isDeactivating ? "Deactivate" : "Activate"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
