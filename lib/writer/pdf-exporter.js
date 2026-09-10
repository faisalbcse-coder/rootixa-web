import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Client-side high-resolution multi-page PDF exporter for document canvas.
 */
export async function exportToPdf({
  element,
  title = "Untitled Document",
  orientation = "portrait",
}) {
  if (!element || typeof window === "undefined") return;

  const isLandscape = orientation === "landscape";
  const pdfFormat = "a4";

  // Capture document canvas with crisp scaling
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  const pdf = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "mm",
    format: pdfFormat,
  });

  const pageWidthMm = isLandscape ? 297 : 210;
  const pageHeightMm = isLandscape ? 210 : 297;

  const imgWidthMm = pageWidthMm;
  const imgHeightMm = (canvas.height * pageWidthMm) / canvas.width;

  let heightLeft = imgHeightMm;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgWidthMm, imgHeightMm);
  heightLeft -= pageHeightMm;

  while (heightLeft > 0) {
    position = -(imgHeightMm - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgWidthMm, imgHeightMm);
    heightLeft -= pageHeightMm;
  }

  pdf.save(`${title.trim() || "Document"}.pdf`);
}
