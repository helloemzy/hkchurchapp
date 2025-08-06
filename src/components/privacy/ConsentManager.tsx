'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/alert';
import { createClient } from '../../lib/supabase/client';
import { useAuth } from '../../lib/auth/auth-context';

interface ConsentSettings {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean; // Always true, can't be disabled
}

interface ConsentManagerProps {
  onConsentUpdate?: (consent: ConsentSettings) => void;
  showBanner?: boolean;
}

const DEFAULT_CONSENT: ConsentSettings = {
  analytics: false,
  marketing: false,
  functional: true,
  necessary: true,
};

export function ConsentManager({ onConsentUpdate, showBanner = true }: ConsentManagerProps) {
  const [consent, setConsent] = useState<ConsentSettings>(DEFAULT_CONSENT);
  const [showConsentBanner, setShowConsentBanner] = useState(false);
  const [showDetailedSettings, setShowDetailedSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    loadConsentSettings();
  }, [user]);

  const loadConsentSettings = async () => {
    try {
      // Check if user has already provided consent
      const consentKey = user?.id ? `consent-${user.id}` : 'consent-anonymous';
      const savedConsent = localStorage.getItem(consentKey);
      
      if (savedConsent) {
        const parsedConsent = JSON.parse(savedConsent) as ConsentSettings;
        setConsent(parsedConsent);
        setShowConsentBanner(false);
      } else if (showBanner) {
        // Show consent banner for new users
        setShowConsentBanner(true);
      }
    } catch (error) {
      console.error('Error loading consent settings:', error);
      setShowConsentBanner(showBanner);
    }
  };

  const saveConsentSettings = async (newConsent: ConsentSettings, method: 'explicit' | 'implicit' = 'explicit') => {
    setLoading(true);
    try {
      // Save to localStorage
      const consentKey = user?.id ? `consent-${user.id}` : 'consent-anonymous';
      localStorage.setItem(consentKey, JSON.stringify(newConsent));
      
      // Save to database if user is authenticated
      if (user) {
        for (const [purpose, granted] of Object.entries(newConsent)) {
          await supabase.from('user_consent').insert({
            user_id: user.id,
            purpose,
            granted,
            consent_method: method,
            ip_address: 'unknown', // This would be populated by middleware
            user_agent: navigator.userAgent,
          });
        }
      }
      
      setConsent(newConsent);
      setShowConsentBanner(false);
      onConsentUpdate?.(newConsent);
      
      // Apply consent settings
      applyConsentSettings(newConsent);
    } catch (error) {
      console.error('Error saving consent settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyConsentSettings = (consentSettings: ConsentSettings) => {
    // Apply analytics consent
    if (consentSettings.analytics) {
      // Enable Google Analytics or other analytics services
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    } else {
      // Disable analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    }

    // Apply marketing consent
    if (consentSettings.marketing) {
      // Enable marketing cookies/tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted',
          ad_user_data: 'granted',
          ad_personalization: 'granted',
        });
      }
    } else {
      // Disable marketing
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        });
      }
    }
  };

  const handleAcceptAll = () => {
    const fullConsent: ConsentSettings = {
      analytics: true,
      marketing: true,
      functional: true,
      necessary: true,
    };
    saveConsentSettings(fullConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent: ConsentSettings = {
      analytics: false,
      marketing: false,
      functional: false,
      necessary: true,
    };
    saveConsentSettings(minimalConsent);
  };

  const handleCustomizeConsent = (newConsent: ConsentSettings) => {
    saveConsentSettings(newConsent);
  };

  const toggleConsentSetting = (key: keyof ConsentSettings) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setConsent(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showConsentBanner) {
    return null;
  }

  return (
    <>
      {/* Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-lg z-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Privacy & Cookies
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                We use cookies to enhance your experience, analyze site usage, and provide personalized content. 
                Your privacy is important to us, and you have full control over your preferences.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedSettings(true)}
                disabled={loading}
              >
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                disabled={loading}
              >
                Reject All
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                disabled={loading}
                loading={loading}
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Settings Modal */}
      {showDetailedSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                Privacy Preferences
              </h2>
              
              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Necessary Cookies
                    </h3>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Always Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Essential cookies required for the basic functionality of the website, 
                    including authentication, security, and core features.
                  </p>
                </div>

                {/* Functional Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Functional Cookies
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleConsentSetting('functional')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        consent.functional ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          consent.functional ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enhance your experience with features like remembering your preferences, 
                    language settings, and personalized content.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Analytics Cookies
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleConsentSetting('analytics')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        consent.analytics ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          consent.analytics ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Help us understand how visitors interact with our website to improve 
                    user experience and content quality.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      Marketing Cookies
                    </h3>
                    <button
                      type="button"
                      onClick={() => toggleConsentSetting('marketing')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        consent.marketing ? 'bg-primary-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          consent.marketing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enable personalized advertising and content recommendations based on 
                    your interests and browsing behavior.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowDetailedSettings(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => {
                    handleCustomizeConsent(consent);
                    setShowDetailedSettings(false);
                  }}
                  disabled={loading}
                  loading={loading}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ConsentManager;