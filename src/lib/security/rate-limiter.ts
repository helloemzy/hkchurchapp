import { NextRequest } from 'next/server';

/**
 * Rate limiting configuration for different endpoint types
 */
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate limiting result
 */
export interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
  remaining?: number;
}

/**
 * In-memory rate limiting store
 * In production, this should use Redis for distributed rate limiting
 */
class InMemoryRateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();
  
  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const existing = this.store.get(key);
    
    if (!existing || existing.resetTime < now) {
      // Create new window
      const entry = { count: 1, resetTime };
      this.store.set(key, entry);
      return entry;
    }
    
    // Increment existing window
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }
  
  async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Rate limiter instance
 */
export class RateLimiter {
  private store = new InMemoryRateLimitStore();
  
  private static configs: Map<string, RateLimitConfig> = new Map([
    ['auth', { 
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 attempts per window
      keyGenerator: (req) => `auth:${this.getClientIP(req)}`,
      skipSuccessfulRequests: true,
    }],
    ['api-general', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 requests per minute
      keyGenerator: (req) => `api:${this.getClientIP(req)}`,
    }],
    ['api-expensive', {
      windowMs: 60 * 1000, // 1 minute  
      maxRequests: 10, // 10 requests per minute for heavy operations
      keyGenerator: (req) => `expensive:${this.getClientIP(req)}`,
    }],
    ['user-specific', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 200, // 200 requests per user per minute
      keyGenerator: (req) => `user:${this.getUserID(req)}`,
    }],
  ]);

  /**
   * Check rate limit for a request
   */
  async checkLimit(
    request: NextRequest, 
    type: string = 'api-general'
  ): Promise<RateLimitResult> {
    const config = RateLimiter.configs.get(type);
    if (!config) {
      throw new Error(`Unknown rate limit type: ${type}`);
    }
    
    const key = config.keyGenerator(request);
    const result = await this.store.increment(key, config.windowMs);
    
    if (result.count > config.maxRequests) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      return { 
        success: false, 
        retryAfter: Math.max(retryAfter, 1),
        remaining: 0
      };
    }
    
    return { 
      success: true,
      remaining: Math.max(config.maxRequests - result.count, 0)
    };
  }

  /**
   * Get client IP address from request
   */
  private static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
      return realIP;
    }
    
    const clientIP = request.headers.get('cf-connecting-ip');
    if (clientIP) {
      return clientIP;
    }
    
    return 'unknown';
  }

  /**
   * Get user ID from request (if authenticated)
   */
  private static getUserID(request: NextRequest): string {
    const userId = request.headers.get('x-user-id');
    return userId || `anonymous:${this.getClientIP(request)}`;
  }

  /**
   * Cleanup expired entries
   */
  async cleanup(): Promise<void> {
    await this.store.cleanup();
  }
}

/**
 * Global rate limiter instance
 */
export const rateLimiter = new RateLimiter();

/**
 * Rate limiting middleware helper
 */
export async function rateLimit(
  request: NextRequest,
  type: string = 'api-general'
): Promise<RateLimitResult> {
  return rateLimiter.checkLimit(request, type);
}

/**
 * Cleanup expired rate limit entries periodically
 */
if (typeof global !== 'undefined') {
  // Only run cleanup in server environment
  setInterval(() => {
    rateLimiter.cleanup().catch(console.error);
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}