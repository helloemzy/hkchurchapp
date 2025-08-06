'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Star, 
  AlertTriangle, 
  Share2, 
  ExternalLink,
  Phone,
  Mail,
  Tag,
  Info
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { zhHK, enUS } from 'date-fns/locale'

interface EventDetailProps {
  eventId: string
  onRegister?: (eventId: string) => void
  onShare?: (eventId: string) => void
}

interface EventDetail {
  id: string
  title: string
  title_zh?: string | null
  description: string
  description_zh?: string | null
  category: 'worship' | 'fellowship' | 'study' | 'service' | 'community' | 'outreach'
  start_datetime: string
  end_datetime: string
  timezone: string
  location?: string | null
  location_zh?: string | null
  location_address?: string | null
  image_url?: string | null
  current_registrations: number
  max_capacity?: number | null
  requires_registration: boolean
  registration_deadline?: string | null
  is_featured: boolean
  is_cancelled: boolean
  cancellation_reason?: string | null
  cost?: number | null
  cost_currency: string
  contact_email?: string | null
  contact_phone?: string | null
  tags: string[]
  organizer: {
    id: string
    full_name: string
    avatar_url?: string | null
    email?: string
  }
  registrations?: Array<{
    id: string
    user_id: string
    status: string
    registered_at: string
    user: {
      id: string
      full_name: string
      avatar_url?: string | null
    }
  }>
  is_full?: boolean
  spots_remaining?: number | null
  registration_open?: boolean
  is_past?: boolean
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

export function EventDetail({ eventId, onRegister, onShare }: EventDetailProps) {
  const { t, i18n } = useTranslation('common')
  const router = useRouter()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [imageError, setImageError] = useState(false)

  const isZh = i18n.language.startsWith('zh')
  const locale = isZh ? zhHK : enUS

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/events/${eventId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Event not found')
          }
          throw new Error('Failed to fetch event')
        }

        const data = await response.json()
        setEvent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const handleRegister = async () => {
    if (!event || registering) return

    if (onRegister) {
      onRegister(event.id)
      return
    }

    setRegistering(true)
    try {
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      // Refresh event data
      const updatedResponse = await fetch(`/api/events/${eventId}`)
      if (updatedResponse.ok) {
        const updatedEvent = await updatedResponse.json()
        setEvent(updatedEvent)
      }

      // Show success message or redirect
      router.push(`/events/${event.id}/registered`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  const handleShare = () => {
    if (!event) return

    if (onShare) {
      onShare(event.id)
      return
    }

    if (navigator.share) {
      navigator.share({
        title: isZh && event.title_zh ? event.title_zh : event.title,
        text: isZh && event.description_zh ? event.description_zh : event.description,
        url: window.location.href
      })
    } else {
      // Fallback to copying URL
      navigator.clipboard?.writeText(window.location.href)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error || t('events.event_not_found')}
        </h3>
        <Button onClick={() => router.back()} variant="outline">
          {t('actions.back')}
        </Button>
      </div>
    )
  }

  const title = isZh && event.title_zh ? event.title_zh : event.title
  const description = isZh && event.description_zh ? event.description_zh : event.description
  const location = isZh && event.location_zh ? event.location_zh : event.location

  const startDate = parseISO(event.start_datetime)
  const endDate = parseISO(event.end_datetime)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Image */}
      {event.image_url && !imageError && (
        <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-lg">
          <OptimizedImage
            src={event.image_url}
            alt={title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
          
          {/* Overlay badges */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            {event.is_featured && (
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{t('events.featured')}</span>
              </div>
            )}
            {event.is_cancelled && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>{t('events.cancelled')}</span>
              </div>
            )}
          </div>

          {/* Share button */}
          <div className="absolute top-4 left-4">
            <Button
              onClick={handleShare}
              size="sm"
              variant="outline"
              className="bg-white/80 backdrop-blur-sm"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Category */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors[event.category]}`}>
                <span className="mr-1">{categoryIcons[event.category]}</span>
                {t(`events.categories.${event.category}`)}
              </span>
              {event.is_past && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('events.past')}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h1>

            {/* Organizer */}
            <div className="flex items-center space-x-3">
              {event.organizer.avatar_url ? (
                <OptimizedImage
                  src={event.organizer.avatar_url}
                  alt={event.organizer.full_name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {event.organizer.full_name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('events.organized_by')} <span className="font-medium">{event.organizer.full_name}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              {t('events.about')}
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {description}
              </p>
            </div>
          </Card>

          {/* Cancellation Notice */}
          {event.is_cancelled && event.cancellation_reason && (
            <Card className="p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">
                    {t('events.cancelled')}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {event.cancellation_reason}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Tags */}
          {event.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                {t('events.tags')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              {t('events.details')}
            </h3>
            
            <div className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(startDate, 'EEEE, MMMM d, yyyy', { locale })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {format(startDate, 'h:mm a', { locale })} - {format(endDate, 'h:mm a', { locale })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {event.timezone}
                  </p>
                </div>
              </div>

              {/* Location */}
              {location && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {location}
                    </p>
                    {event.location_address && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {event.location_address}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Cost */}
              {event.cost !== null && (
                <div className="flex items-center space-x-3">
                  <span className="w-5 h-5 text-gray-400">💰</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.cost === 0 
                        ? t('events.free')
                        : `${event.cost_currency} $${event.cost}`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Registration Info */}
              {event.requires_registration && (
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.current_registrations} {t('events.registered')}
                      {event.max_capacity && ` / ${event.max_capacity}`}
                    </p>
                    {event.max_capacity && event.spots_remaining !== null && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {event.spots_remaining} {t('events.spots_remaining')}
                      </p>
                    )}
                    {event.registration_deadline && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('events.registration_deadline')}: {format(parseISO(event.registration_deadline), 'PPp', { locale })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Contact Information */}
          {(event.contact_email || event.contact_phone) && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t('events.contact')}
              </h3>
              <div className="space-y-3">
                {event.contact_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${event.contact_email}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {event.contact_email}
                    </a>
                  </div>
                )}
                {event.contact_phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a
                      href={`tel:${event.contact_phone}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {event.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Registration Button */}
          {event.requires_registration && !event.is_past && !event.is_cancelled && (
            <Card className="p-6">
              <Button
                onClick={handleRegister}
                disabled={event.is_full || !event.registration_open || registering}
                className="w-full"
                size="lg"
              >
                {registering ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    {t('events.registering')}
                  </>
                ) : event.is_full ? (
                  t('events.full')
                ) : !event.registration_open ? (
                  t('events.registration_closed')
                ) : (
                  t('events.register')
                )}
              </Button>
              
              {event.requires_registration && event.registration_open && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {t('events.registration_note')}
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}