'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'next-i18next'
import { Search, Filter, Users, Grid, List } from 'lucide-react'
import { GroupCard } from './GroupCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useDebounce } from '@/hooks/useDebounce'

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

interface GroupDirectoryProps {
  initialGroups?: SmallGroup[]
  showFilters?: boolean
  showSearch?: boolean
  showViewToggle?: boolean
  variant?: 'default' | 'compact'
  onJoin?: (groupId: string) => void
  className?: string
}

const categories = [
  'all',
  'bible_study',
  'prayer',
  'fellowship',
  'discipleship',
  'service',
  'youth',
  'seniors',
  'couples',
  'singles'
] as const

const languages = [
  'all',
  'zh-HK',
  'zh-CN',
  'en',
  'mixed'
] as const

const genderPreferences = [
  'all',
  'mixed',
  'male_only',
  'female_only'
] as const

export function GroupDirectory({
  initialGroups = [],
  showFilters = true,
  showSearch = true,
  showViewToggle = true,
  variant = 'default',
  onJoin,
  className = ''
}: GroupDirectoryProps) {
  const { t } = useTranslation('common')
  
  // State
  const [groups, setGroups] = useState<SmallGroup[]>(initialGroups)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [selectedGender, setSelectedGender] = useState<string>('all')
  const [openToJoinOnly, setOpenToJoinOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch groups
  const fetchGroups = useCallback(async (reset = false) => {
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

      if (selectedLanguage !== 'all') {
        params.append('language', selectedLanguage)
      }

      if (selectedGender !== 'all') {
        params.append('gender_preference', selectedGender)
      }

      if (openToJoinOnly) {
        params.append('open_to_join', 'true')
      }

      const response = await fetch(`/api/groups?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch groups')
      }

      const data = await response.json()
      
      if (reset) {
        setGroups(data.groups)
        setPage(0)
      } else {
        setGroups(prev => [...prev, ...data.groups])
      }
      
      setHasMore(data.groups.length === 20)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchTerm, selectedCategory, selectedLanguage, selectedGender, openToJoinOnly, page, loading])

  // Reset and fetch when filters change
  useEffect(() => {
    if (page === 0) {
      fetchGroups(true)
    } else {
      setPage(0)
    }
  }, [debouncedSearchTerm, selectedCategory, selectedLanguage, selectedGender, openToJoinOnly])

  // Load more groups
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
    }
  }

  // Load more when page changes
  useEffect(() => {
    if (page > 0) {
      fetchGroups(false)
    }
  }, [page])

  // Filter groups locally for immediate UI feedback
  const filteredGroups = groups.filter(group => {
    if (selectedCategory !== 'all' && group.category !== selectedCategory) return false
    if (selectedLanguage !== 'all' && group.language_primary !== selectedLanguage) return false
    if (selectedGender !== 'all' && group.gender_preference !== selectedGender) return false
    if (openToJoinOnly && !group.is_open_to_join) return false
    return true
  })

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => fetchGroups(true)}>
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
                placeholder={t('groups.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters and View Toggle */}
          {(showFilters || showViewToggle) && (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
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
                        {t(`groups.categories.${category}`)}
                      </option>
                    ))}
                  </select>

                  {/* Language Filter */}
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {languages.map(language => (
                      <option key={language} value={language}>
                        {t(`groups.languages.${language}`)}
                      </option>
                    ))}
                  </select>

                  {/* Gender Filter */}
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {genderPreferences.map(gender => (
                      <option key={gender} value={gender}>
                        {t(`groups.gender.${gender}`)}
                      </option>
                    ))}
                  </select>

                  {/* Open to Join Filter */}
                  <Button
                    variant={openToJoinOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOpenToJoinOnly(!openToJoinOnly)}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    {t('groups.open_to_join')}
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

      {/* Groups Grid/List */}
      {filteredGroups.length === 0 && !loading ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('groups.no_groups')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {debouncedSearchTerm || selectedCategory !== 'all' 
              ? t('groups.no_groups_filtered')
              : t('groups.no_groups_available')
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
            {filteredGroups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                variant={viewMode === 'list' ? 'list' : variant}
                onJoin={onJoin}
              />
            ))}
          </div>

          {/* Loading and Load More */}
          {loading && filteredGroups.length === 0 && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {hasMore && !loading && filteredGroups.length > 0 && (
            <div className="flex justify-center pt-6">
              <Button onClick={loadMore} variant="outline">
                {t('common.load_more')}
              </Button>
            </div>
          )}

          {loading && filteredGroups.length > 0 && (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          )}
        </>
      )}
    </div>
  )
}