import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <header className="bg-ledger text-paper sticky top-0 z-10 shadow-md">
      <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          Ledger<span className="text-mint">Path</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-coral/20 px-3 py-1 rounded-full">
            <span aria-hidden="true">🔥</span>
            <span className="font-mono text-sm font-medium">{user.streak_count}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-gold/20 px-3 py-1 rounded-full">
            <span aria-hidden="true">🪙</span>
            <span className="font-mono text-sm font-medium">{user.xp_total} XP</span>
          </div>

          <Link
            to="/leaderboard"
            className="text-sm font-medium text-paper/80 hover:text-paper transition-colors"
          >
            Leaderboard
          </Link>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-sm font-medium text-paper/60 hover:text-coral transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
