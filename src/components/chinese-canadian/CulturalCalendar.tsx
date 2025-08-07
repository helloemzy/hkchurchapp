'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface CulturalEvent {
  id: string;
  title: string;
  titleZh: string;
  date: string;
  type: 'chinese' | 'canadian' | 'christian' | 'bridge';
  description: string;
  descriptionZh: string;
  icon: string;
  color: string;
  significance?: string;
  significanceZh?: string;
}

const culturalEvents: CulturalEvent[] = [
  {
    id: '1',
    title: 'Chinese New Year Celebration',
    titleZh: '農曆新年慶典',
    date: '2025-01-29',
    type: 'bridge',
    description: 'Celebrating new beginnings with traditional lion dance, red envelopes, and Christian blessings',
    descriptionZh: '舞獅、紅包與基督教祝福慶祝新的開始',
    icon: '🧧',
    color: 'bg-error-100',
    significance: 'Family unity, renewal, and Gods blessings for the new year',
    significanceZh: '家庭團結、更新與上帝對新年的祝福'
  },
  {
    id: '2',
    title: 'Mid-Autumn Festival',
    titleZh: '中秋節',
    date: '2025-09-07',
    type: 'bridge',
    description: 'Moon viewing, mooncakes, and thanksgiving prayers for family reunion',
    descriptionZh: '賞月、月餅與家庭團圓感恩禱告',
    icon: '🥮',
    color: 'bg-warning-100',
    significance: 'Gratitude for Gods provision and family fellowship',
    significanceZh: '感恩上帝的供應與家庭的團契'
  },
  {
    id: '3',
    title: 'Canada Day Heritage Service',
    titleZh: '加拿大國慶傳承崇拜',
    date: '2025-07-01',
    type: 'bridge',
    description: 'Celebrating Canadian values with Chinese Canadian testimonies',
    descriptionZh: '以華裔加拿大人見證慶祝加拿大價值觀',
    icon: '🍁',
    color: 'bg-primary-100',
    significance: 'Honoring our multicultural identity in Christ',
    significanceZh: '在基督裡榮耀我們的多元文化身分'
  },
  {
    id: '4',
    title: 'Qingming Memorial Service',
    titleZh: '清明追思禮拜',
    date: '2025-04-04',
    type: 'bridge',
    description: 'Christian memorial service honoring ancestors with hope in resurrection',
    descriptionZh: '以復活盼望紀念祖先的基督教追思禮拜',
    icon: '🕊️',
    color: 'bg-success-100',
    significance: 'Remembering loved ones with eternal hope',
    significanceZh: '以永恆盼望紀念親人'
  },
  {
    id: '5',
    title: 'Dragon Boat Festival',
    titleZh: '端午節',
    date: '2025-05-31',
    type: 'chinese',
    description: 'Community unity and perseverance through dragon boat racing and zongzi sharing',
    descriptionZh: '透過龍舟競賽與粽子分享展現社區團結與堅持',
    icon: '🐉',
    color: 'bg-gray-100',
    significance: 'Unity in diversity, perseverance in faith',
    significanceZh: '多樣性中的合一，信仰中的堅持'
  }
];

export function CulturalCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<CulturalEvent | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  const getEventTypeColor = (type: CulturalEvent['type']) => {
    switch (type) {
      case 'chinese': return 'text-chinese-red';
      case 'canadian': return 'text-canadian-red';
      case 'christian': return 'text-primary-600';
      case 'bridge': return 'text-chinese-gold';
      default: return 'text-gray-600';
    }
  };

  const getEventTypeBadge = (type: CulturalEvent['type']) => {
    switch (type) {
      case 'chinese': return '🇨🇳 Heritage';
      case 'canadian': return '🇨🇦 Canadian';
      case 'christian': return '✝️ Christian';
      case 'bridge': return '🌉 Bridge';
      default: return 'Event';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Cultural Calendar
          </h2>
          <p className="text-sm chinese-text text-gray-600">
            文化日曆 - 傳統與信仰的融合
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
        </div>
      </div>

      {/* Events Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {culturalEvents.map((event) => (
            <Card
              key={event.id}
              className={`${event.color} border-0 hover:scale-105 transition-transform cursor-pointer`}
              onClick={() => setSelectedEvent(event)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{event.icon}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/20 ${getEventTypeColor(event.type)}`}>
                    {getEventTypeBadge(event.type)}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">
                  {event.title}
                </h3>
                <p className="text-sm chinese-text text-gray-600 mb-3">
                  {event.titleZh}
                </p>
                
                <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                  {event.description}
                </p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-800">
                    {new Date(event.date).toLocaleDateString('en-CA', { 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                  <Button size="sm" variant="ghost">
                    Learn More
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {culturalEvents
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 ${event.color} rounded-full flex items-center justify-center`}>
                    <span className="text-xl">{event.icon}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {event.title}
                      </h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full bg-gray-100 ${getEventTypeColor(event.type)}`}>
                        {getEventTypeBadge(event.type)}
                      </span>
                    </div>
                    <p className="text-sm chinese-text text-gray-600 mb-2">
                      {event.titleZh}
                    </p>
                    <p className="text-sm text-gray-700">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(event.date).toLocaleDateString('en-CA', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className={`${selectedEvent.color} p-6 rounded-t-2xl`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedEvent.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedEvent.title}
                    </h3>
                    <p className="chinese-text text-gray-700">
                      {selectedEvent.titleZh}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 mb-2">{selectedEvent.description}</p>
                <p className="chinese-text text-gray-600">{selectedEvent.descriptionZh}</p>
              </div>
              
              {selectedEvent.significance && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Spiritual Significance</h4>
                  <p className="text-gray-700 mb-2">{selectedEvent.significance}</p>
                  <p className="chinese-text text-gray-600">{selectedEvent.significanceZh}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-4 border-t">
                <span className={`text-sm font-medium px-3 py-1 rounded-full bg-gray-100 ${getEventTypeColor(selectedEvent.type)}`}>
                  {getEventTypeBadge(selectedEvent.type)}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(selectedEvent.date).toLocaleDateString('en-CA', { 
                    year: 'numeric',
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CulturalCalendar;