"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, Sparkles } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function CreativePortfolioTemplate({ cvData }) {
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
    summary: sectionTitles.summary || "Creative Profile",
    experience: sectionTitles.experience || "Selected Experience",
    education: sectionTitles.education || "Education & Training",
    skills: sectionTitles.skills || "Creative & Tech Stack",
    projects: sectionTitles.projects || "Portfolio Highlights",
    certifications: sectionTitles.certifications || "Awards & Certifications",
    languages: sectionTitles.languages || "Languages",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  const sectionHeading = (title) => (
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-4 h-1 rounded-full" style={{ backgroundColor: tokens.accent }} />
      <h2
        className="font-black tracking-tight text-slate-900 uppercase text-[0.9em]"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );

  return (
    <div
      className="cv-creative-portfolio-template text-slate-800 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Creative Header ─── */}
      <header className="relative mb-7 pb-5 border-b-2 border-slate-900 flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[0.78em] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-sm"
              style={{
                backgroundColor: tokens.accent,
                color: "#ffffff",
              }}
            >
              Portfolio &amp; CV
            </span>
          </div>

          <h1
            className="font-black tracking-tighter text-slate-950"
            style={{ fontSize: tokens.nameSize }}
          >
            {personal.fullName || "Your Full Name"}
          </h1>

          {personal.professionalTitle && (
            <p
              className="font-bold tracking-tight text-slate-600 mt-0.5 text-[1.05em]"
              style={{ fontSize: tokens.titleSize }}
            >
              {personal.professionalTitle}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 mt-3 text-slate-600 text-[0.9em]"
            style={{ fontSize: tokens.metaSize }}
          >
            {personal.email && (
              <span className="flex items-center gap-1 font-semibold text-slate-900">
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
              <span className="flex items-center gap-1 font-semibold" style={{ color: tokens.accent }}>
                <Globe className="w-3 h-3" />
                <a href={personal.website} className="hover:underline">
                  {personal.website.replace(/^https?:\/\//, "")}
                </a>
              </span>
            )}
          </div>
        </div>

        {tokens.photo?.enabled && tokens.photo?.url && (
          <div className="relative">
            <div
              className="absolute -inset-1 rounded-2xl opacity-40 blur-xs"
              style={{ backgroundColor: tokens.accent }}
            />
            <div className="relative">
              {renderProfilePhoto(tokens.photo, tokens.photo.shape, 88, personal.fullName)}
            </div>
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
                  <p className="text-slate-700 leading-relaxed font-medium">
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
                        <div className="flex justify-between items-baseline font-black text-slate-900">
                          <span className="text-[1.05em]">{exp.position}</span>
                          <span className="text-[0.88em] font-bold text-slate-500">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline font-semibold text-slate-600 mb-1">
                          <span style={{ color: tokens.accent }}>{exp.company}</span>
                          {exp.location && <span className="text-[0.88em] font-normal text-slate-400">{exp.location}</span>}
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
                        <div className="flex justify-between items-baseline font-black text-slate-900">
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
                        className="px-2.5 py-1 rounded-md text-[0.88em] font-bold tracking-tight bg-slate-900 text-white"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.map((proj, idx) => (
                      <div
                        key={proj.id || idx}
                        className="project-item break-inside-avoid p-3 rounded-xl border-2 border-slate-900 bg-white shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start font-black text-slate-900">
                            <span>{proj.name}</span>
                            {proj.link && (
                              <a
                                href={proj.link}
                                className="text-[0.82em] font-bold text-indigo-600 hover:underline shrink-0 ml-2"
                              >
                                View ↗
                              </a>
                            )}
                          </div>
                          {proj.technologies && (
                            <p className="text-[0.82em] font-bold text-slate-400 mt-0.5 mb-1.5">
                              {proj.technologies}
                            </p>
                          )}
                          {renderFormattedDescription(proj.description, tokens.bodySize, tokens.paragraphGap, tokens.accent)}
                        </div>
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
                      <div key={cert.id || idx} className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>
                          {cert.name} {cert.issuer ? `— ${cert.issuer}` : ""}
                        </span>
                        {cert.issueDate && <span className="text-[0.88em] font-medium text-slate-500">{cert.issueDate}</span>}
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
                      <span key={l.id || idx} className="px-2.5 py-0.5 rounded-full border border-slate-300 text-slate-800 text-[0.88em] font-medium">
                        {l.language} {l.proficiency ? `(${l.proficiency})` : ""}
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
