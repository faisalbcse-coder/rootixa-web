/**
 * ROOTIXA QR STUDIO — ZERO-DEPENDENCY PRINT & PDF BUILDER
 * Generates exact-dimension PDF 1.4, Scalable SVG, and 300 DPI Canvas Sheets client-side.
 */

import { MM_TO_PT } from './print-engine.js';

/**
 * Clean ASCII string for standard PDF Type1 Helvetica font
 */
function escapePdfText(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/[^\x20-\x7E]/g, ' '); // Map non-ASCII to space for standard Helvetica
}

/**
 * Pure JavaScript PDF 1.4 Generator
 * Supports exact mm MediaBox, crisp vector text, JPEG/PNG XObject streams, and vector trim guides.
 */
export async function generatePrintPdf({
  paperWidthMm,
  paperHeightMm,
  items,
  qrImagePngDataUrl,
  layoutType,
  showTitle,
  showSubtitle,
  title,
  subtitle,
  businessCardData,
  showCuttingGuides,
  showSafeArea,
}) {
  const widthPt = paperWidthMm * MM_TO_PT;
  const heightPt = paperHeightMm * MM_TO_PT;

  // Convert PNG Data URL to JPEG binary data for standard DCTDecode in PDF
  const jpegBlob = await convertDataUrlToJpegBlob(qrImagePngDataUrl);
  const jpegArrayBuffer = await jpegBlob.arrayBuffer();
  const jpegBytes = new Uint8Array(jpegArrayBuffer);
  const imageInfo = await getImageDimensions(qrImagePngDataUrl);

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length; // 1-indexed object id
  };

  // Obj 1: Catalog
  const catalogId = addObject('<< /Type /Catalog /Pages 2 0 R >>');

  // Obj 2: Pages (forward ref, updated later)
  const pagesId = addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');

  // Content Stream buffer
  let stream = '';

  // Helper coordinate converter: PDF (0,0) is bottom-left, screen is top-left
  const toPdfY = (yMm) => (paperHeightMm - yMm) * MM_TO_PT;
  const toPt = (valMm) => valMm * MM_TO_PT;

  // 1. Optional Safe Area (Dashed Green Box, 5mm from page edge)
  if (showSafeArea) {
    const safeMargin = 5;
    const safeX = toPt(safeMargin);
    const safeY = toPdfY(paperHeightMm - safeMargin);
    const safeW = toPt(paperWidthMm - safeMargin * 2);
    const safeH = toPt(paperHeightMm - safeMargin * 2);
    stream += `q 0.5 w [4 4] 0 d 0.1 0.7 0.3 RG ${safeX.toFixed(2)} ${safeY.toFixed(2)} ${safeW.toFixed(2)} ${safeH.toFixed(2)} re S Q\n`;
  }

  // 2. Render each copy / card
  items.forEach((item) => {
    const cardX = toPt(item.x);
    const cardY = toPdfY(item.y + item.height);
    const cardW = toPt(item.width);
    const cardH = toPt(item.height);

    // Subtle Card Background & Border
    stream += `q 0.5 w [] 0 d 0.94 0.96 0.98 rg 0.85 0.88 0.92 RG ${cardX.toFixed(2)} ${cardY.toFixed(2)} ${cardW.toFixed(2)} ${cardH.toFixed(2)} re B Q\n`;

    if (layoutType === 'business_card') {
      // Business Card Layout: Contact info on Left, QR on Right
      const qrSizeMm = Math.min(item.width * 0.42, item.height * 0.75);
      const qrPt = toPt(qrSizeMm);
      const qrX = cardX + cardW - qrPt - toPt(5);
      const qrY = cardY + (cardH - qrPt) / 2;

      // Draw QR Image
      stream += `q ${qrPt.toFixed(2)} 0 0 ${qrPt.toFixed(2)} ${qrX.toFixed(2)} ${qrY.toFixed(2)} cm /Im1 Do Q\n`;

      // Text column
      let textY = cardY + cardH - toPt(10);
      const textX = cardX + toPt(6);

      // Name
      if (businessCardData?.name) {
        stream += `BT /F2 11 Tf 0.05 0.09 0.16 rg ${textX.toFixed(2)} ${textY.toFixed(2)} Td (${escapePdfText(businessCardData.name)}) Tj ET\n`;
        textY -= 13;
      }
      // Job Title
      if (businessCardData?.title) {
        stream += `BT /F1 8 Tf 0.31 0.27 0.90 rg ${textX.toFixed(2)} ${textY.toFixed(2)} Td (${escapePdfText(businessCardData.title)}) Tj ET\n`;
        textY -= 14;
      }
      // Phone
      if (businessCardData?.phone) {
        stream += `BT /F1 7.5 Tf 0.25 0.30 0.38 rg ${textX.toFixed(2)} ${textY.toFixed(2)} Td (${escapePdfText('T: ' + businessCardData.phone)}) Tj ET\n`;
        textY -= 10;
      }
      // Email
      if (businessCardData?.email) {
        stream += `BT /F1 7.5 Tf 0.25 0.30 0.38 rg ${textX.toFixed(2)} ${textY.toFixed(2)} Td (${escapePdfText('E: ' + businessCardData.email)}) Tj ET\n`;
        textY -= 10;
      }
      // Website
      if (businessCardData?.website) {
        stream += `BT /F1 7.5 Tf 0.25 0.30 0.38 rg ${textX.toFixed(2)} ${textY.toFixed(2)} Td (${escapePdfText('W: ' + businessCardData.website)}) Tj ET\n`;
      }
    } else {
      // Centered Vertical Layout (Standard, Restaurant, Wi-Fi, Review, Social, Contact)
      let currentTopMm = item.y + 5;

      // Title
      if (showTitle && title) {
        const titleY = toPdfY(currentTopMm + 3.5);
        stream += `BT /F2 10 Tf 0.05 0.09 0.16 rg ${((cardX + cardW / 2) - toPt(title.length * 1.5)).toFixed(2)} ${titleY.toFixed(2)} Td (${escapePdfText(title)}) Tj ET\n`;
        currentTopMm += 7;
      }

      // QR Code (centered horizontally)
      const qrW = Math.min(item.width - 12, item.height - (currentTopMm - item.y) - 12);
      const qrPt = toPt(qrW);
      const qrX = cardX + (cardW - qrPt) / 2;
      const qrY = toPdfY(currentTopMm + qrW);

      stream += `q ${qrPt.toFixed(2)} 0 0 ${qrPt.toFixed(2)} ${qrX.toFixed(2)} ${qrY.toFixed(2)} cm /Im1 Do Q\n`;
      currentTopMm += qrW + 3;

      // Subtitle
      if (showSubtitle && subtitle) {
        const subY = toPdfY(currentTopMm + 3);
        stream += `BT /F1 7.5 Tf 0.40 0.45 0.55 rg ${((cardX + cardW / 2) - toPt(subtitle.length * 1.2)).toFixed(2)} ${subY.toFixed(2)} Td (${escapePdfText(subtitle)}) Tj ET\n`;
      }
    }

    // Cutting Guides (Corner marks 3mm outside card bounds)
    if (showCuttingGuides) {
      const markLen = toPt(3.5);
      const gap = toPt(1.5);
      stream += `q 0.5 w [] 0 d 0.6 0.6 0.6 RG\n`;
      // Top-Left
      stream += `${(cardX - gap - markLen).toFixed(2)} ${(cardY + cardH).toFixed(2)} m ${(cardX - gap).toFixed(2)} ${(cardY + cardH).toFixed(2)} l S\n`;
      stream += `${cardX.toFixed(2)} ${(cardY + cardH + gap).toFixed(2)} m ${cardX.toFixed(2)} ${(cardY + cardH + gap + markLen).toFixed(2)} l S\n`;
      // Top-Right
      stream += `${(cardX + cardW + gap).toFixed(2)} ${(cardY + cardH).toFixed(2)} m ${(cardX + cardW + gap + markLen).toFixed(2)} ${(cardY + cardH).toFixed(2)} l S\n`;
      stream += `${(cardX + cardW).toFixed(2)} ${(cardY + cardH + gap).toFixed(2)} m ${(cardX + cardW).toFixed(2)} ${(cardY + cardH + gap + markLen).toFixed(2)} l S\n`;
      // Bottom-Left
      stream += `${(cardX - gap - markLen).toFixed(2)} ${cardY.toFixed(2)} m ${(cardX - gap).toFixed(2)} ${cardY.toFixed(2)} l S\n`;
      stream += `${cardX.toFixed(2)} ${(cardY - gap - markLen).toFixed(2)} m ${cardX.toFixed(2)} ${(cardY - gap).toFixed(2)} l S\n`;
      // Bottom-Right
      stream += `${(cardX + cardW + gap).toFixed(2)} ${cardY.toFixed(2)} m ${(cardX + cardW + gap + markLen).toFixed(2)} ${cardY.toFixed(2)} l S\n`;
      stream += `${(cardX + cardW).toFixed(2)} ${(cardY - gap - markLen).toFixed(2)} m ${(cardX + cardW).toFixed(2)} ${(cardY - gap).toFixed(2)} l S\n`;
      stream += `Q\n`;
    }
  });

  // Obj 3: Page Definition
  const pageId = addObject(''); // placeholder
  // Obj 4: Content Stream
  const streamId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  // Obj 5: Font F1 (Helvetica Regular)
  const f1Id = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  // Obj 6: Font F2 (Helvetica Bold)
  const f2Id = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  // Obj 7: Image XObject (JPEG)
  const imageObjId = addObject(
    `<< /Type /XObject /Subtype /Image /Width ${imageInfo.width} /Height ${imageInfo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
  );

  // Update Page definition with exact MediaBox and Resources
  objects[pageId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt.toFixed(2)} ${heightPt.toFixed(2)}] /Contents ${streamId} 0 R /Resources << /Font << /F1 ${f1Id} 0 R /F2 ${f2Id} 0 R >> /XObject << /Im1 ${imageObjId} 0 R >> >> >>`;

  // Build Binary PDF Output
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
      // Append dictionary + binary JPEG bytes + endstream
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

  // Cross Reference Table
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
 * Generate Scalable SVG Print Sheet
 */
export function generatePrintSvg({
  paperWidthMm,
  paperHeightMm,
  items,
  qrImagePngDataUrl,
  layoutType,
  showTitle,
  showSubtitle,
  title,
  subtitle,
  businessCardData,
  showCuttingGuides,
  showSafeArea,
}) {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${paperWidthMm} ${paperHeightMm}" width="${paperWidthMm}mm" height="${paperHeightMm}mm" style="background:#ffffff; font-family:system-ui, -apple-system, sans-serif;">\n`;

  // Safe Area Indicator
  if (showSafeArea) {
    const sm = 5;
    svg += `  <rect x="${sm}" y="${sm}" width="${paperWidthMm - sm * 2}" height="${paperHeightMm - sm * 2}" fill="none" stroke="#10b981" stroke-width="0.3" stroke-dasharray="2,2" opacity="0.8" />\n`;
  }

  // Cards
  items.forEach((item) => {
    // Card Box
    svg += `  <g transform="translate(${item.x}, ${item.y})">\n`;
    svg += `    <rect width="${item.width}" height="${item.height}" rx="2.5" fill="#f8fafc" stroke="#e2e8f0" stroke-width="0.35" />\n`;

    if (layoutType === 'business_card') {
      const qrSize = Math.min(item.width * 0.42, item.height * 0.75);
      const qrX = item.width - qrSize - 5;
      const qrY = (item.height - qrSize) / 2;

      svg += `    <image href="${qrImagePngDataUrl}" x="${qrX}" y="${qrY}" width="${qrSize}" height="${qrSize}" />\n`;

      let ty = 12;
      if (businessCardData?.name) {
        svg += `    <text x="6" y="${ty}" font-size="3.8" font-weight="800" fill="#0f172a">${escapeXml(businessCardData.name)}</text>\n`;
        ty += 4.5;
      }
      if (businessCardData?.title) {
        svg += `    <text x="6" y="${ty}" font-size="2.6" font-weight="600" fill="#4f46e5">${escapeXml(businessCardData.title)}</text>\n`;
        ty += 5;
      }
      if (businessCardData?.phone) {
        svg += `    <text x="6" y="${ty}" font-size="2.4" fill="#475569">T: ${escapeXml(businessCardData.phone)}</text>\n`;
        ty += 3.8;
      }
      if (businessCardData?.email) {
        svg += `    <text x="6" y="${ty}" font-size="2.4" fill="#475569">E: ${escapeXml(businessCardData.email)}</text>\n`;
        ty += 3.8;
      }
      if (businessCardData?.website) {
        svg += `    <text x="6" y="${ty}" font-size="2.4" fill="#475569">W: ${escapeXml(businessCardData.website)}</text>\n`;
      }
    } else {
      let cy = 5;
      if (showTitle && title) {
        svg += `    <text x="${item.width / 2}" y="${cy + 3.5}" text-anchor="middle" font-size="3.2" font-weight="800" fill="#0f172a">${escapeXml(title)}</text>\n`;
        cy += 7;
      }
      const qrW = Math.min(item.width - 12, item.height - cy - 10);
      const qrX = (item.width - qrW) / 2;
      svg += `    <image href="${qrImagePngDataUrl}" x="${qrX}" y="${cy}" width="${qrW}" height="${qrW}" />\n`;
      cy += qrW + 3;

      if (showSubtitle && subtitle) {
        svg += `    <text x="${item.width / 2}" y="${cy + 2.5}" text-anchor="middle" font-size="2.4" fill="#64748b">${escapeXml(subtitle)}</text>\n`;
      }
    }
    svg += `  </g>\n`;

    // Crop Marks
    if (showCuttingGuides) {
      const ml = 3;
      const g = 1.2;
      const { x, y, width: w, height: h } = item;
      svg += `  <path d="M ${x - g - ml} ${y} L ${x - g} ${y} M ${x} ${y - g - ml} L ${x} ${y - g} M ${x + w + g} ${y} L ${x + w + g + ml} ${y} M ${x + w} ${y - g - ml} L ${x + w} ${y - g} M ${x - g - ml} ${y + h} L ${x - g} ${y + h} M ${x} ${y + h + g} L ${x} ${y + h + g + ml} M ${x + w + g} ${y + h} L ${x + w + g + ml} ${y + h} M ${x + w} ${y + h + g} L ${x + w} ${y + h + g + ml}" stroke="#94a3b8" stroke-width="0.25" stroke-linecap="round" />\n`;
    }
  });

  svg += `</svg>`;
  return new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
}

/**
 * Generate 300 DPI Raster Sheet Canvas
 */
export async function generatePrintCanvas({
  paperWidthMm,
  paperHeightMm,
  items,
  qrImagePngDataUrl,
  layoutType,
  showTitle,
  showSubtitle,
  title,
  subtitle,
  businessCardData,
  showCuttingGuides,
  showSafeArea,
}) {
  const dpm = 11.811; // 300 DPI = ~11.81 pixels per mm
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(paperWidthMm * dpm);
  canvas.height = Math.round(paperHeightMm * dpm);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const qrImg = await loadImage(qrImagePngDataUrl);

  // Safe Area
  if (showSafeArea) {
    const sm = 5 * dpm;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(sm, sm, canvas.width - sm * 2, canvas.height - sm * 2);
    ctx.setLineDash([]);
  }

  // Draw Items
  for (const item of items) {
    const ix = Math.round(item.x * dpm);
    const iy = Math.round(item.y * dpm);
    const iw = Math.round(item.width * dpm);
    const ih = Math.round(item.height * dpm);

    // Card background
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(ix, iy, iw, ih, 12);
    ctx.fill();
    ctx.stroke();

    if (layoutType === 'business_card') {
      const qrSize = Math.round(Math.min(iw * 0.42, ih * 0.75));
      const qrX = ix + iw - qrSize - Math.round(5 * dpm);
      const qrY = iy + Math.round((ih - qrSize) / 2);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      let ty = iy + Math.round(14 * dpm);
      const tx = ix + Math.round(6 * dpm);

      if (businessCardData?.name) {
        ctx.font = `bold ${Math.round(4.2 * dpm)}px Arial, sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.fillText(businessCardData.name, tx, ty);
        ty += Math.round(5 * dpm);
      }
      if (businessCardData?.title) {
        ctx.font = `600 ${Math.round(2.8 * dpm)}px Arial, sans-serif`;
        ctx.fillStyle = '#4f46e5';
        ctx.fillText(businessCardData.title, tx, ty);
        ty += Math.round(5.5 * dpm);
      }
      ctx.font = `normal ${Math.round(2.5 * dpm)}px Arial, sans-serif`;
      ctx.fillStyle = '#475569';
      if (businessCardData?.phone) {
        ctx.fillText(`T: ${businessCardData.phone}`, tx, ty);
        ty += Math.round(4.2 * dpm);
      }
      if (businessCardData?.email) {
        ctx.fillText(`E: ${businessCardData.email}`, tx, ty);
        ty += Math.round(4.2 * dpm);
      }
      if (businessCardData?.website) {
        ctx.fillText(`W: ${businessCardData.website}`, tx, ty);
      }
    } else {
      let cy = iy + Math.round(5 * dpm);
      if (showTitle && title) {
        ctx.font = `bold ${Math.round(3.4 * dpm)}px Arial, sans-serif`;
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.fillText(title, ix + iw / 2, cy + Math.round(3.5 * dpm));
        cy += Math.round(7 * dpm);
      }
      const qrW = Math.round(Math.min(iw - 12 * dpm, ih - (cy - iy) - 10 * dpm));
      const qrX = Math.round(ix + (iw - qrW) / 2);
      ctx.drawImage(qrImg, qrX, cy, qrW, qrW);
      cy += qrW + Math.round(3 * dpm);

      if (showSubtitle && subtitle) {
        ctx.font = `normal ${Math.round(2.6 * dpm)}px Arial, sans-serif`;
        ctx.fillStyle = '#64748b';
        ctx.textAlign = 'center';
        ctx.fillText(subtitle, ix + iw / 2, cy + Math.round(2.5 * dpm));
      }
      ctx.textAlign = 'left';
    }

    // Cutting Guides
    if (showCuttingGuides) {
      const ml = 3.5 * dpm;
      const g = 1.2 * dpm;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Top-Left
      ctx.moveTo(ix - g - ml, iy); ctx.lineTo(ix - g, iy);
      ctx.moveTo(ix, iy - g - ml); ctx.lineTo(ix, iy - g);
      // Top-Right
      ctx.moveTo(ix + iw + g, iy); ctx.lineTo(ix + iw + g + ml, iy);
      ctx.moveTo(ix + iw, iy - g - ml); ctx.lineTo(ix + iw, iy - g);
      // Bottom-Left
      ctx.moveTo(ix - g - ml, iy + ih); ctx.lineTo(ix - g, iy + ih);
      ctx.moveTo(ix, iy + ih + g); ctx.lineTo(ix, iy + ih + g + ml);
      // Bottom-Right
      ctx.moveTo(ix + iw + g, iy + ih); ctx.lineTo(ix + iw + g + ml, iy + ih);
      ctx.moveTo(ix + iw, iy + ih + g); ctx.lineTo(ix + iw, iy + ih + g + ml);
      ctx.stroke();
    }
  }

  return canvas;
}

// Helpers
function escapeXml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 600, height: img.naturalHeight || 600 });
    img.onerror = () => resolve({ width: 600, height: 600 });
    img.src = dataUrl;
  });
}

async function convertDataUrlToJpegBlob(pngDataUrl) {
  const img = await loadImage(pngDataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || 800;
  canvas.height = img.naturalHeight || 800;
  const ctx = canvas.getContext('2d');
  // Fill white background for JPG
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95);
  });
}
