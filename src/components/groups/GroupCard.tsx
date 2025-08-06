'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, MapPin, Clock, MessageCircle, Lock, Globe, UserCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { useTranslation } from 'next-i18next'

interface SmallGroup {
  id: string
  name: string
  name_zh?: string | null
  description: string
  description_zh?: string | null
  category: 'bible_study' | 'prayer' | 'fellowship' | 'discipleship' | 'service' | 'youth' | 'seniors' | 'couples' | 'singles'
  max_members?: number | null
  current_members: number
  is_open_to_join: boolean
  requires_approval: boolean
  is_public: boolean
  image_url?: string | null
  meeting_schedule?: string | null
  meeting_location?: string | null
  meeting_location_zh?: string | null
  age_range?: string | null
  gender_preference: 'mixed' | 'male_only' | 'female_only'
  language_primary: 'zh-HK' | 'zh-CN' | 'en' | 'mixed'
  leader: {
    id: string
    full_name: string
    avatar_url?: string | null
  }
  active_members?: number
  is_full?: boolean
  spots_remaining?: number | null
}

interface GroupCardProps {
  group: SmallGroup
  variant?: 'default' | 'compact' | 'list'
  showJoinButton?: boolean
  onJoin?: (groupId: string) => void
  className?: string
}

const categoryColors = {
  bible_study: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  prayer: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  fellowship: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  discipleship: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  service: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  youth: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  seniors: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  couples: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  singles: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
}

const categoryIcons = {
  bible_study: '📖',
  prayer: '🙏',
  fellowship: '🤝',
  discipleship: '🌱',
  service: '💕',
  youth: '🎯',
  seniors: '🌿',
  couples: '💑',
  singles: '🙋'
}

const genderIcons = {
  mixed: '👥',
  male_only: '👨',
  female_only: '👩'
}

const languageFlags = {
  'zh-HK': '🇭🇰',
  'zh-CN': '🇨🇳',
  'en': '🇺🇸',
  'mixed': '🌍'
}

export function GroupCard({ 
  group, 
  variant = 'default', 
  showJoinButton = true,
  onJoin,
  className = '' 
}: GroupCardProps) {
  const { t, i18n } = useTranslation('common')
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  
  const isZh = i18n.language.startsWith('zh')

  const name = isZh && group.name_zh ? group.name_zh : group.name
  const description = isZh && group.description_zh ? group.description_zh : group.description
  const meetingLocation = isZh && group.meeting_location_zh ? group.meeting_location_zh : group.meeting_location

  const handleClick = () => {
    router.push(`/groups/${group.id}`)
  }

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onJoin) {
      onJoin(group.id)
    } else {
      router.push(`/groups/${group.id}/join`)
    }
  }

  if (variant === 'compact') {
    return (
      <Card 
        className={`p-3 cursor-pointer hover:shadow-md transition-shadow ${className}`}
        onClick={handleClick}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${categoryColors[group.category]}`}>
              {categoryIcons[group.category]}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {name}
              </h3>
              {!group.is_public && <Lock className="w-3 h-3 text-gray-500" />}
            </div>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 space-x-3">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{group.current_members}{group.max_members ? `/${group.max_members}` : ''}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>{genderIcons[group.gender_preference]}</span>
                <span>{languageFlags[group.language_primary]}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (variant === 'list') {
    return (
      <Card 
        className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
        onClick={handleClick}
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {group.image_url && !imageError ? (
              <OptimizedImage
                src={group.image_url}
                alt={name}
                width={60}
                height={60}
                className="rounded-lg object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={`w-15 h-15 rounded-lg flex items-center justify-center text-2xl ${categoryColors[group.category]}`}>
                {categoryIcons[group.category]}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {name}
              </h3>
              {!group.is_public && <Lock className="w-4 h-4 text-gray-500" />}
              {!group.is_open_to_join && <UserCheck className="w-4 h-4 text-orange-500" />}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-1">
              {description}
            </p>
            
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>
                  {group.current_members} {t('groups.members')}
                  {group.max_members && ` (${group.spots_remaining} ${t('groups.spots_remaining')})`}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span>{genderIcons[group.gender_preference]}</span>
                <span>{languageFlags[group.language_primary]}</span>
              </div>
            </div>
          </div>
          
          {showJoinButton && group.is_open_to_join && (
            <div className="flex-shrink-0">
              <Button
                onClick={handleJoin}
                size="sm"
                disabled={group.is_full}
                variant="outline"
              >
                {group.is_full ? t('groups.full') : t('groups.join')}
              </Button>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className={`overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 ${className}`}
      onClick={handleClick}
    >
      {/* Group Image */}
      {group.image_url && !imageError && (
        <div className="relative h-40 w-full overflow-hidden">
          <OptimizedImage
            src={group.image_url}
            alt={name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute top-2 right-2 flex space-x-1">
            {!group.is_public && (
              <div className="bg-black bg-opacity-50 text-white p-1 rounded-full">
                <Lock className="w-3 h-3" />
              </div>
            )}
            {group.is_public && (
              <div className="bg-black bg-opacity-50 text-white p-1 rounded-full">
                <Globe className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[group.category]}`}>
            <span className="mr-1">{categoryIcons[group.category]}</span>
            {t(`groups.categories.${group.category}`)}
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>{languageFlags[group.language_primary]}</span>
            <span>{genderIcons[group.gender_preference]}</span>
          </div>
        </div>

        {/* Group Name */}
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
          {description}
        </p>

        {/* Group Details */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-1">
            <Users className="w-4 h-4" />
            <span>
              {group.current_members} {t('groups.members')}
              {group.max_members && ` / ${group.max_members}`}
              {group.is_full && (
                <span className="text-red-500 ml-1">({t('groups.full')})</span>
              )}
            </span>
          </div>

          {group.meeting_schedule && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-1">
              <Clock className="w-4 h-4" />
              <span className="truncate">{group.meeting_schedule}</span>
            </div>
          )}

          {meetingLocation && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{meetingLocation}</span>
            </div>
          )}

          {group.age_range && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 space-x-1">
              <span className="font-medium">{t('groups.age_range')}:</span>
              <span>{group.age_range}</span>
            </div>
          )}
        </div>

        {/* Leader */}
        <div className="flex items-center space-x-2 mb-4">
          {group.leader.avatar_url ? (
            <OptimizedImage
              src={group.leader.avatar_url}
              alt={group.leader.full_name}
              width={24}
              height={24}
              className="rounded-full"
            />
          ) : (
            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {group.leader.full_name.charAt(0)}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t('groups.led_by')} {group.leader.full_name}
          </span>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-2 mb-4 text-xs">
          {group.requires_approval && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <UserCheck className="w-3 h-3 mr-1" />
              {t('groups.approval_required')}
            </span>
          )}
          {!group.is_open_to_join && (
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              {t('groups.closed')}
            </span>
          )}
        </div>

        {/* Join Button */}
        {showJoinButton && group.is_open_to_join && (
          <Button
            onClick={handleJoin}
            disabled={group.is_full}
            className="w-full"
            variant={group.is_full ? 'outline' : 'default'}
          >
            {group.is_full
              ? t('groups.full')
              : group.requires_approval
              ? t('groups.request_to_join')
              : t('groups.join')
            }
          </Button>
        )}
      </div>
    </Card>
  )
}