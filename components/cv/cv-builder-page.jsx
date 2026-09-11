"use client";

import { useState, useMemo } from "react";
import { useCVState } from "@/lib/cv/use-cv-state";
import { CVHeader } from "./cv-header";
import { CVEditor } from "./cv-editor";
import { CVPreview } from "./cv-preview";
import { TemplateSelectorModal } from "./template-selector-modal";
import { getTemplate } from "./templates/template-registry";
import { exportCvToPdf, printCv } from "@/lib/cv/cv-pdf-exporter";
import { generateSanitizedFilename } from "@/lib/cv/export-utils";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export function CVBuilderPage() {
  const {
    cvData,
    setTemplate,
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
    moveSection,
    toggleSectionVisibility,
    resetCV,
    loadSample,
  } = useCVState();

  // Mobile/Tablet active view: "editor" | "preview"
  const [activeView, setActiveView] = useState("editor");

  // Template selector modal visibility
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // PDF Generation State & Toast
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);

  // Active template metadata
  const activeTemplate = useMemo(() => {
    return getTemplate(cvData.design?.templateId || cvData.settings?.templateId);
  }, [cvData.design?.templateId, cvData.settings?.templateId]);

  // Direct, clean PDF download handler
  const handleDownloadPdf = async () => {
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setDownloadToast({
      type: "loading",
      message: "Generating standard A4 PDF...",
    });

    try {
      const fileName = generateSanitizedFilename(cvData.personal?.fullName);
      await exportCvToPdf({
        elementId: "cv-document-root",
        fileName,
        onProgress: (msg) => {
          setDownloadToast({ type: "loading", message: msg });
        },
      });

      setDownloadToast({
        type: "success",
        message: "PDF downloaded successfully! Check your downloads folder.",
      });
      setTimeout(() => setDownloadToast(null), 4500);
    } catch (err) {
      console.warn("Direct PDF generation notice, triggering print fallback:", err);
      setDownloadToast({
        type: "info",
        message: "Opening print dialog — please choose 'Save as PDF'.",
      });
      printCv();
      setTimeout(() => setDownloadToast(null), 5000);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-slate-100/70 dark:bg-[#070B12] text-slate-800 dark:text-slate-100 transition-colors lg:overflow-hidden">
      {/* ─── Clean Header ─── */}
      <CVHeader
        documentTitle={cvData.meta?.title}
        onTitleChange={(title) => updateMeta("title", title)}
        onReset={resetCV}
        activeView={activeView}
        onViewToggle={setActiveView}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />

      {/* ─── Main Clean 2-Column Workspace (Independent Scroll) ─── */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-4 lg:p-5 min-h-0 lg:overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-5 lg:h-full lg:min-h-0 items-stretch">
          {/* ──── Left Column: Clean Guided Form (Scrolls Independently) ──── */}
          <div
            className={`w-full lg:w-[480px] xl:w-[520px] shrink-0 lg:h-full lg:overflow-y-auto pr-0 lg:pr-1 pb-6 transition-all ${
              activeView === "editor" ? "block" : "hidden lg:block"
            }`}
          >
            <CVEditor
              cvData={cvData}
              updatePersonal={updatePersonal}
              updateSummary={updateSummary}
              addExperience={addExperience}
              updateExperience={updateExperience}
              removeExperience={removeExperience}
              addEducation={addEducation}
              updateEducation={updateEducation}
              removeEducation={removeEducation}
              addSkill={addSkill}
              removeSkill={removeSkill}
              clearSkills={clearSkills}
              addProject={addProject}
              updateProject={updateProject}
              removeProject={removeProject}
              addCertification={addCertification}
              updateCertification={updateCertification}
              removeCertification={removeCertification}
              addLanguage={addLanguage}
              updateLanguage={updateLanguage}
              removeLanguage={removeLanguage}
              moveSection={moveSection}
              reorderSections={reorderSections}
              toggleSectionVisibility={toggleSectionVisibility}
              updateSectionTitle={updateSectionTitle}
              loadSample={loadSample}
              photo={cvData.design?.photo}
              updatePhoto={updatePhoto}
              removePhoto={removePhoto}
            />
          </div>

          {/* ──── Right Column: Live A4 Document Preview (Scrolls Independently) ──── */}
          <div
            className={`flex-1 w-full min-w-0 lg:h-full lg:overflow-hidden transition-all ${
              activeView === "preview" ? "block" : "hidden lg:block"
            }`}
          >
            <CVPreview
              cvData={cvData}
              activeTemplateName={activeTemplate.name}
              onOpenTemplates={() => setIsTemplateModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* ─── 1-by-1 Template Selector Modal ─── */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        selectedTemplateId={activeTemplate.id}
        onSelectTemplate={(templateId) => {
          setTemplate(templateId);
        }}
        cvData={cvData}
      />

      {/* ─── Download Toast Notification ─── */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-900 shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-4 duration-200">
          {downloadToast.type === "loading" && (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400 dark:text-indigo-600 shrink-0" />
          )}
          {downloadToast.type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          )}
          {downloadToast.type === "info" && (
            <AlertCircle className="w-4 h-4 text-amber-400 dark:text-amber-600 shrink-0" />
          )}
          <span>{downloadToast.message}</span>
        </div>
      )}
    </div>
  );
}
