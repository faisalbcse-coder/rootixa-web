"use client";

import { useMemo } from "react";

function getFontCss(fontId) {
  const map = {
    Georgia: "Georgia, serif",
    "Times New Roman": "'Times New Roman', Times, serif",
    Merriweather: "'Merriweather', Georgia, serif",
    Inter: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    Arial: "Arial, Helvetica, sans-serif",
    Helvetica: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    Roboto: "'Roboto', -apple-system, sans-serif",
    Lato: "'Lato', sans-serif",
    "Open Sans": "'Open Sans', sans-serif",
    "Source Sans 3": "'Source Sans 3', sans-serif",
  };
  return map[fontId] || "Georgia, serif";
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
            <span className="text-slate-500 select-none shrink-0 text-[10px] leading-tight mt-0.5">•</span>
            <span>{clean}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ClassicTemplate({ cvData }) {
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
  const fontCss = getFontCss(design.fontFamily || "Georgia");
  const accent = design.colors?.accent || "#1e293b";
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
  const headerAlign = design.layout?.headerAlignment || "center";
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
      {/* ─── Header: Formal & Centered ─── */}
      <header
        className="pb-4 border-b-2"
        style={{
          borderColor: accent,
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
          {photo?.enabled && photo?.url && (
            <div className="shrink-0 mb-1">
              <img
                src={photo.url}
                alt={personal.fullName || "Profile"}
                className={`w-18 h-18 object-cover border-2 shadow-xs ${
                  photo.shape === "circle"
                    ? "rounded-full"
                    : photo.shape === "rounded"
                    ? "rounded-2xl"
                    : "rounded-none"
                }`}
                style={{ borderColor: accent }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1
              className="font-bold tracking-normal text-slate-900 uppercase leading-tight"
              style={{ fontSize: nameSize }}
            >
              {personal.fullName || (
                <span className="text-slate-300 font-normal">Your Full Name</span>
              )}
            </h1>

            {personal.professionalTitle && (
              <p
                className="text-slate-700 italic mt-1 tracking-wide"
                style={{ fontSize: titleSize }}
              >
                {personal.professionalTitle}
              </p>
            )}
          </div>
        </div>

        {/* Bullet-Separated Contact Info */}
        <div
          className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-2.5 text-slate-600 ${
            headerAlign === "center"
              ? "justify-center"
              : headerAlign === "right"
              ? "justify-end"
              : "justify-start"
          }`}
          style={{ fontSize: metaSize }}
        >
          {personal.location && <span>{personal.location}</span>}
          {personal.phone && (
            <>
              {personal.location && <span>•</span>}
              <span>{personal.phone}</span>
            </>
          )}
          {personal.email && (
            <>
              {(personal.location || personal.phone) && <span>•</span>}
              <a href={`mailto:${personal.email}`} className="hover:underline text-slate-800">
                {personal.email}
              </a>
            </>
          )}
          {personal.website && (
            <>
              <span>•</span>
              <a
                href={personal.website.startsWith("http") ? personal.website : `https://${personal.website}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-800"
              >
                {personal.website.replace(/^https?:\/\//, "")}
              </a>
            </>
          )}
          {personal.linkedin && (
            <>
              <span>•</span>
              <a
                href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-800"
              >
                {personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "in/")}
              </a>
            </>
          )}
          {personal.github && (
            <>
              <span>•</span>
              <a
                href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`}
                target="_blank"
                rel="noreferrer"
                className="hover:underline text-slate-800"
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
                  <ClassicSectionHeading
                    title={sectionTitles.summary || "Summary"}
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
                  <ClassicSectionHeading
                    title={sectionTitles.experience || "Experience"}
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
                                <span className="font-semibold text-slate-700 italic" style={{ fontSize: bodySize }}>
                                  , {exp.company}
                                </span>
                              )}
                              {exp.location && (
                                <span className="text-slate-500" style={{ fontSize: metaSize }}>
                                  {" "}— {exp.location}
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-700 italic" style={{ fontSize: metaSize }}>
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
                  <ClassicSectionHeading
                    title={sectionTitles.education || "Education"}
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
                                <span className="text-slate-700 italic" style={{ fontSize: bodySize }}>
                                  , {edu.institution}
                                </span>
                              )}
                              {edu.location && (
                                <span className="text-slate-500" style={{ fontSize: metaSize }}>
                                  {" "}— {edu.location}
                                </span>
                              )}
                            </div>
                            <div className="font-semibold text-slate-700 italic" style={{ fontSize: metaSize }}>
                              {edu.startDate || edu.endDate
                                ? `${edu.startDate || ""}${edu.startDate && edu.endDate ? " – " : ""}${
                                    edu.endDate || ""
                                  }`
                                : ""}
                            </div>
                          </div>
                          {edu.description && (
                            <p className="text-slate-700 mt-0.5 leading-relaxed" style={{ fontSize: bodySize }}>
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
                  <ClassicSectionHeading
                    title={sectionTitles.skills || "Skills"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div className="text-slate-800 leading-relaxed" style={{ fontSize: bodySize }}>
                    {skills.map((skill, idx) => (
                      <span key={idx}>
                        <span>{skill}</span>
                        {idx < skills.length - 1 && <span className="mx-2 text-slate-400">•</span>}
                      </span>
                    ))}
                  </div>
                </section>
              );

            case "projects":
              if (!hasContent.projects) return null;
              return (
                <section key="projects" style={{ marginBottom: sectionGap }}>
                  <ClassicSectionHeading
                    title={sectionTitles.projects || "Projects"}
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
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900" style={{ fontSize: bodySize }}>
                                {proj.name}
                              </span>
                              {proj.technologies && (
                                <span className="text-slate-600 italic" style={{ fontSize: metaSize }}>
                                  ({proj.technologies})
                                </span>
                              )}
                            </div>
                            {proj.url && (
                              <a
                                href={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline text-slate-700 italic"
                                style={{ fontSize: metaSize }}
                              >
                                {proj.url.replace(/^https?:\/\//, "")}
                              </a>
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
                  <ClassicSectionHeading
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
                              <span className="text-slate-700 italic" style={{ fontSize: bodySize }}>
                                , {cert.issuer}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-600 italic" style={{ fontSize: metaSize }}>
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
                  <ClassicSectionHeading
                    title={sectionTitles.languages || "Languages"}
                    accent={accent}
                    fontSize={headingSize}
                    gap={paragraphGap}
                  />
                  <div className="text-slate-800" style={{ fontSize: bodySize }}>
                    {languages.map((l, idx) => (
                      <span key={l.id}>
                        <span className="font-semibold">{l.language}</span>
                        {l.proficiency && <span className="text-slate-600 italic"> ({l.proficiency})</span>}
                        {idx < languages.length - 1 && <span className="mx-2 text-slate-400">•</span>}
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

function ClassicSectionHeading({ title, accent, fontSize, gap }) {
  return (
    <div
      className="border-b"
      style={{
        borderColor: accent,
        marginBottom: gap || "6px",
        paddingBottom: "2px",
      }}
    >
      <h2
        className="font-bold uppercase tracking-wider"
        style={{
          fontSize,
          color: "#0f172a",
        }}
      >
        {title}
      </h2>
    </div>
  );
}
