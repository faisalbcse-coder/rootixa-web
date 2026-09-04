/**
 * Rootixa QR Code Generator — Design & Scan Safety Engine
 * Real, measurable scan safety scoring based on ISO/IEC 18004 contrast,
 * quiet zone clearance, logo area, and error correction resilience.
 */

// Relative luminance calculation according to WCAG 2.1
export function getLuminance(hex) {
  if (!hex || hex === 'transparent') return 1.0;
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return 0.5;
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Contrast ratio calculation (L1 + 0.05) / (L2 + 0.05)
export function getContrastRatio(hex1, hex2) {
  try {
    const lum1 = getLuminance(hex1);
    const lum2 = getLuminance(hex2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  } catch {
    return 21;
  }
}

// Gradient rotation conversion to radians for qr-code-styling
export function getGradientRotation(direction) {
  switch (direction) {
    case 'horizontal': return 0;
    case 'vertical': return Math.PI / 2;
    case 'diagonal': return Math.PI / 4;
    default: return Math.PI / 4;
  }
}

/**
 * 10 Professional QR Design Presets (Quick Styles)
 * Strictly visual configurations; never modifies user content.
 */
export const DESIGN_PRESETS = {
  classic: {
    id: 'classic',
    name: 'Classic',
    category: 'recommended',
    desc: 'Maximum universal compatibility',
    settings: {
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: false,
      dotStyle: 'square',
      eyeFrameStyle: 'square',
      eyeDotStyle: 'square',
      customEyeColor: false,
      eyeFrameColor: '#000000',
      eyeDotColor: '#000000',
      margin: 12,
      errorCorrection: 'H',
      logoSize: 0.30,
      logoBg: 'none',
    }
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    category: 'recommended',
    desc: 'Contemporary rounded tech',
    settings: {
      fgColor: '#0F172A',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: false,
      dotStyle: 'dots',
      eyeFrameStyle: 'extra-rounded',
      eyeDotStyle: 'dot',
      customEyeColor: false,
      eyeFrameColor: '#0F172A',
      eyeDotColor: '#0F172A',
      margin: 12,
      errorCorrection: 'H',
      logoSize: 0.30,
      logoBg: 'none',
    }
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    category: 'recommended',
    desc: 'Distraction-free clean print',
    settings: {
      fgColor: '#1E293B',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: false,
      dotStyle: 'square',
      eyeFrameStyle: 'square',
      eyeDotStyle: 'square',
      customEyeColor: false,
      eyeFrameColor: '#1E293B',
      eyeDotColor: '#1E293B',
      margin: 18,
      errorCorrection: 'M',
      logoSize: 0.28,
      logoBg: 'none',
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    category: 'business',
    desc: 'Corporate executive navy',
    settings: {
      fgColor: '#0A2540',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: false,
      dotStyle: 'classy-rounded',
      eyeFrameStyle: 'extra-rounded',
      eyeDotStyle: 'square',
      customEyeColor: false,
      eyeFrameColor: '#0A2540',
      eyeDotColor: '#0A2540',
      margin: 14,
      errorCorrection: 'H',
      logoSize: 0.30,
      logoBg: 'white',
    }
  },
  brand: {
    id: 'brand',
    name: 'Brand',
    category: 'business',
    desc: 'Vibrant indigo-violet gradient',
    settings: {
      fgColor: '#4F46E5',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: true,
      gradientStart: '#4F46E5',
      gradientEnd: '#7C3AED',
      gradientDirection: 'diagonal',
      dotStyle: 'rounded',
      eyeFrameStyle: 'extra-rounded',
      eyeDotStyle: 'square',
      customEyeColor: true,
      eyeFrameColor: '#4F46E5',
      eyeDotColor: '#7C3AED',
      margin: 12,
      errorCorrection: 'H',
      logoSize: 0.30,
      logoBg: 'white',
    }
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    category: 'business',
    desc: 'Luxury botanical emerald',
    settings: {
      fgColor: '#064E3B',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: false,
      dotStyle: 'classy',
      eyeFrameStyle: 'extra-rounded',
      eyeDotStyle: 'dot',
      customEyeColor: false,
      eyeFrameColor: '#064E3B',
      eyeDotColor: '#064E3B',
      margin: 14,
      errorCorrection: 'H',
      logoSize: 0.30,
      logoBg: 'white',
    }
  },
  soft: {
    id: 'soft',
    name: 'Soft',
    category: 'creative',
    desc: 'Friendly pill modules',
    settings: {
      fgColor: '#581C87',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: false,
      dotStyle: 'extra-rounded',
      eyeFrameStyle: 'extra-rounded',
      eyeDotStyle: 'dot',
      customEyeColor: false,
      eyeFrameColor: '#581C87',
      eyeDotColor: '#581C87',
      margin: 12,
      errorCorrection: 'H',
      logoSize: 0.30,
      logoBg: 'none',
    }
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    category: 'creative',
    desc: 'High-impact prominent modules',
    settings: {
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: false,
      dotStyle: 'rounded',
      eyeFrameStyle: 'square',
      eyeDotStyle: 'square',
      customEyeColor: false,
      eyeFrameColor: '#000000',
      eyeDotColor: '#000000',
      margin: 10,
      errorCorrection: 'H',
      logoSize: 0.32,
      logoBg: 'white',
    }
  },
  social: {
    id: 'social',
    name: 'Social',
    category: 'creative',
    desc: 'Vibrant crimson-purple gradient',
    settings: {
      fgColor: '#BE123C',
      bgColor: '#FFFFFF',
      isTransparentBg: false,
      isGradient: true,
      gradientStart: '#BE123C',
      gradientEnd: '#6D28D9',
      gradientDirection: 'diagonal',
      dotStyle: 'dots',
      eyeFrameStyle: 'extra-rounded',
      eyeDotStyle: 'dot',
      customEyeColor: true,
      eyeFrameColor: '#BE123C',
      eyeDotColor: '#6D28D9',
      margin: 12,
      errorCorrection: 'H',
      logoSize: 0.30,
      logoBg: 'white',
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    category: 'creative',
    desc: 'High-contrast dark theme',
    settings: {
      fgColor: '#FFFFFF',
      bgColor: '#0B0F17',
      isTransparentBg: false,
      isGradient: false,
      dotStyle: 'rounded',
      eyeFrameStyle: 'extra-rounded',
      eyeDotStyle: 'dot',
      customEyeColor: false,
      eyeFrameColor: '#FFFFFF',
      eyeDotColor: '#FFFFFF',
      margin: 16,
      errorCorrection: 'H',
      logoSize: 0.30,
      logoBg: 'white',
    }
  }
};

export const PRESET_CATEGORIES = [
  { id: 'all', label: 'All Styles (10)' },
  { id: 'recommended', label: 'Recommended' },
  { id: 'business', label: 'Business' },
  { id: 'creative', label: 'Creative' },
];

/**
 * Detect if current settings exactly match a known preset.
 */
export function detectMatchingPreset(settings) {
  for (const [key, preset] of Object.entries(DESIGN_PRESETS)) {
    const s = preset.settings;
    if (
      settings.fgColor === s.fgColor &&
      settings.bgColor === s.bgColor &&
      Boolean(settings.isTransparentBg) === Boolean(s.isTransparentBg) &&
      Boolean(settings.isGradient) === Boolean(s.isGradient) &&
      settings.dotStyle === s.dotStyle &&
      settings.eyeFrameStyle === s.eyeFrameStyle &&
      settings.eyeDotStyle === s.eyeDotStyle &&
      settings.margin === s.margin &&
      settings.errorCorrection === s.errorCorrection
    ) {
      if (settings.isGradient) {
        if (
          settings.gradientStart === s.gradientStart &&
          settings.gradientEnd === s.gradientEnd &&
          settings.gradientDirection === s.gradientDirection
        ) {
          return key;
        }
      } else {
        return key;
      }
    }
  }
  return 'custom';
}

/**
 * Live Measurable Scan Safety Evaluation
 * Inspects contrast, logo coverage, quiet zone, and error correction.
 */
export function evaluateScanSafety(settings) {
  const issues = [];
  const tips = [];
  let isUnsafe = false;
  let isWarning = false;

  const bg = settings.isTransparentBg ? '#FFFFFF' : settings.bgColor;

  // 1. Contrast Evaluation
  let minContrast = 21;
  if (settings.isGradient) {
    const startContrast = getContrastRatio(settings.gradientStart, bg);
    const endContrast = getContrastRatio(settings.gradientEnd, bg);
    minContrast = Math.min(startContrast, endContrast);
    if (minContrast < 3.0) {
      isUnsafe = true;
      issues.push(`Gradient contrast is dangerously low (${minContrast.toFixed(1)}:1).`);
      tips.push('Increase the darkness of the gradient start/end color against the background.');
    } else if (minContrast < 4.5) {
      isWarning = true;
      issues.push(`Gradient contrast is moderate (${minContrast.toFixed(1)}:1).`);
      tips.push('Aim for 4.5:1 contrast for instant scanning in low light.');
    }
  } else {
    const contrast = getContrastRatio(settings.fgColor, bg);
    minContrast = contrast;
    if (contrast < 3.0) {
      isUnsafe = true;
      issues.push(`Low color contrast (${contrast.toFixed(1)}:1). Modules are too close to background.`);
      tips.push('Select a darker foreground or lighter background.');
    } else if (contrast < 4.5) {
      isWarning = true;
      issues.push(`Moderate contrast (${contrast.toFixed(1)}:1).`);
      tips.push('Higher contrast (≥4.5:1) ensures faster detection on entry-level cameras.');
    }
  }

  // 2. Eye Frame & Eye Dot Contrast
  if (settings.customEyeColor) {
    const frameContrast = getContrastRatio(settings.eyeFrameColor, bg);
    const dotContrast = getContrastRatio(settings.eyeDotColor, bg);
    if (frameContrast < 3.0 || dotContrast < 3.0) {
      isUnsafe = true;
      issues.push('Finder pattern eyes have insufficient contrast with the background.');
      tips.push('Camera scanners rely on the 3 corner eyes to orient the code.');
    }
  }

  // 3. Logo and Error Correction Safety
  if (settings.logo) {
    const ecc = settings.errorCorrection;
    if (ecc === 'L') {
      isUnsafe = true;
      issues.push('Logo is active with Low (7%) error correction. Data will be unrecoverable.');
      tips.push('Switch Error Correction to High (30%) when embedding any logo.');
    } else if (ecc === 'M') {
      isWarning = true;
      issues.push('Medium (15%) error correction with logo may fail if surface gets scratched.');
      tips.push('High (30%) error correction is recommended with brand logos.');
    }

    if (settings.logoSize > 0.38 && ecc !== 'H') {
      isUnsafe = true;
      issues.push('Logo size exceeds 38% while error correction is not set to High.');
      tips.push('Reduce logo size to 30% or set error correction to High.');
    }
  }

  // 4. Quiet Zone Margin Check
  if (settings.margin < 6) {
    isWarning = true;
    issues.push('Quiet zone margin is under 6px. Camera auto-framing may clip outer edges.');
    tips.push('Keep margin at 12px or above for print and signage.');
  }

  // 5. Transparent Background Warning
  if (settings.isTransparentBg) {
    isWarning = true;
    tips.push('Transparent background requires high-contrast placement surface when displayed.');
  }

  // Final Status Determination
  let status = 'excellent';
  let label = 'Excellent';
  let summary = 'Optimal readability and scan reliability across all smartphones.';

  if (isUnsafe) {
    status = 'unsafe';
    label = 'Unsafe';
    summary = 'Current design choices may cause camera scanners to fail.';
  } else if (isWarning) {
    status = 'warning';
    label = 'Needs Attention';
    summary = 'Some design settings may slow down scan detection in dim lighting.';
  }

  return {
    status,
    label,
    summary,
    contrastRatio: minContrast,
    issues,
    tips
  };
}
