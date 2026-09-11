"use client";

import { Plus, Trash2, Calendar, MapPin, Building, Briefcase } from "lucide-react";

export function ExperienceForm({ experiences, experience, onAdd, onUpdate, onRemove }) {
  // Support both prop names for guaranteed compatibility
  const items = Array.isArray(experiences) ? experiences : Array.isArray(experience) ? experience : [];

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <Briefcase className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No work experience added yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 mb-3">
            Add your job positions, responsibilities, and achievements.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((exp, index) => (
            <div
              key={exp.id || index}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs space-y-3 relative group"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[220px] sm:max-w-xs">
                    {exp.position || exp.company
                      ? `${exp.position || "Role"} at ${exp.company || "Company"}`
                      : "New Job Position"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(exp.id)}
                  aria-label={`Remove experience ${index + 1}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  title="Remove this position"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Job Title */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={exp.position || ""}
                      onChange={(e) => onUpdate(exp.id, "position", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. Frontend Engineer"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={exp.company || ""}
                      onChange={(e) => onUpdate(exp.id, "company", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. Acme Inc"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={exp.location || ""}
                      onChange={(e) => onUpdate(exp.id, "location", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. New York, NY (or Remote)"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={exp.startDate || ""}
                      onChange={(e) => onUpdate(exp.id, "startDate", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. 2022-01 or Jan 2022"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={exp.endDate || ""}
                      disabled={exp.current}
                      onChange={(e) => onUpdate(exp.id, "endDate", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder={exp.current ? "Present" : "e.g. 2024-05 or Present"}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Currently Working Here */}
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    id={`current-exp-${exp.id}`}
                    type="checkbox"
                    checked={Boolean(exp.current)}
                    onChange={(e) => {
                      onUpdate(exp.id, "current", e.target.checked);
                      if (e.target.checked) {
                        onUpdate(exp.id, "endDate", "");
                      }
                    }}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <label
                    htmlFor={`current-exp-${exp.id}`}
                    className="text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer"
                  >
                    I currently work here
                  </label>
                </div>

                {/* Description & Responsibilities */}
                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Responsibilities &amp; Achievements
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const current = exp.description || "";
                        const bullet = current ? `${current}\n• ` : "• ";
                        onUpdate(exp.id, "description", bullet);
                      }}
                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      + Add Bullet
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={exp.description || ""}
                    onChange={(e) => onUpdate(exp.id, "description", e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="• Led team of engineers building high-performance features&#10;• Improved customer retention by 25%"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Experience Button */}
          <button
            type="button"
            onClick={onAdd}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Position</span>
          </button>
        </div>
      )}
    </div>
  );
}
