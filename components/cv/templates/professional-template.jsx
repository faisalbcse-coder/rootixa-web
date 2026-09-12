"use client";

import { useMemo } from "react";
import { Mail, Phone, MapPin, Globe, Link as LinkIcon, FolderGit2 } from "lucide-react";
import { renderProfilePhoto } from "./template-helpers";

function getFontCss(fontId) {
  const map = {
    Inter: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    Arial: "Arial, Helvetica, sans-serif",
    Helvetica: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    Roboto: "'Roboto', -apple-system, sans-serif",
    Lato: "'Lato', sans-serif",
    "Open Sans": "'Open Sans', sans-serif",
    "Source Sans 3": "'Source Sans 3', sans-serif",
    Georgia: "Georgia, serif",
    Merriweather: "'Merriweather', Georgia, serif",
    "Times New Roman": "'Times New Roman', Times, serif",
  };
  return map[fontId] || "'Inter', sans-serif";
}

function renderFormattedDescription(text, fontSize, paragraphGap) {
  if (!text) return null;
  const lines = text.split("\n").filter(Boolean);
  const hasBullets = lines.some((l) => /^\s*([•\-\*]|\d+\.)\s+/.test(l));

  if (!hasBullets) {
    return (
      <p
        className="leading-relaxed text-slate-700 whitespace-pre-line"
        style={{ fontSize, marginBottom: paragraphGap }}
      >
        {text}
      </p>
    );
  }

  return (
    <ul
      className="space-y-1 list-none pl-0 leading-relaxed text-slate-700"
      style={{ fontSize, marginBottom: paragraphGap }}
    >
      {lines.map((line, idx) => {
        const clean = line.replace(/^\s*([•\-\*]|\d+\.)\s+/, "");
        return (
          <li key={idx} className="flex items-start gap-1.5">
            <span className="text-slate-800 select-none shrink-0 text-[10px] leading-tight mt-0.5">•</span>
            <span>{clean}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ProfessionalTemplate({ cvData }) {
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

  // Design Tokens
  const fontCss = getFontCss(design.fontFamily || "Inter");
  const accent = design.colors?.accent || "#0f172a";
  const headerBg = design.colors?.headerBg || "#0f172a";
  const nameSize = `${design.fontSize?.name || 28}px`;
  const titleSize = `${design.fontSize?.title || 14}px`;
  const headingSize = `${design.fontSize?.sectionHeading || 13}px`;
  const bodySize = `${design.fontSize?.body || 10}px`;
  const metaSize = `${design.fontSize?.metadata || 9}px`;
  const lineHeightVal = design.lineHeight || 1.45;
  const sectionGap = `${design.spacing?.section || 18}px`;
  const itemGap = `${design.spacing?.item || 10}px`;
  const paragraphGap = `${design.spacing?.paragraph || 6}px`;
  const pageMargin = `${design.layout?.pageMargin || 48}px`;
  const headerAlign = design.layout?.headerAlignment || "left";
  const photo = design.photo;

  const hasContent = useMemo(
    () => ({
      summary: Boolean(summary?.trim()),
      experience: experience?.some((e) => e.position?.trim() || e.company?.trim() || e.description?.trim()),
      education: education?.some((e) => e.degree?.trim() || e.institution?.trim() || e.description?.trim()),
      skills: skills?.length > 0,
      projects: projects?.some((p) => p.name?.trim() || p.description?.trim()),
      certifications: certifications?.some((c) => c.name?.trim() || c.issuer?.trim()),
      languages: languages?.some((l) => l.language?.trim()),
    }),
    [summary, experience, education, skills, projects, certifications, languages]
  );

  return (
    <div
      className="w-full text-slate-800"
      style={{
        fontFamily: fontCss,
        padding: pageMargin,
        lineHeight: lineHeightVal,
        boxSizing: "border-box",
      }}
    >
      {/* ─── Executive Header Block ─── */}
      <header
        className="text-white p-5 rounded-xl shadow-xs"
        style={{
          backgroundColor: headerBg,
          marginBottom: sectionGap,
          textAlign: headerAlign,
        }}
      >
        <div
          className={`flex gap-4 items-center ${
            headerAlign === "center"
              ? "flex-col justify-center text-center"
              : headerAlign === "right"
              ? "flex-row-reverse justify-between"
              : "flex-row justify-between"
          }`}
        >
          <div className="flex-1 min-w-0">
            <h1
              className="font-extrabold tracking-tight uppercase text-white leading-tight"
              style={{ fontSize: nameSize }}
            >
              {personal.fullName || (
                <span className="text-slate-400 normal-case font-normal">Your Full Name</span>
              )}
            </h1>
            <p
              className="font-semibold tracking-wider mt-1 uppercase text-slate-300"
              style={{ fontSize: titleSize }}
            >
              {personal.professionalTitle || (
                <span className="text-slate-400 font-normal">Executive Title</span>
              )}
            </p>
          </div>

          {photo?.enabled && photo?.url && (
            <div className="shrink-0">
              {renderProfilePhoto(photo, photo.shape, 80, personal.fullName, "rgba(255, 255, 255, 0.4)")}
            </div>
          )}
        </div>

        {/* Contact Info Row */}
        <div
          className={`flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-2.5 border-t border-white/20 text-slate-300 ${
            headerAlign === "center"
              ? "justify-center"
              : headerAlign === "right"
              ? "justify-end"
              : "justify-start"
          }`}
          style={{ fontSize: metaSize }}
        >
          {personal.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-slate-300 shrink-0" />
              <a href={`mailto:${personal.email}`} className="hover:text-white transition">
                {personal.email}
              </a>
            </span>
          )}
          {personal.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-300 shrink-0" />
              <span>{personal.phone}</span>
            </span>
          )}
          {personal.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
              <span>{personal.location}</span>
            </span>
          )}
          {personal.website && (
            <span className="inline-flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-slate-300 shrink-0" />
              <a
                href={personal.website.startsWith("http") ? personal.website : `https://${personal.website}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                {personal.website.replace(/^https?:\/\//, "")}
              </a>
            </span>
          )}
          {personal.linkedin && (
            <span className="inline-flex items-center gap-1.5">
              <LinkIcon className="w-3 h-3 text-slate-300 shrink-0" />
              <a
                href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                LinkedIn
              </a>
            </span>
          )}
          {personal.github && (
            <span className="inline-flex items-center gap-1.5">
              <FolderGit2 className="w-3 h-3 text-slate-300 shrink-0" />
              <a
                href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition"
              >
                GitHub
              </a>
            </span>
          )}
        </div>
      </header>

      {/* ─── Dynamic Sections with Accent Bar ─── */}
      <div>
        {sectionOrder.map((sectionKey) => {
          if (sectionVisibility[sectionKey] === false) return null;

          switch (sectionKey) {
            case "summary":
              if (!hasContent.summary) return null;
              return (
                <section key="summary" style={{ marginBottom: sectionGap }}>
                  <ProfessionalHeading
                    title={sectionTitles.summary || "Executive Summary"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <p
                    className="leading-relaxed text-slate-800 text-justify whitespace-pre-line"
                    style={{ fontSize: bodySize }}
                  >
                    {summary}
                  </p>
                </section>
              );

            case "experience":
              if (!hasContent.experience) return null;
              return (
                <section key="experience" style={{ marginBottom: sectionGap }}>
                  <ProfessionalHeading
                    title={sectionTitles.experience || "Professional Experience"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div>
                    {experience.map((exp) => {
                      if (!exp.position && !exp.company && !exp.description) return null;
                      return (
                        <div key={exp.id} style={{ marginBottom: itemGap }}>
                          <div className="flex flex-wrap items-baseline justify-between gap-1">
                            <div>
                              <span className="font-bold text-slate-900" style={{ fontSize: bodySize }}>
                                {exp.position || "Position"}
                              </span>
                              {exp.company && (
                                <span className="font-semibold text-slate-600" style={{ fontSize: bodySize }}>
                                  {" "}— {exp.company}
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-500" style={{ fontSize: metaSize }}>
                              {[
                                exp.startDate || exp.endDate || exp.current
                                  ? `${exp.startDate || ""}${exp.startDate && (exp.endDate || exp.current) ? " – " : ""}${
                                      exp.current ? "Present" : exp.endDate || ""
                                    }`
                                  : null,
                                exp.location,
                              ]
                                .filter(Boolean)
                                .join(" | ")}
                            </div>
                          </div>

                          {renderFormattedDescription(exp.description, bodySize, paragraphGap)}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );

            case "education":
              if (!hasContent.education) return null;
              return (
                <section key="education" style={{ marginBottom: sectionGap }}>
                  <ProfessionalHeading
                    title={sectionTitles.education || "Education & Credentials"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div>
                    {education.map((edu) => {
                      if (!edu.degree && !edu.institution) return null;
                      return (
                        <div key={edu.id} style={{ marginBottom: itemGap }}>
                          <div className="flex flex-wrap items-baseline justify-between gap-1">
                            <div>
                              <span className="font-bold text-slate-900" style={{ fontSize: bodySize }}>
                                {edu.degree || "Degree"}
                              </span>
                              {edu.institution && (
                                <span className="font-semibold text-slate-600" style={{ fontSize: bodySize }}>
                                  {" "}— {edu.institution}
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-500" style={{ fontSize: metaSize }}>
                              {[
                                edu.startDate || edu.endDate
                                  ? `${edu.startDate || ""}${edu.startDate && edu.endDate ? " – " : ""}${
                                      edu.endDate || ""
                                    }`
                                  : null,
                                edu.location,
                              ]
                                .filter(Boolean)
                                .join(" | ")}
                            </div>
                          </div>
                          {edu.description && (
                            <p className="text-slate-600 mt-0.5 leading-relaxed" style={{ fontSize: bodySize }}>
                              {edu.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );

            case "skills":
              if (!hasContent.skills) return null;
              return (
                <section key="skills" style={{ marginBottom: sectionGap }}>
                  <ProfessionalHeading
                    title={sectionTitles.skills || "Core Competencies"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-slate-800" style={{ fontSize: bodySize }}>
                    {skills.map((skill, idx) => (
                      <span key={idx} className="flex items-center gap-2">
                        <span className="font-medium">{skill}</span>
                        {idx < skills.length - 1 && <span className="text-slate-300">|</span>}
                      </span>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!hasContent.projects) return null;
              return (
                <section key="projects" style={{ marginBottom: sectionGap }}>
                  <ProfessionalHeading
                    title={sectionTitles.projects || "Key Initiatives & Projects"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div>
                    {projects.map((proj) => {
                      if (!proj.name && !proj.description) return null;
                      return (
                        <div key={proj.id} style={{ marginBottom: itemGap }}>
                          <div className="flex flex-wrap items-baseline justify-between gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900" style={{ fontSize: bodySize }}>
                                {proj.name}
                              </span>
                              {proj.url && (
                                <a
                                  href={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline text-indigo-600 font-medium"
                                  style={{ fontSize: metaSize }}
                                >
                                  {proj.url.replace(/^https?:\/\//, "")}
                                </a>
                              )}
                            </div>
                            {proj.technologies && (
                              <span className="font-mono text-slate-500" style={{ fontSize: metaSize }}>
                                {proj.technologies}
                              </span>
                            )}
                          </div>
                          {renderFormattedDescription(proj.description, bodySize, paragraphGap)}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );

            case "certifications":
              if (!hasContent.certifications) return null;
              return (
                <section key="certifications" style={{ marginBottom: sectionGap }}>
                  <ProfessionalHeading
                    title={sectionTitles.certifications || "Certifications"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div>
                    {certifications.map((cert) => {
                      if (!cert.name && !cert.issuer) return null;
                      return (
                        <div key={cert.id} className="flex items-baseline justify-between gap-2" style={{ marginBottom: paragraphGap }}>
                          <div>
                            <span className="font-bold text-slate-900" style={{ fontSize: bodySize }}>
                              {cert.name}
                            </span>
                            {cert.issuer && (
                              <span className="text-slate-600" style={{ fontSize: bodySize }}>
                                {" "}— {cert.issuer}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 font-medium" style={{ fontSize: metaSize }}>
                            {cert.issueDate}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );

            case "languages":
              if (!hasContent.languages) return null;
              return (
                <section key="languages" style={{ marginBottom: sectionGap }}>
                  <ProfessionalHeading
                    title={sectionTitles.languages || "Languages"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700" style={{ fontSize: bodySize }}>
                    {languages.map((l) => (
                      <span key={l.id}>
                        <strong className="font-semibold text-slate-900">{l.language}</strong>
                        {l.proficiency && <span className="text-slate-500"> ({l.proficiency})</span>}
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

function ProfessionalHeading({ title, accent, fontSize, gap }) {
  return (
    <div
      className="border-l-4 pl-2.5 py-0.5 mb-2"
      style={{
        borderColor: accent,
        marginBottom: gap || "6px",
      }}
    >
      <h2
        className="font-bold uppercase tracking-wider text-slate-900"
        style={{ fontSize }}
      >
        {title}
      </h2>
    </div>
  );
}
