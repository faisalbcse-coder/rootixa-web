/**
 * ROOTIXA QR STUDIO — PDF EXPORT ENGINE
 * Generates crisp, client-side PDF documents with A4, A5, Letter, and Fit-to-QR paper sizes,
 * with optional Header (Title) and Footer (Subtitle/Note) typography.
 */

const MM_TO_PT = 72 / 25.4; // 2.834645669291339 pt per mm

export const PDF_PAPER_SIZES = {
  A4: { id: 'A4', name: 'A4 · 210 × 297 mm', widthMm: 210, heightMm: 297, defaultQrSizeMm: 120 },
  A5: { id: 'A5', name: 'A5 · 148 × 210 mm', widthMm: 148, heightMm: 210, defaultQrSizeMm: 90 },
  Letter: { id: 'Letter', name: 'Letter · 216 × 279 mm', widthMm: 215.9, heightMm: 279.4, defaultQrSizeMm: 120 },
  Fit: { id: 'Fit', name: 'Fit to QR · Single Card', widthMm: 105, heightMm: 135, defaultQrSizeMm: 75 },
};

/**
 * Escape text for standard PDF Type1 Helvetica font
 */
function escapePdfText(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Map non-ASCII to space
}

/**
 * Convert Image Data URL (PNG) to JPEG Blob for standard DCTDecode
 */
function dataUrlToJpegBytes(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 1024;
      canvas.height = img.naturalHeight || 1024;
      const ctx = canvas.getContext('2d');
      // Solid white background for clean print
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        async (blob) => {
          if (!blob) return reject(new Error('Failed to create JPEG blob'));
          const buffer = await blob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(buffer),
            width: canvas.width,
            height: canvas.height,
          });
        },
        'image/jpeg',
        0.95
      );
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Generate PDF Document Blob
 */
export async function generateQrPdf({
  qrDataUrl,
  paperSize = 'A4',
  showHeader = false,
  headerText = '',
  showFooter = false,
  footerText = '',
}) {
  const paper = PDF_PAPER_SIZES[paperSize] || PDF_PAPER_SIZES.A4;
  const widthPt = paper.widthMm * MM_TO_PT;
  const heightPt = paper.heightMm * MM_TO_PT;

  const { bytes: jpegBytes, width: imgW, height: imgH } = await dataUrlToJpegBytes(qrDataUrl);

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  // Obj 1: Catalog
  addObject('<< /Type /Catalog /Pages 2 0 R >>');

  // Obj 2: Pages
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

  // Layout calculations
  const qrSizeMm = Math.min(paper.defaultQrSizeMm, paper.widthMm - 30);
  const qrPt = qrSizeMm * MM_TO_PT;
  const qrX = (widthPt - qrPt) / 2;

  // Vertical centering with space for header and footer
  let headerExtraPt = showHeader && headerText ? 36 : 0;
  let footerExtraPt = showFooter && footerText ? 30 : 0;
  const totalContentHeightPt = qrPt + headerExtraPt + footerExtraPt;
  const contentCenterY = heightPt / 2;
  const qrY = contentCenterY - qrPt / 2 + (footerExtraPt - headerExtraPt) / 2;

  let stream = '';

  // 1. Draw Optional Header Text (Above QR)
  if (showHeader && headerText) {
    const titleY = qrY + qrPt + 18;
    const estCharWidth = 4.5;
    const titleX = Math.max(20, (widthPt - headerText.length * estCharWidth) / 2);
    stream += `BT /F2 16 Tf 0.06 0.09 0.16 rg ${titleX.toFixed(2)} ${titleY.toFixed(2)} Td (${escapePdfText(headerText)}) Tj ET\n`;
  }

  // 2. Draw QR Code Image
  stream += `q ${qrPt.toFixed(2)} 0 0 ${qrPt.toFixed(2)} ${qrX.toFixed(2)} ${qrY.toFixed(2)} cm /Im1 Do Q\n`;

  // 3. Draw Optional Footer Text (Below QR)
  if (showFooter && footerText) {
    const subY = qrY - 18;
    const estCharWidth = 3.2;
    const subX = Math.max(20, (widthPt - footerText.length * estCharWidth) / 2);
    stream += `BT /F1 10 Tf 0.38 0.44 0.52 rg ${subX.toFixed(2)} ${subY.toFixed(2)} Td (${escapePdfText(footerText)}) Tj ET\n`;
  }

  // 4. Subtle Brand Tag at very bottom of sheet
  const brandY = 22;
  const brandText = 'Powered by Rootixa QR Studio';
  const brandX = (widthPt - brandText.length * 2.5) / 2;
  stream += `BT /F1 7.5 Tf 0.65 0.70 0.78 rg ${brandX.toFixed(2)} ${brandY.toFixed(2)} Td (${escapePdfText(brandText)}) Tj ET\n`;

  // Obj 3: Page
  const pageId = addObject('');
  // Obj 4: Stream
  const streamId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  // Obj 5: Font F1 (Helvetica Regular)
  const f1Id = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  // Obj 6: Font F2 (Helvetica Bold)
  const f2Id = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  // Obj 7: Image XObject (JPEG)
  const imageObjId = addObject(
    `<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );

  // Update Page object
  objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt.toFixed(2)} ${heightPt.toFixed(2)}] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${f1Id} 0 R /F2 ${f2Id} 0 R >> /XObject << /Im1 ${imageObjId} 0 R >> >> >>`;

  // Construct Binary PDF
  const chunks = [];
  const pushString = (s) => chunks.push(new TextEncoder().encode(s));

  pushString('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  const offsets = [0];
  let currentOffset = chunks.reduce((acc, c) => acc + c.length, 0);

  for (let i = 0; i < objects.length; i++) {
    offsets.push(currentOffset);
    const objHeader = `${i + 1} 0 obj\n`;
    pushString(objHeader);
    currentOffset += objHeader.length;

    if (i + 1 === imageObjId) {
      const dict = objects[i];
      pushString(dict);
      currentOffset += dict.length;

      chunks.push(jpegBytes);
      currentOffset += jpegBytes.length;

      const endStream = '\nendstream\nendobj\n';
      pushString(endStream);
      currentOffset += endStream.length;
    } else {
      const objBody = `${objects[i]}\nendobj\n`;
      pushString(objBody);
      currentOffset += objBody.length;
    }
  }

  // Cross Reference Table & Trailer
  const xrefOffset = currentOffset;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  pushString(xref);

  return new Blob(chunks, { type: 'application/pdf' });
}

/**
 * Composite QR Code with Header & Footer onto an offscreen Canvas for PNG/JPG/WEBP download
 */
export function compositeQrWithText({
  qrCanvas,
  showHeader = false,
  headerText = '',
  showFooter = false,
  footerText = '',
  bgColor = '#FFFFFF',
  isTransparentBg = false,
}) {
  if (!showHeader && !showFooter) {
    return qrCanvas;
  }

  const padding = Math.round(qrCanvas.width * 0.05);
  const headerHeight = showHeader && headerText ? Math.round(qrCanvas.width * 0.09) : 0;
  const footerHeight = showFooter && footerText ? Math.round(qrCanvas.width * 0.07) : 0;

  const canvas = document.createElement('canvas');
  canvas.width = qrCanvas.width + padding * 2;
  canvas.height = qrCanvas.height + padding * 2 + headerHeight + footerHeight;
  const ctx = canvas.getContext('2d');

  // Background
  if (!isTransparentBg) {
    ctx.fillStyle = bgColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Draw Header
  let currentY = padding;
  if (showHeader && headerText) {
    ctx.font = `bold ${Math.round(canvas.width * 0.045)}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(headerText, canvas.width / 2, currentY + headerHeight * 0.65);
    currentY += headerHeight;
  }

  // Draw QR
  ctx.drawImage(qrCanvas, padding, currentY);
  currentY += qrCanvas.height;

  // Draw Footer
  if (showFooter && footerText) {
    ctx.font = `normal ${Math.round(canvas.width * 0.032)}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.fillText(footerText, canvas.width / 2, currentY + footerHeight * 0.7);
  }

  return canvas;
}
