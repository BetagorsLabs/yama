import { existsSync } from "fs";
import { join, dirname } from "path";

export type ProjectType = "nextjs" | "vite" | "react" | "node" | "unknown";

/**
 * Detect the project type based on configuration files
 */
export function detectProjectType(cwd: string = process.cwd()): ProjectType {
  if (existsSync(join(cwd, "next.config.js")) || 
      existsSync(join(cwd, "next.config.ts")) ||
      existsSync(join(cwd, "next.config.mjs"))) {
    return "nextjs";
  }
  
  if (existsSync(join(cwd, "vite.config.js")) || 
      existsSync(join(cwd, "vite.config.ts"))) {
    return "vite";
  }
  
  if (existsSync(join(cwd, "package.json"))) {
    // Check for React in package.json
    try {
      const pkg = require(join(cwd, "package.json"));
      if (pkg.dependencies?.react || pkg.devDependencies?.react) {
        return "react";
      }
    } catch {
      // Ignore errors
    }
    return "node";
  }
  
  return "unknown";
}

/**
 * Infer the output path for generated files based on project type
 */
export function inferOutputPath(
  projectType: ProjectType,
  type: "types" | "sdk" = "types"
): string {
  switch (projectType) {
    case "nextjs":
      return type === "types" 
        ? "lib/generated/types.ts"
        : "lib/generated/sdk.ts";
    
    case "vite":
    case "react":
      return type === "types"
        ? "src/lib/generated/types.ts"
        : "src/lib/generated/sdk.ts";
    
    case "node":
      return type === "types"
        ? "lib/generated/types.ts"
        : "lib/generated/sdk.ts";
    
    default:
      return type === "types"
        ? "generated/types.ts"
        : "generated/sdk.ts";
  }
}

/**
 * Find yama.yaml in the current directory or parent directories
 */
export function findYamaConfig(startPath: string = process.cwd()): string | null {
  let current = startPath;
  const startDir = current;
  
  while (current !== dirname(current)) {
    const configPath = join(current, "yama.yaml");
    if (existsSync(configPath)) {
      return configPath;
    }
    current = dirname(current);
  }
  
  // Check current directory one more time
  const configPath = join(startDir, "yama.yaml");
  if (existsSync(configPath)) {
    return configPath;
  }
  
  return null;
}

