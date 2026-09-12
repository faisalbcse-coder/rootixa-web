"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  createEmptyCV,
  createSampleCV,
  createEmptyExperience,
  createEmptyEducation,
  createEmptyProject,
  createEmptyCertification,
  createEmptyLanguage,
  createEmptyAward,
  createEmptyPublication,
  createEmptyVolunteer,
  createEmptyReference,
  createEmptyCustomSection,
  DEFAULT_DESIGN,
  DESIGN_PRESETS,
} from "./cv-types";
import { loadDraft, saveDraft, clearDraft, createAutoSave } from "./cv-storage";

export function useCVState() {
  const [cvData, setCvData] = useState(createEmptyCV);
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving"
  const isInitialMount = useRef(true);

  // ─── Bounded Undo / Redo History Stack (Max 30 states) ───
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isHistoryAction = useRef(false);

  // Initialize auto-save debouncer
  const autoSaveRef = useRef(null);
  if (!autoSaveRef.current) {
    autoSaveRef.current = createAutoSave(600, (status) => setSaveStatus(status));
  }

  // Load saved draft on client mount
  useEffect(() => {
    const draft = loadDraft();
    const initial = draft || createEmptyCV();
    if (draft) {
      setCvData(draft);
    }
    historyRef.current = [JSON.parse(JSON.stringify(initial))];
    historyIndexRef.current = 0;
    setCanUndo(false);
    setCanRedo(false);
    isInitialMount.current = false;
  }, []);

  // Update history snapshots and auto-save on state mutations
  useEffect(() => {
    if (isInitialMount.current) return;
    autoSaveRef.current?.(cvData);

    if (isHistoryAction.current) {
      isHistoryAction.current = false;
      return;
    }

    // Append new snapshot to bounded history
    const curIdx = historyIndexRef.current;
    const truncated = historyRef.current.slice(0, curIdx + 1);
    if (truncated.length >= 30) {
      truncated.shift();
    }
    truncated.push(JSON.parse(JSON.stringify(cvData)));
    historyRef.current = truncated;
    historyIndexRef.current = truncated.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [cvData]);

  // ─── Undo Action ───
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const target = historyRef.current[historyIndexRef.current];
      if (target) {
        isHistoryAction.current = true;
        setCvData(JSON.parse(JSON.stringify(target)));
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(true);
      }
    }
  }, []);

  // ─── Redo Action ───
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const target = historyRef.current[historyIndexRef.current];
      if (target) {
        isHistoryAction.current = true;
        setCvData(JSON.parse(JSON.stringify(target)));
        setCanUndo(true);
        setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
      }
    }
  }, []);

  // Global Keyboard Shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      // Only handle if not focused on an editable text input to allow native text undo
      if (tag === "input" || tag === "textarea") return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  // ─── Meta Actions ───
  const updateMeta = useCallback((field, value) => {
    setCvData((prev) => ({
      ...prev,
      meta: { ...prev.meta, [field]: value },
    }));
  }, []);

  // ─── Personal Info ───
  const updatePersonal = useCallback((field, value) => {
    setCvData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  }, []);

  // ─── Summary ───
  const updateSummary = useCallback((summary) => {
    setCvData((prev) => ({ ...prev, summary }));
  }, []);

  // ─── Experience Actions ───
  const addExperience = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      experience: [...prev.experience, createEmptyExperience()],
    }));
  }, []);

  const updateExperience = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeExperience = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  }, []);

  // ─── Education Actions ───
  const addEducation = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      education: [...prev.education, createEmptyEducation()],
    }));
  }, []);

  const updateEducation = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeEducation = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  }, []);

  // ─── Skills Actions ───
  const addSkill = useCallback((skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    setCvData((prev) => {
      if (prev.skills.includes(trimmed)) return prev;
      return {
        ...prev,
        skills: [...prev.skills, trimmed],
      };
    });
  }, []);

  const removeSkill = useCallback((target) => {
    setCvData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s, idx) => {
        if (typeof target === "number") return idx !== target;
        if (typeof s === "string") return s.toLowerCase() !== String(target).toLowerCase();
        if (s && typeof s === "object") return s.id !== target && s.name !== target;
        return true;
      }),
    }));
  }, []);

  const clearSkills = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      skills: [],
    }));
  }, []);

  // ─── Projects Actions ───
  const addProject = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      projects: [...prev.projects, createEmptyProject()],
    }));
  }, []);

  const updateProject = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeProject = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  }, []);

  // ─── Certifications Actions ───
  const addCertification = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, createEmptyCertification()],
    }));
  }, []);

  const updateCertification = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeCertification = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((item) => item.id !== id),
    }));
  }, []);

  // ─── Languages Actions ───
  const addLanguage = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      languages: [...prev.languages, createEmptyLanguage()],
    }));
  }, []);

  const updateLanguage = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      languages: prev.languages.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeLanguage = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((item) => item.id !== id),
    }));
  }, []);

  // ─── Awards & Honors Actions ───
  const addAward = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      awards: [...(prev.awards || []), createEmptyAward()],
    }));
  }, []);

  const updateAward = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      awards: (prev.awards || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeAward = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      awards: (prev.awards || []).filter((item) => item.id !== id),
    }));
  }, []);

  // ─── Publications & Research Actions ───
  const addPublication = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      publications: [...(prev.publications || []), createEmptyPublication()],
    }));
  }, []);

  const updatePublication = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      publications: (prev.publications || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removePublication = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      publications: (prev.publications || []).filter((item) => item.id !== id),
    }));
  }, []);

  // ─── Volunteering & Leadership Actions ───
  const addVolunteer = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      volunteer: [...(prev.volunteer || []), createEmptyVolunteer()],
    }));
  }, []);

  const updateVolunteer = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      volunteer: (prev.volunteer || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeVolunteer = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      volunteer: (prev.volunteer || []).filter((item) => item.id !== id),
    }));
  }, []);

  // ─── References Actions ───
  const updateReferences = useCallback((fieldOrUpdates, val) => {
    setCvData((prev) => {
      const currentRef = prev.references || { availableUponRequest: true, items: [] };
      if (typeof fieldOrUpdates === "object") {
        return {
          ...prev,
          references: { ...currentRef, ...fieldOrUpdates },
        };
      }
      return {
        ...prev,
        references: { ...currentRef, [fieldOrUpdates]: val },
      };
    });
  }, []);

  const addReference = useCallback(() => {
    setCvData((prev) => {
      const currentRef = prev.references || { availableUponRequest: false, items: [] };
      return {
        ...prev,
        references: {
          ...currentRef,
          availableUponRequest: false,
          items: [...(currentRef.items || []), createEmptyReference()],
        },
      };
    });
  }, []);

  const updateReference = useCallback((id, field, value) => {
    setCvData((prev) => {
      const currentRef = prev.references || { availableUponRequest: false, items: [] };
      return {
        ...prev,
        references: {
          ...currentRef,
          items: (currentRef.items || []).map((item) =>
            item.id === id ? { ...item, [field]: value } : item
          ),
        },
      };
    });
  }, []);

  const removeReference = useCallback((id) => {
    setCvData((prev) => {
      const currentRef = prev.references || { availableUponRequest: true, items: [] };
      return {
        ...prev,
        references: {
          ...currentRef,
          items: (currentRef.items || []).filter((item) => item.id !== id),
        },
      };
    });
  }, []);

  // ─── Custom Additional Section Actions ───
  const addCustomSection = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      customSections: [...(prev.customSections || []), createEmptyCustomSection()],
    }));
  }, []);

  const updateCustomSection = useCallback((id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const removeCustomSection = useCallback((id) => {
    setCvData((prev) => ({
      ...prev,
      customSections: (prev.customSections || []).filter((item) => item.id !== id),
    }));
  }, []);

  // ─── Section Reordering & Visibility ───
  const moveSection = useCallback((sectionId, direction) => {
    setCvData((prev) => {
      const order = [...prev.sectionOrder];
      const index = order.indexOf(sectionId);
      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= order.length) return prev;

      // Swap elements
      const temp = order[index];
      order[index] = order[targetIndex];
      order[targetIndex] = temp;

      return {
        ...prev,
        sectionOrder: order,
      };
    });
  }, []);

  const reorderSections = useCallback((newOrder) => {
    if (!Array.isArray(newOrder)) return;
    setCvData((prev) => ({
      ...prev,
      sectionOrder: newOrder,
    }));
  }, []);

  const toggleSectionVisibility = useCallback((sectionId) => {
    setCvData((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [sectionId]: !prev.sectionVisibility[sectionId],
      },
    }));
  }, []);

  // ─── Custom Section Titles ───
  const updateSectionTitle = useCallback((sectionKey, title) => {
    setCvData((prev) => ({
      ...prev,
      sectionTitles: {
        ...prev.sectionTitles,
        [sectionKey]: title,
      },
    }));
  }, []);

  // ─── Design Customization Actions ───
  const updateDesign = useCallback((groupOrKey, keyOrValue, value) => {
    setCvData((prev) => {
      const currentDesign = prev.design || DEFAULT_DESIGN;

      // Single root property update e.g. updateDesign("fontFamily", "Roboto")
      if (value === undefined) {
        return {
          ...prev,
          design: {
            ...currentDesign,
            [groupOrKey]: keyOrValue,
          },
        };
      }

      // Nested group property update e.g. updateDesign("fontSize", "name", 32)
      return {
        ...prev,
        design: {
          ...currentDesign,
          [groupOrKey]: {
            ...(currentDesign[groupOrKey] || {}),
            [keyOrValue]: value,
          },
        },
      };
    });
  }, []);

  const applyDesignPreset = useCallback((presetId) => {
    const preset = DESIGN_PRESETS[presetId];
    if (!preset) return;
    setCvData((prev) => {
      const currentDesign = prev.design || DEFAULT_DESIGN;
      return {
        ...prev,
        design: {
          ...currentDesign,
          ...preset.design,
          fontSize: { ...currentDesign.fontSize, ...preset.design.fontSize },
          spacing: { ...currentDesign.spacing, ...preset.design.spacing },
          colors: { ...currentDesign.colors, ...preset.design.colors },
          layout: { ...currentDesign.layout, ...preset.design.layout },
        },
      };
    });
  }, []);

  const resetDesign = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      design: {
        ...DEFAULT_DESIGN,
        fontSize: { ...DEFAULT_DESIGN.fontSize },
        spacing: { ...DEFAULT_DESIGN.spacing },
        colors: { ...DEFAULT_DESIGN.colors },
        layout: { ...DEFAULT_DESIGN.layout },
        photo: { ...DEFAULT_DESIGN.photo },
      },
      settings: {
        templateId: "modern",
      },
    }));
  }, []);

  // ─── Profile Photo Actions ───
  const updatePhoto = useCallback((photoUpdates) => {
    setCvData((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        photo: {
          ...(prev.design?.photo || DEFAULT_DESIGN.photo),
          ...photoUpdates,
        },
      },
    }));
  }, []);

  const removePhoto = useCallback(() => {
    setCvData((prev) => ({
      ...prev,
      design: {
        ...prev.design,
        photo: {
          enabled: false,
          url: "",
          shape: "circle",
        },
      },
    }));
  }, []);

  // ─── Template Selection ───
  const setTemplate = useCallback((templateId) => {
    setCvData((prev) => ({
      ...prev,
      design: {
        ...(prev.design || DEFAULT_DESIGN),
        templateId,
      },
      settings: {
        ...prev.settings,
        templateId,
      },
    }));
  }, []);

  // ─── Reset Entire CV Data ───
  const resetCV = useCallback(() => {
    const blank = createEmptyCV();
    setCvData(blank);
    clearDraft();
    setSaveStatus("saved");
  }, []);

  // ─── Load Sample Data ───
  const loadSample = useCallback(() => {
    const sample = createSampleCV();
    setCvData(sample);
    saveDraft(sample);
    setSaveStatus("saved");
  }, []);

  return {
    cvData,
    saveStatus,
    canUndo,
    canRedo,
    undo,
    redo,
    setTemplate,
    updateDesign,
    applyDesignPreset,
    resetDesign,
    updatePhoto,
    removePhoto,
    updateSectionTitle,
    reorderSections,
    updateMeta,
    updatePersonal,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill,
    clearSkills,
    addProject,
    updateProject,
    removeProject,
    addCertification,
    updateCertification,
    removeCertification,
    addLanguage,
    updateLanguage,
    removeLanguage,
    addAward,
    updateAward,
    removeAward,
    addPublication,
    updatePublication,
    removePublication,
    addVolunteer,
    updateVolunteer,
    removeVolunteer,
    updateReferences,
    addReference,
    updateReference,
    removeReference,
    addCustomSection,
    updateCustomSection,
    removeCustomSection,
    moveSection,
    toggleSectionVisibility,
    resetCV,
    loadSample,
  };
}
