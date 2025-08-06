'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth/auth-context';
import { validateInput, ValidationSchemas, ValidationError, validateEmail } from '../../lib/security/input-validation';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Icons } from '../ui/icons';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { signUp, signInWithGoogle, signInWithGitHub } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setValidationErrors({});

    // Check terms agreement
    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setValidationErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setLoading(true);

    try {
      // Validate input
      const validatedAuthData = validateInput(ValidationSchemas.auth, { email, password });
      const validatedUserData = validateInput(ValidationSchemas.user, { 
        email, 
        full_name: fullName,
        language: 'en' as const
      });

      // Additional email validation
      validateEmail(validatedAuthData.email);

      // Attempt sign up
      const { error: signUpError } = await signUp(
        validatedAuthData.email, 
        validatedAuthData.password, 
        validatedUserData.full_name
      );

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (signUpError.message.includes('Password should be at least')) {
          setError('Password must be at least 6 characters long and contain a mix of letters, numbers, and symbols.');
        } else if (signUpError.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else {
          setError(signUpError.message || 'An error occurred during registration.');
        }
      } else {
        setSuccess('Registration successful! Please check your email to verify your account before signing in.');
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
        setAgreeToTerms(false);
        
        // Call success callback after a delay to show success message
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
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

  const handleOAuthSignUp = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);

    try {
      const { error: oauthError } = provider === 'google' 
        ? await signInWithGoogle()
        : await signInWithGitHub();

      if (oauthError) {
        setError(`Failed to sign up with ${provider}. Please try again.`);
      }
      // Note: OAuth redirects, so we don't handle success here
    } catch (err) {
      setError(`An error occurred during ${provider} sign up.`);
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
          fullWidth
          onClick={() => handleOAuthSignUp('google')}
          disabled={loading}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Sign up with Google
        </Button>
        
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => handleOAuthSignUp('github')}
          disabled={loading}
        >
          <Icons.gitHub className="mr-2 h-4 w-4" />
          Sign up with GitHub
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            required
            autoComplete="name"
            data-testid="fullname-input"
            className={validationErrors.full_name ? 'border-red-500' : ''}
          />
          {validationErrors.full_name && (
            <p className="text-sm text-red-500">{validationErrors.full_name}</p>
          )}
        </div>

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
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="new-password"
            data-testid="password-input"
            className={validationErrors.password ? 'border-red-500' : ''}
          />
          {validationErrors.password && (
            <p className="text-sm text-red-500">{validationErrors.password}</p>
          )}
          <p className="text-xs text-gray-500">
            Password must be at least 12 characters with uppercase, lowercase, number, and special character.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="new-password"
            data-testid="confirm-password-input"
            className={validationErrors.confirmPassword ? 'border-red-500' : ''}
          />
          {validationErrors.confirmPassword && (
            <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
          )}
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start space-x-2">
          <input
            id="agreeToTerms"
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            disabled={loading}
            className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            data-testid="terms-checkbox"
          />
          <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-300">
            I agree to the{' '}
            <a href="/terms" className="text-primary-600 hover:text-primary-500 underline" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-primary-600 hover:text-primary-500 underline" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </Label>
        </div>

        {error && (
          <Alert variant="destructive" data-testid="error-message">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800" data-testid="success-message">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Button 
          type="submit" 
          fullWidth
          disabled={loading || !agreeToTerms}
          loading={loading}
          data-testid="signup-button"
        >
          Create Account
        </Button>
      </form>

      {/* Switch to Sign In */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  );
}