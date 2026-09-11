"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { PersonalInfoForm } from "./forms/personal-info-form";
import { SummaryForm } from "./forms/summary-form";
import { ExperienceForm } from "./forms/experience-form";
import { EducationForm } from "./forms/education-form";
import { SkillsForm } from "./forms/skills-form";
import { ProjectsForm } from "./forms/projects-form";
import { CertificationsForm } from "./forms/certifications-form";
import { LanguagesForm } from "./forms/languages-form";
import { CVWizardStepper, CVWizardNavigation, getWizardSteps } from "./cv-wizard-stepper";

export function CVEditor({
  cvData,
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
  photo,
  updatePhoto,
  removePhoto,
  moveSection,
  reorderSections,
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentPhoto =
    photo || cvData?.design?.photo || { enabled: false, url: "", shape: "circle" };

  const steps = getWizardSteps(cvData?.sectionOrder);
  const safeStepIndex = Math.min(Math.max(0, currentStepIndex), steps.length - 1);
  const activeStep = steps[safeStepIndex] || steps[0];

  return (
    <div className="space-y-4">
      {/* ─── Guided Stepper Header with Moveable / Scroll Controls ─── */}
      <CVWizardStepper
        currentStepIndex={safeStepIndex}
        onStepChange={setCurrentStepIndex}
        sectionOrder={cvData?.sectionOrder}
        onReorderSections={reorderSections}
      />

      {/* ─── Current Step Content Card ─── */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xs min-h-[420px] flex flex-col justify-between">
        <div>
          {/* Step: Personal Information & Profile Photo */}
          {activeStep.id === "personal" && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Personal Information &amp; Photo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add your contact details, professional title, and optional profile picture.
                </p>
              </div>
              <PersonalInfoForm
                personal={cvData?.personal || {}}
                onChange={updatePersonal}
                photo={currentPhoto}
                onPhotoChange={updatePhoto}
                onPhotoRemove={removePhoto}
              />
            </div>
          )}

          {/* Step: Professional Summary */}
          {activeStep.id === "summary" && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Professional Summary
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Write a brief 2-4 sentence introduction highlighting your background, key strengths, and career focus.
                </p>
              </div>
              <SummaryForm
                summary={cvData?.summary || ""}
                onChange={updateSummary}
              />
            </div>
          )}

          {/* Step: Experience */}
          {activeStep.id === "experience" && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Work Experience
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  List your relevant career history. Use bullet points (`•`) for key achievements and responsibilities.
                </p>
              </div>
              <ExperienceForm
                experiences={cvData?.experience || []}
                experience={cvData?.experience || []}
                onAdd={addExperience}
                onUpdate={updateExperience}
                onRemove={removeExperience}
              />
            </div>
          )}

          {/* Step: Education */}
          {activeStep.id === "education" && (
            <div>
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Education History
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add your university degrees, diplomas, or relevant academic qualifications.
                </p>
              </div>
              <EducationForm
                educations={cvData?.education || []}
                education={cvData?.education || []}
                onAdd={addEducation}
                onUpdate={updateEducation}
                onRemove={removeEducation}
              />
            </div>
          )}

          {/* Step: Skills & Languages */}
          {activeStep.id === "skills" && (
            <div className="space-y-6">
              <div>
                <div className="mb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Skills &amp; Competencies
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Type a skill and press Enter or comma to add (e.g. React, Python, Project Management).
                  </p>
                </div>
                <SkillsForm
                  skills={cvData?.skills || []}
                  onAdd={addSkill}
                  onRemove={removeSkill}
                  onClearAll={clearSkills}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Languages
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Languages you can speak and write professionally.
                  </p>
                </div>
                <LanguagesForm
                  languages={cvData?.languages || []}
                  onAdd={addLanguage}
                  onUpdate={updateLanguage}
                  onRemove={removeLanguage}
                />
              </div>
            </div>
          )}

          {/* Step: Projects & Certifications */}
          {activeStep.id === "projects" && (
            <div className="space-y-6">
              <div>
                <div className="mb-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Featured Projects
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showcase key projects, portfolio links, and technical tools.
                  </p>
                </div>
                <ProjectsForm
                  projects={cvData?.projects || []}
                  onAdd={addProject}
                  onUpdate={updateProject}
                  onRemove={removeProject}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Certifications &amp; Licenses
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Industry credentials, certificates, or awards.
                  </p>
                </div>
                <CertificationsForm
                  certifications={cvData?.certifications || []}
                  onAdd={addCertification}
                  onUpdate={updateCertification}
                  onRemove={removeCertification}
                />
              </div>
            </div>
          )}

          {/* Step: Review & Finalize */}
          {activeStep.id === "finish" && (
            <div className="space-y-4 text-center py-8">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Your CV is Ready!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Review your live document on the preview panel. When you are ready, click the{" "}
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">Download PDF</span>{" "}
                  button at the top right to download your resume.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ─── Bottom Navigation ─── */}
        <CVWizardNavigation
          currentStepIndex={safeStepIndex}
          onStepChange={setCurrentStepIndex}
          sectionOrder={cvData?.sectionOrder}
        />
      </div>
    </div>
  );
}
