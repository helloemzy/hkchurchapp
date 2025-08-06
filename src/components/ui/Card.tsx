'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const cardVariants = cva(
  'rounded-xl transition-all duration-normal ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-background-card shadow-card hover:shadow-hover hover:-translate-y-1',
        devotion: 'bg-devotion-lavender rounded-2xl shadow-card hover:shadow-hover hover:-translate-y-1',
        event: 'bg-background-card border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md',
        group: 'bg-background-card shadow-card hover:shadow-hover hover:-translate-y-1 overflow-hidden',
        prayer: 'bg-prayer-gold/20 border border-warning-200 rounded-xl shadow-sm',
        scripture: 'bg-scripture-blue/20 border border-info-200 rounded-xl shadow-sm',
        gradient: 'bg-gradient-primary shadow-lg hover:shadow-xl hover:-translate-y-1',
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
      className={cn('relative overflow-hidden', className)}
      ref={ref}
      {...props}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary-700">{title}</CardTitle>
          {readTime && (
            <span className="text-xs text-gray-500 bg-white/60 px-2 py-1 rounded-full">
              {readTime}
            </span>
          )}
        </div>
        <CardDescription className="text-primary-600">{date}</CardDescription>
        {verse && (
          <div className="mt-2 p-3 bg-white/40 rounded-lg">
            <p className="text-sm font-medium text-primary-800">{verse}</p>
          </div>
        )}
      </CardHeader>
      {excerpt && (
        <CardContent>
          <p className="text-sm text-gray-700 line-clamp-3">{excerpt}</p>
        </CardContent>
      )}
      <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-accent rounded-full opacity-60" />
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
    const categoryColors = {
      worship: 'bg-primary-100 text-primary-800 border-primary-200',
      fellowship: 'bg-success-100 text-success-800 border-success-200',
      study: 'bg-warning-100 text-warning-800 border-warning-200',
      service: 'bg-info-100 text-info-800 border-info-200',
    }

    return (
      <Card
        variant="event"
        interactive={!!onJoin}
        className={cn('group', className)}
        ref={ref}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full border',
                  categoryColors[category]
                )}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
                {attendees !== undefined && maxAttendees && (
                  <span className="text-xs text-gray-500">
                    {attendees}/{maxAttendees}
                  </span>
                )}
              </div>
              <CardTitle className="group-hover:text-primary-600 transition-colors">
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