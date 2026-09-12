import { sanitizeClonedStyles } from "./export-utils";

/**
 * Rootixa Pro CV Builder — High-Fidelity Multi-Page PDF Exporter
 *
 * Uses jsPDF + html2canvas with isolated node-cloning and modern color sanitization
 * to produce crisp, multi-page vector-aligned PDF documents without offset or blank canvas bugs.
 */

export async function exportCvToPdf({
  elementId = "cv-document-root",
  fileName = "Rootixa_CV.pdf",
  onProgress,
}) {
  if (typeof window === "undefined") {
    throw new Error("PDF export can only be run in the browser.");
  }

  const sourceEl =
    document.getElementById(elementId) ||
    document.getElementById("cv-document-root") ||
    document.querySelector(".cv-document-paper");

  if (!sourceEl) {
    throw new Error("CV document root element not found.");
  }

  // Ensure fonts are ready before rasterizing
  if (document.fonts && document.fonts.ready) {
    onProgress?.("Loading typography...");
    try {
      await document.fonts.ready;
    } catch {}
  }

  onProgress?.("Preparing document...");

  // If inside preview modal, temporarily reset scale transform during capture
  const scaledParent = sourceEl.parentElement;
  const originalTransform = scaledParent ? scaledParent.style.transform : "";
  if (scaledParent && originalTransform && originalTransform.includes("scale")) {
    scaledParent.style.transform = "none";
  }

  const originalBoxShadow = sourceEl.style.boxShadow;
  sourceEl.style.boxShadow = "none";

  // Hide screen-only guides during capture
  const guides = sourceEl.querySelectorAll(".cv-page-guide, .no-print");
  guides.forEach((g) => {
    g.style.display = "none";
  });

  try {
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    onProgress?.("Rendering PDF...");

    const canvas = await html2canvas(sourceEl, {
      scale: 2, // 2x high resolution for ultra-sharp typography
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      onclone: (clonedDoc) => {
        sanitizeClonedStyles(clonedDoc);
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error("Canvas generation produced empty dimensions.");
    }

    onProgress?.("Generating A4 pages...");

    // Standard A4 dimensions: 210mm x 297mm (Ratio 1.4142857)
    const a4Ratio = 297 / 210;
    const pageHeightPx = Math.floor(canvas.width * a4Ratio);
    const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage("a4", "portrait");
      }

      onProgress?.(`Processing page ${pageIndex + 1} of ${totalPages}...`);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;

      const pageCtx = pageCanvas.getContext("2d");
      if (pageCtx) {
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        const srcY = pageIndex * pageHeightPx;
        const srcHeight = Math.min(pageHeightPx, canvas.height - srcY);

        pageCtx.drawImage(
          canvas,
          0,
          srcY,
          canvas.width,
          srcHeight,
          0,
          0,
          canvas.width,
          srcHeight
        );

        const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(pageImgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }
    }

    onProgress?.("Downloading PDF...");
    pdf.save(fileName);
    return true;
  } finally {
    // Restore original transform and guides immediately
    if (scaledParent && originalTransform) {
      scaledParent.style.transform = originalTransform;
    }
    sourceEl.style.boxShadow = originalBoxShadow;
    guides.forEach((g) => {
      g.style.display = "";
    });
  }
}

/**
 * Triggers native browser print / save-as-PDF via an isolated iframe
 * to guarantee 100% vector fidelity and zero UI contamination.
 * Copies all active stylesheets from the document head into the iframe.
 */
export function printCv() {
  if (typeof window === "undefined") return;

  const cvElement =
    document.getElementById("cv-document-root") ||
    document.querySelector(".cv-document-paper");

  if (!cvElement) {
    window.print();
    return;
  }

  // Collect all stylesheets and style tags from the parent document
  const headStyles = Array.from(
    document.querySelectorAll("style, link[rel='stylesheet']")
  )
    .map((el) => el.outerHTML)
    .join("\n");

  // Create an isolated, invisible iframe to print ONLY the CV
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${document.title || "Rootixa CV"}</title>
        ${headStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            overflow: visible !important;
          }
          .cv-document-paper {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
          /* Rigid constraints on profile photo so it never blows out */
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
          /* Prevent default blue underlined styling on links */
          a {
            color: inherit !important;
            text-decoration: none !important;
          }
          .no-print, .cv-page-guide {
            display: none !important;
          }
          section, .break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${cvElement.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentElement) {
          iframe.parentElement.removeChild(iframe);
        }
      }, 4000);
    }
  };

  // Wait for fonts and all images inside iframe to complete
  const checkReadyAndPrint = () => {
    const images = Array.from(doc.images || []);
    const pendingImages = images.filter((img) => !img.complete);

    const onFontsReady = () => {
      if (pendingImages.length === 0) {
        setTimeout(triggerPrint, 250);
      } else {
        let loadedCount = 0;
        const checkDone = () => {
          loadedCount++;
          if (loadedCount >= pendingImages.length) {
            setTimeout(triggerPrint, 250);
          }
        };
        pendingImages.forEach((img) => {
          img.onload = checkDone;
          img.onerror = checkDone;
        });
        setTimeout(triggerPrint, 1500); // Safety fallback timeout
      }
    };

    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(onFontsReady).catch(onFontsReady);
    } else {
      onFontsReady();
    }
  };

  setTimeout(checkReadyAndPrint, 200);
}
