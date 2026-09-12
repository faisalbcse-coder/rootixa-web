/**
 * Rootixa Pro CV Builder — Export Utilities
 */

/**
 * Generates a clean, sanitized PDF filename based on user's name.
 * Example: "Alex Morgan" -> "Alex_Morgan_CV.pdf"
 */
export function generateSanitizedFilename(fullName) {
  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    return "Rootixa_CV.pdf";
  }

  // Remove invalid filesystem characters: / ? < > \ : * | " ^
  const cleaned = fullName
    .trim()
    .replace(/[/\\?%*:|"<>^]/g, "")
    .replace(/\s+/g, "_");

  return `${cleaned || "Rootixa"}_CV.pdf`;
}

/**
 * Measures the DOM element height and calculates the estimated number of A4 pages.
 * Standard A4 height is 1123px at 96 DPI.
 */
export function calculateDocumentPages(element) {
  if (!element || typeof window === "undefined") return 1;
  const height = element.clientHeight || element.scrollHeight || 1123;
  return Math.max(1, Math.ceil(height / 1123));
}

/**
 * Color Sanitizer for html2canvas compatibility with Tailwind CSS v4.
 * Converts modern CSS variables (oklch, lab) into standard rgb(...) via offscreen 2D canvas context.
 */
export function sanitizeClonedStyles(clonedDoc) {
  if (!clonedDoc) return;

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const convertColorToRgb = (colorVal) => {
      if (!colorVal || typeof colorVal !== "string") return colorVal;
      if (
        colorVal.includes("oklch") ||
        colorVal.includes("lab") ||
        colorVal.includes("color-mix") ||
        colorVal.includes("color(")
      ) {
        try {
          ctx.fillStyle = "#000000";
          ctx.fillStyle = colorVal;
          return ctx.fillStyle;
        } catch {
          return "#1e293b";
        }
      }
      return colorVal;
    };

    const win = clonedDoc.defaultView || window;
    const rootEl =
      clonedDoc.getElementById("cv-document-export-clone") ||
      clonedDoc.getElementById("cv-export-target") ||
      clonedDoc.getElementById("cv-document-root") ||
      clonedDoc.body;
    const allElements = rootEl.querySelectorAll("*");

    const colorProperties = [
      "color",
      "backgroundColor",
      "borderColor",
      "borderTopColor",
      "borderBottomColor",
      "borderLeftColor",
      "borderRightColor",
      "outlineColor",
    ];

    allElements.forEach((el) => {
      try {
        if (el.classList?.contains("cv-page-guide") || el.classList?.contains("no-print")) {
          el.style.display = "none";
          return;
        }

        const computed = win.getComputedStyle(el);
        if (!computed) return;

        for (const prop of colorProperties) {
          const val = computed[prop];
          if (
            val &&
            (val.includes("oklch") ||
              val.includes("lab") ||
              val.includes("color-mix") ||
              val.includes("color("))
          ) {
            el.style[prop] = convertColorToRgb(val);
          }
        }

        // Sanitize Lucide SVGs stroke and fill
        if (el.tagName && el.tagName.toLowerCase() === "svg") {
          const stroke = el.getAttribute("stroke");
          const fill = el.getAttribute("fill");
          if (stroke && (stroke.includes("oklch") || stroke.includes("lab") || stroke.includes("color-mix"))) {
            el.setAttribute("stroke", convertColorToRgb(stroke));
          }
          if (fill && (fill.includes("oklch") || fill.includes("lab") || fill.includes("color-mix"))) {
            el.setAttribute("fill", convertColorToRgb(fill));
          }
        }
      } catch {
        // Continue on individual element failure
      }
    });
  } catch (err) {
    console.warn("Style sanitization skipped:", err);
  }
}
