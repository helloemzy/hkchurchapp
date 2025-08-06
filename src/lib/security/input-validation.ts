import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Validation schemas for user input
 * These schemas enforce strict validation for all user-provided data
 */
export const ValidationSchemas = {
  user: z.object({
    email: z.string().email('Invalid email format').max(255, 'Email too long'),
    full_name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name too long')
      .regex(/^[a-zA-Z\s\u4e00-\u9fff\u3400-\u4dbf]+$/, 'Name contains invalid characters'),
    phone: z.string().optional().refine(
      (val) => !val || /^[+]?[1-9]\d{1,14}$/.test(val),
      'Invalid phone number format'
    ),
    language: z.enum(['zh-HK', 'zh-CN', 'en']),
  }),
  
  auth: z.object({
    email: z.string().email('Invalid email format').max(255),
    password: z.string()
      .min(12, 'Password must be at least 12 characters')
      .max(128, 'Password too long')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Password must contain uppercase, lowercase, number, and special character'),
  }),
  
  content: z.object({
    title: z.record(z.string().min(1, 'Title is required').max(200, 'Title too long')),
    content: z.record(z.string().min(1, 'Content is required').max(5000, 'Content too long')),
    description: z.record(z.string().max(2000, 'Description too long')).optional(),
  }),
  
  event: z.object({
    title: z.record(z.string().min(1, 'Title is required').max(200, 'Title too long')),
    description: z.record(z.string().max(2000, 'Description too long')).optional(),
    start_time: z.string().datetime('Invalid start time'),
    end_time: z.string().datetime('Invalid end time'),
    location: z.record(z.string().max(300, 'Location too long')).optional(),
    max_attendees: z.number().int().min(1).max(1000).optional(),
    is_online: z.boolean().default(false),
  }),
};

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * Only allows safe HTML tags for rich content
 */
export function sanitizeHtml(input: string, allowRichContent = false): string {
  const config = allowRichContent ? {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'blockquote'],
    ALLOWED_ATTR: ['class'],
  } : {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  };
  
  return DOMPurify.sanitize(input, config);
}

/**
 * Validate input against a schema and return typed result
 */
export function validateInput<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Input validation failed',
        error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }))
      );
    }
    throw error;
  }
}

/**
 * Sanitize string input to prevent injection attacks
 * Removes potentially dangerous characters and patterns
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>'"&]/g, '') // Remove HTML-related characters
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize email addresses
 */
export function validateEmail(email: string): string {
  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new ValidationError('Invalid email format', [{ field: 'email', message: 'Invalid email format' }]);
  }
  
  return sanitized;
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  // This would integrate with Redis or similar in production
  // For now, this is a placeholder that always returns true
  // Implementation would check request count per identifier per time window
  return true;
}

/**
 * CSRF token validation
 */
export function validateCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }
  
  // Use constant-time comparison to prevent timing attacks
  if (token.length !== expectedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : Math.max(0, Math.min(parsed, 1000));
}

/**
 * Sanitize and validate ID parameters
 */
export function sanitizeId(value: string | null): string | null {
  if (!value) return null;
  // Only allow alphanumeric characters and hyphens (UUID format)
  const sanitized = value.replace(/[^a-zA-Z0-9-]/g, '');
  return sanitized.length > 0 ? sanitized : null;
}

/**
 * Sanitize text input for search queries
 */
export function sanitizeSearchQuery(query: string | null): string | null {
  if (!query) return null;
  // Remove potentially harmful characters but keep Chinese characters
  const sanitized = query.replace(/[<>'"&\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  return sanitized.length > 0 && sanitized.length <= 200 ? sanitized : null;
}

/**
 * Input validation utilities object for legacy compatibility
 */
export const inputValidation = {
  sanitizeNumber,
  sanitizeId,
  sanitizeSearchQuery,
  sanitizeString,
  validateEmail,
  sanitizeHtml,
};