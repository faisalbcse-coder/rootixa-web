/**
 * Rootixa Pro CV Builder — LocalStorage Persistence Layer
 */

import { createEmptyCV, DEFAULT_SECTION_ORDER } from "./cv-types";

export const CV_STORAGE_KEY = "rootixa_pro_cv_draft";

/**
 * Saves CV data to browser localStorage.
 */
export function saveDraft(cvData) {
  if (typeof window === "undefined") return false;
  try {
    const payload = {
      ...cvData,
      meta: {
        ...cvData.meta,
        lastModified: Date.now(),
      },
    };
    localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn("Unable to save CV draft to localStorage:", err);
    return false;
  }
}

/**
 * Loads and validates CV data from localStorage.
 * Ensures all required keys, sections, and arrays exist.
 */
export function loadDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CV_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const base = createEmptyCV();

    // Reconcile sectionOrder in case new sections were introduced
    const savedOrder = Array.isArray(parsed.sectionOrder) ? parsed.sectionOrder : [];
    const missingSections = DEFAULT_SECTION_ORDER.filter((sec) => !savedOrder.includes(sec));
    const mergedOrder = [...savedOrder, ...missingSections];

    return {
      meta: {
        ...base.meta,
        ...(parsed.meta || {}),
      },
      personal: {
        ...base.personal,
        ...(parsed.personal || {}),
      },
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      sectionOrder: mergedOrder,
      sectionVisibility: {
        ...base.sectionVisibility,
        ...(parsed.sectionVisibility || {}),
      },
      sectionTitles: {
        ...base.sectionTitles,
        ...(parsed.sectionTitles || {}),
      },
      design: {
        ...base.design,
        ...(parsed.design || {}),
        templateId: parsed.design?.templateId || parsed.settings?.templateId || base.design.templateId,
        fontSize: {
          ...base.design.fontSize,
          ...(parsed.design?.fontSize || {}),
        },
        spacing: {
          ...base.design.spacing,
          ...(parsed.design?.spacing || {}),
        },
        colors: {
          ...base.design.colors,
          ...(parsed.design?.colors || {}),
        },
        layout: {
          ...base.design.layout,
          ...(parsed.design?.layout || {}),
        },
        photo: {
          ...base.design.photo,
          ...(parsed.design?.photo || {}),
        },
      },
      settings: {
        templateId: parsed.design?.templateId || parsed.settings?.templateId || "modern",
      },
    };
  } catch (err) {
    console.warn("Unable to parse CV draft from localStorage:", err);
    return null;
  }
}

/**
 * Clears saved CV draft from localStorage.
 */
export function clearDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CV_STORAGE_KEY);
  } catch (err) {
    console.warn("Unable to clear CV draft from localStorage:", err);
  }
}

/**
 * Factory for debounced auto-save function.
 */
export function createAutoSave(delayMs = 500, onStatusChange) {
  let timeoutId = null;

  return (cvData) => {
    onStatusChange?.("saving");
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      saveDraft(cvData);
      onStatusChange?.("saved");
    }, delayMs);
  };
}
