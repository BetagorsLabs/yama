import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { findYamaConfig } from "../utils/project-detection.ts";
import { getConfigDir } from "../utils/file-utils.ts";
import { success, error } from "../utils/cli-utils.ts";

interface AddHandlerOptions {
  config?: string;
  name?: string;
}

export async function addHandlerCommand(options: AddHandlerOptions): Promise<void> {
  const configPath = options.config || findYamaConfig() || "yama.yaml";

  if (!existsSync(configPath)) {
    error(`Config file not found: ${configPath}`);
    process.exit(1);
  }

  if (!options.name) {
    error("Handler name is required. Use --name <name> or -n <name>");
    process.exit(1);
  }

  const handlerName = options.name.trim();

  // Validate handler name
  if (handlerName.length === 0) {
    error("Handler name cannot be empty");
    process.exit(1);
  }

  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(handlerName)) {
    error("Handler name must be a valid JavaScript identifier");
    process.exit(1);
  }

  try {
    const configDir = getConfigDir(configPath);
    const handlersDir = join(configDir, "src", "handlers");
    const handlerFile = join(handlersDir, `${handlerName}.ts`);

    // Check if handler already exists
    if (existsSync(handlerFile)) {
      error(`Handler file already exists: ${handlerFile}`);
      process.exit(1);
    }

    // Ensure handlers directory exists
    const { mkdirSync } = await import("fs");
    mkdirSync(handlersDir, { recursive: true });

    // Create handler template
    const handlerTemplate = `import type { HandlerContext } from "@betagors/yama-core";

export async function ${handlerName}(
  context: HandlerContext
): Promise<unknown> {
  // TODO: Implement handler logic
  return {};
}
`;

    writeFileSync(handlerFile, handlerTemplate, "utf-8");
    success(`Handler file created at ${handlerFile}`);

    console.log("\n💡 Next steps:");
    console.log("   1. Implement the handler logic");
    console.log("   2. Add an endpoint in yama.yaml that references this handler");
    console.log("   3. Run 'yama generate' to update types and SDK");
    console.log("   4. Run 'yama dev' to test your endpoint");
  } catch (err) {
    error(`Failed to create handler: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

