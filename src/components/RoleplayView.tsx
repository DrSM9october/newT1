import React, { useState } from 'react';
import { RoleplayScenario, LearningPath, UserProfile, DialectCode } from '../types/dialect';
import { ROLEPLAY_SCENARIOS, LEARNING_PATHS, DIALECTS } from '../lib/dialectsData';
import { Play, Compass, Award, CheckCircle, BookOpen, ChevronLeft } from 'lucide-react';

interface RoleplayViewProps {
  profile: UserProfile;
  onSelectScenario: (scenario: RoleplayScenario) => void;
}

export const RoleplayView: React.FC<RoleplayViewProps> = ({ profile, onSelectScenario }) => {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'paths'>('scenarios');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const isFa = profile.uiLanguage === 'fa';
  const dialectScenarios = ROLEPLAY_SCENARIOS.filter(s => s.dialect === profile.activeDialect);
  const dialectPaths = LEARNING_PATHS.filter(p => p.dialect === profile.activeDialect);

  const filteredScenarios = selectedDifficulty === 'all'
    ? dialectScenarios
    : dialectScenarios.filter(s => s.difficulty === selectedDifficulty);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-[#151921] border border-gray-800 text-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase font-mono tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>{isFa ? 'سناریوهای شبیه‌سازی واقعی' : 'Real-world Roleplay Engine'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isFa ? `نقش‌آفرینی تعاملی به لهجه ${DIALECTS[profile.activeDialect]?.nameFa}` : `Roleplay Scenarios in ${DIALECTS[profile.activeDialect]?.nameEn}`}
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            {isFa
              ? 'با شخصیت‌های هوش مصنوعی در موقعیت‌های واقعی سفر، کافه، مصاحبه کاری و خرید گفتگو کنید.'
              : 'Practice with AI personas in real situations like coffee shops, job interviews, taxis, and markets.'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-md bg-[#0b0e14] p-1 border border-gray-800 shrink-0">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
              activeTab === 'scenarios' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isFa ? 'سناریوها (30+)' : 'Scenarios (30+)'}
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
              activeTab === 'paths' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isFa ? 'مسیرهای یادگیری (10+)' : 'Learning Paths'}
          </button>
        </div>
      </div>

      {activeTab === 'scenarios' ? (
        <>
          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-[10px] font-mono font-bold uppercase text-gray-500 shrink-0">
              {isFa ? 'فیلتر سطح:' : 'Difficulty:'}
            </span>
            {['all', 'A1', 'A2', 'B1', 'B2'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedDifficulty(lvl)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all shrink-0 border ${
                  selectedDifficulty === lvl
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-[#151921] border-gray-800 text-gray-300 hover:bg-gray-800'
                }`}
              >
                {lvl === 'all' ? (isFa ? 'همه سطوح' : 'All Levels') : `سطح ${lvl}`}
              </button>
            ))}
          </div>

          {/* Scenarios Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredScenarios.map((sc) => {
              const isCompleted = profile.completedScenarios.includes(sc.id);

              return (
                <div
                  key={sc.id}
                  className="bg-[#151921] border border-gray-800 hover:border-gray-700 rounded-lg p-4 flex flex-col justify-between space-y-3 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <span className="text-2xl p-1.5 rounded-md bg-[#0b0e14] border border-gray-800">
                        {sc.characterAvatar}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {sc.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {isFa ? sc.titleFa : sc.titleEn}
                      </h3>
                      <p className="text-[11px] text-gray-400 mt-0.5 font-mono">
                        {isFa ? sc.categoryFa : sc.categoryEn} • {sc.characterName} ({isFa ? sc.characterRoleFa : sc.characterRoleEn})
                      </p>
                    </div>

                    <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                      {isFa ? sc.contextDescriptionFa : sc.contextDescriptionEn}
                    </p>

                    {/* Key Phrases */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {sc.keyPhrasesToUse.slice(0, 3).map((phrase, idx) => (
                        <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0b0e14] text-gray-400 border border-gray-800">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectScenario(sc)}
                    className="w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isFa ? 'شروع گفتگو با شخصیت' : 'Start Scenario'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* Learning Paths List */
        <div className="space-y-3">
          {dialectPaths.map((path) => (
            <div
              key={path.id}
              className="bg-[#151921] border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2 bg-[#0b0e14] rounded-md border border-gray-800 shrink-0">
                  {path.icon}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {isFa ? path.titleFa : path.titleEn}
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      سطح {path.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 max-w-2xl">
                    {isFa ? path.descriptionFa : path.descriptionEn}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-gray-500">
                    <span>📚 {path.stepsCount} گام یادگیری</span>
                    <span>•</span>
                    <span>💬 {path.scenarios.length} سناریوی عملی</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const sc = ROLEPLAY_SCENARIOS.find(s => s.id === path.scenarios[0]);
                  if (sc) onSelectScenario(sc);
                }}
                className="w-full md:w-auto px-5 py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                <span>{isFa ? 'شروع اولین گام' : 'Start Learning Path'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
