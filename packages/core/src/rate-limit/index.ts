import type {
  RateLimitConfig,
  RateLimitStore,
  RateLimitKeyStrategy,
  RateLimitResult,
} from "./types";
import { createMemoryRateLimitStore, MemoryRateLimitStore } from "./memory-store";
import { createRedisRateLimitStore, RedisRateLimitStore } from "./redis-store";
import type { HttpRequest } from "../infrastructure/server";
import type { AuthContext } from "../schemas";

/**
 * Rate limiter instance
 */
export interface RateLimiter {
  /**
   * Check rate limit for a request
   * @param request - HTTP request object
   * @param authContext - Optional authentication context
   * @param config - Rate limit configuration (merged with defaults)
   * @returns Rate limit result
   */
  check(
    request: HttpRequest,
    authContext: AuthContext | undefined,
    config: RateLimitConfig
  ): Promise<RateLimitResult>;
}

/**
 * Create a rate limiter with the specified store
 */
export function createRateLimiter(store: RateLimitStore): RateLimiter {
  return {
    async check(
      request: HttpRequest,
      authContext: AuthContext | undefined,
      config: RateLimitConfig
    ): Promise<RateLimitResult> {
      const key = generateRateLimitKey(request, authContext, config.keyBy || "ip");
      return await store.checkAndIncrement(key, config.maxRequests, config.windowMs);
    },
  };
}

/**
 * Create a rate limiter from configuration
 * Automatically selects the appropriate store (memory or Redis)
 */
export async function createRateLimiterFromConfig(
  config: RateLimitConfig
): Promise<RateLimiter> {
  const storeType = config.store || "memory";

  let store: RateLimitStore;

  if (storeType === "redis") {
    try {
      store = await createRedisRateLimitStore(config.redis);
    } catch (error) {
      // Fallback to memory if Redis fails
      console.warn(
        `⚠️  Failed to create Redis rate limit store, falling back to memory: ${error instanceof Error ? error.message : String(error)}`
      );
      store = createMemoryRateLimitStore();
    }
  } else {
    store = createMemoryRateLimitStore();
  }

  return createRateLimiter(store);
}

/**
 * Generate a rate limit key based on the strategy
 */
function generateRateLimitKey(
  request: HttpRequest,
  authContext: AuthContext | undefined,
  keyBy: RateLimitKeyStrategy
): string {
  const ip = extractIpAddress(request);
  const parts: string[] = [];

  if (keyBy === "ip" || keyBy === "both") {
    parts.push(`ip:${ip}`);
  }

  if (keyBy === "user" || keyBy === "both") {
    if (authContext?.authenticated && authContext.user?.id) {
      parts.push(`user:${authContext.user.id}`);
    } else if (keyBy === "user") {
      // If user-based but not authenticated, fall back to IP
      parts.push(`ip:${ip}`);
    }
  }

  // If no parts (shouldn't happen), use IP as fallback
  if (parts.length === 0) {
    parts.push(`ip:${ip}`);
  }

  return parts.join(":");
}

/**
 * Extract IP address from request
 * Handles various proxy headers (X-Forwarded-For, X-Real-IP, etc.)
 */
function extractIpAddress(request: HttpRequest): string {
  const headers = request.headers || {};

  // Check X-Forwarded-For (may contain multiple IPs, take the first)
  const forwardedFor = headers["x-forwarded-for"];
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0] || "unknown";
  }

  // Check X-Real-IP
  const realIp = headers["x-real-ip"];
  if (realIp) {
    return realIp;
  }

  // Check CF-Connecting-IP (Cloudflare)
  const cfIp = headers["cf-connecting-ip"];
  if (cfIp) {
    return cfIp;
  }

  // Fallback to extracting from original request if available
  const original = request._original as any;
  if (original?.ip) {
    return original.ip;
  }

  if (original?.socket?.remoteAddress) {
    return original.socket.remoteAddress;
  }

  // Last resort
  return "unknown";
}

/**
 * Format rate limit headers according to RFC 6585
 */
export function formatRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
    "Retry-After": String(Math.ceil(result.resetAfter / 1000)), // In seconds
  };
}

// Export types and stores
export type { RateLimitConfig, RateLimitResult, RateLimitStore, RateLimitKeyStrategy } from "./types";
export { createMemoryRateLimitStore, MemoryRateLimitStore } from "./memory-store";
export { createRedisRateLimitStore, RedisRateLimitStore } from "./redis-store";

