"use client";

import { useState, useMemo } from "react";
import { useCVState } from "@/lib/cv/use-cv-state";
import { CVWizardHeader } from "./wizard/cv-wizard-header";
import { StepPersonal } from "./wizard/step-personal";
import { StepExperiences } from "./wizard/step-experiences";
import { StepTemplate } from "./wizard/step-template";
import { CVPreviewModal } from "./wizard/cv-preview-modal";
import { CVDocument } from "./cv-document";
import { getTemplate } from "./templates/template-registry";
import { exportCvToPdf, printCv } from "@/lib/cv/cv-pdf-exporter";
import { generateSanitizedFilename } from "@/lib/cv/export-utils";
import { CheckCircle2, Loader2, AlertCircle, Eye } from "lucide-react";

export function CVBuilderPage() {
  const {
    cvData,
    setTemplate,
    updatePhoto,
    removePhoto,
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
    resetCV,
    loadSample,
    updateDesign,
  } = useCVState();

  // ─── 3-Step Wizard Navigation (1: Personal, 2: Experiences, 3: Template) ───
  const [currentStep, setCurrentStep] = useState(1);

  // ─── Quick Preview Modal State ───
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // ─── PDF Generation State & Toast ───
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadToast, setDownloadToast] = useState(null);

  // Active template metadata
  const activeTemplate = useMemo(() => {
    return getTemplate(cvData.design?.templateId || cvData.settings?.templateId || "harvard");
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
      const fileName = generateSanitizedFilename(cvData.personal?.fullName || "Rootixa_Resume");
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

  const handleStepChange = (stepId) => {
    setCurrentStep(stepId);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-[#070B12] text-slate-800 dark:text-slate-100 transition-colors selection:bg-indigo-500/20">
      {/* ─── 1. Top Rootixa Branded Stepper Header ─── */}
      <CVWizardHeader
        currentStep={currentStep}
        onStepClick={handleStepChange}
        onOpenPreview={() => setIsPreviewModalOpen(true)}
        onLoadSample={loadSample}
        onReset={resetCV}
      />

      {/* ─── 2. Main Wizard Step Content Area ─── */}
      <main className="flex-1 w-full pb-16">
        {/* Step 1: Personal Details */}
        {currentStep === 1 && (
          <StepPersonal
            personal={cvData.personal}
            onChange={updatePersonal}
            photo={cvData.design?.photo}
            onPhotoChange={updatePhoto}
            onPhotoRemove={removePhoto}
            onNext={() => handleStepChange(2)}
          />
        )}

        {/* Step 2: Experiences & Qualifications */}
        {currentStep === 2 && (
          <StepExperiences
            cvData={cvData}
            updateSummary={updateSummary}
            addExperience={addExperience}
            updateExperience={updateExperience}
            removeExperience={removeExperience}
            addEducation={addEducation}
            updateEducation={updateEducation}
            removeEducation={removeEducation}
            addSkill={addSkill}
            removeSkill={removeSkill}
            addProject={addProject}
            updateProject={updateProject}
            removeProject={removeProject}
            addCertification={addCertification}
            updateCertification={updateCertification}
            removeCertification={removeCertification}
            addLanguage={addLanguage}
            updateLanguage={updateLanguage}
            removeLanguage={removeLanguage}
            addAward={addAward}
            updateAward={updateAward}
            removeAward={removeAward}
            addPublication={addPublication}
            updatePublication={updatePublication}
            removePublication={removePublication}
            addVolunteer={addVolunteer}
            updateVolunteer={updateVolunteer}
            removeVolunteer={removeVolunteer}
            updateReferences={updateReferences}
            addReference={addReference}
            updateReference={updateReference}
            removeReference={removeReference}
            addCustomSection={addCustomSection}
            updateCustomSection={updateCustomSection}
            removeCustomSection={removeCustomSection}
            onNext={() => handleStepChange(3)}
            onPrev={() => handleStepChange(1)}
          />
        )}

        {/* Step 3: Select Template & Download */}
        {currentStep === 3 && (
          <StepTemplate
            cvData={cvData}
            selectedTemplateId={activeTemplate.id}
            onSelectTemplate={(templateId) => setTemplate(templateId)}
            onColorChange={(hex) => updateDesign("colors", "accent", hex)}
            onDownloadPdf={handleDownloadPdf}
            isDownloadingPdf={isDownloadingPdf}
            onPrev={() => handleStepChange(2)}
            onOpenFullPreview={() => setIsPreviewModalOpen(true)}
          />
        )}
      </main>

      {/* ─── 3. Floating Quick Preview Button (Visible on Step 1 & 2) ─── */}
      {currentStep !== 3 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-700/50 dark:border-slate-200"
            title="Preview formatted CV anytime"
          >
            <Eye className="w-4 h-4 text-indigo-400 dark:text-indigo-600" />
            <span>Preview CV</span>
          </button>
        </div>
      )}

      {/* ─── 4. Live A4 Document Preview Modal (Clean Inspection Anytime) ─── */}
      <CVPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        cvData={cvData}
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
      />

      {/* ─── 5. Offscreen Root A4 Document (Only mounted when modal is closed to avoid duplicate IDs) ─── */}
      {!isPreviewModalOpen && (
        <div
          aria-hidden="true"
          className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 select-none overflow-hidden"
        >
          <CVDocument cvData={cvData} />
        </div>
      )}

      {/* ─── 6. Download Toast Notification ─── */}
      {downloadToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-slate-900/95 dark:bg-white/95 backdrop-blur-md text-white dark:text-slate-900 shadow-2xl text-xs font-bold animate-in slide-in-from-bottom-4 duration-200">
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
