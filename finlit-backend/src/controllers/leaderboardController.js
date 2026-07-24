const db = require('../config/db');

// GET /api/leaderboard?week=2026-07-20 (optional; defaults to current week)
// Reads the precomputed weekly_leaderboard_xp table (fast — no live
// aggregation on every request; that's the scheduled job's job).
async function getWeeklyLeaderboard(req, res) {
  try {
    const weekStart = req.query.week || getMondayOfCurrentWeek();

    const rows = db.prepare(
      `SELECT u.display_name, w.xp_earned
       FROM weekly_leaderboard_xp w
       JOIN users u ON u.id = w.user_id
       WHERE w.week_start = ?
       ORDER BY w.xp_earned DESC
       LIMIT 50`
    ).all(weekStart);

    res.json({ week_start: weekStart, leaderboard: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
}

function getMondayOfCurrentWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

module.exports = { getWeeklyLeaderboard, getMondayOfCurrentWeek };
