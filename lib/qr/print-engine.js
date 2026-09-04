/**
 * ROOTIXA QR STUDIO — PRINT ENGINE
 * Mathematical layout engine, paper sizes, business presets, and print safety assessment.
 */

export const MM_TO_PT = 72 / 25.4; // 2.834645669291339 pt per mm
export const INCH_TO_MM = 25.4;

export const PAPER_SIZES = {
  A4: { id: 'A4', name: 'A4', widthMm: 210, heightMm: 297, desc: '210 × 297 mm · Standard international' },
  A5: { id: 'A5', name: 'A5', widthMm: 148, heightMm: 210, desc: '148 × 210 mm · Half sheet flyer / tent' },
  Letter: { id: 'Letter', name: 'Letter', widthMm: 215.9, heightMm: 279.4, desc: '8.5 × 11 in · North America standard' },
  Custom: { id: 'Custom', name: 'Custom', widthMm: 210, heightMm: 297, desc: 'User-defined dimensions' },
};

export const COPY_OPTIONS = [1, 2, 4, 6, 8, 12];

/**
 * Optimal Grid Columns and Rows for each copy count
 */
export function getOptimalGrid(copies, isLandscape = false) {
  switch (copies) {
    case 1:
      return { cols: 1, rows: 1 };
    case 2:
      return isLandscape ? { cols: 2, rows: 1 } : { cols: 1, rows: 2 };
    case 4:
      return { cols: 2, rows: 2 };
    case 6:
      return isLandscape ? { cols: 3, rows: 2 } : { cols: 2, rows: 3 };
    case 8:
      return isLandscape ? { cols: 4, rows: 2 } : { cols: 2, rows: 4 };
    case 12:
      return isLandscape ? { cols: 4, rows: 3 } : { cols: 3, rows: 4 };
    default:
      return { cols: 1, rows: 1 };
  }
}

/**
 * Business & Signage Presentation Presets (Layout Only — never mutates QR payload)
 */
export const BUSINESS_LAYOUT_PRESETS = {
  standard: {
    id: 'standard',
    name: 'Standard QR',
    badge: 'Versatile',
    desc: 'Clean standalone QR code with optional title and subtitle header/footer.',
    defaultQrSizeMm: 45,
    showTitle: true,
    showSubtitle: true,
    defaultTitle: 'Scan with Camera',
    defaultSubtitle: 'Point your camera to scan this code',
    textAlign: 'center',
    textSize: 'medium',
    isCard: false,
    cardWidthMm: 80,
    cardHeightMm: 80,
  },
  business_card: {
    id: 'business_card',
    name: 'Business Card',
    badge: 'Executive',
    desc: 'Standard 85 × 55 mm business card layout with contact info and QR code.',
    defaultQrSizeMm: 32,
    showTitle: false,
    showSubtitle: false,
    defaultTitle: '',
    defaultSubtitle: '',
    textAlign: 'left',
    textSize: 'small',
    isCard: true,
    cardWidthMm: 85,
    cardHeightMm: 55,
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant / Menu',
    badge: 'Hospitality',
    desc: 'Table tent / counter sign with prominent menu scanning invitation.',
    defaultQrSizeMm: 50,
    showTitle: true,
    showSubtitle: true,
    defaultTitle: 'Scan for Digital Menu',
    defaultSubtitle: 'Contactless & touch-free ordering',
    textAlign: 'center',
    textSize: 'medium',
    isCard: true,
    cardWidthMm: 90,
    cardHeightMm: 95,
  },
  wifi: {
    id: 'wifi',
    name: 'Wi-Fi Signage',
    badge: 'Network',
    desc: 'Table sign displaying network name, password, and instant connect QR.',
    defaultQrSizeMm: 45,
    showTitle: true,
    showSubtitle: true,
    defaultTitle: 'Free Guest Wi-Fi',
    defaultSubtitle: 'Scan to connect instantly without typing password',
    textAlign: 'center',
    textSize: 'medium',
    isCard: true,
    cardWidthMm: 85,
    cardHeightMm: 95,
  },
  contact: {
    id: 'contact',
    name: 'Contact Card',
    badge: 'Networking',
    desc: 'Networking badge or card with personal details and instant vCard save.',
    defaultQrSizeMm: 36,
    showTitle: true,
    showSubtitle: true,
    defaultTitle: 'Connect With Me',
    defaultSubtitle: 'Scan to save full contact card to your phone',
    textAlign: 'center',
    textSize: 'small',
    isCard: true,
    cardWidthMm: 85,
    cardHeightMm: 75,
  },
  social: {
    id: 'social',
    name: 'Social Media',
    badge: 'Growth',
    desc: 'Promotional display encouraging customers to follow on social channels.',
    defaultQrSizeMm: 45,
    showTitle: true,
    showSubtitle: true,
    defaultTitle: 'Follow Us on Social',
    defaultSubtitle: 'Stay updated with exclusive offers & news',
    textAlign: 'center',
    textSize: 'medium',
    isCard: true,
    cardWidthMm: 85,
    cardHeightMm: 85,
  },
  review: {
    id: 'review',
    name: 'Review Stand',
    badge: 'Feedback',
    desc: 'Counter display with 5-star review invitation to boost ratings.',
    defaultQrSizeMm: 45,
    showTitle: true,
    showSubtitle: true,
    defaultTitle: 'Love Our Service?',
    defaultSubtitle: 'Scan to leave a quick 5-star review!',
    textAlign: 'center',
    textSize: 'medium',
    isCard: true,
    cardWidthMm: 85,
    cardHeightMm: 90,
  },
};

/**
 * Calculate card dimensions based on layout type, QR physical size, and labels
 */
export function calculateCardDimensions({ layoutType, qrSizeMm, showTitle, showSubtitle, title, subtitle }) {
  const preset = BUSINESS_LAYOUT_PRESETS[layoutType] || BUSINESS_LAYOUT_PRESETS.standard;
  
  if (layoutType === 'business_card') {
    // Fixed standard business card ratio (85 x 55 mm)
    const cardW = 85;
    const cardH = 55;
    // QR fits within right side of card (max ~35mm)
    const effectiveQrSize = Math.min(qrSizeMm, 38);
    return { widthMm: cardW, heightMm: cardH, qrSizeMm: effectiveQrSize };
  }

  // Vertical card calculation
  const paddingMm = 6;
  const qrW = qrSizeMm;
  let textExtraHeightMm = 0;

  if (showTitle && title) {
    textExtraHeightMm += 8;
  }
  if (showSubtitle && subtitle) {
    textExtraHeightMm += 7;
  }
  if (layoutType === 'wifi') {
    textExtraHeightMm += 14; // SSID and Password box
  }
  if (layoutType === 'review') {
    textExtraHeightMm += 6; // 5-star graphic
  }

  const widthMm = Math.max(qrW + paddingMm * 2, 50);
  const heightMm = qrW + paddingMm * 2 + textExtraHeightMm;

  return { widthMm, heightMm, qrSizeMm };
}

/**
 * Check Print Fit & Calculate Printable Geometry
 * Prevents impossible layouts, calculates available space, and flags warnings.
 */
export function checkPrintFit({
  paperWidthMm,
  paperHeightMm,
  copies,
  cardWidthMm,
  cardHeightMm,
  marginLeftMm = 15,
  marginRightMm = 15,
  marginTopMm = 15,
  marginBottomMm = 15,
  spacingHMm = 8,
  spacingVMm = 8,
}) {
  const isLandscape = paperWidthMm > paperHeightMm;
  const { cols, rows } = getOptimalGrid(copies, isLandscape);

  const availableWidth = paperWidthMm - marginLeftMm - marginRightMm;
  const availableHeight = paperHeightMm - marginTopMm - marginBottomMm;

  const totalRequiredWidth = cols * cardWidthMm + (cols - 1) * spacingHMm;
  const totalRequiredHeight = rows * cardHeightMm + (rows - 1) * spacingVMm;

  const fitsHorizontally = totalRequiredWidth <= availableWidth + 0.1; // small float tolerance
  const fitsVertically = totalRequiredHeight <= availableHeight + 0.1;
  const fits = fitsHorizontally && fitsVertically;

  // Calculate actual card origins for rendering
  const items = [];
  if (availableWidth > 0 && availableHeight > 0) {
    // Center grid in printable area
    const startX = marginLeftMm + Math.max(0, (availableWidth - totalRequiredWidth) / 2);
    const startY = marginTopMm + Math.max(0, (availableHeight - totalRequiredHeight) / 2);

    let count = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (count < copies) {
          const x = startX + c * (cardWidthMm + spacingHMm);
          const y = startY + r * (cardHeightMm + spacingVMm);
          items.push({ index: count, col: c, row: r, x, y, width: cardWidthMm, height: cardHeightMm });
          count++;
        }
      }
    }
  }

  return {
    fits,
    fitsHorizontally,
    fitsVertically,
    cols,
    rows,
    availableWidth: Math.max(0, availableWidth),
    availableHeight: Math.max(0, availableHeight),
    totalRequiredWidth,
    totalRequiredHeight,
    overflowWidthMm: Math.max(0, totalRequiredWidth - availableWidth),
    overflowHeightMm: Math.max(0, totalRequiredHeight - availableHeight),
    items,
  };
}

/**
 * Calculate maximum QR size that perfectly fits on the page given margins and copies
 */
export function calculateAutoFitQrSize({
  paperWidthMm,
  paperHeightMm,
  copies,
  layoutType,
  showTitle,
  showSubtitle,
  title,
  subtitle,
  marginLeftMm = 15,
  marginRightMm = 15,
  marginTopMm = 15,
  marginBottomMm = 15,
  spacingHMm = 8,
  spacingVMm = 8,
}) {
  const isLandscape = paperWidthMm > paperHeightMm;
  const { cols, rows } = getOptimalGrid(copies, isLandscape);

  const availableWidth = Math.max(10, paperWidthMm - marginLeftMm - marginRightMm);
  const availableHeight = Math.max(10, paperHeightMm - marginTopMm - marginBottomMm);

  const maxCellW = (availableWidth - (cols - 1) * spacingHMm) / cols;
  const maxCellH = (availableHeight - (rows - 1) * spacingVMm) / rows;

  if (layoutType === 'business_card') {
    return 32;
  }

  let textExtraHeight = 0;
  if (showTitle && title) textExtraHeight += 8;
  if (showSubtitle && subtitle) textExtraHeight += 7;
  if (layoutType === 'wifi') textExtraHeight += 14;
  if (layoutType === 'review') textExtraHeight += 6;

  const maxQrFromW = maxCellW - 12; // 6mm padding on each side
  const maxQrFromH = maxCellH - 12 - textExtraHeight;

  const idealSize = Math.floor(Math.min(maxQrFromW, maxQrFromH));
  return Math.max(15, Math.min(idealSize, 160));
}

/**
 * Print Safety Assessment
 * Evaluates real-world print feasibility: physical scan size, quiet zone, contrast, logo coverage, and layout fit.
 */
export function evaluatePrintSafety({
  qrSizeMm,
  fitResult,
  scanSafety,
  logoSize,
  hasLogo,
  marginQuietZone,
}) {
  const issues = [];
  const warnings = [];

  // 1. Physical QR Code Size
  if (qrSizeMm < 15) {
    issues.push({
      type: 'size',
      severity: 'unsafe',
      message: `QR code size (${qrSizeMm} mm) is critically small. Most smartphone cameras will fail to resolve code modules.`,
    });
  } else if (qrSizeMm < 20) {
    issues.push({
      type: 'size',
      severity: 'warning',
      message: `QR code size (${qrSizeMm} mm) is compact. 20–25 mm or larger is recommended for standard scanning distance.`,
    });
  }

  // 2. Paper Layout Fit
  if (!fitResult.fits) {
    const reason = [];
    if (!fitResult.fitsHorizontally) reason.push(`width exceeds by ${fitResult.overflowWidthMm.toFixed(1)} mm`);
    if (!fitResult.fitsVertically) reason.push(`height exceeds by ${fitResult.overflowHeightMm.toFixed(1)} mm`);
    issues.push({
      type: 'overflow',
      severity: 'unsafe',
      message: `These settings do not fit on the selected paper size (${reason.join(', ')}). Adjust QR size, spacing, or margins.`,
    });
  }

  // 3. Margin / Quiet Zone
  if (marginQuietZone < 8) {
    warnings.push('Quiet zone margin is compact. Consider increasing margin for high-density physical prints.');
  }

  // 4. Logo Area
  if (hasLogo && logoSize > 0.35) {
    warnings.push('Logo coverage is large (>35%). Consider reducing logo size to preserve error correction redundancy in print.');
  }

  // 5. Contrast from Single QR Safety
  if (scanSafety && scanSafety.status === 'unsafe') {
    issues.push({
      type: 'contrast',
      severity: 'unsafe',
      message: 'Color contrast between QR code and background is insufficient for reliable print scanning.',
    });
  } else if (scanSafety && scanSafety.status === 'warning') {
    warnings.push('Color contrast is moderate. Ensure high-quality printer ink to avoid scan issues.');
  }

  const isUnsafe = issues.some(i => i.severity === 'unsafe');
  const isWarning = issues.some(i => i.severity === 'warning') || warnings.length > 0;

  return {
    status: isUnsafe ? 'unsafe' : isWarning ? 'warning' : 'excellent',
    label: isUnsafe ? '✕ Layout / Print Issue' : isWarning ? '⚠ Print Warning' : '✓ Print Ready',
    issues,
    warnings,
  };
}
