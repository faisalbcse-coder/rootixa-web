import { NeuralVisionProvider } from "./providers/neural-vision-provider";
import { ServerAPIProvider } from "./providers/server-api-provider";

class ImageProcessingService {
  constructor() {
    this.providers = {
      "neural-vision": new NeuralVisionProvider(),
      "server-api": new ServerAPIProvider(),
    };
    // Default to true in-browser neural segmentation (ISNet)
    this.activeProviderId = "neural-vision";
  }

  getProvider() {
    return this.providers[this.activeProviderId] || this.providers["neural-vision"];
  }

  setProvider(providerId) {
    if (this.providers[providerId]) {
      this.activeProviderId = providerId;
    }
  }

  getPrivacyStatement() {
    const provider = this.getProvider();
    if (provider.isLocal) {
      return "Your image is processed locally in your browser with 100% privacy.";
    }
    return "Your image is securely processed using AI.";
  }

  /**
   * Track AI operation counter locally
   */
  incrementUsageCount() {
    if (typeof window === "undefined") return;
    try {
      const current = parseInt(localStorage.getItem("rootixa_ai_ops") || "0", 10);
      localStorage.setItem("rootixa_ai_ops", (current + 1).toString());
    } catch {
      // Ignore localStorage errors in private browsing
    }
  }

  getUsageCount() {
    if (typeof window === "undefined") return 0;
    try {
      return parseInt(localStorage.getItem("rootixa_ai_ops") || "0", 10);
    } catch {
      return 0;
    }
  }

  async removeBackground(imageSource, onProgress = () => {}) {
    const provider = this.getProvider();
    const result = await provider.removeBackground(imageSource, onProgress);
    this.incrementUsageCount();
    return result;
  }

  async enhanceImage(imageSource, mode = "auto", onProgress = () => {}) {
    const provider = this.getProvider();
    const result = await provider.enhanceImage(imageSource, mode, onProgress);
    this.incrementUsageCount();
    return result;
  }
}

// Export singleton instance
export const imageProcessingService = new ImageProcessingService();
