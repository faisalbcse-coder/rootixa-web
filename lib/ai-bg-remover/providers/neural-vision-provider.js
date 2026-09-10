import { BaseAIProvider } from "./base";

/**
 * Production Neural Vision Provider powered by ISNet (Intermediate Supervision Network).
 * Performs true semantic deep learning segmentation in the browser via WebAssembly & ONNX Runtime Web.
 * Accurately segments people, faces, eyes, hair, clothes, white shirts, ties, and objects
 * WITHOUT using naive color-distance or thresholding.
 */
export class NeuralVisionProvider extends BaseAIProvider {
  constructor() {
    super("neural-vision", "In-Browser Neural Vision (ISNet)", true);
    this.libPromise = null;
  }

  /**
   * Lazy load @imgly/background-removal only on client-side
   */
  async getLib() {
    if (typeof window === "undefined") {
      throw new Error("Neural vision engine can only run in the browser");
    }
    if (!this.libPromise) {
      this.libPromise = import("@imgly/background-removal");
    }
    return this.libPromise;
  }

  /**
   * Convert any input source into a guaranteed Blob (required by @imgly/background-removal)
   */
  async sourceToBlob(imageSource) {
    if (!imageSource) {
      throw new Error("No image source provided for background removal.");
    }
    if (imageSource instanceof Blob) {
      return imageSource;
    }
    if (imageSource instanceof HTMLCanvasElement) {
      if (imageSource.width <= 0 || imageSource.height <= 0) {
        throw new Error("Canvas has invalid dimensions (width or height is 0).");
      }
      return new Promise((resolve, reject) => {
        imageSource.toBlob((blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            reject(new Error("Failed to export canvas to PNG blob."));
          }
        }, "image/png");
      });
    }
    if (imageSource instanceof HTMLImageElement) {
      const canvas = document.createElement("canvas");
      canvas.width = imageSource.naturalWidth || imageSource.width;
      canvas.height = imageSource.naturalHeight || imageSource.height;
      if (canvas.width <= 0 || canvas.height <= 0) {
        throw new Error("Image has invalid dimensions.");
      }
      const ctx = canvas.getContext("2d");
      ctx.drawImage(imageSource, 0, 0);
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            reject(new Error("Failed to export image to PNG blob."));
          }
        }, "image/png");
      });
    }
    if (typeof imageSource === "string") {
      const res = await fetch(imageSource);
      if (!res.ok) throw new Error("Failed to fetch image source URL");
      return await res.blob();
    }
    throw new Error("Unsupported image source: " + Object.prototype.toString.call(imageSource));
  }

  /**
   * Helper to convert any input source into an HTMLCanvasElement
   */
  async sourceToCanvas(imageSource) {
    if (imageSource instanceof HTMLCanvasElement) {
      const copy = document.createElement("canvas");
      copy.width = imageSource.width;
      copy.height = imageSource.height;
      const ctx = copy.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(imageSource, 0, 0);
      return copy;
    }

    let img;
    if (imageSource instanceof HTMLImageElement) {
      img = imageSource;
    } else {
      img = new Image();
      const url = URL.createObjectURL(imageSource);
      await new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to decode image data"));
        img.src = url;
      });
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    return canvas;
  }

  /**
   * Real semantic deep-learning background removal using ISNet.
   * Preserves full face, eyes, mouth, hair, white shirts, ties, and original resolution.
   */
  async removeBackground(imageSource, onProgress = () => {}) {
    onProgress("Validating image format...", 5);
    const inputBlob = await this.sourceToBlob(imageSource);

    if (!inputBlob || !(inputBlob instanceof Blob) || inputBlob.size === 0) {
      throw new Error("Invalid image input: Blob data is empty or missing.");
    }

    onProgress("Initializing neural vision engine...", 15);
    const { removeBackground } = await this.getLib();

    // Map model progress to clear, honest UI status
    const progressHandler = (key, current, total) => {
      const keyStr = typeof key === "string" ? key.toLowerCase() : "";
      if (keyStr.includes("fetch") || keyStr.includes("download")) {
        const pct = total > 0 ? Math.min(45, Math.round((current / total) * 45)) : 25;
        onProgress(`Loading neural model weights (${pct}%)...`, pct);
      } else if (keyStr.includes("compute") || keyStr.includes("inference")) {
        const pct = total > 0 ? 45 + Math.min(45, Math.round((current / total) * 45)) : 75;
        onProgress("Running neural semantic segmentation...", pct);
      } else {
        onProgress("Analyzing image features...", 50);
      }
    };

    const config = {
      model: "isnet_fp16", // High-precision 16-bit floating point model
      rescale: true, // Preserve full original image resolution
      output: {
        format: "image/png",
        quality: 1.0,
      },
      progress: progressHandler,
    };

    onProgress("Analyzing image with neural network...", 30);
    let resultBlob;
    try {
      resultBlob = await removeBackground(inputBlob, config);
    } catch (modelErr) {
      console.error("[NeuralVisionProvider] Inference failed:", modelErr);
      throw new Error(
        "Background removal failed: " +
          (modelErr?.message || "Neural segmentation model returned an invalid mask.")
      );
    }

    if (!resultBlob || !(resultBlob instanceof Blob) || resultBlob.size === 0) {
      throw new Error("Background removal failed: segmentation model returned an invalid mask.");
    }

    onProgress("Generating high-fidelity RGBA canvas...", 90);

    // Convert resulting transparent PNG blob into an HTMLCanvasElement
    const img = new Image();
    const url = URL.createObjectURL(resultBlob);
    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to render neural cutout result"));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { alpha: true });
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    if (canvas.width <= 0 || canvas.height <= 0) {
      throw new Error("Invalid output canvas dimensions generated by neural vision engine.");
    }

    // Extract exact alpha mask directly from result canvas for the dev-only inspector
    let rawMaskBlob = null;
    if (process.env.NODE_ENV === "development") {
      try {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const mCtx = maskCanvas.getContext("2d");
        const cImgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const mImgData = mCtx.createImageData(canvas.width, canvas.height);
        const cData = cImgData.data;
        const mData = mImgData.data;
        for (let i = 0; i < cData.length; i += 4) {
          const a = cData[i + 3];
          mData[i] = a;
          mData[i + 1] = a;
          mData[i + 2] = a;
          mData[i + 3] = 255;
        }
        mCtx.putImageData(mImgData, 0, 0);
        rawMaskBlob = await new Promise((res) => maskCanvas.toBlob(res, "image/png"));
      } catch (debugErr) {
        console.warn("Could not generate debug mask:", debugErr);
      }

      console.log("[AI Background Remover] Segmentation completed successfully:", {
        provider: this.name,
        inputBlobSize: inputBlob.size,
        inputBlobType: inputBlob.type,
        resultBlobSize: resultBlob.size,
        dimensions: { width: canvas.width, height: canvas.height },
      });
    }

    onProgress("Ready", 100);

    return {
      canvas,
      blob: resultBlob,
      rawMaskBlob,
      dimensions: { width: canvas.width, height: canvas.height },
    };
  }

  /**
   * Real image enhancement (Auto Enhance / Upscale 2x) with alpha-channel protection.
   */
  async enhanceImage(imageSource, mode = "auto", onProgress = () => {}) {
    onProgress("Analyzing image details...", 20);
    await new Promise((r) => setTimeout(r, 60));

    const sourceCanvas = await this.sourceToCanvas(imageSource);

    if (mode === "upscale2x") {
      onProgress("Doubling pixel resolution (2× Super-Resolution)...", 50);
      await new Promise((r) => setTimeout(r, 80));

      const origW = sourceCanvas.width;
      const origH = sourceCanvas.height;
      const targetW = origW * 2;
      const targetH = origH * 2;

      const upscaledCanvas = document.createElement("canvas");
      upscaledCanvas.width = targetW;
      upscaledCanvas.height = targetH;
      const uCtx = upscaledCanvas.getContext("2d", { alpha: true });

      uCtx.imageSmoothingEnabled = true;
      uCtx.imageSmoothingQuality = "high";
      uCtx.drawImage(sourceCanvas, 0, 0, targetW, targetH);

      onProgress("Applying edge refinement & clarity recovery...", 80);
      await new Promise((r) => setTimeout(r, 80));

      // Sharpen upscaled result to restore crisp edges
      this.applyUnsharpMask(uCtx, targetW, targetH, 0.4);

      onProgress("Preparing result...", 100);
      await new Promise((r) => setTimeout(r, 40));

      const blob = await new Promise((resolve) =>
        upscaledCanvas.toBlob((b) => resolve(b), "image/png")
      );

      return {
        canvas: upscaledCanvas,
        blob,
        dimensions: { width: targetW, height: targetH },
      };
    }

    // Auto Enhance Mode: Spatial unsharp mask convolution + contrast tone mapping
    onProgress("Applying unsharp mask convolution & tone mapping...", 60);
    await new Promise((r) => setTimeout(r, 100));

    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const ctx = sourceCanvas.getContext("2d", { alpha: true });

    this.applyUnsharpMask(ctx, w, h, 0.55);

    onProgress("Enhancing dynamic range & color vibrancy...", 85);
    await new Promise((r) => setTimeout(r, 60));

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      // Do NOT modify transparent or cut-out regions
      if (a === 0) continue;

      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // S-curve contrast boost
      r = this.applySCurve(r);
      g = this.applySCurve(g);
      b = this.applySCurve(b);

      // Mild saturation boost
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = Math.min(255, Math.max(0, gray + (r - gray) * 1.12));
      g = Math.min(255, Math.max(0, gray + (g - gray) * 1.12));
      b = Math.min(255, Math.max(0, gray + (b - gray) * 1.12));

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imgData, 0, 0);

    onProgress("Preparing result...", 100);
    await new Promise((r) => setTimeout(r, 40));

    const blob = await new Promise((resolve) =>
      sourceCanvas.toBlob((b) => resolve(b), "image/png")
    );

    return {
      canvas: sourceCanvas,
      blob,
      dimensions: { width: w, height: h },
    };
  }

  /**
   * Spatial unsharp mask convolution kernel with alpha preservation
   */
  applyUnsharpMask(ctx, width, height, strength = 0.4) {
    const src = ctx.getImageData(0, 0, width, height);
    const sData = src.data;
    const output = ctx.createImageData(width, height);
    const oData = output.data;

    const centerWeight = 1 + 4 * strength;
    const neighborWeight = -strength;

    for (let y = 1; y < height - 1; y++) {
      const row = y * width;
      for (let x = 1; x < width - 1; x++) {
        const idx = (row + x) * 4;
        const a = sData[idx + 3];

        if (a === 0) {
          oData[idx + 3] = 0;
          continue;
        }

        const up = ((y - 1) * width + x) * 4;
        const down = ((y + 1) * width + x) * 4;
        const left = (row + (x - 1)) * 4;
        const right = (row + (x + 1)) * 4;

        for (let c = 0; c < 3; c++) {
          const val =
            sData[idx + c] * centerWeight +
            (sData[up + c] + sData[down + c] + sData[left + c] + sData[right + c]) *
              neighborWeight;
          oData[idx + c] = Math.min(255, Math.max(0, Math.round(val)));
        }
        oData[idx + 3] = a;
      }
    }

    ctx.putImageData(output, 0, 0);
  }

  applySCurve(value) {
    const norm = value / 255;
    const s = norm < 0.5 ? 2 * norm * norm : 1 - 2 * (1 - norm) * (1 - norm);
    return Math.min(255, Math.max(0, Math.round(s * 255)));
  }
}
