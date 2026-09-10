/**
 * Barcode Data Validation & Check Digit Engine
 * Follows GS1 and ISO standards for Modulo 10 checksums and character sets.
 */

/**
 * Calculate standard GS1 Modulo 10 check digit
 *
 * @param {'EAN13' | 'EAN8' | 'UPC' | 'ITF14'} formatId
 * @param {string} digits - Numeric string (without check digit)
 * @returns {number | null} - The single check digit (0-9) or null if invalid
 */
export function calculateCheckDigit(formatId, digits) {
  if (!digits || !/^\d+$/.test(digits)) return null;

  const len = digits.length;
  let sum = 0;

  if (formatId === "EAN13" && len === 12) {
    // 1-indexed: odd positions (1,3,5,7,9,11) have weight 1, even positions (2,4,6,8,10,12) have weight 3
    for (let i = 0; i < 12; i++) {
      const num = parseInt(digits[i], 10);
      sum += (i % 2 === 0) ? num * 1 : num * 3;
    }
  } else if (formatId === "EAN8" && len === 7) {
    // 1-indexed: odd positions have weight 3, even positions have weight 1
    for (let i = 0; i < 7; i++) {
      const num = parseInt(digits[i], 10);
      sum += (i % 2 === 0) ? num * 3 : num * 1;
    }
  } else if (formatId === "UPC" && len === 11) {
    // 1-indexed: odd positions (1,3,5,7,9,11) have weight 3, even positions (2,4,6,8,10) have weight 1
    for (let i = 0; i < 11; i++) {
      const num = parseInt(digits[i], 10);
      sum += (i % 2 === 0) ? num * 3 : num * 1;
    }
  } else if (formatId === "ITF14" && len === 13) {
    // 1-indexed: odd positions have weight 3, even positions have weight 1
    for (let i = 0; i < 13; i++) {
      const num = parseInt(digits[i], 10);
      sum += (i % 2 === 0) ? num * 3 : num * 1;
    }
  } else {
    return null;
  }

  const remainder = sum % 10;
  return (10 - remainder) % 10;
}

/**
 * Real-time validator for barcode input data
 *
 * @param {string} formatId - e.g. 'CODE128', 'CODE39', 'EAN13', 'EAN8', 'UPC', 'ITF14', 'codabar'
 * @param {string} rawInput - User entered text
 * @param {boolean} autoCheckDigit - Whether to auto-append/correct check digit if base length is provided
 * @returns {Object} { isValid: boolean, error?: string, message?: string, finalData: string, computedCheckDigit?: number }
 */
export function validateBarcodeData(formatId, rawInput, autoCheckDigit = true) {
  const input = (rawInput || "").trim();

  if (!input) {
    return {
      isValid: false,
      error: "Barcode data cannot be empty.",
      finalData: "",
    };
  }

  switch (formatId) {
    case "CODE128": {
      // Code 128 accepts standard ASCII (0-127)
      const nonAscii = /[^\x00-\x7F]/;
      if (nonAscii.test(input)) {
        return {
          isValid: false,
          error: "Code 128 only supports standard ASCII characters.",
          finalData: input,
        };
      }
      return {
        isValid: true,
        message: "Valid Code 128 alphanumeric data",
        finalData: input,
      };
    }

    case "CODE39": {
      // Code 39 supports: 0-9, A-Z, space, -, ., $, /, +, %
      const upper = input.toUpperCase();
      const code39Regex = /^[0-9A-Z\-\.\ \$\/\+\%]+$/;
      if (!code39Regex.test(upper)) {
        return {
          isValid: false,
          error: "Code 39 only supports uppercase letters, digits, and symbols (- . $ / + % space).",
          finalData: upper,
        };
      }
      return {
        isValid: true,
        message: "Valid Code 39 industrial data",
        finalData: upper,
      };
    }

    case "EAN13": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "EAN-13 requires numeric digits only.",
          finalData: input,
        };
      }

      if (input.length === 12) {
        const cd = calculateCheckDigit("EAN13", input);
        const completeData = autoCheckDigit ? `${input}${cd}` : input;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "EAN-13 requires 13 digits (12 base + 1 check digit).",
          message: `Check digit ${cd} automatically generated`,
          finalData: completeData,
          computedCheckDigit: cd,
        };
      }

      if (input.length === 13) {
        const base = input.slice(0, 12);
        const providedCd = parseInt(input.slice(12), 10);
        const expectedCd = calculateCheckDigit("EAN13", base);

        if (providedCd !== expectedCd) {
          if (autoCheckDigit) {
            return {
              isValid: true,
              message: `Check digit corrected to ${expectedCd}`,
              finalData: `${base}${expectedCd}`,
              computedCheckDigit: expectedCd,
            };
          }
          return {
            isValid: false,
            error: `Invalid check digit (${providedCd}). Expected ${expectedCd}.`,
            finalData: input,
          };
        }

        return {
          isValid: true,
          message: "Valid EAN-13 retail barcode data",
          finalData: input,
          computedCheckDigit: expectedCd,
        };
      }

      return {
        isValid: false,
        error: `EAN-13 requires 12 or 13 digits. Current length: ${input.length}.`,
        finalData: input,
      };
    }

    case "EAN8": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "EAN-8 requires numeric digits only.",
          finalData: input,
        };
      }

      if (input.length === 7) {
        const cd = calculateCheckDigit("EAN8", input);
        const completeData = autoCheckDigit ? `${input}${cd}` : input;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "EAN-8 requires 8 digits (7 base + 1 check digit).",
          message: `Check digit ${cd} automatically generated`,
          finalData: completeData,
          computedCheckDigit: cd,
        };
      }

      if (input.length === 8) {
        const base = input.slice(0, 7);
        const providedCd = parseInt(input.slice(7), 10);
        const expectedCd = calculateCheckDigit("EAN8", base);

        if (providedCd !== expectedCd) {
          if (autoCheckDigit) {
            return {
              isValid: true,
              message: `Check digit corrected to ${expectedCd}`,
              finalData: `${base}${expectedCd}`,
              computedCheckDigit: expectedCd,
            };
          }
          return {
            isValid: false,
            error: `Invalid check digit (${providedCd}). Expected ${expectedCd}.`,
            finalData: input,
          };
        }

        return {
          isValid: true,
          message: "Valid EAN-8 compact retail data",
          finalData: input,
          computedCheckDigit: expectedCd,
        };
      }

      return {
        isValid: false,
        error: `EAN-8 requires 7 or 8 digits. Current length: ${input.length}.`,
        finalData: input,
      };
    }

    case "UPC": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "UPC-A requires numeric digits only.",
          finalData: input,
        };
      }

      if (input.length === 11) {
        const cd = calculateCheckDigit("UPC", input);
        const completeData = autoCheckDigit ? `${input}${cd}` : input;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "UPC-A requires 12 digits (11 base + 1 check digit).",
          message: `Check digit ${cd} automatically generated`,
          finalData: completeData,
          computedCheckDigit: cd,
        };
      }

      if (input.length === 12) {
        const base = input.slice(0, 11);
        const providedCd = parseInt(input.slice(11), 10);
        const expectedCd = calculateCheckDigit("UPC", base);

        if (providedCd !== expectedCd) {
          if (autoCheckDigit) {
            return {
              isValid: true,
              message: `Check digit corrected to ${expectedCd}`,
              finalData: `${base}${expectedCd}`,
              computedCheckDigit: expectedCd,
            };
          }
          return {
            isValid: false,
            error: `Invalid check digit (${providedCd}). Expected ${expectedCd}.`,
            finalData: input,
          };
        }

        return {
          isValid: true,
          message: "Valid UPC-A retail data",
          finalData: input,
          computedCheckDigit: expectedCd,
        };
      }

      return {
        isValid: false,
        error: `UPC-A requires 11 or 12 digits. Current length: ${input.length}.`,
        finalData: input,
      };
    }

    case "ITF14": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "ITF-14 requires numeric digits only.",
          finalData: input,
        };
      }

      if (input.length === 13) {
        const cd = calculateCheckDigit("ITF14", input);
        const completeData = autoCheckDigit ? `${input}${cd}` : input;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "ITF-14 requires 14 digits (13 base + 1 check digit).",
          message: `Check digit ${cd} automatically generated`,
          finalData: completeData,
          computedCheckDigit: cd,
        };
      }

      if (input.length === 14) {
        const base = input.slice(0, 13);
        const providedCd = parseInt(input.slice(13), 10);
        const expectedCd = calculateCheckDigit("ITF14", base);

        if (providedCd !== expectedCd) {
          if (autoCheckDigit) {
            return {
              isValid: true,
              message: `Check digit corrected to ${expectedCd}`,
              finalData: `${base}${expectedCd}`,
              computedCheckDigit: expectedCd,
            };
          }
          return {
            isValid: false,
            error: `Invalid check digit (${providedCd}). Expected ${expectedCd}.`,
            finalData: input,
          };
        }

        return {
          isValid: true,
          message: "Valid ITF-14 logistics data",
          finalData: input,
          computedCheckDigit: expectedCd,
        };
      }

      return {
        isValid: false,
        error: `ITF-14 requires 13 or 14 digits. Current length: ${input.length}.`,
        finalData: input,
      };
    }

    case "codabar": {
      const upper = input.toUpperCase();
      // Codabar framing characters can be A, B, C, D at start and end. Body is digits and - $ : / . +
      const codabarRegex = /^[A-D]?[0-9\-\$\:\/\.\+]+[A-D]?$/;
      if (!codabarRegex.test(upper)) {
        return {
          isValid: false,
          error: "Codabar only supports digits, symbols (- $ : / . +) and start/stop letters A, B, C, D.",
          finalData: upper,
        };
      }
      return {
        isValid: true,
        message: "Valid Codabar format",
        finalData: upper,
      };
    }

    default:
      return {
        isValid: true,
        finalData: input,
      };
  }
}

/**
 * Relative luminance for WCAG contrast calculation
 */
function getRelativeLuminance(hexColor) {
  let hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/**
 * Calculate contrast ratio between barcode and background
 */
export function calculateContrastRatio(fgHex, bgHex) {
  try {
    const l1 = getRelativeLuminance(fgHex);
    const l2 = getRelativeLuminance(bgHex);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  } catch {
    return 21; // Default safe assumption
  }
}

/**
 * Assess barcode scanning quality based on settings and data
 */
export function assessBarcodeQuality({
  isValid,
  lineColor = "#000000",
  background = "#FFFFFF",
  margin = 15,
  width = 2,
  height = 80,
}) {
  const contrast = calculateContrastRatio(lineColor, background);
  const issues = [];
  const checks = [];

  // Check 1: Valid format
  if (isValid) {
    checks.push({ label: "Valid barcode standard", passed: true });
  } else {
    issues.push("Invalid barcode data or length for selected standard");
    checks.push({ label: "Valid barcode standard", passed: false });
  }

  // Check 2: Contrast
  if (contrast >= 7.0) {
    checks.push({ label: `Excellent contrast (${contrast.toFixed(1)}:1)`, passed: true });
  } else if (contrast >= 4.5) {
    checks.push({ label: `Acceptable contrast (${contrast.toFixed(1)}:1)`, passed: true });
  } else {
    issues.push("Contrast is too low for optical laser/camera scanners. Consider darker bars or lighter background.");
    checks.push({ label: `Low contrast (${contrast.toFixed(1)}:1)`, passed: false });
  }

  // Check 3: Quiet zone
  if (margin >= 12) {
    checks.push({ label: "Sufficient quiet zone margins", passed: true });
  } else {
    issues.push("Quiet zone margin is tight; barcode scanners need clear white space around edges.");
    checks.push({ label: "Tight quiet zone", passed: false });
  }

  // Check 4: Dimensions
  if (height >= 50 && width >= 1.5) {
    checks.push({ label: "Readable aspect ratio & bar width", passed: true });
  } else {
    issues.push("Barcode height or bar width is low; may be difficult to scan on mobile or low-res cameras.");
    checks.push({ label: "Sub-optimal dimensions", passed: false });
  }

  const isReliable = isValid && contrast >= 4.5 && margin >= 10 && height >= 45;

  return {
    isReliable,
    contrastRatio: contrast,
    status: isReliable ? "excellent" : issues.length <= 1 ? "warning" : "unsafe",
    label: isReliable ? "Good Readability Conditions" : "Readability Issues Detected",
    summary: isReliable
      ? "Designed for reliable scanning across modern laser and camera readers."
      : issues[0] || "Check configuration settings for optimal scannability.",
    checks,
    issues,
  };
}
