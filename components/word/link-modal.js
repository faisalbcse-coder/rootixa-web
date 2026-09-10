"use client";

import React, { useState, useEffect, useRef } from "react";
import { Link as LinkIcon, X, ExternalLink } from "lucide-react";

export function LinkModal({ isOpen, initialText = "", initialUrl = "", onSave, onClose }) {
  if (!isOpen) return null;
  return (
    <LinkModalDialog
      key={`${initialText}-${initialUrl}`}
      initialText={initialText}
      initialUrl={initialUrl}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

function LinkModalDialog({ initialText, initialUrl, onSave, onClose }) {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Please enter a valid URL.");
      return;
    }
    if (!/^https?:\/\//i.test(trimmedUrl) && !trimmedUrl.startsWith("/")) {
      trimmedUrl = "https://" + trimmedUrl;
    }
    onSave({ text: text.trim() || trimmedUrl, url: trimmedUrl });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-modal-title"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 transform animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <LinkIcon className="w-4 h-4" />
            </div>
            <span id="link-modal-title">Insert Hyperlink</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Text to display
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Visit Rootixa"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Link address (URL) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError("");
                }}
                placeholder="https://example.com"
                className={`w-full px-3.5 py-2 pr-8 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white outline-none transition ${
                  error
                    ? "border-rose-500 focus:border-rose-600"
                    : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                }`}
              />
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
            {error && <p className="text-[11px] text-rose-500 font-medium mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs shadow-indigo-600/30 transition cursor-pointer"
            >
              Apply Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
