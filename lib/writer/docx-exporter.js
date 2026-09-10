import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
} from "docx";

/**
 * Export document HTML and metadata into a valid OpenXML DOCX document.
 */
export async function exportToDocx({
  html,
  title = "Untitled Document",
  author = "Rootixa User",
  subject = "",
  headerText = "",
  footerText = "",
  showPageNumbers = true,
  pageSettings = { orientation: "portrait", margins: "normal", paperSize: "a4" },
}) {
  if (typeof window === "undefined") return;

  const docEl = new DOMParser().parseFromString(html || "", "text/html").body;
  const docxChildren = [];

  // Parse top-level DOM nodes into DOCX nodes
  Array.from(docEl.children).forEach((node) => {
    const tagName = node.tagName.toLowerCase();

    // Headings
    if (tagName === "h1") {
      docxChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: parseInlineRuns(node),
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (tagName === "h2") {
      docxChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: parseInlineRuns(node),
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (tagName === "h3") {
      docxChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: parseInlineRuns(node),
          spacing: { before: 160, after: 80 },
        })
      );
    }
    // Blockquote
    else if (tagName === "blockquote") {
      docxChildren.push(
        new Paragraph({
          children: parseInlineRuns(node),
          indent: { left: 720 },
          spacing: { before: 120, after: 120 },
        })
      );
    }
    // Lists
    else if (tagName === "ul" || tagName === "ol") {
      const isOrdered = tagName === "ol";
      Array.from(node.children).forEach((li) => {
        docxChildren.push(
          new Paragraph({
            bullet: isOrdered ? undefined : { level: 0 },
            numbering: isOrdered ? { reference: "default-numbering", level: 0 } : undefined,
            children: parseInlineRuns(li),
            spacing: { before: 40, after: 40 },
          })
        );
      });
    }
    // Tables
    else if (tagName === "table") {
      const docxRows = [];
      const trElements = node.querySelectorAll("tr");

      trElements.forEach((tr) => {
        const docxCells = [];
        const cellElements = tr.querySelectorAll("th, td");

        cellElements.forEach((cell) => {
          docxCells.push(
            new TableCell({
              children: [
                new Paragraph({
                  children: parseInlineRuns(cell),
                }),
              ],
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              },
            })
          );
        });

        if (docxCells.length > 0) {
          docxRows.push(new TableRow({ children: docxCells }));
        }
      });

      if (docxRows.length > 0) {
        docxChildren.push(
          new Table({
            rows: docxRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
      }
    }
    // Dividers
    else if (tagName === "hr") {
      docxChildren.push(
        new Paragraph({
          thematicBreak: true,
          spacing: { before: 200, after: 200 },
        })
      );
    }
    // Default Paragraph
    else {
      const textAlign = getDocxAlignment(node.style.textAlign);
      docxChildren.push(
        new Paragraph({
          alignment: textAlign,
          children: parseInlineRuns(node),
          spacing: { before: 80, after: 120 },
        })
      );
    }
  });

  // Ensure at least one paragraph exists
  if (docxChildren.length === 0) {
    docxChildren.push(new Paragraph({ children: [new TextRun("")] }));
  }

  // Header configuration
  const headers = headerText
    ? {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: headerText,
                  color: "666666",
                  size: 18,
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      }
    : undefined;

  // Footer configuration with optional Page Numbers
  const footerRuns = [];
  if (footerText) {
    footerRuns.push(new TextRun({ text: `${footerText}   `, color: "888888", size: 18 }));
  }
  if (showPageNumbers) {
    footerRuns.push(new TextRun({ text: "Page ", color: "888888", size: 18 }));
    footerRuns.push(PageNumber.CURRENT);
    footerRuns.push(new TextRun({ text: " of ", color: "888888", size: 18 }));
    footerRuns.push(PageNumber.TOTAL_PAGES);
  }

  const footers =
    footerRuns.length > 0
      ? {
          default: new Footer({
            children: [
              new Paragraph({
                children: footerRuns,
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        }
      : undefined;

  // Construct Document
  const doc = new Document({
    creator: author,
    title: title,
    description: subject,
    sections: [
      {
        properties: {
          page: {
            margin: getDocxMargins(pageSettings.margins),
          },
        },
        headers,
        footers,
        children: docxChildren,
      },
    ],
  });

  // Export Blob and trigger download
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.trim() || "Document"}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseInlineRuns(element) {
  const runs = [];

  function traverse(node, formatting = {}) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        runs.push(
          new TextRun({
            text: text,
            bold: formatting.bold,
            italics: formatting.italic,
            underline: formatting.underline ? {} : undefined,
            strike: formatting.strike,
            color: formatting.color,
            size: formatting.size,
            font: formatting.font,
          })
        );
      }
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase();
      const currentFormatting = { ...formatting };

      if (tag === "strong" || tag === "b") currentFormatting.bold = true;
      if (tag === "em" || tag === "i") currentFormatting.italic = true;
      if (tag === "u") currentFormatting.underline = true;
      if (tag === "s" || tag === "strike") currentFormatting.strike = true;

      // Color & Font Size from inline styles
      if (node.style?.color) {
        currentFormatting.color = rgbToHex(node.style.color);
      }
      if (node.style?.fontSize) {
        const px = parseInt(node.style.fontSize, 10);
        if (!isNaN(px)) currentFormatting.size = Math.round(px * 1.5); // Convert px to half-points
      }

      Array.from(node.childNodes).forEach((child) => traverse(child, currentFormatting));
    }
  }

  Array.from(element.childNodes).forEach((child) => traverse(child));
  return runs.length > 0 ? runs : [new TextRun("")];
}

function getDocxAlignment(align) {
  switch (align?.toLowerCase()) {
    case "center":
      return AlignmentType.CENTER;
    case "right":
      return AlignmentType.RIGHT;
    case "justify":
      return AlignmentType.JUSTIFIED;
    default:
      return AlignmentType.LEFT;
  }
}

function getDocxMargins(margin) {
  switch (margin) {
    case "narrow":
      return { top: 720, bottom: 720, left: 720, right: 720 }; // 0.5 in
    case "moderate":
      return { top: 1080, bottom: 1080, left: 1080, right: 1080 }; // 0.75 in
    case "wide":
      return { top: 2160, bottom: 2160, left: 2160, right: 2160 }; // 1.5 in
    default:
      return { top: 1440, bottom: 1440, left: 1440, right: 1440 }; // 1 in (Normal)
  }
}

function rgbToHex(rgbStr) {
  if (!rgbStr) return undefined;
  if (rgbStr.startsWith("#")) return rgbStr.replace("#", "");
  const match = rgbStr.match(/\d+/g);
  if (match && match.length >= 3) {
    const r = parseInt(match[0], 10).toString(16).padStart(2, "0");
    const g = parseInt(match[1], 10).toString(16).padStart(2, "0");
    const b = parseInt(match[2], 10).toString(16).padStart(2, "0");
    return `${r}${g}${b}`;
  }
  return undefined;
}
