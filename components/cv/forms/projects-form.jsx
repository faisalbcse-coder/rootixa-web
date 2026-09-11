"use client";

import { Plus, Trash2, FolderGit2, Globe, Cpu } from "lucide-react";

export function ProjectsForm({ projects = [], onAdd, onUpdate, onRemove }) {
  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <FolderGit2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No projects added yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 mb-3">
            Highlight personal side-projects, open-source work, or case studies.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {projects.map((proj, index) => (
            <div
              key={proj.id || index}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs space-y-3 relative group"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                    {index + 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                    {proj.name || "New Project"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(proj.id)}
                  aria-label={`Remove project ${index + 1}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Project Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FolderGit2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={proj.name || ""}
                      onChange={(e) => onUpdate(proj.id, "name", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. Workflow Automation Suite"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Project URL */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Link / Repository
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="url"
                      value={proj.url || proj.link || ""}
                      onChange={(e) => onUpdate(proj.id, "url", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="https://github.com/user/project"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Technologies / Skills */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Technologies / Tools Used
                  </label>
                  <div className="relative">
                    <Cpu className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={proj.technologies || ""}
                      onChange={(e) => onUpdate(proj.id, "technologies", e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="e.g. Next.js, TypeScript, PostgreSQL"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project Summary &amp; Impact
                  </label>
                  <textarea
                    rows={2}
                    value={proj.description || ""}
                    onChange={(e) => onUpdate(proj.id, "description", e.target.value)}
                    onFocus={(e) => e.target.select()}
                    placeholder="Built an open-source visual automation tool for managing data pipelines with over 1,000 GitHub stars."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition leading-relaxed"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add Another Project Button */}
          <button
            type="button"
            onClick={onAdd}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Project</span>
          </button>
        </div>
      )}
    </div>
  );
}
