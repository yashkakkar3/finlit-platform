import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLeaderboard()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="text-center mt-16 text-coral">{error}</p>;
  }

  if (!data) {
    return <p className="text-center mt-16 text-ledger/50 font-mono text-sm">Loading leaderboard…</p>;
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-8 pb-16">
      <h1 className="font-display text-2xl font-semibold text-ledger mb-1">This week's leaders</h1>
      <p className="text-ledger/50 text-sm font-mono mb-6">Week of {data.week_start}</p>

      {data.leaderboard.length === 0 ? (
        <p className="text-ledger/60">No XP earned yet this week — be the first.</p>
      ) : (
        <ol className="space-y-2">
          {data.leaderboard.map((entry, i) => (
            <li
              key={i}
              className="flex items-center justify-between bg-white rounded-lg px-4 py-3 shadow-sm border border-ledger/5"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-ledger/40 w-6 text-right">{i + 1}</span>
                <span className="font-medium text-ledger">{entry.display_name}</span>
              </div>
              <span className="font-mono text-mint-dark font-semibold">{entry.xp_earned} XP</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
