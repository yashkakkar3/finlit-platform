import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { applyGamificationDelta } = useAuth();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [phase, setPhase] = useState('reading'); // reading | quiz | result
  const [answers, setAnswers] = useState({});
  const [selectedForFeedback, setSelectedForFeedback] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setPhase('reading');
    setAnswers({});
    setResult(null);
    api.getLesson(lessonId)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [lessonId]);

  function selectAnswer(questionId, choiceIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceIndex }));
    setSelectedForFeedback(questionId);
    setTimeout(() => setSelectedForFeedback(null), 250);
  }

  async function handleSubmit() {
    const payload = Object.entries(answers).map(([question_id, selected_index]) => ({
      question_id: Number(question_id),
      selected_index,
    }));
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(lessonId, payload);
      setResult(res);
      setPhase('result');
      if (res.xp_awarded > 0) {
        applyGamificationDelta(res.xp_awarded, res.new_streak);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <p className="text-coral font-medium">{error}</p>
        <Link to="/" className="text-mint text-sm font-medium hover:underline mt-3 inline-block">
          Back to your path
        </Link>
      </div>
    );
  }

  if (!data) {
    return <p className="text-center mt-16 text-ledger/50 font-mono text-sm">Loading lesson…</p>;
  }

  const allAnswered = data.questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-16">
      {phase === 'reading' && (
        <div>
          <h1 className="font-display text-2xl font-semibold text-ledger mb-3">{data.lesson.title}</h1>
          <p className="text-ledger/80 leading-relaxed">{data.lesson.content}</p>
          <button
            onClick={() => setPhase('quiz')}
            className="mt-8 w-full bg-mint hover:bg-mint-dark text-white font-medium py-3 rounded-lg transition-colors"
          >
            Start quiz
          </button>
        </div>
      )}

      {phase === 'quiz' && (
        <div>
          <h1 className="font-display text-xl font-semibold text-ledger mb-6">{data.lesson.title}: Quiz</h1>

          <div className="space-y-6">
            {data.questions.map((q) => (
              <div key={q.id}>
                <p className="font-medium text-ledger mb-2">{q.question_text}</p>
                <div className="grid gap-2">
                  {q.choices.map((choice, idx) => {
                    const isSelected = answers[q.id] === idx;
                    const justClicked = selectedForFeedback === q.id && isSelected;
                    return (
                      <button
                        key={idx}
                        onClick={() => selectAnswer(q.id, idx)}
                        className={`text-left px-4 py-2.5 rounded-lg border transition-colors ${
                          isSelected
                            ? justClicked
                              ? 'bg-mint text-white border-mint'
                              : 'bg-mint-light border-mint text-ledger'
                            : 'border-ledger/15 hover:border-mint/50 text-ledger/80'
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="mt-8 w-full bg-ledger hover:bg-ledger-light text-paper font-medium py-3 rounded-lg transition-colors disabled:opacity-40"
          >
            {submitting ? 'Grading…' : 'Submit answers'}
          </button>
        </div>
      )}

      {phase === 'result' && result && (
        <div className="text-center">
          <div className={`text-5xl mb-4 ${result.passed ? '' : ''}`} aria-hidden="true">
            {result.passed ? '🎉' : '📉'}
          </div>
          <h1 className="font-display text-2xl font-semibold text-ledger mb-1">
            {result.passed ? 'Passed!' : 'Not quite'}
          </h1>
          <p className="font-mono text-ledger/70 mb-1">
            {result.correct_count}/{result.total_questions} correct — {result.score_pct}%
          </p>
          <p className="text-ledger/50 text-sm mb-6">
            Passing requires {result.pass_threshold_pct}%
          </p>

          {result.xp_awarded > 0 && (
            <p className="inline-flex items-center gap-1.5 bg-gold-light text-ledger px-4 py-1.5 rounded-full font-mono text-sm font-medium mb-6">
              <span aria-hidden="true">🪙</span> +{result.xp_awarded} XP earned
            </p>
          )}

          <div className="flex gap-3 justify-center">
            {!result.passed && (
              <button
                onClick={() => { setPhase('quiz'); setResult(null); setAnswers({}); }}
                className="px-5 py-2.5 rounded-lg border border-ledger/20 text-ledger font-medium hover:border-ledger/40 transition-colors"
              >
                Try again
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-lg bg-mint hover:bg-mint-dark text-white font-medium transition-colors"
            >
              Back to path
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
