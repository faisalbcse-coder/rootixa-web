"use client";

import { useState } from "react";
import { Plus, X, Wrench, Trash2 } from "lucide-react";

export function SkillsForm({ skills = [], onAdd, onRemove, onClearAll }) {
  const [inputVal, setInputVal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const getSkillLabel = (item) => {
    if (!item) return "";
    return typeof item === "object" ? item.name || "" : String(item);
  };

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    // Support comma-separated additions e.g. "React, Next.js, Node.js"
    const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      const exists = skills.some(
        (s) => getSkillLabel(s).toLowerCase() === part.toLowerCase()
      );
      if (!exists) {
        onAdd(part);
      }
    }

    setInputVal("");
    setErrorMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="skill-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Add Skills / Technologies
          </label>
          {skills.length > 0 && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            id="skill-input"
            type="text"
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (errorMsg) setErrorMsg("");
            }}
            onFocus={(e) => e.target.select()}
            onKeyDown={handleKeyDown}
            placeholder="Type skill & press Enter (e.g. React, Python, Figma)"
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inputVal.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {errorMsg && (
          <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1">{errorMsg}</p>
        )}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd> or comma to add multiple skills.
        </p>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <Wrench className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No skills added yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Type a skill above and press Enter to build your competencies list.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          {skills.map((skillItem, index) => {
            const label = getSkillLabel(skillItem);
            const target = typeof skillItem === "object" ? skillItem.id || skillItem.name : skillItem;

            return (
              <span
                key={`${label}-${index}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs group hover:border-slate-300 dark:hover:border-slate-600 transition"
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={() => onRemove(target)}
                  aria-label={`Remove skill ${label}`}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Remove"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
