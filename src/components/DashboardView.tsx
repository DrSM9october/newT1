import React, { useState, useEffect } from 'react';
import { UserProfile, AuditLog } from '../types/dialect';
import { ACHIEVEMENTS_LIST, DIALECTS } from '../lib/dialectsData';
import { appDB } from '../lib/db';
import {
  Award,
  Flame,
  BarChart3,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  History,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ profile, onUpdateProfile }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backupJson, setBackupJson] = useState<string>('');
  const [restoreText, setRestoreText] = useState<string>('');
  const [restoreStatus, setRestoreStatus] = useState<string>('');

  const isFa = profile.uiLanguage === 'fa';

  const handleExportData = async () => {
    const json = await appDB.exportAllData();
    setBackupJson(json);

    // Download blob
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dialect_ai_backup_${Date.now()}.json`;
    a.click();
  };

  const handleRestoreData = async () => {
    if (!restoreText.trim()) return;
    const ok = await appDB.restoreData(restoreText);
    if (ok) {
      setRestoreStatus(isFa ? 'داده‌ها با موفقیت بازیابی شدند!' : 'Data restored successfully!');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      setRestoreStatus(isFa ? 'خطا در قالب فایل پشتیبان' : 'Invalid JSON backup format');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Streak Card */}
        <div className="p-4 rounded-lg bg-[#151921] border border-gray-800 flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#0b0e14] text-amber-500 border border-gray-800">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">{isFa ? 'رکورد تمرین روزانه' : 'Streak Record'}</span>
            <h3 className="text-xl font-bold font-mono text-white">{profile.streakDays} {isFa ? 'روز' : 'Days'}</h3>
          </div>
        </div>

        {/* XP Card */}
        <div className="p-4 rounded-lg bg-[#151921] border border-gray-800 flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#0b0e14] text-purple-400 border border-gray-800">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">{isFa ? 'امتیاز تجربه کل (XP)' : 'Total Experience'}</span>
            <h3 className="text-xl font-bold font-mono text-white">{profile.xp} XP</h3>
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="p-4 rounded-lg bg-[#151921] border border-gray-800 flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#0b0e14] text-blue-400 border border-gray-800">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">{isFa ? 'هدف امروزی' : 'Today Goal'}</span>
            <h3 className="text-xl font-bold font-mono text-white">{profile.todayXp} / {profile.dailyXpGoal} XP</h3>
          </div>
        </div>

        {/* Level Card */}
        <div className="p-4 rounded-lg bg-[#151921] border border-gray-800 flex items-center gap-3">
          <div className="p-2.5 rounded bg-[#0b0e14] text-green-400 border border-gray-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold block">{isFa ? 'سطح کاربری' : 'User Level'}</span>
            <h3 className="text-xl font-bold font-mono text-white">سطح {profile.userLevel}</h3>
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="p-5 rounded-lg bg-[#151921] border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-400" />
            <span>{isFa ? 'نشان‌ها و دستاوردها' : 'Badges & Achievements'}</span>
          </h3>
          <span className="text-[10px] font-mono text-gray-400 font-bold">
            {profile.unlockedAchievements.length} از {ACHIEVEMENTS_LIST.length} بازشده
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = profile.unlockedAchievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-lg border flex items-center gap-2.5 transition-all ${
                  isUnlocked
                    ? 'bg-[#0b0e14] border-gray-800 text-white'
                    : 'bg-[#0b0e14]/50 border-gray-800/40 opacity-40 grayscale'
                }`}
              >
                <span className="text-2xl p-1.5 rounded bg-[#151921] border border-gray-800">
                  {ach.icon}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">{isFa ? ach.titleFa : ach.titleEn}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{isFa ? ach.descFa : ach.descEn}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="p-5 rounded-lg bg-[#151921] border border-gray-800 space-y-3">
        <h3 className="text-sm font-bold font-mono uppercase text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" />
          <span>{isFa ? 'مدیریت داده‌ها، پشتیبان‌گیری و GDPR' : 'Data Management & GDPR Export'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Export JSON */}
          <div className="p-3.5 rounded-lg bg-[#0b0e14] border border-gray-800 space-y-2">
            <h4 className="text-xs font-bold text-white font-mono">{isFa ? 'خروجی کامل داده‌ها (JSON Backup)' : 'Full Data Export (JSON)'}</h4>
            <p className="text-[11px] text-gray-400">
              {isFa ? 'ذخیره تمام فلش کارت‌ها، تاریخچه مکالمات و اشتباهات در یک فایل JSON.' : 'Download full backup of flashcards, chats, and progress logs.'}
            </p>
            <button
              onClick={handleExportData}
              className="px-3.5 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isFa ? 'دانلود فایل پشتیبان' : 'Download Backup JSON'}</span>
            </button>
          </div>

          {/* Restore JSON */}
          <div className="p-3.5 rounded-lg bg-[#0b0e14] border border-gray-800 space-y-2">
            <h4 className="text-xs font-bold text-white font-mono">{isFa ? 'بازیابی داده‌ها از پشتیبان' : 'Restore Data from Backup'}</h4>
            <textarea
              rows={2}
              value={restoreText}
              onChange={(e) => setRestoreText(e.target.value)}
              placeholder={isFa ? 'کد JSON پشتیبان را اینجا جای‌گذاری کنید...' : 'Paste backup JSON here...'}
              className="w-full bg-[#151921] border border-gray-800 text-gray-200 text-xs p-2 rounded focus:outline-none font-mono"
            />
            <button
              onClick={handleRestoreData}
              className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isFa ? 'بازیابی پشتیبان' : 'Restore Backup'}</span>
            </button>
            {restoreStatus && <p className="text-xs text-green-400 font-bold font-mono">{restoreStatus}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
