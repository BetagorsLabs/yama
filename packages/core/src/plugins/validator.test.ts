import { describe, it, expect } from "vitest";
import {
  validateManifest,
  validateServicePlugin,
} from "./validator.js";
import type { PluginManifest, ServicePlugin } from "./base.js";

describe("Plugin Validator", () => {
  describe("validateManifest", () => {
    it("should validate correct manifest", () => {
      const manifest: PluginManifest = {
        pluginApi: "1.0",
        yamaCore: "^0.1.0",
        category: "service",
        type: "payment",
        service: "stripe",
      };

      const result = validateManifest(manifest);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it("should reject manifest without pluginApi", () => {
      const manifest = {
        yamaCore: "^0.1.0",
        category: "service",
        type: "payment",
      } as PluginManifest;

      const result = validateManifest(manifest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing pluginApi field");
    });

    it("should reject manifest with wrong category", () => {
      const manifest: PluginManifest = {
        pluginApi: "1.0",
        yamaCore: "^0.1.0",
        category: "database" as any,
        type: "payment",
      };

      const result = validateManifest(manifest);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid category: database. Expected "service"');
    });
  });

  describe("validateServicePlugin", () => {
    it("should validate correct plugin", () => {
      const plugin: ServicePlugin = {
        name: "@yama/service-stripe",
        version: "1.0.0",
        manifest: {
          pluginApi: "1.0",
          yamaCore: "^0.1.0",
          category: "service",
          type: "payment",
        },
        init: async () => {},
      };

      const result = validateServicePlugin(plugin);
      expect(result.valid).toBe(true);
    });

    it("should reject plugin without init method", () => {
      const plugin = {
        name: "@yama/service-stripe",
        version: "1.0.0",
        manifest: {
          pluginApi: "1.0",
          yamaCore: "^0.1.0",
          category: "service",
          type: "payment",
        },
      } as ServicePlugin;

      const result = validateServicePlugin(plugin);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Plugin must implement init() method");
    });

    it("should reject non-object plugin", () => {
      const result = validateServicePlugin(null as any);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Plugin must be an object");
    });
  });
});

