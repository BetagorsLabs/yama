import { existsSync } from "fs";
import { readYamaConfig } from "../utils/file-utils.js";
import { findYamaConfig } from "../utils/project-detection.js";
import type { YamaModels } from "@yama/core";

interface ModelsOptions {
  config?: string;
}

export async function modelsCommand(options: ModelsOptions): Promise<void> {
  const configPath = options.config || findYamaConfig() || "yama.yaml";

  if (!existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    process.exit(1);
  }

  try {
    const config = readYamaConfig(configPath) as {
      models?: YamaModels;
    };

    if (!config.models || Object.keys(config.models).length === 0) {
      console.log("No models defined");
      return;
    }

    console.log(`📦 Models (${Object.keys(config.models).length}):\n`);

    for (const [modelName, modelDef] of Object.entries(config.models)) {
      console.log(`${modelName}:`);
      
      if (modelDef.fields) {
        for (const [fieldName, field] of Object.entries(modelDef.fields)) {
          const required = field.required ? "required" : "optional";
          const type = field.$ref || field.type || "unknown";
          const defaultVal = field.default !== undefined ? ` (default: ${JSON.stringify(field.default)})` : "";
          
          console.log(`  - ${fieldName}: ${type} [${required}]${defaultVal}`);
        }
      }
      
      console.log();
    }
  } catch (error) {
    console.error("❌ Failed to read models:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

