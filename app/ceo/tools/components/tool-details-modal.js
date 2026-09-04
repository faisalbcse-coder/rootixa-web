"use client";

import { useState } from "react";
import {
  X,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Activity,
  Clock,
  Shield,
  Layers,
  Sparkles,
  QrCode,
  FileText,
  ImagePlus,
  Archive,
  Calculator,
  Wrench,
} from "lucide-react";

const ICON_MAP = {
  QrCode,
  FileText,
  ImagePlus,
  Sparkles,
  Archive,
  Calculator,
};

export function ToolDetailsModal({ tool, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !tool) return null;

  const IconComponent = ICON_MAP[tool.iconName] || Wrench;

  const handleCopyId = () => {
    if (!tool.id) return;
    navigator.clipboard.writeText(tool.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLive = tool.status === "live";
  const isMaintenance = tool.status === "maintenance";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tool-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-100">
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="tool-details-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {tool.name}
                </h2>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isLive
                      ? "bg-emerald-100 text-emerald-800"
                      : isMaintenance
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {isLive ? "Live" : isMaintenance ? "Maintenance" : "Development"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{tool.category}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Maintenance alert if active */}
          {isMaintenance && tool.maintenanceNotice && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Active Maintenance Notice: </span>
                <span>{tool.maintenanceNotice}</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Core Telemetry Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Performance & Telemetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Activity className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Total Runs</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {tool.totalRuns || 0}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Success Rate</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {tool.totalRuns > 0 ? `${tool.successRate}%` : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span>Avg Latency</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {tool.avgDurationMs ? `${tool.avgDurationMs}ms` : "—"}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  <span>Failures</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900">
                  {tool.failureRuns || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Configuration & Metadata */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Configuration Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/40 flex items-center justify-between">
                <span className="text-slate-500">Tool Identifier / Slug:</span>
                <div className="flex items-center gap-1.5 font-mono font-medium text-slate-800">
                  <span>{tool.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                    title="Copy Tool ID"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/40 flex items-center justify-between">
                <span className="text-slate-500">Public Route Link:</span>
                <div className="flex items-center gap-1.5 font-mono text-slate-800">
                  <span>{tool.route}</span>
                  {tool.route && tool.route !== "#" && (
                    <a
                      href={tool.route}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-indigo-600 hover:text-indigo-800 rounded transition-colors"
                      title="Open tool route"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/40 flex items-center justify-between">
                <span className="text-slate-500">Access Mode:</span>
                <span className="font-semibold capitalize text-slate-800 flex items-center gap-1">
                  <Shield className="h-3 w-3 text-slate-400" />
                  {tool.access || "Public"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 p-3 bg-slate-50/40 flex items-center justify-between">
                <span className="text-slate-500">Release / Version:</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Layers className="h-3 w-3 text-slate-400" />
                  {tool.version} ({tool.releaseDate})
                </span>
              </div>
            </div>
          </div>

          {/* Recent Usage Events (if any) */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Recent Activity Logs
            </h3>
            {tool.recentEvents && tool.recentEvents.length > 0 ? (
              <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100 text-xs">
                {tool.recentEvents.map((ev, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50/30 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          ev.status === "failure"
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                      />
                      <span className="font-mono text-slate-600">
                        {new Date(ev.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span>{ev.duration_ms || 0}ms</span>
                      <span className="capitalize font-semibold text-slate-700">
                        {ev.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                No recent activity logs recorded for this tool yet.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Last active:{" "}
            {tool.lastUsedAt
              ? new Date(tool.lastUsedAt).toLocaleString()
              : "Never"}
          </div>

          <div className="flex items-center gap-2">
            {tool.route && tool.route !== "#" && (
              <a
                href={tool.route}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <span>Test Tool</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
