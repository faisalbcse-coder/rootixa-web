import React from "react";

export function getFontCss(fontId) {
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

export function renderFormattedDescription(text, fontSize = "10px", paragraphGap = "6px", bulletColor = "#6366f1") {
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
            <span
              className="select-none shrink-0 text-[10px] leading-tight mt-0.5"
              style={{ color: bulletColor }}
            >
              •
            </span>
            <span>{clean}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function renderProfilePhoto(photo, shape = "circle", size = 80, alt = "Profile Photo") {
  if (!photo || !photo.enabled || !photo.url) return null;

  const shapeClasses = {
    circle: "rounded-full",
    rounded: "rounded-2xl",
    square: "rounded-md",
  };

  const roundedCls = shapeClasses[shape] || shapeClasses.circle;

  return (
    <div
      className={`shrink-0 overflow-hidden border-2 border-white/80 shadow-xs bg-slate-100 ${roundedCls}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <img
        src={photo.url}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ display: "block" }}
      />
    </div>
  );
}

export function extractDesignTokens(design = {}) {
  return {
    fontCss: getFontCss(design.fontFamily),
    accent: design.colors?.accent || "#4f46e5",
    headerBg: design.colors?.headerBg || "#0f172a",
    nameSize: `${design.fontSize?.name || 26}px`,
    titleSize: `${design.fontSize?.title || 13}px`,
    headingSize: `${design.fontSize?.sectionHeading || 12}px`,
    bodySize: `${design.fontSize?.body || 9.5}px`,
    metaSize: `${design.fontSize?.metadata || 8.5}px`,
    lineHeight: design.lineHeight || 1.45,
    sectionGap: `${design.spacing?.section || 16}px`,
    itemGap: `${design.spacing?.item || 9}px`,
    paragraphGap: `${design.spacing?.paragraph || 5}px`,
    pageMargin: `${design.layout?.pageMargin || 44}px`,
    headerAlign: design.layout?.headerAlignment || "left",
    photo: design.photo || { enabled: false, url: "", shape: "circle" },
  };
}

export function checkHasContent(cvData = {}) {
  const {
    summary = "",
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = [],
  } = cvData;

  return {
    summary: Boolean(summary?.trim()),
    experience: experience?.some((e) => e.position?.trim() || e.company?.trim() || e.description?.trim()),
    education: education?.some((e) => e.degree?.trim() || e.institution?.trim() || e.description?.trim()),
    skills: skills?.length > 0,
    projects: projects?.some((p) => p.name?.trim() || p.description?.trim()),
    certifications: certifications?.some((c) => c.name?.trim() || c.issuer?.trim()),
    languages: languages?.some((l) => l.language?.trim()),
  };
}
