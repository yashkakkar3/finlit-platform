const db = require('../config/db');

const PASS_THRESHOLD_PCT = 80;

/**
 * Returns every lesson across all modules in strict global order
 * (module.order_index, then lesson.order_index within it).
 * This ordering is the single source of truth for "what comes next".
 */
function getGlobalLessonOrder() {
  return db.prepare(`
    SELECT
      l.id AS lesson_id, l.title AS lesson_title, l.xp_reward, l.order_index AS lesson_order,
      m.id AS module_id, m.title AS module_title, m.order_index AS module_order
    FROM lessons l
    JOIN modules m ON l.module_id = m.id
    ORDER BY m.order_index ASC, l.order_index ASC
  `).all();
}

/**
 * Builds the full learning tree for a user, annotating each lesson
 * with its state: 'passed', 'unlocked' (available now), or 'locked'.
 *
 * Rule: lesson[0] is always unlocked. lesson[n] unlocks only once
 * lesson[n-1] has passed >= 80%. This directly encodes the doc's
 * requirement that users can't jump ahead (e.g. straight to
 * "Options Trading" without finishing "Budgeting 101").
 */
function getLearningTreeForUser(userId) {
  const globalLessons = getGlobalLessonOrder();

  const progressRows = db
    .prepare('SELECT lesson_id, best_score_pct, passed, attempts FROM user_progress WHERE user_id = ?')
    .all(userId);
  const progressByLesson = Object.fromEntries(progressRows.map(p => [p.lesson_id, p]));

  const tree = [];
  let previousPassed = true; // first lesson overall is always unlocked

  for (const lesson of globalLessons) {
    const progress = progressByLesson[lesson.lesson_id];
    const passed = !!progress?.passed;

    let state;
    if (passed) state = 'passed';
    else if (previousPassed) state = 'unlocked';
    else state = 'locked';

    tree.push({
      lesson_id: lesson.lesson_id,
      lesson_title: lesson.lesson_title,
      xp_reward: lesson.xp_reward,
      module_id: lesson.module_id,
      module_title: lesson.module_title,
      state,
      best_score_pct: progress?.best_score_pct ?? 0,
      attempts: progress?.attempts ?? 0,
    });

    previousPassed = passed;
  }

  return tree;
}

/**
 * Checks whether a specific lesson is currently unlocked for a user,
 * by walking the global order up to that lesson. Used server-side
 * as a guard before accepting a quiz submission — never trust the
 * client to only submit for unlocked lessons.
 */
function isLessonUnlockedForUser(userId, lessonId) {
  const tree = getLearningTreeForUser(userId);
  const entry = tree.find(l => l.lesson_id === Number(lessonId));
  if (!entry) return { exists: false, unlocked: false };
  return { exists: true, unlocked: entry.state === 'unlocked' || entry.state === 'passed' };
}

module.exports = {
  PASS_THRESHOLD_PCT,
  getGlobalLessonOrder,
  getLearningTreeForUser,
  isLessonUnlockedForUser,
};
