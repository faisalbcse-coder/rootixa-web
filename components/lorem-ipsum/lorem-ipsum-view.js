"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutGrid,
  Moon,
  Sun,
  Copy,
  Check,
  RefreshCw,
  Download,
  Trash2,
  Sparkles,
  ArrowRight,
  FileText,
  AlignLeft,
  Type,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Heart,
  Home,
  Wrench,
  Star,
  MessageSquare,
  Menu,
  X,
} from "lucide-react";
import { generateLoremIpsum, downloadAsTxt } from "@/lib/lorem-ipsum/generator";

export function LoremIpsumView() {
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const savedTheme = localStorage.getItem("rootixa_theme");
      if (savedTheme) return savedTheme === "dark";
      return (
        window.matchMedia("(prefers-color-scheme: dark)").matches ||
        document.documentElement.classList.contains("dark")
      );
    } catch {
      return false;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Generator Options
  const [mode, setMode] = useState("paragraphs"); // 'paragraphs' | 'sentences' | 'words'
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [randomize, setRandomize] = useState(true);
  const [includeHeadings, setIncludeHeadings] = useState(false);

  // Generator Output
  const [generatedData, setGeneratedData] = useState(() => {
    return generateLoremIpsum({
      mode: "paragraphs",
      count: 3,
      startWithLorem: true,
      randomize: true,
      includeHeadings: false,
    });
  });

  // Action status states
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const copyTimeoutRef = useRef(null);

  // Sync Dark Mode with document element & handle scroll
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

  // Perform Generation
  const handleGenerate = useCallback(() => {
    setIsRegenerating(true);
    const result = generateLoremIpsum({
      mode,
      count,
      startWithLorem,
      randomize,
      includeHeadings: mode === "paragraphs" ? includeHeadings : false,
    });
    setGeneratedData(result);
    setTimeout(() => setIsRegenerating(false), 250);
  }, [mode, count, startWithLorem, randomize, includeHeadings]);

  // Handle Copy to Clipboard
  const handleCopy = async () => {
    if (!generatedData || !generatedData.rawText) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(generatedData.rawText);
      } else {
        // Fallback
        const textarea = document.createElement("textarea");
        textarea.value = generatedData.rawText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  // Handle Clear
  const handleClear = () => {
    setGeneratedData(null);
    setCopied(false);
  };

  // Handle Download .txt
  const handleDownload = () => {
    if (!generatedData || !generatedData.rawText) return;
    const filename = `lorem-ipsum-${mode}-${count}.txt`;
    downloadAsTxt(filename, generatedData.rawText);
  };

  // Stepper helper
  const handleQuantityChange = (newVal) => {
    const parsed = parseInt(newVal, 10);
    if (isNaN(parsed)) {
      setCount(1);
    } else {
      setCount(Math.max(1, Math.min(50, parsed)));
    }
  };

  const navLinkClass =
    "text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3.5 py-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all flex items-center gap-1.5";

  return (
    <div
      className={`min-h-screen font-sans flex flex-col transition-colors duration-300 ${
        darkMode ? "dark bg-[#090E17] text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* ============================================================
          1. HEADER / NAVBAR
      ============================================================ */}
      <header
        className={`w-full sticky z-40 transition-all duration-300 ${
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
            <Link href="/tools" className={navLinkClass}>
              <LayoutGrid className="w-3.5 h-3.5" /> All Tools
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

            {/* Back to All Tools CTA */}
            <Link
              href="/tools"
              className="bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center gap-1.5"
            >
              <span>Explore Tools</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#090E17]/95 backdrop-blur-xl px-6 py-5 shadow-xl transition-all">
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 py-2 border-b border-slate-100 dark:border-slate-800"
              >
                <Home className="w-4 h-4 text-indigo-500" /> Home
              </Link>
              <Link
                href="/tools"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 py-2 border-b border-slate-100 dark:border-slate-800"
              >
                <LayoutGrid className="w-4 h-4" /> All Tools
              </Link>
              <Link
                href="/feedback"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 py-2 border-b border-slate-100 dark:border-slate-800"
              >
                <MessageSquare className="w-4 h-4 text-emerald-500" /> Feedback
              </Link>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Dark Mode
                </span>
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================
          2. TOOL HERO / TITLE SECTION
      ============================================================ */}
      <main className="flex-1 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
          {/* Breadcrumbs */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6"
          >
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Tools
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-semibold">
              Lorem Ipsum Generator
            </span>
          </nav>

          {/* Header Banner */}
          <div className="mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/70 mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Independent Rootixa Utility</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Lorem Ipsum Generator
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Generate clean placeholder text for your designs, websites, documents, and projects.
            </p>
          </div>

          {/* ============================================================
              3. GENERATOR INTERFACE (TWO PANELS: SETTINGS & OUTPUT)
          ============================================================ */}
          <div className="space-y-8">
            {/* GENERATOR CONTROL PANEL */}
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.03)] backdrop-blur-sm">
              <div className="flex items-center gap-2.5 pb-5 mb-6 border-b border-slate-100 dark:border-slate-800/80">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Generator Settings
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Customize your placeholder text structure and quantity
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* 5. GENERATE BY: Paragraphs, Sentences, Words */}
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
                    Generate By
                  </label>
                  <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
                    {[
                      { id: "paragraphs", label: "Paragraphs", icon: AlignLeft },
                      { id: "sentences", label: "Sentences", icon: FileText },
                      { id: "words", label: "Words", icon: Type },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = mode === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMode(item.id)}
                          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            active
                              ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-slate-200/50 dark:shadow-slate-950/50"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. QUANTITY (1-50, default 3) */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label
                      htmlFor="quantity-input"
                      className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                      Quantity ({mode})
                    </label>
                    <span className="text-[11px] font-medium text-slate-400">
                      Range: 1 – 50
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Stepper Input */}
                    <div className="flex items-center flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-1">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(count - 1)}
                        disabled={count <= 1}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        id="quantity-input"
                        type="number"
                        min="1"
                        max="50"
                        value={count}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        className="w-full text-center font-bold text-base bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(count + 1)}
                        disabled={count >= 50}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Quick presets */}
                    <div className="flex items-center gap-1.5">
                      {[1, 3, 5, 10].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setCount(preset)}
                          className={`h-10 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            count === preset
                              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/70"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. OPTIONS TOGGLES */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Toggle 1: Start with "Lorem ipsum..." */}
                  <label
                    htmlFor="toggle-start-lorem"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                  >
                    <div className="pr-3">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Start with &ldquo;Lorem ipsum...&rdquo;
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        Traditional opening
                      </span>
                    </div>
                    <input
                      id="toggle-start-lorem"
                      type="checkbox"
                      checked={startWithLorem}
                      onChange={(e) => setStartWithLorem(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>

                  {/* Toggle 2: Randomize text */}
                  <label
                    htmlFor="toggle-randomize"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                  >
                    <div className="pr-3">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Randomize text
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        Natural variety in cadence
                      </span>
                    </div>
                    <input
                      id="toggle-randomize"
                      type="checkbox"
                      checked={randomize}
                      onChange={(e) => setRandomize(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer"
                    />
                  </label>

                  {/* Toggle 3: Include headings */}
                  <label
                    htmlFor="toggle-headings"
                    className={`flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 transition-all ${
                      mode !== "paragraphs"
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="pr-3">
                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        Include headings
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {mode === "paragraphs"
                          ? "Heading before paragraphs"
                          : "Only for paragraphs"}
                      </span>
                    </div>
                    <input
                      id="toggle-headings"
                      type="checkbox"
                      disabled={mode !== "paragraphs"}
                      checked={mode === "paragraphs" && includeHeadings}
                      onChange={(e) => setIncludeHeadings(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 accent-indigo-600 rounded cursor-pointer disabled:cursor-not-allowed"
                    />
                  </label>
                </div>
              </div>

              {/* 7. GENERATE BUTTON */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 hidden sm:block">
                  Generates immediately in your browser · Zero latency · Offline capable
                </p>
                <button
                  type="button"
                  id="generate-button"
                  onClick={handleGenerate}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-3 rounded-2xl text-sm font-bold transition-all duration-200 shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/45 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles
                    className={`w-4 h-4 ${isRegenerating ? "animate-spin" : ""}`}
                  />
                  <span>Generate Lorem Ipsum</span>
                </button>
              </div>
            </div>

            {/* ============================================================
                8. OUTPUT AREA
            ============================================================ */}
            <div className="bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden">
              {/* Output Top Bar: Actions & Stats */}
              <div className="p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/70 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* 12. WORD / CHARACTER COUNT */}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {generatedData?.stats ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {generatedData.stats.words}
                      </span>{" "}
                      words
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {generatedData.stats.characters}
                      </span>{" "}
                      characters
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {mode === "paragraphs"
                          ? `${generatedData.stats.paragraphs} paragraphs`
                          : mode === "sentences"
                          ? `${generatedData.stats.sentences} sentences`
                          : `${count} words`}
                      </span>
                    </div>
                  ) : (
                    <span>Output is cleared</span>
                  )}
                </div>

                {/* 9, 10, 11, 16, 17: ACTION BUTTONS (Copy, Regenerate, Download, Clear) */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Copy Button */}
                  <button
                    type="button"
                    id="copy-button"
                    onClick={handleCopy}
                    disabled={!generatedData || !generatedData.rawText}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      copied
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/25"
                    }`}
                    title="Copy generated Lorem Ipsum text to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Regenerate Button */}
                  <button
                    type="button"
                    id="regenerate-button"
                    onClick={handleGenerate}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all flex items-center gap-1.5 cursor-pointer"
                    title="Generate a fresh randomized version using same settings"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-indigo-600" : ""}`}
                    />
                    <span>Regenerate</span>
                  </button>

                  {/* Download .txt Button */}
                  <button
                    type="button"
                    id="download-button"
                    onClick={handleDownload}
                    disabled={!generatedData || !generatedData.rawText}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Download generated text as plain-text (.txt) file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .txt</span>
                  </button>

                  {/* Clear Button */}
                  <button
                    type="button"
                    id="clear-button"
                    onClick={handleClear}
                    disabled={!generatedData}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Clear generated output"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Output Content Area */}
              <div className="p-6 sm:p-8 min-h-[220px]">
                {generatedData && generatedData.items.length > 0 ? (
                  <div
                    id="lorem-output-container"
                    className="space-y-6 select-text text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base"
                  >
                    {generatedData.items.map((item, idx) => (
                      <div key={idx} className="group relative">
                        {/* 15. HEADINGS when Include headings = ON */}
                        {item.heading && (
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
                            {item.heading}
                          </h3>
                        )}
                        <p className="whitespace-pre-line">{item.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No placeholder text generated yet
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Choose your preferred options above and click &ldquo;Generate Lorem Ipsum&rdquo; to create instant dummy copy.
                    </p>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Generate now
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================
                18. TOOL INFO / SEO EDUCATIONAL GUIDE
            ============================================================ */}
            <div className="mt-12 bg-white dark:bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Info className="w-4 h-4" />
                <h2 className="text-xs font-extrabold uppercase tracking-wider">
                  About Lorem Ipsum & Rootixa Utility
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
                    What is Lorem Ipsum?
                  </h3>
                  <p>
                    Lorem Ipsum is standard dummy placeholder text used across typesetting,
                    web design, and graphic layouts. Derived from sections 1.10.32 and 1.10.33 of
                    Cicero&apos;s 45 BC treatise <em>&ldquo;De Finibus Bonorum et Malorum&rdquo;</em> (The
                    Extremes of Good and Evil), it has stood as the printing industry&apos;s benchmark
                    since the 1500s.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">
                    Why use placeholder text?
                  </h3>
                  <p>
                    When presenting visual mockups, human eyes naturally try to read intelligible
                    English, diverting attention from typography, spacing, and UI hierarchy. Lorem
                    Ipsum mimics the natural letter distribution and word cadence of standard English
                    without distracting the viewer with readable copy.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  100% Client-Side Generation (Private & Fast)
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Zero Network Latency
                </span>
                <span className="flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-500" />
                  Instant Clean .txt Export
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
          20. ROOTIXA FOOTER (CONSISTENT WITH PLATFORM)
      ============================================================ */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#090E17] py-12 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
                </span>
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                Free online tools for work, study, and everyday tasks. Fast, clean, and private
                digital utilities right in your browser.
              </p>
            </div>

            {/* Quick Tool Links */}
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Tools
              </h4>
              <ul className="space-y-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <li>
                  <Link
                    href="/lorem-ipsum"
                    className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1.5"
                  >
                    <span>Lorem Ipsum Generator</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      Live
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/qr-code"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>QR Code Generator</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    All Tools Directory
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

            {/* Platform & Legal */}
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-xs uppercase tracking-wider">
                Platform
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
                    href="/#why-rootixa"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Why Rootixa
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#faq"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Frequently Asked Questions
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
