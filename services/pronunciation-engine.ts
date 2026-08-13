import { DIALECTS, type DialectCode } from "./dialects.js";

export function analyze(target: string, said: string, dialect: DialectCode) {
  const a = target.toLowerCase().split(/\s+/).filter(Boolean);
  const b = said.toLowerCase().split(/\s+/).filter(Boolean);
  const max = Math.max(a.length, b.length, 1);
  let ok = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) ok++;

  const errors: string[] = [];
  if (b.length < a.length) errors.push("deletion");
  if (b.length > a.length) errors.push("insertion");
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) errors.push("substitution");

  const problemWords = a.filter((w, i) => b[i] !== w).slice(0, 10);
  const info = DIALECTS[dialect] || DIALECTS.american;

  return {
    score: Math.round((ok / max) * 100),
    errors: [...new Set(errors)],
    problemWords,
    phonemeFocus: info.phonemeFocus,
    recommendations: problemWords.slice(0, 5).map((w) => `Practice "${w}" — focus on: ${info.phonemeFocus.join(", ")}`),
  };
}
