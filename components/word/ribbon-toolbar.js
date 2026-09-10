"use client";

import React, { useState, useRef } from "react";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Baseline,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  RemoveFormatting,
  Table as TableIcon,
  Image as ImageIcon,
  Link as LinkIcon,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Printer,
  Trash2,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  FileText,
  Check,
  Scissors,
  Copy,
  ClipboardPaste,
  Columns as ColumnsIcon,
  Minus,
  BookOpen,
  Eye,
  Sliders,
  FileDown,
  ExternalLink,
  Calendar,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Search,
  Replace,
  Sparkles,
  Layers,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  CheckSquare,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { TableGridPicker } from "./table-grid-picker";

export function RibbonToolbar({
  editor,
  activeTab,
  setActiveTab,
  // File actions
  onNewDocument,
  onOpenDocumentFile,
  onManualSave,
  onClearDocument,
  onOpenWordCount,
  onExportDocx,
  onExportPdf,
  onOpenPrintPreview,
  onOpenDocProperties,
  // Insert actions
  onOpenLinkModal,
  onInsertImageFile,
  onOpenHeaderFooter,
  // Dialog Launchers
  onOpenFontDialog,
  onOpenParagraphDialog,
  onOpenPageSetupDialog,
  onOpenFindReplace,
  // Layout states
  pageSettings,
  setPageSettings,
  // Design state
  designTheme,
  setDesignTheme,
  // View states
  zoom,
  setZoom,
  focusMode,
  setFocusMode,
  showBoundaries,
  setShowBoundaries,
  showRuler,
  setShowRuler,
  showNavPane,
  setShowNavPane,
  viewMode,
  setViewMode,
  toggleFullscreen,
  isFullscreen,
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showLineSpacingPicker, setShowLineSpacingPicker] = useState(false);
  const imageInputRef = useRef(null);
  const openDocInputRef = useRef(null);

  const FONT_FAMILIES = [
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Calibri", value: "Calibri, Candara, Segoe, 'Segoe UI', sans-serif" },
    { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
    { label: "Georgia", value: "Georgia, serif" },
    { label: "Verdana", value: "Verdana, sans-serif" },
    { label: "Courier New", value: "'Courier New', Courier, monospace" },
  ];

  const FONT_SIZES = [
    "8px", "9px", "10px", "11px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px", "72px"
  ];

  const COLOR_PALETTE = [
    "#000000", "#434343", "#666666", "#999999", "#d9d9d9", "#ffffff",
    "#e11d48", "#f97316", "#eab308", "#16a34a", "#0284c7", "#4f46e5",
    "#9333ea", "#c026d3", "#be123c", "#b45309", "#047857", "#1d4ed8"
  ];

  const HIGHLIGHT_PALETTE = [
    "#fef08a", "#bbf7d0", "#bae6fd", "#fbcfe8", "#fed7aa", "#e9d5ff"
  ];

  const getCurrentFontFamily = () => {
    if (!editor) return FONT_FAMILIES[0].value;
    return editor.getAttributes("textStyle")?.fontFamily || FONT_FAMILIES[0].value;
  };

  const getCurrentFontSize = () => {
    if (!editor) return "16px";
    return editor.getAttributes("textStyle")?.fontSize || "16px";
  };

  const handleFontFamilyChange = (val) => {
    if (!editor) return;
    editor.chain().focus().setFontFamily(val).run();
  };

  const handleFontSizeChange = (val) => {
    if (!editor) return;
    editor.chain().focus().setFontSize(val).run();
  };

  const stepFontSize = (increase = true) => {
    if (!editor) return;
    const current = parseInt(getCurrentFontSize(), 10) || 16;
    const sizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];
    let nextSize = current;
    if (increase) {
      const match = sizes.find((s) => s > current);
      nextSize = match || sizes[sizes.length - 1];
    } else {
      const match = [...sizes].reverse().find((s) => s < current);
      nextSize = match || sizes[0];
    }
    handleFontSizeChange(`${nextSize}px`);
  };

  const handleCut = () => {
    if (!editor) return;
    document.execCommand("cut");
  };

  const handleCopy = () => {
    if (!editor) return;
    document.execCommand("copy");
  };

  const handlePaste = async () => {
    if (!editor) return;
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          editor.chain().focus().insertContent(text).run();
        }
      }
    } catch {
      editor.commands.focus();
    }
  };

  const setLineSpacing = (val) => {
    if (!editor) return;
    editor.chain().focus().setLineHeight(val).run();
    setShowLineSpacingPicker(false);
  };

  const handleInsertTable = (rows, cols) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
  };

  const handleInsertDateTime = () => {
    if (!editor) return;
    const now = new Date();
    const formatted = now.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    editor.chain().focus().insertContent(formatted).run();
  };

  // Button Class Helper
  const btnClass = (isActive = false, isDisabled = false) => `
    px-1.5 py-1 rounded text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center shrink-0
    ${
      isDisabled
        ? "opacity-35 cursor-not-allowed"
        : isActive
        ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold shadow-2xs"
        : "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
    }
  `;

  // Ribbon Tab Pill
  const ribbonTabClass = (tabId) => `
    px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-t select-none flex items-center gap-1 border-b-2
    ${
      activeTab === tabId
        ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 bg-white dark:bg-slate-900 font-bold"
        : "text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
    }
  `;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs select-none shrink-0 no-print">
      {/* Hidden file inputs */}
      <input
        ref={openDocInputRef}
        type="file"
        accept=".docx,.txt,.html,.htm"
        onChange={onOpenDocumentFile}
        className="hidden"
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={onInsertImageFile}
        className="hidden"
      />

      {/* ============================================================
          LEVEL 1: RIBBON TABS (Word-Style 8 Tabs)
      ============================================================ */}
      <nav aria-label="Ribbon Tabs" className="flex items-center px-2 sm:px-4 pt-0.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-0.5">
        <button
          onClick={() => setActiveTab("file")}
          className={`px-3 py-1 text-xs font-bold rounded-t transition cursor-pointer ${
            activeTab === "file"
              ? "bg-indigo-600 text-white shadow-xs"
              : "text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800"
          }`}
        >
          File
        </button>

        <button onClick={() => setActiveTab("home")} className={ribbonTabClass("home")}>
          Home
        </button>
        <button onClick={() => setActiveTab("insert")} className={ribbonTabClass("insert")}>
          Insert
        </button>
        <button onClick={() => setActiveTab("design")} className={ribbonTabClass("design")}>
          Design
        </button>
        <button onClick={() => setActiveTab("layout")} className={ribbonTabClass("layout")}>
          Layout
        </button>
        <button onClick={() => setActiveTab("references")} className={ribbonTabClass("references")}>
          References
        </button>
        <button onClick={() => setActiveTab("mailings")} className={ribbonTabClass("mailings")}>
          Mailings
        </button>
        <button onClick={() => setActiveTab("review")} className={ribbonTabClass("review")}>
          Review
        </button>
        <button onClick={() => setActiveTab("view")} className={ribbonTabClass("view")}>
          View
        </button>
      </nav>

      {/* ============================================================
          LEVEL 2: DENSE COMMAND GROUPS
      ============================================================ */}
      <div className="px-2 sm:px-3 py-1.5 overflow-x-auto no-scrollbar min-h-[64px] flex items-stretch">
        {/* ------------------------------------------------------------
            1. FILE TAB
        ------------------------------------------------------------ */}
        {activeTab === "file" && (
          <div className="flex items-center gap-2 animate-in fade-in duration-100 min-w-max">
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onNewDocument}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="New Document"
                >
                  <FilePlus className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-medium mt-0.5">New</span>
                </button>

                <button
                  onClick={() => openDocInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Open DOCX, TXT or HTML file"
                >
                  <FolderOpen className="w-5 h-5 text-amber-500" />
                  <span className="text-[10px] font-medium mt-0.5">Open</span>
                </button>

                <button
                  onClick={onManualSave}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Save to local storage (Ctrl+S)"
                >
                  <Save className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-medium mt-0.5">Save</span>
                </button>
              </div>
              <span className="ribbon-group-label">Document</span>
            </div>

            <div className="ribbon-group-container">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onExportDocx}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Export real Microsoft Word (.docx) document"
                >
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="text-[10px] font-medium mt-0.5">Word .docx</span>
                </button>

                <button
                  onClick={onExportPdf}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Export high-resolution PDF document"
                >
                  <FileDown className="w-5 h-5 text-rose-600" />
                  <span className="text-[10px] font-medium mt-0.5">PDF Document</span>
                </button>

                <button
                  onClick={onOpenPrintPreview}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Print or Print Preview (Ctrl+P)"
                >
                  <Printer className="w-5 h-5 text-indigo-500" />
                  <span className="text-[10px] font-medium mt-0.5">Print</span>
                </button>
              </div>
              <span className="ribbon-group-label">Export & Print</span>
            </div>

            <div className="ribbon-group-container">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenDocProperties}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Document Title, Author, Subject & Stats"
                >
                  <Sliders className="w-5 h-5 text-slate-500" />
                  <span className="text-[10px] font-medium mt-0.5">Properties</span>
                </button>

                <button
                  onClick={onClearDocument}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 cursor-pointer"
                  title="Clear document canvas"
                >
                  <Trash2 className="w-5 h-5" />
                  <span className="text-[10px] font-medium mt-0.5">Clear</span>
                </button>
              </div>
              <span className="ribbon-group-label">Manage</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            2. HOME TAB
        ------------------------------------------------------------ */}
        {activeTab === "home" && (
          <div className="flex items-stretch gap-1 animate-in fade-in duration-100 min-w-max">
            {/* Group: Clipboard */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-0.5">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handlePaste}
                  className="flex flex-col items-center justify-center px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Paste (Ctrl+V)"
                >
                  <ClipboardPaste className="w-4 h-4 text-indigo-600" />
                  <span className="text-[9.5px] font-medium mt-0.5">Paste</span>
                </button>
                <div className="flex flex-col gap-0.5">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleCut}
                    className={btnClass()}
                    title="Cut (Ctrl+X)"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleCopy}
                    className={btnClass()}
                    title="Copy (Ctrl+C)"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <span className="ribbon-group-label">Clipboard</span>
            </div>

            {/* Group: Font */}
            <div className="ribbon-group-container">
              <div className="flex flex-col gap-1">
                {/* Row 1: Font Family, Font Size & Steps */}
                <div className="flex items-center gap-1">
                  <select
                    value={getCurrentFontFamily()}
                    onChange={(e) => handleFontFamilyChange(e.target.value)}
                    className="h-6 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 outline-none focus:border-indigo-500 w-32 cursor-pointer font-medium"
                    title="Font Family"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={getCurrentFontSize()}
                    onChange={(e) => handleFontSizeChange(e.target.value)}
                    className="h-6 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 outline-none focus:border-indigo-500 w-14 cursor-pointer font-medium"
                    title="Font Size"
                  >
                    {FONT_SIZES.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz.replace("px", "")}
                      </option>
                    ))}
                  </select>

                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => stepFontSize(true)}
                    className={btnClass()}
                    title="Grow Font"
                  >
                    <span className="font-bold text-xs">A<sup className="text-[9px] font-black">+</sup></span>
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => stepFontSize(false)}
                    className={btnClass()}
                    title="Shrink Font"
                  >
                    <span className="font-bold text-xs">A<sub className="text-[9px] font-black">-</sub></span>
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
                    className={btnClass()}
                    title="Clear All Formatting"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>

                {/* Row 2: B, I, U, S, Sub, Super, Color, Highlight */}
                <div className="flex items-center gap-0.5 relative">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={btnClass(editor?.isActive("bold"))}
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={btnClass(editor?.isActive("italic"))}
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    className={btnClass(editor?.isActive("underline"))}
                    title="Underline (Ctrl+U)"
                  >
                    <UnderlineIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={btnClass(editor?.isActive("strike"))}
                    title="Strikethrough"
                  >
                    <Strikethrough className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                  {/* Font Color Picker Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowColorPicker(!showColorPicker);
                        setShowHighlightPicker(false);
                      }}
                      className={btnClass(showColorPicker)}
                      title="Font Color"
                    >
                      <Baseline className="w-3.5 h-3.5 text-indigo-600" />
                      <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 grid grid-cols-6 gap-1 w-44">
                        {COLOR_PALETTE.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              editor?.chain().focus().setColor(c).run();
                              setShowColorPicker(false);
                            }}
                            className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 hover:scale-110 transition cursor-pointer"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Text Highlight Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowHighlightPicker(!showHighlightPicker);
                        setShowColorPicker(false);
                      }}
                      className={btnClass(editor?.isActive("highlight") || showHighlightPicker)}
                      title="Text Highlight Color"
                    >
                      <Highlighter className="w-3.5 h-3.5 text-amber-500" />
                      <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                    </button>
                    {showHighlightPicker && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-1.5 w-32">
                        {HIGHLIGHT_PALETTE.map((c) => (
                          <button
                            key={c}
                            onClick={() => {
                              editor?.chain().focus().toggleHighlight({ color: c }).run();
                              setShowHighlightPicker(false);
                            }}
                            className="w-7 h-5 rounded border border-slate-300 hover:scale-105 transition cursor-pointer"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                        <button
                          onClick={() => {
                            editor?.chain().focus().unsetHighlight().run();
                            setShowHighlightPicker(false);
                          }}
                          className="col-span-3 text-[10px] font-semibold py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 mt-1 cursor-pointer"
                        >
                          No Color
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="ribbon-group-label">Font</span>
                <button
                  onClick={onOpenFontDialog}
                  className="ribbon-group-launcher"
                  title="Open Font Options Dialog"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Group: Paragraph */}
            <div className="ribbon-group-container">
              <div className="flex flex-col gap-1">
                {/* Row 1: Lists & Indents */}
                <div className="flex items-center gap-0.5">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={btnClass(editor?.isActive("bulletList"))}
                    title="Bullets"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={btnClass(editor?.isActive("orderedList"))}
                    title="Numbering"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                  {/* Line Spacing Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowLineSpacingPicker(!showLineSpacingPicker)}
                      className={btnClass(showLineSpacingPicker)}
                      title="Line & Paragraph Spacing"
                    >
                      <span className="text-[10px] font-bold">1.5↕</span>
                      <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                    </button>
                    {showLineSpacingPicker && (
                      <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate-900 py-1 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 w-28 text-xs">
                        {["1.0", "1.15", "1.5", "2.0", "2.5", "3.0"].map((lh) => (
                          <button
                            key={lh}
                            onClick={() => setLineSpacing(lh)}
                            className="w-full text-left px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                          >
                            {lh}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Alignments */}
                <div className="flex items-center gap-0.5">
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                    className={btnClass(editor?.isActive({ textAlign: "left" }))}
                    title="Align Left (Ctrl+L)"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                    className={btnClass(editor?.isActive({ textAlign: "center" }))}
                    title="Center (Ctrl+E)"
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                    className={btnClass(editor?.isActive({ textAlign: "right" }))}
                    title="Align Right (Ctrl+R)"
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
                    className={btnClass(editor?.isActive({ textAlign: "justify" }))}
                    title="Justify (Ctrl+J)"
                  >
                    <AlignJustify className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="ribbon-group-label">Paragraph</span>
                <button
                  onClick={onOpenParagraphDialog}
                  className="ribbon-group-launcher"
                  title="Open Paragraph Options Dialog"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Group: Styles Gallery */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor?.chain().focus().setParagraph().run()}
                  className={`px-2 py-1 rounded text-center border transition cursor-pointer ${
                    editor?.isActive("paragraph")
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 font-bold"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  title="Normal Text Style"
                >
                  <span className="text-[11px] block text-slate-800 dark:text-slate-200">AaBbCc</span>
                  <span className="text-[9px] text-slate-500 block">Normal</span>
                </button>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={`px-2 py-1 rounded text-center border transition cursor-pointer ${
                    editor?.isActive("heading", { level: 1 })
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 font-bold"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  title="Heading 1"
                >
                  <span className="text-[11px] block font-extrabold text-indigo-600">Heading 1</span>
                  <span className="text-[9px] text-slate-500 block">Title</span>
                </button>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`px-2 py-1 rounded text-center border transition cursor-pointer ${
                    editor?.isActive("heading", { level: 2 })
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 font-bold"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  title="Heading 2"
                >
                  <span className="text-[11px] block font-bold text-slate-800 dark:text-slate-100">Heading 2</span>
                  <span className="text-[9px] text-slate-500 block">Subtitle</span>
                </button>

                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                  className={`px-2 py-1 rounded text-center border transition cursor-pointer ${
                    editor?.isActive("blockquote")
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 font-bold"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  title="Quote Callout"
                >
                  <span className="text-[11px] block italic text-slate-600 dark:text-slate-300">Quote</span>
                  <span className="text-[9px] text-slate-500 block">Callout</span>
                </button>
              </div>
              <span className="ribbon-group-label">Styles</span>
            </div>

            {/* Group: Editing */}
            <div className="ribbon-group-container">
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={onOpenFindReplace}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Find & Replace (Ctrl+F)"
                >
                  <Search className="w-3 h-3 text-indigo-500" />
                  <span className="text-[10px]">Find & Replace</span>
                </button>
                <button
                  onClick={onOpenWordCount}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Word & Character Statistics"
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px]">Word Count</span>
                </button>
                <button
                  onClick={() => editor?.chain().focus().selectAll().run()}
                  className="flex items-center gap-1 px-2 py-0.5 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Select All (Ctrl+A)"
                >
                  <CheckSquare className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px]">Select All</span>
                </button>
              </div>
              <span className="ribbon-group-label">Editing</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            3. INSERT TAB
        ------------------------------------------------------------ */}
        {activeTab === "insert" && (
          <div className="flex items-stretch gap-1 animate-in fade-in duration-100 min-w-max">
            {/* Pages Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => editor?.chain().focus().insertContent('<div class="page-break-divider"><span class="page-break-badge">Page Break</span></div>').run()}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Insert Page Break"
                >
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] mt-0.5">Page Break</span>
                </button>
              </div>
              <span className="ribbon-group-label">Pages</span>
            </div>

            {/* Tables Group */}
            <div className="ribbon-group-container">
              <div className="relative">
                <button
                  onClick={() => setShowTablePicker(!showTablePicker)}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Insert Table Grid"
                >
                  <TableIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] mt-0.5 flex items-center gap-0.5">
                    Table <ChevronDown className="w-2.5 h-2.5" />
                  </span>
                </button>
                {showTablePicker && (
                  <div className="absolute top-full left-0 mt-1 z-50">
                    <TableGridPicker
                      onSelectTable={(r, c) => {
                        handleInsertTable(r, c);
                        setShowTablePicker(false);
                      }}
                      onClose={() => setShowTablePicker(false)}
                    />
                  </div>
                )}
              </div>
              <span className="ribbon-group-label">Tables</span>
            </div>

            {/* Illustrations Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Insert Image (Local File)"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] mt-0.5">Pictures</span>
                </button>

                <button
                  onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Insert Horizontal Divider"
                >
                  <Minus className="w-4 h-4 text-slate-500" />
                  <span className="text-[10px] mt-0.5">Divider</span>
                </button>
              </div>
              <span className="ribbon-group-label">Illustrations</span>
            </div>

            {/* Links Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenLinkModal}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Insert Hyperlink (Ctrl+K)"
                >
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] mt-0.5">Link</span>
                </button>
              </div>
              <span className="ribbon-group-label">Links</span>
            </div>

            {/* Header & Footer Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenHeaderFooter}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Configure Running Header, Footer & Page Numbers"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] mt-0.5">Header & Footer</span>
                </button>
              </div>
              <span className="ribbon-group-label">Header & Footer</span>
            </div>

            {/* Text & Date Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleInsertDateTime}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Insert Current Date"
                >
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] mt-0.5">Date & Time</span>
                </button>
              </div>
              <span className="ribbon-group-label">Text</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            4. DESIGN TAB
        ------------------------------------------------------------ */}
        {activeTab === "design" && (
          <div className="flex items-stretch gap-1 animate-in fade-in duration-100 min-w-max">
            {/* Themes Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1.5">
                {[
                  { id: "default", name: "Default", font: "Arial" },
                  { id: "classic", name: "Classic", font: "Georgia" },
                  { id: "modern", name: "Modern", font: "System UI" },
                  { id: "compact", name: "Compact", font: "Clean Sans" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDesignTheme(t.id)}
                    className={`p-1.5 rounded border text-center transition cursor-pointer ${
                      designTheme === t.id
                        ? "border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-[10px] block">{t.name}</span>
                    <span className="text-[8.5px] text-slate-400 block">{t.font}</span>
                  </button>
                ))}
              </div>
              <span className="ribbon-group-label">Document Themes</span>
            </div>

            {/* Page Background */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowBoundaries(!showBoundaries)}
                  className={`flex flex-col items-center justify-center p-1.5 rounded cursor-pointer ${
                    showBoundaries ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950" : "hover:bg-slate-100"
                  }`}
                  title="Toggle Visual Paper Boundaries & Shadow"
                >
                  <Layers className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Page Shadow</span>
                </button>
              </div>
              <span className="ribbon-group-label">Page Background</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            5. LAYOUT TAB
        ------------------------------------------------------------ */}
        {activeTab === "layout" && (
          <div className="flex items-stretch gap-1 animate-in fade-in duration-100 min-w-max">
            {/* Page Setup Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-2">
                {/* Margins */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-semibold text-slate-400">Margins</span>
                  <select
                    value={pageSettings.margins}
                    onChange={(e) => setPageSettings({ ...pageSettings, margins: e.target.value })}
                    className="h-6 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 outline-none cursor-pointer"
                  >
                    <option value="normal">Normal (1 in)</option>
                    <option value="narrow">Narrow (0.5 in)</option>
                    <option value="moderate">Moderate (0.75 in)</option>
                    <option value="wide">Wide (1.5 in)</option>
                  </select>
                </div>

                {/* Orientation */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-semibold text-slate-400">Orientation</span>
                  <button
                    onClick={() =>
                      setPageSettings({
                        ...pageSettings,
                        orientation: pageSettings.orientation === "portrait" ? "landscape" : "portrait",
                      })
                    }
                    className="h-6 px-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded flex items-center gap-1 cursor-pointer capitalize"
                  >
                    {pageSettings.orientation}
                  </button>
                </div>

                {/* Paper Size */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-semibold text-slate-400">Size</span>
                  <select
                    value={pageSettings.paperSize}
                    onChange={(e) => setPageSettings({ ...pageSettings, paperSize: e.target.value })}
                    className="h-6 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 outline-none cursor-pointer uppercase"
                  >
                    <option value="a4">A4 (210 x 297 mm)</option>
                    <option value="letter">Letter (8.5 x 11 in)</option>
                  </select>
                </div>

                {/* Columns */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-semibold text-slate-400">Columns</span>
                  <select
                    value={pageSettings.columns || "1"}
                    onChange={(e) => setPageSettings({ ...pageSettings, columns: e.target.value })}
                    className="h-6 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 outline-none cursor-pointer"
                  >
                    <option value="1">1 Column</option>
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto">
                <span className="ribbon-group-label">Page Setup</span>
                <button
                  onClick={onOpenPageSetupDialog}
                  className="ribbon-group-launcher"
                  title="Open Page Setup Dialog"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            6. REFERENCES TAB (Prepared UI Architecture)
        ------------------------------------------------------------ */}
        {activeTab === "references" && (
          <div className="flex items-stretch gap-1 animate-in fade-in duration-100 min-w-max">
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1 text-slate-400">
                <button disabled className={btnClass(false, true)} title="Table of Contents (Coming in next release)">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-[10px] ml-1">Table of Contents</span>
                </button>
              </div>
              <span className="ribbon-group-label">Table of Contents</span>
            </div>

            <div className="ribbon-group-container">
              <div className="flex items-center gap-1 text-slate-400">
                <button disabled className={btnClass(false, true)} title="Insert Footnote (Coming soon)">
                  <span className="text-[10px] font-bold">AB¹</span>
                  <span className="text-[10px] ml-1">Insert Footnote</span>
                </button>
                <button disabled className={btnClass(false, true)} title="Insert Endnote (Coming soon)">
                  <span className="text-[10px] font-bold">ABⁱ</span>
                  <span className="text-[10px] ml-1">Insert Endnote</span>
                </button>
              </div>
              <span className="ribbon-group-label">Footnotes</span>
            </div>

            <div className="ribbon-group-container">
              <div className="flex items-center gap-1 text-slate-400">
                <button disabled className={btnClass(false, true)} title="Citations & Bibliography (Coming soon)">
                  <span className="text-[10px]">Manage Sources</span>
                </button>
              </div>
              <span className="ribbon-group-label">Citations & Bibliography</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            7. MAILINGS TAB (Prepared UI Architecture)
        ------------------------------------------------------------ */}
        {activeTab === "mailings" && (
          <div className="flex items-stretch gap-1 animate-in fade-in duration-100 min-w-max">
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1 text-slate-400">
                <button disabled className={btnClass(false, true)} title="Start Mail Merge (Coming soon)">
                  <span className="text-[10px]">Start Mail Merge</span>
                </button>
                <button disabled className={btnClass(false, true)} title="Select Recipients (Coming soon)">
                  <span className="text-[10px]">Select Recipients</span>
                </button>
              </div>
              <span className="ribbon-group-label">Start Mail Merge</span>
            </div>

            <div className="ribbon-group-container">
              <div className="flex items-center gap-1 text-slate-400">
                <button disabled className={btnClass(false, true)} title="Preview Results (Coming soon)">
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-[10px] ml-1">Preview Results</span>
                </button>
              </div>
              <span className="ribbon-group-label">Preview Results</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            8. REVIEW TAB
        ------------------------------------------------------------ */}
        {activeTab === "review" && (
          <div className="flex items-stretch gap-1 animate-in fade-in duration-100 min-w-max">
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={onOpenWordCount}
                  className="flex flex-col items-center justify-center p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Word Count & Document Statistics"
                >
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] mt-0.5">Word Count</span>
                </button>
              </div>
              <span className="ribbon-group-label">Proofing</span>
            </div>

            <div className="ribbon-group-container">
              <div className="flex items-center gap-1 text-slate-400">
                <button disabled className={btnClass(false, true)} title="New Comment (Coming soon)">
                  <span className="text-[10px]">New Comment</span>
                </button>
              </div>
              <span className="ribbon-group-label">Comments</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------
            9. VIEW TAB
        ------------------------------------------------------------ */}
        {activeTab === "view" && (
          <div className="flex items-stretch gap-1 animate-in fade-in duration-100 min-w-max">
            {/* Views Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode("print")}
                  className={`p-1.5 rounded flex flex-col items-center justify-center cursor-pointer ${
                    viewMode === "print" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950" : "hover:bg-slate-100"
                  }`}
                  title="Print Layout View (Realistic Paper Sheet)"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Print Layout</span>
                </button>
                <button
                  onClick={() => setViewMode("web")}
                  className={`p-1.5 rounded flex flex-col items-center justify-center cursor-pointer ${
                    viewMode === "web" ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950" : "hover:bg-slate-100"
                  }`}
                  title="Web Layout View (Fluid Full-Width)"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">Web Layout</span>
                </button>
              </div>
              <span className="ribbon-group-label">Views</span>
            </div>

            {/* Show Group */}
            <div className="ribbon-group-container">
              <div className="flex flex-col gap-1 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRuler}
                    onChange={(e) => setShowRuler(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300">Ruler</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showNavPane}
                    onChange={(e) => setShowNavPane(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-[10px] text-slate-700 dark:text-slate-300">Navigation Pane</span>
                </label>
              </div>
              <span className="ribbon-group-label">Show</span>
            </div>

            {/* Zoom Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setZoom(100)}
                  className="px-2 py-1.5 rounded text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Reset Zoom to 100%"
                >
                  100%
                </button>
                <button
                  onClick={() => setZoom(125)}
                  className="px-2 py-1.5 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Fit Page Width"
                >
                  Page Width
                </button>
              </div>
              <span className="ribbon-group-label">Zoom</span>
            </div>

            {/* Window Group */}
            <div className="ribbon-group-container">
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer flex flex-col items-center"
                  title="Toggle Fullscreen Window"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  <span className="text-[10px] mt-0.5">Fullscreen</span>
                </button>
              </div>
              <span className="ribbon-group-label">Window</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
