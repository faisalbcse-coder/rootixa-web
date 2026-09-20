/**
 * Barcode Data Validation & Check Digit Engine for Rootixa Barcode Studio
 * Implements ISO/IEC and GS1 standard checksums, character set validation, and AI parsing.
 */

// FNC1 separator character for GS1-128 variable-length fields
export const FNC1_CHAR = String.fromCharCode(207);

/**
 * Common GS1 Application Identifiers specification
 */
export const GS1_AI_SPEC = {
  "00": { name: "SSCC", length: 18, fixed: true, numeric: true, desc: "Serial Shipping Container Code" },
  "01": { name: "GTIN", length: 14, fixed: true, numeric: true, isGtin: true, desc: "Global Trade Item Number" },
  "02": { name: "Content GTIN", length: 14, fixed: true, numeric: true, desc: "GTIN of contained trade items" },
  "10": { name: "Batch / Lot", minLength: 1, maxLength: 20, fixed: false, numeric: false, desc: "Batch or lot number" },
  "11": { name: "Production Date", length: 6, fixed: true, numeric: true, isDate: true, desc: "Production date (YYMMDD)" },
  "12": { name: "Due Date", length: 6, fixed: true, numeric: true, isDate: true, desc: "Due date (YYMMDD)" },
  "13": { name: "Packaging Date", length: 6, fixed: true, numeric: true, isDate: true, desc: "Packaging date (YYMMDD)" },
  "15": { name: "Best Before", length: 6, fixed: true, numeric: true, isDate: true, desc: "Best before date (YYMMDD)" },
  "17": { name: "Expiration Date", length: 6, fixed: true, numeric: true, isDate: true, desc: "Expiration date (YYMMDD)" },
  "20": { name: "Internal Variant", length: 2, fixed: true, numeric: true, desc: "Internal product variant" },
  "21": { name: "Serial Number", minLength: 1, maxLength: 20, fixed: false, numeric: false, desc: "Serial number" },
  "30": { name: "Quantity", minLength: 1, maxLength: 8, fixed: false, numeric: true, desc: "Variable count or quantity" },
  "37": { name: "Number of Units", minLength: 1, maxLength: 8, fixed: false, numeric: true, desc: "Number of units contained" },
  "400": { name: "Customer PO", minLength: 1, maxLength: 30, fixed: false, numeric: false, desc: "Customer purchase order" },
  "410": { name: "Ship-to GLN", length: 13, fixed: true, numeric: true, desc: "Ship-to Global Location Number" },
  "420": { name: "Postal Code", minLength: 1, maxLength: 20, fixed: false, numeric: false, desc: "Ship-to postal code" },
};

/**
 * Calculate standard GS1 Modulo 10 check digit
 *
 * @param {'EAN13' | 'EAN8' | 'UPC' | 'ITF14' | 'GTIN14'} formatId
 * @param {string} digits - Numeric string without check digit
 * @returns {number | null} - Check digit (0-9) or null
 */
export function calculateCheckDigit(formatId, digits) {
  if (!digits || !/^\d+$/.test(digits)) return null;

  const len = digits.length;
  let sum = 0;

  if (formatId === "EAN13" && len === 12) {
    // Odd positions (1,3,5...) weight 1, Even positions (2,4,6...) weight 3
    for (let i = 0; i < 12; i++) {
      const num = parseInt(digits[i], 10);
      sum += i % 2 === 0 ? num * 1 : num * 3;
    }
  } else if (formatId === "EAN8" && len === 7) {
    // Odd positions weight 3, Even positions weight 1
    for (let i = 0; i < 7; i++) {
      const num = parseInt(digits[i], 10);
      sum += i % 2 === 0 ? num * 3 : num * 1;
    }
  } else if (formatId === "UPC" && len === 11) {
    // Odd positions weight 3, Even positions weight 1
    for (let i = 0; i < 11; i++) {
      const num = parseInt(digits[i], 10);
      sum += i % 2 === 0 ? num * 3 : num * 1;
    }
  } else if (formatId === "ITF14" && len === 13) {
    // Odd positions weight 3, Even positions weight 1
    for (let i = 0; i < 13; i++) {
      const num = parseInt(digits[i], 10);
      sum += i % 2 === 0 ? num * 3 : num * 1;
    }
  } else if (formatId === "GTIN14" && len === 13) {
    // 13 digits for 14-digit GTIN
    for (let i = 0; i < 13; i++) {
      const num = parseInt(digits[i], 10);
      sum += i % 2 === 0 ? num * 3 : num * 1;
    }
  } else {
    return null;
  }

  const remainder = sum % 10;
  return (10 - remainder) % 10;
}

/**
 * UPC-E Zero-Suppression Expansion to 11-digit UPC-A Base
 * Based on official GS1 / UPC-E expansion specifications.
 *
 * @param {string} middleDigits - 6 digits
 * @param {string} numberSystem - '0' or '1' (default '0')
 * @returns {{ baseUpcA: string, checkDigit: number, fullUpcA: string } | null}
 */
export function expandUpcEToUpcA(middleDigits, numberSystem = "0") {
  if (!middleDigits || middleDigits.length !== 6 || !/^\d{6}$/.test(middleDigits)) {
    return null;
  }

  const EXPANSIONS = [
    "XX00000XXX",
    "XX10000XXX",
    "XX20000XXX",
    "XXX00000XX",
    "XXXX00000X",
    "XXXXX00005",
    "XXXXX00006",
    "XXXXX00007",
    "XXXXX00008",
    "XXXXX00009",
  ];

  const lastDigit = parseInt(middleDigits[5], 10);
  const pattern = EXPANSIONS[lastDigit];
  if (!pattern) return null;

  let result = "";
  let digitIndex = 0;
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i];
    if (c === "X") {
      result += middleDigits[digitIndex++];
    } else {
      result += c;
    }
  }

  const baseUpcA = `${numberSystem}${result}`;
  const cd = calculateCheckDigit("UPC", baseUpcA);
  return {
    baseUpcA,
    checkDigit: cd,
    fullUpcA: `${baseUpcA}${cd}`,
  };
}

/**
 * Validate Date in YYMMDD format
 */
export function isValidGs1Date(yymmdd) {
  if (!/^\d{6}$/.test(yymmdd)) return false;
  const month = parseInt(yymmdd.substring(2, 4), 10);
  const day = parseInt(yymmdd.substring(4, 6), 10);
  if (month < 1 || month > 12) return false;
  // Day can be 00 (meaning end of month in GS1) or 01..31
  if (day < 0 || day > 31) return false;
  return true;
}

/**
 * Parse and Validate GS1-128 formatted input string
 * e.g. "(01)01234567890128(17)261231(10)LOT123"
 */
export function parseAndValidateGs1(input) {
  const trimmed = (input || "").trim();
  if (!trimmed) {
    return {
      isValid: false,
      error: "GS1-128 data cannot be empty.",
      finalData: "",
      displayText: "",
    };
  }

  // Must contain at least one parenthesized Application Identifier e.g. (01)
  const aiRegex = /\((\d{2,4})\)([^()]+)/g;
  const matches = [...trimmed.matchAll(aiRegex)];

  if (matches.length === 0) {
    // If entered without parentheses, provide actionable guidance
    return {
      isValid: false,
      error: "Format required: Enter Application Identifiers in parentheses, e.g. (01)01234567890128(17)261231(10)LOT123",
      finalData: trimmed,
      displayText: trimmed,
    };
  }

  let encodedData = "";
  let formattedText = "";
  const elements = [];

  for (let i = 0; i < matches.length; i++) {
    const ai = matches[i][1];
    const val = matches[i][2].trim();
    const spec = GS1_AI_SPEC[ai];
    const isLast = i === matches.length - 1;

    if (!val) {
      return {
        isValid: false,
        error: `AI (${ai}) value is missing. Enter data after (${ai}).`,
        finalData: trimmed,
        displayText: trimmed,
      };
    }

    if (spec) {
      // Check numeric requirement
      if (spec.numeric && !/^\d+$/.test(val)) {
        return {
          isValid: false,
          error: `AI (${ai}) ${spec.name} requires numeric digits only. Found: "${val}".`,
          finalData: trimmed,
          displayText: trimmed,
        };
      }

      // Check fixed length
      if (spec.fixed && val.length !== spec.length) {
        return {
          isValid: false,
          error: `AI (${ai}) ${spec.name} requires exactly ${spec.length} digits. Currently: ${val.length}.`,
          finalData: trimmed,
          displayText: trimmed,
        };
      }

      // Check min/max length for variable fields
      if (!spec.fixed) {
        if (val.length < (spec.minLength || 1) || val.length > (spec.maxLength || 30)) {
          return {
            isValid: false,
            error: `AI (${ai}) ${spec.name} must be between ${spec.minLength || 1} and ${spec.maxLength || 30} characters. Current length: ${val.length}.`,
            finalData: trimmed,
            displayText: trimmed,
          };
        }
      }

      // Check GTIN checksum if applicable
      if (spec.isGtin && val.length === 14) {
        const base13 = val.substring(0, 13);
        const expectedCd = calculateCheckDigit("GTIN14", base13);
        const actualCd = parseInt(val[13], 10);
        if (actualCd !== expectedCd) {
          return {
            isValid: false,
            error: `AI (${ai}) GTIN check digit is invalid (${actualCd}). Expected ${expectedCd}.`,
            suggestedFix: trimmed.replace(new RegExp(`\\(${ai}\\)${val}`), `(${ai})${base13}${expectedCd}`),
            finalData: trimmed,
            displayText: trimmed,
          };
        }
      }

      // Check Date validity if applicable
      if (spec.isDate) {
        if (!isValidGs1Date(val)) {
          return {
            isValid: false,
            error: `AI (${ai}) ${spec.name} requires valid date in YYMMDD format. Found: "${val}".`,
            finalData: trimmed,
            displayText: trimmed,
          };
        }
      }
    } else {
      // Unknown AI: allow alphanumeric between 1 and 30 chars
      if (val.length < 1 || val.length > 30) {
        return {
          isValid: false,
          error: `AI (${ai}) value length must be 1–30 characters.`,
          finalData: trimmed,
          displayText: trimmed,
        };
      }
    }

    elements.push({ ai, value: val, name: spec?.name || `AI ${ai}` });
    formattedText += `(${ai})${val}`;

    // Append AI and data to encoded string
    encodedData += `${ai}${val}`;

    // Variable length fields (not fixed) require FNC1 separator when followed by another element
    const isVariable = spec ? !spec.fixed : true;
    if (isVariable && !isLast) {
      encodedData += FNC1_CHAR;
    }
  }

  return {
    isValid: true,
    message: `✓ Valid GS1-128 standard (${elements.length} AI element${elements.length > 1 ? "s" : ""})`,
    finalData: encodedData,
    displayText: formattedText,
    isGs1: true,
    elements,
  };
}

/**
 * Real-time validator for barcode input data
 *
 * @param {string} formatId - Format ID
 * @param {string} rawInput - User entered text
 * @param {boolean} autoCheckDigit - Auto-correct/generate check digit if base length is entered
 * @returns {Object} Validation summary
 */
export function validateBarcodeData(formatId, rawInput, autoCheckDigit = true) {
  const input = (rawInput || "").trim();

  if (!input) {
    return {
      isValid: false,
      error: "Barcode value cannot be empty.",
      finalData: "",
      displayText: "",
    };
  }

  switch (formatId) {
    case "CODE128": {
      // Code 128 accepts standard ASCII (0-127)
      for (let i = 0; i < input.length; i++) {
        const code = input.charCodeAt(i);
        if (code > 127) {
          return {
            isValid: false,
            error: `Character "${input[i]}" is not standard ASCII (Code 128 supports ASCII 0–127).`,
            finalData: input,
            displayText: input,
          };
        }
      }
      return {
        isValid: true,
        message: "✓ Valid Code 128 alphanumeric data",
        finalData: input,
        displayText: input,
      };
    }

    case "CODE39": {
      // Code 39 supports: 0-9, A-Z, space, -, ., $, /, +, %
      const upper = input.toUpperCase();
      const invalidChars = [];
      const code39Regex = /^[0-9A-Z\-\.\ \$\/\+\%]+$/;

      for (let i = 0; i < upper.length; i++) {
        const ch = upper[i];
        if (!code39Regex.test(ch) && !invalidChars.includes(ch)) {
          invalidChars.push(ch);
        }
      }

      if (invalidChars.length > 0) {
        return {
          isValid: false,
          error: `Code 39 does not allow "${invalidChars.join(", ")}". Only uppercase letters, digits, and symbols (- . $ / + % space) are allowed.`,
          finalData: upper,
          displayText: upper,
        };
      }

      return {
        isValid: true,
        message: "✓ Valid Code 39 industrial data",
        finalData: upper,
        displayText: upper,
      };
    }

    case "EAN13": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "EAN-13 requires numeric digits only (0–9). Remove non-numeric characters.",
          finalData: input,
          displayText: input,
        };
      }

      if (input.length < 12) {
        return {
          isValid: false,
          error: `EAN-13 requires 12 data digits (or 13 with checksum). Currently entered: ${input.length} digit${input.length === 1 ? "" : "s"}.`,
          finalData: input,
          displayText: input,
        };
      }

      if (input.length === 12) {
        const cd = calculateCheckDigit("EAN13", input);
        const completeData = autoCheckDigit ? `${input}${cd}` : input;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "EAN-13 requires 13 digits (12 data digits + 1 check digit).",
          message: `✓ Check digit (${cd}) calculated automatically (Modulo 10)`,
          finalData: completeData,
          displayText: completeData,
          computedCheckDigit: cd,
          suggestedFix: `${input}${cd}`,
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
              message: `✓ Check digit corrected from ${providedCd} to ${expectedCd}`,
              finalData: `${base}${expectedCd}`,
              displayText: `${base}${expectedCd}`,
              computedCheckDigit: expectedCd,
              expectedCheckDigit: expectedCd,
              suggestedFix: `${base}${expectedCd}`,
            };
          }
          return {
            isValid: false,
            error: `Invalid EAN-13 check digit: entered "${providedCd}", expected "${expectedCd}".`,
            finalData: input,
            displayText: input,
            computedCheckDigit: expectedCd,
            expectedCheckDigit: expectedCd,
            suggestedFix: `${base}${expectedCd}`,
          };
        }

        return {
          isValid: true,
          message: "✓ Valid EAN-13 retail barcode data with verified check digit",
          finalData: input,
          displayText: input,
          computedCheckDigit: expectedCd,
        };
      }

      return {
        isValid: false,
        error: `EAN-13 cannot exceed 13 digits. Currently entered: ${input.length} digits.`,
        finalData: input,
        displayText: input,
      };
    }

    case "EAN8": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "EAN-8 requires numeric digits only (0–9).",
          finalData: input,
          displayText: input,
        };
      }

      if (input.length < 7) {
        return {
          isValid: false,
          error: `EAN-8 requires 7 data digits (or 8 with checksum). Currently entered: ${input.length} digits.`,
          finalData: input,
          displayText: input,
        };
      }

      if (input.length === 7) {
        const cd = calculateCheckDigit("EAN8", input);
        const completeData = autoCheckDigit ? `${input}${cd}` : input;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "EAN-8 requires 8 digits (7 data digits + 1 check digit).",
          message: `✓ Check digit (${cd}) calculated automatically (Modulo 10)`,
          finalData: completeData,
          displayText: completeData,
          computedCheckDigit: cd,
          suggestedFix: `${input}${cd}`,
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
              message: `✓ Check digit corrected from ${providedCd} to ${expectedCd}`,
              finalData: `${base}${expectedCd}`,
              displayText: `${base}${expectedCd}`,
              computedCheckDigit: expectedCd,
              expectedCheckDigit: expectedCd,
              suggestedFix: `${base}${expectedCd}`,
            };
          }
          return {
            isValid: false,
            error: `Invalid EAN-8 check digit: entered "${providedCd}", expected "${expectedCd}".`,
            finalData: input,
            displayText: input,
            computedCheckDigit: expectedCd,
            expectedCheckDigit: expectedCd,
            suggestedFix: `${base}${expectedCd}`,
          };
        }

        return {
          isValid: true,
          message: "✓ Valid EAN-8 compact retail data with verified check digit",
          finalData: input,
          displayText: input,
          computedCheckDigit: expectedCd,
        };
      }

      return {
        isValid: false,
        error: `EAN-8 cannot exceed 8 digits. Currently entered: ${input.length} digits.`,
        finalData: input,
        displayText: input,
      };
    }

    case "UPC": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "UPC-A requires numeric digits only (0–9).",
          finalData: input,
          displayText: input,
        };
      }

      if (input.length < 11) {
        return {
          isValid: false,
          error: `UPC-A requires 11 data digits (or 12 with checksum). Currently entered: ${input.length} digits.`,
          finalData: input,
          displayText: input,
        };
      }

      if (input.length === 11) {
        const cd = calculateCheckDigit("UPC", input);
        const completeData = autoCheckDigit ? `${input}${cd}` : input;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "UPC-A requires 12 digits (11 data digits + 1 check digit).",
          message: `✓ Check digit (${cd}) calculated automatically (Modulo 10)`,
          finalData: completeData,
          displayText: completeData,
          computedCheckDigit: cd,
          suggestedFix: `${input}${cd}`,
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
              message: `✓ Check digit corrected from ${providedCd} to ${expectedCd}`,
              finalData: `${base}${expectedCd}`,
              displayText: `${base}${expectedCd}`,
              computedCheckDigit: expectedCd,
              expectedCheckDigit: expectedCd,
              suggestedFix: `${base}${expectedCd}`,
            };
          }
          return {
            isValid: false,
            error: `Invalid UPC-A check digit: entered "${providedCd}", expected "${expectedCd}".`,
            finalData: input,
            displayText: input,
            computedCheckDigit: expectedCd,
            expectedCheckDigit: expectedCd,
            suggestedFix: `${base}${expectedCd}`,
          };
        }

        return {
          isValid: true,
          message: "✓ Valid UPC-A retail data with verified check digit",
          finalData: input,
          displayText: input,
          computedCheckDigit: expectedCd,
        };
      }

      return {
        isValid: false,
        error: `UPC-A cannot exceed 12 digits. Currently entered: ${input.length} digits.`,
        finalData: input,
        displayText: input,
      };
    }

    case "UPCE": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "UPC-E requires numeric digits only (0–9).",
          finalData: input,
          displayText: input,
        };
      }

      if (input.length === 6) {
        // 6 compressed digits
        const expansion = expandUpcEToUpcA(input, "0");
        if (!expansion) {
          return {
            isValid: false,
            error: "Invalid 6-digit UPC-E pattern.",
            finalData: input,
            displayText: input,
          };
        }

        // Full 8-digit representation: number system 0 + 6 digits + check digit
        const full8 = `0${input}${expansion.checkDigit}`;
        return {
          isValid: true,
          message: `✓ Valid 6-digit UPC-E (Calculated check digit: ${expansion.checkDigit})`,
          finalData: input,
          displayText: full8,
          computedCheckDigit: expansion.checkDigit,
          expandedUpcA: expansion.fullUpcA,
        };
      }

      if (input.length === 7) {
        // 7 digits: e.g. number system 0/1 + 6 compressed digits
        const numSys = input[0];
        if (numSys !== "0" && numSys !== "1") {
          return {
            isValid: false,
            error: "UPC-E number system digit must be 0 or 1.",
            finalData: input,
            displayText: input,
          };
        }
        const middle6 = input.substring(1);
        const expansion = expandUpcEToUpcA(middle6, numSys);
        const full8 = `${input}${expansion.checkDigit}`;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "UPC-E requires 8 digits (or 6 compressed digits).",
          message: `✓ Check digit (${expansion.checkDigit}) calculated automatically`,
          finalData: full8,
          displayText: full8,
          computedCheckDigit: expansion.checkDigit,
          suggestedFix: full8,
          expandedUpcA: expansion.fullUpcA,
        };
      }

      if (input.length === 8) {
        const numSys = input[0];
        if (numSys !== "0" && numSys !== "1") {
          return {
            isValid: false,
            error: `UPC-E must start with number system 0 or 1. Currently starts with "${numSys}".`,
            finalData: input,
            displayText: input,
          };
        }

        const middle6 = input.substring(1, 7);
        const providedCd = parseInt(input[7], 10);
        const expansion = expandUpcEToUpcA(middle6, numSys);

        if (!expansion) {
          return {
            isValid: false,
            error: "Invalid UPC-E middle digits compression structure.",
            finalData: input,
            displayText: input,
          };
        }

        if (providedCd !== expansion.checkDigit) {
          const fixed8 = `${numSys}${middle6}${expansion.checkDigit}`;
          if (autoCheckDigit) {
            return {
              isValid: true,
              message: `✓ Check digit corrected from ${providedCd} to ${expansion.checkDigit}`,
              finalData: fixed8,
              displayText: fixed8,
              computedCheckDigit: expansion.checkDigit,
              expectedCheckDigit: expansion.checkDigit,
              suggestedFix: fixed8,
              expandedUpcA: expansion.fullUpcA,
            };
          }
          return {
            isValid: false,
            error: `Invalid UPC-E check digit: entered "${providedCd}", expected "${expansion.checkDigit}".`,
            finalData: input,
            displayText: input,
            computedCheckDigit: expansion.checkDigit,
            expectedCheckDigit: expansion.checkDigit,
            suggestedFix: fixed8,
            expandedUpcA: expansion.fullUpcA,
          };
        }

        return {
          isValid: true,
          message: "✓ Valid 8-digit UPC-E retail barcode",
          finalData: input,
          displayText: input,
          computedCheckDigit: expansion.checkDigit,
          expandedUpcA: expansion.fullUpcA,
        };
      }

      return {
        isValid: false,
        error: `UPC-E requires either 6 compressed digits or 8 digits (number system 0/1 + 6 digits + check digit). Entered: ${input.length}.`,
        finalData: input,
        displayText: input,
      };
    }

    case "ITF14": {
      if (!/^\d+$/.test(input)) {
        return {
          isValid: false,
          error: "ITF-14 requires numeric digits only (0–9).",
          finalData: input,
          displayText: input,
        };
      }

      if (input.length < 13) {
        return {
          isValid: false,
          error: `ITF-14 requires 13 data digits (or 14 with checksum). Currently entered: ${input.length} digits.`,
          finalData: input,
          displayText: input,
        };
      }

      if (input.length === 13) {
        const cd = calculateCheckDigit("ITF14", input);
        const completeData = autoCheckDigit ? `${input}${cd}` : input;
        return {
          isValid: autoCheckDigit,
          error: autoCheckDigit ? undefined : "ITF-14 requires 14 digits (13 data digits + 1 check digit).",
          message: `✓ Check digit (${cd}) calculated automatically (Modulo 10)`,
          finalData: completeData,
          displayText: completeData,
          computedCheckDigit: cd,
          suggestedFix: `${input}${cd}`,
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
              message: `✓ Check digit corrected from ${providedCd} to ${expectedCd}`,
              finalData: `${base}${expectedCd}`,
              displayText: `${base}${expectedCd}`,
              computedCheckDigit: expectedCd,
              expectedCheckDigit: expectedCd,
              suggestedFix: `${base}${expectedCd}`,
            };
          }
          return {
            isValid: false,
            error: `Invalid ITF-14 check digit: entered "${providedCd}", expected "${expectedCd}".`,
            finalData: input,
            displayText: input,
            computedCheckDigit: expectedCd,
            expectedCheckDigit: expectedCd,
            suggestedFix: `${base}${expectedCd}`,
          };
        }

        return {
          isValid: true,
          message: "✓ Valid ITF-14 logistics carton barcode with verified check digit",
          finalData: input,
          displayText: input,
          computedCheckDigit: expectedCd,
        };
      }

      return {
        isValid: false,
        error: `ITF-14 cannot exceed 14 digits. Currently entered: ${input.length} digits.`,
        finalData: input,
        displayText: input,
      };
    }

    case "codabar": {
      const upper = input.toUpperCase();
      // Codabar allowed characters: 0-9, -, $, :, /, ., + and start/stop A, B, C, D
      const codabarCharRegex = /^[0-9\-\$\:\/\.\+ABCD]+$/;
      if (!codabarCharRegex.test(upper)) {
        return {
          isValid: false,
          error: "Codabar only supports digits (0–9), symbols (- $ : / . +), and start/stop letters A, B, C, D.",
          finalData: upper,
          displayText: upper,
        };
      }

      // Check if start/stop framing characters are provided
      const startsWithFrame = /^[A-D]/.test(upper);
      const endsWithFrame = /[A-D]$/.test(upper);

      let finalData = upper;
      if (!startsWithFrame && !endsWithFrame) {
        finalData = `A${upper}B`; // Default standard framing
      } else if (!startsWithFrame) {
        finalData = `A${upper}`;
      } else if (!endsWithFrame) {
        finalData = `${upper}B`;
      }

      return {
        isValid: true,
        message: "✓ Valid Codabar format (start/stop framed)",
        finalData,
        displayText: finalData,
      };
    }

    case "GS1_128": {
      return parseAndValidateGs1(input);
    }

    default:
      return {
        isValid: true,
        finalData: input,
        displayText: input,
      };
  }
}

/**
 * Relative luminance for WCAG contrast calculation
 */
function getRelativeLuminance(hexColor) {
  let hex = (hexColor || "#000000").replace("#", "");
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
    return 21;
  }
}

/**
 * Assess barcode scanning quality based on configuration and standard rules
 */
export function assessBarcodeQuality({
  isValid,
  lineColor = "#000000",
  background = "#FFFFFF",
  isTransparentBg = false,
  margin = 15,
  width = 2,
  height = 80,
  displayValue = true,
  fontSize = 14,
}) {
  const effectiveBg = isTransparentBg ? "#FFFFFF" : background;
  const contrast = calculateContrastRatio(lineColor, effectiveBg);
  const issues = [];
  const checks = [];

  // Check 1: Valid format standard & data integrity
  if (isValid) {
    checks.push({ label: "Valid barcode standard & syntax", passed: true, status: "passed" });
  } else {
    issues.push("Invalid barcode data or checksum mismatch for the selected standard");
    checks.push({ label: "Valid barcode standard & syntax", passed: false, status: "failed" });
  }

  // Check 2: Optical Contrast
  if (contrast >= 7.0) {
    checks.push({ label: `Excellent optical contrast (${contrast.toFixed(1)}:1)`, passed: true, status: "passed" });
  } else if (contrast >= 4.5) {
    checks.push({ label: `Acceptable optical contrast (${contrast.toFixed(1)}:1)`, passed: true, status: "warning" });
  } else {
    issues.push("Contrast ratio is below 4.5:1. Optical laser scanners may fail to distinguish bars from background.");
    checks.push({ label: `Low optical contrast (${contrast.toFixed(1)}:1)`, passed: false, status: "failed" });
  }

  // Check 3: Quiet Zone Margins
  if (margin >= 14) {
    checks.push({ label: "Optimal quiet zone margins (>= 14px)", passed: true, status: "passed" });
  } else if (margin >= 10) {
    checks.push({ label: "Acceptable quiet zone margins", passed: true, status: "warning" });
  } else {
    issues.push("Quiet zone margin is tight (< 10px). Scanners need sufficient blank buffer around edges.");
    checks.push({ label: "Tight quiet zone margins (< 10px)", passed: false, status: "failed" });
  }

  // Check 4: Bar Width & Aspect Ratio
  if (height >= 55 && width >= 1.5) {
    checks.push({ label: "Readable bar height & module density", passed: true, status: "passed" });
  } else {
    issues.push("Bar height or width is low. May lead to scan latency on handheld or mobile camera scanners.");
    checks.push({ label: "Sub-optimal bar dimensions", passed: false, status: "warning" });
  }

  // Check 5: Human-Readable Text Clarity
  if (displayValue) {
    if (fontSize >= 11) {
      checks.push({ label: "Clear human-readable text", passed: true, status: "passed" });
    } else {
      checks.push({ label: "Human-readable font size is small", passed: true, status: "warning" });
    }
  } else {
    checks.push({ label: "Human-readable text hidden (bars only)", passed: true, status: "info" });
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const isReliable = isValid && contrast >= 4.5 && margin >= 10 && height >= 45;

  let status = "unsafe";
  let label = "Readability Issues Detected";

  if (isReliable && contrast >= 7.0 && margin >= 12) {
    status = "excellent";
    label = "Good Readability Conditions";
  } else if (isReliable) {
    status = "warning";
    label = "Acceptable Readability Conditions";
  }

  return {
    isReliable,
    contrastRatio: contrast,
    status,
    label,
    passedCount,
    totalChecks: checks.length,
    summary: isReliable
      ? "Configured with favorable dimensions, contrast, and quiet zone for reliable scanning."
      : issues[0] || "Adjust barcode settings or correct data for optimal scannability.",
    checks,
    issues,
  };
}
