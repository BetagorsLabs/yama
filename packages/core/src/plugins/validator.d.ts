import type { YamaPlugin, PluginManifest, ServicePlugin } from "./base";
/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}
/**
 * Validate plugin manifest (all fields are optional now)
 */
export declare function validateManifest(manifest: PluginManifest): ValidationResult;
/**
 * Validate YamaPlugin interface
 */
export declare function validateYamaPlugin(plugin: unknown): ValidationResult;
/**
 * @deprecated Use validateYamaPlugin instead
 * Validate service plugin interface (kept for backward compatibility)
 */
export declare function validateServicePlugin(plugin: unknown): ValidationResult;
/**
 * Validate plugin version compatibility
 */
export declare function validatePluginVersion(plugin: YamaPlugin | ServicePlugin, coreVersion: string): ValidationResult;
