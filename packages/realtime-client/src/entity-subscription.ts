import type { YamaRealtimeClient } from "./client";
import { RealtimeChannel } from "./channel";

/**
 * Entity Subscription (convenience wrapper for entity events)
 */
export class EntitySubscription {
  private client: YamaRealtimeClient;
  private entityName: string;
  private events: string[];
  private channel: RealtimeChannel;

  constructor(client: YamaRealtimeClient, entityName: string, events?: string[]) {
    this.client = client;
    this.entityName = entityName.toLowerCase();
    this.events = events || ["created", "updated", "deleted"];
    this.channel = client.channel(`${this.entityName}:created`);
  }

  /**
   * Subscribe to an entity event
   */
  on(event: "created" | "updated" | "deleted", handler: (data: unknown) => void): void {
    if (!this.events.includes(event)) {
      console.warn(`Event ${event} is not in the configured events list for ${this.entityName}`);
      return;
    }

    // Use the appropriate channel for the event
    const channelPath = `${this.entityName}:${event}`;
    const channel = this.client.channel(channelPath);
    channel.on(event, handler);
  }

  /**
   * Unsubscribe from all events
   */
  unsubscribe(): void {
    for (const event of this.events) {
      const channelPath = `${this.entityName}:${event}`;
      const channel = this.client.channel(channelPath);
      channel.unsubscribe();
    }
  }
}

