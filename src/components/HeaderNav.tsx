import React from 'react';
import { UserProfile, DialectCode, CEFRLevel } from '../types/dialect';
import { DIALECTS } from '../lib/dialectsData';
import { Flame, Award, Globe, Moon, Sun, Settings, Cpu, ArrowRight, ArrowLeft } from 'lucide-react';

interface HeaderNavProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenSettings: () => void;
  aiHealthStatus: { localAiStatus: string; geminiBackend: string };
  onBackPress?: () => void;
  showBack?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  profile,
  onUpdateProfile,
  onOpenSettings,
  aiHealthStatus,
  onBackPress,
  showBack = false,
}) => {
  const currentDialect = DIALECTS[profile.activeDialect];
  const isFa = profile.uiLanguage === 'fa';

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <header className="w-full z-40 bg-[#0b0e14] border-b border-gray-800 text-gray-100 px-2 sm:px-6 py-1.5 sm:py-2 shadow-sm shrink-0 pt-safe">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: App Logo & Dialect Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {showBack && onBackPress && (
            <button
              onClick={onBackPress}
              className="p-1.5 rounded-md bg-[#151921] border border-gray-800 text-blue-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs font-bold"
              title={isFa ? 'بازگشت' : 'Back'}
            >
              {isFa ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-mono font-bold text-xs sm:text-sm shadow-sm shrink-0">
              💬
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs sm:text-sm font-bold tracking-tight text-blue-400 font-mono leading-none">
                POLYGLOT.CORE
              </h1>
              <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold tracking-wider uppercase block mt-0.5">
                {isFa ? 'آکادمی هوشمند لهجه‌ها' : 'V20.7 Dialect Engine'}
              </span>
            </div>
          </div>

          {/* Dialect Switcher Dropdown */}
          <div className="relative">
            <select
              value={profile.activeDialect}
              onChange={(e) => onUpdateProfile({ activeDialect: e.target.value as DialectCode })}
              className="appearance-none bg-[#151921] hover:bg-gray-800 text-xs font-semibold text-gray-200 py-1.5 pl-6 pr-5 rounded-md border border-gray-800 focus:outline-none focus:border-blue-500 cursor-pointer transition-all"
            >
              {Object.values(DIALECTS).map((d) => (
                <option key={d.code} value={d.code} className="bg-[#151921] text-gray-200">
                  {d.flag} {isFa ? d.nameFa : d.nameEn}
                </option>
              ))}
            </select>
            <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none">
              {currentDialect?.flag}
            </span>
          </div>

          {/* CEFR Level Selector */}
          <select
            value={profile.level}
            onChange={(e) => onUpdateProfile({ level: e.target.value as CEFRLevel })}
            className="hidden md:block bg-[#151921] text-xs text-blue-400 font-mono font-bold px-2 py-1.5 rounded-md border border-gray-800 hover:border-blue-500 focus:outline-none cursor-pointer"
          >
            {cefrLevels.map((lvl) => (
              <option key={lvl} value={lvl} className="bg-[#151921] text-gray-200">
                سطح {lvl}
              </option>
            ))}
          </select>
        </div>

        {/* Center/Right: Gamification & Stats */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Engine Status Badge */}
          <div
            onClick={onOpenSettings}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-900 border border-gray-800 text-[10px] font-mono text-gray-300 cursor-pointer hover:border-gray-700 transition-colors"
            title="Local AI & Gemini Router Status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>Gemini 3.6</span>
            <Cpu className="w-3 h-3 text-blue-400 ml-0.5" />
          </div>

          {/* Streak Badge */}
          <div className="flex items-center gap-1 bg-[#151921] border border-gray-800 text-orange-400 px-2 py-1 rounded-md text-xs font-mono font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{profile.streakDays}🔥</span>
          </div>

          {/* XP & Level Bar */}
          <div className="flex items-center gap-1.5 bg-[#151921] border border-gray-800 px-2 py-1 rounded-md text-xs font-mono font-medium text-gray-200">
            <Award className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] text-purple-300 font-bold">LVL {profile.userLevel}</span>
            <span className="text-[10px] text-blue-400 font-bold">{profile.xp}XP</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => onUpdateProfile({ uiLanguage: profile.uiLanguage === 'fa' ? 'en' : 'fa' })}
            className="p-1.5 rounded-md bg-[#151921] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold"
            title="تغییر زبان رابط کاربری"
          >
            <Globe className="w-3.5 h-3.5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => onUpdateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' })}
            className="p-1.5 rounded-md bg-[#151921] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800"
            title="تم تاریک / روشن"
          >
            {profile.theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-gray-400" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-md bg-[#151921] border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800"
            title="تنظیمات پیشرفته"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

