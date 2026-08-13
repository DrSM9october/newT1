import { db } from "../db/index.js";

export function xp(user: string, n: number) {
  db.prepare("UPDATE users SET xp=COALESCE(xp,0)+?,updated_at=? WHERE id=?").run(n, new Date().toISOString(), user);
}

export function level(x: number) {
  return Math.floor(Math.sqrt(Math.max(0, x) / 100)) + 1;
}

// Call once per day of activity to keep the streak counters current.
export function touchStreak(user: string) {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare("SELECT * FROM streaks WHERE user_id=?").get(user) as any;
  if (!row) {
    db.prepare("INSERT INTO streaks(user_id,current_days,best_days,last_activity_date) VALUES(?,1,1,?)").run(user, today);
    return;
  }
  if (row.last_activity_date === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const current = row.last_activity_date === yesterday ? row.current_days + 1 : 1;
  const best = Math.max(row.best_days || 0, current);
  db.prepare("UPDATE streaks SET current_days=?,best_days=?,last_activity_date=? WHERE user_id=?").run(current, best, today, user);
}
