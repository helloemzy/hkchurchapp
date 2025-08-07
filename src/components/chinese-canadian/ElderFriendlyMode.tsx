'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface ElderFriendlySettings {
  textSize: number;
  highContrast: boolean;
  simplifiedInterface: boolean;
  voiceNavigation: boolean;
  largeButtons: boolean;
  reducedMotion: boolean;
}

const defaultSettings: ElderFriendlySettings = {
  textSize: 100,
  highContrast: false,
  simplifiedInterface: false,
  voiceNavigation: false,
  largeButtons: false,
  reducedMotion: false,
};

export function ElderFriendlyMode() {
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState<ElderFriendlySettings>(defaultSettings);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Apply elder-friendly styles to the document
    if (isActive) {
      document.body.style.fontSize = `${settings.textSize}%`;
      
      if (settings.highContrast) {
        document.documentElement.classList.add('elder-high-contrast');
      }
      
      if (settings.reducedMotion) {
        document.documentElement.classList.add('elder-reduced-motion');
      }

      if (settings.simplifiedInterface) {
        document.documentElement.classList.add('elder-simplified');
      }
    } else {
      // Reset styles
      document.body.style.fontSize = '';
      document.documentElement.classList.remove(
        'elder-high-contrast', 
        'elder-reduced-motion', 
        'elder-simplified'
      );
    }

    return () => {
      // Cleanup on unmount
      document.body.style.fontSize = '';
      document.documentElement.classList.remove(
        'elder-high-contrast', 
        'elder-reduced-motion', 
        'elder-simplified'
      );
    };
  }, [isActive, settings]);

  const toggleElderMode = () => {
    setIsActive(!isActive);
    if (!isActive) {
      // Auto-enable recommended settings for elders
      setSettings({
        textSize: 150,
        highContrast: true,
        simplifiedInterface: true,
        voiceNavigation: false,
        largeButtons: true,
        reducedMotion: true,
      });
    } else {
      setSettings(defaultSettings);
    }
  };

  const updateSetting = (key: keyof ElderFriendlySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const startVoiceNavigation = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      // Voice navigation logic would go here
      setTimeout(() => setIsListening(false), 3000);
    } else {
      alert('Voice navigation is not supported in this browser');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; // Chinese language
      speechSynthesis.speak(utterance);
    }
  };

  if (!isActive) {
    return (
      <div className="fixed top-20 right-4 z-40">
        <Button
          onClick={toggleElderMode}
          className="bg-elder-wisdom/90 hover:bg-elder-wisdom text-white shadow-lg"
          size="sm"
        >
          <span className="text-lg mr-2">👴</span>
          Elder Mode
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Elder Mode Control Panel */}
      <div className="fixed top-20 right-4 z-40 w-80">
        <Card className="bg-elder-wisdom/95 backdrop-blur-md border-elder-respect/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👴</span>
                <div>
                  <h3 className="font-semibold text-white">Elder Friendly Mode</h3>
                  <p className="text-xs text-elder-respect chinese-text">長者友善模式</p>
                </div>
              </div>
              <Button
                onClick={toggleElderMode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Text Size */}
              <div>
                <label className="text-sm font-medium text-white mb-2 block">
                  Text Size: {settings.textSize}%
                </label>
                <input
                  type="range"
                  min="100"
                  max="200"
                  value={settings.textSize}
                  onChange={(e) => updateSetting('textSize', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Quick Settings */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={settings.highContrast ? "primary" : "ghost"}
                  onClick={() => updateSetting('highContrast', !settings.highContrast)}
                  className="text-xs"
                >
                  High Contrast
                </Button>
                
                <Button
                  size="sm"
                  variant={settings.largeButtons ? "primary" : "ghost"}
                  onClick={() => updateSetting('largeButtons', !settings.largeButtons)}
                  className="text-xs"
                >
                  Large Buttons
                </Button>
                
                <Button
                  size="sm"
                  variant={settings.simplifiedInterface ? "primary" : "ghost"}
                  onClick={() => updateSetting('simplifiedInterface', !settings.simplifiedInterface)}
                  className="text-xs"
                >
                  Simplified UI
                </Button>
                
                <Button
                  size="sm"
                  variant={settings.reducedMotion ? "primary" : "ghost"}
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className="text-xs"
                >
                  Less Motion
                </Button>
              </div>

              {/* Voice Features */}
              <div className="border-t border-elder-respect/30 pt-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={startVoiceNavigation}
                    className={`flex-1 ${isListening ? 'bg-chinese-red' : 'bg-chinese-jade'}`}
                  >
                    {isListening ? '🎤 Listening...' : '🎤 Voice Nav'}
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => speakText('長者友善模式已啟用，歡迎使用中加教會應用程式')}
                    className="bg-chinese-gold"
                  >
                    🔊 Test Voice
                  </Button>
                </div>
              </div>

              {/* Helper Text */}
              <div className="text-xs text-elder-respect/80 bg-white/10 p-2 rounded">
                <p className="mb-1">Quick Help:</p>
                <p>• Tap any text to hear it spoken</p>
                <p className="chinese-text">• 點擊任何文字即可朗讀</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Global Elder Mode Styles */}
      <style jsx global>{`
        .elder-high-contrast {
          filter: contrast(150%) brightness(110%);
        }
        
        .elder-high-contrast * {
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
        }

        .elder-reduced-motion * {
          animation-duration: 0.01s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01s !important;
        }

        .elder-simplified .group:hover {
          transform: none !important;
        }

        ${isActive && settings.largeButtons ? `
          button {
            padding: 1rem 1.5rem !important;
            font-size: 1.25rem !important;
            min-height: 3rem !important;
          }
        ` : ''}

        ${isActive && settings.textSize > 100 ? `
          .chinese-text {
            font-size: ${settings.textSize * 1.1}% !important;
          }
        ` : ''}
      `}</style>
    </>
  );
}

export default ElderFriendlyMode;