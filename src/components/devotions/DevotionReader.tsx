'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuthContext } from '../../lib/auth/auth-context';
import { Database } from '../../lib/supabase/database.types';

type Devotion = Database['public']['Tables']['devotions']['Row'];
type DevotionProgress = Database['public']['Tables']['user_devotion_progress']['Row'];

interface DevotionReaderProps {
  devotion?: Devotion;
  showProgress?: boolean;
  onComplete?: (devotionId: string) => void;
  className?: string;
}

export const DevotionReader: React.FC<DevotionReaderProps> = ({
  devotion: initialDevotion,
  showProgress = true,
  onComplete,
  className = '',
}) => {
  const [devotion, setDevotion] = useState<Devotion | null>(initialDevotion || null);
  const [progress, setProgress] = useState<DevotionProgress | null>(null);
  const [loading, setLoading] = useState(!initialDevotion);
  const [reflectionNotes, setReflectionNotes] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [saving, setSaving] = useState(false);

  const { user } = useAuthContext();

  useEffect(() => {
    if (!initialDevotion) {
      fetchTodaysDevotion();
    }
  }, [initialDevotion]);

  useEffect(() => {
    if (devotion && user && showProgress) {
      fetchProgress();
    }
  }, [devotion, user, showProgress]);

  const fetchTodaysDevotion = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/devotions/today?lang=en');
      
      if (response.ok) {
        const data = await response.json();
        setDevotion(data.devotion);
      } else {
        console.error('Failed to fetch today\'s devotion');
      }
    } catch (error) {
      console.error('Error fetching devotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!devotion?.id || !user) return;

    try {
      const response = await fetch(`/api/devotions/progress?devotion_id=${devotion.id}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.progress) {
          setProgress(data.progress);
          setReflectionNotes(data.progress.reflection_notes || '');
          setIsBookmarked(data.progress.bookmarked || false);
          setIsShared(data.progress.shared || false);
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const saveProgress = async (completed = false) => {
    if (!devotion?.id || !user) return;

    try {
      setSaving(true);
      const progressData = {
        devotion_id: devotion.id,
        reflection_notes: reflectionNotes.trim() || null,
        shared: isShared,
        bookmarked: isBookmarked,
      };

      const response = await fetch('/api/devotions/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData),
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data.progress);
        
        if (completed && onComplete) {
          onComplete(devotion.id);
        }
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = () => {
    saveProgress(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!devotion) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No devotion available</p>
          <p className="text-gray-400 text-sm mt-2">
            Please check back later or contact your church administrator.
          </p>
        </div>
      </Card>
    );
  }

  const isCompleted = progress?.completed_at;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <Card className="p-6 mb-6">
        <div className="text-center">
          <p className="text-primary-600 text-sm font-medium mb-2">
            {formatDate(devotion.date)}
          </p>
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            {devotion.title}
          </h1>
          <p className="text-gray-600">
            By {devotion.author}
          </p>
        </div>
      </Card>

      {/* Scripture */}
      <Card className="p-6 mb-6 bg-primary-50 border-primary-200">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary-800 mb-4">
            {devotion.scripture_reference}
          </h2>
          <blockquote className="text-lg text-primary-700 font-mono leading-relaxed italic">
            "{devotion.scripture_text}"
          </blockquote>
        </div>
      </Card>

      {/* Devotion Content */}
      <Card className="p-6 mb-6">
        <div className="prose prose-lg max-w-none">
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: devotion.content.replace(/\n/g, '<br />') 
            }}
          />
        </div>
      </Card>

      {/* Reflection Questions */}
      {devotion.reflection_questions && devotion.reflection_questions.length > 0 && (
        <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-xl font-semibold text-yellow-800 mb-4">
            💭 Reflection Questions
          </h3>
          <ul className="space-y-3">
            {devotion.reflection_questions.map((question, index) => (
              <li key={index} className="flex items-start">
                <span className="text-yellow-600 font-bold mr-3 mt-1">
                  {index + 1}.
                </span>
                <span className="text-yellow-700">{question}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* User Interaction Section */}
      {user && showProgress && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            📝 Personal Reflection
          </h3>
          
          <textarea
            value={reflectionNotes}
            onChange={(e) => setReflectionNotes(e.target.value)}
            placeholder="Share your thoughts, prayers, or insights from today's devotion..."
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows={4}
          />

          <div className="flex flex-wrap items-center justify-between mt-4 gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isBookmarked}
                  onChange={(e) => setIsBookmarked(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">📌 Bookmark</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isShared}
                  onChange={(e) => setIsShared(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">🤝 Share with community</span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => saveProgress(false)}
                disabled={saving}
                size="sm"
              >
                {saving ? 'Saving...' : 'Save Notes'}
              </Button>

              {!isCompleted && (
                <Button
                  onClick={handleComplete}
                  disabled={saving}
                  size="sm"
                >
                  {saving ? 'Completing...' : '✓ Mark Complete'}
                </Button>
              )}
            </div>
          </div>

          {isCompleted && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                Completed on {new Date(progress!.completed_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Tags */}
      {devotion.tags && devotion.tags.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {devotion.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};