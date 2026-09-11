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
      clonedDoc.getElementById("cv-export-target") ||
      clonedDoc.getElementById("cv-document-root") ||
      clonedDoc.body;
    const allElements = rootEl.querySelectorAll("*");

    allElements.forEach((el) => {
      try {
        const computed = win.getComputedStyle(el);
        if (!computed) return;

        if (
          computed.color &&
          (computed.color.includes("oklch") || computed.color.includes("lab"))
        ) {
          el.style.color = convertColorToRgb(computed.color);
        }

        if (
          computed.backgroundColor &&
          (computed.backgroundColor.includes("oklch") ||
            computed.backgroundColor.includes("lab"))
        ) {
          el.style.backgroundColor = convertColorToRgb(computed.backgroundColor);
        }

        if (
          computed.borderColor &&
          (computed.borderColor.includes("oklch") ||
            computed.borderColor.includes("lab"))
        ) {
          el.style.borderColor = convertColorToRgb(computed.borderColor);
        }
      } catch {
        // Continue on any style access failure
      }
    });
  } catch (err) {
    console.warn("Style sanitization skipped:", err);
  }
}
