"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function ElegantSerifTemplate({ cvData }) {
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
    summary: sectionTitles.summary || "Summary of Qualifications",
    experience: sectionTitles.experience || "Career History",
    education: sectionTitles.education || "Academic Background",
    skills: sectionTitles.skills || "Areas of Expertise",
    projects: sectionTitles.projects || "Notable Work",
    certifications: sectionTitles.certifications || "Credentials & Accreditations",
    languages: sectionTitles.languages || "Languages",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  const sectionHeading = (title) => (
    <div className="flex items-center gap-3 mb-2.5 pb-1 border-b border-amber-900/20">
      <h2
        className="font-serif font-bold tracking-wider uppercase text-amber-950 text-[0.9em]"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-elegant-serif-template text-slate-800 bg-[#FCFBF8]"
      style={{
        fontFamily: "'Merriweather', 'Georgia', serif",
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Elegant Centered Header ─── */}
      <header className="text-center mb-6 pb-4 border-b border-stone-300">
        {tokens.photo?.enabled && tokens.photo?.url && (
          <div className="flex justify-center mb-3">
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 78, personal.fullName)}
          </div>
        )}

        <h1
          className="font-serif font-normal text-stone-900 tracking-tight"
          style={{ fontSize: tokens.nameSize }}
        >
          {personal.fullName || "Your Full Name"}
        </h1>

        {personal.professionalTitle && (
          <p
            className="font-serif italic text-stone-600 mt-1"
            style={{ fontSize: tokens.titleSize }}
          >
            {personal.professionalTitle}
          </p>
        )}

        <div
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-2.5 text-stone-600 text-[0.9em]"
          style={{ fontSize: tokens.metaSize }}
        >
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="hover:underline">
              {personal.email}
            </a>
          )}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.location && <span>• {personal.location}</span>}
          {personal.website && (
            <a href={personal.website} className="hover:underline">
              • {personal.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </header>

      {/* ─── Sections ─── */}
      <div className="space-y-4">
        {visibleSections.map((sectionKey) => {
          switch (sectionKey) {
            case "summary":
              return (
                <section key="summary" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.summary)}
                  <p className="text-stone-700 leading-relaxed text-justify">
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
                        <div className="flex justify-between items-baseline font-bold text-stone-900">
                          <span className="text-[1.02em]">{exp.position}</span>
                          <span className="text-[0.88em] font-normal italic text-stone-500">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-stone-600 mb-1">
                          <span>{exp.company}</span>
                          {exp.location && <span className="text-[0.88em] not-italic">{exp.location}</span>}
                        </div>
                        {renderFormattedDescription(exp.description, tokens.bodySize, tokens.paragraphGap, "#78350f")}
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
                        <div className="flex justify-between items-baseline font-bold text-stone-900">
                          <span>
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          <span className="text-[0.88em] font-normal italic text-stone-500">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline italic text-stone-600">
                          <span>{edu.institution}</span>
                          {edu.gpa && <span className="text-[0.88em] not-italic">GPA: {edu.gpa}</span>}
                        </div>
                        {edu.description && (
                          <div className="mt-1">
                            {renderFormattedDescription(edu.description, tokens.bodySize, tokens.paragraphGap, "#78350f")}
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
                  <p className="text-stone-700 leading-relaxed">
                    {skills.map((s, idx) => (
                      <span key={s.id || idx}>
                        {s.name}
                        {idx < skills.length - 1 ? "  ·  " : ""}
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
                        <div className="flex justify-between items-baseline font-bold text-stone-900">
                          <span>{proj.name}</span>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] font-normal italic text-stone-600 hover:underline">
                              Reference
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.88em] italic text-stone-500 mb-0.5">
                            Competencies: {proj.technologies}
                          </p>
                        )}
                        {renderFormattedDescription(proj.description, tokens.bodySize, tokens.paragraphGap, "#78350f")}
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
                      <div key={cert.id || idx} className="flex justify-between items-baseline text-stone-800">
                        <span className="font-medium">
                          {cert.name} {cert.issuer ? `— ${cert.issuer}` : ""}
                        </span>
                        {cert.issueDate && <span className="text-[0.88em] text-stone-500 italic">{cert.issueDate}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              );

            case "languages":
              return (
                <section key="languages" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {sectionHeading(titles.languages)}
                  <div className="text-stone-700">
                    {languages.map((l, idx) => (
                      <span key={l.id || idx}>
                        <strong>{l.language}</strong>
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
