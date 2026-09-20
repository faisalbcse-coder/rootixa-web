/**
 * Print Sheet Multi-Page PDF & Direct Print Generator for Rootixa Studio
 * High-precision millimeter placement matching Avery & ISO physical templates.
 */

import JsBarcode from "jsbarcode";

/**
 * Generate QR code data URL using qr-code-styling in the browser
 */
export async function generateQrDataUrl(text, size = 300) {
  try {
    const QRCodeStyling = (await import("qr-code-styling")).default;
    const qr = new QRCodeStyling({
      width: size,
      height: size,
      data: text || "Rootixa",
      margin: 4,
      qrOptions: { errorCorrectionLevel: "M" },
      dotsOptions: { type: "square", color: "#000000" },
      backgroundOptions: { color: "#ffffff" },
    });

    const blob = await qr.getRawData("png");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Failed to generate QR data URL:", err);
    return null;
  }
}

/**
 * Generate Barcode data URL using offscreen HTML5 Canvas
 */
export function generateBarcodeDataUrl({
  value,
  format = "CODE128",
  displayValue = false,
  width = 2,
  height = 60,
}) {
  try {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, value || "12345678", {
      format: format === "GS1_128" ? "CODE128" : format,
      ean128: format === "GS1_128",
      lineColor: "#000000",
      background: "#ffffff",
      width,
      height,
      margin: 8,
      displayValue: Boolean(displayValue),
      fontSize: 12,
      fontOptions: "bold",
      font: "ui-monospace, monospace",
    });
    return canvas.toDataURL("image/png");
  } catch (err) {
    console.warn("Failed to generate Barcode data URL:", err);
    return null;
  }
}

/**
 * Export Multi-Page Printable PDF Document
 */
export async function exportSheetPdf({
  items = [],
  layout,
  codeType = "qr", // 'qr' | 'barcode'
  barcodeFormat = "CODE128",
  showCode = true,
  showTitle = true,
  showSubtitle = true,
  showValue = true,
  borderStyle = "dashed", // 'none' | 'dashed' | 'solid'
  codeSizeRatio = 0.85, // 0.7 (small), 0.85 (medium), 0.95 (large)
  filename = "rootixa-label-sheet.pdf",
}) {
  if (!items || items.length === 0 || !layout) return;

  const { jsPDF } = await import("jspdf");

  const pdfFormat =
    layout.pageSize === "Custom"
      ? [layout.pageWidth, layout.pageHeight]
      : layout.pageSize.toLowerCase();

  const doc = new jsPDF({
    orientation: layout.orientation,
    unit: "mm",
    format: pdfFormat,
  });

  const { cellPositions, labelsPerPage, totalPages } = layout;

  // Cache generated image data URLs to avoid re-rendering duplicate values
  const imageCache = new Map();

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    if (pageIdx > 0) {
      doc.addPage(pdfFormat, layout.orientation);
    }

    const pageStartItemIdx = pageIdx * labelsPerPage;
    const pageItems = items.slice(pageStartItemIdx, pageStartItemIdx + labelsPerPage);

    for (let i = 0; i < pageItems.length; i++) {
      const item = pageItems[i];
      const cell = cellPositions[i];
      if (!cell) break;

      // 1. Draw Label Border / Cutting Guides
      if (borderStyle !== "none") {
        doc.setDrawColor(210, 215, 225);
        doc.setLineWidth(0.2);
        if (borderStyle === "dashed") {
          doc.setLineDashPattern([1.5, 1.5], 0);
        } else {
          doc.setLineDashPattern([], 0);
        }
        doc.rect(cell.x, cell.y, cell.width, cell.height);
      }

      // 2. Calculate Vertical Layout within Cell
      let curY = cell.y + 2.5;
      const innerW = cell.width - 4;

      // Title
      if (showTitle && item.title) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(Math.min(9, Math.max(6, Math.floor(cell.height * 0.16))));
        doc.setTextColor(15, 23, 42);
        const truncatedTitle = item.title.slice(0, Math.floor(innerW / 1.8));
        doc.text(truncatedTitle, cell.x + cell.width / 2, curY + 2, { align: "center" });
        curY += 4.5;
      }

      // Subtitle
      if (showSubtitle && item.subtitle) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(Math.min(7.5, Math.max(5.5, Math.floor(cell.height * 0.12))));
        doc.setTextColor(100, 116, 139);
        const truncatedSub = item.subtitle.slice(0, Math.floor(innerW / 1.6));
        doc.text(truncatedSub, cell.x + cell.width / 2, curY + 1.5, { align: "center" });
        curY += 3.5;
      }

      // Value / Human readable text
      const valueHeightReserved = showValue && item.value ? 4.5 : 0;
      const bottomPadding = 2;
      const availableCodeH = Math.max(8, cell.y + cell.height - curY - valueHeightReserved - bottomPadding);

      // 3. Render Code Graphic
      if (showCode && item.value) {
        const cacheKey = `${codeType}-${barcodeFormat}-${item.value}`;
        let dataUrl = imageCache.get(cacheKey);

        if (!dataUrl) {
          if (codeType === "qr") {
            dataUrl = await generateQrDataUrl(item.value, 400);
          } else {
            dataUrl = generateBarcodeDataUrl({
              value: item.value,
              format: barcodeFormat,
              displayValue: false, // Value text is handled with crisp vector typography below
              width: 2,
              height: 70,
            });
          }
          if (dataUrl) imageCache.set(cacheKey, dataUrl);
        }

        if (dataUrl) {
          if (codeType === "qr") {
            // QR Codes are strictly 1:1 square
            const maxSquare = Math.min(innerW * codeSizeRatio, availableCodeH * codeSizeRatio);
            const qrX = cell.x + (cell.width - maxSquare) / 2;
            const qrY = curY + (availableCodeH - maxSquare) / 2;
            doc.addImage(dataUrl, "PNG", qrX, qrY, maxSquare, maxSquare);
          } else {
            // Barcodes preserve horizontal proportions
            const barW = Math.min(innerW * codeSizeRatio, innerW);
            const barH = Math.min(availableCodeH * codeSizeRatio, availableCodeH);
            const barX = cell.x + (cell.width - barW) / 2;
            const barY = curY + (availableCodeH - barH) / 2;
            doc.addImage(dataUrl, "PNG", barX, barY, barW, barH);
          }
        }
      }

      // 4. Value Text underneath
      if (showValue && item.value) {
        doc.setFont("courier", "bold");
        doc.setFontSize(Math.min(8, Math.max(5.5, Math.floor(cell.height * 0.12))));
        doc.setTextColor(51, 65, 85);
        const valY = cell.y + cell.height - 2.5;
        const truncatedVal = item.value.slice(0, Math.floor(innerW / 1.9));
        doc.text(truncatedVal, cell.x + cell.width / 2, valY, { align: "center" });
      }
    }
  }

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
