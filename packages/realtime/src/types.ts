/**
 * Realtime configuration types
 */

export interface RealtimeConfig {
  /**
   * WebSocket path (default: /ws)
   */
  path?: string;
  
  /**
   * Use Redis for pub/sub (default: true if Redis cache plugin is available)
   */
  redis?: boolean;
  
  /**
   * Development tools configuration
   */
  dev?: {
    /**
     * Log all events to console
     */
    logEvents?: boolean;
    
    /**
     * Enable inspector UI at /realtime-inspector
     */
    inspectorUI?: boolean;
  };
}

export interface RealtimeEntityConfig {
  /**
   * Enable realtime for this entity
   */
  enabled?: boolean;
  
  /**
   * Which events to emit (default: all)
   */
  events?: ("created" | "updated" | "deleted")[];
  
  /**
   * Which fields trigger update events (default: all)
   */
  watchFields?: string[];
  
  /**
   * Custom channel prefix (default: entity name lowercase)
   */
  channelPrefix?: string;
}

export interface RealtimeChannelConfig {
  /**
   * Channel name
   */
  name: string;
  
  /**
   * WebSocket path pattern (e.g., /notifications, /chat/:roomId)
   */
  path: string;
  
  /**
   * Authentication configuration
   */
  auth?: {
    /**
     * Require authentication
     */
    required?: boolean;
    
    /**
     * Custom auth handler function name
     */
    handler?: string;
  };
  
  /**
   * Path parameters definition
   */
  params?: Record<string, {
    type: string;
    required?: boolean;
  }>;
}

