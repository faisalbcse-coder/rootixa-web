/**
 * Dimension Presets and Aspect Ratio Standards for Rootixa Image Resizer & Crop
 */

export const ASPECT_RATIOS = [
  { id: "free", label: "Free", ratio: null, desc: "Custom freeform crop" },
  { id: "1:1", label: "1:1", ratio: 1 / 1, desc: "Square (Avatar, Instagram)" },
  { id: "4:3", label: "4:3", ratio: 4 / 3, desc: "Standard Photo & Tablet" },
  { id: "3:2", label: "3:2", ratio: 3 / 2, desc: "Classic 35mm Photography" },
  { id: "16:9", label: "16:9", ratio: 16 / 9, desc: "Widescreen Display & YouTube" },
  { id: "9:16", label: "9:16", ratio: 9 / 16, desc: "Vertical Story & Reels" },
];

export const PERCENTAGE_PRESETS = [25, 50, 75, 100, 125, 150];

export const DIMENSION_PRESETS = [
  {
    category: "Social Media",
    items: [
      { name: "Instagram Square", width: 1080, height: 1080, ratio: "1:1" },
      { name: "Instagram Portrait", width: 1080, height: 1350, ratio: "4:5" },
      { name: "Instagram Story / Reel", width: 1080, height: 1920, ratio: "9:16" },
      { name: "Facebook Post", width: 1200, height: 630, ratio: "1.91:1" },
      { name: "YouTube Thumbnail", width: 1280, height: 720, ratio: "16:9" },
      { name: "Twitter / X Post", width: 1200, height: 675, ratio: "16:9" },
      { name: "Twitter / X Header", width: 1500, height: 500, ratio: "3:1" },
      { name: "LinkedIn Post", width: 1200, height: 627, ratio: "1.91:1" },
    ],
  },
  {
    category: "Standard Displays",
    items: [
      { name: "Full HD (1080p)", width: 1920, height: 1080, ratio: "16:9" },
      { name: "HD (720p)", width: 1280, height: 720, ratio: "16:9" },
      { name: "Square Web (800p)", width: 800, height: 800, ratio: "1:1" },
      { name: "Standard Display", width: 800, height: 600, ratio: "4:3" },
      { name: "Compact Thumbnail", width: 400, height: 400, ratio: "1:1" },
      { name: "Web Banner", width: 1200, height: 400, ratio: "3:1" },
    ],
  },
];
