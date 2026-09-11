/**
 * Rootixa Pro CV Builder — High-Fidelity Multi-Page PDF Exporter
 *
 * Uses jsPDF + html2canvas with isolated node-cloning to produce
 * crisp, multi-page vector-aligned PDF documents without offset or blank canvas bugs.
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

  // 1. Create an isolated wrapper directly on body at (0, 0)
  // This completely eliminates offset/scroll/transform issues in html2canvas
  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "0";
  wrapper.style.top = "0";
  wrapper.style.width = "794px";
  wrapper.style.zIndex = "-99999";
  wrapper.style.backgroundColor = "#ffffff";
  wrapper.style.margin = "0";
  wrapper.style.padding = "0";
  wrapper.style.pointerEvents = "none";
  wrapper.style.overflow = "visible";

  // 2. Clone the live CV element
  const clone = sourceEl.cloneNode(true);
  clone.id = "cv-document-export-clone";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.style.transform = "none";
  clone.style.width = "794px";
  clone.style.minHeight = "1123px";
  clone.style.position = "static";
  clone.style.display = "block";
  clone.style.visibility = "visible";
  clone.style.opacity = "1";

  // Hide screen-only guides in the clone
  const guides = clone.querySelectorAll(".cv-page-guide, .no-print");
  guides.forEach((g) => {
    g.style.display = "none";
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // 3. Dynamically import dependencies
    const { jsPDF } = await import("jspdf");
    const html2canvas = (await import("html2canvas")).default;

    onProgress?.("Rendering PDF...");

    // Render from the isolated (0, 0) clone
    const canvas = await html2canvas(clone, {
      scale: 2, // 2x resolution for crisp text and sharp profile images
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
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

    // Slice each A4 page cleanly
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
        // White page background
        pageCtx.fillStyle = "#ffffff";
        pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Source vertical offset for this slice
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
    // 4. Always clean up the temporary DOM wrapper
    if (wrapper.parentElement) {
      wrapper.parentElement.removeChild(wrapper);
    }
  }
}

/**
 * Triggers native browser print / save-as-PDF via an isolated iframe
 * to guarantee 100% vector fidelity and zero UI contamination.
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
        <title>${document.title || "Rootixa CV"}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&family=Open+Sans:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap" />
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          .cv-document-paper {
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
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

  setTimeout(() => {
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
      }, 2000);
    }
  }, 250);
}
