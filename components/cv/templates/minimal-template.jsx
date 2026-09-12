"use client";

import { useMemo } from "react";
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
        className="leading-relaxed text-slate-600 whitespace-pre-line"
        style={{ fontSize, marginBottom: paragraphGap }}
      >
        {text}
      </p>
    );
  }

  return (
    <ul
      className="space-y-1 list-none pl-0 leading-relaxed text-slate-600"
      style={{ fontSize, marginBottom: paragraphGap }}
    >
      {lines.map((line, idx) => {
        const clean = line.replace(/^\s*([•\-\*]|\d+\.)\s+/, "");
        return (
          <li key={idx} className="flex items-start gap-1.5">
            <span className="text-slate-400 select-none shrink-0 text-[10px] leading-tight mt-0.5">•</span>
            <span>{clean}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function MinimalTemplate({ cvData }) {
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
  const accent = design.colors?.accent || "#059669";
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
      {/* ─── Header: Clean Whitespace ─── */}
      <header
        style={{
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
              className="font-light tracking-tight text-slate-900 leading-tight"
              style={{ fontSize: nameSize }}
            >
              {personal.fullName || (
                <span className="text-slate-300 font-normal">Your Full Name</span>
              )}
            </h1>

            {personal.professionalTitle && (
              <p
                className="font-medium mt-1 tracking-wide"
                style={{ fontSize: titleSize, color: accent }}
              >
                {personal.professionalTitle}
              </p>
            )}
          </div>

          {photo?.enabled && photo?.url && (
            <div className="shrink-0">
              {renderProfilePhoto(photo, photo.shape, 76, personal.fullName, "#e2e8f0")}
            </div>
          )}
        </div>

        {/* Minimal Slash-Separated Contact Line */}
        <div
          className={`flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-slate-500 ${
            headerAlign === "center"
              ? "justify-center"
              : headerAlign === "right"
              ? "justify-end"
              : "justify-start"
          }`}
          style={{ fontSize: metaSize }}
        >
          {personal.email && (
            <a href={`mailto:${personal.email}`} className="hover:underline text-slate-700">
              {personal.email}
            </a>
          )}
          {personal.phone && (
            <>
              {personal.email && <span className="text-slate-300">/</span>}
              <span>{personal.phone}</span>
            </>
          )}
          {personal.location && (
            <>
              {(personal.email || personal.phone) && <span className="text-slate-300">/</span>}
              <span>{personal.location}</span>
            </>
          )}
          {personal.website && (
            <>
              <span className="text-slate-300">/</span>
              <a
                href={personal.website.startsWith("http") ? personal.website : `https://${personal.website}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-700"
              >
                {personal.website.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
          {personal.linkedin && (
            <>
              <span className="text-slate-300">/</span>
              <a
                href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-700"
              >
                {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "in/")}
              </a>
            </>
          )}
          {personal.github && (
            <>
              <span className="text-slate-300">/</span>
              <a
                href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-700"
              >
                {personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, "github/")}
              </a>
            </>
          )}
        </div>
      </header>

      {/* ─── Dynamic Sections ─── */}
      <div>
        {sectionOrder.map((sectionKey) => {
          if (sectionVisibility[sectionKey] === false) return null;

          switch (sectionKey) {
            case "summary":
              if (!hasContent.summary) return null;
              return (
                <section key="summary" style={{ marginBottom: sectionGap }}>
                  <MinimalSectionHeading
                    title={sectionTitles.summary || "Summary"}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <p
                    className="leading-relaxed text-slate-700 text-justify whitespace-pre-line"
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
                  <MinimalSectionHeading
                    title={sectionTitles.experience || "Experience"}
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
                              <span className="font-semibold text-slate-900" style={{ fontSize: bodySize }}>
                                {exp.position || "Position"}
                              </span>
                              {exp.company && (
                                <span className="text-slate-500 font-normal" style={{ fontSize: bodySize }}>
                                  {" "}— {exp.company}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 font-mono" style={{ fontSize: metaSize }}>
                              {exp.startDate || exp.endDate || exp.current
                                ? `${exp.startDate || ""}${exp.startDate && (exp.endDate || exp.current) ? " – " : ""}${
                                    exp.current ? "Present" : exp.endDate || ""
                                  }`
                                : ""}
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
                  <MinimalSectionHeading
                    title={sectionTitles.education || "Education"}
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
                              <span className="font-semibold text-slate-900" style={{ fontSize: bodySize }}>
                                {edu.degree || "Degree"}
                              </span>
                              {edu.institution && (
                                <span className="text-slate-500 font-normal" style={{ fontSize: bodySize }}>
                                  {" "}— {edu.institution}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 font-mono" style={{ fontSize: metaSize }}>
                              {edu.startDate || edu.endDate
                                ? `${edu.startDate || ""}${edu.startDate && edu.endDate ? " – " : ""}${
                                    edu.endDate || ""
                                  }`
                                : ""}
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
                  <MinimalSectionHeading
                    title={sectionTitles.skills || "Skills"}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-700" style={{ fontSize: bodySize }}>
                    {skills.map((skill, idx) => (
                      <span key={idx} className="font-normal">
                        {skill}
                        {idx < skills.length - 1 && <span className="text-slate-300 ml-3">•</span>}
                      </span>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!hasContent.projects) return null;
              return (
                <section key="projects" style={{ marginBottom: sectionGap }}>
                  <MinimalSectionHeading
                    title={sectionTitles.projects || "Projects"}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div>
                    {projects.map((proj) => {
                      if (!proj.name && !proj.description) return null;
                      return (
                        <div key={proj.id} style={{ marginBottom: itemGap }}>
                          <div className="flex flex-wrap items-baseline justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900" style={{ fontSize: bodySize }}>
                                {proj.name}
                              </span>
                              {proj.url && (
                                <a
                                  href={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline text-slate-400 text-[10px]"
                                  style={{ fontSize: metaSize }}
                                >
                                  ({proj.url.replace(/^https?:\/\//, "")})
                                </a>
                              )}
                            </div>
                            {proj.technologies && (
                              <span className="text-slate-400 font-mono" style={{ fontSize: metaSize }}>
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
                  <MinimalSectionHeading
                    title={sectionTitles.certifications || "Certifications"}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div>
                    {certifications.map((cert) => {
                      if (!cert.name && !cert.issuer) return null;
                      return (
                        <div key={cert.id} className="flex items-baseline justify-between gap-2" style={{ marginBottom: paragraphGap }}>
                          <div>
                            <span className="font-semibold text-slate-900" style={{ fontSize: bodySize }}>
                              {cert.name}
                            </span>
                            {cert.issuer && (
                              <span className="text-slate-500 font-normal" style={{ fontSize: bodySize }}>
                                {" "}— {cert.issuer}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 font-mono" style={{ fontSize: metaSize }}>
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
                  <MinimalSectionHeading
                    title={sectionTitles.languages || "Languages"}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-700" style={{ fontSize: bodySize }}>
                    {languages.map((l, idx) => (
                      <span key={l.id}>
                        <span className="font-semibold text-slate-800">{l.language}</span>
                        {l.proficiency && <span className="text-slate-400"> ({l.proficiency})</span>}
                        {idx < languages.length - 1 && <span className="text-slate-300 ml-3">•</span>}
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

function MinimalSectionHeading({ title, fontSize, gap }) {
  return (
    <div
      className="border-b border-slate-100"
      style={{
        marginBottom: gap || "6px",
        paddingBottom: "3px",
      }}
    >
      <h2
        className="font-semibold uppercase tracking-wider text-slate-400"
        style={{ fontSize }}
      >
        {title}
      </h2>
    </div>
  );
}
