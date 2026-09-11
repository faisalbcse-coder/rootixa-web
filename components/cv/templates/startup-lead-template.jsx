"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, Sparkles } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function StartupLeadTemplate({ cvData }) {
  const {
    personal = {},
    summary = "",
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    sectionOrder = [],
    sectionVisibility = {},
    sectionTitles = {},
    design = {},
  } = cvData || {};

  const tokens = extractDesignTokens(design);
  const hasContent = useMemo(() => checkHasContent(cvData), [cvData]);

  const titles = {
    summary: sectionTitles.summary || "Summary",
    experience: sectionTitles.experience || "Experience",
    education: sectionTitles.education || "Education",
    skills: sectionTitles.skills || "Skills & Expertise",
    projects: sectionTitles.projects || "Key Projects",
    certifications: sectionTitles.certifications || "Certifications",
    languages: sectionTitles.languages || "Languages",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  const sectionHeading = (title) => (
    <div className="flex items-center gap-2 mb-3">
      <span
        className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[0.8em]"
        style={{
          backgroundColor: `${tokens.accent}15`,
          color: tokens.accent,
        }}
      >
        {title}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );

  return (
    <div
      className="cv-startup-lead-template text-slate-800 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between gap-5 mb-6">
        <div className="flex-1">
          <div className="inline-block px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 text-[0.8em] font-semibold uppercase tracking-widest mb-1.5">
            Curriculum Vitae
          </div>
          <h1
            className="font-extrabold tracking-tight text-slate-950"
            style={{ fontSize: tokens.nameSize }}
          >
            {personal.fullName || "Your Full Name"}
          </h1>

          {personal.professionalTitle && (
            <p
              className="font-semibold mt-0.5"
              style={{ fontSize: tokens.titleSize, color: tokens.accent }}
            >
              {personal.professionalTitle}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-2.5 text-slate-600"
            style={{ fontSize: tokens.metaSize }}
          >
            {personal.email && (
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <Mail className="w-3 h-3 text-slate-400" />
                <a href={`mailto:${personal.email}`} className="hover:underline">
                  {personal.email}
                </a>
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1 text-slate-700">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{personal.phone}</span>
              </span>
            )}
            {personal.location && (
              <span className="flex items-center gap-1 text-slate-700">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{personal.location}</span>
              </span>
            )}
            {personal.website && (
              <span className="flex items-center gap-1 text-slate-700">
                <Globe className="w-3 h-3 text-slate-400" />
                <a href={personal.website} className="hover:underline" style={{ color: tokens.accent }}>
                  {personal.website.replace(/^https?:\/\//, "")}
                </a>
              </span>
            )}
          </div>
        </div>

        {tokens.photo?.enabled && tokens.photo?.url && (
          <div>
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 86, personal.fullName)}
          </div>
        )}
      </header>

      {/* ─── Sections ─── */}
      <div className="space-y-4">
        {visibleSections.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              return (
                <section key="summary" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.summary)}
                  <p className="text-slate-700 leading-relaxed">
                    {summary}
                  </p>
                </section>
              );

            case "experience":
              return (
                <section key="experience" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.experience)}
                  <div className="relative pl-3 border-l-2 space-y-4" style={{ borderColor: `${tokens.accent}30` }}>
                    {experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="experience-item relative break-inside-avoid">
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: tokens.accent }}
                        />
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span className="text-[1.05em]">{exp.position}</span>
                          <span className="text-[0.88em] font-normal text-slate-500">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700 font-medium mb-1">
                          <span style={{ color: tokens.accent }}>{exp.company}</span>
                          {exp.location && <span className="text-[0.88em] text-slate-500 font-normal">{exp.location}</span>}
                        </div>
                        {renderFormattedDescription(exp.description, tokens.bodySize, tokens.paragraphGap, tokens.accent)}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "education":
              return (
                <section key="education" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.education)}
                  <div className="relative pl-3 border-l-2 space-y-3" style={{ borderColor: `${tokens.accent}30` }}>
                    {education.map((edu, idx) => (
                      <div key={edu.id || idx} className="education-item relative break-inside-avoid">
                        <div
                          className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                          style={{ backgroundColor: tokens.accent }}
                        />
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          <span className="text-[0.88em] font-normal text-slate-500">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700 font-medium">
                          <span>{edu.institution}</span>
                          {edu.gpa && <span className="text-[0.88em] text-slate-500">GPA: {edu.gpa}</span>}
                        </div>
                        {edu.description && (
                          <div className="mt-1">
                            {renderFormattedDescription(edu.description, tokens.bodySize, tokens.paragraphGap, tokens.accent)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "skills":
              return (
                <section key="skills" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.skills)}
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, idx) => (
                      <span
                        key={s.id || idx}
                        className="px-2.5 py-0.5 rounded-md text-[0.9em] font-medium bg-slate-50 text-slate-800 border border-slate-200"
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              return (
                <section key="projects" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.projects)}
                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="project-item break-inside-avoid">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{proj.name}</span>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] font-normal hover:underline" style={{ color: tokens.accent }}>
                              Link ↗
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.85em] text-slate-500 font-medium mb-1">
                            Stack: {proj.technologies}
                          </p>
                        )}
                        {renderFormattedDescription(proj.description, tokens.bodySize, tokens.paragraphGap, tokens.accent)}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "certifications":
              return (
                <section key="certifications" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.certifications)}
                  <div className="space-y-1">
                    {certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="flex justify-between items-baseline text-slate-800 font-medium">
                        <span>
                          {cert.name} {cert.issuer ? `— ${cert.issuer}` : ""}
                        </span>
                        {cert.issueDate && <span className="text-[0.88em] text-slate-500">{cert.issueDate}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "languages":
              return (
                <section key="languages" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.languages)}
                  <div className="flex flex-wrap gap-2 text-slate-800">
                    {languages.map((l, idx) => (
                      <span key={l.id || idx} className="px-2 py-0.5 rounded-sm bg-slate-100 text-[0.9em]">
                        <strong>{l.language}</strong>
                        {l.proficiency ? ` (${l.proficiency})` : ""}
                      </span>
                    ))}
                  </div>
                </section>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
