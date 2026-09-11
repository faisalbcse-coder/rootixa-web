"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, FolderGit2 } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function AtsCleanTemplate({ cvData }) {
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
    <div className="mb-2.5 pb-1 border-b-2" style={{ borderColor: tokens.accent }}>
      <h2
        className="font-bold uppercase tracking-wide"
        style={{ fontSize: tokens.headingSize, color: tokens.accent }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-ats-clean-template text-slate-900 bg-white"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Header ─── */}
      <header className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-200">
        <div className="flex-1">
          <h1
            className="font-black tracking-tight text-slate-950"
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
            className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2 text-slate-600"
            style={{ fontSize: tokens.metaSize }}
          >
            {personal.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                <a href={`mailto:${personal.email}`} className="hover:underline text-slate-800">
                  {personal.email}
                </a>
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                <a href={`tel:${personal.phone}`} className="text-slate-800">
                  {personal.phone}
                </a>
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
                <a href={personal.website} className="hover:underline text-slate-800">
                  {personal.website.replace(/^https?:\/\//, "")}
                </a>
              </span>
            )}
            {personal.linkedin && (
              <span className="flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                <a href={personal.linkedin} className="hover:underline text-slate-800">
                  LinkedIn
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
                  <p className="text-slate-800 leading-relaxed">
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
                          <span style={{ fontSize: `calc(${tokens.bodySize} * 1.05)` }}>
                            {exp.position || "Position"}
                          </span>
                          <span className="text-[0.9em] font-normal text-slate-500">
                            {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                            {exp.current ? "Present" : exp.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700 font-medium mb-1">
                          <span>{exp.company || "Company"}</span>
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
                  <div className="space-y-2.5">
                    {education.map((edu, idx) => (
                      <div key={edu.id || idx} className="education-item break-inside-avoid">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          <span className="text-[0.9em] font-normal text-slate-500">
                            {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                            {edu.current ? "Present" : edu.endDate}
                          </span>
                        </div>
                        <div className="flex justify-between items-baseline text-slate-700 font-medium">
                          <span>{edu.institution || "Institution"}</span>
                          {edu.gpa && <span className="text-[0.88em] text-slate-500 font-normal">GPA: {edu.gpa}</span>}
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
                        className="px-2.5 py-0.5 rounded-md text-[0.9em] font-medium bg-slate-100 text-slate-800 border border-slate-200/80"
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
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span>{proj.name || "Project Name"}</span>
                          {proj.link && (
                            <a href={proj.link} className="text-[0.85em] font-normal text-indigo-600 hover:underline">
                              View Project
                            </a>
                          )}
                        </div>
                        {proj.technologies && (
                          <p className="text-[0.88em] text-slate-500 mb-0.5">
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
                      <div key={cert.id || idx} className="flex justify-between items-baseline">
                        <span className="font-semibold text-slate-900">
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
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-800">
                    {languages.map((l, idx) => (
                      <span key={l.id || idx}>
                        <strong>{l.language}</strong>
                        {l.proficiency ? `: ${l.proficiency}` : ""}
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
