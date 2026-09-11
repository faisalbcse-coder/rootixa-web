"use client";

import { useState, useRef } from "react";
import {
  Type,
  Palette,
  Layout,
  Sliders,
  Sparkles,
  RotateCcw,
  Upload,
  Trash2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlertCircle,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  CURATED_FONTS,
  COLOR_PRESETS,
  DESIGN_PRESETS,
  DEFAULT_DESIGN,
} from "@/lib/cv/cv-types";

export function CustomizationPanel({
  design = DEFAULT_DESIGN,
  updateDesign,
  applyDesignPreset,
  resetDesign,
  updatePhoto,
  removePhoto,
}) {
  const [openGroups, setOpenGroups] = useState({
    presets: true,
    typography: true,
    fontSizes: false,
    colors: true,
    spacing: false,
    layout: false,
    photo: false,
  });

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ─── Color Contrast Safety Check ───
  const isLowContrast = (hex) => {
    if (!hex || typeof hex !== "string" || !hex.startsWith("#")) return false;
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return false;
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    // Relative luminance approximation
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 0.78; // Very bright colors on white paper
  };

  // ─── Photo Upload Handler ───
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setPhotoError("Please select a valid image (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result;
      if (dataUrl && typeof dataUrl === "string") {
        updatePhoto({
          url: dataUrl,
          enabled: true,
        });
      }
    };
    reader.onerror = () => {
      setPhotoError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3 pb-8">
      {/* ══════════════════════════════════════════════════════════
          1. QUICK DESIGN PRESETS
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("presets")}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Design Presets</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openGroups.presets ? "rotate-180" : ""
            }`}
          />
        </button>

        {openGroups.presets && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              One-click aesthetic styles. Presets only alter visual design tokens, keeping all your content intact.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(DESIGN_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyDesignPreset(key)}
                  className="p-2.5 rounded-xl border text-left transition hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {preset.name}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: preset.design.colors.accent }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          2. TYPOGRAPHY (FONT SELECTION)
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("typography")}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Type className="w-4 h-4 text-indigo-500" />
            <span>Typography & Fonts</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openGroups.typography ? "rotate-180" : ""
            }`}
          />
        </button>

        {openGroups.typography && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {CURATED_FONTS.map((font) => {
                const isSelected = design.fontFamily === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => updateDesign("fontFamily", font.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium" style={{ fontFamily: font.css }}>
                        {font.name}
                      </div>
                      <div className="text-[9px] text-slate-400 dark:text-slate-500">{font.category}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          3. FONT SIZES & SCALE
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("fontSizes")}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Sliders className="w-4 h-4 text-violet-500" />
            <span>Font Sizes & Hierarchy</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openGroups.fontSizes ? "rotate-180" : ""
            }`}
          />
        </button>

        {openGroups.fontSizes && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Name Size</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.fontSize?.name || 28}px
                </span>
              </div>
              <input
                type="range"
                min="22"
                max="40"
                step="1"
                value={design.fontSize?.name || 28}
                onChange={(e) => updateDesign("fontSize", "name", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Professional Title */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Professional Title</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.fontSize?.title || 14}px
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="20"
                step="0.5"
                value={design.fontSize?.title || 14}
                onChange={(e) => updateDesign("fontSize", "title", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Section Headings */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Section Headings</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.fontSize?.sectionHeading || 13}px
                </span>
              </div>
              <input
                type="range"
                min="9"
                max="18"
                step="0.5"
                value={design.fontSize?.sectionHeading || 13}
                onChange={(e) => updateDesign("fontSize", "sectionHeading", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Body Text */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Body / Descriptions</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.fontSize?.body || 10}px
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="14"
                step="0.5"
                value={design.fontSize?.body || 10}
                onChange={(e) => updateDesign("fontSize", "body", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Metadata (Dates, locations) */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Metadata (Dates / Links)</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.fontSize?.metadata || 9}px
                </span>
              </div>
              <input
                type="range"
                min="7"
                max="12"
                step="0.5"
                value={design.fontSize?.metadata || 9}
                onChange={(e) => updateDesign("fontSize", "metadata", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          4. COLORS & ACCENTS
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("colors")}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Palette className="w-4 h-4 text-emerald-500" />
            <span>Accent Colors</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openGroups.colors ? "rotate-180" : ""
            }`}
          />
        </button>

        {openGroups.colors && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            {/* Color Palette Presets */}
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((color) => {
                const isSelected = design.colors?.accent === color.hex;
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => updateDesign("colors", "accent", color.hex)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      isSelected
                        ? "border-slate-900 dark:border-white shadow-xs scale-105"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-slate-700 dark:text-slate-300">{color.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="pt-2 flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Custom Color:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={design.colors?.accent || "#4f46e5"}
                  onChange={(e) => updateDesign("colors", "accent", e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={design.colors?.accent || "#4f46e5"}
                  onChange={(e) => updateDesign("colors", "accent", e.target.value)}
                  maxLength={7}
                  className="w-20 px-2 py-1 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            {/* Contrast Warning */}
            {isLowContrast(design.colors?.accent) && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>This color is very light and may have low contrast on white paper.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          5. SPACING & LINE HEIGHT
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("spacing")}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Layout className="w-4 h-4 text-cyan-500" />
            <span>Spacing & Line Height</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openGroups.spacing ? "rotate-180" : ""
            }`}
          />
        </button>

        {openGroups.spacing && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {/* Line Height */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Line Height</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.lineHeight || 1.45}
                </span>
              </div>
              <input
                type="range"
                min="1.1"
                max="2.0"
                step="0.05"
                value={design.lineHeight || 1.45}
                onChange={(e) => updateDesign("lineHeight", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Section Spacing */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Section Gap</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.spacing?.section || 18}px
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="32"
                step="1"
                value={design.spacing?.section || 18}
                onChange={(e) => updateDesign("spacing", "section", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Entry Spacing */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Entry / Item Gap</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.spacing?.item || 10}px
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="20"
                step="1"
                value={design.spacing?.item || 10}
                onChange={(e) => updateDesign("spacing", "item", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Paragraph Spacing */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-semibold text-slate-700 dark:text-slate-300">
                <span>Paragraph / Bullet Gap</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {design.spacing?.paragraph || 6}px
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="14"
                step="1"
                value={design.spacing?.paragraph || 6}
                onChange={(e) => updateDesign("spacing", "paragraph", Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          6. LAYOUT, MARGINS & DENSITY
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("layout")}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Layout className="w-4 h-4 text-blue-500" />
            <span>Layout & Margins</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openGroups.layout ? "rotate-180" : ""
            }`}
          />
        </button>

        {openGroups.layout && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {/* Page Margins */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Page Margins
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "compact", label: "Compact", px: 36 },
                  { id: "normal", label: "Normal", px: 48 },
                  { id: "spacious", label: "Spacious", px: 60 },
                ].map((m) => {
                  const isSelected = (design.layout?.pageMargin || 48) === m.px;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        updateDesign("layout", "pageMargin", m.px);
                        updateDesign("layout", "marginPreset", m.id);
                      }}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {m.label} ({m.px}px)
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Header Alignment (Template-aware) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Header Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "left", label: "Left", icon: AlignLeft },
                  { id: "center", label: "Center", icon: AlignCenter },
                  { id: "right", label: "Right", icon: AlignRight },
                ].map((a) => {
                  const isSelected = (design.layout?.headerAlignment || "left") === a.id;
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => updateDesign("layout", "headerAlignment", a.id)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          7. PROFILE PHOTO
      ══════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("photo")}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <ImageIcon className="w-4 h-4 text-pink-500" />
            <span>Profile Photo</span>
            {design.photo?.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              openGroups.photo ? "rotate-180" : ""
            }`}
          />
        </button>

        {openGroups.photo && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Photo preview or upload prompt */}
            {design.photo?.url ? (
              <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850">
                <img
                  src={design.photo.url}
                  alt="Profile Preview"
                  className={`w-16 h-16 object-cover border-2 shadow-xs ${
                    design.photo.shape === "circle"
                      ? "rounded-full"
                      : design.photo.shape === "rounded"
                      ? "rounded-2xl"
                      : "rounded-none"
                  }`}
                  style={{ borderColor: design.colors?.accent || "#4f46e5" }}
                />

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(design.photo?.enabled)}
                        onChange={(e) => updatePhoto({ enabled: e.target.checked })}
                        className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Show in CV</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-800/40 group"
              >
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 mx-auto mb-2 transition" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Upload Profile Photo
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  JPG, PNG, or WebP up to 5MB. Stored locally in your browser.
                </p>
              </div>
            )}

            {photoError && (
              <div className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Shape selection */}
            {design.photo?.url && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Photo Shape
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "circle", label: "Circle" },
                    { id: "rounded", label: "Rounded" },
                    { id: "square", label: "Square" },
                  ].map((s) => {
                    const isSelected = (design.photo?.shape || "circle") === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => updatePhoto({ shape: s.id })}
                        className={`py-1.5 px-2 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          8. RESET DESIGN (SAFE — DOES NOT DELETE CONTENT)
      ══════════════════════════════════════════════════════════ */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowConfirmReset(true)}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Styling to Default</span>
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
              Reset Styling to Default?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              This will restore the default fonts, spacing, margins, and colors. Your CV content, entries, and text will <strong className="text-slate-900 dark:text-white font-bold">NOT</strong> be deleted.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDesign();
                  setShowConfirmReset(false);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition cursor-pointer"
              >
                Reset Styling
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
