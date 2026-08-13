import React, { useEffect, useRef, useState } from "react";
import { Volume2, Square, Send } from "lucide-react";
import { chat, tts } from "../utils/real-api";

export function ChatView({
  dialect, level, scenario, onExitScenario,
}: {
  dialect: string; level: string;
  scenario?: { id: number; title: string; context: string } | null;
  onExitScenario?: () => void;
}) {
  const [m, setM] = useState<any[]>([]);
  const [v, setV] = useState("");
  const [busy, setBusy] = useState(false);
  const [play, setPlay] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLAudioElement>();
  const u = useRef<string>();
  const convId = useRef<string>();

  const clean = () => {
    a.current?.pause();
    a.current?.removeAttribute("src");
    if (u.current) URL.revokeObjectURL(u.current);
    a.current = undefined;
    u.current = undefined;
    setPlay(null);
  };
  useEffect(() => () => clean(), []);
  useEffect(() => { requestAnimationFrame(() => end.current?.scrollIntoView({ behavior: "smooth" })); }, [m, busy]);

  // Reset the thread whenever dialect or scenario changes.
  useEffect(() => {
    setM([]);
    convId.current = undefined;
    if (scenario) {
      setM([{ id: crypto.randomUUID(), role: "assistant", content: `🎭 ${scenario.title}\n${scenario.context}\nSay something to start!` }]);
    }
  }, [dialect, scenario?.id]);

  const speak = async (id: string, text: string) => {
    if (play === id) { clean(); return; }
    clean();
    try {
      const b = await tts(text, dialect);
      const x = URL.createObjectURL(new Blob([b], { type: "audio/mpeg" }));
      u.current = x;
      const z = new Audio(x);
      a.current = z;
      z.onplay = () => setPlay(id);
      z.onended = clean;
      await z.play();
    } catch { clean(); }
  };

  const send = async () => {
    const x = v.trim();
    if (!x || busy) return;
    setV("");
    setM((q) => [...q, { id: crypto.randomUUID(), role: "user", content: x }]);
    setBusy(true);
    try {
      const r = await chat(x, {
        dialect, level, conversationId: convId.current,
        mode: scenario ? "roleplay" : "free",
        character: scenario?.title,
      });
      convId.current = r.conversationId;
      const id = crypto.randomUUID();
      setM((q) => [...q, { id, role: "assistant", content: r.text }]);
      speak(id, r.text).catch(() => {});
    } catch {
      setM((q) => [...q, { id: crypto.randomUUID(), role: "assistant", content: "AI engine unavailable. Check your connection or local Ollama setup." }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="h-full flex flex-col">
      {scenario && (
        <div className="flex items-center justify-between bg-panel2 px-4 py-2 text-sm">
          <span>🎭 {scenario.title}</span>
          <button onClick={onExitScenario} className="text-accent2 text-xs">End</button>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 messages center-col">
        {m.map((x) => (
          <div key={x.id} className={`flex my-2 ${x.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 whitespace-pre-wrap break-words leading-relaxed ${x.role === "user" ? "bg-accent" : "bg-panel"}`}>
              {x.content}
              {x.role === "assistant" && (
                <button onClick={() => speak(x.id, x.content)} className="ml-2 align-middle text-accent2 inline-flex">
                  {play === x.id ? <Square size={14} /> : <Volume2 size={14} />}
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="bg-panel rounded-2xl px-4 py-3 inline-block">•••</div>}
        <div ref={end} />
      </div>
      <div className="flex gap-2 p-3 border-t border-white/10 input-bar center-col">
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }}
          placeholder="Type a message…"
          className="flex-1 min-w-0 bg-panel2 border border-white/10 rounded-xl px-4 py-3 outline-none"
        />
        <button disabled={busy || !v.trim()} onClick={send} className="bg-accent disabled:opacity-40 rounded-xl px-4 grid place-items-center">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
