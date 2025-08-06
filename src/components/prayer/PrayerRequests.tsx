'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuthContext } from '../../lib/auth/auth-context';
import { Database } from '../../lib/supabase/database.types';

type PrayerRequest = Database['public']['Tables']['prayer_requests']['Row'] & {
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  user_has_prayed?: boolean;
  total_prayers?: number;
};

interface PrayerRequestsProps {
  showMyRequests?: boolean;
  showPublicOnly?: boolean;
  className?: string;
}

const PRAYER_CATEGORIES = [
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'work', label: 'Work', icon: '💼' },
  { value: 'church', label: 'Church', icon: '⛪' },
  { value: 'community', label: 'Community', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '📝' },
] as const;

export const PrayerRequests: React.FC<PrayerRequestsProps> = ({
  showMyRequests = false,
  showPublicOnly = true,
  className = '',
}) => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPrayerForm, setShowNewPrayerForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New prayer form state
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    description: '',
    category: 'personal' as const,
    is_public: false,
  });

  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      fetchPrayers();
    }
  }, [user, showMyRequests, showPublicOnly, selectedCategory]);

  const fetchPrayers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (showMyRequests) {
        params.append('my_requests', 'true');
      } else if (showPublicOnly) {
        params.append('public', 'true');
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/prayers?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setPrayers(data.prayers || []);
      }
    } catch (error) {
      console.error('Error fetching prayers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrayForRequest = async (prayerId: string) => {
    try {
      const response = await fetch(`/api/prayers/${prayerId}/pray`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.already_prayed) {
          // Show message that they already prayed
          console.log(data.message);
        } else {
          // Update the prayer in the list
          setPrayers(prayers.map(prayer => 
            prayer.id === prayerId 
              ? { 
                  ...prayer, 
                  user_has_prayed: true, 
                  total_prayers: (prayer.total_prayers || 0) + 1 
                }
              : prayer
          ));
        }
      }
    } catch (error) {
      console.error('Error recording prayer:', error);
    }
  };

  const handleSubmitNewPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPrayer.title.trim() || !newPrayer.description.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/prayers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPrayer),
      });

      if (response.ok) {
        // Reset form and refresh prayers
        setNewPrayer({
          title: '',
          description: '',
          category: 'personal',
          is_public: false,
        });
        setShowNewPrayerForm(false);
        fetchPrayers();
      }
    } catch (error) {
      console.error('Error creating prayer request:', error);
    }
  };

  const getCategoryInfo = (category: string) => {
    return PRAYER_CATEGORIES.find(cat => cat.value === category) || PRAYER_CATEGORIES[0];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return 'Just now';
  };

  if (!user) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Prayer Requests</h2>
          <p className="text-gray-600 mb-4">
            Sign in to view and share prayer requests with the community
          </p>
          <Button variant="primary">Sign In</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900">
            🙏 Prayer Requests
          </h1>
          <p className="text-gray-600 mt-1">
            {showMyRequests ? 'Your prayer requests' : 'Community prayer requests'}
          </p>
        </div>

        <Button 
          onClick={() => setShowNewPrayerForm(true)}
          className="whitespace-nowrap"
        >
          + New Prayer Request
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Categories
        </button>
        {PRAYER_CATEGORIES.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.icon} {category.label}
          </button>
        ))}
      </div>

      {/* Prayer Requests List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : prayers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 text-lg">No prayer requests found</p>
          <p className="text-gray-400 text-sm mt-2">
            Be the first to share a prayer request with the community
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {prayers.map((prayer) => {
            const categoryInfo = getCategoryInfo(prayer.category);
            
            return (
              <Card key={prayer.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {prayer.profiles?.avatar_url ? (
                        <img
                          src={prayer.profiles.avatar_url}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {prayer.profiles?.full_name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {prayer.profiles?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getTimeSince(prayer.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {categoryInfo.icon} {categoryInfo.label}
                    </span>
                    {prayer.is_answered && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                        ✅ Answered
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {prayer.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {prayer.description}
                  </p>
                </div>

                {prayer.is_answered && prayer.answered_description && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">
                      🎉 Prayer Answered
                    </h4>
                    <p className="text-green-700">
                      {prayer.answered_description}
                    </p>
                    <p className="text-green-600 text-sm mt-2">
                      Answered on {formatDate(prayer.answered_at || '')}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>🙏 {prayer.total_prayers || 0} prayers</span>
                    <span>📅 {formatDate(prayer.created_at)}</span>
                  </div>

                  {!showMyRequests && (
                    <Button
                      variant={prayer.user_has_prayed ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handlePrayForRequest(prayer.id)}
                      disabled={prayer.user_has_prayed}
                    >
                      {prayer.user_has_prayed ? '🙏 Prayed' : '🙏 Pray for this'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Prayer Request Modal */}
      {showNewPrayerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">New Prayer Request</h3>

            <form onSubmit={handleSubmitNewPrayer}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPrayer.title}
                  onChange={(e) => setNewPrayer({ ...newPrayer, title: e.target.value })}
                  placeholder="Brief title for your prayer request"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newPrayer.category}
                  onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {PRAYER_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newPrayer.description}
                  onChange={(e) => setNewPrayer({ ...newPrayer, description: e.target.value })}
                  placeholder="Share your prayer request..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPrayer.is_public}
                    onChange={(e) => setNewPrayer({ ...newPrayer, is_public: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Share with the community (others can see and pray for this)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowNewPrayerForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Prayer Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};