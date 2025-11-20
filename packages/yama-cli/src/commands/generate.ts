import { existsSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { generateTypes } from "@yama/core";
import { readYamaConfig, ensureDir, getConfigDir } from "../utils/file-utils.js";
import { findYamaConfig, detectProjectType, inferOutputPath } from "../utils/project-detection.js";
import { generateFrameworkHelpers, updateFrameworkConfig } from "../utils/framework-helpers.js";
import chokidar from "chokidar";

interface GenerateOptions {
  config?: string;
  output?: string;
  watch?: boolean;
  typesOnly?: boolean;
  sdkOnly?: boolean;
  framework?: string;
}

export async function generateCommand(options: GenerateOptions): Promise<void> {
  const configPath = options.config || findYamaConfig() || "yama.yaml";

  if (!existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    console.error("   Run 'yama init' to create a yama.yaml file");
    process.exit(1);
  }

  const watch = options.watch || false;
  const typesOnly = options.typesOnly || false;
  const sdkOnly = options.sdkOnly || false;

  if (watch) {
    await generateWithWatch(configPath, options);
  } else {
    await generateOnce(configPath, options);
  }
}

async function generateOnce(configPath: string, options: GenerateOptions): Promise<void> {
  try {
    const config = readYamaConfig(configPath) as { models?: unknown; endpoints?: unknown };
    const configDir = getConfigDir(configPath);
    const projectType = detectProjectType(configDir);

    // Generate types
    if (!options.sdkOnly && config.models) {
      const typesOutput = getTypesOutputPath(configPath, options);
      await generateTypesFile(config.models, typesOutput, configDir);
    }

    // Generate SDK
    if (!options.typesOnly && config.endpoints) {
      const sdkOutput = getSdkOutputPath(configPath, options);
      await generateSdkFile(config, sdkOutput, configDir, options.framework);
    }

    // Generate framework helpers if framework is specified
    if (options.framework || projectType !== "unknown") {
      await generateFrameworkHelpers(projectType, options.framework, configDir);
      await updateFrameworkConfig(projectType, options.framework, configDir);
    }

    console.log("\n✅ Generation complete!");
  } catch (error) {
    console.error("❌ Generation failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function generateWithWatch(configPath: string, options: GenerateOptions): Promise<void> {
  console.log("👀 Watching for changes...\n");

  const watcher = chokidar.watch(configPath, {
    ignoreInitial: false,
    persistent: true
  });

  watcher.on("change", async () => {
    console.log(`\n📝 ${configPath} changed, regenerating...`);
    await generateOnce(configPath, options);
  });

  // Initial generation
  await generateOnce(configPath, options);

  // Keep process alive
  process.on("SIGINT", async () => {
    await watcher.close();
    process.exit(0);
  });
}

function getTypesOutputPath(configPath: string, options: GenerateOptions): string {
  if (options.output && options.typesOnly) {
    return options.output;
  }

  const configDir = getConfigDir(configPath);
  const projectType = detectProjectType(configDir);
  const inferredPath = inferOutputPath(projectType, "types");
  
  return join(configDir, inferredPath);
}

function getSdkOutputPath(configPath: string, options: GenerateOptions): string {
  if (options.output && options.sdkOnly) {
    return options.output;
  }

  const configDir = getConfigDir(configPath);
  const projectType = detectProjectType(configDir);
  const inferredPath = inferOutputPath(projectType, "sdk");
  
  return join(configDir, inferredPath);
}

async function generateTypesFile(
  models: unknown,
  outputPath: string,
  configDir: string
): Promise<void> {
  try {
    const types = generateTypes(models as Parameters<typeof generateTypes>[0]);
    const absoluteOutputPath = join(configDir, outputPath);
    const outputDir = dirname(absoluteOutputPath);
    
    ensureDir(outputDir);
    writeFileSync(absoluteOutputPath, types, "utf-8");
    
    console.log(`✅ Generated types: ${outputPath}`);
  } catch (error) {
    console.error("❌ Failed to generate types:", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

async function generateSdkFile(
  config: { models?: unknown; endpoints?: unknown },
  outputPath: string,
  configDir: string,
  framework?: string
): Promise<void> {
  // SDK generation will be implemented in @yama/sdk-ts
  // For now, we'll create a placeholder
  const sdkContent = `// This file is auto-generated from yama.yaml
// Do not edit manually - your changes will be overwritten

// SDK generation coming soon!
// Framework: ${framework || "auto-detected"}

export const api = {
  // Endpoints will be generated here
};
`;

  const absoluteOutputPath = join(configDir, outputPath);
  const outputDir = dirname(absoluteOutputPath);
  
  ensureDir(outputDir);
  writeFileSync(absoluteOutputPath, sdkContent, "utf-8");
  
  console.log(`✅ Generated SDK: ${outputPath}`);
  console.log("   ⚠️  SDK generation is a placeholder - full implementation coming soon!");
}

