'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { Calendar, Users, Star, Activity, RefreshCw } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EventCard } from '@/components/events/EventCard'
import { GroupCard } from '@/components/groups/GroupCard'
import { format, parseISO } from 'date-fns'
import { zhHK, enUS } from 'date-fns/locale'

interface FeedItem {
  id: string
  type: 'event' | 'group' | 'activity' | 'announcement'
  title: string
  title_zh?: string | null
  description?: string | null
  description_zh?: string | null
  created_at: string
  data?: any
  featured?: boolean
}

interface CommunityFeedProps {
  currentUserId?: string
  showEvents?: boolean
  showGroups?: boolean
  showActivities?: boolean
  limit?: number
  className?: string
}

export function CommunityFeed({
  currentUserId,
  showEvents = true,
  showGroups = true,
  showActivities = true,
  limit = 20,
  className = ''
}: CommunityFeedProps) {
  const { t, i18n } = useTranslation('common')
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isZh = i18n.language.startsWith('zh')
  const locale = isZh ? zhHK : enUS

  const fetchCommunityData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const promises = []

      // Fetch featured/upcoming events
      if (showEvents) {
        promises.push(
          fetch('/api/events?featured=true&upcoming=true&limit=5')
            .then(res => res.ok ? res.json() : { events: [] })
        )
      }

      // Fetch open groups
      if (showGroups) {
        promises.push(
          fetch('/api/groups?open_to_join=true&limit=5')
            .then(res => res.ok ? res.json() : { groups: [] })
        )
      }

      const results = await Promise.all(promises)
      
      if (showEvents && results[0]) {
        setEvents(results[0].events || [])
      }

      if (showGroups) {
        const groupIndex = showEvents ? 1 : 0
        if (results[groupIndex]) {
          setGroups(results[groupIndex].groups || [])
        }
      }

      // Create combined feed
      const combinedFeed: FeedItem[] = []

      // Add featured events
      if (showEvents && results[0]?.events) {
        results[0].events.forEach((event: any) => {
          combinedFeed.push({
            id: `event-${event.id}`,
            type: 'event',
            title: event.title,
            title_zh: event.title_zh,
            description: event.description,
            description_zh: event.description_zh,
            created_at: event.created_at,
            data: event,
            featured: event.is_featured
          })
        })
      }

      // Add groups
      if (showGroups) {
        const groupIndex = showEvents ? 1 : 0
        if (results[groupIndex]?.groups) {
          results[groupIndex].groups.forEach((group: any) => {
            combinedFeed.push({
              id: `group-${group.id}`,
              type: 'group',
              title: group.name,
              title_zh: group.name_zh,
              description: group.description,
              description_zh: group.description_zh,
              created_at: group.created_at,
              data: group
            })
          })
        }
      }

      // Sort by created date and featured status
      combinedFeed.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })

      setFeedItems(combinedFeed.slice(0, limit))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load community feed')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCommunityData()
  }, [showEvents, showGroups, showActivities, limit])

  const handleRefresh = () => {
    fetchCommunityData(true)
  }

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('community.feed_error')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline">
          {t('common.try_again')}
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('community.feed_title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('community.feed_subtitle')}
          </p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? t('common.refreshing') : t('common.refresh')}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {showEvents && (
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {events.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('community.upcoming_events')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {showGroups && (
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {groups.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('community.open_groups')}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {feedItems.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('community.total_activities')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Feed Items */}
      {feedItems.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('community.no_activities')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('community.no_activities_description')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Featured Section */}
          {feedItems.some(item => item.featured) && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('community.featured')}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedItems
                  .filter(item => item.featured)
                  .slice(0, 4)
                  .map(item => (
                    <div key={item.id}>
                      {item.type === 'event' && (
                        <EventCard
                          event={item.data}
                          variant="compact"
                        />
                      )}
                      {item.type === 'group' && (
                        <GroupCard
                          group={item.data}
                          variant="compact"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('community.recent_activity')}
            </h3>
            
            <div className="space-y-4">
              {feedItems
                .filter(item => !item.featured)
                .map(item => {
                  const title = isZh && item.title_zh ? item.title_zh : item.title
                  const description = isZh && item.description_zh ? item.description_zh : item.description
                  
                  return (
                    <Card key={item.id} className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {item.type === 'event' && (
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          {item.type === 'group' && (
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                          )}
                          {item.type === 'activity' && (
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {title}
                            </h4>
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              {t(`community.${item.type}`)}
                            </span>
                          </div>
                          
                          {description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                              {description}
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(parseISO(item.created_at), 'PPp', { locale })}
                          </p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}