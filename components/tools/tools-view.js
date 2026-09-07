"use client";

import Link from "next/link";
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Star,
  ArrowRight,
  LayoutGrid,
  Sparkles,
  Home,
  Wrench,
  ShieldCheck,
  MessageSquare,
  Heart,
} from "lucide-react";
import { CANONICAL_TOOLS } from "@/lib/tools/data";
import { searchToolsSemantic } from "@/lib/tools/semantic-search";
import { useToolTransition, ToolLink } from "@/components/tools/tool-transition-context";

export function ToolsView() {
  const { openTool } = useToolTransition();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const savedTheme = localStorage.getItem("rootixa_theme");
      if (savedTheme) return savedTheme === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return false;
    }
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const searchInputRef = useRef(null);

  // Synchronize Dark Mode with document & handle scroll
  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", darkMode);
    } catch {
      // Ignore DOM toggle error
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [darkMode]);

  // Keyboard shortcut (Cmd/Ctrl + K or /) to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    try {
      document.documentElement.classList.toggle("dark", nextDark);
      localStorage.setItem("rootixa_theme", nextDark ? "dark" : "light");
    } catch {
      // Ignore local storage error
    }
  };

  // Filter tools based on search and category
  const filteredTools = useMemo(() => {
    let list = CANONICAL_TOOLS;

    if (activeCategory !== "all") {
      list = list.filter((t) => t.categoryId === activeCategory);
    }

    if (searchQuery.trim()) {
      list = searchToolsSemantic(list, searchQuery);
    }

    return list;
  }, [searchQuery, activeCategory]);

  const resetAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  const navLinkClass =
    "relative px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-none hover:shadow-2xs";

  const activeNavLinkClass =
    "relative px-3.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 rounded-full shadow-xs border border-indigo-100 dark:border-slate-700 flex items-center gap-1.5";

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        darkMode ? "dark bg-[#090E17] text-slate-200" : "bg-white text-slate-800"
      }`}
    >
      {/* ============================================================
          HEADER & NAVIGATION
      ============================================================ */}
      <header
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "top-3 px-4"
            : "top-0 px-0 bg-slate-50/85 dark:bg-[#090E17]/85 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/70 shadow-2xs"
        }`}
      >
        <nav
          aria-label="Main Navigation"
          className={`max-w-7xl mx-auto transition-all duration-300 flex justify-between items-center ${
            isScrolled
              ? "bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-slate-200/40 dark:shadow-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-full px-6 py-2.5"
              : "py-3.5 px-4 sm:px-6 lg:px-8"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 cursor-pointer group"
            aria-label="Rootixa Homepage"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 dark:shadow-indigo-950/60 group-hover:scale-105 transition-all duration-300">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/70 shadow-2xs backdrop-blur-xs">
            <Link href="/" className={navLinkClass}>
              <Home className="w-3.5 h-3.5 text-indigo-500" /> Home
            </Link>
            <Link href="/#popular-tools" className={navLinkClass}>
              <Wrench className="w-3.5 h-3.5" /> Popular Tools
            </Link>
            <Link href="/tools" className={activeNavLinkClass}>
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> All Tools
            </Link>
            <Link href="/#why-rootixa" className={navLinkClass}>
              <ShieldCheck className="w-3.5 h-3.5" /> Why Rootixa
            </Link>
            <Link href="/#faq" className={navLinkClass}>
              <Star className="w-3.5 h-3.5 text-amber-500" /> FAQ
            </Link>
            <Link href="/feedback" className={navLinkClass}>
              <MessageSquare className="w-3.5 h-3.5" /> Feedback
            </Link>
          </div>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className="relative w-14 h-8 flex items-center bg-slate-200 dark:bg-slate-700/80 rounded-full p-1 cursor-pointer transition-colors duration-300 border border-slate-300/50 dark:border-slate-600/50 shadow-inner group hover:bg-slate-300 dark:hover:bg-slate-600"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <div className="flex justify-between w-full px-1.5 absolute inset-0 items-center z-0">
                <Moon className="w-3.5 h-3.5 text-slate-400 dark:text-indigo-300 transition-colors" />
                <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-slate-500 transition-colors" />
              </div>
              <div
                className={`w-6 h-6 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-300 ease-out flex items-center justify-center z-10 ${
                  darkMode ? "translate-x-6" : "translate-x-0"
                }`}
              >
                {darkMode ? (
                  <Moon className="w-3 h-3 text-indigo-500" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-500" />
                )}
              </div>
            </button>

            {/* Auth Buttons: Log in & Sign up */}
            <div className="flex items-center gap-1.5">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3.5 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shadow-sm shadow-indigo-600/25 hover:shadow-md hover:shadow-indigo-600/35 hover:-translate-y-0.5 cursor-pointer"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-full transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-3xl p-5 flex flex-col space-y-2.5 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 hover:bg-white/90 dark:hover:bg-slate-800/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-none hover:shadow-2xs"
            >
              <Home className="w-4 h-4 text-indigo-500" /> Home
            </Link>
            <Link
              href="/#popular-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 hover:bg-white/90 dark:hover:bg-slate-800/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-none hover:shadow-2xs"
            >
              <Wrench className="w-4 h-4 text-indigo-500" /> Popular Tools
            </Link>
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> All Tools
            </Link>
            <Link
              href="/#why-rootixa"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 hover:bg-white/90 dark:hover:bg-slate-800/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-none hover:shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Why Rootixa
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 hover:bg-white/90 dark:hover:bg-slate-800/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-none hover:shadow-2xs"
            >
              <Star className="w-4 h-4 text-amber-500" /> FAQ
            </Link>
            <Link
              href="/feedback"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 hover:bg-white/90 dark:hover:bg-slate-800/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-none hover:shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-indigo-500" /> Feedback & Suggestions
            </Link>

            <div
              className="flex items-center justify-between px-4 py-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-700/80 transition-colors shadow-none hover:shadow-2xs"
              onClick={toggleDarkMode}
            >
              <span className="text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center gap-2">
                {darkMode ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}{" "}
                Theme Mode
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">
                {darkMode ? "Dark" : "Light"}
              </span>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          MAIN CONTENT AREA
      ============================================================ */}
      <main id="main-content" className="flex-grow">
        {/* ============================================================
            HERO / HEADER SECTION (SOFT, AIRY & GENTLE)
        ============================================================ */}
        <section
          aria-label="All Tools Header"
          className="relative pt-32 pb-10 md:pt-36 md:pb-12 overflow-hidden px-4"
        >
          {/* Gentle ambient background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[240px] bg-gradient-to-b from-indigo-50/80 via-purple-50/20 to-transparent dark:from-indigo-950/20 dark:via-transparent to-transparent rounded-full blur-[90px] -z-10 pointer-events-none" />

          <div className="max-w-2xl mx-auto text-center">
            {/* Friendly Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-3.5 border border-indigo-100/80 dark:border-indigo-900/60">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rootixa Free Utilities</span>
            </div>

            {/* Clean & Warm Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              All Online Tools
            </h1>

            {/* Soft, Friendly Subtitle */}
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2.5 max-w-md mx-auto leading-relaxed">
              Fast, simple, and privacy-conscious tools for your daily tasks.
            </p>

            {/* Clean Floating Search Bar */}
            <div className="relative max-w-lg mx-auto mt-6">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools (e.g. qr, wifi, photo, cv)..."
                aria-label="Search all tools"
                className="block w-full pl-11 pr-10 py-3.5 rounded-full border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm sm:text-base outline-none transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3.5 flex items-center p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Soft, Clean Category Chips (Single Row, No Clutter) */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              {[
                { id: "all", label: "All Tools" },
                { id: "qr", label: "QR & Barcode" },
                { id: "image", label: "Image Tools" },
                { id: "document", label: "Resume & CV" },
                { id: "ai", label: "AI Tools" },
                { id: "pdf", label: "PDF & Docs" },
                { id: "business", label: "Invoice & Bill" },
              ].map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-xs font-semibold"
                        : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Soft Active Filter Indicator */}
            {(searchQuery.trim() || activeCategory !== "all") && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <span>
                  {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"} found
                </span>
                <span>•</span>
                <button
                  onClick={resetAllFilters}
                  className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ============================================================
            TOOLS CATALOG (CLEAN, SOFT & SPACIOUS CARDS)
        ============================================================ */}
        <section aria-label="Tools Directory" className="pb-16 px-4">
          <div className="max-w-6xl mx-auto">
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredTools.map((tool) => {
                  const IconComp = tool.icon;
                  const pastelThemes = {
                    "qr-code": "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
                    "image-resizer": "bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400",
                    "cv-builder": "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
                    "bg-remover": "bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400",
                    "pdf-converter": "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400",
                    "invoice-generator": "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400",
                  };
                  const iconStyle = pastelThemes[tool.id] || "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400";

                  return (
                    <div
                      key={tool.id}
                      onClick={(e) => {
                        if (tool.isLive && !e.target.closest("a, button")) {
                          openTool(tool.name, tool.link);
                        }
                      }}
                      className={`group bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                        tool.isLive ? "cursor-pointer" : ""
                      }`}
                    >
                      <div>
                        {/* Card Top: Soft Pastel Icon + Soft Status Pill */}
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${iconStyle}`}
                          >
                            <IconComp className="w-6 h-6" />
                          </div>

                          {tool.isLive ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/70">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Ready to use
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              Coming soon
                            </span>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="mt-5">
                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {tool.name}
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2 line-clamp-2">
                            {tool.desc}
                          </p>

                          {/* AI Match Reason Badge (Gentle) */}
                          {tool.matchReason && searchQuery.trim() && (
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                              <span className="truncate">{tool.matchReason}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom: Clear & Effortless Action */}
                      <div className="mt-6 pt-2">
                        {tool.isLive ? (
                          <ToolLink
                            href={tool.link}
                            toolName={tool.name}
                            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md transition-all cursor-pointer"
                          >
                            <span>Open Tool</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </ToolLink>
                        ) : (
                          <div className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-slate-400 dark:text-slate-500 text-xs font-medium text-center">
                            In Development
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No tools found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We couldn&apos;t find any tool matching your search. Try different keywords.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}

            {/* Gentle Feedback Link */}
            <div className="mt-14 text-center">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Need a tool that isn&apos;t here yet?{" "}
                <Link
                  href="/feedback"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Suggest a tool</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            RESPONSIVE ADVERTISEMENT PLACEMENT
            Controlled min-height (80px) to max-height (100px).
            Clean, quiet, soft appearance.
        ============================================================ */}
        <section aria-label="Sponsored Advertisement" className="pb-10 px-4">
          <div className="max-w-3xl mx-auto">
            <div
              className="w-full min-h-[80px] max-h-[100px] rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/40 p-4 flex flex-col items-center justify-center text-center shadow-xs transition-colors"
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                Advertisement
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                Sponsor & Community Ad Placement Slot
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ============================================================
          FOOTER
      ============================================================ */}
      <footer className="bg-white dark:bg-[#090E17] border-t border-slate-200 dark:border-slate-800 pt-14 pb-8 px-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group cursor-pointer">
                <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-md">
                  <LayoutGrid className="w-4 h-4 text-white dark:text-slate-900" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
                </span>
              </Link>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 max-w-sm leading-relaxed">
                Free online tools for work, study and everyday tasks. Built for speed,
                simplicity, and privacy.
              </p>
            </div>

            {/* Tools Links */}
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Tools
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li>
                  <ToolLink
                    href="/qr-code"
                    toolName="QR & BAR Code Generator"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>QR Code Generator</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      Live
                    </span>
                  </ToolLink>
                </li>
                <li>
                  <Link
                    href="/tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Image Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    PDF Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    AI Tools
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Resources
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li>
                  <Link
                    href="/#popular-tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Popular Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools"
                    className="text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    All Tools
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Feedback & Suggestions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li>
                  <Link
                    href="/#main-content"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#main-content"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-400 text-center">
            <p>&copy; {new Date().getFullYear()} Rootixa. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <p>
                A product Of{" "}
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold tracking-wide">
                  SW-IT
                </span>
              </p>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <p className="flex items-center gap-1">
                Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for creators.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
