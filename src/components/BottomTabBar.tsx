import React from 'react';
import { MessageSquare, Compass, Brain, Mic, BarChart3 } from 'lucide-react';

export type TabType = 'chat' | 'roleplays' | 'srs' | 'pronunciation' | 'dashboard';

interface BottomTabBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  uiLanguage: 'fa' | 'en';
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  uiLanguage,
}) => {
  const isFa = uiLanguage === 'fa';

  const tabs: Array<{ id: TabType; labelFa: string; labelEn: string; icon: React.ReactNode }> = [
    { id: 'chat', labelFa: 'چت و گفتگو', labelEn: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'roleplays', labelFa: 'سناریوها', labelEn: 'Scenarios', icon: <Compass className="w-5 h-5" /> },
    { id: 'srs', labelFa: 'تکرار SRS', labelEn: 'SRS Deck', icon: <Brain className="w-5 h-5" /> },
    { id: 'pronunciation', labelFa: 'تلفظ', labelEn: 'Pronunciation', icon: <Mic className="w-5 h-5" /> },
    { id: 'dashboard', labelFa: 'داشبورد', labelEn: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <nav className="w-full z-40 bg-[#151921] border-t border-gray-800 text-gray-400 py-1 px-2 sm:px-8 pb-safe shrink-0 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around sm:justify-between">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 sm:px-3 rounded-md transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 font-bold scale-105'
                  : 'hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <div className={`p-0.5 rounded-md ${isActive ? 'text-blue-400' : ''}`}>
                {tab.icon}
              </div>
              <span className="text-[10px] mt-0.5 font-semibold">
                {isFa ? tab.labelFa : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
