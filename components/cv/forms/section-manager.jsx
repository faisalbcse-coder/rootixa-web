"use client";

import { useState } from "react";
import {
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Sliders,
  PenLine,
  Check,
  RotateCcw,
} from "lucide-react";
import { SECTION_METADATA } from "@/lib/cv/cv-types";

export function SectionManager({
  sectionOrder = [],
  sectionVisibility = {},
  sectionTitles = {},
  onMove,
  onReorder,
  onToggleVisibility,
  onUpdateTitle,
}) {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingTitleId, setEditingTitleId] = useState(null);

  // ─── Drag & Drop Handlers ───
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Keep clean
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...sectionOrder];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, movedItem);

    onReorder?.(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1 text-xs text-slate-500 dark:text-slate-400">
        <Sliders className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span>Drag sections to reorder, customize section headings, or toggle visibility.</span>
      </div>

      <div className="space-y-2">
        {sectionOrder.map((sectionId, index) => {
          const meta = SECTION_METADATA[sectionId] || { title: sectionId };
          const isVisible = sectionVisibility[sectionId] !== false;
          const isFirst = index === 0;
          const isLast = index === sectionOrder.length - 1;
          const currentTitle = sectionTitles?.[sectionId] || meta.title;
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          const isEditing = editingTitleId === sectionId;

          return (
            <div
              key={sectionId}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`p-2.5 rounded-xl border transition-all duration-150 flex flex-col gap-1.5 select-none ${
                isDragging
                  ? "opacity-40 scale-95 border-dashed border-indigo-400 bg-indigo-50/20"
                  : isDragOver
                  ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20"
                  : isVisible
                  ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700"
                  : "bg-slate-100/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                {/* Drag Handle & Section Name */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-grab active:cursor-grabbing"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </div>

                  <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        type="text"
                        autoFocus
                        value={currentTitle}
                        onChange={(e) => onUpdateTitle?.(sectionId, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setEditingTitleId(null);
                        }}
                        placeholder={meta.title}
                        className="py-0.5 px-2 text-xs font-semibold rounded border border-indigo-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setEditingTitleId(null)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                        title="Done editing heading"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      {currentTitle !== meta.title && (
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateTitle?.(sectionId, meta.title);
                            setEditingTitleId(null);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                          title="Reset to default title"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {currentTitle}
                      </h4>
                      {currentTitle !== meta.title && (
                        <span className="text-[10px] text-indigo-500 font-normal italic truncate">
                          (default: {meta.shortTitle || meta.title})
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingTitleId(sectionId)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Rename section heading"
                      >
                        <PenLine className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Accessible Controls: Move Up, Move Down, Toggle Visibility */}
                <div className="flex items-center gap-0.5 shrink-0">
                  {/* Move Up */}
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => onMove?.(sectionId, "up")}
                    aria-label={`Move ${meta.title} up`}
                    title="Move up"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => onMove?.(sectionId, "down")}
                    aria-label={`Move ${meta.title} down`}
                    title="Move down"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none transition cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleVisibility?.(sectionId)}
                    aria-label={isVisible ? `Hide ${meta.title}` : `Show ${meta.title}`}
                    title={isVisible ? "Hide section" : "Show section"}
                    className={`p-1 rounded-lg transition cursor-pointer ${
                      isVisible
                        ? "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                        : "text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                    }`}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
