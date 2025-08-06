'use client';

import React, { useState } from 'react';
import { pushNotificationService } from '@/lib/push-notifications';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotificationDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDevotionDemo = async () => {
    setIsLoading(true);
    try {
      const devotionData = {
        id: 'demo-devotion-1',
        title: 'Walking in Faith Through Uncertainty',
        verse: '\"Trust in the Lord with all your heart and lean not on your own understanding.\" - Proverbs 3:5',
        author: 'Pastor John Chan'
      };

      const notification = await pushNotificationService.createDevotionNotification(devotionData);
      await pushNotificationService.sendNotification(notification);
      showMessage('Devotion notification sent! (Check your browser notifications)');
    } catch (error) {
      console.error('Error sending devotion notification:', error);
      showMessage('Error sending notification. Please check console.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrayerDemo = async () => {
    setIsLoading(true);
    try {
      const prayerData = {
        id: 'demo-prayer-1',
        requestText: 'Please pray for Mrs. Wong who is recovering from surgery. She needs strength and healing during this time.',
        requestType: 'new' as const,
        requester: 'Community Care Team'
      };

      const notification = await pushNotificationService.createPrayerNotification(prayerData);
      await pushNotificationService.sendNotification(notification);
      showMessage('Prayer notification sent!');
    } catch (error) {
      console.error('Error sending prayer notification:', error);
      showMessage('Error sending notification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventDemo = async () => {
    setIsLoading(true);
    try {
      const eventData = {
        id: 'demo-event-1',
        title: 'Sunday Worship Service',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        location: 'Main Sanctuary, Hong Kong Church',
        type: 'worship'
      };

      const notification = await pushNotificationService.createEventNotification(eventData);
      await pushNotificationService.sendNotification(notification);
      showMessage('Event notification sent!');
    } catch (error) {
      console.error('Error sending event notification:', error);
      showMessage('Error sending notification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunityDemo = async () => {
    setIsLoading(true);
    try {
      const communityData = {
        id: 'demo-community-1',
        type: 'group_milestone' as const,
        title: 'Youth Group Achievement',
        message: 'Our Youth Group has completed 100 hours of community service this month! Congratulations to all participants.',
        priority: 'medium' as const,
        metadata: {
          groupName: 'Youth Ministry',
          milestone: '100 Hours of Service'
        }
      };

      const notification = await pushNotificationService.createCommunityNotification(communityData);
      await pushNotificationService.sendNotification(notification);
      showMessage('Community notification sent!');
    } catch (error) {
      console.error('Error sending community notification:', error);
      showMessage('Error sending notification.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWeeklyCheckinDemo = async () => {
    setIsLoading(true);
    try {
      const reminderData = {
        id: 'demo-checkin-1',
        type: 'weekly_checkin' as const,
        title: 'Weekly Spiritual Check-in',
        message: 'How has your spiritual journey been this week? Take a moment to reflect and share with your community.',
        scheduledFor: new Date().toISOString()
      };

      const notification = await pushNotificationService.createReminderNotification(reminderData);
      await pushNotificationService.sendNotification(notification);
      showMessage('Weekly check-in notification sent!');
    } catch (error) {
      console.error('Error sending weekly check-in:', error);
      showMessage('Error sending notification.');
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleDevotionReminder = async () => {
    setIsLoading(true);
    try {
      await pushNotificationService.scheduleDailyDevotion();
      showMessage('Daily devotion reminder scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling devotion:', error);
      showMessage('Error scheduling reminder.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeNotifications = async () => {
    setIsLoading(true);
    try {
      const initialized = await pushNotificationService.initialize();
      if (initialized) {
        const permission = await pushNotificationService.requestPermission();
        if (permission === 'granted') {
          await pushNotificationService.subscribeUser();
          showMessage('Notifications initialized successfully!');
        } else {
          showMessage('Notification permission denied.');
        }
      } else {
        showMessage('Push notifications not supported in this browser.');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
      showMessage('Error initializing notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className=\"p-6 max-w-2xl mx-auto\">
      <h2 className=\"text-2xl font-bold text-gray-900 mb-4\">
        🔔 Hong Kong Church Notification System Demo
      </h2>
      
      <p className=\"text-gray-600 mb-6\">
        Experience our intelligent push notification system designed for the Hong Kong Christian community. 
        Features bilingual support, cultural awareness, and smart scheduling.
      </p>

      {message && (
        <div className=\"mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800\">
          {message}
        </div>
      )}

      <div className=\"space-y-4\">
        <div className=\"border-b pb-4\">
          <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Initialize System</h3>
          <Button 
            onClick={initializeNotifications}
            disabled={isLoading}
            className=\"w-full sm:w-auto\"
          >
            🚀 Initialize & Subscribe to Notifications
          </Button>
        </div>

        <div className=\"border-b pb-4\">
          <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Notification Types</h3>
          <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-3\">
            <Button 
              onClick={handleDevotionDemo}
              disabled={isLoading}
              variant=\"outline\"
              className=\"flex items-center justify-center space-x-2\"
            >
              <span>📖</span>
              <span>Daily Devotion</span>
            </Button>
            
            <Button 
              onClick={handlePrayerDemo}
              disabled={isLoading}
              variant=\"outline\"
              className=\"flex items-center justify-center space-x-2\"
            >
              <span>🙏</span>
              <span>Prayer Request</span>
            </Button>
            
            <Button 
              onClick={handleEventDemo}
              disabled={isLoading}
              variant=\"outline\"
              className=\"flex items-center justify-center space-x-2\"
            >
              <span>⛪</span>
              <span>Church Event</span>
            </Button>
            
            <Button 
              onClick={handleCommunityDemo}
              disabled={isLoading}
              variant=\"outline\"
              className=\"flex items-center justify-center space-x-2\"
            >
              <span>🎉</span>
              <span>Community Update</span>
            </Button>
          </div>
        </div>

        <div className=\"border-b pb-4\">
          <h3 className=\"text-lg font-semibold text-gray-800 mb-3\">Smart Scheduling</h3>
          <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-3\">
            <Button 
              onClick={scheduleDevotionReminder}
              disabled={isLoading}
              variant=\"outline\"
              className=\"flex items-center justify-center space-x-2\"
            >
              <span>⏰</span>
              <span>Schedule Daily Devotion</span>
            </Button>
            
            <Button 
              onClick={handleWeeklyCheckinDemo}
              disabled={isLoading}
              variant=\"outline\"
              className=\"flex items-center justify-center space-x-2\"
            >
              <span>🤗</span>
              <span>Weekly Check-in</span>
            </Button>
          </div>
        </div>

        <div className=\"bg-gray-50 p-4 rounded-lg\">
          <h4 className=\"font-medium text-gray-800 mb-2\">Features Demonstrated:</h4>
          <ul className=\"text-sm text-gray-600 space-y-1\">
            <li>✅ Bilingual notifications (English/Traditional Chinese)</li>
            <li>✅ Hong Kong timezone awareness</li>
            <li>✅ Cultural context and appropriate timing</li>
            <li>✅ Smart batching to prevent notification fatigue</li>
            <li>✅ User preference management</li>
            <li>✅ Offline-capable scheduling</li>
            <li>✅ Engagement tracking and analytics</li>
            <li>✅ Quiet hours and do-not-disturb support</li>
          </ul>
        </div>

        <div className=\"text-center pt-4\">
          <p className=\"text-xs text-gray-500\">
            Built for Hong Kong Church community with ❤️ and cultural sensitivity
          </p>
        </div>
      </div>
    </Card>
  );
}