import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { db, getContext } from "./db/index.js";
import { route, status as aiStatus } from "./services/ai-router.js";
import { voices } from "./services/voice-engine.js";
import { analyze } from "./services/pronunciation-engine.js";
import { review } from "./services/srs-engine.js";
import { xp, level, touchStreak } from "./services/gamification-engine.js";
import { DIALECT_LIST, isDialect } from "./services/dialects.js";
import { seedScenarios } from "./services/scenarios-seed.js";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));
const app = express();
const server = createServer(app);
const port = Number(process.env.PORT || 8080);
const env = process.env.NODE_ENV || "production";
const origins = (process.env.ALLOWED_ORIGINS || "").split(",").map((x) => x.trim()).filter(Boolean);
if (env === "production" && !origins.length) process.exit(1);
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  cors({
    origin: (o, cb) => (!o || origins.includes(o) || (env !== "production" && !origins.length) ? cb(null, true) : cb(Error("CORS"))),
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);
app.use(express.json({ limit: "64kb" }));
const lim = rateLimit({ windowMs: 60000, max: 80, standardHeaders: true, legacyHeaders: false });

seedScenarios();

// ---- system ----
app.get("/api/health", (_q, r) => r.json({ status: "ok", version: pkg.version, uptime: process.uptime(), timestamp: new Date().toISOString() }));
app.get("/api/ready", (_q, r) => r.json({ status: "ready" }));
app.get("/api/status", async (_q, r) =>
  r.json({ server: { status: "online", version: pkg.version }, ai: await aiStatus(), tts: { enabled: process.env.TTS_ENABLED === "true", voices: Object.keys(voices) }, database: "sqlite-wal" })
);
app.get("/api/dialects", (_q, r) => r.json({ dialects: DIALECT_LIST }));

// ---- chat ----
app.post("/api/chat", lim, async (q, r) => {
  const user = String(q.body?.userId || "local-user");
  const cid = String(q.body?.conversationId || randomUUID());
  const msg = String(q.body?.message || "").trim();
  const dialect = isDialect(String(q.body?.dialect)) ? q.body.dialect : "american";
  const now = new Date().toISOString();
  if (!msg || msg.length > 5000) return r.status(400).json({ error: "Invalid message" });

  db.prepare("INSERT OR IGNORE INTO users(id,dialect,level,created_at,updated_at) VALUES(?,?,?,?,?)").run(user, dialect, q.body?.level || "A1", now, now);
  db.prepare("INSERT OR IGNORE INTO conversations(id,user_id,dialect,level,mode,created_at,updated_at) VALUES(?,?,?,?,?,?,?)").run(
    cid, user, dialect, q.body?.level || "A1", q.body?.mode || "free", now, now
  );
  db.prepare("INSERT INTO messages(id,conversation_id,role,content,created_at) VALUES(?,?,?,?,?)").run(randomUUID(), cid, "user", msg, now);

  try {
    const x = await route({
      userId: user,
      conversationId: cid,
      message: msg,
      dialect,
      level: q.body?.level || "A1",
      mode: q.body?.mode || "free",
      character: q.body?.character,
      hardware: q.body?.hardware,
      preferLocal: q.body?.preferLocal !== false,
    });
    db.prepare("INSERT INTO messages(id,conversation_id,role,content,created_at) VALUES(?,?,?,?,?)").run(randomUUID(), cid, "assistant", x.text, new Date().toISOString());
    xp(user, 2); // small XP trickle for every exchange
    touchStreak(user);
    return r.json({ ...x, conversationId: cid });
  } catch (e) {
    return r.status(503).json({ error: "No AI engine available" });
  }
});
app.get("/api/conversations/:id", (q, r) => r.json({ messages: getContext(q.params.id, 100) }));

// ---- voice ----
app.post("/api/tts", lim, async (q, r) => {
  if (process.env.TTS_ENABLED !== "true") return r.status(503).json({ error: "TTS disabled" });
  try {
    const { TextToSpeechClient } = await import("@google-cloud/text-to-speech");
    const c = new TextToSpeechClient();
    const d = isDialect(String(q.body?.dialect)) ? q.body.dialect : "american";
    const v = voices[d];
    const [x] = await c.synthesizeSpeech({ input: { text: String(q.body?.text || "") }, voice: v, audioConfig: { audioEncoding: "MP3", speakingRate: Number(q.body?.rate || 1) } });
    const b = Buffer.isBuffer(x.audioContent) ? x.audioContent : Buffer.from(x.audioContent as Uint8Array);
    r.setHeader("Content-Type", "audio/mpeg");
    r.end(b);
  } catch {
    return r.status(502).json({ error: "TTS unavailable" });
  }
});
app.post("/api/pronunciation", lim, (q, r) => {
  const d = isDialect(String(q.body?.dialect)) ? q.body.dialect : "american";
  const result = analyze(String(q.body?.target || ""), String(q.body?.transcript || ""), d);
  const user = String(q.body?.userId || "local-user");
  db.prepare("INSERT INTO pronunciation_attempts(user_id,dialect,target_text,transcript,score,phoneme_errors,problem_words,created_at) VALUES(?,?,?,?,?,?,?,?)").run(
    user, d, String(q.body?.target || ""), String(q.body?.transcript || ""), result.score, JSON.stringify(result.errors), JSON.stringify(result.problemWords), new Date().toISOString()
  );
  return r.json(result);
});

// ---- scenarios / roleplay ----
app.get("/api/scenarios", (q, r) => {
  const dialect = isDialect(String(q.query?.dialect)) ? q.query.dialect : undefined;
  const rows = dialect
    ? db.prepare("SELECT * FROM scenarios WHERE dialect=? ORDER BY difficulty").all(dialect)
    : db.prepare("SELECT * FROM scenarios ORDER BY dialect,difficulty").all();
  return r.json({ scenarios: rows });
});
app.post("/api/scenarios/:id/complete", lim, (q, r) => {
  const user = String(q.body?.userId || "local-user");
  const scenarioId = Number(q.params.id);
  const score = Number(q.body?.score || 0);
  const now = new Date().toISOString();
  db.prepare(
    "INSERT INTO scenario_progress(user_id,scenario_id,completed,score,updated_at) VALUES(?,?,1,?,?) ON CONFLICT(user_id,scenario_id) DO UPDATE SET completed=1,score=MAX(score,excluded.score),updated_at=excluded.updated_at"
  ).run(user, scenarioId, score, now);
  xp(user, 15);
  return r.json({ ok: true });
});

// ---- vocabulary + SRS ----
app.get("/api/vocabulary", (q, r) => {
  const user = String(q.query?.userId || "local-user");
  const dialect = isDialect(String(q.query?.dialect)) ? q.query.dialect : undefined;
  const rows = dialect
    ? db.prepare("SELECT * FROM vocabulary WHERE user_id=? AND dialect=? ORDER BY created_at DESC").all(user, dialect)
    : db.prepare("SELECT * FROM vocabulary WHERE user_id=? ORDER BY created_at DESC").all(user);
  return r.json({ vocabulary: rows });
});
app.post("/api/vocabulary", lim, (q, r) => {
  const user = String(q.body?.userId || "local-user");
  const dialect = isDialect(String(q.body?.dialect)) ? q.body.dialect : "american";
  const { word, translation, example, partOfSpeech, level } = q.body || {};
  if (!word || !translation) return r.status(400).json({ error: "word and translation required" });
  const now = new Date().toISOString();
  const info = db
    .prepare("INSERT OR IGNORE INTO vocabulary(user_id,dialect,word,translation,example,part_of_speech,level,source,created_at) VALUES(?,?,?,?,?,?,?,?,?)")
    .run(user, dialect, word, translation, example || null, partOfSpeech || null, level || "A1", "manual", now);
  const vocabId = info.lastInsertRowid || (db.prepare("SELECT id FROM vocabulary WHERE user_id=? AND dialect=? AND word=?").get(user, dialect, word) as any)?.id;
  const existingCard = db.prepare("SELECT id FROM srs_cards WHERE user_id=? AND vocabulary_id=?").get(user, vocabId);
  if (!existingCard) db.prepare("INSERT INTO srs_cards(user_id,vocabulary_id,due_at,updated_at) VALUES(?,?,?,?)").run(user, vocabId, now, now);
  return r.json({ ok: true, vocabularyId: vocabId });
});

app.get("/api/srs/due", (q, r) => {
  const user = String(q.query?.userId || "local-user");
  const now = new Date().toISOString();
  const rows = db
    .prepare(
      `SELECT srs_cards.id as cardId, srs_cards.interval_days, srs_cards.ease_factor, srs_cards.repetitions, srs_cards.lapses,
              vocabulary.word, vocabulary.translation, vocabulary.example, vocabulary.dialect
       FROM srs_cards JOIN vocabulary ON vocabulary.id = srs_cards.vocabulary_id
       WHERE srs_cards.user_id=? AND srs_cards.due_at<=? ORDER BY srs_cards.due_at LIMIT 30`
    )
    .all(user, now);
  return r.json({ due: rows });
});
app.post("/api/srs/review", lim, (q, r) => {
  const user = String(q.body?.userId || "local-user");
  const cardId = Number(q.body?.cardId);
  const quality = Number(q.body?.quality); // 0-5, SM-2 scale
  const card = db.prepare("SELECT * FROM srs_cards WHERE id=? AND user_id=?").get(cardId, user) as any;
  if (!card) return r.status(404).json({ error: "Card not found" });
  const result = review({ interval: card.interval_days, ease: card.ease_factor, repetitions: card.repetitions, lapses: card.lapses }, quality);
  db.prepare("UPDATE srs_cards SET interval_days=?,ease_factor=?,repetitions=?,lapses=?,last_quality=?,due_at=?,updated_at=? WHERE id=?").run(
    result.interval, result.ease, result.repetitions, result.lapses, quality, result.dueAt, new Date().toISOString(), cardId
  );
  if (quality >= 3) xp(user, 5);
  return r.json({ ok: true, next: result });
});

// ---- gamification / dashboard ----
app.get("/api/dashboard", (q, r) => {
  const user = String(q.query?.userId || "local-user");
  const u = db.prepare("SELECT xp,dialect,level FROM users WHERE id=?").get(user) as any;
  const streak = db.prepare("SELECT current_days,best_days FROM streaks WHERE user_id=?").get(user) as any;
  const wordsLearned = (db.prepare("SELECT COUNT(*) c FROM vocabulary WHERE user_id=?").get(user) as any)?.c || 0;
  const attempts = db.prepare("SELECT AVG(score) a, COUNT(*) c FROM pronunciation_attempts WHERE user_id=?").get(user) as any;
  const totalXp = u?.xp || 0;
  return r.json({
    xp: totalXp,
    level: level(totalXp),
    dialect: u?.dialect || "american",
    cefr: u?.level || "A1",
    streak: { current: streak?.current_days || 0, best: streak?.best_days || 0 },
    wordsLearned,
    pronunciationAccuracy: attempts?.c ? Math.round(attempts.a) : null,
  });
});

app.use((_e: any, _q: any, r: any, _n: any) => r.status(500).json({ error: "Internal server error" }));
server.listen(port, "0.0.0.0", () => console.log(`LinguaAI ${pkg.version} on ${port}`));
