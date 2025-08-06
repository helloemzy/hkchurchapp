'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const cardVariants = cva(
  'rounded-xl transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-900 shadow-card hover:shadow-hover hover:-translate-y-1 border border-gray-100 dark:border-gray-800',
        devotion: 'bg-gradient-devotion rounded-2xl shadow-card hover:shadow-hover hover:-translate-y-2 border border-devotion-dawn/30',
        worship: 'bg-gradient-worship rounded-xl shadow-card hover:shadow-hover hover:-translate-y-2 border border-worship-rose/30',
        event: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md hover:-translate-y-1',
        group: 'bg-white dark:bg-gray-900 shadow-card hover:shadow-hover hover:-translate-y-1 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800',
        prayer: 'bg-gradient-prayer border border-prayer-gold/40 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1',
        scripture: 'bg-gradient-scripture border border-scripture-sage/40 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1',
        gradient: 'bg-gradient-primary shadow-lg hover:shadow-xl hover:-translate-y-2',
        elevated: 'bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 rounded-2xl',
        hero: 'bg-gradient-hero shadow-xl rounded-3xl border border-primary-200/30 hover:-translate-y-1',
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
      <CardHeader>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
            <CardTitle className="text-primary-700 dark:text-primary-300 group-hover:text-primary-600 transition-colors">
              {title}
            </CardTitle>
          </div>
          {readTime && (
            <span className="text-xs text-primary-600 dark:text-primary-400 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded-full backdrop-blur-sm">
              {readTime}
            </span>
          )}
        </div>
        <CardDescription className="text-primary-600 dark:text-primary-400 font-medium">
          {date}
        </CardDescription>
        {verse && (
          <div className="mt-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/40 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <div className="text-primary-500 text-xl mt-1">"</div>
              <p className="text-sm font-medium text-primary-800 dark:text-primary-200 italic leading-relaxed">
                {verse}
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      {excerpt && (
        <CardContent>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </CardContent>
      )}
      {/* Decorative gradient orb */}
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-accent rounded-full opacity-20 group-hover:opacity-30 transition-opacity" />
      {/* Progress indicator */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
        <div className="w-1 h-1 bg-primary-300 rounded-full"></div>
        <div className="w-1 h-1 bg-primary-200 rounded-full"></div>
      </div>
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
        bg: 'bg-primary-100 dark:bg-primary-900/30', 
        text: 'text-primary-800 dark:text-primary-200', 
        border: 'border-primary-200 dark:border-primary-700',
        icon: '🙏'
      },
      fellowship: { 
        bg: 'bg-success-100 dark:bg-success-900/30', 
        text: 'text-success-800 dark:text-success-200', 
        border: 'border-success-200 dark:border-success-700',
        icon: '🤝'
      },
      study: { 
        bg: 'bg-warning-100 dark:bg-warning-900/30', 
        text: 'text-warning-800 dark:text-warning-200', 
        border: 'border-warning-200 dark:border-warning-700',
        icon: '📖'
      },
      service: { 
        bg: 'bg-info-100 dark:bg-info-900/30', 
        text: 'text-info-800 dark:text-info-200', 
        border: 'border-info-200 dark:border-info-700',
        icon: '❤️'
      },
    }

    const config = categoryConfig[category]
    const attendancePercentage = maxAttendees ? (attendees || 0) / maxAttendees : 0
    const isNearlyFull = attendancePercentage > 0.8

    return (
      <Card
        variant="event"
        interactive={!!onJoin}
        className={cn('group relative', className)}
        ref={ref}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border backdrop-blur-sm',
                  config.bg,
                  config.text,
                  config.border
                )}>
                  <span>{config.icon}</span>
                  <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
                {attendees !== undefined && maxAttendees && (
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      isNearlyFull ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-gray-600'
                    )}>
                      {attendees}/{maxAttendees}
                    </div>
                    {/* Visual attendance indicator */}
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full transition-all duration-500',
                          isNearlyFull ? 'bg-warning-400' : 'bg-success-400'
                        )}
                        style={{ width: `${Math.min(attendancePercentage * 100, 100)}%` }}
                      />
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
          <CardFooter>
            <button
              onClick={onJoin}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Join Event
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