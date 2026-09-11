"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function SiliconMinimalTemplate({ cvData }) {
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
    skills: sectionTitles.skills || "Skills",
    projects: sectionTitles.projects || "Projects",
    certifications: sectionTitles.certifications || "Certifications",
    languages: sectionTitles.languages || "Languages",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  const sectionHeading = (title) => (
    <div className="mb-2">
      <h2
        className="font-medium tracking-widest uppercase text-slate-400 text-[0.85em]"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-silicon-minimal-template text-slate-800 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Header ─── */}
      <header className="flex items-start justify-between gap-6 mb-7">
        <div className="flex-1">
          <h1
            className="font-light tracking-tight text-slate-900"
            style={{ fontSize: tokens.nameSize }}
          >
            {personal.fullName || "Your Full Name"}
          </h1>

          {personal.professionalTitle && (
            <p
              className="font-normal text-slate-500 mt-1"
              style={{ fontSize: tokens.titleSize }}
            >
              {personal.professionalTitle}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-slate-500 font-mono text-[0.9em]"
            style={{ fontSize: tokens.metaSize }}
          >
            {personal.email && (
              <a href={`mailto:${personal.email}`} className="hover:text-slate-900">
                {personal.email}
              </a>
            )}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
            {personal.website && (
              <a href={personal.website} className="hover:text-slate-900">
                {personal.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            {personal.linkedin && (
              <a href={personal.linkedin} className="hover:text-slate-900">
                LinkedIn
              </a>
            )}
          </div>
        </div>

        {tokens.photo?.enabled && tokens.photo?.url && (
          <div>
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 76, personal.fullName)}
          </div>
        )}
      </header>

      {/* ─── Sections ─── */}
      <div className="space-y-5">
        {visibleSections.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              return (
                <section key="summary" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.summary)}
                  <p className="text-slate-700 leading-relaxed max-w-2xl font-normal">
                    {summary}
                  </p>
                </section>
              );

            case "experience":
              return (
                <section key="experience" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.experience)}
                  <div className="space-y-4">
                    {experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="experience-item break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-slate-900 text-[1.02em]">
                            {exp.position}
                          </span>
                          <span className="text-[0.85em] font-mono text-slate-400">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "—" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[0.92em] mb-1">
                          {exp.company} {exp.location ? `· ${exp.location}` : ""}
                        </div>
                        {renderFormattedDescription(exp.description, tokens.bodySize, tokens.paragraphGap, "#94a3b8")}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "education":
              return (
                <section key="education" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.education)}
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div key={edu.id || idx} className="education-item break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-slate-900">
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          <span className="text-[0.85em] font-mono text-slate-400">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "—" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="text-slate-500 text-[0.92em]">
                          {edu.institution} {edu.gpa ? `· GPA ${edu.gpa}` : ""}
                        </div>
                        {edu.description && (
                          <div className="mt-1">
                            {renderFormattedDescription(edu.description, tokens.bodySize, tokens.paragraphGap, "#94a3b8")}
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
                  <div className="text-slate-700 leading-relaxed">
                    {skills.map((s, idx) => (
                      <span key={s.id || idx}>
                        {s.name}
                        {idx < skills.length - 1 ? "  /  " : ""}
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
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-slate-900">{proj.name}</span>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] text-slate-500 hover:text-slate-900 font-mono">
                              {proj.link.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.85em] text-slate-400 font-mono mb-1">
                            {proj.technologies}
                          </p>
                        )}
                        {renderFormattedDescription(proj.description, tokens.bodySize, tokens.paragraphGap, "#94a3b8")}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "certifications":
              return (
                <section key="certifications" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.certifications)}
                  <div className="space-y-1 text-slate-700">
                    {certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="flex justify-between items-baseline">
                        <span>
                          {cert.name} {cert.issuer ? `— ${cert.issuer}` : ""}
                        </span>
                        {cert.issueDate && <span className="text-[0.85em] font-mono text-slate-400">{cert.issueDate}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "languages":
              return (
                <section key="languages" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.languages)}
                  <div className="text-slate-700">
                    {languages.map((l, idx) => (
                      <span key={l.id || idx}>
                        {l.language} {l.proficiency ? `(${l.proficiency})` : ""}
                        {idx < languages.length - 1 ? "  ·  " : ""}
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
