'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import { Languages, Globe, Check } from 'lucide-react'

export interface Language {
  code: string
  name: string
  nativeName: string
  flag?: string
}

const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'zh',
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    flag: '🇭🇰'
  }
]

export interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'pills'
  size?: 'sm' | 'md' | 'lg'
  showFlag?: boolean
  showName?: boolean
  className?: string
  buttonClassName?: string
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  size = 'md',
  showFlag = true,
  showName = true,
  className,
  buttonClassName
}) => {
  const router = useRouter()
  const { t, i18n } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]

  const handleLanguageChange = async (languageCode: string) => {
    try {
      // Close dropdown
      setIsOpen(false)
      
      // Store language preference
      localStorage.setItem('i18nextLng', languageCode)
      
      // Navigate to the same page with new locale
      const { pathname, asPath, query } = router
      await router.push({ pathname, query }, asPath, { locale: languageCode })
      
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  const getCurrentLanguageDisplay = () => {
    const parts = []
    if (showFlag && currentLanguage.flag) {
      parts.push(currentLanguage.flag)
    }
    if (showName) {
      parts.push(currentLanguage.nativeName)
    }
    return parts.join(' ')
  }

  if (variant === 'toggle') {
    const otherLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code !== i18n.language)
    
    return (
      <Button
        variant="ghost"
        size={size}
        onClick={() => otherLanguage && handleLanguageChange(otherLanguage.code)}
        className={cn('gap-2', buttonClassName)}
        leftIcon={<Languages className="h-4 w-4" />}
        aria-label={t('language.switchTo', { language: otherLanguage?.nativeName })}
      >
        {showFlag && otherLanguage?.flag}
        {showName && otherLanguage?.nativeName}
      </Button>
    )
  }

  if (variant === 'pills') {
    return (
      <div className={cn('flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1', className)}>
        {SUPPORTED_LANGUAGES.map((language) => {
          const isActive = language.code === i18n.language
          
          return (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                isActive 
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
              aria-label={t('language.switchTo', { language: language.nativeName })}
            >
              {showFlag && language.flag && (
                <span className="mr-2">{language.flag}</span>
              )}
              {showName && language.nativeName}
              {isActive && !showName && (
                <Check className="h-4 w-4 ml-1" />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  // Dropdown variant (default)
  return (
    <div className={cn('relative', className)}>
      <Button
        variant="ghost"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        className={cn('gap-2', buttonClassName)}
        leftIcon={<Globe className="h-4 w-4" />}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('language.current', { language: currentLanguage.nativeName })}
      >
        {getCurrentLanguageDisplay()}
        <svg
          className={cn('h-4 w-4 transition-transform duration-200', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((language) => {
                const isActive = language.code === i18n.language
                
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200',
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                      'focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700',
                      isActive && 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                    )}
                    role="menuitem"
                    aria-label={t('language.switchTo', { language: language.nativeName })}
                  >
                    {showFlag && language.flag && (
                      <span className="text-lg">{language.flag}</span>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{language.nativeName}</div>
                      {language.name !== language.nativeName && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {language.name}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Hook for language detection and management
export function useLanguage() {
  const { i18n } = useTranslation()
  const router = useRouter()

  const changeLanguage = async (languageCode: string) => {
    try {
      localStorage.setItem('i18nextLng', languageCode)
      
      const { pathname, asPath, query } = router
      await router.push({ pathname, query }, asPath, { locale: languageCode })
      
      return true
    } catch (error) {
      console.error('Failed to change language:', error)
      return false
    }
  }

  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]
  }

  const getSupportedLanguages = () => {
    return SUPPORTED_LANGUAGES
  }

  const detectBrowserLanguage = () => {
    if (typeof window === 'undefined') return 'en'
    
    const browserLang = navigator.language.toLowerCase()
    
    // Check for exact matches first
    if (browserLang === 'zh-hk' || browserLang === 'zh-tw' || browserLang.startsWith('zh-')) {
      return 'zh'
    }
    
    // Default to English for other languages
    return 'en'
  }

  const isRTL = () => {
    // None of our supported languages are RTL, but this could be extended
    return false
  }

  return {
    currentLanguage: getCurrentLanguage(),
    supportedLanguages: getSupportedLanguages(),
    changeLanguage,
    detectBrowserLanguage,
    isRTL,
  }
}

// Compact language toggle for mobile
export const MobileLanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage()
  
  const otherLanguage = supportedLanguages.find(lang => lang.code !== currentLanguage.code)
  
  return (
    <button
      onClick={() => otherLanguage && changeLanguage(otherLanguage.code)}
      className={cn(
        'flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400',
        'hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-200',
        className
      )}
      aria-label={`Switch to ${otherLanguage?.nativeName}`}
    >
      <Languages className="h-4 w-4" />
      <span>{otherLanguage?.flag}</span>
    </button>
  )
}

export default LanguageSwitcher