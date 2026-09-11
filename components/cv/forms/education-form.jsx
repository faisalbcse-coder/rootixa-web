"use client";

import { Plus, Trash2, GraduationCap, Building, Calendar, MapPin } from "lucide-react";

export function EducationForm({ educations, education, onAdd, onUpdate, onRemove }) {
  // Support both prop names for guaranteed compatibility
  const items = Array.isArray(educations) ? educations : Array.isArray(education) ? education : [];

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No education entries added yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 mb-3">
            Add your degrees, diplomas, or academic background.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Education</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {items.map((edu, index) => (
            <div
              key={edu.id || index}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs space-y-3 relative group"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[220px] sm:max-w-xs">
                    {edu.degree || edu.institution
                      ? `${edu.degree || "Degree"} at ${edu.institution || "Institution"}`
                      : "New Education Entry"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(edu.id)}
                  aria-label={`Remove education ${index + 1}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                  title="Remove this education entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Degree / Program */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Degree / Qualification <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={edu.degree || ""}
                      onChange={(e) => onUpdate(edu.id, "degree", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Institution / University */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institution / University <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={edu.institution || ""}
                      onChange={(e) => onUpdate(edu.id, "institution", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. UC Berkeley"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Major / Field of Study
                  </label>
                  <input
                    type="text"
                    value={edu.field || ""}
                    onChange={(e) => onUpdate(edu.id, "field", e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="e.g. Software Engineering"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>

                {/* GPA / Grade (Optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Grade / GPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={edu.gpa || ""}
                    onChange={(e) => onUpdate(edu.id, "gpa", e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="e.g. 3.8 / 4.0 or First Class"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
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
                      value={edu.startDate || ""}
                      onChange={(e) => onUpdate(edu.id, "startDate", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. 2018 or 2018-09"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date / Graduation
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={edu.endDate || ""}
                      onChange={(e) => onUpdate(edu.id, "endDate", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. 2022 or Present"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Honors / Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Honors, Activities or Key Coursework
                  </label>
                  <textarea
                    rows={2}
                    value={edu.description || ""}
                    onChange={(e) => onUpdate(edu.id, "description", e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Graduated with Honors. Dean's List, Capstone in Distributed Systems."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Education Button */}
          <button
            type="button"
            onClick={onAdd}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Degree</span>
          </button>
        </div>
      )}
    </div>
  );
}
