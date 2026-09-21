/**
 * Rootixa Version Management System
 * Standard 4-segment format: Major.Minor.Patch.Build (e.g. 1.0.0.0)
 */

export const ROOTIXA_VERSION = "1.0.0.0";

export const TOOL_VERSIONS = {
  "qr-code": "1.0.0.0",
  "qr-code-scanner": "1.0.0.0",
  "lorem-ipsum": "1.0.0.0",
};

/**
 * Retrieve current version of Rootixa app
 */
export function getAppVersion() {
  return ROOTIXA_VERSION;
}

/**
 * Retrieve version of a specific tool
 */
export function getToolVersion(toolId) {
  return TOOL_VERSIONS[toolId] || "1.0.0.0";
}
