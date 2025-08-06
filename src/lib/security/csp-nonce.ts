import { createHash, randomBytes } from 'crypto';

/**
 * Generate a cryptographically secure nonce for CSP
 * This nonce is used to allow specific inline scripts while blocking others
 */
export function generateCSPNonce(): string {
  // Use crypto.randomBytes for better randomness in production
  try {
    const randomBuffer = randomBytes(16);
    const timestamp = Date.now().toString();
    const secret = process.env.CSP_NONCE_SECRET || 'default-development-secret';
    
    const nonce = createHash('sha256')
      .update(`${timestamp}-${randomBuffer.toString('hex')}-${secret}`)
      .digest('base64')
      .substring(0, 32)
      .replace(/[+/=]/g, (char) => {
        switch (char) {
          case '+': return '-';
          case '/': return '_';
          case '=': return '';
          default: return char;
        }
      });
      
    return nonce;
  } catch (error) {
    // Fallback for environments where crypto module is not available
    console.warn('Crypto module not available, using fallback nonce generation');
    const timestamp = Date.now().toString();
    const randomStr = Math.random().toString(36).substring(2);
    return btoa(`${timestamp}-${randomStr}`).substring(0, 32);
  }
}

/**
 * Validate a CSP nonce (for server-side validation)
 */
export function validateCSPNonce(nonce: string): boolean {
  // Basic validation - should be 32 characters base64
  return /^[A-Za-z0-9+/]{32}$/.test(nonce);
}

/**
 * Generate nonce for specific request context
 * This allows per-request nonce generation for enhanced security
 */
export function generateRequestNonce(requestId: string): string {
  const secret = process.env.CSP_NONCE_SECRET || 'default-development-secret';
  
  return createHash('sha256')
    .update(`${requestId}-${secret}-${Date.now()}`)
    .digest('base64')
    .substring(0, 32);
}