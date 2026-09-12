import { HarvardTemplate } from "./harvard-template";
import { AtsCleanTemplate } from "./ats-clean-template";
import { SimpleClassicTemplate } from "./simple-classic-template";
import { TechModernTemplate } from "./tech-modern-template";
import { SiliconMinimalTemplate } from "./silicon-minimal-template";
import { StartupLeadTemplate } from "./startup-lead-template";
import { ExecutiveNavyTemplate } from "./executive-navy-template";
import { ElegantSerifTemplate } from "./elegant-serif-template";
import { FinanceCorporateTemplate } from "./finance-corporate-template";
import { ModernSplitTemplate } from "./modern-split-template";
import { NordicCleanTemplate } from "./nordic-clean-template";
import { CreativePortfolioTemplate } from "./creative-portfolio-template";

// Backward compatibility imports for legacy templates
import { ModernTemplate } from "./modern-template";
import { ClassicTemplate } from "./classic-template";
import { MinimalTemplate } from "./minimal-template";
import { ProfessionalTemplate } from "./professional-template";

export const TEMPLATES = [
  // ─── 1. ATS & Classic (3) ───
  {
    id: "harvard",
    name: "Harvard Standard",
    tagline: "Academic, clean & high-ATS standard",
    description: "Ivy-league university format with traditional serif styling, centered header, and clean divider rules. The gold standard for ATS readability.",
    category: "ats",
    categoryLabel: "ATS & Academic",
    badge: "Ivy League",
    fontFamily: "Georgia",
    accentColor: "#A51C30",
    component: HarvardTemplate,
  },
  {
    id: "ats_clean",
    name: "Clean ATS",
    tagline: "Linear, high contrast & 100% parser safe",
    description: "Single-column linear hierarchy designed specifically for maximum ATS parsing rate and effortless readability by recruiters.",
    category: "ats",
    categoryLabel: "ATS & Academic",
    badge: "ATS Friendly",
    fontFamily: "Inter",
    accentColor: "#2563eb",
    component: AtsCleanTemplate,
  },
  {
    id: "simple_classic",
    name: "Simple Classic",
    tagline: "Formal, elegant & balanced corporate look",
    description: "Classic layout with horizontal divider rule, balanced margins, and small-caps section titles suited for corporate and administration.",
    category: "ats",
    categoryLabel: "ATS & Academic",
    badge: "Classic",
    fontFamily: "Georgia",
    accentColor: "#1e293b",
    component: SimpleClassicTemplate,
  },

  // ─── 2. Modern & Tech (3) ───
  {
    id: "tech_modern",
    name: "Tech Modern",
    tagline: "Contemporary, clean & developer-focused",
    description: "Tailored for software engineers, product managers, and tech professionals. Features pill skill tags, live demo links, and modern header.",
    category: "modern",
    categoryLabel: "Modern & Tech",
    badge: "Popular",
    fontFamily: "Inter",
    accentColor: "#4f46e5",
    component: TechModernTemplate,
  },
  {
    id: "silicon_minimal",
    name: "Silicon Minimal",
    tagline: "Extreme whitespace elegance & content-first",
    description: "Silicon Valley startup aesthetic. Minimalist typography, subtle monospace date stamps, and generous whitespace for confident candidates.",
    category: "modern",
    categoryLabel: "Modern & Tech",
    badge: "Minimalist",
    fontFamily: "Inter",
    accentColor: "#0f172a",
    component: SiliconMinimalTemplate,
  },
  {
    id: "startup_lead",
    name: "Startup Lead",
    tagline: "Dynamic timeline dots with colored pills",
    description: "Energetic and crisp. Visual timeline left accent dots for experience with vibrant category pill badges that stand out in any screening.",
    category: "modern",
    categoryLabel: "Modern & Tech",
    badge: "Dynamic",
    fontFamily: "Inter",
    accentColor: "#0ea5e9",
    component: StartupLeadTemplate,
  },

  // ─── 3. Corporate & Executive (3) ───
  {
    id: "executive_navy",
    name: "Executive Navy",
    tagline: "Authoritative header block for leadership",
    description: "Commanding executive block banner with left border card accents. Engineered for Directors, VP, General Managers, and Team Leads.",
    category: "corporate",
    categoryLabel: "Corporate & Executive",
    badge: "Executive",
    fontFamily: "Inter",
    accentColor: "#1e3a8a",
    component: ExecutiveNavyTemplate,
  },
  {
    id: "elegant_serif",
    name: "Elegant Serif",
    tagline: "Refined luxury serif for consulting & law",
    description: "Warm off-white background with refined serif typography. Ideal for legal, management consulting, academia, and luxury branding roles.",
    category: "corporate",
    categoryLabel: "Corporate & Executive",
    badge: "Refined",
    fontFamily: "Merriweather",
    accentColor: "#78350f",
    component: ElegantSerifTemplate,
  },
  {
    id: "finance_corporate",
    name: "Banking & Finance",
    tagline: "Structured tabular metrics for finance & audit",
    description: "Crisp right-aligned dates, uppercase titles, and solid section rules. Built for financial analysts, accountants, and auditors.",
    category: "corporate",
    categoryLabel: "Corporate & Executive",
    badge: "Structured",
    fontFamily: "Arial",
    accentColor: "#0f172a",
    component: FinanceCorporateTemplate,
  },

  // ─── 4. Sidebar & Creative (3) ───
  {
    id: "modern_split",
    name: "Modern Split",
    tagline: "Dual-column layout with tinted sidebar",
    description: "Clean left sidebar for profile photo, contacts, and skills; spacious right main column for career history. Outstanding visual balance.",
    category: "creative",
    categoryLabel: "Sidebar & Creative",
    badge: "Top Pick",
    fontFamily: "Inter",
    accentColor: "#6366f1",
    component: ModernSplitTemplate,
  },
  {
    id: "nordic_clean",
    name: "Nordic Clean",
    tagline: "Scandinavian minimalism & calm aesthetic",
    description: "Soft gray tones, muted borders, and understated photo avatar. Calm and elegant presentation suitable for any industry.",
    category: "creative",
    categoryLabel: "Sidebar & Creative",
    badge: "Nordic",
    fontFamily: "Inter",
    accentColor: "#64748b",
    component: NordicCleanTemplate,
  },
  {
    id: "creative_portfolio",
    name: "Creative Portfolio",
    tagline: "Bold typography & project showcases",
    description: "Designed for designers, marketers, and creative leads. High-contrast project cards, prominent badge tags, and creative styling.",
    category: "creative",
    categoryLabel: "Sidebar & Creative",
    badge: "Creative",
    fontFamily: "Inter",
    accentColor: "#e11d48",
    component: CreativePortfolioTemplate,
  },
];

// Legacy alias map to prevent broken drafts
const LEGACY_ALIASES = {
  modern: "tech_modern",
  classic: "simple_classic",
  minimal: "silicon_minimal",
  professional: "executive_navy",
};

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Templates", count: TEMPLATES.length },
  { id: "ats", label: "ATS & Academic", count: 3 },
  { id: "modern", label: "Modern & Tech", count: 3 },
  { id: "corporate", label: "Corporate & Executive", count: 3 },
  { id: "creative", label: "Sidebar & Creative", count: 3 },
];

export const DEFAULT_TEMPLATE_ID = "tech_modern";

export function getTemplate(templateId) {
  // Check if alias exists
  const effectiveId = LEGACY_ALIASES[templateId] || templateId;
  const found = TEMPLATES.find((t) => t.id === effectiveId);
  return found || TEMPLATES[0];
}

export function getAllTemplates() {
  return TEMPLATES;
}
