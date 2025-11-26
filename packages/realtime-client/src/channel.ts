import type { YamaRealtimeClient } from "./client";

/**
 * Realtime Channel
 */
export class RealtimeChannel {
  private client: YamaRealtimeClient;
  private path: string;
  private subscribed = false;
  private eventHandlers = new Map<string, Set<(data: unknown) => void>>();

  constructor(client: YamaRealtimeClient, path: string) {
    this.client = client;
    this.path = path;
  }

  /**
   * Subscribe to the channel
   */
  async subscribe(): Promise<void> {
    if (this.subscribed) {
      return;
    }

    if (!this.client.isConnected) {
      await this.client.connect();
    }

    this.client.send({
      type: "subscribe",
      channel: this.path,
    });
  }

  /**
   * Unsubscribe from the channel
   */
  unsubscribe(): void {
    if (!this.subscribed) {
      return;
    }

    if (this.client.isConnected) {
      this.client.send({
        type: "unsubscribe",
        channel: this.path,
      });
    }

    this.subscribed = false;
    this.eventHandlers.clear();
  }

  /**
   * Subscribe to a specific event
   */
  on(event: string, handler: (data: unknown) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);

    // Auto-subscribe to channel if not already subscribed
    if (!this.subscribed) {
      this.subscribe().catch((error) => {
        console.error(`Failed to subscribe to channel ${this.path}:`, error);
      });
    }
  }

  /**
   * Unsubscribe from a specific event
   */
  off(event: string, handler?: (data: unknown) => void): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      if (handler) {
        handlers.delete(handler);
      } else {
        handlers.clear();
      }
    }
  }

  /**
   * Handle subscription confirmation
   */
  handleSubscribed(): void {
    this.subscribed = true;
  }

  /**
   * Handle incoming event
   */
  handleEvent(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get subscription state
   */
  get isSubscribed(): boolean {
    return this.subscribed;
  }
}

