import type { RealtimeChannelConfig } from "./types";

/**
 * Channel registry entry
 */
export interface ChannelRegistryEntry {
  config: RealtimeChannelConfig;
  pattern: RegExp;
  paramNames: string[];
}

/**
 * Channel registry for managing channel definitions and path pattern matching
 */
export class ChannelRegistry {
  private channels = new Map<string, ChannelRegistryEntry>();

  /**
   * Register a channel
   */
  register(channel: RealtimeChannelConfig): void {
    // Convert Express-style path to regex pattern
    const { pattern, paramNames } = this.parsePathPattern(channel.path);
    
    this.channels.set(channel.name, {
      config: channel,
      pattern,
      paramNames,
    });
  }

  /**
   * Find a channel by path
   */
  findChannel(path: string): { channel: ChannelRegistryEntry; params: Record<string, string> } | null {
    for (const entry of this.channels.values()) {
      const match = path.match(entry.pattern);
      if (match) {
        const params: Record<string, string> = {};
        entry.paramNames.forEach((name, index) => {
          params[name] = match[index + 1] || "";
        });
        return { channel: entry, params };
      }
    }
    return null;
  }

  /**
   * Get channel by name
   */
  getChannel(name: string): ChannelRegistryEntry | null {
    return this.channels.get(name) || null;
  }

  /**
   * Get all registered channels
   */
  getAllChannels(): ChannelRegistryEntry[] {
    return Array.from(this.channels.values());
  }

  /**
   * Parse Express-style path pattern to regex
   * Example: /chat/:roomId -> /^\/chat\/([^\/]+)$/
   */
  private parsePathPattern(path: string): { pattern: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];
    let pattern = path
      .replace(/\//g, "\\/") // Escape slashes
      .replace(/:(\w+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return "([^\\/]+)"; // Match any non-slash characters
      });

    // Add anchors
    pattern = `^${pattern}$`;
    
    return {
      pattern: new RegExp(pattern),
      paramNames,
    };
  }
}

