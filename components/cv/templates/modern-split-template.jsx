"use client";

import React, { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, Award, Languages, GraduationCap } from "lucide-react";
import {
  extractDesignTokens,
  checkHasContent,
  renderFormattedDescription,
  renderProfilePhoto,
} from "./template-helpers";

export function ModernSplitTemplate({ cvData }) {
  const {
    personal = {},
    summary = "",
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
    sectionTitles = {},
    design = {},
  } = cvData || {};

  const tokens = extractDesignTokens(design);
  const hasContent = useMemo(() => checkHasContent(cvData), [cvData]);

  const titles = {
    summary: sectionTitles.summary || "Profile",
    experience: sectionTitles.experience || "Experience",
    education: sectionTitles.education || "Education",
    skills: sectionTitles.skills || "Skills",
    projects: sectionTitles.projects || "Projects",
    certifications: sectionTitles.certifications || "Certificates",
    languages: sectionTitles.languages || "Languages",
  };

  const sidebarHeading = (title) => (
    <div className="mb-2 pb-1 border-b border-slate-300">
      <h3
        className="font-bold uppercase tracking-wider text-slate-900 text-[0.85em]"
        style={{ color: tokens.accent }}
      >
        {title}
      </h3>
    </div>
  );

  const mainHeading = (title) => (
    <div className="mb-2.5 pb-1 border-b-2" style={{ borderColor: `${tokens.accent}35` }}>
      <h2
        className="font-bold uppercase tracking-wider text-slate-900 text-[0.9em]"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
    </div>
  );

  return (
    <div
      className="cv-modern-split-template text-slate-800 bg-white flex min-h-full"
      style={{
        fontFamily: tokens.fontCss,
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
      }}
    >
      {/* ─── Left Sidebar (32% width) ─── */}
      <aside className="w-[34%] bg-slate-50 p-6 border-r border-slate-200 shrink-0 space-y-5">
        {/* Photo */}
        {tokens.photo?.enabled && tokens.photo?.url ? (
          <div className="flex justify-center mb-4">
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 100, personal.fullName)}
          </div>
        ) : (
          <div className="h-2" />
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          {sidebarHeading("Contact")}
          <div className="space-y-2 text-[0.92em] text-slate-600">
            {personal.email && (
              <div className="flex items-start gap-1.5 break-all">
                <Mail className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                <a href={`mailto:${personal.email}`} className="hover:underline text-slate-800">
                  {personal.email}
                </a>
              </div>
            )}
            {personal.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{personal.phone}</span>
              </div>
            )}
            {personal.location && (
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                <span>{personal.location}</span>
              </div>
            )}
            {personal.website && (
              <div className="flex items-start gap-1.5 break-all">
                <Globe className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                <a href={personal.website} className="hover:underline text-indigo-600">
                  {personal.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {personal.linkedin && (
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={personal.linkedin} className="hover:underline text-slate-800">
                  LinkedIn
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {hasContent.skills && (
          <div>
            {sidebarHeading(titles.skills)}
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => (
                <span
                  key={s.id || idx}
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[0.88em] font-medium shadow-2xs"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {hasContent.languages && (
          <div>
            {sidebarHeading(titles.languages)}
            <div className="space-y-1 text-[0.92em] text-slate-700">
              {languages.map((l, idx) => (
                <div key={l.id || idx} className="flex justify-between">
                  <span className="font-semibold">{l.language}</span>
                  <span className="text-slate-500 text-[0.9em]">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {hasContent.certifications && (
          <div>
            {sidebarHeading(titles.certifications)}
            <div className="space-y-1.5 text-[0.9em]">
              {certifications.map((c, idx) => (
                <div key={c.id || idx}>
                  <div className="font-semibold text-slate-800">{c.name}</div>
                  <div className="text-slate-500 text-[0.88em]">{c.issuer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* ─── Right Main Body (66% width) ─── */}
      <main className="flex-1 p-6 space-y-4">
        {/* Header */}
        <header className="mb-4">
          <h1
            className="font-black tracking-tight text-slate-950"
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
        </header>

        {/* Summary */}
        {hasContent.summary && (
          <section className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
            {mainHeading(titles.summary)}
            <p className="text-slate-700 leading-relaxed">
              {summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {hasContent.experience && (
          <section className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
            {mainHeading(titles.experience)}
            <div className="space-y-3.5">
              {experience.map((exp, idx) => (
                <div key={exp.id || idx} className="experience-item break-inside-avoid">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span className="text-[1.02em]">{exp.position}</span>
                    <span className="text-[0.88em] font-normal text-slate-500">
                      {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                      {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-600 font-medium mb-1">
                    <span style={{ color: tokens.accent }}>{exp.company}</span>
                    {exp.location && <span className="text-[0.88em] text-slate-400 font-normal">{exp.location}</span>}
                  </div>
                  {renderFormattedDescription(exp.description, tokens.bodySize, tokens.paragraphGap, tokens.accent)}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {hasContent.education && (
          <section className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
            {mainHeading(titles.education)}
            <div className="space-y-2.5">
              {education.map((edu, idx) => (
                <div key={edu.id || idx} className="education-item break-inside-avoid">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>
                      {edu.degree}
                      {edu.field ? `, ${edu.field}` : ""}
                    </span>
                    <span className="text-[0.88em] font-normal text-slate-500">
                      {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                      {edu.current ? "Present" : edu.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-slate-600">
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
        )}

        {/* Projects */}
        {hasContent.projects && (
          <section className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
            {mainHeading(titles.projects)}
            <div className="space-y-2.5">
              {projects.map((proj, idx) => (
                <div key={proj.id || idx} className="project-item break-inside-avoid">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>{proj.name}</span>
                    {proj.link && (
                      <a href={proj.link} className="text-[0.85em] font-normal text-indigo-600 hover:underline">
                        Link
                      </a>
                    )}
                  </div>
                  {proj.technologies && (
                    <p className="text-[0.85em] text-slate-500 mb-0.5">
                      Stack: {proj.technologies}
                    </p>
                  )}
                  {renderFormattedDescription(proj.description, tokens.bodySize, tokens.paragraphGap, tokens.accent)}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
