"use client";

export function SummaryForm({ summary, onChange }) {
  const charCount = summary ? summary.length : 0;

  return (
    <div className="space-y-2">
      <label htmlFor="cv-summary" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        Professional Summary
      </label>
      <textarea
        id="cv-summary"
        rows={5}
        value={summary || ""}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
        placeholder="Write a concise 2-4 sentence introduction highlighting your background, key strengths, and career goals..."
        className="w-full p-3 text-xs leading-relaxed rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-y"
      />
      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span>Recommended: 2–4 sentences (150–400 characters)</span>
        <span className="font-mono">{charCount} characters</span>
      </div>
    </div>
  );
}
