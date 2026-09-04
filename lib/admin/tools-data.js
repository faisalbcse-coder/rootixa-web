import "server-only";

import fs from "fs";
import path from "path";
import { getAllToolUsageEvents } from "@/lib/tools/tracker";
import { createServiceClient } from "@/lib/supabase/service";

const DATA_DIR = path.join(process.cwd(), "data");
const TOOLS_CONFIG_FILE = path.join(DATA_DIR, "tools-config.json");

// Canonical Rootixa Tools Catalog
export const CANONICAL_TOOLS = [
  {
    id: "qr-code",
    name: "QR & BAR Code Generator",
    slug: "qr-code",
    description: "Create custom, trackable QR and Bar codes with premium brand logos and custom styling.",
    category: "Utility / Branding",
    route: "/qr-code",
    iconName: "QrCode",
    defaultStatus: "live",
    access: "public",
    version: "v1.2.0",
    rating: 4.9,
    releaseDate: "2026-08-15",
  },
  {
    id: "cv-builder",
    name: "Pro CV Builder",
    slug: "cv-builder",
    description: "Build professional, ATS-friendly resumes in minutes to land your dream job.",
    category: "Career / Documents",
    route: "#",
    iconName: "FileText",
    defaultStatus: "development",
    access: "registered",
    version: "v0.9.0-beta",
    rating: 4.8,
    releaseDate: "Coming Soon",
  },
  {
    id: "image-resizer",
    name: "Image Resizer & Crop",
    slug: "image-resizer",
    description: "Resize, crop, and optimize images for any social media platform effortlessly.",
    category: "Media / Images",
    route: "#",
    iconName: "ImagePlus",
    defaultStatus: "development",
    access: "public",
    version: "v0.8.5-preview",
    rating: 4.9,
    releaseDate: "Coming Soon",
  },
  {
    id: "bg-remover",
    name: "AI Background Remover & Enhancer",
    slug: "bg-remover",
    description: "Extract subjects and enhance photo quality using advanced AI in 1 click.",
    category: "AI / Photo",
    route: "#",
    iconName: "Sparkles",
    defaultStatus: "development",
    access: "registered",
    version: "v0.5.0-alpha",
    rating: 4.9,
    releaseDate: "Coming Soon",
  },
  {
    id: "pdf-converter",
    name: "Image & PDF Converter",
    slug: "pdf-converter",
    description: "Convert images to PDF or extract images from PDF documents seamlessly.",
    category: "Documents",
    route: "#",
    iconName: "Archive",
    defaultStatus: "development",
    access: "public",
    version: "v0.7.0-beta",
    rating: 4.7,
    releaseDate: "Coming Soon",
  },
  {
    id: "invoice-generator",
    name: "Invoice Generator",
    slug: "invoice-generator",
    description: "Generate professional invoices and receipts on the go for your clients.",
    category: "Business",
    route: "#",
    iconName: "Calculator",
    defaultStatus: "development",
    access: "registered",
    version: "v0.6.0-beta",
    rating: 4.8,
    releaseDate: "Coming Soon",
  },
];

/**
 * Initialize and read persistent tool configuration overrides
 */
function ensureToolsConfig() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(TOOLS_CONFIG_FILE)) {
      const initialConfig = {
        tools: {
          "qr-code": { status: "live", maintenanceNotice: "" },
          "cv-builder": { status: "development", maintenanceNotice: "" },
          "image-resizer": { status: "development", maintenanceNotice: "" },
          "bg-remover": { status: "development", maintenanceNotice: "" },
          "pdf-converter": { status: "development", maintenanceNotice: "" },
          "invoice-generator": { status: "development", maintenanceNotice: "" },
        },
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(TOOLS_CONFIG_FILE, JSON.stringify(initialConfig, null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to ensure tools config file:", err);
  }
}

function readToolsConfig() {
  ensureToolsConfig();
  try {
    const raw = fs.readFileSync(TOOLS_CONFIG_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.tools || {};
  } catch {
    return {};
  }
}

function writeToolsConfig(toolId, updates) {
  ensureToolsConfig();
  try {
    let rawData = { tools: {} };
    try {
      rawData = JSON.parse(fs.readFileSync(TOOLS_CONFIG_FILE, "utf8"));
    } catch {
      rawData = { tools: {} };
    }

    const currentTool = rawData.tools?.[toolId] || {};
    rawData.tools = {
      ...rawData.tools,
      [toolId]: {
        ...currentTool,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    };
    rawData.updatedAt = new Date().toISOString();

    fs.writeFileSync(TOOLS_CONFIG_FILE, JSON.stringify(rawData, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Failed to write tools config:", err);
    return false;
  }
}

/**
 * Fetch and aggregate usage telemetry per tool
 */
async function getAggregatedToolMetrics() {
  const events = await getAllToolUsageEvents();
  const metricsByTool = {};

  for (const event of events) {
    const toolId = event.tool_id || "unknown";
    if (!metricsByTool[toolId]) {
      metricsByTool[toolId] = {
        totalRuns: 0,
        successRuns: 0,
        failureRuns: 0,
        lastUsedAt: null,
        totalDurationMs: 0,
        recentEvents: [],
      };
    }

    const m = metricsByTool[toolId];
    m.totalRuns += 1;
    if (event.status === "failure") {
      m.failureRuns += 1;
    } else {
      m.successRuns += 1;
    }

    if (event.duration_ms) {
      m.totalDurationMs += Number(event.duration_ms) || 0;
    }

    const eventTime = event.created_at ? new Date(event.created_at).getTime() : 0;
    const currentLast = m.lastUsedAt ? new Date(m.lastUsedAt).getTime() : 0;
    if (eventTime > currentLast) {
      m.lastUsedAt = event.created_at;
    }

    if (m.recentEvents.length < 5) {
      m.recentEvents.push(event);
    }
  }

  return { metricsByTool, totalEvents: events.length };
}

/**
 * Return summary KPI statistics for Tools Management
 */
export async function getToolsStats() {
  const overrides = readToolsConfig();
  const { totalEvents } = await getAggregatedToolMetrics();

  let totalTools = CANONICAL_TOOLS.length;
  let liveTools = 0;
  let maintenanceTools = 0;
  let devTools = 0;

  for (const tool of CANONICAL_TOOLS) {
    const status = overrides[tool.id]?.status || tool.defaultStatus;
    if (status === "live") liveTools += 1;
    else if (status === "maintenance") maintenanceTools += 1;
    else devTools += 1;
  }

  return {
    total: {
      value: totalTools.toString(),
      label: "Registered in catalog",
      state: "neutral",
    },
    live: {
      value: liveTools.toString(),
      label: `${Math.round((liveTools / totalTools) * 100)}% operational`,
      state: liveTools > 0 ? "positive" : "neutral",
    },
    maintenance: {
      value: maintenanceTools.toString(),
      label: maintenanceTools === 0 ? "All systems normal" : "Requires attention",
      state: maintenanceTools > 0 ? "negative" : "positive",
    },
    operations: {
      value: totalEvents.toLocaleString(),
      label: "Total platform executions",
      state: "positive",
    },
  };
}

/**
 * Return the list of tools with telemetry and filtering applied
 */
export async function getToolsList({
  search = "",
  status = "all",
  category = "all",
  sort = "most_used",
} = {}) {
  const overrides = readToolsConfig();
  const { metricsByTool } = await getAggregatedToolMetrics();

  let tools = CANONICAL_TOOLS.map((tool) => {
    const override = overrides[tool.id] || {};
    const effectiveStatus = override.status || tool.defaultStatus;
    const metrics = metricsByTool[tool.id] || {
      totalRuns: 0,
      successRuns: 0,
      failureRuns: 0,
      lastUsedAt: null,
      totalDurationMs: 0,
      recentEvents: [],
    };

    const avgDuration =
      metrics.totalRuns > 0
        ? Math.round(metrics.totalDurationMs / metrics.totalRuns)
        : 0;

    const successRate =
      metrics.totalRuns > 0
        ? Math.round((metrics.successRuns / metrics.totalRuns) * 100)
        : 100;

    return {
      ...tool,
      status: effectiveStatus,
      maintenanceNotice: override.maintenanceNotice || "",
      updatedAt: override.updatedAt || null,
      totalRuns: metrics.totalRuns,
      successRuns: metrics.successRuns,
      failureRuns: metrics.failureRuns,
      successRate,
      avgDurationMs: avgDuration,
      lastUsedAt: metrics.lastUsedAt,
    };
  });

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    tools = tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }

  // Status filter
  if (status && status !== "all") {
    tools = tools.filter((t) => t.status === status);
  }

  // Category filter
  if (category && category !== "all") {
    tools = tools.filter((t) =>
      t.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Sorting
  tools.sort((a, b) => {
    if (sort === "most_used") {
      return b.totalRuns - a.totalRuns;
    }
    if (sort === "name_asc") {
      return a.name.localeCompare(b.name);
    }
    if (sort === "name_desc") {
      return b.name.localeCompare(a.name);
    }
    if (sort === "category") {
      return a.category.localeCompare(b.category);
    }
    if (sort === "status") {
      const order = { live: 1, maintenance: 2, development: 3 };
      return (order[a.status] || 99) - (order[b.status] || 99);
    }
    return 0;
  });

  return tools;
}

/**
 * Return detailed telemetry for a single tool
 */
export async function getToolDetails(toolId) {
  const tool = CANONICAL_TOOLS.find((t) => t.id === toolId);
  if (!tool) return null;

  const overrides = readToolsConfig();
  const override = overrides[toolId] || {};
  const { metricsByTool } = await getAggregatedToolMetrics();
  const metrics = metricsByTool[toolId] || {
    totalRuns: 0,
    successRuns: 0,
    failureRuns: 0,
    lastUsedAt: null,
    totalDurationMs: 0,
    recentEvents: [],
  };

  const avgDuration =
    metrics.totalRuns > 0
      ? Math.round(metrics.totalDurationMs / metrics.totalRuns)
      : 0;

  const successRate =
    metrics.totalRuns > 0
      ? Math.round((metrics.successRuns / metrics.totalRuns) * 100)
      : 100;

  return {
    ...tool,
    status: override.status || tool.defaultStatus,
    maintenanceNotice: override.maintenanceNotice || "",
    updatedAt: override.updatedAt || null,
    totalRuns: metrics.totalRuns,
    successRuns: metrics.successRuns,
    failureRuns: metrics.failureRuns,
    successRate,
    avgDurationMs: avgDuration,
    lastUsedAt: metrics.lastUsedAt,
    recentEvents: metrics.recentEvents,
  };
}

/**
 * Update the status of a specific tool
 */
export async function updateToolStatus(toolId, status, notice = "") {
  const validStatuses = ["live", "maintenance", "development"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid tool status: ${status}`);
  }

  const success = writeToolsConfig(toolId, {
    status,
    maintenanceNotice: notice,
  });

  return { success, toolId, status };
}
