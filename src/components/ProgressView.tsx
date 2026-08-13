import React, { useEffect, useState } from "react";
import { Flame, Star, BookOpen, Mic } from "lucide-react";
import { dashboard } from "../utils/real-api";

export function ProgressView() {
  const [d, setD] = useState<any>(null);

  useEffect(() => { dashboard().then(setD).catch(() => setD(null)); }, []);

  if (!d) return <div className="h-full grid place-items-center text-gray-400 text-sm">Loading progress…</div>;

  const cards = [
    { icon: Star, label: "XP", value: d.xp, sub: `Level ${d.level}` },
    { icon: Flame, label: "Streak", value: `${d.streak.current}d`, sub: `Best ${d.streak.best}d` },
    { icon: BookOpen, label: "Words Learned", value: d.wordsLearned, sub: d.cefr },
    { icon: Mic, label: "Pronunciation", value: d.pronunciationAccuracy != null ? `${d.pronunciationAccuracy}%` : "—", sub: "avg. accuracy" },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 center-col">
      <h2 className="text-lg font-semibold mb-3">Your Progress</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-panel rounded-2xl p-4 border border-white/5">
            <c.icon size={20} className="text-accent2 mb-2" />
            <div className="text-2xl font-bold">{c.value}</div>
            <div className="text-xs text-gray-400">{c.label}</div>
            <div className="text-[11px] text-gray-500 mt-1">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
