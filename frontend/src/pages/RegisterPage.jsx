import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Sparkles, Loader2, User, Mail, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    setLoading(true);
    const result = await register({
      username: username.trim(),
      email: email.trim(),
      displayName: displayName.trim() || undefined,
      password,
    });
    setLoading(false);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="py-12 sm:py-16 max-w-md mx-auto space-y-8 animate-fade-in">
      {/* Brand Icon & Heading */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/20 mb-3">
          <span className="font-display font-black text-white text-xl">全</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
          Join the Zenkai Community
        </h1>
        <p className="text-xs text-zenkai-muted">
          Create your personalized profile and begin logging your anime history.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zenkai-surface/90 border border-zenkai-border shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-1.5">
              Unique Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. otaku_voyager"
                className="w-full bg-zenkai-card border border-zenkai-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full bg-zenkai-card border border-zenkai-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-1.5">
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-zenkai-card border border-zenkai-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 disabled:opacity-50 transition-all mt-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span>Create Free Account</span>
          </button>
        </form>
      </div>

      {/* Switch to Login */}
      <div className="text-center text-xs text-zenkai-muted">
        <span>Already have an account? </span>
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1">
          Sign In
        </Link>
      </div>
    </div>
  );
};
