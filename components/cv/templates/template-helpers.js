import React from "react";
import { createSampleCV } from "@/lib/cv/cv-types";

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
  } = cvData || {};

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

/**
 * Creates rich preview data for CV document display.
 * If user has not yet entered content for a section, fills it with realistic sample
 * data so the user can immediately appreciate the template's typography, layout,
 * and design instead of seeing a broken blank white box.
 */
export function getPreviewCVData(userCvData) {
  const sample = createSampleCV();
  if (!userCvData) return sample;

  const hasContent = checkHasContent(userCvData);
  const hasUserFullName = Boolean(userCvData.personal?.fullName?.trim());
  const hasAnySection = Object.values(hasContent).some(Boolean);

  // If user CV is completely fresh/blank, show full sample template preview
  if (!hasUserFullName && !hasAnySection) {
    return {
      ...sample,
      design: userCvData.design || sample.design,
      settings: userCvData.settings || sample.settings,
      sectionOrder: userCvData.sectionOrder?.length ? userCvData.sectionOrder : sample.sectionOrder,
      sectionVisibility: userCvData.sectionVisibility || sample.sectionVisibility,
      sectionTitles: userCvData.sectionTitles || sample.sectionTitles,
      _isSamplePreview: true,
    };
  }

  // If user has partially filled their CV, keep their real data, and fill empty sections
  // with sample content so the template structure is never empty
  return {
    ...sample,
    ...userCvData,
    meta: userCvData.meta || sample.meta,
    personal: {
      ...sample.personal,
      ...userCvData.personal,
      fullName: userCvData.personal?.fullName?.trim() || sample.personal.fullName,
      professionalTitle: userCvData.personal?.professionalTitle?.trim() || sample.personal.professionalTitle,
      email: userCvData.personal?.email?.trim() || sample.personal.email,
      phone: userCvData.personal?.phone?.trim() || sample.personal.phone,
      location: userCvData.personal?.location?.trim() || sample.personal.location,
      website: userCvData.personal?.website?.trim() || sample.personal.website,
      linkedin: userCvData.personal?.linkedin?.trim() || sample.personal.linkedin,
      github: userCvData.personal?.github?.trim() || sample.personal.github,
    },
    summary: hasContent.summary ? userCvData.summary : sample.summary,
    experience: hasContent.experience ? userCvData.experience : sample.experience,
    education: hasContent.education ? userCvData.education : sample.education,
    skills: hasContent.skills ? userCvData.skills : sample.skills,
    projects: hasContent.projects ? userCvData.projects : sample.projects,
    certifications: hasContent.certifications ? userCvData.certifications : sample.certifications,
    languages: hasContent.languages ? userCvData.languages : sample.languages,
    sectionOrder: userCvData.sectionOrder?.length ? userCvData.sectionOrder : sample.sectionOrder,
    sectionVisibility: userCvData.sectionVisibility || sample.sectionVisibility,
    sectionTitles: userCvData.sectionTitles || sample.sectionTitles,
    design: userCvData.design || sample.design,
    settings: userCvData.settings || sample.settings,
    _isSamplePreview: false,
  };
}
