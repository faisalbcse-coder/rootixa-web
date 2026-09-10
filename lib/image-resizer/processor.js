/**
 * Rootixa Image Processing Core Engine
 * Headless, client-side image transformation library utilizing HTML5 Canvas.
 * Supports high-quality resampling, rotation, flip, crop, resize, and format encoding.
 */

/**
 * Format bytes into human-readable string (KB, MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Sanitize download filename
 */
export function sanitizeFilename(originalName = "image", suffix = "-resized", ext = "jpg") {
  const base = (originalName || "image")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^\w\s-]/gi, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${base}${suffix}.${ext}`;
}

/**
 * Load an image from a File, Blob, or URL string into an HTMLImageElement
 */
export function loadImage(source) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    let objectUrl = null;
    if (typeof source === "string") {
      img.src = source;
    } else if (source instanceof Blob || source instanceof File) {
      objectUrl = URL.createObjectURL(source);
      img.src = objectUrl;
    } else {
      return reject(new Error("Invalid image source"));
    }

    img.onload = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = (err) => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
}

/**
 * Calculate proportional dimensions when aspect ratio is locked
 */
export function calculateAspectRatioDimensions({
  changedField, // 'width' | 'height'
  newValue,
  aspectRatio, // width / height
  maxWidth = 10000,
  maxHeight = 10000,
}) {
  const val = Math.max(1, Math.round(Number(newValue) || 1));

  if (changedField === "width") {
    const computedHeight = Math.max(1, Math.round(val / aspectRatio));
    return {
      width: Math.min(maxWidth, val),
      height: Math.min(maxHeight, computedHeight),
    };
  } else {
    const computedWidth = Math.max(1, Math.round(val * aspectRatio));
    return {
      width: Math.min(maxWidth, computedWidth),
      height: Math.min(maxHeight, val),
    };
  }
}

/**
 * Execute the full image processing pipeline on a canvas
 * Pipeline order:
 * 1. Base image orientation (rotation in 90deg increments & flips)
 * 2. Region Crop (coordinates relative to transformed image)
 * 3. Final Resize (scaling to target width & height with high smoothing)
 *
 * @param {Object} params
 * @param {HTMLImageElement} params.image - Source HTML image
 * @param {number} params.rotation - Degrees: 0, 90, 180, 270
 * @param {boolean} params.flipH - Flip horizontal
 * @param {boolean} params.flipV - Flip vertical
 * @param {Object} params.crop - { x, y, width, height } in transformed image pixel space
 * @param {number} params.targetWidth - Output width in pixels
 * @param {number} params.targetHeight - Output height in pixels
 * @returns {HTMLCanvasElement}
 */
export function processImageCanvas({
  image,
  rotation = 0,
  flipH = false,
  flipV = false,
  crop = null,
  targetWidth,
  targetHeight,
}) {
  if (!image) throw new Error("Source image is required");

  const origWidth = image.naturalWidth || image.width;
  const origHeight = image.naturalHeight || image.height;

  // Normalized rotation in 90 degree increments
  const normalizedRotation = ((rotation % 360) + 360) % 360;
  const isRotated90or270 = normalizedRotation === 90 || normalizedRotation === 270;

  // 1. Create transformed intermediate canvas
  const transWidth = isRotated90or270 ? origHeight : origWidth;
  const transHeight = isRotated90or270 ? origWidth : origHeight;

  const transCanvas = document.createElement("canvas");
  transCanvas.width = transWidth;
  transCanvas.height = transHeight;
  const transCtx = transCanvas.getContext("2d", { willReadFrequently: false });

  transCtx.save();
  transCtx.translate(transWidth / 2, transHeight / 2);
  transCtx.rotate((normalizedRotation * Math.PI) / 180);
  transCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  transCtx.drawImage(image, -origWidth / 2, -origHeight / 2);
  transCtx.restore();

  // 2. Determine crop region
  const cropX = crop && crop.width > 0 ? Math.max(0, Math.min(transWidth - 1, crop.x)) : 0;
  const cropY = crop && crop.height > 0 ? Math.max(0, Math.min(transHeight - 1, crop.y)) : 0;
  const cropW = crop && crop.width > 0 ? Math.min(transWidth - cropX, crop.width) : transWidth;
  const cropH = crop && crop.height > 0 ? Math.min(transHeight - cropY, crop.height) : transHeight;

  // 3. Final resized destination canvas
  const outWidth = Math.max(1, Math.round(targetWidth || cropW));
  const outHeight = Math.max(1, Math.round(targetHeight || cropH));

  const outCanvas = document.createElement("canvas");
  outCanvas.width = outWidth;
  outCanvas.height = outHeight;
  const outCtx = outCanvas.getContext("2d");

  // High-quality bicubic smoothing
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";

  // Draw cropped sub-rectangle from transformed canvas into destination
  outCtx.drawImage(
    transCanvas,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    outWidth,
    outHeight
  );

  return outCanvas;
}

/**
 * Export canvas to Blob with quality parameter
 */
export function canvasToBlob(canvas, mimeType = "image/jpeg", quality = 0.9) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        mimeType,
        mimeType === "image/png" ? undefined : Math.max(0.01, Math.min(1, quality))
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Trigger browser file download from a Blob
 */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
