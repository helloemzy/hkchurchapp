'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const cardVariants = cva(
  'rounded-xl transition-all duration-300 ease-out relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-900 shadow-card hover:shadow-hover hover:-translate-y-2 hover:scale-[1.02] border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-sm',
        devotion: 'bg-gradient-devotion rounded-2xl shadow-card hover:shadow-hover hover:-translate-y-3 hover:scale-[1.02] border border-devotion-dawn/30 shimmer-effect',
        worship: 'bg-gradient-worship rounded-xl shadow-card hover:shadow-hover hover:-translate-y-3 hover:scale-[1.02] border border-worship-rose/30 shimmer-effect',
        event: 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:shadow-lg hover:-translate-y-2 hover:scale-[1.01] backdrop-blur-md',
        group: 'bg-white/90 dark:bg-gray-900/90 shadow-card hover:shadow-hover hover:-translate-y-2 hover:scale-[1.01] overflow-hidden rounded-xl border border-gray-100/50 dark:border-gray-800/50 backdrop-blur-sm',
        prayer: 'bg-gradient-prayer border border-prayer-gold/40 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-2 hover:scale-[1.01] shimmer-effect',
        scripture: 'bg-gradient-scripture border border-scripture-sage/40 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-2 hover:scale-[1.01] shimmer-effect',
        gradient: 'bg-gradient-primary shadow-lg hover:shadow-xl hover:-translate-y-3 hover:scale-[1.02] shimmer-effect',
        elevated: 'bg-white/95 dark:bg-gray-800/95 shadow-xl border border-gray-100/50 dark:border-gray-700/50 rounded-2xl hover:-translate-y-2 hover:shadow-2xl backdrop-blur-md',
        hero: 'bg-gradient-hero shadow-xl rounded-3xl border border-primary-200/30 hover:-translate-y-2 hover:scale-[1.01] shimmer-effect',
        // New vibrant variants inspired by references
        vibrant: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg hover:shadow-xl hover:-translate-y-3 hover:scale-[1.02] border-none shimmer-effect',
        cultural: 'bg-gradient-chinese-celebration text-white shadow-lg hover:shadow-xl hover:-translate-y-3 hover:scale-[1.02] border-none relative overflow-hidden',
        jade: 'bg-gradient-jade-prosperity text-white shadow-lg hover:shadow-xl hover:-translate-y-3 hover:scale-[1.02] border-none shimmer-effect',
        festival: 'bg-gradient-festival-joy text-white shadow-lg hover:shadow-xl hover:-translate-y-3 hover:scale-[1.02] border-none relative overflow-hidden',
        organic: 'bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-4 hover:scale-[1.03] border-none animate-pulse-slow',
      },
      size: {
        sm: 'p-4',
        md: 'p-5',
        lg: 'p-6',
        xl: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer select-none',
        false: '',
      },
      bordered: {
        true: 'border border-gray-200 dark:border-gray-700',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
      bordered: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, bordered, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'div' : 'div'
    
    return (
      <Comp
        className={cn(cardVariants({ variant, size, interactive, bordered, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }
>(({ className, as: Comp = 'h3', ...props }, ref) => (
  <Comp
    ref={ref}
    className={cn('font-display text-h4 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-gray-600 dark:text-gray-400', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Specialized Card Components
export interface DevotionCardProps extends Omit<CardProps, 'variant'> {
  title: string
  date: string
  verse?: string
  excerpt?: string
  readTime?: string
  onRead?: () => void
}

const DevotionCard = React.forwardRef<HTMLDivElement, DevotionCardProps>(
  ({ title, date, verse, excerpt, readTime, onRead, className, ...props }, ref) => (
    <Card
      variant="devotion"
      interactive={!!onRead}
      onClick={onRead}
      className={cn('relative overflow-hidden group', className)}
      ref={ref}
      {...props}
    >
      {/* Floating gradient orbs inspired by reference 51438 */}
      <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 rounded-full opacity-20 group-hover:opacity-40 transition-all duration-500 animate-bounce" 
           style={{ animationDuration: '6s' }} />
      <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-15 group-hover:opacity-30 transition-all duration-700 animate-pulse" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-30"></div>
            </div>
            <CardTitle className="text-purple-800 dark:text-purple-200 group-hover:text-purple-600 transition-colors font-bold text-lg">
              {title}
            </CardTitle>
          </div>
          {readTime && (
            <span className="text-xs font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all">
              {readTime}
            </span>
          )}
        </div>
        <CardDescription className="text-purple-600 dark:text-purple-300 font-semibold text-sm">
          {date}
        </CardDescription>
        {verse && (
          <div className="mt-5 p-5 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-white/60 backdrop-blur-md shadow-inner relative overflow-hidden">
            {/* Scripture decoration */}
            <div className="absolute top-2 right-2 w-8 h-8 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-20"></div>
            <div className="flex items-start gap-3">
              <div className="text-purple-500 text-3xl font-bold leading-none">"</div>
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200 italic leading-relaxed flex-1">
                {verse}
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      {excerpt && (
        <CardContent className="relative z-10">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </CardContent>
      )}
      
      {/* Enhanced progress indicator inspired by reference 120690 */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full opacity-70"></div>
          <div className="w-2 h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full opacity-50"></div>
        </div>
        <span className="text-xs text-purple-600 font-medium">Continue</span>
      </div>
      
      {/* Shimmer effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
    </Card>
  )
)
DevotionCard.displayName = 'DevotionCard'

export interface EventCardProps extends Omit<CardProps, 'variant'> {
  title: string
  date: string
  time: string
  location?: string
  category: 'worship' | 'fellowship' | 'study' | 'service'
  attendees?: number
  maxAttendees?: number
  onJoin?: () => void
  onShare?: () => void
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  ({ title, date, time, location, category, attendees, maxAttendees, onJoin, onShare, className, ...props }, ref) => {
    const categoryConfig = {
      worship: { 
        bg: 'bg-gradient-to-r from-purple-500 to-violet-600', 
        text: 'text-white font-semibold', 
        border: 'border-purple-300/50',
        icon: '🙏',
        cardBg: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
        shadow: 'shadow-purple'
      },
      fellowship: { 
        bg: 'bg-gradient-to-r from-emerald-500 to-green-600', 
        text: 'text-white font-semibold', 
        border: 'border-emerald-300/50',
        icon: '🤝',
        cardBg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100',
        shadow: 'shadow-green'
      },
      study: { 
        bg: 'bg-gradient-to-r from-orange-500 to-amber-600', 
        text: 'text-white font-semibold', 
        border: 'border-orange-300/50',
        icon: '📖',
        cardBg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100',
        shadow: 'shadow-orange'
      },
      service: { 
        bg: 'bg-gradient-to-r from-blue-500 to-indigo-600', 
        text: 'text-white font-semibold', 
        border: 'border-blue-300/50',
        icon: '❤️',
        cardBg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
        shadow: 'shadow-blue'
      },
    }

    const config = categoryConfig[category]
    const attendancePercentage = maxAttendees ? (attendees || 0) / maxAttendees : 0
    const isNearlyFull = attendancePercentage > 0.8

    return (
      <Card
        variant="event"
        interactive={!!onJoin}
        className={cn('group relative overflow-hidden', config.cardBg, className)}
        style={{ 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.1)', 
        }}
        ref={ref}
        {...props}
      >
        {/* Vibrant background decoration inspired by reference 29377 */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className={cn(
            'w-full h-full rounded-full transform translate-x-8 -translate-y-8',
            config.bg
          )}></div>
        </div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-2xl border-none shadow-lg backdrop-blur-sm transform group-hover:scale-105 transition-all',
                  config.bg,
                  config.text
                )}>
                  <span className="text-lg">{config.icon}</span>
                  <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
                {attendees !== undefined && maxAttendees && (
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-full shadow-md backdrop-blur-sm',
                      isNearlyFull ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white' : 'bg-white/90 text-gray-700'
                    )}>
                      {attendees}/{maxAttendees}
                    </div>
                    {/* Enhanced visual attendance indicator */}
                    <div className="flex flex-col gap-1">
                      <div className="w-20 h-2 bg-white/50 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={cn(
                            'h-full transition-all duration-700 rounded-full',
                            isNearlyFull 
                              ? 'bg-gradient-to-r from-red-400 to-pink-500' 
                              : 'bg-gradient-to-r from-green-400 to-emerald-500'
                          )}
                          style={{ width: `${Math.min(attendancePercentage * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        {Math.round(attendancePercentage * 100)}% full
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <CardTitle className="group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {title}
              </CardTitle>
            </div>
            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShare()
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Share event"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            )}
          </div>
          <div className="space-y-1">
            <CardDescription className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date} at {time}
            </CardDescription>
            {location && (
              <CardDescription className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        {onJoin && (
          <CardFooter className="pt-4">
            <button
              onClick={onJoin}
              className={cn(
                'w-full py-3 px-6 rounded-2xl font-bold text-white shadow-lg transform hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden',
                config.bg,
                'hover:shadow-xl active:scale-[0.98]'
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span>Join Event</span>
                <span className="text-lg">✨</span>
              </span>
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
            </button>
          </CardFooter>
        )}
      </Card>
    )
  }
)
EventCard.displayName = 'EventCard'

export interface GroupCardProps extends Omit<CardProps, 'variant'> {
  name: string
  description: string
  memberCount: number
  category: string
  imageUrl?: string
  isJoined?: boolean
  onJoin?: () => void
  onView?: () => void
}

const GroupCard = React.forwardRef<HTMLDivElement, GroupCardProps>(
  ({ name, description, memberCount, category, imageUrl, isJoined, onJoin, onView, className, ...props }, ref) => (
    <Card
      variant="group"
      interactive={!!onView}
      onClick={onView}
      className={cn('group', className)}
      ref={ref}
      {...props}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-primary-600 bg-primary-100 px-2 py-1 rounded-full">
              {category}
            </span>
            <span className="text-xs text-gray-500">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          <CardTitle className="group-hover:text-primary-600 transition-colors">
            {name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {description}
          </CardDescription>
        </CardHeader>
        {onJoin && (
          <CardFooter className="mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onJoin()
              }}
              className={cn(
                'w-full py-2 px-4 rounded-lg font-medium transition-colors',
                isJoined
                  ? 'bg-success-100 text-success-700 border border-success-200'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              )}
              disabled={isJoined}
            >
              {isJoined ? 'Already Joined' : 'Join Group'}
            </button>
          </CardFooter>
        )}
      </div>
    </Card>
  )
)
GroupCard.displayName = 'GroupCard'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
  DevotionCard,
  EventCard,
  GroupCard,
}