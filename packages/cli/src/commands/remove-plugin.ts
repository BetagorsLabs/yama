import { existsSync } from "fs";
import { execSync } from "child_process";
import { findYamaConfig } from "../utils/project-detection.ts";
import { getConfigDir, readYamaConfig, writeYamaConfig } from "../utils/file-utils.ts";
import { success, error } from "../utils/cli-utils.ts";
import { detectPackageManager } from "../utils/project-detection.ts";

interface RemovePluginOptions {
  config?: string;
  name?: string;
  keepPackage?: boolean; // Keep the npm package, only remove from yama.yaml
}

export async function removePluginCommand(options: RemovePluginOptions): Promise<void> {
  const configPath = options.config || findYamaConfig() || "yama.yaml";

  if (!existsSync(configPath)) {
    error(`Config file not found: ${configPath}`);
    process.exit(1);
  }

  if (!options.name) {
    error("Plugin name is required. Use --name <name> or -n <name>");
    process.exit(1);
  }

  const pluginName = options.name.trim();

  try {
    const config = readYamaConfig(configPath) as {
      plugins?: Record<string, Record<string, unknown>> | string[];
    };

    // Check if plugin exists
    let pluginExists = false;
    if (config.plugins) {
      if (Array.isArray(config.plugins)) {
        pluginExists = config.plugins.includes(pluginName);
      } else {
        pluginExists = pluginName in config.plugins;
      }
    }

    if (!pluginExists) {
      error(`Plugin "${pluginName}" is not configured in yama.yaml`);
      process.exit(1);
    }

    // Remove from yama.yaml
    if (Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter(p => p !== pluginName);
      if (config.plugins.length === 0) {
        delete config.plugins;
      }
    } else if (typeof config.plugins === "object") {
      delete config.plugins[pluginName];
      if (Object.keys(config.plugins).length === 0) {
        delete config.plugins;
      }
    }

    writeYamaConfig(configPath, config);
    success(`Plugin "${pluginName}" removed from yama.yaml`);

    // Uninstall the package if not keep-package
    if (!options.keepPackage) {
      console.log(`📦 Uninstalling package: ${pluginName}`);
      const packageManager = detectPackageManager();
      const configDir = getConfigDir(configPath);
      
      try {
        execSync(`${packageManager} remove ${pluginName}`, { 
          cwd: configDir, 
          stdio: "inherit" 
        });
        console.log(`✅ Package uninstalled`);
      } catch (err) {
        console.warn(`⚠️  Failed to uninstall package: ${err instanceof Error ? err.message : String(err)}`);
        console.log(`   You can uninstall it manually: ${packageManager} remove ${pluginName}`);
      }
    }

    console.log("\n💡 Next steps:");
    console.log(`   Run 'yama generate' to update generated code`);
  } catch (err) {
    error(`Failed to remove plugin: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

