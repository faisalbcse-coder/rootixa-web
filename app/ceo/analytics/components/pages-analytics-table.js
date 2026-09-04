"use client";

import { useState } from "react";
import { FileText, ArrowUpDown, Search, HelpCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

export function PagesAnalyticsTable({ pages = [] }) {
  const [sortKey, setSortKey] = useState("views");
  const [sortAsc, setSortAsc] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const filteredPages = pages.filter(
    (p) =>
      p.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedPages = [...filteredPages].sort((a, b) => {
    let aVal = a[sortKey];
    let bVal = b[sortKey];
    if (sortKey === "avgTime") {
      aVal = a.avgTimeSeconds;
      bVal = b.avgTimeSeconds;
    }
    if (typeof aVal === "string") {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-6 flex flex-col justify-between">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Page Analytics
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Traffic, engagement, and unique visitor volume by URL path.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter paths..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-3 text-xs text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {sortedPages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th scope="col" className="py-2.5 pl-2 pr-4">Page Path</th>
                  <th
                    scope="col"
                    onClick={() => handleSort("views")}
                    className="px-4 py-2.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Views</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("uniqueVisitors")}
                    className="px-4 py-2.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Visitors</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("sessions")}
                    className="px-4 py-2.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Sessions</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    onClick={() => handleSort("avgTime")}
                    className="px-4 py-2.5 text-right cursor-pointer hover:text-indigo-600 select-none"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Avg. Time</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th scope="col" className="py-2.5 pr-2 pl-4 text-center">Visit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPages.map((page, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 pl-2 pr-4 font-bold text-slate-900">
                      <div className="flex flex-col">
                        <span className="font-mono text-indigo-600 text-xs">{page.path}</span>
                        {page.title && page.title !== page.path && (
                          <span className="text-[11px] text-slate-400 font-normal truncate max-w-[280px]">
                            {page.title}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-700 font-semibold">
                      {page.uniqueVisitors.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500 font-medium">
                      {page.sessions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-600 font-mono text-[11px]">
                      {page.avgTimeFormatted}
                    </td>
                    <td className="py-3.5 pr-2 pl-4 text-center">
                      <Link
                        href={page.path}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 transition"
                        title="Open page in new tab"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-700">Not enough page view data yet</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Page analytics will populate automatically as visitors view Rootixa pages.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Showing {sortedPages.length} active routes</span>
        <span>Includes SPA client transitions</span>
      </div>
    </div>
  );
}
