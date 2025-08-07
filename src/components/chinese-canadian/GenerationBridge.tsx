'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface FamilyConnection {
  id: string;
  elderName: string;
  elderNameZh: string;
  youthName: string;
  elderAge: number;
  youthAge: number;
  connectionType: 'translation' | 'tech-help' | 'devotion' | 'mentorship';
  status: 'active' | 'pending' | 'completed';
  lastActivity: string;
  sharedInterests: string[];
}

interface GenerationActivity {
  id: string;
  title: string;
  titleZh: string;
  type: 'learning' | 'sharing' | 'worship' | 'service';
  participants: {
    elders: number;
    youth: number;
  };
  description: string;
  descriptionZh: string;
  nextSession: string;
  icon: string;
  color: string;
}

const familyConnections: FamilyConnection[] = [
  {
    id: '1',
    elderName: 'Mrs. Chen',
    elderNameZh: '陳婆婆',
    youthName: 'Kevin Chen',
    elderAge: 72,
    youthAge: 19,
    connectionType: 'tech-help',
    status: 'active',
    lastActivity: '2025-01-05',
    sharedInterests: ['Bible Study', 'Cantonese Music', 'Cooking']
  },
  {
    id: '2',
    elderName: 'Mr. Wang',
    elderNameZh: '王爺爺',
    youthName: 'Grace Liu',
    elderAge: 68,
    youthAge: 22,
    connectionType: 'translation',
    status: 'active',
    lastActivity: '2025-01-04',
    sharedInterests: ['Prayer Ministry', 'Chinese Calligraphy', 'History']
  },
  {
    id: '3',
    elderName: 'Mrs. Li',
    elderNameZh: '李奶奶',
    youthName: 'David Wong',
    elderAge: 75,
    youthAge: 16,
    connectionType: 'devotion',
    status: 'active',
    lastActivity: '2025-01-03',
    sharedInterests: ['Daily Devotions', 'Traditional Songs', 'Gardening']
  }
];

const generationActivities: GenerationActivity[] = [
  {
    id: '1',
    title: 'Tech Wisdom Exchange',
    titleZh: '科技智慧交流',
    type: 'learning',
    participants: { elders: 8, youth: 8 },
    description: 'Youth teach technology while elders share life wisdom',
    descriptionZh: '青年教授科技，長者分享人生智慧',
    nextSession: '2025-01-08',
    icon: '📱',
    color: 'bg-gradient-youth-energy'
  },
  {
    id: '2',
    title: 'Heritage Story Circle',
    titleZh: '傳承故事圈',
    type: 'sharing',
    participants: { elders: 12, youth: 15 },
    description: 'Elders share immigration stories, youth document family history',
    descriptionZh: '長者分享移民故事，青年記錄家族歷史',
    nextSession: '2025-01-10',
    icon: '📚',
    color: 'bg-gradient-elder-wisdom'
  },
  {
    id: '3',
    title: 'Bilingual Prayer Ministry',
    titleZh: '雙語禱告事工',
    type: 'worship',
    participants: { elders: 20, youth: 18 },
    description: 'Intergenerational prayer with real-time translation',
    descriptionZh: '跨世代禱告與即時翻譯',
    nextSession: '2025-01-07',
    icon: '🙏',
    color: 'bg-gradient-family-unity'
  },
  {
    id: '4',
    title: 'Community Service Bridge',
    titleZh: '社區服務橋樑',
    type: 'service',
    participants: { elders: 10, youth: 12 },
    description: 'Joint service projects combining traditional values with modern methods',
    descriptionZh: '結合傳統價值與現代方法的聯合服務項目',
    nextSession: '2025-01-12',
    icon: '🤝',
    color: 'bg-gradient-cultural'
  }
];

export function GenerationBridge() {
  const [activeTab, setActiveTab] = useState<'connections' | 'activities'>('connections');
  const [selectedConnection, setSelectedConnection] = useState<FamilyConnection | null>(null);

  const getConnectionTypeInfo = (type: FamilyConnection['connectionType']) => {
    switch (type) {
      case 'translation':
        return { icon: '🌐', label: 'Translation Help', labelZh: '翻譯幫助', color: 'text-chinese-jade' };
      case 'tech-help':
        return { icon: '💻', label: 'Tech Support', labelZh: '科技支援', color: 'text-youth-innovation' };
      case 'devotion':
        return { icon: '📖', label: 'Devotion Partner', labelZh: '靈修夥伴', color: 'text-chinese-gold' };
      case 'mentorship':
        return { icon: '🎓', label: 'Life Mentorship', labelZh: '人生指導', color: 'text-elder-wisdom' };
    }
  };

  const getStatusColor = (status: FamilyConnection['status']) => {
    switch (status) {
      case 'active': return 'bg-chinese-jade text-white';
      case 'pending': return 'bg-chinese-gold text-white';
      case 'completed': return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Generation Bridge
        </h2>
        <p className="text-lg text-gray-600 mb-1">
          Connecting Wisdom with Innovation
        </p>
        <p className="chinese-text text-gray-500">
          世代橋樑 - 連結智慧與創新
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <Button
            variant={activeTab === 'connections' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('connections')}
            className="mr-1"
          >
            Family Connections
          </Button>
          <Button
            variant={activeTab === 'activities' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('activities')}
          >
            Group Activities
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'connections' ? (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Active family connections bridging generations through faith and culture
            </p>
            <p className="chinese-text text-gray-500 text-sm">
              透過信仰與文化連結世代的活躍家庭聯繫
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyConnections.map((connection) => {
              const typeInfo = getConnectionTypeInfo(connection.connectionType);
              return (
                <Card
                  key={connection.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-family-unity"
                  onClick={() => setSelectedConnection(connection)}
                >
                  <div className="p-6">
                    {/* Connection Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-2xl`}>{typeInfo.icon}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(connection.status)}`}>
                        {connection.status}
                      </span>
                    </div>

                    {/* Participants */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-elder-wisdom/20 rounded-full flex items-center justify-center">
                          <span className="text-lg">👴</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{connection.elderName}</p>
                          <p className="text-sm chinese-text text-gray-600">{connection.elderNameZh} • {connection.elderAge}歲</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="w-8 h-0.5 bg-chinese-gold rounded-full"></div>
                        <span className="mx-2 text-chinese-gold">🤝</span>
                        <div className="w-8 h-0.5 bg-chinese-gold rounded-full"></div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-youth-energy/20 rounded-full flex items-center justify-center">
                          <span className="text-lg">👦</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{connection.youthName}</p>
                          <p className="text-sm text-gray-600">{connection.youthAge} years old</p>
                        </div>
                      </div>
                    </div>

                    {/* Connection Type */}
                    <div className="text-center mb-3">
                      <p className={`text-sm font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </p>
                      <p className="text-xs chinese-text text-gray-600">
                        {typeInfo.labelZh}
                      </p>
                    </div>

                    {/* Last Activity */}
                    <div className="text-center text-xs text-gray-500">
                      Last activity: {new Date(connection.lastActivity).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <p className="text-gray-600">
              Group activities that bring generations together in faith and fellowship
            </p>
            <p className="chinese-text text-gray-500 text-sm">
              在信仰與團契中聚集世代的小組活動
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generationActivities.map((activity) => (
              <Card
                key={activity.id}
                className={`${activity.color} border-0 hover:scale-102 transition-transform`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{activity.icon}</span>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="text-elder-wisdom">👴</span>
                          {activity.participants.elders}
                        </span>
                        <span className="text-gray-400">+</span>
                        <span className="flex items-center gap-1">
                          <span className="text-youth-energy">👦</span>
                          {activity.participants.youth}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {activity.title}
                  </h3>
                  <p className="chinese-text text-gray-600 mb-3">
                    {activity.titleZh}
                  </p>

                  <p className="text-gray-700 mb-4">
                    {activity.description}
                  </p>
                  <p className="chinese-text text-gray-600 text-sm mb-4">
                    {activity.descriptionZh}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      Next: {new Date(activity.nextSession).toLocaleDateString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </span>
                    <Button size="sm" variant="primary">
                      Join Activity
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Connection Detail Modal */}
      {selectedConnection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-family-unity p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Family Connection Details
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConnection(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Participants */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-elder-respect/10 rounded-lg">
                  <span className="text-2xl">👴</span>
                  <div>
                    <p className="font-medium">{selectedConnection.elderName}</p>
                    <p className="chinese-text text-sm text-gray-600">
                      {selectedConnection.elderNameZh} • {selectedConnection.elderAge}歲
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-youth-energy/10 rounded-lg">
                  <span className="text-2xl">👦</span>
                  <div>
                    <p className="font-medium">{selectedConnection.youthName}</p>
                    <p className="text-sm text-gray-600">
                      {selectedConnection.youthAge} years old
                    </p>
                  </div>
                </div>
              </div>

              {/* Shared Interests */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Shared Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedConnection.sharedInterests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-chinese-gold/20 text-chinese-gold text-sm rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connection Actions */}
              <div className="flex gap-2 pt-4">
                <Button variant="primary" size="sm" className="flex-1">
                  Send Message
                </Button>
                <Button variant="ghost" size="sm" className="flex-1">
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerationBridge;