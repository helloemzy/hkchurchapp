'use client';

import React, { useRef, useState } from 'react';
import { usePWA, useTouchGestures, useDevotionReading } from '@/hooks/usePWA';
import { pushNotificationService } from '@/lib/push-notifications';

const PWAFeatures: React.FC = () => {
  const { features, actions, isInitialized } = usePWA();
  const { isReading, startReading, stopReading } = useDevotionReading();
  const [notificationStatus, setNotificationStatus] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);

  // Touch gestures for the content area
  useTouchGestures(contentRef, {
    onSwipeLeft: () => {
      console.log('Swiped left - next devotion');
      actions.triggerHaptic('light');
    },
    onSwipeRight: () => {
      console.log('Swiped right - previous devotion');
      actions.triggerHaptic('light');
    },
    onPullToRefresh: async () => {
      console.log('Pull to refresh triggered');
      actions.triggerHaptic('medium');
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
    },
  });

  const handleNotificationTest = async () => {
    try {
      const subscribed = await actions.subscribeToNotifications();
      if (subscribed) {
        setNotificationStatus('Subscribed successfully!');
        
        // Create a test devotion notification
        const testDevotionNotification = pushNotificationService.createDevotionNotification({
          id: 'test-devotion',
          title: "Trust in the Lord with all your heart",
          verse: "Proverbs 3:5-6",
          author: "Pastor John"
        });

        // Schedule it for 5 seconds from now
        await pushNotificationService.scheduleLocalNotification(testDevotionNotification, 5000);
        actions.triggerHaptic('heavy');
      } else {
        setNotificationStatus('Failed to subscribe to notifications');
      }
    } catch (error) {
      setNotificationStatus('Error: ' + (error as Error).message);
    }
  };

  const handleShare = async () => {
    const success = await actions.shareContent({
      title: 'Hong Kong Church - Daily Devotions',
      text: 'Join me in daily devotions and prayers',
      url: window.location.href
    });

    setShareStatus(success ? 'Content shared successfully!' : 'Share failed or cancelled');
    if (success) {
      actions.triggerHaptic('light');
    }
  };

  const handleReadingToggle = () => {
    if (isReading) {
      stopReading();
      actions.triggerHaptic('light');
    } else {
      startReading();
      actions.triggerHaptic('medium');
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Initializing PWA features...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Hong Kong Church PWA Features
        </h1>

        {/* PWA Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Connection Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${features.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{features.isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Network: {features.networkType}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Installation</h3>
            <div className="text-sm">
              {features.isInstalled ? (
                <span className="text-green-600">✓ Installed</span>
              ) : features.isInstallable ? (
                <span className="text-blue-600">⬇ Installable</span>
              ) : (
                <span className="text-gray-500">Web Browser</span>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Device Info</h3>
            <div className="text-xs text-gray-500">
              <div>Orientation: {features.orientation}</div>
              {features.batteryLevel !== null && (
                <div>Battery: {Math.round(features.batteryLevel * 100)}%</div>
              )}
            </div>
          </div>
        </div>

        {/* PWA Feature Tests */}
        <div className="space-y-6">
          {/* Notifications Section */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Push Notifications</h3>
            <p className="text-gray-600 text-sm mb-4">
              Test push notification subscription and receive devotional reminders.
            </p>
            <button
              onClick={handleNotificationTest}
              disabled={!features.canNotify}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {features.canNotify ? 'Test Notifications' : 'Notifications Not Supported'}
            </button>
            {notificationStatus && (
              <div className="mt-2 p-3 bg-blue-50 text-blue-700 text-sm rounded">
                {notificationStatus}
              </div>
            )}
          </div>

          {/* Touch Gestures Section */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Touch Gestures</h3>
            <p className="text-gray-600 text-sm mb-4">
              Try swiping left/right on the content area below, or pull down to refresh.
            </p>
            <div 
              ref={contentRef}
              className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg border-2 border-dashed border-gray-300 min-h-[200px] flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">⛪</div>
                <p className="text-gray-700 font-medium">Swipe left/right or pull down</p>
                <p className="text-gray-500 text-sm mt-2">Experience native-like gestures</p>
              </div>
            </div>
          </div>

          {/* Reading Mode Section */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Reading Mode</h3>
            <p className="text-gray-600 text-sm mb-4">
              Keep your screen on while reading devotions with wake lock technology.
            </p>
            <button
              onClick={handleReadingToggle}
              disabled={!features.hasWakeLock}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isReading
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              } disabled:bg-gray-300 disabled:cursor-not-allowed`}
            >
              {!features.hasWakeLock 
                ? 'Wake Lock Not Supported'
                : isReading 
                  ? '📖 Stop Reading' 
                  : '📱 Start Reading'
              }
            </button>
            {isReading && (
              <div className="mt-2 p-3 bg-purple-50 text-purple-700 text-sm rounded">
                📱 Screen wake lock is active - your screen will stay on
              </div>
            )}
          </div>

          {/* Share Section */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Native Sharing</h3>
            <p className="text-gray-600 text-sm mb-4">
              Use the device&apos;s native share menu to share church content.
            </p>
            <button
              onClick={handleShare}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              📤 Share Church App
            </button>
            {shareStatus && (
              <div className="mt-2 p-3 bg-orange-50 text-orange-700 text-sm rounded">
                {shareStatus}
              </div>
            )}
          </div>

          {/* Haptic Feedback Section */}
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Haptic Feedback</h3>
            <p className="text-gray-600 text-sm mb-4">
              Feel the app respond with tactile feedback on supported devices.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => actions.triggerHaptic('light')}
                className="bg-red-400 text-white px-3 py-1 rounded text-sm hover:bg-red-500 transition-colors"
              >
                Light
              </button>
              <button
                onClick={() => actions.triggerHaptic('medium')}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
              >
                Medium
              </button>
              <button
                onClick={() => actions.triggerHaptic('heavy')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Heavy
              </button>
            </div>
          </div>
        </div>

        {/* Installation Prompt */}
        {features.isInstallable && !features.isInstalled && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              📱 Install Hong Kong Church App
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Get quick access to daily devotions, prayers, and church events right from your home screen.
            </p>
            <button
              onClick={actions.showInstallPrompt}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              ⬇ Install App
            </button>
          </div>
        )}

        {/* Offline Indicator */}
        {!features.isOnline && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-3">⚠️</div>
              <div>
                <h4 className="font-semibold text-yellow-800">You&apos;re offline</h4>
                <p className="text-yellow-700 text-sm">
                  Don&apos;t worry! You can still access cached devotions and prayers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAFeatures;