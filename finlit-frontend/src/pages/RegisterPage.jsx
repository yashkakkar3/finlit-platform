import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, displayName);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-3xl font-semibold text-ledger text-center mb-1">
          Ledger<span className="text-mint">Path</span>
        </h1>
        <p className="text-center text-ledger/60 text-sm mb-8">Three minutes a day. That's the whole habit.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ledger mb-1">Display name</label>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-ledger/15 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mint"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ledger mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ledger/15 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mint"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ledger mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ledger/15 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mint"
            />
          </div>

          {error && <p className="text-coral text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mint hover:bg-mint-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ledger/60 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-mint font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
