import { db } from "../db/index.js";
import { DIALECT_LIST } from "./dialects.js";

// Seeds the 5 core roleplay scenario templates (cafe, airport, taxi, market,
// job interview) for every dialect, once, idempotently.
const TEMPLATES: { code: string; title: string; context: string; difficulty: number }[] = [
  { code: "cafe", title: "Ordering at a Cafe", context: "You walk into a busy cafe and order a drink and a snack, then pay.", difficulty: 1 },
  { code: "airport", title: "At the Airport", context: "You check in for a flight, go through security, and ask about your gate.", difficulty: 2 },
  { code: "taxi", title: "Taking a Taxi", context: "You hail a taxi, explain your destination, and negotiate/confirm the fare.", difficulty: 2 },
  { code: "market", title: "Bargaining at the Market", context: "You browse a local market stall, ask prices, and negotiate a better deal.", difficulty: 3 },
  { code: "interview", title: "Job Interview", context: "You're interviewed for an entry-level job: introduce yourself, discuss experience, ask questions.", difficulty: 4 },
];

export function seedScenarios() {
  const insert = db.prepare(
    "INSERT OR IGNORE INTO scenarios(code,dialect,title,context,difficulty) VALUES(?,?,?,?,?)"
  );
  const tx = db.transaction(() => {
    for (const dialect of DIALECT_LIST) {
      for (const t of TEMPLATES) {
        insert.run(`${t.code}_${dialect.code}`, dialect.code, t.title, t.context, t.difficulty);
      }
    }
  });
  tx();
}
