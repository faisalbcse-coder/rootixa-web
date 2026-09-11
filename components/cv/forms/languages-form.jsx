"use client";

import { Plus, Trash2, Languages } from "lucide-react";
import { LANGUAGE_PROFICIENCIES } from "@/lib/cv/cv-types";

export function LanguagesForm({ languages = [], onAdd, onUpdate, onRemove }) {
  return (
    <div className="space-y-4">
      {languages.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <Languages className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No languages added yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Add languages you communicate in, along with your proficiency level.
          </p>
        </div>
      ) : (
        languages.map((lang, index) => (
          <div
            key={lang.id}
            className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative group"
          >
            {/* Language Name */}
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Language
              </label>
              <input
                type="text"
                value={lang.language || ""}
                onChange={(e) => onUpdate(lang.id, "language", e.target.value)}
                placeholder="e.g. English, French, Bengali..."
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            {/* Proficiency Dropdown */}
            <div className="w-full sm:w-44">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Proficiency
              </label>
              <select
                value={lang.proficiency || "Fluent"}
                onChange={(e) => onUpdate(lang.id, "proficiency", e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
              >
                {LANGUAGE_PROFICIENCIES.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* Remove Action */}
            <div className="sm:self-end sm:pb-0.5">
              <button
                type="button"
                onClick={() => onRemove(lang.id)}
                aria-label={`Remove language ${lang.language || index + 1}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))
      )}

      <button
        type="button"
        onClick={onAdd}
        className="w-full py-2.5 px-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Language</span>
      </button>
    </div>
  );
}
