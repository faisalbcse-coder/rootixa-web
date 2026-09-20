/**
 * Barcode Multi-Format Exporter & Clipboard Utility for Rootixa Barcode Studio
 * Supports true vector SVG, high-resolution raster formats (PNG, JPG, WEBP), and PDF spec sheets.
 */

/**
 * Sanitize filename safe for all file systems
 *
 * @param {string} standardId - e.g. 'CODE128', 'EAN13', 'GS1_128'
 * @param {string} value - Raw or formatted barcode value
 * @param {string} ext - Extension without dot, e.g. 'png', 'svg', 'pdf'
 * @returns {string} Sanitized filename
 */
export function generateBarcodeFilename(standardId, value, ext = "png") {
  const std = (standardId || "barcode").toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanVal = (value || "code")
    .replace(/[()]/g, "") // Strip GS1 parentheses
    .replace(/[^a-zA-Z0-9_-]/g, "-") // Replace symbols and spaces with hyphen
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .replace(/^-|-$/g, "") // Trim leading/trailing hyphens
    .slice(0, 32); // Max length

  const extension = ext.replace(/^\./, "").toLowerCase();
  return `rootixa-${std}-${cleanVal || "data"}.${extension}`;
}

/**
 * Trigger browser file download for a Blob or DataURL
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
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
}

/**
 * Serialize an SVG element into a clean, standalone XML string
 */
export function serializeSvgElement(svgElement) {
  if (!svgElement) return "";

  const clone = svgElement.cloneNode(true);
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(clone);

  // Ensure XML namespaces
  if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  return source;
}

/**
 * Copy text or raw SVG XML to system clipboard
 */
export async function copyToClipboard(text) {
  if (!text) return false;

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("Clipboard API writeText failed, attempting fallback:", err);
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const success = document.execCommand("copy");
    document.body.removeChild(ta);
    return success;
  } catch {
    return false;
  }
}

/**
 * Copy raw SVG markup to clipboard
 */
export async function copyBarcodeSvgMarkup(svgElement) {
  const svgString = serializeSvgElement(svgElement);
  return copyToClipboard(svgString);
}

/**
 * Export barcode as true vector SVG
 */
export function exportBarcodeSvg(svgElement, filename = "barcode.svg") {
  if (!svgElement) return;

  const source = serializeSvgElement(svgElement);
  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  triggerFileDownload(svgBlob, filename.endsWith(".svg") ? filename : `${filename}.svg`);
}

/**
 * Render SVG element onto high-resolution Canvas and export as raster format (PNG / JPG / WEBP)
 */
export async function exportBarcodeRaster({
  svgElement,
  format = "png", // 'png' | 'jpeg' | 'webp'
  exportWidth = 2400,
  filename = "barcode.png",
  background = "#FFFFFF",
  isTransparentBg = false,
}) {
  if (!svgElement) return;

  const svgString = serializeSvgElement(svgElement);
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
  const targetWidth = Math.max(800, Math.min(4800, exportWidth));
  const targetHeight = Math.round(targetWidth * aspectRatio);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  // Handle background:
  // JPEG does not support transparency; always fill with background color or white
  if (format === "jpeg") {
    ctx.fillStyle = !background || background === "transparent" ? "#FFFFFF" : background;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else if (!isTransparentBg && background && background !== "transparent") {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Draw rendered SVG image with high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
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

  const svgString = serializeSvgElement(svgElement);
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
    const pageHeightMm = imgHeightMm + 24;
    const pageWidthMm = 110;

    doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageWidthMm, pageHeightMm],
    });

    posX = (pageWidthMm - imgWidthMm) / 2;
    posY = 10;

    // Header label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Rootixa ${barcodeFormat} · ${barcodeValue}`, pageWidthMm / 2, 7, { align: "center" });
  } else {
    // Standard Document Sheets
    doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: paperSize.toLowerCase(),
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    imgWidthMm = paperSize === "A5" ? 115 : 145;
    imgHeightMm = Math.round(imgWidthMm * aspect);

    posX = (pageWidth - imgWidthMm) / 2;
    posY = (pageHeight - imgHeightMm) / 2 - 10;

    // Spec Sheet Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text("Barcode Specification Sheet", pageWidth / 2, posY - 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Standard: ${barcodeFormat}   |   Value: ${barcodeValue}`, pageWidth / 2, posY - 12, { align: "center" });

    // Footer note
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("Generated by Rootixa QR & Barcode Studio — Free Online Digital Tools", pageWidth / 2, pageHeight - 15, { align: "center" });
  }

  // Draw high-resolution raster image on canvas for jsPDF embedding
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
