"use client";

import React, { useState } from "react";
import { Table, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

export function TableGridPicker({
  isOpen,
  onClose,
  onInsertTable,
  isInsideTable,
  onAddRowBefore,
  onAddRowAfter,
  onDeleteRow,
  onAddColumnBefore,
  onAddColumnAfter,
  onDeleteColumn,
  onDeleteTable,
}) {
  const [hoverRows, setHoverRows] = useState(0);
  const [hoverCols, setHoverCols] = useState(0);

  if (!isOpen) return null;

  const MAX_ROWS = 6;
  const MAX_COLS = 6;

  return (
    <div
      className="absolute left-0 top-full mt-1.5 p-3.5 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-in fade-in zoom-in-95 duration-100 min-w-[240px]"
      onMouseLeave={() => {
        setHoverRows(0);
        setHoverCols(0);
      }}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
          Insert Table
        </span>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {hoverRows > 0 && hoverCols > 0 ? `${hoverCols} × ${hoverRows}` : "Select size"}
        </span>
      </div>

      {/* Grid cells */}
      <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 inline-block">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: MAX_ROWS }).map((_, r) =>
            Array.from({ length: MAX_COLS }).map((_, c) => {
              const rowNum = r + 1;
              const colNum = c + 1;
              const isSelected = rowNum <= hoverRows && colNum <= hoverCols;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onMouseEnter={() => {
                    setHoverRows(rowNum);
                    setHoverCols(colNum);
                  }}
                  onClick={() => {
                    onInsertTable(rowNum, colNum);
                    onClose();
                  }}
                  className={`w-6 h-6 rounded-md border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 shadow-2xs"
                      : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-indigo-400"
                  }`}
                  aria-label={`${colNum} by ${rowNum} table`}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Contextual Table Editing Controls if cursor is currently in a table */}
      {isInsideTable && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block px-1">
            Table Actions
          </span>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => {
                onAddRowBefore();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-left font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <ArrowUp className="w-3 h-3 text-indigo-500" /> Row Above
            </button>
            <button
              onClick={() => {
                onAddRowAfter();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-left font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <ArrowDown className="w-3 h-3 text-indigo-500" /> Row Below
            </button>
            <button
              onClick={() => {
                onAddColumnBefore();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-left font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <ArrowLeft className="w-3 h-3 text-indigo-500" /> Column Left
            </button>
            <button
              onClick={() => {
                onAddColumnAfter();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-left font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <ArrowRight className="w-3 h-3 text-indigo-500" /> Column Right
            </button>
            <button
              onClick={() => {
                onDeleteRow();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-left font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <Trash2 className="w-3 h-3" /> Delete Row
            </button>
            <button
              onClick={() => {
                onDeleteColumn();
                onClose();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-left font-medium flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <Trash2 className="w-3 h-3" /> Delete Col
            </button>
          </div>
          <button
            onClick={() => {
              onDeleteTable();
              onClose();
            }}
            className="w-full mt-1 px-2.5 py-1.5 rounded-lg bg-rose-100/70 dark:bg-rose-950/60 hover:bg-rose-200/80 text-rose-700 dark:text-rose-300 font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Entire Table
          </button>
        </div>
      )}
    </div>
  );
}
