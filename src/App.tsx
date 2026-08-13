import React, { useEffect, useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { MessageCircle, Drama, BookOpen, BarChart3, Settings as SettingsIcon } from "lucide-react";
import { health } from "./utils/real-api";
import { ChatView } from "./components/ChatView";
import { ScenariosView } from "./components/ScenariosView";
import { PhrasesView } from "./components/PhrasesView";
import { ProgressView } from "./components/ProgressView";
import { SettingsModal } from "./components/SettingsModal";
import "./index.css";

type Tab = "chat" | "scenarios" | "phrases" | "progress";

export default function App() {
  const [tab, setTab] = useState<Tab>("chat");
  const [modal, setModal] = useState(false);
  const [status, setStatus] = useState("connecting");
  const [dialect, setDialect] = useState(localStorage.getItem("linguaai_dialect") || "american");
  const [level, setLevel] = useState(localStorage.getItem("linguaai_level") || "A1");
  const [scenario, setScenario] = useState<any>(null);

  useEffect(() => { health().then(() => setStatus("online")).catch(() => setStatus("offline")); }, []);
  useEffect(() => { localStorage.setItem("linguaai_dialect", dialect); }, [dialect]);
  useEffect(() => { localStorage.setItem("linguaai_level", level); }, [level]);

  useEffect(() => {
    let sub: any;
    if ((window as any).Capacitor?.isNativePlatform()) {
      sub = CapApp.addListener("backButton", () => {
        if (modal) return setModal(false);
        if (scenario) return setScenario(null);
        if (tab !== "chat") return setTab("chat");
        CapApp.minimizeApp().catch(() => {});
      });
    }
    return () => sub?.remove?.();
  }, [modal, tab, scenario]);

  const startScenario = (s: any) => { setScenario(s); setTab("chat"); };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "scenarios", label: "Scenarios", icon: Drama },
    { id: "phrases", label: "Phrases", icon: BookOpen },
    { id: "progress", label: "Progress", icon: BarChart3 },
  ];

  return (
    <div className="app bg-ink">
      <header className="h-14 shrink-0 flex items-center gap-3 px-4 border-b border-white/10">
        <b>LinguaAI</b>
        <span className="text-xs text-gray-500 ml-2">Polyglot Core</span>
        <span className={`ml-auto text-xs ${status === "online" ? "text-emerald-400" : "text-gray-500"}`}>{status}</span>
        <button onClick={() => setModal(true)} className="text-gray-300"><SettingsIcon size={20} /></button>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">
        {tab === "chat" && <ChatView dialect={dialect} level={level} scenario={scenario} onExitScenario={() => setScenario(null)} />}
        {tab === "scenarios" && <ScenariosView dialect={dialect} onStart={startScenario} />}
        {tab === "phrases" && <PhrasesView dialect={dialect} />}
        {tab === "progress" && <ProgressView />}
      </main>

      <nav className="h-16 shrink-0 flex border-t border-white/10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-[11px] ${tab === t.id ? "text-accent2" : "text-gray-500"}`}
          >
            <t.icon size={20} />
            {t.label}
          </button>
        ))}
      </nav>

      {modal && (
        <SettingsModal
          dialect={dialect}
          level={level}
          onChange={(c) => { if (c.dialect) setDialect(c.dialect); if (c.level) setLevel(c.level); }}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}
