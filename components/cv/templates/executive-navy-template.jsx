"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, Award } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function ExecutiveNavyTemplate({ cvData }) {
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
    summary: sectionTitles.summary || "Executive Profile",
    experience: sectionTitles.experience || "Leadership & Experience",
    education: sectionTitles.education || "Education & Credentials",
    skills: sectionTitles.skills || "Core Competencies",
    projects: sectionTitles.projects || "Key Initiatives & Projects",
    certifications: sectionTitles.certifications || "Executive Certifications",
    languages: sectionTitles.languages || "Languages",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  const sectionHeading = (title) => (
    <div className="flex items-center gap-2 mb-2.5 pb-1 border-b-2 border-slate-900">
      <h2
        className="font-bold uppercase tracking-widest text-slate-950 text-[0.92em]"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-executive-navy-template text-slate-800 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
      }}
    >
      {/* ─── Executive Navy Header Block ─── */}
      <header
        className="text-white p-6 sm:p-7 flex items-center justify-between gap-6"
        style={{
          backgroundColor: tokens.headerBg || "#0f172a",
        }}
      >
        <div className="flex-1">
          <h1
            className="font-bold tracking-tight text-white uppercase text-[1.6em]"
            style={{ fontSize: tokens.nameSize }}
          >
            {personal.fullName || "Your Full Name"}
          </h1>

          {personal.professionalTitle && (
            <p
              className="font-medium tracking-wide mt-1 text-slate-300 uppercase text-[0.9em]"
              style={{ fontSize: tokens.titleSize }}
            >
              {personal.professionalTitle}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-slate-300 font-light"
            style={{ fontSize: tokens.metaSize }}
          >
            {personal.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <a href={`mailto:${personal.email}`} className="text-white hover:underline">
                  {personal.email}
                </a>
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{personal.phone}</span>
              </span>
            )}
            {personal.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{personal.location}</span>
              </span>
            )}
            {personal.website && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <a href={personal.website} className="text-white hover:underline">
                  {personal.website.replace(/^https?:\/\//, "")}
                </a>
              </span>
            )}
          </div>
        </div>

        {tokens.photo?.enabled && tokens.photo?.url && (
          <div className="border-2 border-white/40 p-0.5 rounded-full">
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 88, personal.fullName)}
          </div>
        )}
      </header>

      {/* ─── Body Content ─── */}
      <div style={{ padding: tokens.pageMargin }} className="space-y-4">
        {visibleSections.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              return (
                <section key="summary" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.summary)}
                  <p className="text-slate-700 leading-relaxed text-justify">
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
                      <div
                        key={exp.id || idx}
                        className="experience-item pl-3 border-l-2 border-slate-900 break-inside-avoid"
                      >
                        <div className="flex justify-between items-baseline font-bold text-slate-950">
                          <span className="text-[1.05em]">{exp.position}</span>
                          <span className="text-[0.88em] font-medium text-slate-600">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700 font-semibold mb-1 text-[0.95em]">
                          <span>{exp.company}</span>
                          {exp.location && <span className="text-[0.88em] font-normal text-slate-500">{exp.location}</span>}
                        </div>
                        {renderFormattedDescription(exp.description, tokens.bodySize, tokens.paragraphGap, "#0f172a")}
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
                      <div key={edu.id || idx} className="education-item pl-3 border-l-2 border-slate-300 break-inside-avoid">
                        <div className="flex justify-between items-baseline font-bold text-slate-950">
                          <span>
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          <span className="text-[0.88em] font-medium text-slate-600">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700">
                          <span className="font-semibold">{edu.institution}</span>
                          {edu.gpa && <span className="text-[0.88em]">GPA: {edu.gpa}</span>}
                        </div>
                        {edu.description && (
                          <div className="mt-1">
                            {renderFormattedDescription(edu.description, tokens.bodySize, tokens.paragraphGap, "#0f172a")}
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {skills.map((s, idx) => (
                      <div key={s.id || idx} className="flex items-center gap-1.5 text-slate-800">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                        <span className="font-medium text-[0.92em]">{s.name}</span>
                      </div>
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
                            <a href={proj.link} className="text-[0.85em] font-normal text-indigo-700 hover:underline">
                              Initiative Link
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.88em] text-slate-500 mb-0.5">
                            Focus: {proj.technologies}
                          </p>
                        )}
                        {renderFormattedDescription(proj.description, tokens.bodySize, tokens.paragraphGap, "#0f172a")}
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
                      <div key={cert.id || idx} className="flex justify-between items-baseline font-semibold text-slate-900">
                        <span>
                          {cert.name} {cert.issuer ? `— ${cert.issuer}` : ""}
                        </span>
                        {cert.issueDate && <span className="text-[0.88em] font-normal text-slate-500">{cert.issueDate}</span>}
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
                        <strong className="font-semibold">{l.language}</strong>
                        {l.proficiency ? ` (${l.proficiency})` : ""}
                        {idx < languages.length - 1 ? "  •  " : ""}
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
