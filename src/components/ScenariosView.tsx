import React, { useEffect, useState } from "react";
import { Coffee, Plane, Car, ShoppingBag, Briefcase, Play } from "lucide-react";
import { scenarios } from "../utils/real-api";

const ICONS: Record<string, any> = { cafe: Coffee, airport: Plane, taxi: Car, market: ShoppingBag, interview: Briefcase };

export function ScenariosView({ dialect, onStart }: { dialect: string; onStart: (s: any) => void }) {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    scenarios(dialect).then((r) => setList(r.scenarios || [])).catch(() => setList([])).finally(() => setLoading(false));
  }, [dialect]);

  const iconFor = (code: string) => {
    const key = Object.keys(ICONS).find((k) => code.startsWith(k));
    return key ? ICONS[key] : Play;
  };

  return (
    <div className="h-full overflow-y-auto p-4 center-col">
      <h2 className="text-lg font-semibold mb-3">Roleplay Scenarios</h2>
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {!loading && !list.length && <p className="text-gray-400 text-sm">No scenarios for this dialect yet.</p>}
      <div className="grid gap-3">
        {list.map((s) => {
          const Icon = iconFor(s.code);
          return (
            <button
              key={s.id}
              onClick={() => onStart(s)}
              className="flex items-start gap-3 text-left bg-panel rounded-2xl p-4 border border-white/5 active:scale-[.98] transition"
            >
              <div className="bg-accent/20 text-accent rounded-xl p-2 shrink-0"><Icon size={20} /></div>
              <div>
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-gray-400 mt-1">{s.context}</div>
                <div className="text-[11px] text-accent2 mt-1">Difficulty {s.difficulty}/5</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
