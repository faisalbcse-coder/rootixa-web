"use client";

import { Bell, Menu, Search } from "lucide-react";
import { AdminProfileMenu } from "./admin-profile-menu";

export function AdminTopbar({ onToggleSidebar, adminProfile }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Sidebar Toggle + Mobile Branding */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 lg:hidden">
          <span className="text-base font-extrabold text-slate-900">
            Rootixa<span className="text-indigo-600">.</span>
          </span>
          <span className="text-xs font-semibold text-slate-400">Console</span>
        </div>
      </div>

      {/* Center: Search Placeholder */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Search platform resources, tools, logs... (⌘K)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none cursor-not-allowed select-none"
          />
        </div>
      </div>

      {/* Right: Notifications & Dynamic Admin Profile with Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notification Icon Placeholder */}
        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          title="Notifications (Placeholder)"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600" />
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Admin Profile & Logout Dropdown */}
        <AdminProfileMenu adminProfile={adminProfile} />
      </div>
    </header>
  );
}
