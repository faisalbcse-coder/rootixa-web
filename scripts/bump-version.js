#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const VERSION_FILE = path.join(ROOT_DIR, "lib", "version.js");
const PKG_FILE = path.join(ROOT_DIR, "package.json");

function incrementVersion(versionStr) {
  const parts = versionStr.split(".").map(Number);
  while (parts.length < 4) parts.push(0);
  // Increment the build/patch number (4th segment)
  parts[3] = (parts[3] || 0) + 1;
  return parts.join(".");
}

function run() {
  const args = process.argv.slice(2);
  let targetTool = null;
  const isAll = args.includes("--all");
  const withApp = args.includes("--with-app") || isAll;

  for (const arg of args) {
    if (arg.startsWith("--tool=")) {
      targetTool = arg.split("=")[1];
    } else if (arg === "--tool" && args[args.indexOf(arg) + 1]) {
      targetTool = args[args.indexOf(arg) + 1];
    }
  }

  if (!fs.existsSync(VERSION_FILE)) {
    console.error("lib/version.js not found!");
    process.exit(1);
  }

  let versionContent = fs.readFileSync(VERSION_FILE, "utf8");

  // Bump Rootixa App Version if no specific tool OR if --all / --with-app is set
  if (!targetTool || withApp) {
    const rootixaMatch = versionContent.match(/export const ROOTIXA_VERSION = ["']([^"']+)["']/);
    if (rootixaMatch) {
      const oldVersion = rootixaMatch[1];
      const newVersion = incrementVersion(oldVersion);
      versionContent = versionContent.replace(
        `export const ROOTIXA_VERSION = "${oldVersion}"`,
        `export const ROOTIXA_VERSION = "${newVersion}"`
      );

      // Update package.json
      if (fs.existsSync(PKG_FILE)) {
        const pkg = JSON.parse(fs.readFileSync(PKG_FILE, "utf8"));
        pkg.version = newVersion;
        fs.writeFileSync(PKG_FILE, JSON.stringify(pkg, null, 2) + "\n", "utf8");
      }

      console.log(`[Version Bump] Rootixa App: ${oldVersion} -> ${newVersion}`);
    }
  }

  // Bump All Tools if --all
  if (isAll) {
    const toolRegex = /("([a-z-]+)":\s*["'])([^"']+)(["'])/g;
    versionContent = versionContent.replace(toolRegex, (match, p1, toolName, ver, p4) => {
      const newVer = incrementVersion(ver);
      console.log(`[Version Bump] Tool (${toolName}): ${ver} -> ${newVer}`);
      return `${p1}${newVer}${p4}`;
    });
  } else if (targetTool) {
    // Bump Single Tool Version
    const toolRegex = new RegExp(`("${targetTool}":\\s*["'])([^"']+)(["'])`);
    const match = versionContent.match(toolRegex);
    if (match) {
      const oldToolVer = match[2];
      const newToolVer = incrementVersion(oldToolVer);
      versionContent = versionContent.replace(toolRegex, `$1${newToolVer}$3`);
      console.log(`[Version Bump] Tool (${targetTool}): ${oldToolVer} -> ${newToolVer}`);
    } else {
      console.error(`Tool "${targetTool}" not found in lib/version.js!`);
    }
  }

  fs.writeFileSync(VERSION_FILE, versionContent, "utf8");
}

run();
