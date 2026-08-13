const viteEnv =
  typeof import.meta !== "undefined" &&
  typeof (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env === "object"
    ? (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    : undefined;

export const SERVER_URL = (viteEnv?.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

async function get<T>(p: string, o: RequestInit = {}, ms = 60000): Promise<T> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(SERVER_URL + p, { ...o, signal: c.signal, headers: { Accept: "application/json", ...(o.headers || {}) } });
    if (!r.ok) throw Error(await r.text());
    return (await r.json()) as T;
  } finally {
    clearTimeout(t);
  }
}
const post = <T>(p: string, body: any, ms = 60000) =>
  get<T>(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }, ms);

const userId = () => {
  let id = localStorage.getItem("linguaai_user");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("linguaai_user", id);
  }
  return id;
};

export const health = () => get<any>("/api/health", {}, 8000);
export const status = () => get<any>("/api/status", {}, 10000);
export const dialects = () => get<any>("/api/dialects", {}, 10000);

export const chat = (message: string, o: any = {}) =>
  post<any>("/api/chat", {
    message,
    userId: o.userId || userId(),
    conversationId: o.conversationId,
    dialect: o.dialect || "american",
    level: o.level || "A1",
    mode: o.mode || "free",
    character: o.character,
    preferLocal: o.preferLocal !== false,
    hardware: { memoryGB: (navigator as any).deviceMemory || 4, cores: navigator.hardwareConcurrency || 4 },
  });

export async function tts(text: string, dialect = "american") {
  const r = await fetch(SERVER_URL + "/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, dialect }),
  });
  if (!r.ok) throw Error(await r.text());
  return r.arrayBuffer();
}

export const scenarios = (dialect?: string) => get<any>(`/api/scenarios${dialect ? `?dialect=${dialect}` : ""}`, {}, 10000);
export const completeScenario = (id: number, score: number) => post<any>(`/api/scenarios/${id}/complete`, { userId: userId(), score });

export const vocabulary = (dialect?: string) => get<any>(`/api/vocabulary?userId=${userId()}${dialect ? `&dialect=${dialect}` : ""}`, {}, 10000);
export const addVocabulary = (word: string, translation: string, dialect: string, example?: string) =>
  post<any>("/api/vocabulary", { userId: userId(), word, translation, dialect, example });

export const srsDue = () => get<any>(`/api/srs/due?userId=${userId()}`, {}, 10000);
export const srsReview = (cardId: number, quality: number) => post<any>("/api/srs/review", { userId: userId(), cardId, quality });

export const pronunciation = (target: string, transcript: string, dialect: string) =>
  post<any>("/api/pronunciation", { userId: userId(), target, transcript, dialect });

export const dashboard = () => get<any>(`/api/dashboard?userId=${userId()}`, {}, 10000);

export const getUserId = userId;
