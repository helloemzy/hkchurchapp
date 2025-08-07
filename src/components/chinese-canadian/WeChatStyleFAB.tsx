'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface WeChatStyleFABProps {
  onPrayerWall?: () => void;
  onOffering?: () => void;
  onFamilyConnect?: () => void;
  onCulturalCalendar?: () => void;
  onElderHelp?: () => void;
}

export function WeChatStyleFAB({ 
  onPrayerWall, 
  onOffering, 
  onFamilyConnect, 
  onCulturalCalendar, 
  onElderHelp 
}: WeChatStyleFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      icon: '🙏',
      label: 'Prayer Wall',
      labelZh: '禱告牆',
      color: 'bg-chinese-red/90',
      onClick: onPrayerWall,
    },
    {
      icon: '💝',
      label: 'Offerings',
      labelZh: '奉獻',
      color: 'bg-chinese-gold/90',
      onClick: onOffering,
    },
    {
      icon: '👨‍👩‍👧‍👦',
      label: 'Family Connect',
      labelZh: '家庭連結',
      color: 'bg-chinese-jade/90',
      onClick: onFamilyConnect,
    },
    {
      icon: '🗓️',
      label: 'Cultural Calendar',
      labelZh: '文化日曆',
      color: 'bg-festival-lantern/90',
      onClick: onCulturalCalendar,
    },
    {
      icon: '👴',
      label: 'Elder Helper',
      labelZh: '長者助手',
      color: 'bg-elder-wisdom/90',
      onClick: onElderHelp,
    },
  ];

  return (
    <div className="fixed bottom-24 right-4 z-50 sm:bottom-8">
      {/* Menu Items */}
      <div 
        className={`flex flex-col-reverse items-end space-y-reverse space-y-3 mb-3 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 group"
            style={{
              transitionDelay: `${isOpen ? index * 50 : (menuItems.length - index - 1) * 50}ms`,
            }}
          >
            {/* Label */}
            <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                {item.label}
              </p>
              <p className="text-xs text-gray-600 chinese-text">
                {item.labelZh}
              </p>
            </div>
            
            {/* Action Button */}
            <button
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={`w-12 h-12 ${item.color} hover:scale-110 active:scale-95 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:shadow-xl`}
            >
              <span className="text-lg">{item.icon}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB Button */}
      <button
        onClick={toggleMenu}
        className={`w-14 h-14 bg-gradient-accent hover:scale-110 active:scale-95 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 hover:shadow-xl ${
          isOpen ? 'rotate-45' : 'rotate-0'
        }`}
      >
        <span className="text-xl font-bold">
          {isOpen ? '✕' : '✚'}
        </span>
      </button>
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default WeChatStyleFAB;