# LinguaAI — Polyglot Core

Offline-first hybrid language tutor. Ollama/Qwen local-first AI with Gemini
fallback, SQLite WAL storage, 8 dialect/language engines, Google Cloud TTS +
Web Speech STT, pronunciation scoring, SM-2 spaced repetition, roleplay
scenarios, gamification (XP/streak), and a Capacitor Android shell with
physical back-button handling.

## Quick start

```bash
npm install
cp .env.example .env        # fill in GEMINI_API_KEY / GOOGLE_APPLICATION_CREDENTIALS as needed
npm run db:migrate
npm run dev:server           # API on :8080
npm run dev                  # Vite dev server on :5173
```

## What's implemented in this pass

- 8 dialects: American English, Shami (Levantine), Egyptian, Gulf (Khaleeji),
  Maghrebi, Darija (Moroccan), Iraqi, Lebanese — each with its own system
  prompt, TTS voice, STT locale, and phoneme-focus list (`services/dialects.ts`).
- Hybrid AI router: Ollama/Qwen2.5 first, Gemini fallback (`GEMINI_MODEL`
  defaults to `gemini-3.6-flash` per spec — override in `.env` if your
  Gemini API project uses a different model name).
- Roleplay: 5 scenario templates × 8 dialects, seeded on server start;
  `ScenariosView` → tapping a scenario drops you into `ChatView` in roleplay
  mode with the scenario as system context.
- SRS: SM-2 algorithm (existing `services/srs-engine.ts`) wired to a
  flip-card review UI (`PhrasesView`) plus a manual vocabulary add form.
- Pronunciation scoring endpoint (`/api/pronunciation`) with dialect-specific
  phoneme hints; attempts are logged to `pronunciation_attempts`.
- Gamification: XP trickle per chat turn + SRS review, daily streak
  tracking, level curve — surfaced in `ProgressView`.
- Settings modal for dialect + CEFR level, persisted to `localStorage` and
  sent with every API call.
- Capacitor: `appId` set to `com.linguaai.dialect`; physical back button
  closes modals → exits roleplay → returns to Chat tab → minimizes app.
- `.github/workflows/build-apk.yml`: Java 21 + Gradle debug APK build,
  uploaded as a workflow artifact.
- Tailwind CSS + Vazirmatn (RTL/Persian) and Plus Jakarta Sans fonts.

## Scoped out of this pass (from the 180-item list)

This backend/frontend covers the core learning loop end to end, but the
full spec is a multi-month product surface. Not built yet, in rough
priority order: auth/JWT + 2FA/OAuth, WebSocket live features & push
notifications, full offline mode with IndexedDB + sync/conflict
resolution, social features (follow/leaderboard/groups/forums), content
moderation & versioning, analytics/A-B testing, advanced NLP (sentiment,
NER, topic modeling), and CI test suites (unit/integration/E2E/load/
security/accessibility). The database schema (`db/index.ts`) already has
tables for most of these so they can be built incrementally without a
migration rewrite.

## Android build

```bash
npx cap add android   # first time only
npm run cap:build
npx cap open android
```
