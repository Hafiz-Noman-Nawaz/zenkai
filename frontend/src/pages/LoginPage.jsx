import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Sparkles, Loader2, User, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;

    setLoading(true);
    const credentials = identifier.includes('@')
      ? { email: identifier.trim(), password }
      : { username: identifier.trim(), password };

    const result = await login(credentials);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  const handleQuickDemo = async (type) => {
    setLoading(true);
    const result = await demoLogin(type);
    setLoading(false);
    if (result.success) {
      navigate(from, { replace: true });
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
          Welcome Back to Zenkai
        </h1>
        <p className="text-xs text-zenkai-muted">
          Access your personal anime library, custom ratings, and viewing statistics.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zenkai-surface/90 border border-zenkai-border shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-1.5">
              Username or Email Address
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="demo@zenkai.dev or demo_user"
                className="w-full bg-zenkai-card border border-zenkai-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zenkai-muted block mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>Sign In to Zenkai</span>
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        <div className="space-y-3 pt-3 border-t border-zenkai-border/70">
          <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Test Accounts (1-Click)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('demo')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-zenkai-card hover:bg-indigo-600/20 border border-zenkai-border hover:border-indigo-500/40 text-center transition-all group"
            >
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Demo Otaku</p>
              <p className="text-[10px] text-zenkai-dim">10+ Titles</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('sakura')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-zenkai-card hover:bg-indigo-600/20 border border-zenkai-border hover:border-indigo-500/40 text-center transition-all group"
            >
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Sakura</p>
              <p className="text-[10px] text-zenkai-dim">Fantasy Lover</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('master')}
              disabled={loading}
              className="p-2.5 rounded-xl bg-zenkai-card hover:bg-indigo-600/20 border border-zenkai-border hover:border-indigo-500/40 text-center transition-all group"
            >
              <p className="text-xs font-bold text-white group-hover:text-indigo-300">Kenji</p>
              <p className="text-[10px] text-zenkai-dim">Classic Archivist</p>
            </button>
          </div>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="text-center text-xs text-zenkai-muted">
        <span>Don't have a Zenkai account yet? </span>
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline ml-1">
          Create an account
        </Link>
      </div>
    </div>
  );
};
