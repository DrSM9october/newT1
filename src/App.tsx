import React, { useState, useEffect } from 'react';
import { UserProfile, RoleplayScenario } from './types/dialect';
import { appDB } from './lib/db';
import { HeaderNav } from './components/HeaderNav';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { ChatView } from './components/ChatView';
import { RoleplayView } from './components/RoleplayView';
import { SRSView } from './components/SRSView';
import { PronunciationLab } from './components/PronunciationLab';
import { DashboardView } from './components/DashboardView';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [activeScenario, setActiveScenario] = useState<RoleplayScenario | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiHealth, setAiHealth] = useState({ localAiStatus: 'active', geminiBackend: 'connected' });

  useEffect(() => {
    loadProfile();
    checkHealth();
  }, []);

  // Handle mobile browser / phone hardware back button gracefully
  useEffect(() => {
    const handlePopState = () => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (activeScenario) {
        setActiveScenario(null);
      } else if (activeTab !== 'chat') {
        setActiveTab('chat');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSettingsOpen, activeScenario, activeTab]);

  const loadProfile = async () => {
    const p = await appDB.getUserProfile();
    setProfile(p);
  };

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setAiHealth({
        localAiStatus: data.localAiStatus || 'active',
        geminiBackend: data.geminiBackend || 'fallback-mode'
      });
    } catch (e) {
      // offline/fallback
    }
  };

  const handleUpdateProfile = async (updated: Partial<UserProfile>) => {
    if (!profile) return;
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    await appDB.saveUserProfile(newProfile);
  };

  const handleAddXp = async (amount: number) => {
    if (!profile) return;
    const newXp = profile.xp + amount;
    const newTodayXp = profile.todayXp + amount;

    // Check level up (every 100 XP)
    const newLevel = Math.floor(newXp / 100) + 1;

    const updated = {
      ...profile,
      xp: newXp,
      todayXp: newTodayXp,
      userLevel: newLevel
    };

    setProfile(updated);
    await appDB.saveUserProfile(updated);
  };

  const handleSelectScenario = (scenario: RoleplayScenario) => {
    window.history.pushState({ scenario: scenario.id }, '');
    setActiveScenario(scenario);
    setActiveTab('chat');
  };

  const handleSelectTab = (tab: TabType) => {
    if (tab !== activeTab) {
      window.history.pushState({ tab }, '');
      setActiveTab(tab);
    }
  };

  const handleOpenSettings = () => {
    window.history.pushState({ modal: 'settings' }, '');
    setIsSettingsOpen(true);
  };

  if (!profile) {
    return (
      <div className="h-[100dvh] w-full bg-[#0b0e14] text-gray-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 font-mono font-bold text-blue-400 animate-pulse bg-[#151921] border border-gray-800 px-6 py-4 rounded-lg shadow-xl">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-mono">⚡</div>
          <span>[POLYGLOT.CORE] Loading DialectAI Engine...</span>
        </div>
      </div>
    );
  }

  const isFa = profile.uiLanguage === 'fa';

  return (
    <div
      className={`h-[100dvh] max-h-[100dvh] w-full bg-[#0b0e14] text-gray-100 font-sans flex flex-col overflow-hidden ${
        isFa ? 'dir-rtl' : 'dir-ltr'
      }`}
    >
      {/* Top Header - Fixed height at top */}
      <HeaderNav
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenSettings={handleOpenSettings}
        aiHealthStatus={aiHealth}
        onBackPress={() => {
          if (activeScenario) {
            setActiveScenario(null);
          } else if (activeTab !== 'chat') {
            setActiveTab('chat');
          }
        }}
        showBack={!!activeScenario || activeTab !== 'chat'}
      />

      {/* Main View Area - Bounded mobile flex container */}
      <main className="flex-1 min-h-0 w-full max-w-7xl mx-auto relative overflow-hidden flex flex-col">
        {activeTab === 'chat' && (
          <ChatView
            profile={profile}
            activeScenario={activeScenario}
            onClearScenario={() => setActiveScenario(null)}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'roleplays' && (
          <div className="h-full overflow-y-auto mobile-scroll-container px-2 sm:px-4 py-3">
            <RoleplayView
              profile={profile}
              onSelectScenario={handleSelectScenario}
            />
          </div>
        )}

        {activeTab === 'srs' && (
          <div className="h-full overflow-y-auto mobile-scroll-container px-2 sm:px-4 py-3">
            <SRSView
              profile={profile}
              onAddXp={handleAddXp}
            />
          </div>
        )}

        {activeTab === 'pronunciation' && (
          <div className="h-full overflow-y-auto mobile-scroll-container px-2 sm:px-4 py-3">
            <PronunciationLab
              profile={profile}
              onAddXp={handleAddXp}
            />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="h-full overflow-y-auto mobile-scroll-container px-2 sm:px-4 py-3">
            <DashboardView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar - Sticky at bottom */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        uiLanguage={profile.uiLanguage}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
}

