import { BACKGROUND_TYPES } from "./types";

/**
 * High-performance pure client-side Canvas compositor.
 * Composites background fills/gradients/images and subject scaling/positioning without re-running AI.
 */

/**
 * Composite the background and subject onto an output canvas.
 */
export function compositeImage({
  subjectCanvas,
  bgType = BACKGROUND_TYPES.TRANSPARENT,
  bgColor = "#FFFFFF",
  bgGradient = null,
  bgImage = null,
  transform = { scale: 1, x: 0, y: 0 },
}) {
  if (!subjectCanvas) return null;

  const width = subjectCanvas.width;
  const height = subjectCanvas.height;

  const outCanvas = document.createElement("canvas");
  outCanvas.width = width;
  outCanvas.height = height;
  const ctx = outCanvas.getContext("2d", { alpha: true });

  // 1. Render Background
  if (bgType === BACKGROUND_TYPES.SOLID) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === BACKGROUND_TYPES.GRADIENT && bgGradient) {
    const angleRad = ((bgGradient.angle || 90) * Math.PI) / 180;
    const x0 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y0 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x1 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 + (Math.sin(angleRad) * height) / 2;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, bgGradient.start || "#6366F1");
    grad.addColorStop(1, bgGradient.end || "#EC4899");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === BACKGROUND_TYPES.IMAGE && bgImage) {
    // Draw background image scaled to cover canvas (aspect fill)
    const imgRatio = bgImage.width / bgImage.height;
    const canvasRatio = width / height;
    let renderW = width;
    let renderH = height;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderH = width / imgRatio;
      offsetY = (height - renderH) / 2;
    } else {
      renderW = height * imgRatio;
      offsetX = (width - renderW) / 2;
    }

    ctx.drawImage(bgImage, offsetX, offsetY, renderW, renderH);
  }
  // If TRANSPARENT, canvas remains transparent RGBA (0,0,0,0)

  // 2. Draw Subject with Scaling & Translation
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Center-pivot transform
  const centerX = width / 2 + (transform.x || 0);
  const centerY = height / 2 + (transform.y || 0);

  ctx.translate(centerX, centerY);
  ctx.scale(transform.scale || 1, transform.scale || 1);
  ctx.drawImage(subjectCanvas, -width / 2, -height / 2, width, height);
  ctx.restore();

  return outCanvas;
}

/**
 * Convert canvas to Blob with format & quality handling.
 */
export async function exportCanvasToBlob({
  canvas,
  format = "png", // 'png' | 'jpg' | 'webp'
  quality = 0.92,
  bgType = BACKGROUND_TYPES.TRANSPARENT,
}) {
  let mimeType = "image/png";
  if (format === "jpg" || format === "jpeg") {
    mimeType = "image/jpeg";
  } else if (format === "webp") {
    mimeType = "image/webp";
  }

  let finalCanvas = canvas;
  let notice = "";

  // JPG does not support alpha channel. If transparent, composite onto white background
  if (mimeType === "image/jpeg" && bgType === BACKGROUND_TYPES.TRANSPARENT) {
    finalCanvas = document.createElement("canvas");
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height;
    const fCtx = finalCanvas.getContext("2d");
    fCtx.fillStyle = "#FFFFFF";
    fCtx.fillRect(0, 0, canvas.width, canvas.height);
    fCtx.drawImage(canvas, 0, 0);
    notice = "JPG does not support transparency. Automatically exported with a crisp white background.";
  }

  const blob = await new Promise((resolve) => {
    finalCanvas.toBlob((b) => resolve(b), mimeType, quality);
  });

  return { blob, notice };
}

/**
 * Generate clean and safe download filename
 */
export function generateDownloadFilename(originalName = "", isEnhanced = false, isBgRemoved = false, format = "png") {
  let baseName = originalName
    ? originalName.substring(0, originalName.lastIndexOf(".")) || originalName
    : "rootixa";

  baseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!baseName) baseName = "rootixa";

  let suffix = "";
  if (isBgRemoved && isEnhanced) {
    suffix = "-bg-removed-enhanced";
  } else if (isBgRemoved) {
    suffix = "-bg-removed";
  } else if (isEnhanced) {
    suffix = "-enhanced";
  } else {
    suffix = "-edited";
  }

  const ext = format === "jpeg" ? "jpg" : format;
  return `${baseName}${suffix}.${ext}`;
}

/**
 * Triggers a browser download directly
 */
export function triggerFileDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
