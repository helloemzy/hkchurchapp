'use client';

import React, { useState } from 'react';
import { LoginForm } from '../../components/auth/LoginForm';
import { SignUpForm } from '../../components/auth/SignUpForm';
import { Button } from '../../components/ui/Button';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Grace Church HK
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Join our faith community
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
            <Button
              variant={activeTab === 'login' ? 'primary' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </Button>
            <Button
              variant={activeTab === 'signup' ? 'primary' : 'ghost'}
              size="sm"
              fullWidth
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </Button>
          </div>

          {/* Form Content */}
          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={() => {
                // Redirect will be handled by the auth context
              }}
              onSwitchToSignUp={() => setActiveTab('signup')}
            />
          ) : (
            <SignUpForm
              onSuccess={() => {
                // Show success message and optionally switch to login
                setActiveTab('login');
              }}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-300">
          <p>
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-500 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}