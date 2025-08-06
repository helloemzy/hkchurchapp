'use client';

import React, { useState, useEffect } from 'react';
import { pushNotificationService, NotificationPreferences } from '@/lib/push-notifications';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface NotificationSettingsProps {
  userId?: string;
  onPreferencesChange?: (preferences: NotificationPreferences) => void;
}

export default function NotificationSettings({ 
  userId = 'anonymous', 
  onPreferencesChange 
}: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
    checkSubscriptionStatus();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const prefs = await pushNotificationService.getUserPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      showMessage('error', 'Failed to load notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const subscription = await pushNotificationService.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleSubscriptionToggle = async () => {
    try {
      if (isSubscribed) {
        await pushNotificationService.unsubscribeUser();
        setIsSubscribed(false);
        showMessage('success', 'Push notifications disabled');
      } else {
        const permission = await pushNotificationService.requestPermission();
        if (permission === 'granted') {
          await pushNotificationService.subscribeUser();
          setIsSubscribed(true);
          showMessage('success', 'Push notifications enabled');
        } else {
          showMessage('error', 'Permission denied for push notifications');
        }
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
      showMessage('error', 'Failed to update notification subscription');
    }
  };

  const handlePreferenceChange = (section: string, key: string, value: any) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      [section]: {
        ...preferences[section as keyof NotificationPreferences],
        [key]: value
      }
    };

    setPreferences(updatedPreferences);
  };

  const handleTimeChange = (section: string, time: string) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      [section]: {
        ...preferences[section as keyof NotificationPreferences],
        time: time
      }
    };

    setPreferences(updatedPreferences);
  };

  const handleQuietHoursChange = (key: string, value: any) => {
    if (!preferences) return;

    const updatedPreferences = {
      ...preferences,
      quietHours: {
        ...preferences.quietHours,
        [key]: value
      }
    };

    setPreferences(updatedPreferences);
  };

  const savePreferences = async () => {
    if (!preferences) return;

    setIsSaving(true);
    try {
      await pushNotificationService.setUserPreferences(preferences);
      
      // Also save to server
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...preferences, user_id: userId }),
      });

      if (response.ok) {
        showMessage('success', 'Notification preferences saved successfully');
        onPreferencesChange?.(preferences);
      } else {
        throw new Error('Failed to save preferences to server');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showMessage('error', 'Failed to save notification preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  if (isLoading || !preferences) {
    return (
      <Card className=\"p-6\">
        <div className=\"animate-pulse space-y-4\">
          <div className=\"h-4 bg-gray-200 rounded w-1/4\"></div>
          <div className=\"space-y-2\">
            <div className=\"h-4 bg-gray-200 rounded\"></div>
            <div className=\"h-4 bg-gray-200 rounded w-3/4\"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className=\"space-y-6\">
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Main Toggle */}
      <Card className=\"p-6\">
        <div className=\"flex items-center justify-between mb-4\">
          <div>
            <h3 className=\"text-lg font-semibold text-gray-900\">Push Notifications</h3>
            <p className=\"text-sm text-gray-600\">
              Receive spiritual reminders and community updates
            </p>
          </div>
          <Button
            onClick={handleSubscriptionToggle}
            variant={isSubscribed ? \"outline\" : \"default\"}
            className={isSubscribed ? 'text-red-600 border-red-300' : ''}
          >
            {isSubscribed ? 'Disable' : 'Enable'}
          </Button>
        </div>

        {isSubscribed && (
          <div className=\"space-y-6\">
            {/* Devotions */}
            <div className=\"border-t pt-4 space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <h4 className=\"font-medium text-gray-900\">Daily Devotions</h4>
                  <p className=\"text-sm text-gray-600\">Morning spiritual readings</p>
                </div>
                <label className=\"relative inline-flex items-center cursor-pointer\">
                  <input
                    type=\"checkbox\"
                    checked={preferences.devotions.enabled}
                    onChange={(e) => handlePreferenceChange('devotions', 'enabled', e.target.checked)}
                    className=\"sr-only peer\"
                  />
                  <div className=\"w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600\"></div>
                </label>
              </div>

              {preferences.devotions.enabled && (
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                      Time (Hong Kong)
                    </label>
                    <input
                      type=\"time\"
                      value={preferences.devotions.time}
                      onChange={(e) => handleTimeChange('devotions', e.target.value)}
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    />
                  </div>
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                      Language
                    </label>
                    <select
                      value={preferences.devotions.language}
                      onChange={(e) => handlePreferenceChange('devotions', 'language', e.target.value)}
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    >
                      <option value=\"en\">English</option>
                      <option value=\"zh\">繁體中文</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Events */}
            <div className=\"border-t pt-4 space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <h4 className=\"font-medium text-gray-900\">Church Events</h4>
                  <p className=\"text-sm text-gray-600\">Service and activity reminders</p>
                </div>
                <label className=\"relative inline-flex items-center cursor-pointer\">
                  <input
                    type=\"checkbox\"
                    checked={preferences.events.enabled}
                    onChange={(e) => handlePreferenceChange('events', 'enabled', e.target.checked)}
                    className=\"sr-only peer\"
                  />
                  <div className=\"w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600\"></div>
                </label>
              </div>

              {preferences.events.enabled && (
                <div className=\"space-y-3\">
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                      Reminder Times
                    </label>
                    <div className=\"space-y-2\">
                      {['24h', '1h', '15m'].map((time) => (
                        <label key={time} className=\"flex items-center\">
                          <input
                            type=\"checkbox\"
                            checked={preferences.events.reminders.includes(time)}
                            onChange={(e) => {
                              const reminders = e.target.checked
                                ? [...preferences.events.reminders, time]
                                : preferences.events.reminders.filter(r => r !== time);
                              handlePreferenceChange('events', 'reminders', reminders);
                            }}
                            className=\"mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
                          />
                          <span className=\"text-sm text-gray-700\">
                            {time === '24h' ? '24 hours before' : 
                             time === '1h' ? '1 hour before' : '15 minutes before'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prayer Requests */}
            <div className=\"border-t pt-4 space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <h4 className=\"font-medium text-gray-900\">Prayer Requests</h4>
                  <p className=\"text-sm text-gray-600\">Community prayer updates</p>
                </div>
                <label className=\"relative inline-flex items-center cursor-pointer\">
                  <input
                    type=\"checkbox\"
                    checked={preferences.prayers.enabled}
                    onChange={(e) => handlePreferenceChange('prayers', 'enabled', e.target.checked)}
                    className=\"sr-only peer\"
                  />
                  <div className=\"w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600\"></div>
                </label>
              </div>

              {preferences.prayers.enabled && (
                <div>
                  <label className=\"flex items-center\">
                    <input
                      type=\"checkbox\"
                      checked={preferences.prayers.urgentOnly}
                      onChange={(e) => handlePreferenceChange('prayers', 'urgentOnly', e.target.checked)}
                      className=\"mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
                    />
                    <span className=\"text-sm text-gray-700\">Only urgent requests</span>
                  </label>
                </div>
              )}
            </div>

            {/* Community */}
            <div className=\"border-t pt-4 space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <h4 className=\"font-medium text-gray-900\">Community Updates</h4>
                  <p className=\"text-sm text-gray-600\">Group messages and achievements</p>
                </div>
                <label className=\"relative inline-flex items-center cursor-pointer\">
                  <input
                    type=\"checkbox\"
                    checked={preferences.community.enabled}
                    onChange={(e) => handlePreferenceChange('community', 'enabled', e.target.checked)}
                    className=\"sr-only peer\"
                  />
                  <div className=\"w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600\"></div>
                </label>
              </div>

              {preferences.community.enabled && (
                <div className=\"space-y-2\">
                  <label className=\"flex items-center\">
                    <input
                      type=\"checkbox\"
                      checked={preferences.community.groupMessages}
                      onChange={(e) => handlePreferenceChange('community', 'groupMessages', e.target.checked)}
                      className=\"mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
                    />
                    <span className=\"text-sm text-gray-700\">Group messages</span>
                  </label>
                  <label className=\"flex items-center\">
                    <input
                      type=\"checkbox\"
                      checked={preferences.community.achievements}
                      onChange={(e) => handlePreferenceChange('community', 'achievements', e.target.checked)}
                      className=\"mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
                    />
                    <span className=\"text-sm text-gray-700\">Achievements & milestones</span>
                  </label>
                  <label className=\"flex items-center\">
                    <input
                      type=\"checkbox\"
                      checked={preferences.community.weeklyCheckins}
                      onChange={(e) => handlePreferenceChange('community', 'weeklyCheckins', e.target.checked)}
                      className=\"mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
                    />
                    <span className=\"text-sm text-gray-700\">Weekly spiritual check-ins</span>
                  </label>
                </div>
              )}
            </div>

            {/* Quiet Hours */}
            <div className=\"border-t pt-4 space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <h4 className=\"font-medium text-gray-900\">Quiet Hours</h4>
                  <p className=\"text-sm text-gray-600\">No notifications during these times</p>
                </div>
                <label className=\"relative inline-flex items-center cursor-pointer\">
                  <input
                    type=\"checkbox\"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => handleQuietHoursChange('enabled', e.target.checked)}
                    className=\"sr-only peer\"
                  />
                  <div className=\"w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600\"></div>
                </label>
              </div>

              {preferences.quietHours.enabled && (
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                      From
                    </label>
                    <input
                      type=\"time\"
                      value={preferences.quietHours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    />
                  </div>
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                      To
                    </label>
                    <input
                      type=\"time\"
                      value={preferences.quietHours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <div className=\"border-t pt-4 space-y-4\">
              <div>
                <h4 className=\"font-medium text-gray-900 mb-2\">Advanced Settings</h4>
                <div className=\"space-y-3\">
                  <label className=\"flex items-center\">
                    <input
                      type=\"checkbox\"
                      checked={preferences.batchNotifications}
                      onChange={(e) => handlePreferenceChange('batchNotifications', '', e.target.checked)}
                      className=\"mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
                    />
                    <span className=\"text-sm text-gray-700\">
                      Batch notifications to reduce interruptions
                    </span>
                  </label>
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-1\">
                      Maximum notifications per day
                    </label>
                    <select
                      value={preferences.maxPerDay}
                      onChange={(e) => handlePreferenceChange('maxPerDay', '', parseInt(e.target.value))}
                      className=\"w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500\"
                    >
                      <option value={3}>3 notifications</option>
                      <option value={5}>5 notifications</option>
                      <option value={8}>8 notifications</option>
                      <option value={12}>12 notifications</option>
                      <option value={20}>20 notifications</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className=\"flex justify-end pt-4 border-t\">
              <Button
                onClick={savePreferences}
                disabled={isSaving}
                className=\"px-6 py-2\"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}