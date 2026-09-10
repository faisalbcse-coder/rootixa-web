/**
 * Barcode Multi-Format Exporter
 * Supports true vector SVG, high-resolution raster formats (PNG, JPG, WEBP), and PDF.
 */

/**
 * Download a Blob or DataURL as a file
 */
export function triggerFileDownload(urlOrBlob, filename) {
  const isBlob = urlOrBlob instanceof Blob;
  const url = isBlob ? URL.createObjectURL(urlOrBlob) : urlOrBlob;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isBlob) {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/**
 * Export barcode as true vector SVG
 */
export function exportBarcodeSvg(svgElement, filename = "barcode.svg") {
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add XML declaration & proper namespace if missing
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  triggerFileDownload(svgBlob, filename.endsWith(".svg") ? filename : `${filename}.svg`);
}

/**
 * Render SVG element onto high-resolution Canvas and export as raster format (PNG / JPG / WEBP)
 */
export async function exportBarcodeRaster({
  svgElement,
  format = "png", // 'png' | 'jpeg' | 'webp'
  exportWidth = 2000,
  filename = "barcode.png",
  background = "#FFFFFF",
}) {
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  // Calculate target dimensions preserving aspect ratio
  const svgRect = svgElement.getBoundingClientRect();
  const aspectRatio = (svgRect.height || 100) / (svgRect.width || 300);
  const targetWidth = Math.max(800, Math.min(4096, exportWidth));
  const targetHeight = Math.round(targetWidth * aspectRatio);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  // Fill background
  if (format === "jpeg" || (background && background !== "transparent")) {
    ctx.fillStyle = background === "transparent" ? "#FFFFFF" : background;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  URL.revokeObjectURL(url);

  const mimeType = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
  const ext = format === "jpeg" ? "jpg" : format;

  canvas.toBlob(
    (blob) => {
      if (blob) {
        triggerFileDownload(blob, filename.replace(/\.[^/.]+$/, "") + `.${ext}`);
      }
    },
    mimeType,
    0.95
  );
}

/**
 * Export barcode as high-resolution printable PDF
 */
export async function exportBarcodePdf({
  svgElement,
  paperSize = "A4", // 'A4' | 'A5' | 'Letter' | 'Fit'
  filename = "barcode.pdf",
  barcodeValue = "",
  barcodeFormat = "",
}) {
  if (!svgElement) return;

  // Dynamically import jsPDF to keep initial bundle lightweight
  const { jsPDF } = await import("jspdf");

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.crossOrigin = "anonymous";

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });

  const svgRect = svgElement.getBoundingClientRect();
  const aspect = (svgRect.height || 100) / (svgRect.width || 300);

  let doc;
  let imgWidthMm;
  let imgHeightMm;
  let posX;
  let posY;

  if (paperSize === "Fit") {
    // Single label / card size
    imgWidthMm = 100;
    imgHeightMm = Math.round(imgWidthMm * aspect);
    const pageHeightMm = imgHeightMm + 25;
    const pageWidthMm = 110;

    doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageWidthMm, pageHeightMm],
    });

    posX = (pageWidthMm - imgWidthMm) / 2;
    posY = 12;

    // Optional metadata label
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Rootixa ${barcodeFormat} · ${barcodeValue}`, pageWidthMm / 2, 8, { align: "center" });
  } else {
    // Standard Document Sheets
    doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: paperSize.toLowerCase(),
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    imgWidthMm = paperSize === "A5" ? 110 : 140;
    imgHeightMm = Math.round(imgWidthMm * aspect);

    posX = (pageWidth - imgWidthMm) / 2;
    posY = (pageHeight - imgHeightMm) / 2 - 10;

    // Header title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Barcode Specification Sheet", pageWidth / 2, posY - 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Standard: ${barcodeFormat}   |   Value: ${barcodeValue}`, pageWidth / 2, posY - 10, { align: "center" });

    // Footer note
    doc.setFontSize(8);
    doc.text("Generated by Rootixa QR & Barcode Studio — Free Online Digital Tools", pageWidth / 2, pageHeight - 15, { align: "center" });
  }

  // Draw image on canvas to get clean JPEG bytes for jsPDF
  const canvas = document.createElement("canvas");
  canvas.width = 2400;
  canvas.height = Math.round(2400 * aspect);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  doc.addImage(imgData, "JPEG", posX, posY, imgWidthMm, imgHeightMm);

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
