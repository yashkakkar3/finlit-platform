const db = require('../config/db');

const MS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Applies the streak rule from the doc:
 * - If last_active_timestamp was within the last 24h, increment streak.
 * - If it's been longer than 24h (or there's no prior activity), the
 *   streak resets to 1 (missed day breaks it / first ever session).
 */
function computeUpdatedStreak(lastActiveTimestamp, now = new Date()) {
  if (!lastActiveTimestamp) return 'first';

  const last = new Date(lastActiveTimestamp);
  const elapsed = now.getTime() - last.getTime();

  return elapsed <= MS_IN_DAY ? 'increment' : 'reset';
}

/**
 * Awards XP for a completed lesson and updates streak + last_active
 * in a single DB transaction, then logs the event to xp_ledger for
 * the weekly leaderboard job to aggregate later.
 */
function awardLessonCompletion(userId, lessonId, xpAmount) {
  return db.withTransaction(() => {
    const user = db
      .prepare('SELECT streak_count, last_active_timestamp FROM users WHERE id = ?')
      .get(userId);

    const now = new Date();
    const nowIso = now.toISOString();
    const action = computeUpdatedStreak(user.last_active_timestamp, now);
    const newStreak = action === 'increment' ? user.streak_count + 1 : 1;

    db.prepare(
      `UPDATE users
       SET xp_total = xp_total + ?, streak_count = ?, last_active_timestamp = ?
       WHERE id = ?`
    ).run(xpAmount, newStreak, nowIso, userId);

    db.prepare(
      'INSERT INTO xp_ledger (user_id, lesson_id, xp_amount, earned_at) VALUES (?, ?, ?, ?)'
    ).run(userId, lessonId, xpAmount, nowIso);

    return { xp_awarded: xpAmount, new_streak: newStreak };
  });
}

module.exports = { computeUpdatedStreak, awardLessonCompletion };
