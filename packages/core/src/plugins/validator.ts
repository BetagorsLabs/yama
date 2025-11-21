import type { ServicePlugin, PluginManifest } from "./base.js";

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Validate plugin manifest
 */
export function validateManifest(manifest: PluginManifest): ValidationResult {
  const errors: string[] = [];

  if (!manifest.pluginApi) {
    errors.push("Missing pluginApi field");
  }

  if (!manifest.yamaCore) {
    errors.push("Missing yamaCore field");
  }

  if (!manifest.category) {
    errors.push("Missing category field");
  } else if (manifest.category !== "service") {
    errors.push(`Invalid category: ${manifest.category}. Expected "service"`);
  }

  if (!manifest.type) {
    errors.push("Missing type field");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate service plugin interface
 */
export function validateServicePlugin(plugin: unknown): ValidationResult {
  const errors: string[] = [];

  if (!plugin || typeof plugin !== "object") {
    return {
      valid: false,
      errors: ["Plugin must be an object"],
    };
  }

  const p = plugin as Partial<ServicePlugin>;

  if (!p.name || typeof p.name !== "string") {
    errors.push("Plugin must have a name property (string)");
  }

  if (!p.version || typeof p.version !== "string") {
    errors.push("Plugin must have a version property (string)");
  }

  if (!p.manifest || typeof p.manifest !== "object") {
    errors.push("Plugin must have a manifest property (object)");
  } else {
    const manifestResult = validateManifest(p.manifest);
    if (!manifestResult.valid && manifestResult.errors) {
      errors.push(...manifestResult.errors.map((e) => `Manifest: ${e}`));
    }
  }

  if (!p.init || typeof p.init !== "function") {
    errors.push("Plugin must implement init() method");
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validate plugin version compatibility
 */
export function validatePluginVersion(
  plugin: ServicePlugin,
  coreVersion: string
): ValidationResult {
  // Simple semver check - in a real implementation, use a semver library
  const errors: string[] = [];

  // For now, just check that yamaCore is specified
  if (!plugin.manifest.yamaCore) {
    errors.push("Plugin manifest missing yamaCore compatibility version");
  }

  // TODO: Implement proper semver range checking
  // This would require a semver library like semver

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

