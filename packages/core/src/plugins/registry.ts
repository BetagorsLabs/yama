import type { ServicePlugin, PluginManifest } from "./base.js";
import { loadPluginFromPackage, importPlugin } from "./loader.js";
import { validateServicePlugin, validatePluginVersion } from "./validator.js";

/**
 * Service plugin registry
 */
class ServicePluginRegistry {
  private plugins = new Map<string, ServicePlugin>();
  private manifests = new Map<string, PluginManifest>();

  /**
   * Load and register a service plugin
   */
  async loadServicePlugin(packageName: string): Promise<ServicePlugin> {
    // Check if already loaded
    if (this.plugins.has(packageName)) {
      return this.plugins.get(packageName)!;
    }

    // Load manifest
    const manifest = await loadPluginFromPackage(packageName);

    // Import plugin
    const plugin = await importPlugin(manifest, packageName);

    // Validate plugin
    const validation = validateServicePlugin(plugin);
    if (!validation.valid) {
      throw new Error(
        `Invalid plugin ${packageName}: ${validation.errors?.join(", ")}`
      );
    }

    // Validate version compatibility
    const versionValidation = validatePluginVersion(plugin, "0.1.0"); // TODO: Get actual core version
    if (!versionValidation.valid) {
      console.warn(
        `Plugin ${packageName} version compatibility warning: ${versionValidation.errors?.join(", ")}`
      );
    }

    // Register plugin
    this.plugins.set(packageName, plugin);
    this.manifests.set(packageName, manifest);

    return plugin;
  }

  /**
   * Get a loaded plugin by package name
   */
  getPlugin(packageName: string): ServicePlugin | null {
    return this.plugins.get(packageName) || null;
  }

  /**
   * Get all loaded plugins
   */
  getAllPlugins(): ServicePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by type
   */
  getPluginByType(type: string): ServicePlugin | null {
    for (const plugin of this.plugins.values()) {
      if (plugin.manifest.type === type) {
        return plugin;
      }
    }
    return null;
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    this.plugins.clear();
    this.manifests.clear();
  }
}

// Singleton instance
export const servicePluginRegistry = new ServicePluginRegistry();

/**
 * Load a service plugin
 */
export async function loadServicePlugin(
  packageName: string
): Promise<ServicePlugin> {
  return servicePluginRegistry.loadServicePlugin(packageName);
}

/**
 * Get a service plugin
 */
export function getServicePlugin(packageName: string): ServicePlugin | null {
  return servicePluginRegistry.getPlugin(packageName);
}

/**
 * Get service plugin by type
 */
export function getServicePluginByType(type: string): ServicePlugin | null {
  return servicePluginRegistry.getPluginByType(type);
}

