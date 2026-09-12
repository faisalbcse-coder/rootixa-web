"use client";

import React, { useMemo } from "react";
import {
  extractDesignTokens,
  checkHasContent,
  renderProfilePhoto,
} from "./template-helpers";

/**
 * Harvard Standard CV Template
 *
 * Modeled after the official Harvard Office of Career Services (OCS)
 * & Harvard Mignone Center for Career Success standards:
 * - 4-corner balanced layout (Company/Location, Role/Dates)
 * - Authoritative Ivy League serif typography & small-caps accents
 * - Clean, uninterrupted ATS linear parsing with zero icon clutter
 * - Precision academic bullet points with genuine hanging indents
 * - Authentic Harvard Crimson (#A51C30) accent or user-customized color
 */
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
    awards = [],
    publications = [],
    volunteer = [],
    references = {},
    customSections = [],
    sectionOrder = [],
    sectionVisibility = {},
    sectionTitles = {},
    design = {},
  } = cvData || {};

  const tokens = extractDesignTokens(design);
  const hasContent = useMemo(() => checkHasContent(cvData), [cvData]);

  // Section titles with Harvard-style uppercase defaults
  const titles = {
    summary: sectionTitles.summary || "PROFESSIONAL SUMMARY",
    experience: sectionTitles.experience || "WORK EXPERIENCE",
    education: sectionTitles.education || "EDUCATION",
    skills: sectionTitles.skills || "TECHNICAL SKILLS & COMPETENCIES",
    projects: sectionTitles.projects || "PROJECTS & RESEARCH",
    certifications: sectionTitles.certifications || "CERTIFICATIONS & LICENSES",
    languages: sectionTitles.languages || "LANGUAGES",
    awards: sectionTitles.awards || "HONORS & AWARDS",
    publications: sectionTitles.publications || "PUBLICATIONS & RESEARCH",
    volunteer: sectionTitles.volunteer || "LEADERSHIP & VOLUNTEER WORK",
    references: sectionTitles.references || "REFERENCES",
    customSections: sectionTitles.customSections || "ADDITIONAL INFORMATION",
  };

  const visibleSections = (
    sectionOrder?.length
      ? sectionOrder
      : ["summary", "experience", "education", "skills", "projects", "certifications", "languages"]
  ).filter((s) => sectionVisibility[s] !== false && hasContent[s]);

  // Clean Harvard contact string (ATS standard: no icons, dignified middle dots)
  const contacts = [
    personal.location && { label: personal.location },
    personal.phone && { label: personal.phone, href: `tel:${personal.phone}` },
    personal.email && { label: personal.email, href: `mailto:${personal.email}` },
    personal.linkedin && {
      label: personal.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/, "linkedin.com/in/"),
      href: personal.linkedin,
    },
    personal.github && {
      label: personal.github.replace(/^https?:\/\/(www\.)?github\.com\//, "github.com/"),
      href: personal.github,
    },
    personal.website && {
      label: personal.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
      href: personal.website,
    },
  ].filter(Boolean);

  // Harvard divider accent color: default to Harvard Crimson (#A51C30) if no custom accent
  const crimsonAccent = tokens.accent && tokens.accent !== "#4f46e5" ? tokens.accent : "#A51C30";

  // Authentic Harvard section heading: Letterspaced uppercase with crisp edge-to-edge dividing rule
  const renderSectionHeading = (title) => (
    <div className="cv-harvard-heading mb-2 mt-4 first:mt-0">
      <h2
        className="font-serif font-bold uppercase tracking-[0.14em] text-slate-950"
        style={{ fontSize: tokens.headingSize }}
      >
        {title}
      </h2>
      <div
        className="w-full h-[1.5px] mt-1"
        style={{ backgroundColor: crimsonAccent }}
      />
    </div>
  );

  // Academic hanging-indent bullet renderer
  const renderHarvardBullets = (text) => {
    if (!text) return null;
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const hasBullets = lines.some((l) => /^\s*([•\-\*]|\d+\.)\s+/.test(l));

    if (!hasBullets && lines.length === 1) {
      return (
        <p
          className="font-serif leading-[1.48] text-slate-800 text-justify mt-1"
          style={{ fontSize: tokens.bodySize, marginBottom: tokens.paragraphGap }}
        >
          {text}
        </p>
      );
    }

    return (
      <ul
        className="mt-1 space-y-1 list-none pl-0 font-serif leading-[1.48] text-slate-800"
        style={{ fontSize: tokens.bodySize, marginBottom: tokens.paragraphGap }}
      >
        {lines.map((line, idx) => {
          const clean = line.replace(/^\s*([•\-\*]|\d+\.)\s+/, "").trim();
          return (
            <li key={idx} className="flex items-start gap-2 pl-3">
              <span
                className="select-none shrink-0 text-slate-900 text-[10px] leading-tight mt-[3px]"
                aria-hidden="true"
              >
                •
              </span>
              <span className="flex-1 text-slate-800 text-justify">{clean}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div
      className="cv-harvard-template text-slate-900 bg-white"
      style={{
        fontFamily: tokens.fontCss || "Georgia, serif",
        fontSize: tokens.bodySize,
        lineHeight: tokens.lineHeight,
        padding: tokens.pageMargin,
      }}
    >
      {/* ─── Harvard Masthead ─── */}
      <header className="text-center mb-5 pb-2">
        {tokens.photo?.enabled && tokens.photo?.url && (
          <div className="flex justify-center mb-3">
            {renderProfilePhoto(tokens.photo, tokens.photo.shape, 84, personal.fullName)}
          </div>
        )}

        <h1
          className="font-serif font-bold uppercase tracking-[0.14em] text-slate-950 leading-tight"
          style={{ fontSize: tokens.nameSize }}
        >
          {personal.fullName || "Your Full Name"}
        </h1>

        {personal.professionalTitle && (
          <p
            className="font-serif italic text-slate-700 tracking-wide mt-1"
            style={{ fontSize: tokens.titleSize }}
          >
            {personal.professionalTitle}
          </p>
        )}

        {contacts.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-slate-700 mt-2 font-serif"
            style={{ fontSize: tokens.metaSize }}
          >
            {contacts.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span className="text-slate-400 select-none font-serif text-[0.85em]">
                    •
                  </span>
                )}
                {c.href ? (
                  <a
                    href={c.href}
                    className="text-slate-800 hover:text-black hover:underline transition-colors decoration-slate-400 underline-offset-2"
                  >
                    {c.label}
                  </a>
                ) : (
                  <span>{c.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Masthead rule */}
        <div
          className="w-full h-[1.5px] mt-3.5"
          style={{ backgroundColor: crimsonAccent }}
        />
      </header>

      {/* ─── Harvard Sections Flow ─── */}
      <div className="space-y-4">
        {visibleSections.map((sectionKey) => {
          switch (sectionKey) {
            // ─── Professional Summary ───
            case "summary":
              return (
                <section key="summary" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.summary)}
                  <div className="font-serif text-slate-800 leading-[1.5] text-justify">
                    <p style={{ fontSize: tokens.bodySize }}>{summary}</p>
                  </div>
                </section>
              );

            // ─── Work Experience (Harvard 4-Corner Layout) ───
            case "experience":
              return (
                <section key="experience" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.experience)}
                  <div className="space-y-3">
                    {experience.map((exp, idx) => (
                      <div
                        key={exp.id || idx}
                        className="experience-item break-inside-avoid"
                        style={{ marginBottom: tokens.itemGap }}
                      >
                        {/* Row 1: Company (Bold) + Location (Right) */}
                        <div className="flex justify-between items-baseline font-serif">
                          <h3 className="font-bold text-slate-950 text-[1.02em] tracking-tight">
                            {exp.company || "Company / Organization"}
                          </h3>
                          {exp.location && (
                            <span className="text-[0.92em] text-slate-700 italic text-right shrink-0 ml-4">
                              {exp.location}
                            </span>
                          )}
                        </div>

                        {/* Row 2: Role Title (Italic) + Dates (Right) */}
                        <div className="flex justify-between items-baseline font-serif mb-1">
                          <span className="italic text-slate-800 text-[0.98em]">
                            {exp.position || "Position Title"}
                          </span>
                          {(exp.startDate || exp.endDate || exp.current) && (
                            <span className="text-[0.9em] text-slate-700 text-right shrink-0 ml-4 font-serif">
                              {exp.startDate} {exp.startDate && (exp.endDate || exp.current) ? "–" : ""}{" "}
                              {exp.current ? "Present" : exp.endDate}
                            </span>
                          )}
                        </div>

                        {/* Harvard Action-Verb Bullets */}
                        {renderHarvardBullets(exp.description)}
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ─── Education (Ivy League Academic Standard) ───
            case "education":
              return (
                <section key="education" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.education)}
                  <div className="space-y-3">
                    {education.map((edu, idx) => (
                      <div
                        key={edu.id || idx}
                        className="education-item break-inside-avoid"
                        style={{ marginBottom: tokens.itemGap }}
                      >
                        {/* Row 1: Institution (Bold/Small Caps) + Location */}
                        <div className="flex justify-between items-baseline font-serif">
                          <h3 className="font-bold uppercase tracking-wide text-slate-950 text-[1.02em]">
                            {edu.institution || "University / College"}
                          </h3>
                          {edu.location && (
                            <span className="text-[0.92em] text-slate-700 italic text-right shrink-0 ml-4">
                              {edu.location}
                            </span>
                          )}
                        </div>

                        {/* Row 2: Degree/Field (Italic) + Graduation Date */}
                        <div className="flex justify-between items-baseline font-serif">
                          <span className="italic text-slate-800 text-[0.98em]">
                            {edu.degree}
                            {edu.field ? `, ${edu.field}` : ""}
                          </span>
                          {(edu.startDate || edu.endDate || edu.current) && (
                            <span className="text-[0.9em] text-slate-700 text-right shrink-0 ml-4">
                              {edu.startDate} {edu.startDate && (edu.endDate || edu.current) ? "–" : ""}{" "}
                              {edu.current ? "Present" : edu.endDate}
                            </span>
                          )}
                        </div>

                        {/* Row 3: GPA & Academic Honors */}
                        {edu.gpa && (
                          <div className="text-[0.92em] text-slate-700 font-serif mt-0.5">
                            <span className="font-semibold text-slate-900">Cumulative GPA:</span> {edu.gpa}
                          </div>
                        )}

                        {/* Description / Coursework / Honors */}
                        {edu.description && (
                          <div className="mt-1">
                            {renderHarvardBullets(edu.description)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ─── Skills & Proficiencies ───
            case "skills":
              return (
                <section key="skills" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.skills)}
                  <div className="font-serif text-slate-800 leading-[1.5]">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-950">Technical & Professional Proficiencies:</span>
                      <span>
                        {skills.map((s, idx) => (
                          <span key={s.id || idx}>
                            {s.name}
                            {idx < skills.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </section>
              );

            // ─── Projects & Research ───
            case "projects":
              return (
                <section key="projects" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.projects)}
                  <div className="space-y-3">
                    {projects.map((proj, idx) => (
                      <div
                        key={proj.id || idx}
                        className="project-item break-inside-avoid"
                        style={{ marginBottom: tokens.itemGap }}
                      >
                        {/* Row 1: Project Name + URL */}
                        <div className="flex justify-between items-baseline font-serif">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <h3 className="font-bold text-slate-950 text-[1.02em]">
                              {proj.name || "Project Title"}
                            </h3>
                            {proj.technologies && (
                              <span className="italic text-slate-700 text-[0.92em]">
                                ({proj.technologies})
                              </span>
                            )}
                          </div>
                          {(proj.url || proj.link) && (
                            <a
                              href={proj.url || proj.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[0.9em] font-serif text-slate-700 hover:text-black hover:underline shrink-0 ml-4 decoration-slate-400 underline-offset-2"
                            >
                              {(proj.url || proj.link).replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                            </a>
                          )}
                        </div>

                        {/* Project Description Bullets */}
                        {renderHarvardBullets(proj.description)}
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ─── Certifications & Honors ───
            case "certifications":
              return (
                <section key="certifications" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.certifications)}
                  <div className="space-y-1.5 font-serif">
                    {certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="flex justify-between items-baseline">
                        <div className="text-slate-900">
                          <span className="font-bold text-slate-950">{cert.name}</span>
                          {cert.issuer && <span className="italic text-slate-700"> — {cert.issuer}</span>}
                        </div>
                        {cert.issueDate && (
                          <span className="text-[0.9em] text-slate-700 italic shrink-0 ml-4">
                            {cert.issueDate}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ─── Languages ───
            case "languages":
              return (
                <section key="languages" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.languages)}
                  <div className="font-serif text-slate-800 leading-relaxed">
                    <span className="font-bold text-slate-950">Language Competencies: </span>
                    {languages.map((l, idx) => (
                      <span key={l.id || idx}>
                        <span className="font-medium text-slate-900">{l.language}</span>
                        {l.proficiency && <span className="italic text-slate-700"> ({l.proficiency})</span>}
                        {idx < languages.length - 1 ? "  •  " : ""}
                      </span>
                    ))}
                  </div>
                </section>
              );

            // ─── Honors & Awards ───
            case "awards":
              return (
                <section key="awards" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.awards)}
                  <div className="space-y-1.5 font-serif">
                    {awards.map((aw, idx) => (
                      <div key={aw.id || idx} className="flex justify-between items-baseline">
                        <div className="text-slate-900">
                          <span className="font-bold text-slate-950">{aw.name}</span>
                          {aw.issuer && <span className="italic text-slate-700"> — {aw.issuer}</span>}
                        </div>
                        {aw.year && (
                          <span className="text-[0.9em] text-slate-700 italic shrink-0 ml-4">
                            {aw.year}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ─── Publications & Research ───
            case "publications":
              return (
                <section key="publications" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.publications)}
                  <div className="space-y-2.5 font-serif">
                    {publications.map((p, idx) => (
                      <div key={p.id || idx} className="break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-950 text-[1.02em]">{p.title}</span>
                          {p.date && <span className="text-[0.9em] text-slate-700 italic shrink-0 ml-4">{p.date}</span>}
                        </div>
                        {p.publisher && <p className="italic text-slate-700 text-[0.92em]">{p.publisher}</p>}
                        {p.description && renderHarvardBullets(p.description)}
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ─── Leadership & Volunteer Work ───
            case "volunteer":
              return (
                <section key="volunteer" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.volunteer)}
                  <div className="space-y-3 font-serif">
                    {volunteer.map((v, idx) => (
                      <div key={v.id || idx} className="break-inside-avoid" style={{ marginBottom: tokens.itemGap }}>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-slate-950 text-[1.02em]">{v.organization}</h3>
                          {(v.startDate || v.endDate) && (
                            <span className="text-[0.9em] text-slate-700 italic shrink-0 ml-4">
                              {v.startDate} {v.startDate && v.endDate ? "–" : ""} {v.endDate}
                            </span>
                          )}
                        </div>
                        <p className="italic text-slate-800 text-[0.98em] mb-1">{v.role}</p>
                        {renderHarvardBullets(v.description)}
                      </div>
                    ))}
                  </div>
                </section>
              );

            // ─── Professional References ───
            case "references":
              return (
                <section key="references" className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                  {renderSectionHeading(titles.references)}
                  {references?.availableUponRequest ? (
                    <p className="font-serif italic text-slate-700 text-[0.95em]">
                      Professional references available upon request.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-serif">
                      {references?.items?.map((ref, idx) => (
                        <div key={ref.id || idx} className="text-slate-800 text-[0.95em]">
                          <p className="font-bold text-slate-950">{ref.name}</p>
                          <p className="italic text-slate-700">{ref.position}{ref.company ? `, ${ref.company}` : ""}</p>
                          {ref.email && <p className="text-[0.9em] text-slate-600">{ref.email}</p>}
                          {ref.phone && <p className="text-[0.9em] text-slate-600">{ref.phone}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );

            // ─── Custom Additional Section ───
            case "customSections":
            case "custom":
              return (
                <React.Fragment key="customSections">
                  {customSections.map((cs, idx) => (
                    <section key={cs.id || idx} className="cv-section" style={{ marginBottom: tokens.sectionGap }}>
                      {renderSectionHeading(cs.title || titles.customSections)}
                      <p className="font-serif leading-[1.48] text-slate-800 whitespace-pre-line text-justify">
                        {cs.content}
                      </p>
                    </section>
                  ))}
                </React.Fragment>
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
