import React, { useEffect, useState } from "react";
import { Plus, Check } from "lucide-react";
import { vocabulary, addVocabulary, srsDue, srsReview } from "../utils/real-api";

export function PhrasesView({ dialect }: { dialect: string }) {
  const [tab, setTab] = useState<"review" | "list">("review");
  const [due, setDue] = useState<any[]>([]);
  const [words, setWords] = useState<any[]>([]);
  const [flip, setFlip] = useState(false);
  const [idx, setIdx] = useState(0);
  const [form, setForm] = useState({ word: "", translation: "", example: "" });
  const [showForm, setShowForm] = useState(false);

  const loadDue = () => srsDue().then((r) => { setDue(r.due || []); setIdx(0); setFlip(false); }).catch(() => setDue([]));
  const loadWords = () => vocabulary(dialect).then((r) => setWords(r.vocabulary || [])).catch(() => setWords([]));

  useEffect(() => { loadDue(); loadWords(); }, [dialect]);

  const current = due[idx];

  const grade = async (q: number) => {
    if (!current) return;
    await srsReview(current.cardId, q).catch(() => {});
    if (idx + 1 < due.length) { setIdx(idx + 1); setFlip(false); } else { loadDue(); }
  };

  const submitWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.word.trim() || !form.translation.trim()) return;
    await addVocabulary(form.word.trim(), form.translation.trim(), dialect, form.example.trim() || undefined).catch(() => {});
    setForm({ word: "", translation: "", example: "" });
    setShowForm(false);
    loadWords();
    loadDue();
  };

  return (
    <div className="h-full flex flex-col center-col">
      <div className="flex gap-2 p-3">
        <button onClick={() => setTab("review")} className={`flex-1 py-2 rounded-xl text-sm ${tab === "review" ? "bg-accent" : "bg-panel2"}`}>SRS Review ({due.length})</button>
        <button onClick={() => setTab("list")} className={`flex-1 py-2 rounded-xl text-sm ${tab === "list" ? "bg-accent" : "bg-panel2"}`}>My Words ({words.length})</button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {tab === "review" && (
          due.length === 0 ? (
            <p className="text-gray-400 text-sm text-center mt-10">Nothing due right now — add some words or come back later.</p>
          ) : (
            <div className="max-w-sm mx-auto">
              <div
                onClick={() => setFlip((f) => !f)}
                className="bg-panel rounded-2xl p-8 text-center min-h-[160px] flex items-center justify-center cursor-pointer border border-white/5"
              >
                <div>
                  <div className="text-xl font-semibold">{flip ? current.translation : current.word}</div>
                  {flip && current.example && <div className="text-sm text-gray-400 mt-2">{current.example}</div>}
                  {!flip && <div className="text-xs text-gray-500 mt-3">Tap to reveal</div>}
                </div>
              </div>
              {flip && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[{ q: 1, label: "Again" }, { q: 3, label: "Hard" }, { q: 4, label: "Good" }, { q: 5, label: "Easy" }].map((b) => (
                    <button key={b.q} onClick={() => grade(b.q)} className="bg-panel2 rounded-xl py-2 text-sm">{b.label}</button>
                  ))}
                </div>
              )}
              <p className="text-center text-xs text-gray-500 mt-3">{idx + 1} / {due.length}</p>
            </div>
          )
        )}

        {tab === "list" && (
          <div className="grid gap-2">
            {words.map((w) => (
              <div key={w.id} className="bg-panel rounded-xl p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{w.word}</div>
                  <div className="text-xs text-gray-400">{w.translation}</div>
                </div>
                <span className="text-[10px] text-gray-500 uppercase">{w.level}</span>
              </div>
            ))}
            {!words.length && <p className="text-gray-400 text-sm">No words saved yet for this dialect.</p>}
          </div>
        )}
      </div>

      <button onClick={() => setShowForm(true)} className="fixed right-5 bottom-24 bg-accent rounded-full p-4 shadow-lg">
        <Plus size={22} />
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center z-50 p-4" onClick={() => setShowForm(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submitWord} className="bg-panel rounded-2xl w-full max-w-sm p-5 grid gap-3">
            <h3 className="font-semibold">Add a word</h3>
            <input required placeholder="Word / phrase" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} className="bg-panel2 rounded-xl p-3 outline-none" />
            <input required placeholder="Translation" value={form.translation} onChange={(e) => setForm({ ...form, translation: e.target.value })} className="bg-panel2 rounded-xl p-3 outline-none" />
            <input placeholder="Example sentence (optional)" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} className="bg-panel2 rounded-xl p-3 outline-none" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-xl bg-panel2">Cancel</button>
              <button type="submit" className="flex-1 py-2 rounded-xl bg-accent flex items-center justify-center gap-1"><Check size={16} />Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
