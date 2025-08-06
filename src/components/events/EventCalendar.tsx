'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EventCard } from './EventCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from 'date-fns'
import { zhHK, enUS } from 'date-fns/locale'

interface Event {
  id: string
  title: string
  title_zh?: string | null
  start_datetime: string
  end_datetime: string
  category: 'worship' | 'fellowship' | 'study' | 'service' | 'community' | 'outreach'
  is_featured: boolean
  is_cancelled: boolean
  current_registrations: number
  max_capacity?: number | null
  requires_registration: boolean
}

interface EventCalendarProps {
  onEventClick?: (eventId: string) => void
  onRegister?: (eventId: string) => void
  showMiniEvents?: boolean
  className?: string
}

const categoryColors = {
  worship: 'bg-purple-500',
  fellowship: 'bg-blue-500',
  study: 'bg-green-500',
  service: 'bg-orange-500',
  community: 'bg-pink-500',
  outreach: 'bg-red-500'
}

export function EventCalendar({ 
  onEventClick, 
  onRegister, 
  showMiniEvents = true,
  className = '' 
}: EventCalendarProps) {
  const { t, i18n } = useTranslation('common')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  
  const isZh = i18n.language.startsWith('zh')
  const locale = isZh ? zhHK : enUS

  // Fetch events for the current month
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const start = startOfMonth(currentDate)
        const end = endOfMonth(currentDate)
        
        const params = new URLSearchParams({
          upcoming: 'true',
          limit: '100'
        })

        const response = await fetch(`/api/events?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          
          // Filter events for the current month view (including some from adjacent months)
          const monthStart = startOfWeek(start)
          const monthEnd = endOfWeek(end)
          
          const filteredEvents = data.events.filter((event: Event) => {
            const eventDate = parseISO(event.start_datetime)
            return eventDate >= monthStart && eventDate <= monthEnd
          })
          
          setEvents(filteredEvents)
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [currentDate])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const startCalendar = startOfWeek(start)
    const endCalendar = endOfWeek(end)

    return eachDayOfInterval({ start: startCalendar, end: endCalendar })
  }, [currentDate])

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {}
    
    events.forEach(event => {
      const eventDate = parseISO(event.start_datetime)
      const dateKey = format(eventDate, 'yyyy-MM-dd')
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })

    return grouped
  }, [events])

  // Get events for selected date or today
  const selectedDateEvents = useMemo(() => {
    const targetDate = selectedDate || new Date()
    const dateKey = format(targetDate, 'yyyy-MM-dd')
    return eventsByDate[dateKey] || []
  }, [eventsByDate, selectedDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1))
    setSelectedDate(null)
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(isSameDay(date, selectedDate || new Date()) ? null : date)
  }

  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId)
    }
  }

  if (viewMode === 'list') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {format(currentDate, 'MMMM yyyy', { locale })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {events.length} {t('events.events_this_month')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => navigateMonth('prev')}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={() => setCurrentDate(new Date())}
              variant="outline"
              size="sm"
            >
              {t('time.today')}
            </Button>
            
            <Button
              onClick={() => navigateMonth('next')}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => setViewMode('calendar')}
              variant="outline"
              size="sm"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('events.no_events_this_month')}
            </h3>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                variant="compact"
                onRegister={onRegister}
                onClick={() => handleEventClick(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy', { locale })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {events.length} {t('events.events_this_month')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => navigateMonth('prev')}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={() => setCurrentDate(new Date())}
            variant="outline"
            size="sm"
          >
            {t('time.today')}
          </Button>
          
          <Button
            onClick={() => navigateMonth('next')}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            onClick={() => setViewMode('list')}
            variant="outline"
            size="sm"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t(`calendar.days.${day.toLowerCase()}`)}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dateKey = format(day, 'yyyy-MM-dd')
                  const dayEvents = eventsByDate[dateKey] || []
                  const isCurrentMonth = isSameMonth(day, currentDate)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isTodayDate = isToday(day)

                  return (
                    <div
                      key={index}
                      className={`
                        relative min-h-20 p-1 border border-gray-200 dark:border-gray-700 cursor-pointer
                        hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                        ${!isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                        ${isSelected ? 'ring-2 ring-blue-500' : ''}
                        ${isTodayDate ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      `}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'}
                        ${isTodayDate ? 'text-blue-600 dark:text-blue-400' : ''}
                      `}>
                        {format(day, 'd')}
                      </div>

                      {/* Event indicators */}
                      {dayEvents.length > 0 && showMiniEvents && (
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map((event, idx) => (
                            <div
                              key={idx}
                              className={`
                                h-1 rounded-full text-xs truncate
                                ${categoryColors[event.category]}
                                ${event.is_cancelled ? 'opacity-50' : ''}
                              `}
                              title={isZh && event.title_zh ? event.title_zh : event.title}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      )}

                      {dayEvents.length > 0 && !showMiniEvents && (
                        <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Event Details */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy', { locale }) : t('time.today')}
            </h3>
            
            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t('events.no_events_on_day')}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map(event => {
                  const startTime = parseISO(event.start_datetime)
                  const title = isZh && event.title_zh ? event.title_zh : event.title
                  
                  return (
                    <div
                      key={event.id}
                      className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      onClick={() => handleEventClick(event.id)}
                    >
                      <div className="flex items-start space-x-2">
                        <div className={`w-3 h-3 rounded-full mt-1 ${categoryColors[event.category]}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {format(startTime, 'h:mm a', { locale })}
                          </p>
                          {event.is_cancelled && (
                            <p className="text-xs text-red-500">{t('events.cancelled')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          {/* Legend */}
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3 text-sm">
              {t('events.categories')}
            </h4>
            <div className="space-y-2 text-xs">
              {Object.entries(categoryColors).map(([category, color]) => (
                <div key={category} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-gray-600 dark:text-gray-300">
                    {t(`events.categories.${category}`)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}