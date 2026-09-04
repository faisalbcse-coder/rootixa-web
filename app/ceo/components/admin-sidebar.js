"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wrench,
  BarChart3,
  Sparkles,
  CreditCard,
  FileText,
  Server,
  ShieldCheck,
  Settings,
  X,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import { logoutCeo } from "../actions";

export function AdminSidebar({ isOpen, onClose, adminProfile }) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/ceo",
      icon: LayoutDashboard,
      active: pathname === "/ceo",
      available: true,
    },
    {
      name: "Users",
      href: "/ceo/users",
      icon: Users,
      active: pathname === "/ceo/users",
      available: true,
    },
    {
      name: "Tools",
      href: "#",
      icon: Wrench,
      active: false,
      available: false,
    },
    {
      name: "Analytics",
      href: "/ceo/analytics",
      icon: BarChart3,
      active: pathname === "/ceo/analytics",
      available: true,
    },
    {
      name: "AI",
      href: "#",
      icon: Sparkles,
      active: false,
      available: false,
    },
    {
      name: "Subscriptions",
      href: "#",
      icon: CreditCard,
      active: false,
      available: false,
    },
    {
      name: "Content",
      href: "#",
      icon: FileText,
      active: false,
      available: false,
    },
    {
      name: "System",
      href: "#",
      icon: Server,
      active: false,
      available: false,
    },
    {
      name: "Security",
      href: "#",
      icon: ShieldCheck,
      active: false,
      available: false,
    },
    {
      name: "Settings",
      href: "#",
      icon: Settings,
      active: false,
      available: false,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header (Brand) */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <Link href="/ceo" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-xs">
              <LayoutGrid className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                Rootixa<span className="text-indigo-600">.</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">
                Executive Console
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Management
          </p>

          {navigationItems.map((item) => {
            const Icon = item.icon;

            if (item.available) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150 ${
                    item.active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${item.active ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            }

            return (
              <div
                key={item.name}
                className="group flex cursor-not-allowed items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400"
                title={`${item.name} (Coming Soon)`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-slate-300" />
                  <span>{item.name}</span>
                </div>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 group-hover:bg-slate-200">
                  Soon
                </span>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer with Admin Identity and Quick Logout */}
        <div className="border-t border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-xs">
                {(adminProfile?.fullName || "A").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {adminProfile?.fullName || "Rootixa Admin"}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {adminProfile?.role || "Admin"}
                </p>
              </div>
            </div>
            <form action={logoutCeo}>
              <button
                type="submit"
                title="Sign out of Executive Console"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Rootixa Console</span>
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Secured
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
