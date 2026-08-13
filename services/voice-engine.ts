import { DIALECTS, type DialectCode } from "./dialects.js";

export const voices: Record<DialectCode, { languageCode: string; name: string }> =
  Object.fromEntries(
    Object.values(DIALECTS).map((d) => [
      d.code,
      { languageCode: d.ttsLanguageCode, name: d.ttsVoiceName },
    ])
  ) as any;

export function speechSupported() {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

export function startSpeech(cb: (text: string) => void, end?: () => void, lang = "en-US") {
  const C = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!C) throw Error("WEB_SPEECH_UNAVAILABLE");
  const r = new C();
  r.lang = lang;
  r.interimResults = true;
  r.onresult = (e: any) => {
    let s = "";
    for (let i = e.resultIndex; i < e.results.length; i++) s += e.results[i][0].transcript;
    cb(s);
  };
  r.onend = () => end?.();
  r.start();
  return () => {
    try {
      r.stop();
    } catch {}
  };
}
