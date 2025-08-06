import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import { rateLimit } from './src/lib/security/rate-limiter';
import { generateRequestNonce } from './src/lib/security/csp-nonce';

/**
 * Enhanced security middleware for authentication, rate limiting, and security headers
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res: response });

  // Generate nonce for this request
  const nonce = generateRequestNonce(request.headers.get('x-request-id') || '');
  response.headers.set('x-csp-nonce', nonce);

  // Rate limiting check for all requests
  const rateLimitResult = await rateLimit(request, getRateLimitType(request));
  if (!rateLimitResult.success) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter,
        message: 'Too many requests. Please try again later.'
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
          'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
        },
      }
    );
  }

  // Add remaining rate limit info to headers
  if (rateLimitResult.remaining !== undefined) {
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  }

  // Handle API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return await handleApiRoute(request, response, supabase);
  }

  // Handle authentication routes
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return await handleAuthRoute(request, response, supabase);
  }

  // Handle protected routes
  if (isProtectedRoute(request.nextUrl.pathname)) {
    return await handleProtectedRoute(request, response, supabase);
  }

  // Add security headers to all responses
  addSecurityHeaders(response, nonce);

  return response;
}

/**
 * Handle API route security
 */
async function handleApiRoute(
  request: NextRequest, 
  response: NextResponse, 
  supabase: any
) {
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  // Validate authentication for protected API routes
  if (request.nextUrl.pathname.startsWith('/api/protected/')) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries())
          } 
        }
      );
    }
    
    // Add user context to headers for API routes
    response.headers.set('X-User-ID', session.user.id);
    response.headers.set('X-User-Email', session.user.email || '');
  }

  // Validate API key for external endpoints
  if (request.nextUrl.pathname.startsWith('/api/external/')) {
    const apiKey = request.headers.get('X-API-Key');
    if (!apiKey || !await validateAPIKey(apiKey)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid or missing API key' }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries())
          } 
        }
      );
    }
  }

  return response;
}

/**
 * Handle authentication route security
 */
async function handleAuthRoute(
  request: NextRequest, 
  response: NextResponse, 
  supabase: any
) {
  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname !== '/auth/callback') {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

/**
 * Handle protected route access
 */
async function handleProtectedRoute(
  request: NextRequest, 
  response: NextResponse, 
  supabase: any
) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for admin routes
  if (request.nextUrl.pathname.startsWith('/admin/')) {
    const userRole = await getUserRole(supabase, session.user.id);
    if (!['admin', 'super_admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Check role-based access for pastor routes
  if (request.nextUrl.pathname.startsWith('/pastor/')) {
    const userRole = await getUserRole(supabase, session.user.id);
    if (!['pastor', 'admin', 'super_admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, nonce: string) {
  // Update CSP header with request-specific nonce
  response.headers.set('Content-Security-Policy', 
    `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: *.supabase.co https://lh3.googleusercontent.com https://avatars.githubusercontent.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' *.supabase.co wss://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`
  );

  // Add additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
}

/**
 * Determine rate limit type based on request
 */
function getRateLimitType(request: NextRequest): string {
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return 'auth';
  }
  
  if (request.nextUrl.pathname.startsWith('/api/expensive/')) {
    return 'api-expensive';
  }
  
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return 'api-general';
  }
  
  return 'api-general';
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
    '/admin',
    '/pastor',
    '/groups',
    '/events/create',
    '/events/manage'
  ];
  
  return protectedPaths.some(path => pathname.startsWith(path));
}

/**
 * Get user role from database
 */
async function getUserRole(supabase: any, userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) {
      return 'member'; // Default role
    }
    
    return data.role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'member';
  }
}

/**
 * Validate API key (placeholder - implement with your key management system)
 */
async function validateAPIKey(apiKey: string): Promise<boolean> {
  // This should validate against your API key management system
  // For now, return false to disable external API access
  return false;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};