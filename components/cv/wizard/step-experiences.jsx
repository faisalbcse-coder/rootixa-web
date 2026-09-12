"use client";

import React, { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Wrench,
  FileText,
  FolderGit2,
  Award,
  Languages,
  BookOpen,
  HeartHandshake,
  Users,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  X,
  ExternalLink,
} from "lucide-react";

export function StepExperiences({
  cvData,
  updateSummary,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addSkill,
  removeSkill,
  addProject,
  updateProject,
  removeProject,
  addCertification,
  updateCertification,
  removeCertification,
  addLanguage,
  updateLanguage,
  removeLanguage,
  addAward,
  updateAward,
  removeAward,
  addPublication,
  updatePublication,
  removePublication,
  addVolunteer,
  updateVolunteer,
  removeVolunteer,
  updateReferences,
  addReference,
  updateReference,
  removeReference,
  addCustomSection,
  updateCustomSection,
  removeCustomSection,
  onNext,
  onPrev,
}) {
  const {
    summary = "",
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    awards = [],
    publications = [],
    volunteer = [],
    references = { availableUponRequest: true, items: [] },
    customSections = [],
  } = cvData || {};

  // Track which sections are open/collapsed
  const [openSections, setOpenSections] = useState({
    objective: true,
    education: true,
    experience: true,
    skills: true,
    languages: true,
    projects: true,
    certifications: true,
    awards: true,
    publications: true,
    volunteer: true,
    references: true,
    customSections: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Internal active state for optional sections (active if it has items or user manually opened it)
  const [activeOptionalSections, setActiveOptionalSections] = useState({
    languages: languages.length > 0,
    certifications: certifications.length > 0,
    projects: projects.length > 0,
    awards: awards.length > 0,
    publications: publications.length > 0,
    volunteer: volunteer.length > 0,
    references: Boolean(references?.items?.length > 0 || references?.customized),
    customSections: customSections.length > 0,
  });

  // Edit item tracking
  const [editingExpId, setEditingExpId] = useState(null);
  const [editingEduId, setEditingEduId] = useState(null);
  const [editingVolId, setEditingVolId] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [showExtraMenu, setShowExtraMenu] = useState(false);

  // Available optional section definitions
  const ALL_OPTIONAL_SECTIONS = [
    {
      id: "languages",
      title: "Languages",
      description: "Languages you speak & proficiency levels",
      icon: Languages,
      color: "text-pink-500 bg-pink-50 dark:bg-pink-950/40",
      onAdd: () => {
        setActiveOptionalSections((prev) => ({ ...prev, languages: true }));
        setOpenSections((prev) => ({ ...prev, languages: true }));
        if (languages.length === 0) addLanguage();
      },
    },
    {
      id: "projects",
      title: "Projects & Portfolio",
      description: "Featured open-source, client, or personal work",
      icon: FolderGit2,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
      onAdd: () => {
        setActiveOptionalSections((prev) => ({ ...prev, projects: true }));
        setOpenSections((prev) => ({ ...prev, projects: true }));
        if (projects.length === 0) addProject();
      },
    },
    {
      id: "certifications",
      title: "Certifications & Licenses",
      description: "Professional credentials, courses & accreditations",
      icon: Award,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
      onAdd: () => {
        setActiveOptionalSections((prev) => ({ ...prev, certifications: true }));
        setOpenSections((prev) => ({ ...prev, certifications: true }));
        if (certifications.length === 0) addCertification();
      },
    },
    {
      id: "awards",
      title: "Honors & Awards",
      description: "Academic honors, scholarships & competition prizes",
      icon: Award,
      color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/40",
      onAdd: () => {
        setActiveOptionalSections((prev) => ({ ...prev, awards: true }));
        setOpenSections((prev) => ({ ...prev, awards: true }));
        if (awards.length === 0) addAward();
      },
    },
    {
      id: "publications",
      title: "Publications & Research",
      description: "Academic papers, journal articles & whitepapers",
      icon: BookOpen,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
      onAdd: () => {
        setActiveOptionalSections((prev) => ({ ...prev, publications: true }));
        setOpenSections((prev) => ({ ...prev, publications: true }));
        if (publications.length === 0) addPublication();
      },
    },
    {
      id: "volunteer",
      title: "Volunteering & Leadership",
      description: "Community initiatives, NGO work & social causes",
      icon: HeartHandshake,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
      onAdd: () => {
        setActiveOptionalSections((prev) => ({ ...prev, volunteer: true }));
        setOpenSections((prev) => ({ ...prev, volunteer: true }));
        if (volunteer.length === 0) addVolunteer();
      },
    },
    {
      id: "references",
      title: "Professional References",
      description: "Reference contacts or available upon request",
      icon: Users,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
      onAdd: () => {
        setActiveOptionalSections((prev) => ({ ...prev, references: true }));
        setOpenSections((prev) => ({ ...prev, references: true }));
        updateReferences({ customized: true, availableUponRequest: true });
      },
    },
    {
      id: "customSections",
      title: "Custom Section",
      description: "Interests, Patents, Workshops, or Speaking Engagements",
      icon: Sparkles,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40",
      onAdd: () => {
        setActiveOptionalSections((prev) => ({ ...prev, customSections: true }));
        setOpenSections((prev) => ({ ...prev, customSections: true }));
        if (customSections.length === 0) addCustomSection();
      },
    },
  ];

  // Filter out any optional section that is already active (ZERO DUPLICATION!)
  const unaddedOptionalSections = ALL_OPTIONAL_SECTIONS.filter(
    (sec) => !activeOptionalSections[sec.id]
  );

  const handleRemoveOptionalSection = (sectionKey, clearFn) => {
    setActiveOptionalSections((prev) => ({ ...prev, [sectionKey]: false }));
    if (clearFn) clearFn();
  };

  const handleAddSkillSubmit = (e) => {
    e?.preventDefault();
    const clean = skillInput.trim();
    if (!clean) return;
    const parts = clean.split(/[,،]+/).map((s) => s.trim()).filter(Boolean);
    parts.forEach((p) => addSkill(p));
    setSkillInput("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in-50 duration-300">
      {/* ─── Page Title ─── */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-bold uppercase tracking-wider mb-2">
          Step 2 of 3
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Professional Experience &amp; Details
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Add your work history, degrees, and skills. Use &quot;Add optional section&quot; below for languages, publications, or references.
        </p>
      </div>

      <div className="space-y-4">
        {/* ══════════════════════════════════════════════════════════
            CORE 1: PROFESSIONAL SUMMARY
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleSection("objective")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-2xs">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Professional Summary / Objective
                </h2>
                <p className="text-[11px] text-slate-500">
                  {summary ? `${summary.slice(0, 60)}...` : "Short overview of your career focus and key strengths"}
                </p>
              </div>
            </div>
            <div className="text-slate-400">
              {openSections.objective ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {openSections.objective && (
            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Summary Text
              </label>
              <textarea
                rows={4}
                value={summary}
                onChange={(e) => updateSummary(e.target.value)}
                placeholder="Results-driven software engineer with 5+ years of experience delivering high-performance applications..."
                className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Tip: A strong 2-3 sentence overview grabs recruiters&apos; attention immediately.</span>
                <span>{summary.length} chars</span>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            CORE 2: WORK EXPERIENCE
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleSection("experience")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Work Experience
                </h2>
                <p className="text-[11px] text-slate-500">
                  {experience.length > 0 ? `${experience.length} position(s) added` : "Past roles, responsibilities, and achievements"}
                </p>
              </div>
            </div>
            <div className="text-slate-400">
              {openSections.experience ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {openSections.experience && (
            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
              {experience.map((exp, idx) => {
                const isExpanded = editingExpId === exp.id || (editingExpId === null && idx === 0 && !exp.position);
                return (
                  <div
                    key={exp.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => setEditingExpId(isExpanded ? null : exp.id)}
                        className="cursor-pointer flex-1"
                      >
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {exp.position || "Job Title (click to edit)"}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {exp.company || "Company"} {exp.location ? `• ${exp.location}` : ""}{" "}
                          {exp.startDate ? `(${exp.startDate} - ${exp.current ? "Present" : exp.endDate})` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingExpId(isExpanded ? null : exp.id)}
                          className="p-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
                        >
                          {isExpanded ? "Collapse" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in-50 duration-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Job Title / Role
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Senior Frontend Engineer"
                            value={exp.position || ""}
                            onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            City, Country
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. San Francisco, CA"
                            value={exp.location || ""}
                            onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Employer / Company Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Google / Stripe / Nexus Labs"
                            value={exp.company || ""}
                            onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Jan 2022"
                            value={exp.startDate || ""}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Dec 2024"
                            disabled={exp.current}
                            value={exp.current ? "Present" : exp.endDate || ""}
                            onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden disabled:opacity-50"
                          />
                          <label className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(exp.current)}
                              onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                              className="rounded-xs text-indigo-600 focus:ring-indigo-500"
                            />
                            <span>Current Position</span>
                          </label>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Key Responsibilities &amp; Impact (Use • for bullets)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="• Spearheaded design and implementation of modern customer portal, reducing bounce rate by 28%&#10;• Collaborated with cross-functional product and engineering teams to deploy microservices"
                            value={exp.description || ""}
                            onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden resize-y leading-relaxed"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  const newExp = addExperience();
                  if (newExp?.id) setEditingExpId(newExp.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add another work experience</span>
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            CORE 3: EDUCATION & QUALIFICATIONS
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleSection("education")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Education &amp; Qualifications
                </h2>
                <p className="text-[11px] text-slate-500">
                  {education.length > 0 ? `${education.length} degree(s) added` : "Degrees, universities, and academic background"}
                </p>
              </div>
            </div>
            <div className="text-slate-400">
              {openSections.education ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {openSections.education && (
            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
              {education.map((edu, idx) => {
                const isExpanded = editingEduId === edu.id || (editingEduId === null && idx === 0 && !edu.degree);
                return (
                  <div
                    key={edu.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        onClick={() => setEditingEduId(isExpanded ? null : edu.id)}
                        className="cursor-pointer flex-1"
                      >
                        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                          {edu.degree || "Degree name (click to edit)"}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {edu.institution || "Institution"} {edu.location ? `• ${edu.location}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingEduId(isExpanded ? null : edu.id)}
                          className="p-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold"
                        >
                          {isExpanded ? "Collapse" : "Edit"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in-50 duration-200">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Degree / Major
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. B.S. in Computer Science"
                            value={edu.degree || ""}
                            onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            City, Country
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Berkeley, CA"
                            value={edu.location || ""}
                            onChange={(e) => updateEducation(edu.id, "location", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            School / University
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. University of California, Berkeley"
                            value={edu.institution || ""}
                            onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Start Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Sep 2018"
                            value={edu.startDate || ""}
                            onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            End Date
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. May 2022"
                            value={edu.endDate || ""}
                            onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Description / Honors / GPA
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Graduated Magna Cum Laude. Focused on Algorithms & Systems Architecture."
                            value={edu.description || ""}
                            onChange={(e) => updateEducation(edu.id, "description", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden resize-y"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  const newEdu = addEducation();
                  if (newEdu?.id) setEditingEduId(newEdu.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add another degree or qualification</span>
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            CORE 4: TECHNICAL & KEY SKILLS
        ══════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          <div
            onClick={() => toggleSection("skills")}
            className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Technical &amp; Core Skills
                </h2>
                <p className="text-[11px] text-slate-500">
                  {skills.length > 0 ? `${skills.length} skill(s) added` : "Technologies, frameworks, and competencies"}
                </p>
              </div>
            </div>
            <div className="text-slate-400">
              {openSections.skills ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {openSections.skills && (
            <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
              <form onSubmit={handleAddSkillSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. JavaScript, React, Python, PostgreSQL (press Enter or comma)"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-1">
                {skills.map((s, idx) => (
                  <span
                    key={s.id || idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700/80 shadow-2xs"
                  >
                    <span>{s.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(s.id)}
                      className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No skills added yet. Type your key competencies above.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            OPTIONAL 1: LANGUAGES (Active only when added)
        ══════════════════════════════════════════════════════════ */}
        {activeOptionalSections.languages && (
          <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div
                onClick={() => toggleSection("languages")}
                className="flex items-center gap-3 cursor-pointer flex-1 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 flex items-center justify-center shadow-2xs">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Languages
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {languages.length > 0 ? `${languages.length} language(s)` : "Languages spoken and proficiency levels"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveOptionalSection("languages", () => {
                    languages.forEach((l) => removeLanguage(l.id));
                  })}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
                  title="Remove this optional section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Section</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("languages")}
                  className="text-slate-400 p-1"
                >
                  {openSections.languages ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openSections.languages && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                {languages.map((l, idx) => (
                  <div key={l.id || idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. English"
                      value={l.language || ""}
                      onChange={(e) => updateLanguage(l.id, "language", e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                    />
                    <select
                      value={l.proficiency || "Fluent"}
                      onChange={(e) => updateLanguage(l.id, "proficiency", e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden text-slate-700 dark:text-slate-300"
                    >
                      <option value="Native / Bilingual">Native / Bilingual</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Professional Working">Professional Working</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Conversational">Conversational</option>
                      <option value="Basic">Basic</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeLanguage(l.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addLanguage}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add another language</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            OPTIONAL 2: FEATURED PROJECTS (Active only when added)
        ══════════════════════════════════════════════════════════ */}
        {activeOptionalSections.projects && (
          <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div
                onClick={() => toggleSection("projects")}
                className="flex items-center gap-3 cursor-pointer flex-1 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-2xs">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Featured Projects &amp; Portfolio
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {projects.length > 0 ? `${projects.length} project(s)` : "Key personal, open-source or commercial projects"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveOptionalSection("projects", () => {
                    projects.forEach((p) => removeProject(p.id));
                  })}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
                  title="Remove this optional section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Section</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("projects")}
                  className="text-slate-400 p-1"
                >
                  {openSections.projects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openSections.projects && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                {projects.map((proj, idx) => (
                  <div
                    key={proj.id || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {proj.name || "Project Title"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeProject(proj.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Project Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. OmniFlow Automation"
                          value={proj.name || ""}
                          onChange={(e) => updateProject(proj.id, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Project URL / Demo Link
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. https://github.com/..."
                          value={proj.url || proj.link || ""}
                          onChange={(e) => updateProject(proj.id, "url", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Technologies Used
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Next.js, TypeScript, Tailwind CSS, PostgreSQL"
                          value={proj.technologies || ""}
                          onChange={(e) => updateProject(proj.id, "technologies", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Architected a visual automation tool supporting 50k+ monthly pipelines..."
                          value={proj.description || ""}
                          onChange={(e) => updateProject(proj.id, "description", e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden resize-y"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addProject}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 hover:bg-indigo-50 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add another project</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            OPTIONAL 3: CERTIFICATIONS & LICENSES (Active only when added)
        ══════════════════════════════════════════════════════════ */}
        {activeOptionalSections.certifications && (
          <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div
                onClick={() => toggleSection("certifications")}
                className="flex items-center gap-3 cursor-pointer flex-1 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Certifications &amp; Licenses
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {certifications.length > 0 ? `${certifications.length} certification(s)` : "Licenses, honors, and credentials"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveOptionalSection("certifications", () => {
                    certifications.forEach((c) => removeCertification(c.id));
                  })}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
                  title="Remove this optional section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Section</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("certifications")}
                  className="text-slate-400 p-1"
                >
                  {openSections.certifications ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openSections.certifications && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                {certifications.map((cert, idx) => (
                  <div key={cert.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Certificate Name (e.g. AWS Certified Solutions Architect)"
                      value={cert.name || ""}
                      onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Year (e.g. 2024)"
                        value={cert.issueDate || ""}
                        onChange={(e) => updateCertification(cert.id, "issueDate", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertification(cert.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCertification}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add another certification</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            OPTIONAL 4: HONORS & AWARDS (Active only when added)
        ══════════════════════════════════════════════════════════ */}
        {activeOptionalSections.awards && (
          <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div
                onClick={() => toggleSection("awards")}
                className="flex items-center gap-3 cursor-pointer flex-1 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400 flex items-center justify-center shadow-2xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Honors &amp; Awards
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {awards.length > 0 ? `${awards.length} award(s)` : "Academic honors, scholarships, and competition prizes"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveOptionalSection("awards", () => {
                    awards.forEach((a) => removeAward(a.id));
                  })}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
                  title="Remove this optional section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Section</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("awards")}
                  className="text-slate-400 p-1"
                >
                  {openSections.awards ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openSections.awards && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                {awards.map((aw, idx) => (
                  <div key={aw.id || idx} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Award Name (e.g. 1st Place National Hackathon)"
                      value={aw.name || ""}
                      onChange={(e) => updateAward(aw.id, "name", e.target.value)}
                      className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Year (e.g. 2023)"
                        value={aw.year || ""}
                        onChange={(e) => updateAward(aw.id, "year", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => removeAward(aw.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addAward}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add another award</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            OPTIONAL 5: PUBLICATIONS & RESEARCH (Active only when added)
        ══════════════════════════════════════════════════════════ */}
        {activeOptionalSections.publications && (
          <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div
                onClick={() => toggleSection("publications")}
                className="flex items-center gap-3 cursor-pointer flex-1 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-2xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Publications &amp; Research
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {publications.length > 0 ? `${publications.length} publication(s)` : "Journal papers, conference proceedings & books"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveOptionalSection("publications", () => {
                    publications.forEach((p) => removePublication(p.id));
                  })}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
                  title="Remove this optional section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Section</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("publications")}
                  className="text-slate-400 p-1"
                >
                  {openSections.publications ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openSections.publications && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                {publications.map((p, idx) => (
                  <div key={p.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Paper / Publication</span>
                      <button
                        type="button"
                        onClick={() => removePublication(p.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Title of Paper / Article"
                      value={p.title || ""}
                      onChange={(e) => updatePublication(p.id, "title", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Journal / Publisher (e.g. IEEE / Nature)"
                        value={p.publisher || ""}
                        onChange={(e) => updatePublication(p.id, "publisher", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="Publication Year / Date (e.g. 2024)"
                        value={p.date || ""}
                        onChange={(e) => updatePublication(p.id, "date", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addPublication}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add another publication</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            OPTIONAL 6: VOLUNTEERING & LEADERSHIP (Active only when added)
        ══════════════════════════════════════════════════════════ */}
        {activeOptionalSections.volunteer && (
          <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div
                onClick={() => toggleSection("volunteer")}
                className="flex items-center gap-3 cursor-pointer flex-1 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Volunteering &amp; Leadership
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {volunteer.length > 0 ? `${volunteer.length} role(s)` : "Non-profit work, community organizing & social causes"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveOptionalSection("volunteer", () => {
                    volunteer.forEach((v) => removeVolunteer(v.id));
                  })}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
                  title="Remove this optional section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Section</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("volunteer")}
                  className="text-slate-400 p-1"
                >
                  {openSections.volunteer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openSections.volunteer && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                {volunteer.map((v, idx) => (
                  <div key={v.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Volunteer Role</span>
                      <button
                        type="button"
                        onClick={() => removeVolunteer(v.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Role / Title (e.g. Volunteer Mentor)"
                        value={v.role || ""}
                        onChange={(e) => updateVolunteer(v.id, "role", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="Organization (e.g. Red Cross / Rotary Club)"
                        value={v.organization || ""}
                        onChange={(e) => updateVolunteer(v.id, "organization", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Brief description of your contributions..."
                      value={v.description || ""}
                      onChange={(e) => updateVolunteer(v.id, "description", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden resize-y"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVolunteer}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add another volunteer role</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            OPTIONAL 7: PROFESSIONAL REFERENCES (Active only when added)
        ══════════════════════════════════════════════════════════ */}
        {activeOptionalSections.references && (
          <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div
                onClick={() => toggleSection("references")}
                className="flex items-center gap-3 cursor-pointer flex-1 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Professional References
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {references?.availableUponRequest ? "Displays &apos;References available upon request&apos;" : `${references?.items?.length || 0} referee contact(s)`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveOptionalSection("references", () => {
                    updateReferences({ customized: false, availableUponRequest: true, items: [] });
                  })}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
                  title="Remove this optional section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Section</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("references")}
                  className="text-slate-400 p-1"
                >
                  {openSections.references ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openSections.references && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                {/* Available on request toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Show &quot;References available upon request&quot; statement
                  </span>
                  <input
                    type="checkbox"
                    checked={Boolean(references?.availableUponRequest)}
                    onChange={(e) => updateReferences("availableUponRequest", e.target.checked)}
                    className="w-4 h-4 rounded-xs text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                {!references?.availableUponRequest && (
                  <div className="space-y-3">
                    {references?.items?.map((ref, idx) => (
                      <div key={ref.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">Referee Contact</span>
                          <button
                            type="button"
                            onClick={() => removeReference(ref.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Full Name (e.g. Dr. Sarah Jenkins)"
                            value={ref.name || ""}
                            onChange={(e) => updateReference(ref.id, "name", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            placeholder="Company / University"
                            value={ref.company || ""}
                            onChange={(e) => updateReference(ref.id, "company", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                          <input
                            type="email"
                            placeholder="Email address"
                            value={ref.email || ""}
                            onChange={(e) => updateReference(ref.id, "email", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                          <input
                            type="tel"
                            placeholder="Phone number"
                            value={ref.phone || ""}
                            onChange={(e) => updateReference(ref.id, "phone", e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addReference}
                      className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Add specific referee contact</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            OPTIONAL 8: CUSTOM SECTION (Active only when added)
        ══════════════════════════════════════════════════════════ */}
        {activeOptionalSections.customSections && (
          <div className="bg-white dark:bg-[#0E1524] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-all animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between p-4 sm:p-5">
              <div
                onClick={() => toggleSection("customSections")}
                className="flex items-center gap-3 cursor-pointer flex-1 select-none"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Custom / Additional Section
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Hobbies &amp; Interests, Patents, Workshops, or Key Clients
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveOptionalSection("customSections", () => {
                    customSections.forEach((c) => removeCustomSection(c.id));
                  })}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors px-2 py-1 rounded-md"
                  title="Remove this optional section"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove Section</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleSection("customSections")}
                  className="text-slate-400 p-1"
                >
                  {openSections.customSections ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {openSections.customSections && (
              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                {customSections.map((cs, idx) => (
                  <div key={cs.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Section Title
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCustomSection(cs.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Interests & Hobbies / Patents / Workshops"
                      value={cs.title || ""}
                      onChange={(e) => updateCustomSection(cs.id, "title", e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden font-bold"
                    />
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Content (bullet points or paragraph)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="• Competitive Chess (Rating 1850)&#10;• Marathon Runner&#10;• Open-source contributor"
                        value={cs.content || ""}
                        onChange={(e) => updateCustomSection(cs.id, "content", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:outline-hidden resize-y leading-relaxed"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCustomSection}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add another custom section</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            DYNAMIC "+ ADD OPTIONAL SECTION" DROPDOWN MENU
            (Shows ONLY sections that are not currently active - Zero Duplication!)
        ══════════════════════════════════════════════════════════ */}
        {unaddedOptionalSections.length > 0 && (
          <div className="relative pt-4">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowExtraMenu(!showExtraMenu)}
                className="px-6 py-3 rounded-full border border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-white dark:bg-[#0E1524] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer hover:shadow-md active:scale-95"
              >
                <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>+ Add Optional Section ({unaddedOptionalSections.length} available)</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {showExtraMenu && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 max-w-[95vw] rounded-2xl bg-white dark:bg-[#0E1524] border border-slate-200/90 dark:border-slate-800 shadow-2xl py-2 z-30 animate-in fade-in-50 zoom-in-95 duration-150 divide-y divide-slate-100 dark:divide-slate-800/60">
                <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select a section to add:
                </div>
                <div className="py-1">
                  {unaddedOptionalSections.map((sec) => {
                    const IconComponent = sec.icon;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => {
                          sec.onAdd();
                          setShowExtraMenu(false);
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-indigo-50/60 dark:hover:bg-slate-800/70 flex items-start gap-3 transition-colors group cursor-pointer"
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${sec.color}`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {sec.title}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {sec.description}
                          </p>
                        </div>
                        <Plus className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 shrink-0 mt-1" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Bottom Navigation: Previous & Next with Rootixa Gradient ─── */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onPrev}
            className="flex items-center gap-1.5 px-5 py-3 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Personal</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/25 active:scale-98 transition-all cursor-pointer min-w-[200px] justify-center"
          >
            <span>Proceed to Templates</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
