import React from "react";
import { TrendingUp, TrendingDown, Minus, AlertCircle, HelpCircle } from "lucide-react";

export function AdminStatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  state = "success", // "loading" | "success" | "error" | "unavailable" | "empty"
  isMock = false,
}) {
  const isLoading = state === "loading";
  const isError = state === "error";
  const isUnavailable = state === "unavailable";
  const isEmpty = state === "empty";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md ${
        isError
          ? "border-rose-200 hover:border-rose-300"
          : isUnavailable
          ? "border-slate-200/80 opacity-80"
          : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </p>

            {/* State badges */}
            {isMock && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                Mock
              </span>
            )}
            {isUnavailable && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                Not Connected
              </span>
            )}
            {isError && (
              <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-600">
                Error
              </span>
            )}
            {isEmpty && (
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                Empty
              </span>
            )}
          </div>

          {/* Metric Value */}
          <div className="mt-2 min-h-[2.25rem] flex items-center">
            {isLoading ? (
              <div className="h-7 w-24 rounded-md bg-slate-200 animate-pulse" />
            ) : (
              <p
                className={`text-2xl sm:text-3xl font-bold tracking-tight truncate ${
                  isError
                    ? "text-rose-600"
                    : isUnavailable
                    ? "text-slate-400 text-xl sm:text-2xl font-semibold"
                    : "text-slate-900"
                }`}
              >
                {value}
              </p>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
              isError
                ? "bg-rose-50 text-rose-600"
                : isUnavailable
                ? "bg-slate-100 text-slate-400"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Supporting Text / Trend indicator */}
      <div className="mt-4 flex items-center gap-1.5 text-xs min-h-[1.25rem]">
        {isLoading ? (
          <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
        ) : (
          <>
            {isError ? (
              <span className="inline-flex items-center font-medium text-rose-600">
                <AlertCircle className="mr-1 h-3.5 w-3.5" />
                {change || "Unable to load data"}
              </span>
            ) : isUnavailable ? (
              <span className="inline-flex items-center text-slate-400">
                <HelpCircle className="mr-1 h-3.5 w-3.5" />
                {change || "Tracking unavailable"}
              </span>
            ) : changeType === "positive" ? (
              <span className="inline-flex items-center font-semibold text-emerald-600">
                <TrendingUp className="mr-1 h-3.5 w-3.5" />
                {change}
              </span>
            ) : changeType === "negative" ? (
              <span className="inline-flex items-center font-semibold text-rose-600">
                <TrendingDown className="mr-1 h-3.5 w-3.5" />
                {change}
              </span>
            ) : (
              <span className="inline-flex items-center font-medium text-slate-500">
                <Minus className="mr-1 h-3.5 w-3.5" />
                {change}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
