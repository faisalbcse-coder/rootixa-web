"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown, LoaderCircle } from "lucide-react";

export function AnalyticsDateRange({ currentRange = "30d" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const options = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "year", label: "This year" },
  ];

  const handleRangeChange = (val) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val === "30d") {
      params.delete("range");
    } else {
      params.set("range", val);
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 transition">
        {isPending ? (
          <LoaderCircle className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
        ) : (
          <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
        )}
        <span className="font-bold text-slate-500">Period:</span>
        <select
          value={currentRange}
          onChange={(e) => handleRangeChange(e.target.value)}
          disabled={isPending}
          className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer pr-1"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}
