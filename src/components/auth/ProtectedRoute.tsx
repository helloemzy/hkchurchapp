'use client';

import React, { ReactNode } from 'react';
import { useRequireAuth, useRequireRole } from '../../lib/auth/auth-context';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'member' | 'group_leader' | 'pastor' | 'admin' | 'super_admin';
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback,
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  // Always call hooks at the top level
  const roleResult = requiredRole ? useRequireRole(requiredRole, '/unauthorized') : null;
  const authResult = !requiredRole ? useRequireAuth(redirectTo) : null;
  
  if (requiredRole && roleResult) {
    // Role-based protection
    const { profile, loading } = roleResult;
    
    if (loading) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    if (!profile) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
    
    return <>{children}</>;
  } else if (!requiredRole && authResult) {
    // Basic authentication protection
    const { user, loading } = authResult;
    
    if (loading) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }
    
    if (!user) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please sign in to access this page.
            </p>
          </div>
        </div>
      );
    }
    
    return <>{children}</>;
  }
  
  // Fallback case
  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'member' | 'group_leader' | 'pastor' | 'admin' | 'super_admin'
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

export default ProtectedRoute;