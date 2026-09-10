/**
 * Base AI Provider Interface.
 * Allows switching between local in-browser execution and cloud/server APIs.
 */

export class BaseAIProvider {
  constructor(id, name, isLocal = true) {
    this.id = id;
    this.name = name;
    this.isLocal = isLocal;
  }

  /**
   * Remove background from image.
   * @param {HTMLImageElement|HTMLCanvasElement|Blob|File} imageSource
   * @param {Function} onProgress - (stepName, percentage) => void
   * @returns {Promise<{ canvas: HTMLCanvasElement, blob: Blob, dimensions: { width: number, height: number } }>}
   */
  async removeBackground(imageSource, onProgress = () => {}) {
    throw new Error("removeBackground must be implemented by subclass");
  }

  /**
   * Enhance image quality.
   * @param {HTMLImageElement|HTMLCanvasElement|Blob|File} imageSource
   * @param {'auto'|'upscale2x'} mode
   * @param {Function} onProgress - (stepName, percentage) => void
   * @returns {Promise<{ canvas: HTMLCanvasElement, blob: Blob, dimensions: { width: number, height: number } }>}
   */
  async enhanceImage(imageSource, mode = "auto", onProgress = () => {}) {
    throw new Error("enhanceImage must be implemented by subclass");
  }
}
