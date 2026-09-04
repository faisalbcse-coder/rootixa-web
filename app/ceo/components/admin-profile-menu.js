"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { 
  User, 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  X, 
  Calendar, 
  Mail, 
  KeyRound,
  LoaderCircle
} from "lucide-react";
import { logoutCeo } from "../actions";

export function AdminProfileMenu({ adminProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef(null);

  const name = adminProfile?.fullName || "Rootixa Admin";
  const email = adminProfile?.email || "admin@rootixa.com";
  const role = adminProfile?.role || "Super Admin";
  const status = adminProfile?.status || "active";
  const createdAt = adminProfile?.createdAt
    ? new Date(adminProfile.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "System Initialized";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    startTransition(async () => {
      await logoutCeo();
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/80 py-1.5 pl-2 pr-3 transition-all duration-150 hover:bg-slate-100 hover:border-slate-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-xs text-xs font-bold">
          {initials}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
            {name}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {role}
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-200/50 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="rounded-xl bg-slate-50 p-3 mb-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-xs">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                <p className="text-xs text-slate-500 truncate">{email}</p>
              </div>
            </div>
            <div className="mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                <ShieldCheck className="h-3 w-3" /> {role}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {status}
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowProfileModal(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              <User className="h-4 w-4 text-slate-400" />
              <span>Admin Profile Details</span>
            </button>

            <div className="my-1 border-t border-slate-100" />

            {/* Logout Action Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isPending}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin text-rose-600" />
                  <span>Signing out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign out</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Admin Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
                  {initials}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Admin Profile</h3>
                  <p className="text-xs text-slate-500">Rootixa Executive Account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <User className="h-4 w-4 text-slate-400" /> Full Name
                </span>
                <span className="font-bold text-slate-900">{name}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <Mail className="h-4 w-4 text-slate-400" /> Email Address
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{email}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-slate-400" /> Role
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                  {role}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <Calendar className="h-4 w-4 text-slate-400" /> Member Since
                </span>
                <span className="font-semibold text-slate-700">{createdAt}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="flex items-center gap-2 text-slate-500">
                  <KeyRound className="h-4 w-4 text-slate-400" /> Session Security
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  Encrypted & HttpOnly
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
