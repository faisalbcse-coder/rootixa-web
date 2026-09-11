"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, FolderGit2 } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function TechModernTemplate({ cvData }) {
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
    summary: sectionTitles.summary || "About Me",
    experience: sectionTitles.experience || "Work Experience",
    education: sectionTitles.education || "Education",
    skills: sectionTitles.skills || "Technical Skills",
    projects: sectionTitles.projects || "Featured Projects",
    certifications: sectionTitles.certifications || "Certifications",
    languages: sectionTitles.languages || "Languages",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  const sectionHeading = (title) => (
    <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-100">
      <div className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: tokens.accent }} />
      <h2
        className="font-bold tracking-tight text-slate-900"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-tech-modern-template text-slate-800 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Modern Tech Header ─── */}
      <header className="flex items-center justify-between gap-5 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div className="flex-1">
          <h1
            className="font-black tracking-tight text-slate-900"
            style={{ fontSize: tokens.nameSize }}
          >
            {personal.fullName || "Your Full Name"}
          </h1>

          {personal.professionalTitle && (
            <p
              className="font-semibold tracking-wide mt-0.5"
              style={{ fontSize: tokens.titleSize, color: tokens.accent }}
            >
              {personal.professionalTitle}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-slate-600"
            style={{ fontSize: tokens.metaSize }}
          >
            {personal.email && (
              <span className="flex items-center gap-1 font-medium">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <a href={`mailto:${personal.email}`} className="hover:underline text-slate-800">
                  {personal.email}
                </a>
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1 font-medium">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{personal.phone}</span>
              </span>
            )}
            {personal.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{personal.location}</span>
              </span>
            )}
            {personal.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                <a href={personal.website} className="hover:underline text-indigo-600">
                  {personal.website.replace(/^https?:\/\//, "")}
                </a>
              </span>
            )}
            {personal.github && (
              <span className="flex items-center gap-1">
                <FolderGit2 className="w-3 h-3 text-slate-400 shrink-0" />
                <a href={personal.github} className="hover:underline text-slate-800">
                  GitHub
                </a>
              </span>
            )}
          </div>
        </div>

        {tokens.photo?.enabled && tokens.photo?.url && (
          <div>
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 84, personal.fullName)}
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
                  <div className="space-y-3.5">
                    {experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="experience-item break-inside-avoid">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span className="text-[1.05em]">{exp.position}</span>
                          <span className="text-[0.88em] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-600 font-medium mb-1 text-[0.95em]">
                          <span style={{ color: tokens.accent }}>{exp.company}</span>
                          {exp.location && <span>{exp.location}</span>}
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
                  <div className="space-y-2.5">
                    {education.map((edu, idx) => (
                      <div key={edu.id || idx} className="education-item break-inside-avoid">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          <span className="text-[0.88em] font-medium text-slate-500">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-600 font-medium">
                          <span>{edu.institution}</span>
                          {edu.gpa && <span className="text-[0.88em]">GPA: {edu.gpa}</span>}
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
                        className="px-2.5 py-1 rounded-lg text-[0.9em] font-semibold bg-indigo-50/70 text-indigo-800 border border-indigo-100"
                        style={{
                          backgroundColor: `${tokens.accent}12`,
                          color: tokens.accent,
                          borderColor: `${tokens.accent}30`,
                        }}
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
                  <div className="space-y-2.5">
                    {projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="project-item break-inside-avoid p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{proj.name}</span>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] font-medium text-indigo-600 hover:underline">
                              Live Demo ↗
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.85em] font-medium text-slate-500 mb-1">
                            {proj.technologies}
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
                      <div key={cert.id || idx} className="flex justify-between items-baseline font-medium text-slate-800">
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
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l, idx) => (
                      <span key={l.id || idx} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[0.9em]">
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
