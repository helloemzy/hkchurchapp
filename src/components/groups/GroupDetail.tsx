'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { 
  Users, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Settings, 
  UserPlus, 
  Share2,
  Phone,
  Mail,
  Globe,
  Lock,
  UserCheck,
  Activity,
  Calendar
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { OptimizedImage } from '@/components/ui/OptimizedImage'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface GroupDetail {
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
  contact_method: 'whatsapp' | 'email' | 'phone' | 'app_only'
  contact_details?: string | null
  tags: string[]
  leader: {
    id: string
    full_name: string
    avatar_url?: string | null
    email?: string
  }
  memberships?: Array<{
    id: string
    user_id: string
    role: 'member' | 'co_leader' | 'leader'
    status: 'active' | 'pending' | 'inactive' | 'removed'
    joined_at: string
    user: {
      id: string
      full_name: string
      avatar_url?: string | null
    }
  }>
  recent_activities?: Array<{
    id: string
    activity_type: string
    title: string
    title_zh?: string | null
    description?: string | null
    scheduled_for?: string | null
    created_at: string
    creator: {
      id: string
      full_name: string
      avatar_url?: string | null
    }
  }>
  active_members_count: number
  pending_members_count: number
  is_full?: boolean
  spots_remaining?: number | null
}

interface GroupDetailProps {
  groupId: string
  currentUserId?: string
  userRole?: string
  onJoin?: (groupId: string) => void
  onLeave?: (groupId: string) => void
  onShare?: (groupId: string) => void
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

export function GroupDetail({ 
  groupId, 
  currentUserId, 
  userRole,
  onJoin, 
  onLeave, 
  onShare 
}: GroupDetailProps) {
  const { t, i18n } = useTranslation('common')
  const router = useRouter()
  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'activities'>('about')

  const isZh = i18n.language.startsWith('zh')

  // Fetch group details
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/groups/${groupId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Group not found')
          }
          throw new Error('Failed to fetch group')
        }

        const data = await response.json()
        setGroup(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (groupId) {
      fetchGroup()
    }
  }, [groupId])

  const userMembership = group?.memberships?.find(m => m.user_id === currentUserId)
  const isLeader = group?.leader.id === currentUserId
  const isCoLeader = userMembership?.role === 'co_leader'
  const isMember = userMembership?.status === 'active'
  const isPending = userMembership?.status === 'pending'

  const handleJoin = async () => {
    if (!group || joining) return

    if (onJoin) {
      onJoin(group.id)
      return
    }

    setJoining(true)
    try {
      const response = await fetch(`/api/groups/${group.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join group')
      }

      // Refresh group data
      const updatedResponse = await fetch(`/api/groups/${groupId}`)
      if (updatedResponse.ok) {
        const updatedGroup = await updatedResponse.json()
        setGroup(updatedGroup)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join group')
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!group) return

    if (onLeave) {
      onLeave(group.id)
      return
    }

    try {
      const response = await fetch(`/api/groups/${group.id}/join`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to leave group')
      }

      // Refresh group data
      const updatedResponse = await fetch(`/api/groups/${groupId}`)
      if (updatedResponse.ok) {
        const updatedGroup = await updatedResponse.json()
        setGroup(updatedGroup)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave group')
    }
  }

  const handleShare = () => {
    if (!group) return

    if (onShare) {
      onShare(group.id)
      return
    }

    if (navigator.share) {
      navigator.share({
        title: isZh && group.name_zh ? group.name_zh : group.name,
        text: isZh && group.description_zh ? group.description_zh : group.description,
        url: window.location.href
      })
    } else {
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

  if (error || !group) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error || t('groups.group_not_found')}
        </h3>
        <Button onClick={() => router.back()} variant="outline">
          {t('actions.back')}
        </Button>
      </div>
    )
  }

  const name = isZh && group.name_zh ? group.name_zh : group.name
  const description = isZh && group.description_zh ? group.description_zh : group.description
  const meetingLocation = isZh && group.meeting_location_zh ? group.meeting_location_zh : group.meeting_location

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative">
        {group.image_url && !imageError && (
          <div className="relative h-48 w-full overflow-hidden rounded-lg mb-6">
            <OptimizedImage
              src={group.image_url}
              alt={name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Privacy indicators */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {!group.is_public && (
                <div className="bg-black bg-opacity-50 text-white p-2 rounded-full">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              {group.is_public && (
                <div className="bg-black bg-opacity-50 text-white p-2 rounded-full">
                  <Globe className="w-4 h-4" />
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

            {/* Group name overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm text-white`}>
                  <span className="mr-1">{categoryIcons[group.category]}</span>
                  {t(`groups.categories.${group.category}`)}
                </span>
                <span className="text-white/80 text-sm">
                  {group.active_members_count} {t('groups.members')}
                </span>
              </div>
            </div>
          </div>
        )}

        {(!group.image_url || imageError) && (
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${categoryColors[group.category]}`}>
                {categoryIcons[group.category]}
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{name}</h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors[group.category]}`}>
                    {t(`groups.categories.${group.category}`)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {group.active_members_count} {t('groups.members')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-8">
          {['about', 'members', 'activities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t(`groups.tabs.${tab}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Description */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('groups.about')}
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {description}
                  </p>
                </div>
              </Card>

              {/* Meeting Details */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  {t('groups.meeting_details')}
                </h3>
                <div className="space-y-3">
                  {group.meeting_schedule && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {group.meeting_schedule}
                      </span>
                    </div>
                  )}
                  
                  {meetingLocation && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {meetingLocation}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 text-center">{languageFlags[group.language_primary]}</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t(`groups.languages.${group.language_primary}`)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 text-center">{genderIcons[group.gender_preference]}</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t(`groups.gender.${group.gender_preference}`)}
                    </span>
                  </div>

                  {group.age_range && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {t('groups.age_range')}: {group.age_range}
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Contact Information */}
              {group.contact_details && group.contact_method !== 'app_only' && (
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {t('groups.contact')}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      {group.contact_method === 'email' && <Mail className="w-5 h-5 text-gray-400" />}
                      {group.contact_method === 'phone' && <Phone className="w-5 h-5 text-gray-400" />}
                      {group.contact_method === 'whatsapp' && <MessageCircle className="w-5 h-5 text-gray-400" />}
                      <span className="text-gray-700 dark:text-gray-300">
                        {group.contact_details}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {t('groups.members')} ({group.active_members_count})
                </h3>
                {(isLeader || isCoLeader) && (
                  <Button
                    onClick={() => router.push(`/groups/${group.id}/manage`)}
                    size="sm"
                    variant="outline"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {t('groups.manage')}
                  </Button>
                )}
              </div>

              {group.memberships && group.memberships.length > 0 ? (
                <div className="space-y-3">
                  {group.memberships
                    .filter(m => m.status === 'active')
                    .map(membership => (
                      <div key={membership.id} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        {membership.user.avatar_url ? (
                          <OptimizedImage
                            src={membership.user.avatar_url}
                            alt={membership.user.full_name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                              {membership.user.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {membership.user.full_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {t(`groups.roles.${membership.role}`)}
                          </p>
                        </div>

                        {membership.role === 'leader' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded-full">
                            {t('groups.leader')}
                          </span>
                        )}
                        {membership.role === 'co_leader' && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                            {t('groups.co_leader')}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                  {t('groups.no_members')}
                </p>
              )}
            </Card>
          )}

          {activeTab === 'activities' && (
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {t('groups.recent_activities')}
              </h3>

              {group.recent_activities && group.recent_activities.length > 0 ? (
                <div className="space-y-4">
                  {group.recent_activities.map(activity => (
                    <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center space-x-2 mb-1">
                        <Activity className="w-4 h-4 text-gray-400" />
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {isZh && activity.title_zh ? activity.title_zh : activity.title}
                        </h4>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {activity.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.creator.full_name} • {new Date(activity.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                  {t('groups.no_activities')}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group Stats */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('groups.group_info')}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('groups.members')}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {group.active_members_count}
                  {group.max_members && ` / ${group.max_members}`}
                </span>
              </div>

              {group.pending_members_count > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('groups.pending')}</span>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">
                    {group.pending_members_count}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('groups.status')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  group.is_open_to_join 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}>
                  {group.is_open_to_join ? t('groups.open') : t('groups.closed')}
                </span>
              </div>

              {group.requires_approval && (
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {t('groups.approval_required')}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Leader */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t('groups.leadership')}
            </h3>
            
            <div className="flex items-center space-x-3">
              {group.leader.avatar_url ? (
                <OptimizedImage
                  src={group.leader.avatar_url}
                  alt={group.leader.full_name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                    {group.leader.full_name.charAt(0)}
                  </span>
                </div>
              )}
              
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {group.leader.full_name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('groups.group_leader')}
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          {currentUserId && (
            <Card className="p-6">
              {!isMember && !isPending && group.is_open_to_join && (
                <Button
                  onClick={handleJoin}
                  disabled={group.is_full || joining}
                  className="w-full mb-3"
                  size="lg"
                >
                  {joining ? (
                    <>
                      <LoadingSpinner className="mr-2" />
                      {t('groups.joining')}
                    </>
                  ) : group.is_full ? (
                    t('groups.full')
                  ) : group.requires_approval ? (
                    t('groups.request_to_join')
                  ) : (
                    t('groups.join')
                  )}
                </Button>
              )}

              {isPending && (
                <div className="text-center mb-3">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                    {t('groups.membership_pending')}
                  </p>
                  <Button
                    onClick={handleLeave}
                    variant="outline"
                    size="sm"
                  >
                    {t('groups.cancel_request')}
                  </Button>
                </div>
              )}

              {isMember && !isLeader && (
                <Button
                  onClick={handleLeave}
                  variant="outline"
                  className="w-full mb-3"
                >
                  {t('groups.leave_group')}
                </Button>
              )}

              {(isLeader || isCoLeader) && (
                <Button
                  onClick={() => router.push(`/groups/${group.id}/manage`)}
                  variant="outline"
                  className="w-full mb-3"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {t('groups.manage_group')}
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}