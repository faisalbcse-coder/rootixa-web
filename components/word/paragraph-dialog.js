"use client";

import React, { useState } from "react";
import { X, AlignLeft } from "lucide-react";

export function ParagraphDialog({
  isOpen,
  onClose,
  editor,
  initialAlign = "left",
  initialLineHeight = "1.65",
}) {
  const [align, setAlign] = useState(initialAlign);
  const [lineHeight, setLineHeight] = useState(initialLineHeight);
  const [indent, setIndent] = useState(0);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!editor) return;
    const chain = editor.chain().focus();
    chain.setTextAlign(align);
    chain.setLineHeight(lineHeight);
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
            <AlignLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Paragraph Options
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
          {/* General Section */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
              General
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Alignment:
                </label>
                <select
                  value={align}
                  onChange={(e) => setAlign(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="left">Left</option>
                  <option value="center">Centered</option>
                  <option value="right">Right</option>
                  <option value="justify">Justified</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Line Spacing:
                </label>
                <select
                  value={lineHeight}
                  onChange={(e) => setLineHeight(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="1.0">1.0 (Single)</option>
                  <option value="1.15">1.15</option>
                  <option value="1.5">1.5</option>
                  <option value="2.0">2.0 (Double)</option>
                  <option value="2.5">2.5</option>
                  <option value="3.0">3.0 (Triple)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Indentation Section */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-2">
              Indentation
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Left Indent:
                </label>
                <select
                  value={indent}
                  onChange={(e) => setIndent(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-indigo-500"
                >
                  <option value={0}>0 cm (None)</option>
                  <option value={1}>1.27 cm (0.5 in)</option>
                  <option value={2}>2.54 cm (1.0 in)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Preview:
            </label>
            <div
              className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg min-h-[60px] text-xs text-slate-700 dark:text-slate-300"
              style={{
                textAlign: align,
                lineHeight: lineHeight,
                paddingLeft: `${indent * 16 + 12}px`,
              }}
            >
              This is a paragraph preview showing your configured alignment, line spacing, and paragraph indentation settings in real time.
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
