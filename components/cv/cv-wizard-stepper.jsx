"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  Check,
  GripVertical,
} from "lucide-react";

export const STEP_DEFINITIONS = {
  personal: { id: "personal", label: "Personal Info & Photo", short: "Personal", icon: User, fixed: true },
  summary: { id: "summary", label: "Professional Summary", short: "Summary", icon: FileText, fixed: false },
  experience: { id: "experience", label: "Work Experience", short: "Experience", icon: Briefcase, fixed: false },
  education: { id: "education", label: "Education History", short: "Education", icon: GraduationCap, fixed: false },
  skills: { id: "skills", label: "Skills & Languages", short: "Skills", icon: Wrench, fixed: false },
  projects: { id: "projects", label: "Projects & Honors", short: "Projects", icon: FolderGit2, fixed: false },
  finish: { id: "finish", label: "Final Review", short: "Finish", icon: Check, fixed: true },
};

export const REORDERABLE_STEP_IDS = ["summary", "experience", "education", "skills", "projects"];

export function getWizardSteps(sectionOrder = []) {
  const middleIds = [];

  if (Array.isArray(sectionOrder)) {
    for (const id of sectionOrder) {
      if (REORDERABLE_STEP_IDS.includes(id) && !middleIds.includes(id)) {
        middleIds.push(id);
      }
    }
  }
  for (const id of REORDERABLE_STEP_IDS) {
    if (!middleIds.includes(id)) {
      middleIds.push(id);
    }
  }

  return [
    STEP_DEFINITIONS.personal,
    ...middleIds.map((id) => STEP_DEFINITIONS[id]),
    STEP_DEFINITIONS.finish,
  ];
}

export const WIZARD_STEPS = getWizardSteps();

export function CVWizardStepper({
  currentStepIndex = 0,
  onStepChange,
  sectionOrder,
  onReorderSections,
}) {
  const steps = getWizardSteps(sectionOrder);
  const totalSteps = steps.length;
  const safeIndex = Math.min(Math.max(0, currentStepIndex), totalSteps - 1);
  const currentStep = steps[safeIndex] || steps[0];
  const progressPercent = Math.round(((safeIndex + 1) / totalSteps) * 100);

  const scrollContainerRef = useRef(null);
  const pillRefs = useRef([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Drag & drop reordering state
  const [draggedStepId, setDraggedStepId] = useState(null);
  const [dragOverStepId, setDragOverStepId] = useState(null);

  // Check scroll position and boundaries
  const updateScrollBoundaries = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  // Update on mount, resize, and steps change
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollBoundaries();

    const handleScroll = () => updateScrollBoundaries();
    el.addEventListener("scroll", handleScroll, { passive: true });

    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateScrollBoundaries());
      ro.observe(el);
    }

    // Wheel event for horizontal scrolling
    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        updateScrollBoundaries();
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("scroll", handleScroll);
      el.removeEventListener("wheel", handleWheel);
      if (ro) ro.disconnect();
    };
  }, [updateScrollBoundaries, steps]);

  // Auto-scroll active pill into view
  useEffect(() => {
    const activeEl = pillRefs.current[safeIndex];
    if (activeEl && scrollContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      const timer = setTimeout(updateScrollBoundaries, 350);
      return () => clearTimeout(timer);
    }
  }, [safeIndex, updateScrollBoundaries]);

  // Button scroll handlers (smooth horizontal sliding)
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -160, behavior: "smooth" });
      setTimeout(updateScrollBoundaries, 300);
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 160, behavior: "smooth" });
      setTimeout(updateScrollBoundaries, 300);
    }
  };

  // Drag & drop reordering handlers
  const handleDragStart = (e, stepId) => {
    if (stepId === "personal" || stepId === "finish") return;
    setDraggedStepId(stepId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", stepId);
  };

  const handleDragOver = (e, stepId) => {
    if (stepId === "personal" || stepId === "finish") return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStepId !== stepId) {
      setDragOverStepId(stepId);
    }
  };

  const handleDrop = (e, targetStepId) => {
    e.preventDefault();
    if (!draggedStepId || draggedStepId === targetStepId) {
      setDraggedStepId(null);
      setDragOverStepId(null);
      return;
    }
    if (targetStepId === "personal" || targetStepId === "finish") {
      setDraggedStepId(null);
      setDragOverStepId(null);
      return;
    }

    if (onReorderSections && Array.isArray(sectionOrder)) {
      const newOrder = [...sectionOrder];
      const fromIndex = newOrder.indexOf(draggedStepId);
      const toIndex = newOrder.indexOf(targetStepId);

      if (fromIndex !== -1 && toIndex !== -1) {
        const [moved] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, moved);
        onReorderSections(newOrder);

        // Keep active step aligned with reordered steps
        const activeStepId = steps[safeIndex]?.id;
        const newSteps = getWizardSteps(newOrder);
        const newActiveIndex = newSteps.findIndex((s) => s.id === activeStepId);
        if (newActiveIndex !== -1 && onStepChange) {
          onStepChange(newActiveIndex);
        }
      }
    }

    setDraggedStepId(null);
    setDragOverStepId(null);
  };

  const handleDragEnd = () => {
    setDraggedStepId(null);
    setDragOverStepId(null);
  };

  return (
    <div className="space-y-2.5 mb-4">
      {/* ─── Progress Bar & Step Counter ─── */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
        <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
          <span>Step {safeIndex + 1} of {totalSteps}:</span>
          <span className="text-slate-900 dark:text-white font-black">{currentStep.label}</span>
        </span>
        <span className="font-mono text-[11px]">{progressPercent}% Completed</span>
      </div>

      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ─── Moveable Step Pills with Left & Right Arrows ─── */}
      <div className="relative flex items-center gap-1.5 w-full">
        {/* Left Scroll Arrow */}
        <button
          type="button"
          onClick={handleScrollLeft}
          disabled={!canScrollLeft}
          title="Scroll steps left"
          aria-label="Scroll steps left"
          className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
            canScrollLeft
              ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs cursor-pointer active:scale-95"
              : "opacity-20 border-transparent text-slate-400 cursor-not-allowed pointer-events-none"
          }`}
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Scroll Track & Gradient Fades */}
        <div className="relative flex-1 min-w-0 overflow-hidden rounded-xl">
          {/* Left subtle fade mask */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-slate-50/90 dark:from-slate-900/90 to-transparent pointer-events-none z-10" />
          )}

          {/* Right subtle fade mask */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-5 bg-gradient-to-l from-slate-50/90 dark:from-slate-900/90 to-transparent pointer-events-none z-10" />
          )}

          {/* Horizontal Pills Container */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 scrollbar-none scroll-smooth select-none"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {steps.map((step, idx) => {
              const isActive = idx === safeIndex;
              const isCompleted = idx < safeIndex;
              const StepIcon = step.icon;
              const isReorderable = !step.fixed;
              const isDragging = draggedStepId === step.id;
              const isDragOver = dragOverStepId === step.id;

              return (
                <button
                  key={step.id}
                  ref={(el) => (pillRefs.current[idx] = el)}
                  type="button"
                  draggable={isReorderable}
                  onDragStart={(e) => handleDragStart(e, step.id)}
                  onDragOver={(e) => handleDragOver(e, step.id)}
                  onDrop={(e) => handleDrop(e, step.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onStepChange(idx)}
                  title={
                    isReorderable
                      ? `${step.label} (Drag to reorder section in CV)`
                      : step.label
                  }
                  className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer ${
                    isDragging
                      ? "opacity-40 scale-95 border-2 border-dashed border-indigo-500 bg-indigo-50/50"
                      : isDragOver
                      ? "ring-2 ring-indigo-500 scale-105 bg-indigo-100 dark:bg-indigo-900/50 shadow-md"
                      : isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : isCompleted
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                      : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {isReorderable && (
                    <GripVertical
                      className={`w-3 h-3 -ml-0.5 opacity-40 group-hover:opacity-100 transition shrink-0 ${
                        isActive ? "text-indigo-200" : "text-slate-400"
                      }`}
                    />
                  )}
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3] text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <StepIcon className="w-3.5 h-3.5" />
                  )}
                  <span className="whitespace-nowrap">{step.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Scroll Arrow */}
        <button
          type="button"
          onClick={handleScrollRight}
          disabled={!canScrollRight}
          title="Scroll right"
          aria-label="Scroll steps right"
          className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all shrink-0 ${
            canScrollRight
              ? "bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 shadow-2xs cursor-pointer active:scale-95 ring-1 ring-indigo-500/20"
              : "opacity-20 border-transparent text-slate-400 cursor-not-allowed pointer-events-none"
          }`}
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

export function CVWizardNavigation({
  currentStepIndex = 0,
  onStepChange,
  sectionOrder,
}) {
  const steps = getWizardSteps(sectionOrder);
  const totalSteps = steps.length;
  const safeIndex = Math.min(Math.max(0, currentStepIndex), totalSteps - 1);
  const isFirst = safeIndex === 0;
  const isLast = safeIndex === totalSteps - 1;
  const nextStep = steps[safeIndex + 1];

  return (
    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => !isFirst && onStepChange(safeIndex - 1)}
        disabled={isFirst}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
          isFirst
            ? "opacity-30 cursor-not-allowed text-slate-400 bg-slate-100 dark:bg-slate-800"
            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs cursor-pointer"
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Previous</span>
      </button>

      {/* Next or Finish Indicator */}
      {isLast ? (
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-3.5 py-2 rounded-xl">
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>All Steps Completed</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onStepChange(safeIndex + 1)}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition cursor-pointer"
        >
          <span>Next: {nextStep?.short || "Next"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
