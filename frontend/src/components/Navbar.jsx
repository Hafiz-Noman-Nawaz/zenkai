import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Compass, BookOpen, MessageSquare, User as UserIcon, LogOut, Menu, X, Sparkles, ChevronDown, Swords, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export const Navbar = ({ onOpenSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Schedule', path: '/schedule' },
    { name: 'Compare', path: '/compare' },
    { name: 'Tier List', path: '/tierlist' },
    { name: 'Collections', path: '/collections' },
    { name: 'Random', path: '/random' },
    { name: 'My Anime', path: '/my-anime' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          isScrolled
            ? 'py-2.5 px-4'
            : 'py-4 px-4 sm:px-6'
        }`}
      >
        <div className="max-w-[1520px] mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full glass-rainbow shadow-2xl border border-white/10">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-spring">
              <span className="font-display font-black text-white text-lg tracking-tighter">全</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black tracking-widest text-lg text-white group-hover:text-cyan-400 transition-colors uppercase flex items-center gap-1.5">
                ZENKAI
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.5 rounded-md">
                  PRO
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-black/40 backdrop-blur-xl px-2 py-1 rounded-full border border-white/5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-spring ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zenkai-muted hover:text-white hover:bg-white/10'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Simulcast Broadcast Badge */}
            <Link
              to="/schedule"
              className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold font-mono shadow-sm hover:scale-105 transition-spring"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SIMULCAST LIVE</span>
            </Link>

            {/* Quick Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-black/50 hover:bg-black/80 text-zenkai-muted hover:text-white px-3.5 py-1.5 rounded-full border border-white/10 text-xs btn-press transition-spring group shadow-sm"
              title="Search Anime (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 group-hover:text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-medium text-xs">Search...</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono bg-zenkai-bg border border-zenkai-border rounded text-zenkai-dim">
                ⌘K
              </kbd>
            </button>

            {/* In-App Simulcast Notification Bell */}
            <NotificationBell />

            {/* Auth Dropdown or Login Button */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1 pl-2 bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border rounded-full btn-press transition-spring"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-6 h-6 rounded-full bg-indigo-900/40 object-cover ring-2 ring-indigo-500/30"
                  />
                  <span className="text-xs font-semibold text-zenkai-text max-w-[90px] truncate hidden sm:inline">
                    {user.displayName || user.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zenkai-muted mr-1" />
                </button>

                {/* Dropdown Menu with Scale In */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-zenkai-card/95 backdrop-blur-xl border border-zenkai-border rounded-2xl shadow-2xl py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-zenkai-border/50">
                      <p className="text-xs font-bold text-white truncate">{user.displayName || user.username}</p>
                      <p className="text-[11px] text-zenkai-dim truncate">@{user.username}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zenkai-text hover:bg-indigo-600/15 hover:text-indigo-300 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-indigo-400" />
                      My Profile & Taste
                    </Link>

                    <Link
                      to="/my-anime"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zenkai-text hover:bg-indigo-600/15 hover:text-indigo-300 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      My Anime Collection
                    </Link>

                    <Link
                      to="/reviews"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zenkai-text hover:bg-indigo-600/15 hover:text-indigo-300 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      Community Reviews
                    </Link>

                    <div className="border-t border-zenkai-border/50 my-1 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-zenkai-muted hover:text-white px-3 py-1.5 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200"
                >
                  Join Zenkai
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-zenkai-muted hover:text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Floating Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 z-50 rounded-3xl glass-rainbow p-5 flex flex-col gap-3 shadow-2xl border border-white/10 animate-scale-in max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-zenkai-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {isAuthenticated ? (
            <div className="border-t border-white/10 pt-3 flex flex-col gap-1.5">
              <Link
                to="/profile"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zenkai-muted hover:text-white hover:bg-white/5 flex items-center gap-2.5"
              >
                <UserIcon className="w-4 h-4 text-indigo-400" />
                Profile & Statistics
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2.5 text-left"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          ) : (
            <div className="border-t border-white/10 pt-3 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className="py-2.5 text-center text-xs font-bold text-zenkai-muted hover:text-white bg-zenkai-surface/80 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="py-2.5 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md"
              >
                Join Zenkai
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};
