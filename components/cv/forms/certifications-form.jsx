"use client";

import { Plus, Trash2, Award, Building, Calendar, Link as LinkIcon } from "lucide-react";

export function CertificationsForm({ certifications = [], onAdd, onUpdate, onRemove }) {
  return (
    <div className="space-y-4">
      {certifications.length === 0 ? (
        <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <Award className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">No certifications added yet.</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Add your professional licenses, certificates, and achievements.
          </p>
        </div>
      ) : (
        certifications.map((cert, index) => (
          <div
            key={cert.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 shadow-2xs space-y-3 relative group"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                  {index + 1}
                </span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                  {cert.name || "New Certification"}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onRemove(cert.id)}
                aria-label={`Remove certification ${index + 1}`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Certification Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Certification Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Award className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={cert.name || ""}
                    onChange={(e) => onUpdate(cert.id, "name", e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Issuing Organization */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issuing Organization
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={cert.issuer || ""}
                    onChange={(e) => onUpdate(cert.id, "issuer", e.target.value)}
                    placeholder="e.g. Amazon Web Services, Google, Meta"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Issue Date */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Issue Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={cert.issueDate || ""}
                    onChange={(e) => onUpdate(cert.id, "issueDate", e.target.value)}
                    placeholder="MM/YYYY or Year"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Credential URL */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Verification URL
                </label>
                <div className="relative">
                  <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="url"
                    value={cert.url || ""}
                    onChange={(e) => onUpdate(cert.id, "url", e.target.value)}
                    placeholder="https://credential.net/..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  />
                </div>
              </div>
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
        <span>Add Certification</span>
      </button>
    </div>
  );
}
