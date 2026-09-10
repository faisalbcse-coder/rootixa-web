import mammoth from "mammoth";

/**
 * Import and parse local document files (.docx, .txt, .html)
 * Client-side only with XSS sanitization and image extraction.
 */
export async function importDocumentFile(file) {
  const fileName = file.name || "Untitled Document";
  const ext = fileName.split(".").pop()?.toLowerCase();
  const cleanTitle = fileName.replace(/\.[^/.]+$/, "");

  // 1. Plain Text Import
  if (ext === "txt") {
    const text = await file.text();
    const html = text
      .split(/\r?\n/)
      .map((line) => `<p>${escapeHtml(line) || "<br>"}</p>`)
      .join("");
    return { title: cleanTitle, html };
  }

  // 2. HTML Import
  if (ext === "html" || ext === "htm") {
    const rawHtml = await file.text();
    const sanitized = sanitizeHtml(rawHtml);
    return { title: cleanTitle, html: sanitized };
  }

  // 3. DOCX Import
  if (ext === "docx") {
    const arrayBuffer = await file.arrayBuffer();

    // Convert DOCX to HTML with embedded Base64 images
    const options = {
      convertImage: mammoth.images.imgElement((image) => {
        return image.read("base64").then((imageBuffer) => {
          return {
            src: `data:${image.contentType};base64,${imageBuffer}`,
          };
        });
      }),
    };

    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    const sanitized = sanitizeHtml(result.value);

    return {
      title: cleanTitle,
      html: sanitized,
      messages: result.messages || [],
    };
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a .docx, .txt, or .html file.`);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function sanitizeHtml(html) {
  if (typeof window === "undefined") return html;
  const doc = new DOMParser().parseFromString(html, "text/html");

  // Remove dangerous tags
  const dangerousTags = doc.querySelectorAll(
    "script, iframe, object, embed, applet, base, link, meta, style"
  );
  dangerousTags.forEach((el) => el.remove());

  // Clean all elements of inline scripts and javascript: links
  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    // Remove inline event handlers
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith("on") || attr.name.toLowerCase().includes("javascript")) {
        el.removeAttribute(attr.name);
      }
    });

    // Check href & src for javascript:
    const href = el.getAttribute("href");
    if (href && /^javascript:/i.test(href.trim())) {
      el.removeAttribute("href");
    }
    const src = el.getAttribute("src");
    if (src && /^javascript:/i.test(src.trim())) {
      el.removeAttribute("src");
    }
  });

  return doc.body.innerHTML;
}
