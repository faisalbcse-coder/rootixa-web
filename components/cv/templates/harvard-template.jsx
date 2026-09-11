"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function HarvardTemplate({ cvData }) {
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

  // Section titles with fallbacks
  const titles = {
    summary: sectionTitles.summary || "PROFESSIONAL SUMMARY",
    experience: sectionTitles.experience || "EXPERIENCE",
    education: sectionTitles.education || "EDUCATION",
    skills: sectionTitles.skills || "SKILLS & COMPETENCIES",
    projects: sectionTitles.projects || "PROJECTS",
    certifications: sectionTitles.certifications || "CERTIFICATIONS",
    languages: sectionTitles.languages || "LANGUAGES",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  // Contact list for centered line
  const contacts = [
    personal.email && { label: personal.email, href: `mailto:${personal.email}` },
    personal.phone && { label: personal.phone, href: `tel:${personal.phone}` },
    personal.location && { label: personal.location },
    personal.website && { label: personal.website.replace(/^https?:\/\//, ""), href: personal.website },
    personal.linkedin && { label: "LinkedIn", href: personal.linkedin },
    personal.github && { label: "GitHub", href: personal.github },
  ].filter(Boolean);

  const sectionHeading = (title) => (
    <div className="mb-2.5 pb-1 border-b border-slate-900 flex items-center justify-between">
      <h2
        className="font-bold tracking-wider uppercase text-slate-900"
        style={{ fontSize: tokens.headingSize, fontFamily: tokens.fontCss }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-harvard-template text-slate-900 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Header ─── */}
      <header className="text-center mb-6 pb-4 border-b-2 border-slate-900">
        {tokens.photo?.enabled && tokens.photo?.url && (
          <div className="flex justify-center mb-3">
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 76, personal.fullName)}
          </div>
        )}

        <h1
          className="font-serif font-bold tracking-tight text-slate-950 uppercase"
          style={{ fontSize: tokens.nameSize }}
        >
          {personal.fullName || "Your Full Name"}
        </h1>

        {personal.professionalTitle && (
          <p
            className="font-medium text-slate-700 tracking-wide mt-1 italic"
            style={{ fontSize: tokens.titleSize }}
          >
            {personal.professionalTitle}
          </p>
        )}

        {contacts.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-slate-600 mt-2 font-normal"
            style={{ fontSize: tokens.metaSize }}
          >
            {contacts.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-slate-400 select-none">•</span>}
                {c.href ? (
                  <a href={c.href} className="hover:underline text-slate-800">
                    {c.label}
                  </a>
                ) : (
                  <span>{c.label}</span>
                )}
              </React.Fragment>
            ))}
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
                          <span>{exp.position || "Position"}</span>
                          <span className="text-[0.9em] font-normal text-slate-600 italic">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-slate-700 mb-1">
                          <span>{exp.company || "Company"}</span>
                          {exp.location && <span className="text-[0.9em] not-italic">{exp.location}</span>}
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
                          <span>{edu.institution || "Institution"}</span>
                          <span className="text-[0.9em] font-normal text-slate-600 italic">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-slate-700">
                          <span>
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          {edu.gpa && <span className="text-[0.9em] not-italic">GPA: {edu.gpa}</span>}
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
                    <span className="font-semibold text-slate-950">Relevant Skills: </span>
                    {skills.map((s, idx) => (
                      <span key={s.id || idx}>
                        {s.name}
                        {idx < skills.length - 1 ? ", " : ""}
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
                          <span>{proj.name || "Project Name"}</span>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] font-normal text-slate-600 hover:underline">
                              {proj.link.replace(/^https?:\/\//, "")}
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.9em] italic text-slate-600 mb-1">
                            Technologies: {proj.technologies}
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
                  <div className="space-y-1.5">
                    {certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="flex justify-between items-baseline">
                        <span className="font-medium text-slate-900">
                          {cert.name} {cert.issuer ? `— ${cert.issuer}` : ""}
                        </span>
                        {cert.issueDate && <span className="text-[0.9em] text-slate-600">{cert.issueDate}</span>}
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
                        <strong className="font-semibold text-slate-950">{l.language}</strong>
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
