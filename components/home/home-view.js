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
  Users,
  ArrowRight,
  FileText,
  ImagePlus,
  Zap,
  QrCode,
  Archive,
  Calculator,
  LayoutGrid,
  Heart,
  Sparkles,
  Command,
  Home,
  Wrench,
  ChevronDown,
  MessageSquare,
  ShieldCheck,
  Globe,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

// Canonical Tools Data
const CANONICAL_TOOLS = [
  {
    id: "qr-code",
    name: "QR & BAR Code Generator",
    desc: "Create custom, trackable QR and Bar codes with premium brand logos and custom styling.",
    category: "QR & Barcode",
    categoryId: "qr",
    icon: QrCode,
    iconColor: "text-slate-700 dark:text-slate-300",
    badge: "Live & Free",
    isLive: true,
    link: "/qr-code",
    users: "2.1M",
    rating: 4.9,
    featured: true,
  },
  {
    id: "image-resizer",
    name: "Image Resizer & Crop",
    desc: "Resize, crop, and optimize images for any social media platform effortlessly.",
    category: "Image Tools",
    categoryId: "image",
    icon: ImagePlus,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    badge: "In Development",
    isLive: false,
    link: "#popular-tools",
    users: "3.2M",
    rating: 4.9,
    featured: true,
  },
  {
    id: "cv-builder",
    name: "Pro CV Builder",
    desc: "Build professional, ATS-friendly resumes in minutes to land your dream job.",
    category: "Document Tools",
    categoryId: "document",
    icon: FileText,
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "In Development",
    isLive: false,
    link: "#popular-tools",
    users: "1.5M",
    rating: 4.8,
    featured: true,
  },
  {
    id: "bg-remover",
    name: "AI Background Remover & Enhancer",
    desc: "Extract subjects and enhance photo quality using advanced AI in 1 click.",
    category: "AI Tools",
    categoryId: "ai",
    icon: Sparkles,
    iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
    badge: "In Development",
    isLive: false,
    link: "#popular-tools",
    users: "850K",
    rating: 4.9,
    featured: false,
  },
  {
    id: "pdf-converter",
    name: "Image & PDF Converter",
    desc: "Convert images to PDF or extract images from PDF documents seamlessly.",
    category: "PDF Tools",
    categoryId: "pdf",
    icon: Archive,
    iconColor: "text-violet-600 dark:text-violet-400",
    badge: "In Development",
    isLive: false,
    link: "#popular-tools",
    users: "4.1M",
    rating: 4.7,
    featured: false,
  },
  {
    id: "invoice-generator",
    name: "Invoice Generator",
    desc: "Generate professional invoices and receipts on the go for your clients.",
    category: "Business Tools",
    categoryId: "business",
    icon: Calculator,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    badge: "In Development",
    isLive: false,
    link: "#popular-tools",
    users: "920K",
    rating: 4.8,
    featured: false,
  },
];

// Categories Catalog
const CATEGORIES = [
  { id: "all", name: "All Tools", count: "6 Tools", icon: LayoutGrid },
  { id: "pdf", name: "PDF Tools", count: "Merge & Convert", icon: Archive },
  { id: "image", name: "Image Tools", count: "Resize & Crop", icon: ImagePlus },
  { id: "qr", name: "QR & Barcode", count: "Custom Codes", icon: QrCode },
  { id: "ai", name: "AI Tools", count: "Photo & Text", icon: Sparkles },
  { id: "document", name: "Document Tools", count: "Resumes & Files", icon: FileText },
  { id: "business", name: "Business Tools", count: "Invoicing", icon: Calculator },
  { id: "converters", name: "Converters", count: "Format Tools", icon: SlidersHorizontal },
];

// FAQ items
const FAQ_ITEMS = [
  {
    id: "faq-1",
    question: "What is Rootixa?",
    answer:
      "Rootixa is an online platform that brings useful digital tools together in one simple workspace.",
  },
  {
    id: "faq-2",
    question: "Are Rootixa tools free?",
    answer:
      "Many Rootixa tools are available to use for free. Availability may vary by tool.",
  },
  {
    id: "faq-3",
    question: "Do I need to install software?",
    answer:
      "No. Rootixa's online tools are designed to work directly in a web browser.",
  },
  {
    id: "faq-4",
    question: "Can I use Rootixa on mobile?",
    answer:
      "Yes. The homepage and tools should provide a responsive experience across modern mobile, tablet and desktop devices.",
  },
  {
    id: "faq-5",
    question: "What types of tools are available on Rootixa?",
    answer:
      "Rootixa provides tools for PDFs, images, QR codes, documents, AI, conversions and other everyday digital tasks.",
  },
];

export function HomeView() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState("faq-1");
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
  const searchInputRef = useRef(null);

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
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.desc.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [searchQuery, activeCategory]);

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    const target = document.getElementById("popular-tools");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
    const heroSection = document.getElementById("hero-search");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinkClass =
    "relative px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700/80 rounded-full transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-none hover:shadow-2xs";

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

          {/* Desktop Nav Links (Menu Section) */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/70 shadow-2xs backdrop-blur-xs">
            <Link href="/" className={navLinkClass}>
              <Home className="w-3.5 h-3.5 text-indigo-500" /> Home
            </Link>
            <a href="#popular-tools" className={navLinkClass}>
              <Wrench className="w-3.5 h-3.5" /> Popular Tools
            </a>
            <a href="#why-rootixa" className={navLinkClass}>
              <ShieldCheck className="w-3.5 h-3.5" /> Why Rootixa
            </a>
            <a href="#faq" className={navLinkClass}>
              <Star className="w-3.5 h-3.5 text-amber-500" /> FAQ
            </a>
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
            <a
              href="#popular-tools"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 hover:bg-white/90 dark:hover:bg-slate-800/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-none hover:shadow-2xs"
            >
              <Wrench className="w-4 h-4 text-indigo-500" /> Popular Tools
            </a>
            <a
              href="#why-rootixa"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 hover:bg-white/90 dark:hover:bg-slate-800/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-none hover:shadow-2xs"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" /> Why Rootixa
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-800 dark:text-slate-200 font-bold hover:text-indigo-600 hover:bg-white/90 dark:hover:bg-slate-800/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors shadow-none hover:shadow-2xs"
            >
              <Star className="w-4 h-4 text-amber-500" /> FAQ
            </a>
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
            1. HERO SECTION
        ============================================================ */}
        <section
          aria-label="Hero Section"
          className="relative pt-32 pb-16 md:pt-44 md:pb-20 overflow-hidden px-4"
        >
          {/* Subtle geometric background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:32px_32px] -z-20 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[450px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-[90px] -z-10 pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 text-xs font-semibold mb-6 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Free Online Tools • Simple, Fast & Accessible</span>
            </div>

            {/* Exactly ONE primary H1 */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 leading-[1.15]">
              Free Online Tools for Work, Study & Everyday Tasks
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed font-normal">
              Rootixa brings useful online tools for PDFs, images, QR codes, documents, AI
              and everyday digital tasks into one simple workspace.
            </p>

            {/* Prominent Global Tool Search Field */}
            <div id="hero-search" className="relative max-w-2xl mx-auto group mb-6">
              <div className="absolute inset-y-0 left-4 sm:left-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a tool..."
                aria-label="Search for a tool"
                className="block w-full pl-12 sm:pl-14 pr-24 sm:pr-28 py-4 sm:py-4.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/90 shadow-lg shadow-slate-200/40 dark:shadow-black/20 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 text-base sm:text-lg outline-none transition-all placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
              />
              <div className="absolute inset-y-2 right-2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors mr-1"
                    aria-label="Clear search query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                  <Command className="w-3 h-3" /> K
                </div>
                <a
                  href="#popular-tools"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs"
                >
                  Find
                </a>
              </div>
            </div>

            {/* Hero Quick Category Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="text-slate-400 dark:text-slate-500 text-xs mr-1">
                Popular Categories:
              </span>
              {[
                { name: "PDF Tools", id: "pdf" },
                { name: "Image Tools", id: "image" },
                { name: "QR & Barcode", id: "qr" },
                { name: "AI Tools", id: "ai" },
                { name: "Document Tools", id: "document" },
                { name: "Business Tools", id: "business" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>


        {/* ============================================================
            3. EXACTLY ONE RESPONSIVE ADVERTISEMENT PLACEMENT
            Strictly placed after Popular Categories and before Popular Tools.
            Controlled min-height (90px) to max-height (110px).
            Zero layout shift (CLS). Clean natural look when empty.
        ============================================================ */}
        <section aria-label="Sponsored Advertisement" className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className="w-full min-h-[90px] max-h-[110px] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/40 p-4 flex flex-col items-center justify-center text-center shadow-xs transition-colors"
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

        {/* ============================================================
            4. POPULAR FREE ONLINE TOOLS SECTION
        ============================================================ */}
        <section
          id="popular-tools"
          aria-labelledby="popular-tools-heading"
          className="py-12 px-4"
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h2
                  id="popular-tools-heading"
                  className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
                >
                  Popular Free Online Tools
                </h2>
                <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Quickly access some of the most useful tools on Rootixa.
                </p>
              </div>

              {/* View All Tools action */}
              <div className="flex items-center gap-3">
                {activeCategory !== "all" && (
                  <button
                    onClick={() => setActiveCategory("all")}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
                  >
                    Clear category filter
                  </button>
                )}
                <a
                  href="#popular-tools"
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-3.5 py-2 rounded-xl transition-colors"
                >
                  <span>View All Tools</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Filter Active Indicator */}
            {(searchQuery.trim() || activeCategory !== "all") && (
              <div className="mb-6 flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-300">
                <span>
                  Showing <strong>{filteredTools.length}</strong> matching tools
                  {searchQuery && (
                    <span>
                      {" "}
                      for &ldquo;<strong>{searchQuery}</strong>&rdquo;
                    </span>
                  )}
                </span>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Tools Grid */}
            {filteredTools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => {
                  const IconComp = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      className="group bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40 transition-all">
                            <IconComp className={`w-6 h-6 ${tool.iconColor}`} />
                          </div>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                              tool.isLive
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {tool.badge}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {tool.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                          {tool.desc}
                        </p>
                      </div>

                      <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {tool.users}
                          </span>
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" /> {tool.rating}
                          </span>
                        </div>

                        {tool.isLive ? (
                          <Link
                            href={tool.link}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs group-hover:shadow-indigo-600/30"
                          >
                            <span>Open Tool</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/60 px-2.5 py-1 rounded-lg">
                            Coming Soon
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No tools found matching your search.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </section>


        {/* ============================================================
            6. FEATURED TOOLS SECTION
        ============================================================ */}
        <section aria-labelledby="featured-tools-heading" className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2
                id="featured-tools-heading"
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Featured Tools
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Highlighted utilities optimized for speed, precision, and privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CANONICAL_TOOLS.filter((t) => t.featured).map((tool) => {
                const IconComp = tool.icon;
                return (
                  <div
                    key={`featured-${tool.id}`}
                    className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          {tool.category}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            tool.isLive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                          }`}
                        >
                          {tool.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {tool.desc}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60">
                      {tool.isLive ? (
                        <Link
                          href={tool.link}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800"
                        >
                          <span>Launch Tool</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          Scheduled for Release
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================
            7. WHY USE ROOTIXA? SECTION
        ============================================================ */}
        <section
          id="why-rootixa"
          aria-labelledby="why-rootixa-heading"
          className="py-16 px-4 bg-slate-50/70 dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-800/60"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2
                id="why-rootixa-heading"
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Why Use Rootixa?
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Built from the ground up for speed, simplicity, and user respect.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Benefit 1: Fast */}
              <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  Fast
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Get everyday digital tasks done quickly.
                </p>
              </div>

              {/* Benefit 2: Simple */}
              <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  Simple
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Easy-to-use tools without unnecessary complexity.
                </p>
              </div>

              {/* Benefit 3: Accessible */}
              <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  Accessible
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Use Rootixa directly from your browser across devices.
                </p>
              </div>

              {/* Benefit 4: Privacy-Focused */}
              <div className="bg-white dark:bg-slate-800/90 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  Privacy-Focused
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Keep the experience simple and respectful of user privacy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            8. SEO CONTENT NARRATIVE SECTION
        ============================================================ */}
        <section
          aria-labelledby="seo-narrative-heading"
          className="py-14 px-4 border-b border-slate-200/60 dark:border-slate-800/60"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2
              id="seo-narrative-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4"
            >
              Your Everyday Digital Tools, All in One Place
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Rootixa is an online collection of useful digital tools designed to make everyday
              tasks faster and easier. From PDF tools and image utilities to QR code generators,
              document tools, AI utilities and online converters, Rootixa brings essential tools
              together in one simple workspace. Whether you are working, studying, creating
              content or handling everyday digital tasks, Rootixa helps you get things done
              directly from your browser.
            </p>
          </div>
        </section>

        {/* ============================================================
            9. FREQUENTLY ASKED QUESTIONS (FAQ) SECTION
        ============================================================ */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          className="py-16 px-4 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/60"
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2
                id="faq-heading"
                className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
              >
                Frequently Asked Questions
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Common questions about using Rootixa tools directly in your browser.
              </p>
            </div>

            <div className="space-y-3">
              {FAQ_ITEMS.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200/80 dark:border-slate-700/80 rounded-2xl bg-white dark:bg-slate-800/90 overflow-hidden shadow-xs"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? "" : faq.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-indigo-600 dark:text-indigo-400" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================
            10. FINAL CTA SECTION
        ============================================================ */}
        <section aria-labelledby="final-cta-heading" className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              id="final-cta-heading"
              className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2"
            >
              Find the Right Tool for Your Task
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">
              Search Rootixa and get started in seconds.
            </p>
            <button
              onClick={handleFocusSearch}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-full font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Explore All Tools</span>
            </button>
          </div>
        </section>

        {/* ============================================================
            11. PRESERVED COMMUNITY FEEDBACK SECTION
        ============================================================ */}
        <section className="py-12 px-4 bg-gradient-to-b from-transparent via-indigo-50/40 to-violet-50/30 dark:from-transparent dark:via-indigo-950/20 dark:to-slate-900/40 border-t border-slate-200/60 dark:border-slate-800/80">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="max-w-lg text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold mb-2.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>We Build What You Need</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2">
                  Have Ideas, Need a Tool, or Found a Glitch?
                </h3>
                <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed">
                  Rootixa evolves through community voice. Suggest new converters, utilities, or workflows directly to the team.
                </p>
              </div>
              <Link
                href="/feedback"
                className="px-6 py-3 bg-white text-indigo-700 hover:bg-slate-100 rounded-2xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Submit Feedback
              </Link>
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
              <div className="flex items-center gap-2.5 mb-4 group cursor-pointer">
                <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-md">
                  <LayoutGrid className="w-4 h-4 text-white dark:text-slate-900" />
                </div>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Rootixa<span className="text-indigo-600 dark:text-indigo-400">.</span>
                </span>
              </div>
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
                  <Link
                    href="/qr-code"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                  >
                    <span>QR Code Generator</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                      Live
                    </span>
                  </Link>
                </li>
                <li>
                  <a
                    href="#popular-tools"
                    onClick={() => handleCategorySelect("image")}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Image Tools
                  </a>
                </li>
                <li>
                  <a
                    href="#popular-tools"
                    onClick={() => handleCategorySelect("pdf")}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    PDF Tools
                  </a>
                </li>
                <li>
                  <a
                    href="#popular-tools"
                    onClick={() => handleCategorySelect("ai")}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    AI Tools
                  </a>
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
                  <a
                    href="#popular-tools"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Popular Tools
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    FAQ
                  </a>
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
                  <a
                    href="#main-content"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#main-content"
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    Terms of Service
                  </a>
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
