"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function NordicCleanTemplate({ cvData }) {
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
    <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-200">
      <h2
        className="font-medium tracking-wider uppercase text-slate-600 text-[0.85em]"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-nordic-clean-template text-slate-800 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Nordic Header ─── */}
      <header className="flex items-start justify-between gap-6 mb-7 pb-4 border-b border-slate-100">
        <div className="flex-1">
          <h1
            className="font-normal tracking-tight text-slate-900"
            style={{ fontSize: tokens.nameSize }}
          >
            {personal.fullName || "Your Full Name"}
          </h1>

          {personal.professionalTitle && (
            <p
              className="font-light text-slate-500 mt-1"
              style={{ fontSize: tokens.titleSize }}
            >
              {personal.professionalTitle}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-slate-500 text-[0.9em]"
            style={{ fontSize: tokens.metaSize }}
          >
            {personal.email && (
              <a href={`mailto:${personal.email}`} className="hover:text-slate-800">
                {personal.email}
              </a>
            )}
            {personal.phone && <span>· {personal.phone}</span>}
            {personal.location && <span>· {personal.location}</span>}
            {personal.website && (
              <a href={personal.website} className="hover:text-slate-800">
                · {personal.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {tokens.photo?.enabled && tokens.photo?.url && (
          <div>
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 80, personal.fullName)}
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
                  <p className="text-slate-600 leading-relaxed font-light">
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
                        <div className="flex justify-between items-baseline font-medium text-slate-900">
                          <span>{exp.position}</span>
                          <span className="text-[0.88em] text-slate-400 font-light">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-500 text-[0.92em] mb-1">
                          <span>{exp.company}</span>
                          {exp.location && <span>{exp.location}</span>}
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
                  <div className="space-y-2.5">
                    {education.map((edu, idx) => (
                      <div key={edu.id || idx} className="education-item break-inside-avoid">
                        <div className="flex justify-between items-baseline font-medium text-slate-900">
                          <span>
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          <span className="text-[0.88em] text-slate-400 font-light">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-500 text-[0.92em]">
                          <span>{edu.institution}</span>
                          {edu.gpa && <span>GPA: {edu.gpa}</span>}
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
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, idx) => (
                      <span
                        key={s.id || idx}
                        className="px-2.5 py-0.5 rounded-full text-[0.88em] bg-slate-50 text-slate-700 border border-slate-200/60"
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
                      <div key={proj.id || idx} className="project-item break-inside-avoid">
                        <div className="flex justify-between items-baseline font-medium text-slate-900">
                          <span>{proj.name}</span>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] text-slate-500 hover:text-slate-800">
                              link
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.85em] text-slate-400 mb-0.5">
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
                  <div className="space-y-1 text-[0.92em]">
                    {certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="flex justify-between items-baseline text-slate-700">
                        <span>
                          {cert.name} {cert.issuer ? `— ${cert.issuer}` : ""}
                        </span>
                        {cert.issueDate && <span className="text-[0.88em] text-slate-400">{cert.issueDate}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "languages":
              return (
                <section key="languages" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.languages)}
                  <div className="text-slate-600 text-[0.92em]">
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
