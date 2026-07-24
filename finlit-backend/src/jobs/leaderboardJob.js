const cron = require('node-cron');
const db = require('../config/db');
const { getMondayOfCurrentWeek } = require('../controllers/leaderboardController');

/**
 * "A scheduled backend job aggregates weekly XP across all users
 * to populate the competitive Leaderboard." — from the doc.
 *
 * Sums xp_ledger entries earned since Monday of the current week,
 * per user, and upserts into weekly_leaderboard_xp. Reading from
 * the ledger (not users.xp_total) means the leaderboard only ever
 * reflects XP earned in this specific week.
 */
function aggregateWeeklyXp() {
  const weekStart = getMondayOfCurrentWeek();

  const rows = db.prepare(
    `SELECT user_id, SUM(xp_amount) AS xp_earned
     FROM xp_ledger
     WHERE earned_at >= ?
     GROUP BY user_id`
  ).all(weekStart);

  const upsert = db.prepare(
    `INSERT INTO weekly_leaderboard_xp (user_id, week_start, xp_earned)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, week_start) DO UPDATE SET xp_earned = excluded.xp_earned`
  );

  db.withTransaction(() => {
    for (const row of rows) {
      upsert.run(row.user_id, weekStart, row.xp_earned);
    }
  });

  console.log(`[leaderboardJob] Aggregated weekly XP for ${rows.length} users (week of ${weekStart})`);
}

// Runs every hour — frequent enough for a live hackathon demo,
// cheap enough not to matter at MVP scale.
function startLeaderboardJob() {
  cron.schedule('0 * * * *', () => {
    try {
      aggregateWeeklyXp();
    } catch (err) {
      console.error('[leaderboardJob] failed:', err);
    }
  });
  console.log('[leaderboardJob] Scheduled (hourly)');
}

module.exports = { aggregateWeeklyXp, startLeaderboardJob };
