"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { TextAlign } from "@tiptap/extension-text-align";
import {
  TextStyle,
  FontSize,
  FontFamily,
  Color,
  LineHeight,
} from "@tiptap/extension-text-style";
import { Highlight } from "@tiptap/extension-highlight";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Link as TiptapLink } from "@tiptap/extension-link";

import { PageBreak } from "./page-break-extension";
import { WriterTopBar } from "./writer-topbar";
import { RibbonToolbar } from "./ribbon-toolbar";
import { HorizontalRuler } from "./horizontal-ruler";
import { VerticalRuler } from "./vertical-ruler";
import { NavigationPane } from "./navigation-pane";
import { StatusBar } from "./status-bar";

import { ConfirmModal } from "./confirm-modal";
import { LinkModal } from "./link-modal";
import { WordCountModal } from "./word-count-modal";
import { HeaderFooterModal } from "./header-footer-modal";
import { DocPropertiesModal } from "./doc-properties-modal";
import { PrintPreviewModal } from "./print-preview-modal";

import { FontDialog } from "./font-dialog";
import { ParagraphDialog } from "./paragraph-dialog";
import { PageSetupDialog } from "./page-setup-dialog";
import { FindReplaceDialog } from "./find-replace-dialog";

import { importDocumentFile } from "../../lib/writer/docx-importer";
import { exportToDocx } from "../../lib/writer/docx-exporter";
import { exportToPdf } from "../../lib/writer/pdf-exporter";
import "./writer.css";

import {
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UploadCloud,
  RotateCcw,
  X,
} from "lucide-react";

const STORAGE_CONTENT_KEY = "rootixa_writer_content";
const STORAGE_TITLE_KEY = "rootixa_writer_title";
const STORAGE_PAGESETTINGS_KEY = "rootixa_writer_pagesettings";
const STORAGE_THEME_KEY = "rootixa_writer_designtheme";
const STORAGE_HEADER_KEY = "rootixa_writer_header";
const STORAGE_FOOTER_KEY = "rootixa_writer_footer";
const STORAGE_DOCPROPS_KEY = "rootixa_writer_docprops";
const STORAGE_BACKUP_KEY = "rootixa_writer_backup";

export function WriterEditor() {
  // Document Title (Lazy init)
  const [docTitle, setDocTitle] = useState(() => {
    if (typeof window === "undefined") return "Untitled Document";
    try {
      const saved = localStorage.getItem(STORAGE_TITLE_KEY);
      return saved && saved.trim() ? saved : "Untitled Document";
    } catch {
      return "Untitled Document";
    }
  });

  // Page Setup (Lazy init)
  const [pageSettings, setPageSettings] = useState(() => {
    if (typeof window === "undefined") {
      return { margins: "normal", orientation: "portrait", paperSize: "a4", columns: "1" };
    }
    try {
      const saved = localStorage.getItem(STORAGE_PAGESETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          margins: parsed.margins || "normal",
          orientation: parsed.orientation || "portrait",
          paperSize: parsed.paperSize || "a4",
          columns: parsed.columns || "1",
        };
      }
      return { margins: "normal", orientation: "portrait", paperSize: "a4", columns: "1" };
    } catch {
      return { margins: "normal", orientation: "portrait", paperSize: "a4", columns: "1" };
    }
  });

  // Design Theme (Lazy init)
  const [designTheme, setDesignTheme] = useState(() => {
    if (typeof window === "undefined") return "default";
    try {
      return localStorage.getItem(STORAGE_THEME_KEY) || "default";
    } catch {
      return "default";
    }
  });

  // Header & Footer (Lazy init)
  const [headerText, setHeaderText] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(STORAGE_HEADER_KEY) || "";
    } catch {
      return "";
    }
  });

  const [footerText, setFooterText] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(STORAGE_FOOTER_KEY) || "";
    } catch {
      return "";
    }
  });

  const [pageNumberPos, setPageNumberPos] = useState("footer-right");
  const [pageNumberFormat, setPageNumberFormat] = useState("1");

  // Document Metadata Properties
  const [docAuthor, setDocAuthor] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const saved = localStorage.getItem(STORAGE_DOCPROPS_KEY);
      return saved ? JSON.parse(saved).author || "" : "";
    } catch {
      return "";
    }
  });

  const [docSubject, setDocSubject] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      const saved = localStorage.getItem(STORAGE_DOCPROPS_KEY);
      return saved ? JSON.parse(saved).subject || "" : "";
    } catch {
      return "";
    }
  });

  // UI & View State
  const [activeTab, setActiveTab] = useState("home");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "error"
  const [focusMode, setFocusMode] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [showNavPane, setShowNavPane] = useState(false);
  const [viewMode, setViewMode] = useState("print"); // "print" | "web"
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Application Dialogs
  const [newDocModalOpen, setNewDocModalOpen] = useState(false);
  const [clearDocModalOpen, setClearDocModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [wordCountModalOpen, setWordCountModalOpen] = useState(false);
  const [headerFooterModalOpen, setHeaderFooterModalOpen] = useState(false);
  const [docPropsModalOpen, setDocPropsModalOpen] = useState(false);
  const [printPreviewModalOpen, setPrintPreviewModalOpen] = useState(false);

  // Phase 4 Desktop Dialogs
  const [fontDialogOpen, setFontDialogOpen] = useState(false);
  const [paragraphDialogOpen, setParagraphDialogOpen] = useState(false);
  const [pageSetupDialogOpen, setPageSetupDialogOpen] = useState(false);
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);

  // Toast / Notification State
  const [toast, setToast] = useState(null);

  // Drag & Drop
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Crash Recovery Banner (Lazy init)
  const [backupContent] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(STORAGE_CONTENT_KEY);
      const backup = localStorage.getItem(STORAGE_BACKUP_KEY);
      if (
        backup &&
        backup.trim() &&
        backup !== "<p></p>" &&
        backup !== saved &&
        backup.length > (saved ? saved.length : 0) + 10
      ) {
        return backup;
      }
    } catch {
      return null;
    }
    return null;
  });
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(() => Boolean(backupContent));

  // Refs
  const saveTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const workspaceRef = useRef(null);
  const canvasSheetRef = useRef(null);

  // Show Toast notification helper
  const showToast = useCallback((message, type = "info", duration = 3500) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, []);

  // Debounced Auto-save handler
  const triggerAutoSave = useCallback(
    (html, title, settings, theme, header, footer, author, subject) => {
      setSaveStatus("saving");
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_CONTENT_KEY, html);
            localStorage.setItem(STORAGE_TITLE_KEY, title);
            localStorage.setItem(STORAGE_PAGESETTINGS_KEY, JSON.stringify(settings));
            localStorage.setItem(STORAGE_THEME_KEY, theme);
            if (header !== undefined) localStorage.setItem(STORAGE_HEADER_KEY, header);
            if (footer !== undefined) localStorage.setItem(STORAGE_FOOTER_KEY, footer);
            localStorage.setItem(
              STORAGE_DOCPROPS_KEY,
              JSON.stringify({ author: author || "", subject: subject || "" })
            );
            localStorage.setItem(STORAGE_BACKUP_KEY, html);
          }
          setSaveStatus("saved");
        } catch (err) {
          console.warn("Auto-save storage failed:", err);
          setSaveStatus("error");
        }
      }, 750);
    },
    []
  );

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // TipTap Editor Initialization
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontSize,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Color,
      LineHeight,
      Highlight.configure({
        multicolor: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TiptapImage.configure({
        allowBase64: true,
        inline: false,
      }),
      TiptapLink.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      PageBreak,
      CharacterCount,
      Placeholder.configure({
        placeholder: "Start writing your document...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: "",
    onUpdate({ editor: currentEditor }) {
      triggerAutoSave(
        currentEditor.getHTML(),
        docTitle,
        pageSettings,
        designTheme,
        headerText,
        footerText,
        docAuthor,
        docSubject
      );
    },
  });

  // Restore saved content on mount
  useEffect(() => {
    if (!editor) return;
    try {
      const saved = localStorage.getItem(STORAGE_CONTENT_KEY);
      if (saved && saved.trim() && saved !== "<p></p>") {
        editor.commands.setContent(saved);
      }
    } catch {
      // Storage unavailable fallback
    }
  }, [editor]);

  // Manual save handler
  const handleManualSave = useCallback(() => {
    if (!editor) return;
    try {
      const html = editor.getHTML();
      localStorage.setItem(STORAGE_CONTENT_KEY, html);
      localStorage.setItem(STORAGE_TITLE_KEY, docTitle);
      localStorage.setItem(STORAGE_PAGESETTINGS_KEY, JSON.stringify(pageSettings));
      localStorage.setItem(STORAGE_THEME_KEY, designTheme);
      localStorage.setItem(STORAGE_HEADER_KEY, headerText);
      localStorage.setItem(STORAGE_FOOTER_KEY, footerText);
      localStorage.setItem(
        STORAGE_DOCPROPS_KEY,
        JSON.stringify({ author: docAuthor, subject: docSubject })
      );
      localStorage.setItem(STORAGE_BACKUP_KEY, html);
      setSaveStatus("saved");
      showToast("Document saved to local storage", "success", 2000);
    } catch (err) {
      console.warn("Manual save error:", err);
      setSaveStatus("error");
      showToast("Could not save document locally", "error");
    }
  }, [editor, docTitle, pageSettings, designTheme, headerText, footerText, docAuthor, docSubject, showToast]);

  // Title update
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setDocTitle(newTitle);
    if (editor) {
      triggerAutoSave(
        editor.getHTML(),
        newTitle,
        pageSettings,
        designTheme,
        headerText,
        footerText,
        docAuthor,
        docSubject
      );
    }
  };

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMod = e.ctrlKey || e.metaKey;
      if (isMod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleManualSave();
      }
      if (isMod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPrintPreviewModalOpen(true);
      }
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setLinkModalOpen(true);
      }
      if (isMod && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setFindReplaceOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave]);

  // Page Calculations
  useEffect(() => {
    if (!canvasSheetRef.current) return;
    const sheetEl = canvasSheetRef.current;
    const isLandscape = pageSettings.orientation === "landscape";
    const isLetter = pageSettings.paperSize === "letter";
    const pageHeightPx = isLandscape ? 794 : isLetter ? 1056 : 1123;
    const scrollH = sheetEl.scrollHeight;

    const pageBreakCount = sheetEl.querySelectorAll(".page-break-divider").length;
    const calculatedPages = Math.max(1, Math.ceil(scrollH / (pageHeightPx - 80)) + pageBreakCount);
    setTotalPages(calculatedPages);
  }, [pageSettings, editor?.state.doc]);

  // Scroll tracking to update current page
  useEffect(() => {
    const handleScroll = () => {
      if (!workspaceRef.current || !canvasSheetRef.current) return;
      const st = workspaceRef.current.scrollTop;
      const isLandscape = pageSettings.orientation === "landscape";
      const isLetter = pageSettings.paperSize === "letter";
      const pageHeightPx = isLandscape ? 794 : isLetter ? 1056 : 1123;
      const pageNum = Math.min(totalPages, Math.max(1, Math.floor(st / pageHeightPx) + 1));
      setCurrentPage(pageNum);
    };

    const ws = workspaceRef.current;
    ws?.addEventListener("scroll", handleScroll);
    return () => ws?.removeEventListener("scroll", handleScroll);
  }, [totalPages, pageSettings]);

  // Jump to specific page helper
  const handleJumpToPage = (pageNum) => {
    if (!workspaceRef.current) return;
    const isLandscape = pageSettings.orientation === "landscape";
    const isLetter = pageSettings.paperSize === "letter";
    const pageHeightPx = isLandscape ? 794 : isLetter ? 1056 : 1123;
    const targetScroll = (pageNum - 1) * pageHeightPx;
    workspaceRef.current.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  // Word, Character and Statistics calculation
  const wordsCount = editor ? editor.storage.characterCount.words() : 0;
  const charsCount = editor ? editor.storage.characterCount.characters() : 0;
  const rawText = editor ? editor.getText() : "";
  const charsNoSpaces = rawText.replace(/\s+/g, "").length;
  const paragraphsCount = rawText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0).length;

  const docStats = {
    words: wordsCount,
    characters: charsCount,
    charactersNoSpaces: charsNoSpaces,
    paragraphs: paragraphsCount,
  };

  // -------------------------------------------------------------
  // File Handlers: Import & Export
  // -------------------------------------------------------------
  const handleOpenDocumentFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast(`Importing "${file.name}"...`, "info", 4000);
    try {
      const result = await importDocumentFile(file);
      if (result && result.html) {
        editor?.commands.setContent(result.html);
        const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setDocTitle(fileNameWithoutExt);
        triggerAutoSave(
          result.html,
          fileNameWithoutExt,
          pageSettings,
          designTheme,
          headerText,
          footerText,
          docAuthor,
          docSubject
        );
        showToast(`Document "${file.name}" imported successfully!`, "success", 4000);
      }
    } catch (err) {
      console.error("DOCX import error:", err);
      showToast(err.message || "Failed to open document file.", "error", 5000);
    }
    e.target.value = "";
  };

  const handleExportDocx = async () => {
    if (!editor) return;
    try {
      showToast("Generating Microsoft Word (.docx) document...", "info", 3000);
      await exportToDocx({
        editor,
        title: docTitle,
        author: docAuthor,
        subject: docSubject,
        headerText,
        footerText,
        pageNumberPos,
        pageNumberFormat,
        pageSettings,
      });
      showToast("DOCX file downloaded successfully!", "success", 3500);
    } catch (err) {
      console.error("DOCX export error:", err);
      showToast(err.message || "Failed to export DOCX document.", "error", 5000);
    }
  };

  const handleExportPdf = async () => {
    if (!canvasSheetRef.current) return;
    try {
      showToast("Rendering high-resolution PDF document...", "info", 4000);
      await exportToPdf({
        element: canvasSheetRef.current,
        title: docTitle,
        pageSettings,
      });
      showToast("PDF document downloaded successfully!", "success", 3500);
    } catch (err) {
      console.error("PDF export error:", err);
      showToast(err.message || "Failed to export PDF.", "error", 5000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Header & Footer modal save
  const handleSaveHeaderFooter = (hfData) => {
    setHeaderText(hfData.headerText);
    setFooterText(hfData.footerText);
    setPageNumberPos(hfData.pageNumberPos);
    setPageNumberFormat(hfData.pageNumberFormat);
    if (editor) {
      triggerAutoSave(
        editor.getHTML(),
        docTitle,
        pageSettings,
        designTheme,
        hfData.headerText,
        hfData.footerText,
        docAuthor,
        docSubject
      );
    }
    setHeaderFooterModalOpen(false);
    showToast("Header & footer updated", "success", 2500);
  };

  // Document Properties save
  const handleSaveDocProperties = (props) => {
    setDocTitle(props.title || "Untitled Document");
    setDocAuthor(props.author || "");
    setDocSubject(props.subject || "");
    if (editor) {
      triggerAutoSave(
        editor.getHTML(),
        props.title || "Untitled Document",
        pageSettings,
        designTheme,
        headerText,
        footerText,
        props.author || "",
        props.subject || ""
      );
    }
    setDocPropsModalOpen(false);
    showToast("Document properties saved", "success", 2500);
  };

  // Page Setup save
  const handleSavePageSettings = (newSettings) => {
    setPageSettings(newSettings);
    if (editor) {
      triggerAutoSave(
        editor.getHTML(),
        docTitle,
        newSettings,
        designTheme,
        headerText,
        footerText,
        docAuthor,
        docSubject
      );
    }
    showToast("Page setup updated", "success", 2000);
  };

  // Actions
  const handleNewDocument = () => {
    if (!editor) return;
    if (!editor.isEmpty && editor.getText().trim().length > 0) {
      setNewDocModalOpen(true);
    } else {
      resetDocument();
    }
  };

  const handleClearDocument = () => {
    if (!editor) return;
    if (!editor.isEmpty && editor.getText().trim().length > 0) {
      setClearDocModalOpen(true);
    }
  };

  const resetDocument = () => {
    if (!editor) return;
    editor.commands.setContent("");
    setDocTitle("Untitled Document");
    setHeaderText("");
    setFooterText("");
    try {
      localStorage.removeItem(STORAGE_CONTENT_KEY);
      localStorage.removeItem(STORAGE_TITLE_KEY);
      localStorage.removeItem(STORAGE_HEADER_KEY);
      localStorage.removeItem(STORAGE_FOOTER_KEY);
    } catch {
      // Ignore
    }
    setSaveStatus("saved");
    setNewDocModalOpen(false);
    showToast("Created new document", "info", 2000);
  };

  const confirmClearDocument = () => {
    if (!editor) return;
    editor.commands.setContent("");
    try {
      localStorage.setItem(STORAGE_CONTENT_KEY, "");
    } catch {
      // Ignore
    }
    setSaveStatus("saved");
    setClearDocModalOpen(false);
    showToast("Document canvas cleared", "info", 2000);
  };

  // Image Upload handler
  const handleInsertImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size exceeds 5MB limit.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === "string" && editor) {
        editor.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Link Modal Submit
  const handleApplyLink = ({ text, url }) => {
    if (!editor) return;
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  // Drag & Drop onto Workspace
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const name = file.name.toLowerCase();

    if (name.endsWith(".docx") || name.endsWith(".txt") || name.endsWith(".html") || name.endsWith(".htm")) {
      showToast(`Importing dropped document "${file.name}"...`, "info", 4000);
      try {
        const result = await importDocumentFile(file);
        if (result && result.html) {
          editor?.commands.setContent(result.html);
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          setDocTitle(fileNameWithoutExt);
          triggerAutoSave(
            result.html,
            fileNameWithoutExt,
            pageSettings,
            designTheme,
            headerText,
            footerText,
            docAuthor,
            docSubject
          );
          showToast(`Document "${file.name}" loaded!`, "success", 3000);
        }
      } catch (err) {
        showToast(err.message || "Failed to parse dropped document.", "error");
      }
    } else if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        if (typeof dataUrl === "string" && editor) {
          editor.chain().focus().setImage({ src: dataUrl, alt: file.name }).run();
          showToast(`Image "${file.name}" inserted`, "success", 2000);
        }
      };
      reader.readAsDataURL(file);
    } else {
      showToast("Unsupported file type dropped. Please drop a .docx, .txt or image file.", "error");
    }
  };

  // Page number string generator
  const getPageNumberDisplay = (pageNumber) => {
    if (pageNumberFormat === "Page 1 of N") {
      return `Page ${pageNumber} of ${totalPages}`;
    }
    if (pageNumberFormat === "Page 1") {
      return `Page ${pageNumber}`;
    }
    if (pageNumberFormat === "1 / N") {
      return `${pageNumber} / ${totalPages}`;
    }
    return `${pageNumber}`;
  };

  return (
    <div
      className={`rootixa-app-shell text-slate-800 dark:text-slate-100 transition-colors ${
        focusMode ? "word-focus-mode" : ""
      }`}
    >
      {/* Toast Notification Popup */}
      {toast && (
        <div
          className={`fixed bottom-12 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-700/60 backdrop-blur-md"
              : toast.type === "error"
              ? "bg-rose-950/90 text-rose-200 border-rose-700/60 backdrop-blur-md"
              : "bg-slate-900/90 text-white border-slate-700/60 backdrop-blur-md"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === "error" ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 animate-pulse" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75 cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Crash / Unsaved Session Recovery Banner */}
      {showRecoveryBanner && backupContent && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 flex items-center justify-between text-xs no-print shrink-0">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 animate-spin-slow" />
            <span>
              <strong>Document Recovery Available:</strong> An unsaved backup from a previous session was detected.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                editor?.commands.setContent(backupContent);
                triggerAutoSave(
                  backupContent,
                  docTitle,
                  pageSettings,
                  designTheme,
                  headerText,
                  footerText,
                  docAuthor,
                  docSubject
                );
                setShowRecoveryBanner(false);
                showToast("Previous document session restored!", "success");
              }}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold transition cursor-pointer shadow-xs"
            >
              Restore Backup
            </button>
            <button
              onClick={() => setShowRecoveryBanner(false)}
              className="px-2 py-1 rounded hover:bg-amber-500/20 text-slate-600 dark:text-slate-400 transition cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          1. TOP APPLICATION HEADER & QUICK ACCESS TOOLBAR
      ============================================================ */}
      {!focusMode && (
        <WriterTopBar
          docTitle={docTitle}
          onTitleChange={handleTitleChange}
          editor={editor}
          saveStatus={saveStatus}
          onManualSave={handleManualSave}
          onOpenPrintPreview={() => setPrintPreviewModalOpen(true)}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
        />
      )}

      {/* ============================================================
          2. DENSE MULTI-TAB RIBBON TOOLBAR
      ============================================================ */}
      {!focusMode && (
        <RibbonToolbar
          editor={editor}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNewDocument={handleNewDocument}
          onOpenDocumentFile={handleOpenDocumentFile}
          onManualSave={handleManualSave}
          onClearDocument={handleClearDocument}
          onOpenWordCount={() => setWordCountModalOpen(true)}
          onExportDocx={handleExportDocx}
          onExportPdf={handleExportPdf}
          onOpenPrintPreview={() => setPrintPreviewModalOpen(true)}
          onOpenDocProperties={() => setDocPropsModalOpen(true)}
          onOpenLinkModal={() => setLinkModalOpen(true)}
          onInsertImageFile={handleInsertImageFile}
          onOpenHeaderFooter={() => setHeaderFooterModalOpen(true)}
          onOpenFontDialog={() => setFontDialogOpen(true)}
          onOpenParagraphDialog={() => setParagraphDialogOpen(true)}
          onOpenPageSetupDialog={() => setPageSetupDialogOpen(true)}
          onOpenFindReplace={() => setFindReplaceOpen(true)}
          pageSettings={pageSettings}
          setPageSettings={setPageSettings}
          designTheme={designTheme}
          setDesignTheme={setDesignTheme}
          zoom={zoom}
          setZoom={setZoom}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          showBoundaries={showBoundaries}
          setShowBoundaries={setShowBoundaries}
          showRuler={showRuler}
          setShowRuler={setShowRuler}
          showNavPane={showNavPane}
          setShowNavPane={setShowNavPane}
          viewMode={viewMode}
          setViewMode={setViewMode}
          toggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Focus Mode Exit Bar */}
      {focusMode && (
        <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md no-print">
          <span className="font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Focus Mode &bull; {docTitle}
          </span>
          <button
            onClick={() => setFocusMode(false)}
            className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Minimize2 className="w-3.5 h-3.5" /> Exit Focus Mode
          </button>
        </div>
      )}

      {/* ============================================================
          3. MAIN WORKSPACE WITH NAVIGATION PANE & RULERS
      ============================================================ */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collapsible Left Navigation Pane */}
        {!focusMode && (
          <NavigationPane
            isOpen={showNavPane}
            onClose={() => setShowNavPane(false)}
            editor={editor}
            totalPages={totalPages}
            currentPage={currentPage}
            onJumpToPage={handleJumpToPage}
          />
        )}

        {/* Scrollable Document Workspace Area */}
        <main
          ref={workspaceRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="rootixa-workspace-desk flex-1 flex flex-col items-center relative overflow-y-auto"
        >
          {/* Drag & Drop Visual Dropzone Overlay */}
          {isDraggingOver && (
            <div className="drag-drop-overlay">
              <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border border-indigo-200 dark:border-indigo-800">
                <UploadCloud className="w-12 h-12 text-indigo-600 animate-bounce" />
                <p className="text-base font-extrabold text-slate-800 dark:text-white">
                  Drop Document or Image File
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports .docx, .txt, .html files or images (.png, .jpg, .webp)
                </p>
              </div>
            </div>
          )}

          {/* Horizontal Ruler Pinned Above Document */}
          {showRuler && viewMode === "print" && !focusMode && (
            <div className="sticky top-0 z-20 pt-2 pb-1 bg-transparent flex justify-center w-full">
              <HorizontalRuler
                paperSize={pageSettings.paperSize}
                orientation={pageSettings.orientation}
                margins={pageSettings.margins}
              />
            </div>
          )}

          {/* Physical Document Paper Sheet Container with Vertical Ruler */}
          <div
            className="w-full flex justify-center py-4 px-2 sm:px-6"
            style={{
              transform: zoom === 100 ? "none" : `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {/* Vertical Ruler on Left Side of Page */}
            {showRuler && viewMode === "print" && !focusMode && (
              <VerticalRuler
                paperSize={pageSettings.paperSize}
                orientation={pageSettings.orientation}
                margins={pageSettings.margins}
              />
            )}

            {/* Document Paper Sheet */}
            <div
              ref={canvasSheetRef}
              data-paper={pageSettings.paperSize}
              data-orientation={pageSettings.orientation}
              data-margins={pageSettings.margins}
              data-columns={pageSettings.columns || "1"}
              data-view={viewMode}
              className={`rootixa-paper-sheet rootixa-writer-canvas theme-${designTheme} ${
                showBoundaries && viewMode === "print" ? "shadow-2xl" : "shadow-none border border-slate-200"
              }`}
            >
              {/* Document Sheet Header Area */}
              <div
                onDoubleClick={() => setHeaderFooterModalOpen(true)}
                className="rootixa-sheet-header group cursor-pointer"
                title="Double-click to edit Header and Footer"
              >
                <div className="flex-1 truncate">
                  {headerText ? (
                    <span>{headerText}</span>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity no-print text-[10px]">
                      [ Double-click to configure Header ]
                    </span>
                  )}
                </div>
                {pageNumberPos.startsWith("header-") && (
                  <div
                    className={`shrink-0 font-medium ${
                      pageNumberPos === "header-center"
                        ? "mx-auto text-center"
                        : pageNumberPos === "header-left"
                        ? "order-first mr-4"
                        : "text-right"
                    }`}
                  >
                    {getPageNumberDisplay(currentPage)}
                  </div>
                )}
              </div>

              {/* TipTap Rich Text Editor Surface */}
              <EditorContent editor={editor} />

              {/* Document Sheet Footer Area */}
              <div
                onDoubleClick={() => setHeaderFooterModalOpen(true)}
                className="rootixa-sheet-footer group cursor-pointer"
                title="Double-click to edit Header, Footer and Page Numbers"
              >
                <div className="flex-1 truncate">
                  {footerText ? (
                    <span>{footerText}</span>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity no-print text-[10px]">
                      [ Double-click to configure Footer & Page Numbers ]
                    </span>
                  )}
                </div>
                {pageNumberPos.startsWith("footer-") && (
                  <div
                    className={`shrink-0 font-medium ${
                      pageNumberPos === "footer-center"
                        ? "mx-auto text-center"
                        : pageNumberPos === "footer-left"
                        ? "order-first mr-4"
                        : "text-right"
                    }`}
                  >
                    {getPageNumberDisplay(currentPage)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================
          4. FIXED APPLICATION CHROME STATUS BAR
      ============================================================ */}
      {!focusMode && (
        <StatusBar
          currentPage={currentPage}
          totalPages={totalPages}
          wordsCount={wordsCount}
          charsCount={charsCount}
          viewMode={viewMode}
          setViewMode={setViewMode}
          zoom={zoom}
          setZoom={setZoom}
          saveStatus={saveStatus}
        />
      )}

      {/* ============================================================
          MODALS & APPLICATION DIALOGS
      ============================================================ */}
      <ConfirmModal
        isOpen={newDocModalOpen}
        title="Start a new document?"
        message="Your current document will be replaced with a clean slate. Any unsaved content will be cleared."
        confirmLabel="Continue"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={resetDocument}
        onCancel={() => setNewDocModalOpen(false)}
      />

      <ConfirmModal
        isOpen={clearDocModalOpen}
        title="Clear document?"
        message="This action will remove all text and formatting from the document canvas. Are you sure you want to proceed?"
        confirmLabel="Clear Document"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={confirmClearDocument}
        onCancel={() => setClearDocModalOpen(false)}
      />

      <LinkModal
        isOpen={linkModalOpen}
        initialText={editor ? editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to) : ""}
        initialUrl={editor?.getAttributes("link")?.href || ""}
        onSave={handleApplyLink}
        onClose={() => setLinkModalOpen(false)}
      />

      <WordCountModal
        isOpen={wordCountModalOpen}
        stats={docStats}
        onClose={() => setWordCountModalOpen(false)}
      />

      {headerFooterModalOpen && (
        <HeaderFooterModal
          key={`${headerText}-${footerText}-${pageNumberPos}-${pageNumberFormat}`}
          isOpen={headerFooterModalOpen}
          initialHeader={headerText}
          initialFooter={footerText}
          initialPageNumberPos={pageNumberPos}
          initialPageNumberFormat={pageNumberFormat}
          onSave={handleSaveHeaderFooter}
          onClose={() => setHeaderFooterModalOpen(false)}
        />
      )}

      {docPropsModalOpen && (
        <DocPropertiesModal
          key={`${docTitle}-${docAuthor}-${docSubject}`}
          isOpen={docPropsModalOpen}
          initialTitle={docTitle}
          initialAuthor={docAuthor}
          initialSubject={docSubject}
          stats={docStats}
          onSave={handleSaveDocProperties}
          onClose={() => setDocPropsModalOpen(false)}
        />
      )}

      <PrintPreviewModal
        isOpen={printPreviewModalOpen}
        title={docTitle}
        author={docAuthor}
        pageSettings={pageSettings}
        headerText={headerText}
        footerText={footerText}
        pageNumberPos={pageNumberPos}
        pageNumberFormat={pageNumberFormat}
        totalPages={totalPages}
        documentHtml={editor ? editor.getHTML() : ""}
        onPrint={handlePrint}
        onClose={() => setPrintPreviewModalOpen(false)}
      />

      {/* Phase 4 Desktop Dialogs */}
      <FontDialog
        isOpen={fontDialogOpen}
        onClose={() => setFontDialogOpen(false)}
        editor={editor}
        initialFontFamily={editor?.getAttributes("textStyle")?.fontFamily || "Arial, sans-serif"}
        initialFontSize={editor?.getAttributes("textStyle")?.fontSize || "16px"}
      />

      <ParagraphDialog
        isOpen={paragraphDialogOpen}
        onClose={() => setParagraphDialogOpen(false)}
        editor={editor}
      />

      <PageSetupDialog
        isOpen={pageSetupDialogOpen}
        onClose={() => setPageSetupDialogOpen(false)}
        pageSettings={pageSettings}
        onSavePageSettings={handleSavePageSettings}
      />

      <FindReplaceDialog
        isOpen={findReplaceOpen}
        onClose={() => setFindReplaceOpen(false)}
        editor={editor}
        onToast={showToast}
      />
    </div>
  );
}
