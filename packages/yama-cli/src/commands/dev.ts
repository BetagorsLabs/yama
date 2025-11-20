import { existsSync } from "fs";
import { dirname, join } from "path";
import { startYamaNodeRuntime } from "@yama/runtime-node";
import type { FSWatcher } from "chokidar";
import chokidar from "chokidar";
import { findYamaConfig } from "../utils/project-detection.js";

interface DevOptions {
  port?: string;
  watch?: boolean;
  config?: string;
}

let serverProcess: { stop: () => Promise<void> } | null = null;
let watcher: FSWatcher | null = null;

export async function devCommand(options: DevOptions): Promise<void> {
  const port = parseInt(options.port || "4000", 10);
  const watch = options.watch !== false; // Default to true
  const configPath = options.config || findYamaConfig() || "yama.yaml";

  if (!existsSync(configPath)) {
    console.error(`❌ Config file not found: ${configPath}`);
    console.error("   Run 'yama init' to create a yama.yaml file");
    process.exit(1);
  }

  console.log(`🚀 Starting Yama dev server...\n`);
  console.log(`   Config: ${configPath}`);
  console.log(`   Port: ${port}`);
  console.log(`   Watch mode: ${watch ? "enabled" : "disabled"}\n`);

  // Start the server
  await startServer(port, configPath);

  // Setup watch mode
  if (watch) {
    setupWatchMode(configPath);
  }

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n\n🛑 Shutting down...");
    await cleanup();
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(0);
  });
}

async function startServer(port: number, configPath: string): Promise<void> {
  try {
    // Import and start the runtime
    // Note: This will need to be adapted based on how the runtime exports its start function
    await startYamaNodeRuntime(port, configPath);
    console.log(`✅ Server started on http://localhost:${port}\n`);
  } catch (error) {
    console.error("❌ Failed to start server:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function setupWatchMode(configPath: string): void {
  const configDir = dirname(configPath);
  const handlersDir = join(configDir, "src", "handlers");

  console.log("👀 Watching for changes...\n");

  // Watch yama.yaml
  watcher = chokidar.watch(configPath, {
    ignoreInitial: true,
    persistent: true
  });

  watcher.on("change", async (path) => {
    console.log(`\n📝 ${path} changed, restarting server...`);
    await restartServer(configPath);
  });

  // Watch handlers directory if it exists
  if (existsSync(handlersDir)) {
    const handlerWatcher = chokidar.watch(handlersDir, {
      ignoreInitial: true,
      persistent: true
    });

    handlerWatcher.on("change", async (changedPath: string) => {
      console.log(`\n📝 Handler changed: ${changedPath}, restarting server...`);
      await restartServer(configPath);
    });
  }

  console.log("   - Watching yama.yaml");
  if (existsSync(handlersDir)) {
    console.log("   - Watching src/handlers/");
  }
}

async function restartServer(configPath: string): Promise<void> {
  // Note: The current runtime doesn't support hot reloading
  // This would require refactoring the runtime to support it
  // For now, we'll just log that a restart is needed
  console.log("   ⚠️  Hot reload not yet implemented. Please restart manually.");
  console.log("   💡 Tip: Stop the server (Ctrl+C) and run 'yama dev' again");
}

async function cleanup(): Promise<void> {
  if (watcher) {
    await watcher.close();
  }
  // Cleanup server if needed
}

