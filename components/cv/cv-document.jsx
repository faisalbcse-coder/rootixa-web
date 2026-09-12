"use client";

import { useMemo } from "react";
import { getTemplate } from "./templates/template-registry";

/**
 * CVDocument — Root A4 Document Engine
 *
 * Responsibilities:
 * 1. Resolves selected template dynamically from registry (zero data loss on switch).
 * 2. Enforces standard A4 print dimensions (210mm × 297mm / 794px × 1123px at 96 DPI).
 * 3. Injects curated Google Fonts and print-friendly CSS.
 * 4. Renders multi-page visual guides for screen display.
 */
export function CVDocument({ cvData, className = "" }) {
  const templateId = cvData?.design?.templateId || cvData?.settings?.templateId || "modern";
  const template = useMemo(() => getTemplate(templateId), [templateId]);
  const TemplateComponent = template.component;

  return (
    <div
      id="cv-document-root"
      data-template={template.id}
      className={`cv-document-paper relative bg-white text-slate-800 shadow-2xl shadow-slate-400/30 dark:shadow-black/60 mx-auto select-text transition-all duration-200 ${className}`}
      style={{
        width: "794px", // Standard A4 width at 96 DPI (210mm)
        minHeight: "1123px", // Standard A4 height at 96 DPI (297mm)
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* ─── Curated Google Fonts Link ─── */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap"
      />

      {/* ─── Embedded Print Stylesheet ─── */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            overflow: visible !important;
            height: auto !important;
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide screen UI chrome during native print */
          header, nav, aside, footer, button, .no-print, .cv-page-guide {
            display: none !important;
          }
          /* Strict Profile Photo Constraints in Print */
          .cv-profile-photo-wrapper {
            overflow: hidden !important;
            display: inline-block !important;
            flex-shrink: 0 !important;
            box-sizing: border-box !important;
          }
          .cv-profile-photo-wrapper img,
          .cv-profile-photo-img {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            min-width: 100% !important;
            min-height: 100% !important;
            object-fit: cover !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Ensure links do not render with browser default blue underlines */
          a {
            color: inherit !important;
            text-decoration: none !important;
          }
          /* Prevent awkward page breaks inside items */
          section, .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* ─── Active Template Component ─── */}
      <TemplateComponent cvData={cvData} />

      {/* ─── Visual Page 1 Boundary Indicator (Screen Only) ─── */}
      <div
        className="cv-page-guide absolute left-0 right-0 pointer-events-none select-none flex items-center justify-center no-print"
        style={{
          top: "1123px",
          borderTop: "1.5px dashed #cbd5e1",
          zIndex: 10,
        }}
        aria-hidden="true"
      >
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs -translate-y-1/2"
          style={{
            backgroundColor: "#f1f5f9",
            color: "#64748b",
            border: "1px solid #e2e8f0",
          }}
        >
          Page 2 Start (A4 Print Boundary)
        </span>
      </div>

      {/* ─── Visual Page 2 Boundary Indicator (Screen Only, for 3+ pages) ─── */}
      <div
        className="cv-page-guide absolute left-0 right-0 pointer-events-none select-none flex items-center justify-center no-print"
        style={{
          top: "2246px",
          borderTop: "1.5px dashed #cbd5e1",
          zIndex: 10,
        }}
        aria-hidden="true"
      >
        <span
          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-xs -translate-y-1/2"
          style={{
            backgroundColor: "#f1f5f9",
            color: "#64748b",
            border: "1px solid #e2e8f0",
          }}
        >
          Page 3 Start (A4 Print Boundary)
        </span>
      </div>
    </div>
  );
}
