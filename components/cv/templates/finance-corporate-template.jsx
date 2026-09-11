"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function FinanceCorporateTemplate({ cvData }) {
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
    summary: sectionTitles.summary || "PROFESSIONAL PROFILE",
    experience: sectionTitles.experience || "WORK EXPERIENCE",
    education: sectionTitles.education || "EDUCATION",
    skills: sectionTitles.skills || "CORE COMPETENCIES & TOOLS",
    projects: sectionTitles.projects || "SIGNIFICANT PROJECTS",
    certifications: sectionTitles.certifications || "CERTIFICATIONS & LICENSES",
    languages: sectionTitles.languages || "LANGUAGES",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  const sectionHeading = (title) => (
    <div className="mb-2.5 pb-0.5 border-b-2 border-slate-800">
      <h2
        className="font-bold uppercase tracking-wider text-slate-900 text-[0.88em]"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-finance-corporate-template text-slate-800 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between gap-5 mb-5 pb-3 border-b border-slate-300">
        <div className="flex-1">
          <h1
            className="font-bold tracking-tight text-slate-950 uppercase"
            style={{ fontSize: tokens.nameSize }}
          >
            {personal.fullName || "Your Full Name"}
          </h1>

          {personal.professionalTitle && (
            <p
              className="font-semibold text-slate-700 tracking-wide uppercase text-[0.9em] mt-0.5"
              style={{ fontSize: tokens.titleSize }}
            >
              {personal.professionalTitle}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-slate-600 text-[0.92em]"
            style={{ fontSize: tokens.metaSize }}
          >
            {personal.email && (
              <span>
                <strong>Email:</strong> {personal.email}
              </span>
            )}
            {personal.phone && (
              <span>
                <strong>Phone:</strong> {personal.phone}
              </span>
            )}
            {personal.location && (
              <span>
                <strong>Location:</strong> {personal.location}
              </span>
            )}
            {personal.linkedin && (
              <span>
                <strong>LinkedIn:</strong> {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
              </span>
            )}
          </div>
        </div>

        {tokens.photo?.enabled && tokens.photo?.url && (
          <div>
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 82, personal.fullName)}
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
                  <p className="text-slate-800 leading-relaxed text-justify">
                    {summary}
                  </p>
                </section>
              );

            case "experience":
              return (
                <section key="experience" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.experience)}
                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="experience-item break-inside-avoid">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{exp.position}</span>
                          <span className="text-[0.88em] font-normal uppercase text-slate-600">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline font-semibold text-slate-700 mb-1">
                          <span>{exp.company}</span>
                          {exp.location && <span className="text-[0.88em] font-normal uppercase text-slate-500">{exp.location}</span>}
                        </div>
                        {renderFormattedDescription(exp.description, tokens.bodySize, tokens.paragraphGap, "#1e293b")}
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
                          <span className="text-[0.88em] font-normal uppercase text-slate-600">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700">
                          <span className="font-semibold">{edu.institution}</span>
                          {edu.gpa && <span className="text-[0.88em]">Cumulative GPA: {edu.gpa}</span>}
                        </div>
                        {edu.description && (
                          <div className="mt-1">
                            {renderFormattedDescription(edu.description, tokens.bodySize, tokens.paragraphGap, "#1e293b")}
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
                  <div className="text-slate-800 leading-relaxed">
                    {skills.map((s, idx) => (
                      <span key={s.id || idx}>
                        <strong className="font-semibold">{s.name}</strong>
                        {idx < skills.length - 1 ? " | " : ""}
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
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{proj.name}</span>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] font-normal text-slate-600 hover:underline">
                              Reference
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.88em] text-slate-600 mb-0.5">
                            Focus: {proj.technologies}
                          </p>
                        )}
                        {renderFormattedDescription(proj.description, tokens.bodySize, tokens.paragraphGap, "#1e293b")}
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
                      <div key={cert.id || idx} className="flex justify-between items-baseline">
                        <span className="font-bold text-slate-900">
                          {cert.name} {cert.issuer ? `(${cert.issuer})` : ""}
                        </span>
                        {cert.issueDate && <span className="text-[0.88em] text-slate-600 uppercase">{cert.issueDate}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "languages":
              return (
                <section key="languages" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.languages)}
                  <div className="text-slate-800">
                    {languages.map((l, idx) => (
                      <span key={l.id || idx}>
                        <strong>{l.language}</strong>
                        {l.proficiency ? `: ${l.proficiency}` : ""}
                        {idx < languages.length - 1 ? "  |  " : ""}
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
