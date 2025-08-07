'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const cardVariants = cva(
  'rounded-lg bg-white border border-gray-200 shadow-card transition-fast',
  {
    variants: {
      variant: {
        default: 'hover:shadow-md',
        interactive: 'hover:shadow-md hover:border-gray-300 cursor-pointer',
        elevated: 'shadow-lg border-gray-100',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'div' : 'div'
    
    return (
      <Comp
        className={cn(cardVariants({ variant, size, className }))}
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
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
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
    className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}
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
    className={cn('text-sm text-gray-600', className)}
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
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Specialized Card Components with clean design
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
      variant={onRead ? "interactive" : "default"}
      onClick={onRead}
      className={className}
      ref={ref}
      {...props}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900">{title}</CardTitle>
          {readTime && (
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
              {readTime}
            </span>
          )}
        </div>
        <CardDescription className="text-gray-600">{date}</CardDescription>
        {verse && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md border-l-4 border-primary-500">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              {verse}
            </p>
          </div>
        )}
      </CardHeader>
      {excerpt && (
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {excerpt}
          </p>
        </CardContent>
      )}
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
        color: 'text-purple-700 bg-purple-100', 
        icon: '🙏' 
      },
      fellowship: { 
        color: 'text-green-700 bg-green-100', 
        icon: '🤝' 
      },
      study: { 
        color: 'text-blue-700 bg-blue-100', 
        icon: '📖' 
      },
      service: { 
        color: 'text-orange-700 bg-orange-100', 
        icon: '❤️' 
      },
    }

    const config = categoryConfig[category]
    const attendancePercentage = maxAttendees ? (attendees || 0) / maxAttendees : 0
    const isNearlyFull = attendancePercentage > 0.8

    return (
      <Card
        variant={onJoin ? "interactive" : "default"}
        className={className}
        ref={ref}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  'flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full',
                  config.color
                )}>
                  <span>{config.icon}</span>
                  <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                </div>
                {attendees !== undefined && maxAttendees && (
                  <div className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full',
                    isNearlyFull ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  )}>
                    {attendees}/{maxAttendees}
                  </div>
                )}
              </div>
              <CardTitle className="text-gray-900 mb-2">{title}</CardTitle>
            </div>
            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShare()
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-fast"
                aria-label="Share event"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
            )}
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date} at {time}
            </div>
            {location && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </div>
            )}
          </div>
        </CardHeader>
        {onJoin && (
          <CardFooter>
            <button
              onClick={onJoin}
              className="w-full py-2 px-4 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-fast"
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
      variant={onView ? "interactive" : "default"}
      onClick={onView}
      className={className}
      ref={ref}
      {...props}
    >
      {imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg -m-6 mb-4">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
            {category}
          </span>
          <span className="text-xs text-gray-500">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
          </span>
        </div>
        <CardTitle className="text-gray-900">{name}</CardTitle>
        <CardDescription className="line-clamp-2 text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      {onJoin && (
        <CardFooter>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onJoin()
            }}
            className={cn(
              'w-full py-2 px-4 font-medium rounded-md transition-fast',
              isJoined
                ? 'bg-success-50 text-success-700 border border-success-200'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            )}
            disabled={isJoined}
          >
            {isJoined ? 'Already Joined' : 'Join Group'}
          </button>
        </CardFooter>
      )}
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