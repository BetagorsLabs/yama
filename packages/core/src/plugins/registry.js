import { loadPluginFromPackage, importPlugin } from "./loader";
import { validateYamaPlugin, validateServicePlugin, validatePluginVersion } from "./validator";
/**
 * Plugin registry
 */
class PluginRegistry {
    constructor() {
        this.plugins = new Map();
        this.manifests = new Map();
    }
    /**
     * Load and register a plugin
     * @param packageName - Name of the package to load
     * @param projectDir - Optional project directory to resolve packages from
     */
    async loadPlugin(packageName, projectDir) {
        // Check if already loaded
        if (this.plugins.has(packageName)) {
            return this.plugins.get(packageName);
        }
        // Load manifest
        const manifest = await loadPluginFromPackage(packageName, projectDir);
        // Import plugin
        const plugin = await importPlugin(manifest, packageName, projectDir);
        // Validate plugin
        const validation = validateYamaPlugin(plugin);
        if (!validation.valid) {
            throw new Error(`Invalid plugin ${packageName}: ${validation.errors?.join(", ")}`);
        }
        // Validate version compatibility
        const versionValidation = validatePluginVersion(plugin, "0.1.0"); // TODO: Get actual core version
        if (versionValidation.errors && versionValidation.errors.length > 0) {
            console.warn(`Plugin ${packageName} version compatibility warning: ${versionValidation.errors.join(", ")}`);
        }
        // Register plugin
        this.plugins.set(packageName, plugin);
        this.manifests.set(packageName, manifest);
        return plugin;
    }
    /**
     * Get a loaded plugin by package name
     */
    getPlugin(packageName) {
        return this.plugins.get(packageName) || null;
    }
    /**
     * Get all loaded plugins
     */
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
     * Get plugin by category
     */
    getPluginByCategory(category) {
        for (const plugin of this.plugins.values()) {
            if (plugin.category === category) {
                return plugin;
            }
        }
        return null;
    }
    /**
     * Get all plugins by category
     */
    getPluginsByCategory(category) {
        return Array.from(this.plugins.values()).filter((plugin) => plugin.category === category);
    }
    /**
     * Get plugin by type (for backward compatibility)
     */
    getPluginByType(type) {
        for (const plugin of this.plugins.values()) {
            if (plugin.manifest?.type === type) {
                return plugin;
            }
        }
        return null;
    }
    /**
     * Clear all plugins
     */
    clear() {
        this.plugins.clear();
        this.manifests.clear();
    }
}
// Singleton instance
export const pluginRegistry = new PluginRegistry();
/**
 * @deprecated Use pluginRegistry instead
 * Service plugin registry (kept for backward compatibility)
 */
class ServicePluginRegistry {
    constructor() {
        this.plugins = new Map();
        this.manifests = new Map();
    }
    /**
     * Load and register a service plugin
     * @param packageName - Name of the package to load
     * @param projectDir - Optional project directory to resolve packages from
     */
    async loadServicePlugin(packageName, projectDir) {
        // Check if already loaded
        if (this.plugins.has(packageName)) {
            return this.plugins.get(packageName);
        }
        // Load manifest
        const manifest = await loadPluginFromPackage(packageName, projectDir);
        // Import plugin
        const plugin = await importPlugin(manifest, packageName, projectDir);
        // Validate plugin
        const validation = validateServicePlugin(plugin);
        if (!validation.valid) {
            throw new Error(`Invalid plugin ${packageName}: ${validation.errors?.join(", ")}`);
        }
        // Validate version compatibility
        const versionValidation = validatePluginVersion(plugin, "0.1.0");
        if (!versionValidation.valid) {
            console.warn(`Plugin ${packageName} version compatibility warning: ${versionValidation.errors?.join(", ")}`);
        }
        // Register plugin
        this.plugins.set(packageName, plugin);
        this.manifests.set(packageName, manifest);
        return plugin;
    }
    /**
     * Get a loaded plugin by package name
     */
    getPlugin(packageName) {
        return this.plugins.get(packageName) || null;
    }
    /**
     * Get all loaded plugins
     */
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
     * Get plugin by type
     */
    getPluginByType(type) {
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
    clear() {
        this.plugins.clear();
        this.manifests.clear();
    }
}
// Singleton instance for backward compatibility
export const servicePluginRegistry = new ServicePluginRegistry();
/**
 * Load a plugin
 * @param packageName - Name of the package to load
 * @param projectDir - Optional project directory to resolve packages from
 */
export async function loadPlugin(packageName, projectDir) {
    return pluginRegistry.loadPlugin(packageName, projectDir);
}
/**
 * Get a plugin by package name
 */
export function getPlugin(packageName) {
    return pluginRegistry.getPlugin(packageName);
}
/**
 * Get all loaded plugins
 */
export function getAllPlugins() {
    return pluginRegistry.getAllPlugins();
}
/**
 * Get plugin by category
 */
export function getPluginByCategory(category) {
    return pluginRegistry.getPluginByCategory(category);
}
/**
 * Get all plugins by category
 */
export function getPluginsByCategory(category) {
    return pluginRegistry.getPluginsByCategory(category);
}
/**
 * Get plugin by type (for backward compatibility)
 */
export function getPluginByType(type) {
    return pluginRegistry.getPluginByType(type);
}
/**
 * @deprecated Use loadPlugin instead
 * Load a service plugin (kept for backward compatibility)
 */
export async function loadServicePlugin(packageName) {
    return servicePluginRegistry.loadServicePlugin(packageName);
}
/**
 * @deprecated Use getPlugin instead
 * Get a service plugin (kept for backward compatibility)
 */
export function getServicePlugin(packageName) {
    return servicePluginRegistry.getPlugin(packageName);
}
/**
 * @deprecated Use getPluginByType instead
 * Get service plugin by type (kept for backward compatibility)
 */
export function getServicePluginByType(type) {
    return servicePluginRegistry.getPluginByType(type);
}
//# sourceMappingURL=registry.js.map