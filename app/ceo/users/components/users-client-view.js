"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  X,
  Users
} from "lucide-react";
import { UserDetailsModal } from "./user-details-modal";
import { UserStatusDialog } from "./user-status-dialog";
import { toggleUserStatusAction, fetchUserDetailsAction } from "../actions";

export function UsersClientView({
  users = [],
  total = 0,
  totalPages = 1,
  currentPage = 1,
  perPage = 20,
  initialSearch = "",
  initialStatus = "all",
  initialSort = "newest",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusDialogData, setStatusDialogData] = useState(null); // { user, targetStatus }
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Update query params in URL
  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === null || val === "" || (key === "page" && val === 1) || (key === "status" && val === "all") || (key === "sort" && val === "newest")) {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQuery({ q: searchInput, page: 1 });
  };

  const handleStatusFilterChange = (status) => {
    updateQuery({ status, page: 1 });
  };

  const handleSortChange = (sort) => {
    updateQuery({ sort, page: 1 });
  };

  const handlePageChange = (page) => {
    updateQuery({ page });
  };

  const handleResetFilters = () => {
    setSearchInput("");
    updateQuery({ q: "", status: "all", sort: "newest", page: 1 });
  };

  const handleOpenDetails = async (user) => {
    setSelectedUser(user);
    // Fetch refreshed complete metadata
    const res = await fetchUserDetailsAction(user.id);
    if (res?.success && res?.user) {
      setSelectedUser(res.user);
    }
  };

  const handleConfirmStatusChange = async (userId, targetStatus) => {
    startTransition(async () => {
      const res = await toggleUserStatusAction({ userId, newStatus: targetStatus });
      setStatusDialogData(null);

      if (res?.success) {
        setToast({ type: "success", message: res.message });
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast({ type: "error", message: res?.error || "Failed to update status." });
        setTimeout(() => setToast(null), 5000);
      }
    });
  };

  const startRecord = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(currentPage * perPage, total);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl p-4 text-xs font-semibold shadow-sm transition-all animate-in fade-in duration-200 ${
            toast.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="rounded-lg p-1 hover:bg-black/5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateQuery({ q: "", page: 1 });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-700">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={initialStatus}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs text-slate-700">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-500">Sort:</span>
            <select
              value={initialSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table (Desktop) / Cards (Mobile) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {users.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th scope="col" className="py-3.5 pl-6 pr-4">User</th>
                    <th scope="col" className="px-4 py-3.5">Email</th>
                    <th scope="col" className="px-4 py-3.5">Joined</th>
                    <th scope="col" className="px-4 py-3.5">Status</th>
                    <th scope="col" className="px-4 py-3.5">Last Active</th>
                    <th scope="col" className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => {
                    const initials = u.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    const formattedJoined = u.joinedAt
                      ? new Date(u.joinedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                    const formattedLastActive = u.lastSignInAt
                      ? new Date(u.lastSignInAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Never";

                    const isInactive = u.status === "inactive";

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-slate-50/70 transition-colors duration-150"
                      >
                        {/* User column */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-xs">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[160px]">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                                {u.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4 font-medium text-slate-700">
                          <span className="truncate block max-w-[180px]" title={u.email}>
                            {u.email}
                          </span>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-4 text-slate-600 font-medium whitespace-nowrap">
                          {formattedJoined}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              isInactive
                                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isInactive ? "bg-rose-500" : "bg-emerald-500"
                              }`}
                            />
                            {isInactive ? "Inactive" : "Active"}
                          </span>
                        </td>

                        {/* Last Active */}
                        <td className="px-4 py-4 text-slate-500 font-medium whitespace-nowrap">
                          {formattedLastActive}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Details Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(u)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition cursor-pointer shadow-xs"
                              title="View user details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span>View</span>
                            </button>

                            {/* Status Toggle Button */}
                            {isInactive ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setStatusDialogData({ user: u, targetStatus: "active" })
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer shadow-xs"
                                title="Activate user account"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Activate</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setStatusDialogData({ user: u, targetStatus: "inactive" })
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer shadow-xs"
                                title="Deactivate user account"
                              >
                                <UserX className="h-3.5 w-3.5" />
                                <span>Deactivate</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((u) => {
                const initials = u.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const formattedJoined = u.joinedAt
                  ? new Date(u.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                const isInactive = u.status === "inactive";

                return (
                  <div key={u.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-xs text-slate-500 truncate">{u.email}</p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                          isInactive
                            ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isInactive ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                        />
                        {isInactive ? "Inactive" : "Active"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-50 pt-2">
                      <span>Joined {formattedJoined}</span>
                      <span>{u.toolUsageCount || 0} tool action(s)</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(u)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Details</span>
                      </button>

                      {isInactive ? (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusDialogData({ user: u, targetStatus: "active" })
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          <span>Activate</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setStatusDialogData({ user: u, targetStatus: "inactive" })
                          }
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Deactivate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs">
              <p className="text-slate-500">
                Showing <strong className="font-semibold text-slate-800">{startRecord}–{endRecord}</strong> of{" "}
                <strong className="font-semibold text-slate-800">{total}</strong> users
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2 self-center sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isPending}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>

                  <span className="px-2 font-semibold text-slate-600">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages || isPending}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Empty States */
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
              <Users className="h-6 w-6" />
            </div>
            {initialSearch || initialStatus !== "all" ? (
              <>
                <h4 className="text-sm font-bold text-slate-900">No users match your search</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Try changing your search query, or clear filters to view all accounts.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
                >
                  Reset Filters
                </button>
              </>
            ) : (
              <>
                <h4 className="text-sm font-bold text-slate-900">No users yet</h4>
                <p className="mt-1 text-xs text-slate-500">
                  Registered Rootixa platform users will appear here.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Confirmation Dialog for Activate/Deactivate */}
      {statusDialogData && (
        <UserStatusDialog
          isOpen={Boolean(statusDialogData)}
          user={statusDialogData.user}
          targetStatus={statusDialogData.targetStatus}
          isPending={isPending}
          onConfirm={handleConfirmStatusChange}
          onClose={() => setStatusDialogData(null)}
        />
      )}
    </div>
  );
}
