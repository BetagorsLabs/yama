import { existsSync } from "fs";
import { readYamaConfig } from "../utils/file-utils.js";
import { findYamaConfig } from "../utils/project-detection.js";
import { createModelValidator, type YamaModels } from "@yama/core";

interface ValidateOptions {
  config?: string;
  strict?: boolean;
}

export async function validateCommand(options: ValidateOptions): Promise<void> {
  const configPath = options.config || findYamaConfig() || "yama.yaml";

  if (!existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    process.exit(1);
  }

  console.log(`🔍 Validating ${configPath}...\n`);

  try {
    const config = readYamaConfig(configPath) as {
      name?: string;
      version?: string;
      models?: YamaModels;
      endpoints?: Array<{
        path: string;
        method: string;
        handler: string;
        params?: unknown;
        query?: unknown;
        body?: { type: string };
        response?: { type: string };
      }>;
    };

    let isValid = true;
    const errors: string[] = [];

    // Validate basic structure
    if (!config.name) {
      errors.push("❌ Missing 'name' field");
      isValid = false;
    }

    if (!config.version) {
      errors.push("❌ Missing 'version' field");
      isValid = false;
    }

    // Validate models
    if (config.models) {
      const validator = createModelValidator();
      validator.registerModels(config.models);

      console.log(`✅ Found ${Object.keys(config.models).length} model(s)`);

      // Validate each model
      for (const [modelName, modelDef] of Object.entries(config.models)) {
        if (!modelDef.fields || Object.keys(modelDef.fields).length === 0) {
          errors.push(`❌ Model '${modelName}' has no fields`);
          isValid = false;
        }
      }
    } else {
      console.log("⚠️  No models defined");
    }

    // Validate endpoints
    if (config.endpoints) {
      console.log(`✅ Found ${config.endpoints.length} endpoint(s)`);

      for (const endpoint of config.endpoints) {
        if (!endpoint.path) {
          errors.push(`❌ Endpoint missing 'path' field`);
          isValid = false;
        }

        if (!endpoint.method) {
          errors.push(`❌ Endpoint ${endpoint.path || "unknown"} missing 'method' field`);
          isValid = false;
        }

        if (!endpoint.handler) {
          errors.push(`❌ Endpoint ${endpoint.method} ${endpoint.path} missing 'handler' field`);
          isValid = false;
        }

        // Validate body/response model references
        if (endpoint.body?.type && config.models && !config.models[endpoint.body.type]) {
          errors.push(`❌ Endpoint ${endpoint.method} ${endpoint.path} references unknown model: ${endpoint.body.type}`);
          isValid = false;
        }

        if (endpoint.response?.type && config.models && !config.models[endpoint.response.type]) {
          errors.push(`❌ Endpoint ${endpoint.method} ${endpoint.path} references unknown model: ${endpoint.response.type}`);
          isValid = false;
        }
      }
    } else {
      console.log("⚠️  No endpoints defined");
    }

    // Display results
    if (errors.length > 0) {
      console.log("\n❌ Validation errors:\n");
      errors.forEach(error => console.log(`   ${error}`));
      isValid = false;
    }

    if (isValid) {
      console.log("\n✅ Configuration is valid!");
      process.exit(0);
    } else {
      console.log("\n❌ Configuration has errors");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Validation failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

