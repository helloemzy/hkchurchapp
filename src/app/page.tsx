'use client';

import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, DevotionCard, EventCard } from '../components/ui/Card';
import { MobileNavigationBar, createChurchNavigation } from '../components/navigation/MobileNavigationBar';
import { DevotionReader } from '../components/devotions/DevotionReader';
import { BibleReader } from '../components/bible/BibleReader';
import { PrayerRequests } from '../components/prayer/PrayerRequests';
import WeChatStyleFAB from '../components/chinese-canadian/WeChatStyleFAB';
import CulturalCalendar from '../components/chinese-canadian/CulturalCalendar';
import GenerationBridge from '../components/chinese-canadian/GenerationBridge';
import ElderFriendlyMode from '../components/chinese-canadian/ElderFriendlyMode';

type ActiveView = 'devotion' | 'bible' | 'prayer' | 'events' | 'home' | 'cultural-calendar' | 'generation-bridge';

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>('home');

  // Sample data for demonstration
  const todaysDevotion = {
    title: "Walking in Faith",
    date: "Today, December 2024", 
    verse: "Trust in the Lord with all your heart and lean not on your own understanding. - Proverbs 3:5",
    excerpt: "In our journey of faith, we often encounter moments where the path ahead seems unclear. Today's reflection encourages us to trust in God's perfect plan...",
    readTime: "3 min read"
  };

  const upcomingEvents = [
    {
      title: "Sunday Morning Worship",
      date: "December 8",
      time: "10:00 AM",
      location: "Main Sanctuary",
      category: "worship" as const,
      attendees: 145,
      maxAttendees: 200
    },
    {
      title: "Young Adults Fellowship",
      date: "December 10", 
      time: "7:30 PM",
      location: "Community Hall",
      category: "fellowship" as const,
      attendees: 28,
      maxAttendees: 40
    },
    {
      title: "Bible Study Group",
      date: "December 12",
      time: "7:00 PM", 
      location: "Room 203",
      category: "study" as const,
      attendees: 12,
      maxAttendees: 15
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-heritage">
      {/* Navigation Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">✝</span>
              </div>
              <div>
                <h1 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100">
                  中加教會 Coquitlam
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 chinese-text">Chinese Canadian Church</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant={activeView === 'home' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('home')}
              >
                Home
              </Button>
              <Button
                variant={activeView === 'devotion' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('devotion')}
              >
                📖 Devotions
              </Button>
              <Button
                variant={activeView === 'bible' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('bible')}
              >
                📜 Bible
              </Button>
              <Button
                variant={activeView === 'events' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('events')}
              >
                🏮 Cultural
              </Button>
              <Button
                variant={activeView === 'generation-bridge' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('generation-bridge')}
              >
                🤝 Generations
              </Button>
              <Button
                variant={activeView === 'prayer' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('prayer')}
              >
                🙏 Prayer
              </Button>
            </div>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'home' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-chinese-gold/20 rounded-full text-chinese-red text-sm font-medium mb-4">
                <div className="w-2 h-2 bg-chinese-jade rounded-full animate-pulse"></div>
                Cultural Bridge Ready 🇨🇦🇨🇳
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
                Where Heritage Meets Faith
                <span className="bg-gradient-accent bg-clip-text text-transparent block"> 傳統與信仰的橋樑</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-2">
                Serving the Chinese Canadian community in Coquitlam - bridging generations through faith, culture, and digital innovation.
              </p>
              <p className="text-base text-gray-500 dark:text-gray-400 chinese-text">
                服務高貴林華裔加拿大社區 - 透過信仰、文化與數字創新連接世代。
              </p>
            </div>

            {/* Cultural Heritage Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card 
                variant="gradient" 
                className="p-6 group cursor-pointer bg-gradient-elder-wisdom border border-chinese-gold/30"
                onClick={() => setActiveView('devotion')}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-chinese-gold/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📖</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Family Devotions</h3>
                  <p className="text-sm text-gray-600 chinese-text">家庭靈修 - 三代同堂</p>
                </div>
              </Card>

              <Card 
                variant="worship" 
                className="p-6 group cursor-pointer bg-gradient-cultural border border-chinese-jade/30"
                onClick={() => setActiveView('bible')}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-chinese-jade/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Bilingual Bible</h3>
                  <p className="text-sm text-gray-600 chinese-text">雙語聖經 - 中英對照</p>
                </div>
              </Card>

              <Card 
                variant="prayer" 
                className="p-6 group cursor-pointer bg-gradient-celebration border border-festival-lantern/30"
                onClick={() => setActiveView('cultural-calendar')}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-festival-lantern/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🏮</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Cultural Calendar</h3>
                  <p className="text-sm text-gray-600 chinese-text">文化日曆 - 春節中秋</p>
                </div>
              </Card>

              <Card 
                variant="scripture" 
                className="p-6 group cursor-pointer bg-gradient-youth-energy border border-youth-connection/30"
                onClick={() => setActiveView('generation-bridge')}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-youth-connection/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Generation Bridge</h3>
                  <p className="text-sm text-gray-600 chinese-text">世代橋樑 - 青年長者</p>
                </div>
              </Card>
            </div>

            {/* Today's Highlights Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Today's Devotion */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Today's Devotion</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <DevotionCard
                  title={todaysDevotion.title}
                  date={todaysDevotion.date}
                  verse={todaysDevotion.verse}
                  excerpt={todaysDevotion.excerpt}
                  readTime={todaysDevotion.readTime}
                  onRead={() => setActiveView('devotion')}
                />
              </div>

              {/* Upcoming Events */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Upcoming Events</h3>
                  <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 2).map((event, index) => (
                    <EventCard
                      key={index}
                      title={event.title}
                      date={event.date}
                      time={event.time}
                      location={event.location}
                      category={event.category}
                      attendees={event.attendees}
                      maxAttendees={event.maxAttendees}
                      onJoin={() => console.log('Join event')}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* PWA Features Status */}
            <Card variant="elevated" className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 dark:bg-success-900/30 rounded-full text-success-700 dark:text-success-300 text-sm font-medium mb-4">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  Production Deployment Successful
                </div>
                <h3 className="text-2xl font-display font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Hong Kong Church PWA is Live!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our Progressive Web Application is now serving the Hong Kong Christian community
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Core PWA Features
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Offline functionality with service worker</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">App installation and home screen shortcuts</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Push notifications for prayers and events</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Mobile-first responsive design</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    Multilingual Support
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Traditional Chinese (Hong Kong)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Simplified Chinese</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">English</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Cultural context adaptation</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              {/* Install Prompt */}
              <div className="mt-8 p-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xl">📱</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-1">
                      Install as App
                    </h4>
                    <p className="text-sm text-primary-600 dark:text-primary-300">
                      Add to your home screen for the full app experience with offline access
                    </p>
                  </div>
                  <Button variant="primary" size="sm">
                    Install App
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Other Views */}
        {activeView === 'devotion' && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setActiveView('home')}>
                ← Back
              </Button>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">Daily Devotions</h2>
              <span className="chinese-text text-gray-500">每日靈修</span>
            </div>
            
            <DevotionReader showProgress={true} />
          </div>
        )}

        {activeView === 'bible' && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setActiveView('home')}>
                ← Back
              </Button>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">Bible Study</h2>
              <span className="chinese-text text-gray-500">聖經研讀</span>
            </div>
            
            <BibleReader language="en" />
          </div>
        )}

        {activeView === 'events' && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setActiveView('home')}>
                ← Back
              </Button>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">Church Events</h2>
              <span className="chinese-text text-gray-500">教會活動</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={index}
                  title={event.title}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  category={event.category}
                  attendees={event.attendees}
                  maxAttendees={event.maxAttendees}
                  onJoin={() => console.log('Join event')}
                  onShare={() => console.log('Share event')}
                />
              ))}
            </div>
          </div>
        )}

        {activeView === 'prayer' && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setActiveView('home')}>
                ← Back
              </Button>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">Prayer Community</h2>
              <span className="chinese-text text-gray-500">禱告社區</span>
            </div>
            
            <PrayerRequests showPublicOnly={true} />
          </div>
        )}

        {activeView === 'cultural-calendar' && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setActiveView('home')}>
                ← Back
              </Button>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">Cultural Calendar</h2>
              <span className="chinese-text text-gray-500">文化日曆</span>
            </div>
            
            <CulturalCalendar />
          </div>
        )}

        {activeView === 'generation-bridge' && (
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setActiveView('home')}>
                ← Back
              </Button>
              <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100">Generation Bridge</h2>
              <span className="chinese-text text-gray-500">世代橋樑</span>
            </div>
            
            <GenerationBridge />
          </div>
        )}
      </main>
      
      {/* Elder-Friendly Mode Toggle */}
      <ElderFriendlyMode />

      {/* WeChat-style Floating Action Button */}
      <WeChatStyleFAB
        onPrayerWall={() => setActiveView('prayer')}
        onOffering={() => console.log('Opening offerings')}
        onFamilyConnect={() => setActiveView('generation-bridge')}
        onCulturalCalendar={() => setActiveView('cultural-calendar')}
        onElderHelp={() => console.log('Opening elder help')}
      />

      {/* Mobile Navigation - Only visible on small screens */}
      <MobileNavigationBar 
        items={createChurchNavigation(activeView, setActiveView)}
      />
      
      {/* Bottom padding to account for mobile navigation */}
      <div className="h-20 sm:h-0" />
    </div>
  );
}