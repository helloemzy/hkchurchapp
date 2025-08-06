'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'next-i18next'
import { Search, Filter, Calendar, Grid, List } from 'lucide-react'
import { EventCard } from './EventCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useDebounce } from '@/hooks/useDebounce'

interface Event {
  id: string
  title: string
  title_zh?: string | null
  description: string
  description_zh?: string | null
  category: 'worship' | 'fellowship' | 'study' | 'service' | 'community' | 'outreach'
  start_datetime: string
  end_datetime: string
  location?: string | null
  location_zh?: string | null
  image_url?: string | null
  current_registrations: number
  max_capacity?: number | null
  requires_registration: boolean
  is_featured: boolean
  is_cancelled: boolean
  organizer: {
    id: string
    full_name: string
    avatar_url?: string | null
  }
  is_full?: boolean
  spots_remaining?: number | null
  registration_open?: boolean
}

interface EventsListProps {
  initialEvents?: Event[]
  showFilters?: boolean
  showSearch?: boolean
  showViewToggle?: boolean
  variant?: 'default' | 'compact'
  onRegister?: (eventId: string) => void
  className?: string
}

const categories = [
  'all',
  'worship',
  'fellowship', 
  'study',
  'service',
  'community',
  'outreach'
] as const

export function EventsList({
  initialEvents = [],
  showFilters = true,
  showSearch = true,
  showViewToggle = true,
  variant = 'default',
  onRegister,
  className = ''
}: EventsListProps) {
  const { t } = useTranslation('common')
  
  // State
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true)
  const [showFeatured, setShowFeatured] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch events
  const fetchEvents = useCallback(async (reset = false) => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        limit: '20',
        offset: (reset ? 0 : page * 20).toString()
      })

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm)
      }

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      if (showUpcomingOnly) {
        params.append('upcoming', 'true')
      }

      if (showFeatured) {
        params.append('featured', 'true')
      }

      const response = await fetch(`/api/events?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch events')
      }

      const data = await response.json()
      
      if (reset) {
        setEvents(data.events)
        setPage(0)
      } else {
        setEvents(prev => [...prev, ...data.events])
      }
      
      setHasMore(data.events.length === 20)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, selectedCategory, showUpcomingOnly, showFeatured, page, loading])

  // Reset and fetch when filters change
  useEffect(() => {
    if (page === 0) {
      fetchEvents(true)
    } else {
      setPage(0)
    }
  }, [debouncedSearchTerm, selectedCategory, showUpcomingOnly, showFeatured])

  // Load more events
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  // Load more when page changes
  useEffect(() => {
    if (page > 0) {
      fetchEvents(false)
    }
  }, [page])

  // Filter events locally for immediate UI feedback
  const filteredEvents = events.filter(event => {
    if (showFeatured && !event.is_featured) return false
    if (selectedCategory !== 'all' && event.category !== selectedCategory) return false
    if (showUpcomingOnly && new Date(event.end_datetime) < new Date()) return false
    return true
  })

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => fetchEvents(true)}>
          {t('common.try_again')}
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Search and Filters */}
      {(showSearch || showFilters || showViewToggle) && (
        <div className="space-y-4">
          {/* Search */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('events.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters and View Toggle */}
          {(showFilters || showViewToggle) && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              {/* Filters */}
              {showFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {t(`events.categories.${category}`)}
                      </option>
                    ))}
                  </select>

                  {/* Toggle Filters */}
                  <Button
                    variant={showUpcomingOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {t('events.upcoming')}
                  </Button>

                  <Button
                    variant={showFeatured ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowFeatured(!showFeatured)}
                  >
                    ⭐ {t('events.featured')}
                  </Button>
                </div>
              )}

              {/* View Toggle */}
              {showViewToggle && (
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3 py-1"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3 py-1"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Events Grid/List */}
      {filteredEvents.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('events.no_events')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {debouncedSearchTerm || selectedCategory !== 'all' 
              ? t('events.no_events_filtered')
              : t('events.no_events_available')
            }
          </p>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                variant={viewMode === 'list' ? 'compact' : variant}
                onRegister={onRegister}
              />
            ))}
          </div>

          {/* Loading and Load More */}
          {loading && filteredEvents.length === 0 && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {hasMore && !loading && filteredEvents.length > 0 && (
            <div className="flex justify-center pt-6">
              <Button onClick={loadMore} variant="outline">
                {t('common.load_more')}
              </Button>
            </div>
          )}

          {loading && filteredEvents.length > 0 && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </>
      )}
    </div>
  )
}