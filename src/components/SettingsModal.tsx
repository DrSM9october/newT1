import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { dialects as fetchDialects } from "../utils/real-api";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function SettingsModal({
  dialect, level, onChange, onClose,
}: {
  dialect: string; level: string;
  onChange: (d: { dialect?: string; level?: string }) => void;
  onClose: () => void;
}) {
  const [list, setList] = useState<any[]>([]);
  useEffect(() => { fetchDialects().then((r) => setList(r.dialects || [])).catch(() => setList([])); }, []);

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50 p-4" onClick={onClose}>
      <div className="bg-panel rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Settings</h3>
          <button onClick={onClose} className="text-gray-400"><X size={20} /></button>
        </div>

        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Dialect / Language</p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {list.map((d) => (
            <button
              key={d.code}
              onClick={() => onChange({ dialect: d.code })}
              className={`text-left rounded-xl px-3 py-2 border text-sm ${dialect === d.code ? "border-accent bg-accent/20" : "border-white/10 bg-panel2"}`}
            >
              <div>{d.flag} {d.labelEn}</div>
              <div className="text-xs text-gray-400">{d.labelNative}</div>
            </button>
          ))}
        </div>

        <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">CEFR Level</p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => onChange({ level: l })}
              className={`px-3 py-1.5 rounded-full border text-sm ${level === l ? "border-accent bg-accent/20" : "border-white/10 bg-panel2"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
