/**
 * QR Code & Barcode Content Decoder & Format Normalizer
 * Inspects payload type, evaluates URL safety, and normalizes standard names.
 */

/**
 * Format names dictionary mapping internal scanner identifiers to standard names
 */
const FORMAT_NAMES = {
  // html5-qrcode string constants / numeric values
  "0": "QR Code",
  "QR_CODE": "QR Code",
  "qr_code": "QR Code",
  "1": "Aztec",
  "AZTEC": "Aztec",
  "aztec": "Aztec",
  "2": "Codabar",
  "CODABAR": "Codabar",
  "codabar": "Codabar",
  "3": "Code 39",
  "CODE_39": "Code 39",
  "code_39": "Code 39",
  "4": "Code 93",
  "CODE_93": "Code 93",
  "code_93": "Code 93",
  "5": "Code 128",
  "CODE_128": "Code 128",
  "code_128": "Code 128",
  "6": "Data Matrix",
  "DATA_MATRIX": "Data Matrix",
  "data_matrix": "Data Matrix",
  "8": "ITF-14",
  "ITF": "ITF-14",
  "itf": "ITF-14",
  "9": "EAN-13",
  "EAN_13": "EAN-13",
  "ean_13": "EAN-13",
  "10": "EAN-8",
  "EAN_8": "EAN-8",
  "ean_8": "EAN-8",
  "11": "PDF417",
  "PDF_417": "PDF417",
  "pdf417": "PDF417",
  "14": "UPC-A",
  "UPC_A": "UPC-A",
  "upc_a": "UPC-A",
  "15": "UPC-E",
  "UPC_E": "UPC-E",
  "upc_e": "UPC-E",
};

/**
 * Normalize scanner format name and detect GS1-128
 *
 * @param {string | number} rawFormat - Format code or name from scanner
 * @param {string} rawText - Raw decoded text
 * @returns {string} Human-readable standard name
 */
export function normalizeBarcodeFormat(rawFormat, rawText = "") {
  if (!rawFormat && rawFormat !== 0) return "Detected Code";

  const key = String(rawFormat).trim();
  let name = FORMAT_NAMES[key] || FORMAT_NAMES[key.toUpperCase()] || key;

  // Check if Code 128 is actually GS1-128 formatted
  if (name === "Code 128") {
    const text = rawText.trim();
    // GS1-128 contains FNC1 char or starts with standard (01) / (00) / (10) / (17) Application Identifiers
    const hasFnc1 = text.includes(String.fromCharCode(207)) || text.includes(String.fromCharCode(29));
    const hasGs1Ai = /^\((\d{2,4})\)/.test(text);
    if (hasFnc1 || hasGs1Ai) {
      name = "GS1-128";
    }
  }

  return name;
}

/**
 * Inspect URL safety and parse domain
 *
 * @param {string} text - Decoded payload
 * @returns {Object} URL safety summary
 */
export function inspectUrlSafety(text) {
  const trimmed = (text || "").trim();

  // Basic sanity check before parsing
  if (!trimmed || !/^https?:\/\//i.test(trimmed)) {
    // Check if it's a domain without scheme (e.g. www.example.com or example.com/page)
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9.-]+(\/[^\s]*)?$/.test(trimmed)) {
      try {
        const parsed = new URL(`https://${trimmed}`);
        return {
          isUrl: true,
          isHttps: true,
          inferredScheme: true,
          url: `https://${trimmed}`,
          hostname: parsed.hostname,
          status: "secure",
          label: "HTTPS (Inferred)",
        };
      } catch {
        return { isUrl: false };
      }
    }
    return { isUrl: false };
  }

  try {
    const parsed = new URL(trimmed);
    const isHttps = parsed.protocol.toLowerCase() === "https:";
    return {
      isUrl: true,
      isHttps,
      inferredScheme: false,
      url: trimmed,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      search: parsed.search,
      status: isHttps ? "secure" : "unencrypted",
      label: isHttps ? "HTTPS (Encrypted)" : "HTTP (Unencrypted)",
    };
  } catch {
    return {
      isUrl: false,
      isMalformed: true,
      status: "invalid",
      label: "Malformed URL",
    };
  }
}

/**
 * Parse Wi-Fi payload
 * Format: WIFI:S:<ssid>;T:<WPA|WEP|nopass>;P:<password>;H:<true|false>;;
 */
export function parseWifiPayload(text) {
  if (!text.startsWith("WIFI:")) return null;
  const ssidMatch = text.match(/S:([^;]*);/);
  const typeMatch = text.match(/T:([^;]*);/);
  const passMatch = text.match(/P:([^;]*);/);
  const hiddenMatch = text.match(/H:([^;]*);/);

  return {
    ssid: ssidMatch ? ssidMatch[1] : "",
    encryption: typeMatch ? typeMatch[1] : "WPA",
    password: passMatch ? passMatch[1] : "",
    hidden: hiddenMatch ? hiddenMatch[1] === "true" : false,
  };
}

/**
 * Parse vCard Contact Card
 */
export function parseVCardPayload(text) {
  if (!text.startsWith("BEGIN:VCARD")) return null;

  const fnMatch = text.match(/FN:([^\r\n]+)/i);
  const orgMatch = text.match(/ORG:([^\r\n]+)/i);
  const titleMatch = text.match(/TITLE:([^\r\n]+)/i);
  const telMatch = text.match(/TEL(?:;[^:]+)?:([^\r\n]+)/i);
  const emailMatch = text.match(/EMAIL(?:;[^:]+)?:([^\r\n]+)/i);
  const urlMatch = text.match(/URL(?:;[^:]+)?:([^\r\n]+)/i);

  return {
    name: fnMatch ? fnMatch[1].trim() : "",
    organization: orgMatch ? orgMatch[1].trim() : "",
    title: titleMatch ? titleMatch[1].trim() : "",
    phone: telMatch ? telMatch[1].trim() : "",
    email: emailMatch ? emailMatch[1].trim() : "",
    website: urlMatch ? urlMatch[1].trim() : "",
  };
}

/**
 * Parse Email payload (mailto: or MATMSG:)
 */
export function parseEmailPayload(text) {
  if (text.startsWith("mailto:")) {
    const withoutPrefix = text.slice(7);
    const [to, query] = withoutPrefix.split("?");
    let subject = "";
    let body = "";
    if (query) {
      const params = new URLSearchParams(query);
      subject = params.get("subject") || "";
      body = params.get("body") || "";
    }
    return { to, subject, body };
  }

  if (text.startsWith("MATMSG:")) {
    const toMatch = text.match(/TO:([^;]*);/i);
    const subMatch = text.match(/SUB:([^;]*);/i);
    const bodyMatch = text.match(/BODY:([^;]*);/i);
    return {
      to: toMatch ? toMatch[1] : "",
      subject: subMatch ? subMatch[1] : "",
      body: bodyMatch ? bodyMatch[1] : "",
    };
  }

  return null;
}

/**
 * Identify Content Type from raw decoded text and barcode standard
 *
 * @param {string} rawText - Decoded text
 * @param {string} formatName - Normalized standard name
 * @returns {Object} Content metadata
 */
export function detectContentType(rawText, formatName = "") {
  const text = (rawText || "").trim();

  // If detected as 1D retail/logistics barcode
  if (
    formatName === "EAN-13" ||
    formatName === "EAN-8" ||
    formatName === "UPC-A" ||
    formatName === "UPC-E" ||
    formatName === "ITF-14"
  ) {
    return {
      type: "product",
      label: "Retail Product Barcode",
      category: "Retail",
      isUrl: false,
    };
  }

  if (formatName === "GS1-128") {
    return {
      type: "gs1",
      label: "GS1 Logistics Barcode",
      category: "Logistics",
      isUrl: false,
    };
  }

  if (formatName === "Code 128" || formatName === "Code 39" || formatName === "Codabar") {
    return {
      type: "barcode",
      label: "Industrial / Inventory Barcode",
      category: "Inventory",
      isUrl: false,
    };
  }

  // 1. Wi-Fi
  const wifi = parseWifiPayload(text);
  if (wifi) {
    return {
      type: "wifi",
      label: "Wi-Fi Network Credentials",
      category: "Network",
      isUrl: false,
      details: wifi,
    };
  }

  // 2. vCard Contact
  const vcard = parseVCardPayload(text);
  if (vcard) {
    return {
      type: "vcard",
      label: "Contact Card (vCard)",
      category: "Contact",
      isUrl: false,
      details: vcard,
    };
  }

  // 3. Email
  const email = parseEmailPayload(text);
  if (email) {
    return {
      type: "email",
      label: "Email Message",
      category: "Communication",
      isUrl: false,
      details: email,
    };
  }

  // 4. Phone call
  if (/^tel:([0-9+ -]+)$/i.test(text)) {
    const number = text.slice(4).trim();
    return {
      type: "phone",
      label: "Telephone Call",
      category: "Communication",
      isUrl: false,
      details: { number },
    };
  }

  // 5. SMS
  if (/^sms:([0-9+ -]+)/i.test(text) || /^SMSTO:([^:]+):(.*)/i.test(text)) {
    let phone = "";
    let message = "";
    if (text.startsWith("SMSTO:")) {
      const parts = text.split(":");
      phone = parts[1] || "";
      message = parts.slice(2).join(":") || "";
    } else {
      const match = text.match(/^sms:([^?]+)(\?body=(.*))?/i);
      phone = match ? match[1] : "";
      message = match && match[3] ? decodeURIComponent(match[3]) : "";
    }
    return {
      type: "sms",
      label: "SMS Text Message",
      category: "Communication",
      isUrl: false,
      details: { phone, message },
    };
  }

  // 6. WhatsApp
  if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(text)) {
    return {
      type: "whatsapp",
      label: "WhatsApp Chat Link",
      category: "Communication",
      isUrl: true,
      url: text,
    };
  }

  // 7. Geo Location
  if (/^geo:(-?[0-9.]+),(-?[0-9.]+)/i.test(text)) {
    const match = text.match(/^geo:(-?[0-9.]+),(-?[0-9.]+)/i);
    return {
      type: "location",
      label: "Geographic Location",
      category: "Navigation",
      isUrl: false,
      details: { lat: match[1], lng: match[2] },
    };
  }

  // 8. Calendar Event
  if (text.startsWith("BEGIN:VEVENT")) {
    const sumMatch = text.match(/SUMMARY:([^\r\n]+)/i);
    return {
      type: "calendar",
      label: "Calendar Event",
      category: "Event",
      isUrl: false,
      details: { summary: sumMatch ? sumMatch[1] : "Calendar Event" },
    };
  }

  // 9. Social Media
  if (/^https?:\/\/(www\.)?(instagram|x|twitter|linkedin|facebook|youtube|tiktok)\.com\//i.test(text)) {
    return {
      type: "social",
      label: "Social Media Profile",
      category: "Social",
      isUrl: true,
      url: text,
    };
  }

  // 10. App Store / Play Store
  if (/^https?:\/\/(play\.google\.com|apps\.apple\.com)\//i.test(text)) {
    return {
      type: "app",
      label: "Mobile App Store Link",
      category: "Apps",
      isUrl: true,
      url: text,
    };
  }

  // 11. General Website URL
  const urlCheck = inspectUrlSafety(text);
  if (urlCheck.isUrl) {
    return {
      type: "url",
      label: "Website Link",
      category: "Web",
      isUrl: true,
      url: urlCheck.url,
      urlSafety: urlCheck,
    };
  }

  // 12. Fallback: Plain Text
  return {
    type: "text",
    label: "Plain Text Content",
    category: "Text",
    isUrl: false,
  };
}
