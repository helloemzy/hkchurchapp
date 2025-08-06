// Push Notification Service for Hong Kong Church PWA
'use client';

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  timestamp?: number;
}

interface DevotionNotification extends NotificationPayload {
  type: 'devotion';
  devotionId: string;
  verse?: string;
}

interface PrayerNotification extends NotificationPayload {
  type: 'prayer';
  prayerId: string;
  requestType: 'new' | 'answered' | 'urgent';
}

interface EventNotification extends NotificationPayload {
  type: 'event';
  eventId: string;
  eventTime: string;
  location?: string;
}

interface CommunityNotification extends NotificationPayload {
  type: 'community';
  communityType: 'group_message' | 'group_milestone' | 'achievement' | 'encouragement';
  groupId?: string;
  priority: 'low' | 'medium' | 'high';
}

interface ReminderNotification extends NotificationPayload {
  type: 'reminder';
  reminderType: 'devotion' | 'prayer' | 'event' | 'weekly_checkin';
  scheduledFor: string;
  recurrence?: 'daily' | 'weekly' | 'monthly';
}

type ChurchNotification = DevotionNotification | PrayerNotification | EventNotification | CommunityNotification | ReminderNotification;

// Hong Kong Church specific scheduling
interface NotificationSchedule {
  id: string;
  type: ChurchNotification['type'];
  scheduledTime: Date;
  timeZone: string;
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly';
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    time: string; // HH:MM format
  };
  conditions?: {
    respectQuietHours: boolean;
    skipHolidays: boolean;
    batchWithOthers: boolean;
  };
}

// User notification preferences
interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  devotions: {
    enabled: boolean;
    time: string; // HH:MM in Hong Kong time
    language: 'en' | 'zh';
  };
  events: {
    enabled: boolean;
    reminders: ('24h' | '1h' | '15m')[];
    language: 'en' | 'zh';
  };
  prayers: {
    enabled: boolean;
    urgentOnly: boolean;
    language: 'en' | 'zh';
  };
  community: {
    enabled: boolean;
    groupMessages: boolean;
    achievements: boolean;
    weeklyCheckins: boolean;
    language: 'en' | 'zh';
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
  batchNotifications: boolean;
  maxPerDay: number;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BN4GvZtEZiZuqaaUX7hJJiSL8kzG9GfS2P5B3ZmU4Y8DgCw7I2M8sK1vN7qR3pL9';
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private scheduledNotifications: Map<string, NotificationSchedule> = new Map();
  private userPreferences: NotificationPreferences | null = null;
  private notificationQueue: ChurchNotification[] = [];
  private batchTimeout: number | null = null;
  private dailyNotificationCount: number = 0;
  private lastResetDate: string = '';

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      this.serviceWorkerRegistration = registration;
      
      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      
      return true;
    } catch (error) {
      console.error('Failed to initialize push notification service:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  async subscribeUser(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      console.error('Service worker not registered');
      return null;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe user:', error);
      return null;
    }
  }

  async unsubscribeUser(): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer(subscription);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe user:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.serviceWorkerRegistration) {
      return null;
    }

    try {
      return await this.serviceWorkerRegistration.pushManager.getSubscription();
    } catch (error) {
      console.error('Failed to get subscription:', error);
      return null;
    }
  }

  // Smart Notification Scheduling & Management
  async setUserPreferences(preferences: NotificationPreferences): Promise<void> {
    this.userPreferences = preferences;
    
    // Store preferences in localStorage for persistence
    localStorage.setItem('notification-preferences', JSON.stringify(preferences));
    
    // Update scheduled notifications based on new preferences
    await this.updateScheduledNotifications();
  }

  async getUserPreferences(): Promise<NotificationPreferences> {
    if (this.userPreferences) {
      return this.userPreferences;
    }

    // Load from localStorage
    const stored = localStorage.getItem('notification-preferences');
    if (stored) {
      this.userPreferences = JSON.parse(stored);
      return this.userPreferences;
    }

    // Default preferences for Hong Kong Church
    const defaultPreferences: NotificationPreferences = {
      userId: 'anonymous',
      enabled: true,
      devotions: {
        enabled: true,
        time: '08:00', // 8 AM Hong Kong time
        language: 'en'
      },
      events: {
        enabled: true,
        reminders: ['24h', '1h'],
        language: 'en'
      },
      prayers: {
        enabled: true,
        urgentOnly: false,
        language: 'en'
      },
      community: {
        enabled: true,
        groupMessages: true,
        achievements: true,
        weeklyCheckins: true,
        language: 'en'
      },
      quietHours: {
        enabled: true,
        start: '22:00', // 10 PM
        end: '07:00'    // 7 AM
      },
      batchNotifications: true,
      maxPerDay: 8
    };

    this.userPreferences = defaultPreferences;
    localStorage.setItem('notification-preferences', JSON.stringify(defaultPreferences));
    return defaultPreferences;
  }

  async scheduleDailyDevotion(): Promise<void> {
    const preferences = await this.getUserPreferences();
    if (!preferences.enabled || !preferences.devotions.enabled) {
      return;
    }

    const now = new Date();
    const hkTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
    const [hours, minutes] = preferences.devotions.time.split(':').map(Number);
    
    const scheduleTime = new Date(hkTime);
    scheduleTime.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduleTime <= hkTime) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
    }

    const schedule: NotificationSchedule = {
      id: 'daily-devotion',
      type: 'devotion',
      scheduledTime: scheduleTime,
      timeZone: 'Asia/Hong_Kong',
      recurrence: {
        pattern: 'daily',
        time: preferences.devotions.time
      },
      conditions: {
        respectQuietHours: preferences.quietHours.enabled,
        skipHolidays: false,
        batchWithOthers: preferences.batchNotifications
      }
    };

    this.scheduledNotifications.set('daily-devotion', schedule);
    await this.scheduleNotification(schedule);
  }

  private async scheduleNotification(schedule: NotificationSchedule): Promise<void> {
    const delay = schedule.scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) {
      return; // Time has passed
    }

    // Send schedule to service worker
    if (this.serviceWorkerRegistration?.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        schedule,
        delay
      });
    }
  }

  private async updateScheduledNotifications(): Promise<void> {
    // Clear existing schedules
    this.scheduledNotifications.clear();
    
    // Reschedule based on current preferences
    await this.scheduleDailyDevotion();
  }

  private isInQuietHours(): boolean {
    const preferences = this.userPreferences;
    if (!preferences?.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const hkTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
    const currentHour = hkTime.getHours();
    const currentMinute = hkTime.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = preferences.quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime < endTime) {
      // Same day quiet hours (e.g., 10 PM to 11 PM)
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours (e.g., 10 PM to 7 AM)
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  // Cultural & Contextual Localization
  private getLocalizedContent(key: string, language: 'en' | 'zh'): string {
    const translations = {
      en: {
        'devotion.title': '📖 Today\'s Devotion',
        'devotion.read': 'Read Now',
        'devotion.save': 'Save for Later',
        'prayer.new': '🙏 New Prayer Request',
        'prayer.answered': '✨ Prayer Answered!',
        'prayer.urgent': '🚨 Urgent Prayer Needed',
        'prayer.pray': 'Pray Now',
        'prayer.support': 'Send Support',
        'event.reminder': '⛪ Church Event Reminder',
        'event.view': 'View Details',
        'event.directions': 'Get Directions',
        'community.group_message': '💬 New Group Message',
        'community.group_milestone': '🎉 Group Milestone!',
        'community.achievement': '🌟 Community Achievement',
        'community.encouragement': '💝 Spiritual Encouragement',
        'community.view': 'View',
        'community.join': 'Join Discussion',
        'reminder.weekly_checkin': '🤗 Weekly Spiritual Check-in',
        'reminder.devotion': '📖 Time for Daily Devotion',
        'reminder.prayer': '🙏 Prayer Time Reminder'
      },
      zh: {
        'devotion.title': '📖 今日靈修',
        'devotion.read': '立即閱讀',
        'devotion.save': '稍後閱讀',
        'prayer.new': '🙏 新的代禱請求',
        'prayer.answered': '✨ 禱告得應允！',
        'prayer.urgent': '🚨 緊急代禱需要',
        'prayer.pray': '立即禱告',
        'prayer.support': '發送支持',
        'event.reminder': '⛪ 教會活動提醒',
        'event.view': '查看詳情',
        'event.directions': '獲取路線',
        'community.group_message': '💬 新的小組消息',
        'community.group_milestone': '🎉 小組里程碑！',
        'community.achievement': '🌟 社群成就',
        'community.encouragement': '💝 屬靈鼓勵',
        'community.view': '查看',
        'community.join': '加入討論',
        'reminder.weekly_checkin': '🤗 每週屬靈檢視',
        'reminder.devotion': '📖 每日靈修時間',
        'reminder.prayer': '🙏 禱告時間提醒'
      }
    };

    return translations[language][key] || translations['en'][key] || key;
  }

  private isHongKongHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();

    // Static holidays
    const staticHolidays = [
      { month: 1, day: 1 },   // New Year's Day
      { month: 12, day: 25 }, // Christmas Day
      { month: 12, day: 26 }, // Boxing Day
    ];

    for (const holiday of staticHolidays) {
      if (month === holiday.month && day === holiday.day) {
        return true;
      }
    }

    // Easter dates would need to be calculated or stored
    const easterDates = this.getEasterDates(year);
    const dateString = `${month}-${day}`;
    
    return easterDates.includes(dateString);
  }

  private getEasterDates(year: number): string[] {
    // Simplified Easter calculation for demonstration
    // In production, use a proper Easter calculation library
    const easterDates = {
      2024: ['3-29', '3-31'], // Good Friday and Easter Monday
      2025: ['4-18', '4-21'],
      2026: ['4-3', '4-6']
    };
    
    return easterDates[year] || [];
  }

  // Notification Templates for Church Content
  async createDevotionNotification(devotion: {
    id: string;
    title: string;
    verse: string;
    author: string;
  }): Promise<DevotionNotification> {
    const preferences = await this.getUserPreferences();
    const language = preferences.devotions.language;

    return {
      type: 'devotion',
      devotionId: devotion.id,
      title: this.getLocalizedContent('devotion.title', language),
      body: devotion.title,
      verse: devotion.verse,
      icon: '/icons/devotion-icon-96x96.png',
      badge: '/icons/badge-72x72.png',
      image: '/images/devotion-banner.jpg',
      tag: 'daily-devotion',
      data: {
        url: `/devotions/${devotion.id}`,
        author: devotion.author,
        verse: devotion.verse
      },
      actions: [
        {
          action: 'read',
          title: this.getLocalizedContent('devotion.read', language),
          icon: '/icons/read-icon.png'
        },
        {
          action: 'save',
          title: this.getLocalizedContent('devotion.save', language),
          icon: '/icons/bookmark-icon.png'
        }
      ],
      timestamp: Date.now()
    };
  }

  createPrayerNotification(prayer: {
    id: string;
    requestText: string;
    requestType: 'new' | 'answered' | 'urgent';
    requester: string;
  }): PrayerNotification {
    const typeEmojis = {
      new: '🙏',
      answered: '✨',
      urgent: '🚨'
    };

    const typeMessages = {
      new: 'New Prayer Request',
      answered: 'Prayer Answered!',
      urgent: 'Urgent Prayer Needed'
    };

    return {
      type: 'prayer',
      prayerId: prayer.id,
      requestType: prayer.requestType,
      title: `${typeEmojis[prayer.requestType]} ${typeMessages[prayer.requestType]}`,
      body: prayer.requestText.length > 100 
        ? prayer.requestText.substring(0, 97) + '...'
        : prayer.requestText,
      icon: '/icons/prayer-icon-96x96.png',
      badge: '/icons/badge-72x72.png',
      tag: `prayer-${prayer.requestType}`,
      data: {
        url: `/prayers/${prayer.id}`,
        requester: prayer.requester,
        requestType: prayer.requestType
      },
      actions: [
        {
          action: 'pray',
          title: 'Pray Now',
          icon: '/icons/pray-icon.png'
        },
        {
          action: 'support',
          title: 'Send Support',
          icon: '/icons/support-icon.png'
        }
      ],
      timestamp: Date.now()
    };
  }

  createEventNotification(event: {
    id: string;
    title: string;
    startTime: string;
    location?: string;
    type: string;
  }): EventNotification {
    const eventTime = new Date(event.startTime);
    const timeString = eventTime.toLocaleTimeString('en-HK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      type: 'event',
      eventId: event.id,
      eventTime: event.startTime,
      location: event.location,
      title: '⛪ Church Event Reminder',
      body: `${event.title} starts at ${timeString}${event.location ? ` at ${event.location}` : ''}`,
      icon: '/icons/events-icon-96x96.png',
      badge: '/icons/badge-72x72.png',
      tag: `event-${event.id}`,
      data: {
        url: `/events/${event.id}`,
        eventTime: event.startTime,
        location: event.location,
        eventType: event.type
      },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icons/info-icon.png'
        },
        {
          action: 'directions',
          title: 'Get Directions',
          icon: '/icons/directions-icon.png'
        }
      ],
      timestamp: Date.now()
    };
  }

  // Community Engagement Notifications
  async createCommunityNotification(community: {
    id: string;
    type: 'group_message' | 'group_milestone' | 'achievement' | 'encouragement';
    title: string;
    message: string;
    groupId?: string;
    priority: 'low' | 'medium' | 'high';
    metadata?: Record<string, unknown>;
  }): Promise<CommunityNotification> {
    const preferences = await this.getUserPreferences();
    const language = preferences.community.language;

    const typeKey = `community.${community.type}`;
    const localizedTitle = this.getLocalizedContent(typeKey, language);

    return {
      type: 'community',
      communityType: community.type,
      groupId: community.groupId,
      priority: community.priority,
      title: localizedTitle,
      body: community.message.length > 120 
        ? community.message.substring(0, 117) + '...'
        : community.message,
      icon: '/icons/community-icon-96x96.png',
      badge: '/icons/badge-72x72.png',
      tag: `community-${community.type}-${community.id}`,
      data: {
        url: community.groupId ? `/groups/${community.groupId}` : '/community',
        communityType: community.type,
        priority: community.priority,
        groupId: community.groupId,
        ...community.metadata
      },
      actions: [
        {
          action: 'view',
          title: this.getLocalizedContent('community.view', language),
          icon: '/icons/view-icon.png'
        },
        {
          action: 'join',
          title: this.getLocalizedContent('community.join', language),
          icon: '/icons/join-icon.png'
        }
      ],
      timestamp: Date.now()
    };
  }

  async createReminderNotification(reminder: {
    id: string;
    type: 'devotion' | 'prayer' | 'event' | 'weekly_checkin';
    title: string;
    message: string;
    scheduledFor: string;
    recurrence?: 'daily' | 'weekly' | 'monthly';
    metadata?: Record<string, unknown>;
  }): Promise<ReminderNotification> {
    const preferences = await this.getUserPreferences();
    const language = preferences.community.language;

    const typeKey = `reminder.${reminder.type}`;
    const localizedTitle = this.getLocalizedContent(typeKey, language);

    return {
      type: 'reminder',
      reminderType: reminder.type,
      scheduledFor: reminder.scheduledFor,
      recurrence: reminder.recurrence,
      title: localizedTitle,
      body: reminder.message,
      icon: '/icons/reminder-icon-96x96.png',
      badge: '/icons/badge-72x72.png',
      tag: `reminder-${reminder.type}`,
      data: {
        url: this.getReminderUrl(reminder.type),
        reminderType: reminder.type,
        scheduledFor: reminder.scheduledFor,
        ...reminder.metadata
      },
      actions: [
        {
          action: 'view',
          title: this.getLocalizedContent('community.view', language),
          icon: '/icons/view-icon.png'
        }
      ],
      timestamp: Date.now()
    };
  }

  private getReminderUrl(reminderType: string): string {
    switch (reminderType) {
      case 'devotion':
        return '/devotions';
      case 'prayer':
        return '/prayers';
      case 'event':
        return '/events';
      case 'weekly_checkin':
        return '/community/checkin';
      default:
        return '/';
    }
  }

  // Enhanced notification sending with intelligent batching
  async sendNotification(notification: ChurchNotification): Promise<void> {
    const preferences = await this.getUserPreferences();
    
    if (!preferences.enabled) {
      return;
    }

    // Check notification type permissions
    if (!this.isNotificationTypeEnabled(notification, preferences)) {
      return;
    }

    // Check if we should batch this notification
    if (this.shouldBatchNotification(notification)) {
      this.notificationQueue.push(notification);
      
      // Clear existing batch timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      // Set timeout for batching (2 minutes for normal, immediate for urgent)
      const delay = notification.type === 'prayer' && notification.requestType === 'urgent' ? 0 : 2 * 60 * 1000;
      
      this.batchTimeout = window.setTimeout(() => {
        this.processBatchedNotifications();
      }, delay);
    } else {
      // Send immediately for urgent notifications
      await this.sendLocalNotification(notification);
    }
  }

  private isNotificationTypeEnabled(notification: ChurchNotification, preferences: NotificationPreferences): boolean {
    switch (notification.type) {
      case 'devotion':
        return preferences.devotions.enabled;
      case 'prayer':
        return preferences.prayers.enabled && (!preferences.prayers.urgentOnly || notification.requestType === 'urgent');
      case 'event':
        return preferences.events.enabled;
      case 'community':
        return preferences.community.enabled && this.isCommunityNotificationEnabled(notification, preferences);
      case 'reminder':
        return true; // Reminders are always enabled if notifications are on
      default:
        return false;
    }
  }

  private isCommunityNotificationEnabled(notification: CommunityNotification, preferences: NotificationPreferences): boolean {
    switch (notification.communityType) {
      case 'group_message':
        return preferences.community.groupMessages;
      case 'group_milestone':
      case 'achievement':
        return preferences.community.achievements;
      case 'encouragement':
        return preferences.community.weeklyCheckins;
      default:
        return true;
    }
  }

  // Schedule local notifications (for offline scenarios)
  async scheduleLocalNotification(notification: ChurchNotification, delay: number = 0): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      console.error('Service worker not registered');
      return;
    }

    const scheduleTime = Date.now() + delay;
    
    // Send message to service worker to schedule notification
    this.serviceWorkerRegistration.active?.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      notification,
      scheduleTime
    });
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }
    } catch (error) {
      console.error('Error removing subscription from server:', error);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'NOTIFICATION_CLICKED':
        this.handleNotificationClick(data);
        break;
      case 'NOTIFICATION_CLOSED':
        this.handleNotificationClose(data);
        break;
      case 'BACKGROUND_SYNC':
        this.handleBackgroundSync(data);
        break;
    }
  }

  private handleNotificationClick(data: Record<string, unknown>): void {
    // Track notification engagement
    this.trackNotificationEngagement('click', data);
    
    // Handle different actions
    if (data.action) {
      switch (data.action) {
        case 'read':
        case 'view':
          window.location.href = data.url;
          break;
        case 'save':
          this.saveForLater(data);
          break;
        case 'pray':
          this.openPrayerMode(data);
          break;
        case 'directions':
          this.openDirections(data.location);
          break;
      }
    } else {
      // Default action - navigate to content
      window.location.href = data.url;
    }
  }

  private handleNotificationClose(data: Record<string, unknown>): void {
    this.trackNotificationEngagement('close', data);
  }

  private handleBackgroundSync(data: Record<string, unknown>): void {
    // Handle background sync events
    console.log('Background sync triggered:', data);
  }

  private async trackNotificationEngagement(action: string, data: Record<string, unknown>): Promise<void> {
    try {
      await fetch('/api/analytics/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notificationId: data.id,
          notificationType: data.type,
          timestamp: Date.now()
        }),
      });
    } catch (error) {
      console.error('Failed to track notification engagement:', error);
    }
  }

  private saveForLater(data: Record<string, unknown>): void {
    const savedItems = JSON.parse(localStorage.getItem('savedItems') || '[]');
    savedItems.push({
      id: data.id,
      type: data.type,
      url: data.url,
      savedAt: Date.now()
    });
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
  }

  private openPrayerMode(data: Record<string, unknown>): void {
    // Open prayer mode interface
    window.location.href = `/prayers/${data.id}?mode=pray`;
  }

  private openDirections(location?: string): void {
    if (location) {
      const encodedLocation = encodeURIComponent(location);
      window.open(`https://www.google.com/maps/search/${encodedLocation}`, '_blank');
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();
export type { 
  ChurchNotification, 
  DevotionNotification, 
  PrayerNotification, 
  EventNotification,
  CommunityNotification,
  ReminderNotification,
  NotificationSchedule,
  NotificationPreferences
};