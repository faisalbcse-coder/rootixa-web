"use client";

import React, { useState } from "react";
import { X, Type } from "lucide-react";

export function FontDialog({
  isOpen,
  onClose,
  editor,
  initialFontFamily = "Arial, sans-serif",
  initialFontSize = "16px",
  initialColor = "#1e293b",
}) {
  const [family, setFamily] = useState(initialFontFamily);
  const [size, setSize] = useState(initialFontSize);
  const [isBold, setIsBold] = useState(editor ? editor.isActive("bold") : false);
  const [isItalic, setIsItalic] = useState(editor ? editor.isActive("italic") : false);
  const [isUnderline, setIsUnderline] = useState(editor ? editor.isActive("underline") : false);
  const [isStrike, setIsStrike] = useState(editor ? editor.isActive("strike") : false);
  const [color, setColor] = useState(initialColor);

  if (!isOpen) return null;

  const FONT_FAMILIES = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Calibri", value: "Calibri, Candara, Segoe, 'Segoe UI', sans-serif" },
    { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Courier New", value: "'Courier New', Courier, monospace" },
  ];

  const FONT_SIZES = ["9px", "10px", "11px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "36px", "48px", "72px"];

  const handleApply = () => {
    if (!editor) return;
    const chain = editor.chain().focus();

    chain.setFontFamily(family);
    chain.setFontSize(size);
    chain.setColor(color);

    if (isBold && !editor.isActive("bold")) chain.setBold();
    if (!isBold && editor.isActive("bold")) chain.unsetBold();

    if (isItalic && !editor.isActive("italic")) chain.setItalic();
    if (!isItalic && editor.isActive("italic")) chain.unsetItalic();

    if (isUnderline && !editor.isActive("underline")) chain.setUnderline();
    if (!isUnderline && editor.isActive("underline")) chain.unsetUnderline();

    if (isStrike && !editor.isActive("strike")) chain.setStrike();
    if (!isStrike && editor.isActive("strike")) chain.unsetStrike();

    chain.run();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Title Bar */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Font Options
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-xs">
          {/* Family & Size Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Font:
              </label>
              <select
                value={family}
                onChange={(e) => setFamily(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Size:
              </label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
              >
                {FONT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Style Checkboxes */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Font Style & Effects:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="font-bold">Bold</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isItalic}
                  onChange={(e) => setIsItalic(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="italic">Italic</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUnderline}
                  onChange={(e) => setIsUnderline(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="underline">Underline</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStrike}
                  onChange={(e) => setIsStrike(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="line-through">Strikethrough</span>
              </label>
            </div>
          </div>

          {/* Font Color */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Font Color:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 cursor-pointer p-0.5 bg-transparent"
              />
              <span className="text-slate-500 font-mono text-[11px]">{color}</span>
            </div>
          </div>

          {/* Live Preview Pane */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Preview:
            </label>
            <div
              className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg min-h-[55px] flex items-center justify-center text-center overflow-hidden"
              style={{
                fontFamily: family,
                fontSize: size,
                color: color,
                fontWeight: isBold ? "bold" : "normal",
                fontStyle: isItalic ? "italic" : "normal",
                textDecoration: `${isUnderline ? "underline " : ""}${isStrike ? "line-through" : ""}`.trim() || "none",
              }}
            >
              The quick brown fox jumps over the lazy dog.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
