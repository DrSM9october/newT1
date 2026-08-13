import React, { useState, useEffect } from 'react';
import { SRSCard, MistakeItem, UserProfile } from '../types/dialect';
import { appDB } from '../lib/db';
import { calculateSM2, getInitialDefaultCards, isCardDue } from '../lib/srsEngine';
import { speakText } from '../lib/speechEngine';
import {
  Brain,
  RotateCw,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Calendar,
  Zap
} from 'lucide-react';

interface SRSViewProps {
  profile: UserProfile;
  onAddXp: (amount: number) => void;
}

export const SRSView: React.FC<SRSViewProps> = ({ profile, onAddXp }) => {
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [activeTab, setActiveTab] = useState<'flashcards' | 'mistakes'>('flashcards');

  const isFa = profile.uiLanguage === 'fa';

  useEffect(() => {
    loadData();
  }, [profile.activeDialect]);

  const loadData = async () => {
    let list = await appDB.getSRSCards(profile.activeDialect);
    if (list.length === 0) {
      list = getInitialDefaultCards(profile.activeDialect);
      for (const card of list) {
        await appDB.saveSRSCard(card);
      }
    }
    setCards(list);

    const mList = await appDB.getMistakes(profile.activeDialect);
    setMistakes(mList);
  };

  const dueCards = cards.filter(isCardDue);
  const currentCard = dueCards[currentIndex] || cards[0];

  const handleGradeCard = async (quality: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;

    const updated = calculateSM2(currentCard, quality);
    await appDB.saveSRSCard(updated);

    // Update state
    setCards((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setIsFlipped(false);
    onAddXp(5);

    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-lg bg-[#151921] border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {isFa ? 'سیستم تکرار فاصله‌دار (SRS SM-2)' : 'Spaced Repetition Deck'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">
              {isFa ? 'مرور کارت‌ها بر اساس الگوریتم حافظه کوتاه‌مدت و بلندمدت' : 'SM-2 Memory Retention Review Engine'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-md bg-[#0b0e14] p-1 border border-gray-800">
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
              activeTab === 'flashcards' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isFa ? `کارت‌های آماده مرور (${dueCards.length})` : `Due Cards (${dueCards.length})`}
          </button>
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
              activeTab === 'mistakes' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {isFa ? `ردیاب اشتباهات (${mistakes.length})` : `Mistakes (${mistakes.length})`}
          </button>
        </div>
      </div>

      {activeTab === 'flashcards' ? (
        dueCards.length === 0 ? (
          <div className="p-10 text-center bg-[#151921] border border-gray-800 rounded-lg space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
            <h3 className="text-base font-bold text-white">
              {isFa ? 'عالی است! تمام کارت‌های امروز را مرور کرده‌اید' : 'All due cards reviewed for today!'}
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto font-mono">
              {isFa ? 'فردا برای نوبت بعدی مرور حافظه مراجعه کنید.' : 'Check back tomorrow for your next memory retention cycle.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Card Flipper Stage */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[260px] p-6 rounded-lg bg-[#151921] border-2 border-blue-500/40 hover:border-blue-500 text-gray-100 flex flex-col justify-between items-center text-center cursor-pointer shadow-sm transition-all relative overflow-hidden group"
            >
              <div className="w-full flex items-center justify-between text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  کارت {currentIndex + 1} از {dueCards.length}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#0b0e14] text-blue-400 font-bold border border-gray-800 text-[11px]">
                  EF: {currentCard?.easeFactor || 2.5}
                </span>
              </div>

              {/* Card Face Content */}
              <div className="my-auto space-y-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
                  {currentCard?.frontText}
                </h3>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentCard) speakText(currentCard.frontText, profile.activeDialect);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40 text-xs font-mono font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>تلفظ صوتی</span>
                </button>

                {isFlipped && (
                  <div className="pt-3 border-t border-gray-800 space-y-1 animate-fadeIn">
                    <p className="text-base text-green-400 font-bold dir-rtl">
                      {currentCard?.backTextFa}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      {currentCard?.backTextEn}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1 group-hover:text-blue-400">
                <RotateCw className="w-3 h-3" />
                <span>{isFlipped ? (isFa ? 'برای چرخش مجدد کلیک کنید' : 'Click to flip back') : (isFa ? 'برای مشاهده پاسخ کلیک کنید' : 'Click to reveal back')}</span>
              </div>
            </div>

            {/* Review Difficulty Buttons */}
            {isFlipped && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fadeIn">
                <button
                  onClick={() => handleGradeCard(1)}
                  className="p-2.5 rounded-md bg-[#151921] border border-rose-800/80 hover:bg-rose-950/40 text-rose-300 font-mono font-bold text-xs flex flex-col items-center gap-0.5"
                >
                  <span>مجدداً (Again)</span>
                  <span className="text-[10px] text-rose-400/80 font-normal">۱ روز بعد</span>
                </button>

                <button
                  onClick={() => handleGradeCard(2)}
                  className="p-2.5 rounded-md bg-[#151921] border border-amber-800/80 hover:bg-amber-950/40 text-amber-300 font-mono font-bold text-xs flex flex-col items-center gap-0.5"
                >
                  <span>سخت (Hard)</span>
                  <span className="text-[10px] text-amber-400/80 font-normal">۳ روز بعد</span>
                </button>

                <button
                  onClick={() => handleGradeCard(3)}
                  className="p-2.5 rounded-md bg-[#151921] border border-blue-800/80 hover:bg-blue-950/40 text-blue-300 font-mono font-bold text-xs flex flex-col items-center gap-0.5"
                >
                  <span>خوب (Good)</span>
                  <span className="text-[10px] text-blue-400/80 font-normal">۶ روز بعد</span>
                </button>

                <button
                  onClick={() => handleGradeCard(4)}
                  className="p-2.5 rounded-md bg-[#151921] border border-emerald-800/80 hover:bg-emerald-950/40 text-emerald-300 font-mono font-bold text-xs flex flex-col items-center gap-0.5"
                >
                  <span>آسان (Easy)</span>
                  <span className="text-[10px] text-emerald-400/80 font-normal">۱۰ روز بعد</span>
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        /* Mistakes Tracker View */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-mono uppercase">
              {isFa ? 'سابقه اشتباهات گرامری و تلفظ' : 'Mistakes & Grammar Log'}
            </h3>
            <button
              onClick={() => onAddXp(20)}
              className="px-3.5 py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isFa ? 'تولید تمرین هوشمند AI' : 'Generate Practice Drills'}</span>
            </button>
          </div>

          {mistakes.length === 0 ? (
            <div className="p-6 text-center bg-[#151921] border border-gray-800 rounded-lg text-gray-500 text-xs font-mono">
              {isFa ? 'هیچ اشتباهی ثبت نشده است.' : 'No mistakes recorded yet.'}
            </div>
          ) : (
            <div className="space-y-2">
              {mistakes.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-lg bg-[#151921] border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-xs font-bold text-rose-400 line-through">
                        {m.userAttempt}
                      </span>
                      <span className="text-xs font-bold text-green-400">
                        ➔ {m.correctForm}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 dir-rtl">{m.explanationFa}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b0e14] border border-gray-800 text-gray-400 shrink-0 uppercase">
                    {m.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
