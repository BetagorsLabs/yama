import { existsSync } from "fs";
import { findYamaConfig } from "./project-detection.ts";
import { getConfigDir, readYamaConfig } from "./file-utils.ts";
import { resolveEnvVars, loadEnvFile, setPluginRegistryConfig, loadPlugin, getAllCLICommands } from "@betagors/yama-core";
import type { PluginCLICommand } from "@betagors/yama-core";

/**
 * Load plugins from yama.yaml and return their CLI commands
 */
export async function loadPluginCommands(configPath?: string): Promise<PluginCLICommand[]> {
  const yamaConfigPath = configPath || findYamaConfig() || "yama.yaml";
  
  if (!existsSync(yamaConfigPath)) {
    return [];
  }

  try {
    const environment = process.env.NODE_ENV || "development";
    loadEnvFile(yamaConfigPath, environment);
    let config = readYamaConfig(yamaConfigPath) as {
      plugins?: Record<string, Record<string, unknown>> | string[];
    };
    config = resolveEnvVars(config) as typeof config;
    const configDir = getConfigDir(yamaConfigPath);

    // Set plugin registry config
    setPluginRegistryConfig(config, configDir);

    // Get plugin list
    const pluginList: string[] = [];
    if (config.plugins) {
      if (Array.isArray(config.plugins)) {
        pluginList.push(...config.plugins);
      } else {
        pluginList.push(...Object.keys(config.plugins));
      }
    }

    // Load all plugins
    for (const pluginName of pluginList) {
      try {
        const pluginConfig = typeof config.plugins === "object" && !Array.isArray(config.plugins)
          ? config.plugins[pluginName] || {}
          : {};
        await loadPlugin(pluginName, configDir, pluginConfig);
      } catch (error) {
        // Log but don't fail - some plugins might not be installed
        console.warn(`Warning: Failed to load plugin ${pluginName}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Get all CLI commands from loaded plugins
    return getAllCLICommands();
  } catch (error) {
    // If loading fails, return empty array
    console.warn(`Warning: Failed to load plugin commands: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
