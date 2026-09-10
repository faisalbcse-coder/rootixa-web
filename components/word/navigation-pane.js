"use client";

import React, { useState } from "react";
import {
  Search,
  ListTree,
  FileText,
  X,
  ChevronRight,
  File,
} from "lucide-react";

export function NavigationPane({
  isOpen,
  onClose,
  editor,
  totalPages = 1,
  currentPage = 1,
  onJumpToPage,
}) {
  const [navTab, setNavTab] = useState("headings"); // "headings" | "pages" | "search"
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // Extract headings from editor content
  const headings = [];
  if (editor) {
    const json = editor.getJSON();
    if (json.content) {
      json.content.forEach((node, index) => {
        if (node.type === "heading" && node.attrs?.level) {
          const text = node.content?.map((c) => c.text).join("") || "";
          if (text.trim()) {
            headings.push({
              level: node.attrs.level,
              text,
              index,
            });
          }
        }
      });
    }
  }

  // Scroll to a heading in the editor
  const handleHeadingClick = (headingText) => {
    if (!editor) return;
    const dom = editor.view.dom;
    const headingElements = dom.querySelectorAll("h1, h2, h3");
    for (const el of headingElements) {
      if (el.textContent?.trim() === headingText.trim()) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-indigo-100/60");
        setTimeout(() => {
          el.classList.remove("bg-indigo-100/60");
        }, 1200);
        break;
      }
    }
  };

  return (
    <aside className="rootixa-nav-pane h-full border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-20 no-print">
      {/* Pane Title Bar */}
      <div className="h-9 px-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <ListTree className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          Navigation
        </span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          title="Close Navigation Pane"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 pt-1 gap-1 text-[11px] font-semibold">
        <button
          onClick={() => setNavTab("headings")}
          className={`px-2.5 py-1.5 border-b-2 transition cursor-pointer flex items-center gap-1 ${
            navTab === "headings"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <ListTree className="w-3 h-3" />
          Headings
        </button>
        <button
          onClick={() => setNavTab("pages")}
          className={`px-2.5 py-1.5 border-b-2 transition cursor-pointer flex items-center gap-1 ${
            navTab === "pages"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <File className="w-3 h-3" />
          Pages
        </button>
        <button
          onClick={() => setNavTab("search")}
          className={`px-2.5 py-1.5 border-b-2 transition cursor-pointer flex items-center gap-1 ${
            navTab === "search"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Search className="w-3 h-3" />
          Search
        </button>
      </div>

      {/* Pane Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {/* 1. HEADINGS TAB */}
        {navTab === "headings" && (
          <div>
            {headings.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="font-medium">No headings found</p>
                <p className="text-[11px] mt-1 text-slate-400 dark:text-slate-500">
                  Add Headings (Heading 1, 2, 3) from the Home tab to build your document outline.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {headings.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => handleHeadingClick(h.text)}
                    style={{ paddingLeft: `${(h.level - 1) * 12 + 8}px` }}
                    className="w-full text-left py-1 px-2 rounded text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 transition truncate flex items-center gap-1.5 group cursor-pointer"
                    title={`Jump to: ${h.text}`}
                  >
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                    <span className={h.level === 1 ? "font-bold" : h.level === 2 ? "font-medium" : "font-normal"}>
                      {h.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. PAGES TAB */}
        {navTab === "pages" && (
          <div className="grid grid-cols-2 gap-2 p-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => onJumpToPage?.(pNum)}
                className={`p-2 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-1 ${
                  currentPage === pNum
                    ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300"
                }`}
                title={`Jump to Page ${pNum}`}
              >
                <div className="w-12 h-16 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 shadow-2xs flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-400">P.{pNum}</span>
                </div>
                <span className="text-[11px]">Page {pNum}</span>
              </button>
            ))}
          </div>
        )}

        {/* 3. SEARCH TAB */}
        {navTab === "search" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in document..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 outline-none focus:border-indigo-500 transition"
              />
            </div>

            {searchQuery && (
              <div className="text-xs text-slate-500 dark:text-slate-400 p-1">
                {editor ? (
                  (() => {
                    const fullText = editor.getText();
                    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
                    const matches = fullText.match(regex);
                    const count = matches ? matches.length : 0;
                    return (
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {count} {count === 1 ? "result" : "results"}
                        </span>{" "}
                        found in document.
                      </div>
                    );
                  })()
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
