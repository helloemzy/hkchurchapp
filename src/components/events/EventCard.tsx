'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, Users, Star, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { useTranslation } from 'next-i18next'
import { format, parseISO } from 'date-fns'
import { zhHK, enUS } from 'date-fns/locale'

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

interface EventCardProps {
  event: Event
  variant?: 'default' | 'compact' | 'featured'
  showRegistration?: boolean
  onRegister?: (eventId: string) => void
  className?: string
}

const categoryColors = {
  worship: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  fellowship: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  study: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  service: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  community: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  outreach: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

const categoryIcons = {
  worship: '🙏',
  fellowship: '🤝',
  study: '📖',
  service: '💕',
  community: '👥',
  outreach: '🌟'
}

export function EventCard({ 
  event, 
  variant = 'default', 
  showRegistration = true,
  onRegister,
  className = '' 
}: EventCardProps) {
  const { t, i18n } = useTranslation('common')
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  
  const isZh = i18n.language.startsWith('zh')
  const locale = isZh ? zhHK : enUS

  const title = isZh && event.title_zh ? event.title_zh : event.title
  const description = isZh && event.description_zh ? event.description_zh : event.description
  const location = isZh && event.location_zh ? event.location_zh : event.location

  const startDate = parseISO(event.start_datetime)
  const endDate = parseISO(event.end_datetime)
  const isPast = endDate < new Date()

  const handleClick = () => {
    router.push(`/events/${event.id}`)
  }

  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRegister) {
      onRegister(event.id)
    } else {
      router.push(`/events/${event.id}/register`)
    }
  }

  if (variant === 'compact') {
    return (
      <Card 
        className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${categoryColors[event.category]}`}>
              {categoryIcons[event.category]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {title}
              </h3>
              {event.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
              {event.is_cancelled && <AlertTriangle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{format(startDate, 'MMM d', { locale })}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{format(startDate, 'HH:mm', { locale })}</span>
              </div>
              {event.requires_registration && (
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{event.current_registrations}{event.max_capacity ? `/${event.max_capacity}` : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 ${
        variant === 'featured' ? 'border-yellow-200 dark:border-yellow-800' : ''
      } ${className}`}
      onClick={handleClick}
    >
      {/* Event Image */}
      {event.image_url && !imageError && (
        <div className="relative h-48 w-full overflow-hidden">
          <OptimizedImage
            src={event.image_url}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
          {event.is_featured && (
            <div className="absolute top-2 right-2">
              <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>{t('events.featured')}</span>
              </div>
            </div>
          )}
          {event.is_cancelled && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('events.cancelled')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[event.category]}`}>
            <span className="mr-1">{categoryIcons[event.category]}</span>
            {t(`events.categories.${event.category}`)}
          </span>
          {isPast && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('events.past')}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* Event Details */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-1">
            <Calendar className="w-4 h-4" />
            <span>
              {format(startDate, 'PPP', { locale })}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-1">
            <Clock className="w-4 h-4" />
            <span>
              {format(startDate, 'HH:mm', { locale })} - {format(endDate, 'HH:mm', { locale })}
            </span>
          </div>

          {location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{location}</span>
            </div>
          )}

          {event.requires_registration && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-1">
              <Users className="w-4 h-4" />
              <span>
                {event.current_registrations} {t('events.registered')}
                {event.max_capacity && ` / ${event.max_capacity}`}
                {event.is_full && (
                  <span className="text-red-500 ml-1">({t('events.full')})</span>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Organizer */}
        <div className="flex items-center space-x-2 mb-4">
          {event.organizer.avatar_url ? (
            <OptimizedImage
              src={event.organizer.avatar_url}
              alt={event.organizer.full_name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {event.organizer.full_name.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('events.organized_by')} {event.organizer.full_name}
          </span>
        </div>

        {/* Registration Button */}
        {showRegistration && event.requires_registration && !isPast && !event.is_cancelled && (
          <Button
            onClick={handleRegister}
            disabled={event.is_full || !event.registration_open}
            className="w-full"
            variant={event.is_full ? 'outline' : 'default'}
          >
            {event.is_full
              ? t('events.full')
              : event.registration_open
              ? t('events.register')
              : t('events.registration_closed')
            }
          </Button>
        )}
      </div>
    </Card>
  )
}