import { BaseAIProvider } from "./base";

/**
 * Server API Provider.
 * Connects to Rootixa's server-side AI API routes (/api/ai/remove-bg, /api/ai/enhance).
 * Keeps external API tokens and credentials strictly server-side.
 */
export class ServerAPIProvider extends BaseAIProvider {
  constructor() {
    super("server-api", "Rootixa Cloud AI Engine", false);
  }

  async removeBackground(imageSource, onProgress = () => {}) {
    onProgress("Uploading to secure AI processing endpoint...", 25);

    const formData = new FormData();
    if (imageSource instanceof Blob || imageSource instanceof File) {
      formData.append("image", imageSource);
    } else if (imageSource instanceof HTMLCanvasElement) {
      const blob = await new Promise((r) => imageSource.toBlob(r, "image/png"));
      formData.append("image", blob, "canvas-input.png");
    } else if (imageSource instanceof HTMLImageElement) {
      const response = await fetch(imageSource.src);
      const blob = await response.blob();
      formData.append("image", blob, "image-input.png");
    }

    onProgress("Processing through AI model...", 60);

    const res = await fetch("/api/ai/remove-bg", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to process image on server AI");
    }

    onProgress("Receiving processed result...", 90);
    const resultBlob = await res.blob();

    // Create canvas from blob
    const img = new Image();
    const url = URL.createObjectURL(resultBlob);
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    onProgress("Done", 100);

    return {
      canvas,
      blob: resultBlob,
      dimensions: { width: canvas.width, height: canvas.height },
    };
  }

  async enhanceImage(imageSource, mode = "auto", onProgress = () => {}) {
    onProgress("Uploading to secure AI enhancer endpoint...", 25);

    const formData = new FormData();
    formData.append("mode", mode);
    if (imageSource instanceof Blob || imageSource instanceof File) {
      formData.append("image", imageSource);
    } else if (imageSource instanceof HTMLCanvasElement) {
      const blob = await new Promise((r) => imageSource.toBlob(r, "image/png"));
      formData.append("image", blob, "canvas-input.png");
    } else if (imageSource instanceof HTMLImageElement) {
      const response = await fetch(imageSource.src);
      const blob = await response.blob();
      formData.append("image", blob, "image-input.png");
    }

    onProgress("Enhancing details via AI model...", 65);

    const res = await fetch("/api/ai/enhance", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to enhance image on server AI");
    }

    onProgress("Receiving high-resolution result...", 90);
    const resultBlob = await res.blob();

    const img = new Image();
    const url = URL.createObjectURL(resultBlob);
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    onProgress("Done", 100);

    return {
      canvas,
      blob: resultBlob,
      dimensions: { width: canvas.width, height: canvas.height },
    };
  }
}
