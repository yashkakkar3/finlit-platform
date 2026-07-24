import { useEffect, useState } from 'react';
import { api } from '../api/client';
import LearningPath from '../components/LearningPath';

export default function HomePage() {
  const [tree, setTree] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLearningTree()
      .then((data) => setTree(data.tree))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center">
        <p className="text-coral font-medium">Couldn't load your path.</p>
        <p className="text-ledger/60 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!tree) {
    return <p className="text-center mt-16 text-ledger/50 font-mono text-sm">Loading your path…</p>;
  }

  const nextUnlocked = tree.find((l) => l.state === 'unlocked');

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-16">
      <div className="text-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ledger">Your path</h1>
        <p className="text-ledger/60 text-sm mt-1">
          {nextUnlocked
            ? `Next up: ${nextUnlocked.lesson_title}`
            : 'You\'ve cleared every lesson currently available.'}
        </p>
      </div>

      <LearningPath tree={tree} />
    </div>
  );
}
