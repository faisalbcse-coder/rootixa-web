"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  ExternalLink,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  QrCode,
  FileText,
  ImagePlus,
  Archive,
  Calculator,
  Wrench,
  ChevronDown,
  RefreshCw,
  Check,
} from "lucide-react";
import { toggleToolStatusAction, fetchToolDetailsAction } from "../actions";
import { ToolDetailsModal } from "./tool-details-modal";
import { ToolStatusDialog } from "./tool-status-dialog";

const ICON_MAP = {
  QrCode,
  FileText,
  ImagePlus,
  Sparkles,
  Archive,
  Calculator,
};

export function ToolsClientView({ initialTools }) {
  const [tools, setTools] = useState(initialTools);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("most_used");

  const [selectedTool, setSelectedTool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    tool: null,
    targetStatus: "live",
  });

  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState(null);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let result = [...tools];

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    // Category
    if (category !== "all") {
      result = result.filter((t) =>
        t.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    // Status
    if (status !== "all") {
      result = result.filter((t) => t.status === status);
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "most_used") {
        return (b.totalRuns || 0) - (a.totalRuns || 0);
      }
      if (sort === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      if (sort === "name_desc") {
        return b.name.localeCompare(a.name);
      }
      if (sort === "category") {
        return a.category.localeCompare(b.category);
      }
      if (sort === "status") {
        const order = { live: 1, maintenance: 2, development: 3 };
        return (order[a.status] || 99) - (order[b.status] || 99);
      }
      return 0;
    });

    return result;
  }, [tools, search, category, status, sort]);

  // Open details modal
  const handleOpenDetails = async (tool) => {
    setSelectedTool(tool);
    setIsModalOpen(true);

    try {
      const res = await fetchToolDetailsAction(tool.id);
      if (res?.success && res.tool) {
        setSelectedTool(res.tool);
      }
    } catch {
      // Keep existing tool data if action fails
    }
  };

  // Open status dialog
  const handleInitiateStatusChange = (tool, targetStatus) => {
    setDialogState({
      isOpen: true,
      tool,
      targetStatus,
    });
  };

  // Confirm status change
  const handleConfirmStatusChange = async ({ toolId, status: newStatus, notice }) => {
    startTransition(async () => {
      const res = await toggleToolStatusAction({
        toolId,
        status: newStatus,
        notice,
      });

      if (res.success) {
        setTools((prev) =>
          prev.map((t) =>
            t.id === toolId
              ? {
                  ...t,
                  status: newStatus,
                  maintenanceNotice: notice,
                  updatedAt: new Date().toISOString(),
                }
              : t
          )
        );
        showToast("success", res.message || "Tool status updated successfully.");
        setDialogState({ isOpen: false, tool: null, targetStatus: "live" });
      } else {
        showToast("error", res.error || "Failed to update tool status.");
      }
    });
  };

  const hasActiveFilters =
    search.trim() !== "" || category !== "all" || status !== "all" || sort !== "most_used";

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setSort("most_used");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl border text-sm font-medium animate-in slide-in-from-bottom-5 duration-300 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-rose-950 text-rose-100 border-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools by name, slug, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Utility">Utility</option>
                <option value="Career">Career</option>
                <option value="Media">Media</option>
                <option value="AI">AI & Photo</option>
                <option value="Documents">Documents</option>
                <option value="Business">Business</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="live">Live (Active)</option>
                <option value="maintenance">Maintenance</option>
                <option value="development">In Development</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="most_used">Sort: Most Used</option>
                <option value="name_asc">Sort: Name (A–Z)</option>
                <option value="name_desc">Sort: Name (Z–A)</option>
                <option value="category">Sort: Category</option>
                <option value="status">Sort: Status</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Directory Count Header */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-medium">
        <span>
          Showing{" "}
          <strong className="text-slate-900 font-bold">
            {filteredTools.length}
          </strong>{" "}
          of {tools.length} platform tools
        </span>
        {hasActiveFilters && (
          <span className="text-indigo-600 font-semibold">
            Filtered results
          </span>
        )}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
            <SlidersHorizontal className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No tools match your criteria
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query, clearing your filters, or switching categories.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      {filteredTools.length > 0 && (
        <div className="hidden md:block rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 pl-6 pr-4">Tool</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Operations</th>
                <th className="px-4 py-3.5">Last Active</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTools.map((t) => {
                const IconComponent = ICON_MAP[t.iconName] || Wrench;
                const isLive = t.status === "live";
                const isMaintenance = t.status === "maintenance";

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Tool Info */}
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-slate-900">
                            <span>{t.name}</span>
                            <span className="text-[10px] font-normal text-slate-400">
                              {t.version}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-slate-400">
                            /{t.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4 text-slate-600 font-medium">
                      {t.category}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          isLive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            : isMaintenance
                            ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                            : "bg-slate-100 text-slate-600 border border-slate-200/60"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isLive
                              ? "bg-emerald-500 animate-pulse"
                              : isMaintenance
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          }`}
                        />
                        {isLive
                          ? "Live"
                          : isMaintenance
                          ? "Maintenance"
                          : "Development"}
                      </span>
                    </td>

                    {/* Usage Count */}
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">
                        {t.totalRuns || 0} runs
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.totalRuns > 0 ? `${t.successRate}% success` : "No activity"}
                      </div>
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-4 text-slate-500">
                      {t.lastUsedAt
                        ? new Date(t.lastUsedAt).toLocaleDateString()
                        : "Never"}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4 pr-6 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {/* View Modal */}
                        <button
                          onClick={() => handleOpenDetails(t)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="View Tool Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* Status Toggle Menu */}
                        {isLive ? (
                          <button
                            onClick={() =>
                              handleInitiateStatusChange(t, "maintenance")
                            }
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Set to Maintenance"
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleInitiateStatusChange(t, "live")
                            }
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Activate Tool (Live)"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}

                        {/* Route Link */}
                        {t.route && t.route !== "#" && (
                          <a
                            href={t.route}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Open Tool Live"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Card Grid View */}
      {filteredTools.length > 0 && (
        <div className="grid grid-cols-1 gap-3.5 md:hidden">
          {filteredTools.map((t) => {
            const IconComponent = ICON_MAP[t.iconName] || Wrench;
            const isLive = t.status === "live";
            const isMaintenance = t.status === "maintenance";

            return (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {t.name}
                      </h4>
                      <p className="font-mono text-xs text-slate-400">
                        /{t.slug}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isLive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : isMaintenance
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {isLive
                      ? "Live"
                      : isMaintenance
                      ? "Maintenance"
                      : "Development"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-100">
                  <div>
                    <span className="text-slate-400">Category:</span>
                    <p className="font-semibold text-slate-700">{t.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Runs:</span>
                    <p className="font-semibold text-slate-700">
                      {t.totalRuns || 0} operations
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleOpenDetails(t)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Details
                  </button>

                  <div className="flex items-center gap-2">
                    {isLive ? (
                      <button
                        onClick={() =>
                          handleInitiateStatusChange(t, "maintenance")
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        Maintenance
                      </button>
                    ) : (
                      <button
                        onClick={() => handleInitiateStatusChange(t, "live")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Activate
                      </button>
                    )}

                    {t.route && t.route !== "#" && (
                      <a
                        href={t.route}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-xl border border-slate-200 text-indigo-600 hover:bg-slate-50"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <ToolDetailsModal
        tool={selectedTool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <ToolStatusDialog
        tool={dialogState.tool}
        targetStatus={dialogState.targetStatus}
        isOpen={dialogState.isOpen}
        onClose={() =>
          setDialogState({ isOpen: false, tool: null, targetStatus: "live" })
        }
        onConfirm={handleConfirmStatusChange}
        isPending={isPending}
      />
    </div>
  );
}
