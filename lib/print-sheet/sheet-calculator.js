/**
 * Print Sheet & Label Maker Layout Calculator
 * Real-world millimeter geometry, page presets, pagination, and client-side CSV parsing.
 */

export const PAGE_SIZES = {
  A4: { name: "A4", width: 210, height: 297, label: "A4 · 210 × 297 mm" },
  Letter: { name: "Letter", width: 215.9, height: 279.4, label: "Letter · 8.5 × 11 in" },
  A5: { name: "A5", width: 148, height: 210, label: "A5 · 148 × 210 mm" },
  Custom: { name: "Custom", width: 210, height: 297, label: "Custom Dimensions" },
};

export const SHEET_PRESETS = [
  {
    id: "a4-3x10",
    name: "A4 — 3 × 10",
    badge: "30 labels/page",
    description: "Standard address & product labels (e.g. Avery 3x10 style)",
    pageSize: "A4",
    orientation: "portrait",
    cols: 3,
    rows: 10,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 7,
    marginRight: 7,
    gapX: 2.5,
    gapY: 0,
    autoSize: true,
  },
  {
    id: "a4-4x8",
    name: "A4 — 4 × 8",
    badge: "32 labels/page",
    description: "Compact retail shelf tags and inventory bin labels",
    pageSize: "A4",
    orientation: "portrait",
    cols: 4,
    rows: 8,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 8,
    marginRight: 8,
    gapX: 2,
    gapY: 2,
    autoSize: true,
  },
  {
    id: "a4-2x5",
    name: "A4 — 2 × 5",
    badge: "10 labels/page",
    description: "Medium shipping and carton labels (~95 × 54 mm)",
    pageSize: "A4",
    orientation: "portrait",
    cols: 2,
    rows: 5,
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 10,
    marginRight: 10,
    gapX: 4,
    gapY: 4,
    autoSize: true,
  },
  {
    id: "a4-2x4",
    name: "A4 — 2 × 4",
    badge: "8 labels/page",
    description: "Large parcel packaging and warehouse master labels",
    pageSize: "A4",
    orientation: "portrait",
    cols: 2,
    rows: 4,
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 10,
    marginRight: 10,
    gapX: 5,
    gapY: 5,
    autoSize: true,
  },
  {
    id: "letter-3x10",
    name: "Letter — 3 × 10",
    badge: "30 labels/page",
    description: "Standard US Letter 30-up sheet (Avery 5160 template)",
    pageSize: "Letter",
    orientation: "portrait",
    cols: 3,
    rows: 10,
    marginTop: 12.7,
    marginBottom: 12.7,
    marginLeft: 4.8,
    marginRight: 4.8,
    gapX: 3.2,
    gapY: 0,
    autoSize: true,
  },
];

/**
 * Calculate physical sheet layout in millimeters
 */
export function calculateSheetLayout({
  pageSize = "A4",
  customPageWidth = 210,
  customPageHeight = 297,
  orientation = "portrait", // 'portrait' | 'landscape'
  cols = 3,
  rows = 10,
  marginTop = 10,
  marginBottom = 10,
  marginLeft = 7,
  marginRight = 7,
  gapX = 2.5,
  gapY = 0,
  autoSize = true,
  customLabelWidth = 63.5,
  customLabelHeight = 25.4,
  totalItemsCount = 1,
}) {
  // 1. Determine raw page dimensions
  const baseSize = PAGE_SIZES[pageSize] || PAGE_SIZES.A4;
  let rawW = pageSize === "Custom" ? Number(customPageWidth) || 210 : baseSize.width;
  let rawH = pageSize === "Custom" ? Number(customPageHeight) || 297 : baseSize.height;

  // Handle orientation
  const pageWidth = orientation === "landscape" ? Math.max(rawW, rawH) : Math.min(rawW, rawH);
  const pageHeight = orientation === "landscape" ? Math.min(rawW, rawH) : Math.max(rawW, rawH);

  // 2. Safe Margins & Printable Area
  const safeMarginLeft = Math.max(0, Number(marginLeft));
  const safeMarginRight = Math.max(0, Number(marginRight));
  const safeMarginTop = Math.max(0, Number(marginTop));
  const safeMarginBottom = Math.max(0, Number(marginBottom));

  const availableWidth = Math.max(10, pageWidth - safeMarginLeft - safeMarginRight);
  const availableHeight = Math.max(10, pageHeight - safeMarginTop - safeMarginBottom);

  const safeCols = Math.max(1, Math.min(10, parseInt(cols, 10) || 1));
  const safeRows = Math.max(1, Math.min(20, parseInt(rows, 10) || 1));
  const safeGapX = Math.max(0, Number(gapX));
  const safeGapY = Math.max(0, Number(gapY));

  // 3. Calculate Label Dimensions
  let labelWidth;
  let labelHeight;
  let fits = true;
  let warning = "";

  const totalGapsX = (safeCols - 1) * safeGapX;
  const totalGapsY = (safeRows - 1) * safeGapY;

  if (autoSize) {
    labelWidth = Math.max(5, (availableWidth - totalGapsX) / safeCols);
    labelHeight = Math.max(5, (availableHeight - totalGapsY) / safeRows);
  } else {
    labelWidth = Math.max(5, Number(customLabelWidth) || 60);
    labelHeight = Math.max(5, Number(customLabelHeight) || 30);

    const totalNeededW = safeCols * labelWidth + totalGapsX;
    const totalNeededH = safeRows * labelHeight + totalGapsY;

    if (totalNeededW > availableWidth + 0.1 || totalNeededH > availableHeight + 0.1) {
      fits = false;
      const overflowW = Math.max(0, totalNeededW - availableWidth).toFixed(1);
      const overflowH = Math.max(0, totalNeededH - availableHeight).toFixed(1);
      warning = `Label dimensions exceed page boundaries (Overflow: ${overflowW > 0 ? `${overflowW}mm width ` : ""}${overflowH > 0 ? `${overflowH}mm height` : ""}).`;
    }
  }

  // 4. Pagination & Capacities
  const labelsPerPage = safeCols * safeRows;
  const totalPages = Math.max(1, Math.ceil(Math.max(1, totalItemsCount) / labelsPerPage));

  // 5. Generate Individual Label Positions for a Single Page (in mm)
  const cellPositions = [];
  for (let r = 0; r < safeRows; r++) {
    for (let c = 0; c < safeCols; c++) {
      const x = safeMarginLeft + c * (labelWidth + safeGapX);
      const y = safeMarginTop + r * (labelHeight + safeGapY);
      cellPositions.push({
        colIndex: c,
        rowIndex: r,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        width: Number(labelWidth.toFixed(2)),
        height: Number(labelHeight.toFixed(2)),
      });
    }
  }

  return {
    pageWidth: Number(pageWidth.toFixed(2)),
    pageHeight: Number(pageHeight.toFixed(2)),
    orientation,
    pageSize,
    marginLeft: safeMarginLeft,
    marginRight: safeMarginRight,
    marginTop: safeMarginTop,
    marginBottom: safeMarginBottom,
    cols: safeCols,
    rows: safeRows,
    gapX: safeGapX,
    gapY: safeGapY,
    labelWidth: Number(labelWidth.toFixed(2)),
    labelHeight: Number(labelHeight.toFixed(2)),
    labelsPerPage,
    totalPages,
    fits,
    warning,
    cellPositions,
  };
}

/**
 * Client-Side CSV Parser
 * Extracts Title, Value, Subtitle, and Copies from uploaded CSV files.
 */
export function parseCsvInput(csvText) {
  if (!csvText || !csvText.trim()) return [];

  // Detect delimiter: comma, semicolon, or tab
  const firstLine = csvText.split(/\r\n|\n|\r/)[0] || "";
  let delimiter = ",";
  if (firstLine.includes("\t")) delimiter = "\t";
  else if (firstLine.includes(";") && !firstLine.includes(",")) delimiter = ";";

  // Regex-based CSV line parser supporting quoted values
  const parseLine = (line) => {
    const entries = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        entries.push(cur.trim());
        cur = "";
      } else {
        cur += char;
      }
    }
    entries.push(cur.trim());
    return entries;
  };

  const rawLines = csvText.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
  if (rawLines.length === 0) return [];

  const firstRow = parseLine(rawLines[0]);
  const hasHeader = firstRow.some((h) =>
    /^(value|code|barcode|qr|data|title|name|subtitle|item|sku|copies|qty)$/i.test(h)
  );

  let valIdx = 0;
  let titleIdx = -1;
  let subIdx = -1;
  let copiesIdx = -1;

  if (hasHeader) {
    firstRow.forEach((col, idx) => {
      const lower = col.toLowerCase();
      if (/^(value|code|barcode|qr|data|sku)$/i.test(lower)) valIdx = idx;
      else if (/^(title|name|product|item)$/i.test(lower)) titleIdx = idx;
      else if (/^(subtitle|desc|description|category)$/i.test(lower)) subIdx = idx;
      else if (/^(copies|qty|quantity|count)$/i.test(lower)) copiesIdx = idx;
    });
  }

  const dataRows = hasHeader ? rawLines.slice(1) : rawLines;
  const items = [];

  dataRows.forEach((line) => {
    const cols = parseLine(line);
    const value = cols[valIdx] !== undefined ? cols[valIdx] : cols[0];
    if (value && value.trim()) {
      const title = titleIdx !== -1 && cols[titleIdx] ? cols[titleIdx] : "";
      const subtitle = subIdx !== -1 && cols[subIdx] ? cols[subIdx] : "";
      const parsedCopies = copiesIdx !== -1 ? parseInt(cols[copiesIdx], 10) : 1;
      const copies = Number.isInteger(parsedCopies) && parsedCopies > 0 ? parsedCopies : 1;

      items.push({
        value: value.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        copies,
      });
    }
  });

  return items;
}

/**
 * Expand items list taking copies into account
 */
export function expandItemsWithCopies(items, globalCopies = 1) {
  if (!items || items.length === 0) return [];

  const expanded = [];
  items.forEach((item, itemIdx) => {
    const copiesToUse = item.copies && item.copies > 1 ? item.copies : Math.max(1, globalCopies);
    for (let c = 0; c < copiesToUse; c++) {
      expanded.push({
        ...item,
        id: `label-${itemIdx}-${c}`,
        copyNumber: c + 1,
        totalCopies: copiesToUse,
      });
    }
  });

  return expanded;
}
