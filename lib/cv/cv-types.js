/**
 * Rootixa Pro CV Builder — Data Definitions & Types
 */

export const DEFAULT_SECTION_ORDER = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "languages",
];

export const SECTION_METADATA = {
  summary: {
    id: "summary",
    title: "Professional Summary",
    shortTitle: "Summary",
    description: "Brief overview of your background, core strengths, and career objectives.",
  },
  experience: {
    id: "experience",
    title: "Work Experience",
    shortTitle: "Experience",
    description: "Your past and current professional roles, achievements, and responsibilities.",
  },
  education: {
    id: "education",
    title: "Education",
    shortTitle: "Education",
    description: "Degrees, certificates, universities, and academic accomplishments.",
  },
  skills: {
    id: "skills",
    title: "Key Skills",
    shortTitle: "Skills",
    description: "Core technical, industry, and interpersonal proficiencies.",
  },
  projects: {
    id: "projects",
    title: "Projects",
    shortTitle: "Projects",
    description: "Notable personal, open-source, or client projects you have built.",
  },
  certifications: {
    id: "certifications",
    title: "Certifications",
    shortTitle: "Certifications",
    description: "Credentials, licenses, and professional accreditations.",
  },
  languages: {
    id: "languages",
    title: "Languages",
    shortTitle: "Languages",
    description: "Languages you speak and your proficiency level.",
  },
};

export const LANGUAGE_PROFICIENCIES = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Conversational",
  "Basic",
];

/**
 * Generates a collision-resistant unique ID for repeatable items.
 */
export function generateId(prefix = "item") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Factory to create an empty Experience entry.
 */
export function createEmptyExperience() {
  return {
    id: generateId("exp"),
    position: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  };
}

/**
 * Factory to create an empty Education entry.
 */
export function createEmptyEducation() {
  return {
    id: generateId("edu"),
    degree: "",
    institution: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  };
}

/**
 * Factory to create an empty Project entry.
 */
export function createEmptyProject() {
  return {
    id: generateId("proj"),
    name: "",
    description: "",
    url: "",
    technologies: "",
  };
}

/**
 * Factory to create an empty Certification entry.
 */
export function createEmptyCertification() {
  return {
    id: generateId("cert"),
    name: "",
    issuer: "",
    issueDate: "",
    url: "",
  };
}

/**
 * Factory to create an empty Language entry.
 */
export function createEmptyLanguage() {
  return {
    id: generateId("lang"),
    language: "",
    proficiency: "Fluent",
  };
}

export const DEFAULT_SECTION_TITLES = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Key Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

export const CURATED_FONTS = [
  { id: "Inter", name: "Inter", category: "Sans-Serif", css: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" },
  { id: "Arial", name: "Arial", category: "Sans-Serif", css: "Arial, Helvetica, sans-serif" },
  { id: "Helvetica", name: "Helvetica", category: "Sans-Serif", css: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { id: "Roboto", name: "Roboto", category: "Sans-Serif", css: "'Roboto', -apple-system, sans-serif" },
  { id: "Lato", name: "Lato", category: "Sans-Serif", css: "'Lato', sans-serif" },
  { id: "Open Sans", name: "Open Sans", category: "Sans-Serif", css: "'Open Sans', sans-serif" },
  { id: "Source Sans 3", name: "Source Sans 3", category: "Sans-Serif", css: "'Source Sans 3', sans-serif" },
  { id: "Georgia", name: "Georgia", category: "Serif", css: "Georgia, serif" },
  { id: "Merriweather", name: "Merriweather", category: "Serif", css: "'Merriweather', Georgia, serif" },
  { id: "Times New Roman", name: "Times New Roman", category: "Serif", css: "'Times New Roman', Times, serif" },
];

export const COLOR_PRESETS = [
  { id: "indigo", name: "Indigo", hex: "#4f46e5" },
  { id: "navy", name: "Navy", hex: "#1e3a8a" },
  { id: "blue", name: "Royal Blue", hex: "#2563eb" },
  { id: "green", name: "Forest Green", hex: "#059669" },
  { id: "burgundy", name: "Burgundy", hex: "#9f1239" },
  { id: "slate", name: "Slate", hex: "#334155" },
  { id: "black", name: "Charcoal", hex: "#0f172a" },
];

export const DEFAULT_DESIGN = {
  templateId: "modern",
  fontFamily: "Inter",
  fontSize: {
    name: 28,
    title: 14,
    sectionHeading: 13,
    body: 10,
    metadata: 9,
  },
  lineHeight: 1.45,
  spacing: {
    section: 18,
    item: 10,
    paragraph: 6,
  },
  colors: {
    accent: "#4f46e5",
    headerBg: "#0f172a",
  },
  layout: {
    pageMargin: 48,
    marginPreset: "normal", // "compact" | "normal" | "spacious"
    density: "comfortable", // "compact" | "comfortable" | "spacious"
    headerAlignment: "left", // "left" | "center" | "right"
  },
  photo: {
    enabled: false,
    url: "",
    shape: "circle", // "circle" | "rounded" | "square"
  },
};

export const DESIGN_PRESETS = {
  clean: {
    id: "clean",
    name: "Clean & Modern",
    description: "Balanced typography and comfortable whitespace with modern indigo accents.",
    design: {
      fontFamily: "Inter",
      fontSize: { name: 28, title: 14, sectionHeading: 13, body: 10, metadata: 9 },
      lineHeight: 1.45,
      spacing: { section: 18, item: 10, paragraph: 6 },
      colors: { accent: "#4f46e5", headerBg: "#0f172a" },
      layout: { pageMargin: 48, marginPreset: "normal", density: "comfortable", headerAlignment: "left" },
    },
  },
  compact: {
    id: "compact",
    name: "Dense & Compact",
    description: "Engineered to fit maximum content cleanly with tighter spacing and margins.",
    design: {
      fontFamily: "Roboto",
      fontSize: { name: 24, title: 12, sectionHeading: 11, body: 9, metadata: 8 },
      lineHeight: 1.3,
      spacing: { section: 12, item: 6, paragraph: 4 },
      colors: { accent: "#1e293b", headerBg: "#0f172a" },
      layout: { pageMargin: 36, marginPreset: "compact", density: "compact", headerAlignment: "left" },
    },
  },
  elegant: {
    id: "elegant",
    name: "Refined & Elegant",
    description: "Generous whitespace, classic serif typography, and rich emerald accents.",
    design: {
      fontFamily: "Merriweather",
      fontSize: { name: 30, title: 14, sectionHeading: 14, body: 10.5, metadata: 9.5 },
      lineHeight: 1.6,
      spacing: { section: 24, item: 14, paragraph: 8 },
      colors: { accent: "#059669", headerBg: "#0f172a" },
      layout: { pageMargin: 56, marginPreset: "spacious", density: "spacious", headerAlignment: "center" },
    },
  },
  corporate: {
    id: "corporate",
    name: "Formal Corporate",
    description: "Traditional executive structure with conservative navy accents and formal serif text.",
    design: {
      fontFamily: "Georgia",
      fontSize: { name: 26, title: 13, sectionHeading: 12, body: 10, metadata: 9 },
      lineHeight: 1.4,
      spacing: { section: 16, item: 10, paragraph: 6 },
      colors: { accent: "#1e3a8a", headerBg: "#0f172a" },
      layout: { pageMargin: 48, marginPreset: "normal", density: "comfortable", headerAlignment: "left" },
    },
  },
};

/**
 * Factory to create an initial, clean CV state.
 */
export function createEmptyCV() {
  return {
    meta: {
      title: "Untitled CV",
      lastModified: Date.now(),
    },
    personal: {
      fullName: "",
      professionalTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    sectionVisibility: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      languages: true,
    },
    sectionTitles: {
      ...DEFAULT_SECTION_TITLES,
    },
    design: {
      ...DEFAULT_DESIGN,
      fontSize: { ...DEFAULT_DESIGN.fontSize },
      spacing: { ...DEFAULT_DESIGN.spacing },
      colors: { ...DEFAULT_DESIGN.colors },
      layout: { ...DEFAULT_DESIGN.layout },
      photo: { ...DEFAULT_DESIGN.photo },
    },
    settings: {
      templateId: "modern",
    },
  };
}

/**
 * Starter sample data for onboarding demonstration.
 */
export function createSampleCV() {
  return {
    meta: {
      title: "Alex Morgan — Senior Full-Stack Engineer",
      lastModified: Date.now(),
    },
    personal: {
      fullName: "Alex Morgan",
      professionalTitle: "Senior Full-Stack Software Engineer",
      email: "alex.morgan@example.com",
      phone: "+1 (555) 382-9102",
      location: "San Francisco, CA",
      website: "https://alexmorgan.dev",
      linkedin: "https://linkedin.com/in/alexmorgan",
      github: "https://github.com/alexmorgan",
    },
    summary:
      "Results-driven Software Engineer with 5+ years of experience building modern web applications, high-performance APIs, and clean user interfaces. Passionate about scalable architecture and exceptional user experiences.",
    experience: [
      {
        id: "exp-1",
        position: "Senior Frontend Engineer",
        company: "Nexus Labs",
        location: "San Francisco, CA",
        startDate: "2022-01",
        endDate: "",
        current: true,
        description:
          "• Led architecture for modern client dashboard improving initial page load time by 35%.\n• Collaborated with design and product teams to establish an accessible UI component library.",
      },
      {
        id: "exp-2",
        position: "Software Developer",
        company: "Apex Digital",
        location: "Austin, TX",
        startDate: "2019-06",
        endDate: "2021-12",
        current: false,
        description:
          "• Built full-stack RESTful microservices supporting 500k+ monthly active users.\n• Implemented automated CI/CD deployment pipelines reducing release turnaround by 40%.",
      },
    ],
    education: [
      {
        id: "edu-1",
        degree: "B.S. in Computer Science",
        institution: "University of California, Berkeley",
        location: "Berkeley, CA",
        startDate: "2015-09",
        endDate: "2019-05",
        description: "Graduated with Honors. Focused on Software Engineering and Systems Design.",
      },
    ],
    skills: [
      { id: "sk-1", name: "JavaScript / TypeScript" },
      { id: "sk-2", name: "React & Next.js" },
      { id: "sk-3", name: "Node.js & Express" },
      { id: "sk-4", name: "Tailwind CSS" },
      { id: "sk-5", name: "PostgreSQL & SQL" },
      { id: "sk-6", name: "Git & CI/CD" },
    ],
    projects: [
      {
        id: "proj-1",
        name: "OmniFlow — Workflow Automation",
        description: "An open-source visual automation tool for managing data pipelines and integrations.",
        url: "https://github.com/example/omniflow",
        technologies: "Next.js, TypeScript, Tailwind CSS",
      },
    ],
    certifications: [
      {
        id: "cert-1",
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        issueDate: "2023",
        url: "",
      },
    ],
    languages: [
      {
        id: "lang-1",
        language: "English",
        proficiency: "Native / Bilingual",
      },
    ],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    sectionVisibility: {
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      languages: true,
    },
    sectionTitles: {
      ...DEFAULT_SECTION_TITLES,
    },
    design: {
      ...DEFAULT_DESIGN,
      fontSize: { ...DEFAULT_DESIGN.fontSize },
      spacing: { ...DEFAULT_DESIGN.spacing },
      colors: { ...DEFAULT_DESIGN.colors },
      layout: { ...DEFAULT_DESIGN.layout },
      photo: { ...DEFAULT_DESIGN.photo },
    },
    settings: {
      templateId: "modern",
    },
  };
}
