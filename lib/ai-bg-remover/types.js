/**
 * Types, presets, and constants for AI Background Remover & Enhancer.
 */

export const BACKGROUND_TYPES = {
  TRANSPARENT: "transparent",
  SOLID: "solid",
  GRADIENT: "gradient",
  IMAGE: "image",
};

export const COLOR_SWATCHES = [
  { id: "white", label: "Pure White", color: "#FFFFFF", textDark: true },
  { id: "off-white", label: "Studio Soft", color: "#F8FAFC", textDark: true },
  { id: "slate", label: "Dark Slate", color: "#0F172A", textDark: false },
  { id: "charcoal", label: "Charcoal", color: "#1E293B", textDark: false },
  { id: "indigo", label: "Vibrant Indigo", color: "#6366F1", textDark: false },
  { id: "blue", label: "Sky Blue", color: "#0EA5E9", textDark: false },
  { id: "emerald", label: "Emerald Green", color: "#10B981", textDark: false },
  { id: "amber", label: "Warm Amber", color: "#F59E0B", textDark: false },
  { id: "rose", label: "Studio Rose", color: "#F43F5E", textDark: false },
  { id: "purple", label: "Royal Purple", color: "#8B5CF6", textDark: false },
];

export const GRADIENT_PRESETS = [
  {
    id: "sunset",
    label: "Sunset Glow",
    start: "#F97316",
    end: "#EC4899",
    angle: 135,
  },
  {
    id: "ocean",
    label: "Ocean Breeze",
    start: "#06B6D4",
    end: "#3B82F6",
    angle: 90,
  },
  {
    id: "cyber",
    label: "Neon Cyber",
    start: "#8B5CF6",
    end: "#EC4899",
    angle: 45,
  },
  {
    id: "forest",
    label: "Emerald Silk",
    start: "#10B981",
    end: "#047857",
    angle: 180,
  },
  {
    id: "midnight",
    label: "Midnight Luxe",
    start: "#0F172A",
    end: "#334155",
    angle: 135,
  },
  {
    id: "studio-grey",
    label: "Pro Studio",
    start: "#F1F5F9",
    end: "#CBD5E1",
    angle: 90,
  },
];

export const ENHANCE_MODES = {
  AUTO: "auto",
  UPSCALE_2X: "upscale2x",
};

export const VIEW_MODES = {
  SLIDER: "slider",
  SPLIT: "split",
  RESULT: "result",
};

export const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
];

export const DEFAULT_TRANSFORM = {
  scale: 1.0,
  x: 0,
  y: 0,
};
