"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function SimpleClassicTemplate({ cvData }) {
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
    experience: sectionTitles.experience || "Professional Experience",
    education: sectionTitles.education || "Education & Qualifications",
    skills: sectionTitles.skills || "Key Competencies",
    projects: sectionTitles.projects || "Selected Projects",
    certifications: sectionTitles.certifications || "Honors & Certifications",
    languages: sectionTitles.languages || "Languages",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  const contacts = [
    personal.email && { label: personal.email, href: `mailto:${personal.email}` },
    personal.phone && { label: personal.phone, href: `tel:${personal.phone}` },
    personal.location && { label: personal.location },
    personal.website && { label: personal.website.replace(/^https?:\/\//, ""), href: personal.website },
    personal.linkedin && { label: "LinkedIn", href: personal.linkedin },
  ].filter(Boolean);

  const sectionHeading = (title) => (
    <div className="mb-2 pb-0.5 border-b border-slate-300">
      <h2
        className="font-serif font-bold text-slate-900 tracking-wider uppercase text-[0.95em]"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-simple-classic-template text-slate-800 bg-white"
      style={{
        fontFamily: tokens.fontCss || "Georgia, serif",
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Top Bar Accent ─── */}
      <div className="w-full h-1 mb-5" style={{ backgroundColor: tokens.accent }} />

      {/* ─── Header ─── */}
      <header className="flex items-center justify-between gap-4 mb-5 pb-3">
        <div className="flex-1">
          <h1
            className="font-serif font-bold text-slate-950 tracking-normal"
            style={{ fontSize: tokens.nameSize }}
          >
            {personal.fullName || "Your Full Name"}
          </h1>

          {personal.professionalTitle && (
            <p
              className="font-serif italic text-slate-600 mt-0.5"
              style={{ fontSize: tokens.titleSize }}
            >
              {personal.professionalTitle}
            </p>
          )}

          {contacts.length > 0 && (
            <div
              className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 mt-2"
              style={{ fontSize: tokens.metaSize }}
            >
              {contacts.map((c, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-300">|</span>}
                  {c.href ? (
                    <a href={c.href} className="hover:underline text-slate-700">
                      {c.label}
                    </a>
                  ) : (
                    <span>{c.label}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
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
                  <p className="text-slate-700 leading-relaxed font-serif">
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
                        <div className="flex justify-between items-baseline">
                          <strong className="font-bold text-slate-900">{exp.position}</strong>
                          <span className="text-[0.9em] text-slate-500 font-serif italic">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700 italic mb-1">
                          <span>{exp.company}</span>
                          {exp.location && <span className="text-[0.88em] not-italic text-slate-500">{exp.location}</span>}
                        </div>
                        {renderFormattedDescription(exp.description, tokens.bodySize, tokens.paragraphGap, "#475569")}
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
                        <div className="flex justify-between items-baseline">
                          <strong className="font-bold text-slate-900">
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </strong>
                          <span className="text-[0.9em] text-slate-500 italic">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-slate-700">
                          <span>{edu.institution}</span>
                          {edu.gpa && <span className="text-[0.88em] not-italic text-slate-500">GPA: {edu.gpa}</span>}
                        </div>
                        {edu.description && (
                          <div className="mt-1">
                            {renderFormattedDescription(edu.description, tokens.bodySize, tokens.paragraphGap, "#475569")}
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
                  <p className="text-slate-700 leading-relaxed">
                    {skills.map((s, idx) => (
                      <span key={s.id || idx}>
                        {s.name}
                        {idx < skills.length - 1 ? "  •  " : ""}
                      </span>
                    ))}
                  </p>
                </section>
              );

            case "projects":
              return (
                <section key="projects" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.projects)}
                  <div className="space-y-2.5">
                    {projects.map((proj, idx) => (
                      <div key={proj.id || idx} className="project-item break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                          <strong className="font-bold text-slate-900">{proj.name}</strong>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] text-slate-600 hover:underline">
                              Link
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.88em] italic text-slate-500 mb-0.5">
                            Key tools: {proj.technologies}
                          </p>
                        )}
                        {renderFormattedDescription(proj.description, tokens.bodySize, tokens.paragraphGap, "#475569")}
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
                        <span className="font-serif font-medium text-slate-900">
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
                  <div className="text-slate-700">
                    {languages.map((l, idx) => (
                      <span key={l.id || idx}>
                        <strong className="font-semibold text-slate-900">{l.language}</strong>
                        {l.proficiency ? ` (${l.proficiency})` : ""}
                        {idx < languages.length - 1 ? ", " : ""}
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
