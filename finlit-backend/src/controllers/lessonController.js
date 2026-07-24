const db = require('../config/db');
const { getLearningTreeForUser, isLessonUnlockedForUser, PASS_THRESHOLD_PCT } = require('../models/progressionEngine');
const { awardLessonCompletion } = require('../models/gamificationEngine');

// GET /api/learning-tree
// Returns every module/lesson annotated with locked/unlocked/passed state.
async function getLearningTree(req, res) {
  try {
    const tree = getLearningTreeForUser(req.user.id);
    res.json({ tree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load learning tree' });
  }
}

// GET /api/lessons/:lessonId
// Returns lesson content + quiz questions (without revealing correct_index).
async function getLesson(req, res) {
  const { lessonId } = req.params;
  try {
    const { exists, unlocked } = isLessonUnlockedForUser(req.user.id, lessonId);
    if (!exists) return res.status(404).json({ error: 'Lesson not found' });
    if (!unlocked) return res.status(403).json({ error: 'This lesson is locked' });

    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId);
    const questions = db
      .prepare('SELECT id, question_text, choices FROM quiz_questions WHERE lesson_id = ?')
      .all(lessonId)
      .map(q => ({ ...q, choices: JSON.parse(q.choices) }));

    res.json({ lesson, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load lesson' });
  }
}

// POST /api/lessons/:lessonId/submit
// Body: { answers: [{ question_id, selected_index }, ...] }
// Grades the quiz server-side, applies the 80% pass rule, and if
// passed for the first time, awards XP + updates streak.
async function submitQuiz(req, res) {
  const { lessonId } = req.params;
  const { answers } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'answers array is required' });
  }

  try {
    const { exists, unlocked } = isLessonUnlockedForUser(userId, lessonId);
    if (!exists) return res.status(404).json({ error: 'Lesson not found' });
    if (!unlocked) return res.status(403).json({ error: 'This lesson is locked' });

    const questions = db
      .prepare('SELECT id, correct_index FROM quiz_questions WHERE lesson_id = ?')
      .all(lessonId);
    if (questions.length === 0) {
      return res.status(400).json({ error: 'No quiz questions configured for this lesson' });
    }

    const correctByQuestion = Object.fromEntries(questions.map(q => [q.id, q.correct_index]));
    let correctCount = 0;
    for (const a of answers) {
      if (correctByQuestion[a.question_id] === a.selected_index) correctCount++;
    }
    const scorePct = Math.round((correctCount / questions.length) * 100 * 100) / 100;
    const passed = scorePct >= PASS_THRESHOLD_PCT;

    const existingProgress = db
      .prepare('SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?')
      .get(userId, lessonId);
    const alreadyPassed = !!existingProgress?.passed;
    const bestScore = Math.max(scorePct, existingProgress?.best_score_pct || 0);
    const nowIso = new Date().toISOString();

    if (existingProgress) {
      db.prepare(
        `UPDATE user_progress
         SET best_score_pct = ?, passed = ?, attempts = attempts + 1,
             completed_at = CASE WHEN ? THEN ? ELSE completed_at END
         WHERE user_id = ? AND lesson_id = ?`
      ).run(bestScore, (passed || alreadyPassed) ? 1 : 0, passed ? 1 : 0, nowIso, userId, lessonId);
    } else {
      db.prepare(
        `INSERT INTO user_progress (user_id, lesson_id, best_score_pct, passed, attempts, completed_at)
         VALUES (?, ?, ?, ?, 1, ?)`
      ).run(userId, lessonId, scorePct, passed ? 1 : 0, passed ? nowIso : null);
    }

    let gamification = null;
    // Only award XP the FIRST time a lesson is passed — avoids
    // farming XP by re-submitting an already-passed quiz.
    if (passed && !alreadyPassed) {
      const { xp_reward } = db.prepare('SELECT xp_reward FROM lessons WHERE id = ?').get(lessonId);
      gamification = awardLessonCompletion(userId, lessonId, xp_reward);
    }

    res.json({
      score_pct: scorePct,
      correct_count: correctCount,
      total_questions: questions.length,
      passed,
      pass_threshold_pct: PASS_THRESHOLD_PCT,
      xp_awarded: gamification?.xp_awarded ?? 0,
      new_streak: gamification?.new_streak ?? null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
}

module.exports = { getLearningTree, getLesson, submitQuiz };
