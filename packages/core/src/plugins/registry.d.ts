import type { YamaPlugin, ServicePlugin } from "./base";
/**
 * Plugin registry
 */
declare class PluginRegistry {
    private plugins;
    private manifests;
    /**
     * Load and register a plugin
     * @param packageName - Name of the package to load
     * @param projectDir - Optional project directory to resolve packages from
     */
    loadPlugin(packageName: string, projectDir?: string): Promise<YamaPlugin>;
    /**
     * Get a loaded plugin by package name
     */
    getPlugin(packageName: string): YamaPlugin | null;
    /**
     * Get all loaded plugins
     */
    getAllPlugins(): YamaPlugin[];
    /**
     * Get plugin by category
     */
    getPluginByCategory(category: string): YamaPlugin | null;
    /**
     * Get all plugins by category
     */
    getPluginsByCategory(category: string): YamaPlugin[];
    /**
     * Get plugin by type (for backward compatibility)
     */
    getPluginByType(type: string): YamaPlugin | null;
    /**
     * Clear all plugins
     */
    clear(): void;
}
export declare const pluginRegistry: PluginRegistry;
/**
 * @deprecated Use pluginRegistry instead
 * Service plugin registry (kept for backward compatibility)
 */
declare class ServicePluginRegistry {
    private plugins;
    private manifests;
    /**
     * Load and register a service plugin
     * @param packageName - Name of the package to load
     * @param projectDir - Optional project directory to resolve packages from
     */
    loadServicePlugin(packageName: string, projectDir?: string): Promise<ServicePlugin>;
    /**
     * Get a loaded plugin by package name
     */
    getPlugin(packageName: string): ServicePlugin | null;
    /**
     * Get all loaded plugins
     */
    getAllPlugins(): ServicePlugin[];
    /**
     * Get plugin by type
     */
    getPluginByType(type: string): ServicePlugin | null;
    /**
     * Clear all plugins
     */
    clear(): void;
}
export declare const servicePluginRegistry: ServicePluginRegistry;
/**
 * Load a plugin
 * @param packageName - Name of the package to load
 * @param projectDir - Optional project directory to resolve packages from
 */
export declare function loadPlugin(packageName: string, projectDir?: string): Promise<YamaPlugin>;
/**
 * Get a plugin by package name
 */
export declare function getPlugin(packageName: string): YamaPlugin | null;
/**
 * Get all loaded plugins
 */
export declare function getAllPlugins(): YamaPlugin[];
/**
 * Get plugin by category
 */
export declare function getPluginByCategory(category: string): YamaPlugin | null;
/**
 * Get all plugins by category
 */
export declare function getPluginsByCategory(category: string): YamaPlugin[];
/**
 * Get plugin by type (for backward compatibility)
 */
export declare function getPluginByType(type: string): YamaPlugin | null;
/**
 * @deprecated Use loadPlugin instead
 * Load a service plugin (kept for backward compatibility)
 */
export declare function loadServicePlugin(packageName: string): Promise<ServicePlugin>;
/**
 * @deprecated Use getPlugin instead
 * Get a service plugin (kept for backward compatibility)
 */
export declare function getServicePlugin(packageName: string): ServicePlugin | null;
/**
 * @deprecated Use getPluginByType instead
 * Get service plugin by type (kept for backward compatibility)
 */
export declare function getServicePluginByType(type: string): ServicePlugin | null;
export {};
