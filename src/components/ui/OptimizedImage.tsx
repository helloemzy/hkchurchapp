'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  loadingClassName?: string;
  errorClassName?: string;
  onLoadComplete?: () => void;
  onError?: (error: Event) => void;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  loadingClassName = 'animate-pulse bg-gray-200',
  errorClassName = 'bg-gray-100',
  onLoadComplete,
  onError,
  lazy = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState(src);

  useEffect(() => {
    setImageSrc(src);
    setImageState('loading');
  }, [src]);

  const handleLoad = () => {
    setImageState('loaded');
    onLoadComplete?.();
  };

  const handleError = (error: any) => {
    console.warn(`Failed to load image: ${imageSrc}`);
    setImageState('error');
    
    // Try fallback image if available and not already using it
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setImageState('loading');
    }
    
    onError?.(error);
  };

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      className={cn(
        className,
        imageState === 'loading' && loadingClassName,
        imageState === 'error' && errorClassName
      )}
      onLoad={handleLoad}
      onError={handleError}
      loading={lazy ? 'lazy' : 'eager'}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      // Performance optimizations
      priority={!lazy}
      quality={85}
      formats={['image/avif', 'image/webp']}
    />
  );
}

// Avatar-specific optimized image component
interface OptimizedAvatarProps extends OptimizedImageProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function OptimizedAvatar({
  size = 'md',
  className,
  alt,
  ...props
}: OptimizedAvatarProps) {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const dimensions = {
    xs: { width: 24, height: 24 },
    sm: { width: 32, height: 32 },
    md: { width: 40, height: 40 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 },
  };

  return (
    <OptimizedImage
      {...props}
      {...dimensions[size]}
      alt={alt || 'Avatar'}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      fallbackSrc="/images/default-avatar.svg"
    />
  );
}

// Church/religious content optimized image
interface OptimizedContentImageProps extends OptimizedImageProps {
  contentType?: 'devotional' | 'verse' | 'prayer' | 'general';
}

export function OptimizedContentImage({
  contentType = 'general',
  alt,
  className,
  ...props
}: OptimizedContentImageProps) {
  const contentFallbacks = {
    devotional: '/images/devotional-placeholder.svg',
    verse: '/images/verse-placeholder.svg',
    prayer: '/images/prayer-placeholder.svg',
    general: '/images/content-placeholder.svg',
  };

  return (
    <OptimizedImage
      {...props}
      alt={alt}
      className={cn('rounded-lg object-cover', className)}
      fallbackSrc={contentFallbacks[contentType]}
      // Religious content should be treated with care - load immediately
      lazy={false}
      priority={true}
    />
  );
}

// Hero/banner optimized image
export function OptimizedHeroImage({
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      {...props}
      alt={alt || 'Hero image'}
      className={cn('w-full object-cover', className)}
      // Hero images should load immediately
      lazy={false}
      priority={true}
      // Higher quality for hero images
      quality={90}
    />
  );
}