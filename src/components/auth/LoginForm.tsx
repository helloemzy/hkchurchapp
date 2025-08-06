'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { validateInput, ValidationSchemas, ValidationError } from '../../lib/security/input-validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Icons } from '../ui/icons';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { signIn, signInWithGoogle, signInWithGitHub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setLoading(true);

    try {
      // Validate input
      const validatedData = validateInput(ValidationSchemas.auth, { email, password });

      // Attempt sign in
      const { error: signInError } = await signIn(validatedData.email, validatedData.password);

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please confirm your email address before signing in.');
        } else {
          setError(signInError.message || 'An error occurred during sign in.');
        }
      } else {
        onSuccess?.();
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        const errors: Record<string, string> = {};
        err.errors.forEach(({ field, message }) => {
          errors[field] = message;
        });
        setValidationErrors(errors);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);

    try {
      const { error: oauthError } = provider === 'google' 
        ? await signInWithGoogle()
        : await signInWithGitHub();

      if (oauthError) {
        setError(`Failed to sign in with ${provider}. Please try again.`);
      }
      // Note: OAuth redirects, so we don't handle success here
    } catch (err) {
      setError(`An error occurred during ${provider} sign in.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* OAuth Options */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Sign in with Google
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleOAuthSignIn('github')}
          disabled={loading}
        >
          <Icons.gitHub className="mr-2 h-4 w-4" />
          Sign in with GitHub
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
            data-testid="email-input"
            className={validationErrors.email ? 'border-red-500' : ''}
          />
          {validationErrors.email && (
            <p className="text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
            data-testid="password-input"
            className={validationErrors.password ? 'border-red-500' : ''}
          />
          {validationErrors.password && (
            <p className="text-sm text-red-500">{validationErrors.password}</p>
          )}
        </div>

        {error && (
          <Alert variant="destructive" data-testid="error-message">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
          data-testid="login-button"
        >
          {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      {/* Switch to Sign Up */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={onSwitchToSignUp}
            disabled={loading}
          >
            Sign up
          </Button>
        </p>
      </div>

      {/* Forgot Password */}
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto text-sm"
          disabled={loading}
        >
          Forgot your password?
        </Button>
      </div>
    </div>
  );
}