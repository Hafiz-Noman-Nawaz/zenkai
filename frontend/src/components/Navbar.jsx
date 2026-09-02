import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  BookOpen,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Swords,
  Layers,
  Calendar,
  Shuffle,
  BarChart3,
  Film,
  Zap,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { ZenkaiOracleModal } from './ZenkaiOracleModal';
import { soundFX } from '../utils/soundEffects';

export const Navbar = ({ onOpenSearch }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);

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
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'Schedule', path: '/schedule', icon: Calendar },
    { name: 'Compare', path: '/compare', icon: Layers },
    { name: 'Tier List', path: '/tierlist', icon: BarChart3 },
    { name: 'Collections', path: '/collections', icon: Film },
    { name: 'Randomizer', path: '/random', icon: Shuffle },
    { name: 'My Anime', path: '/my-anime', icon: BookOpen },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    if (!isMobileMenuOpen) {
      soundFX.playEpisodeChime();
    } else {
      soundFX.playClick();
    }
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'py-2 px-3 sm:px-4'
            : 'py-3 sm:py-4 px-3 sm:px-6'
        }`}
      >
        <div className="max-w-[1520px] mx-auto flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full glass-rainbow shadow-2xl border border-white/10 relative">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-spring">
              <span className="font-display font-black text-white text-base sm:text-lg tracking-tighter">全</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black tracking-widest text-base sm:text-lg text-white group-hover:text-cyan-400 transition-colors uppercase flex items-center gap-1 sm:gap-1.5">
                ZENKAI
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1 sm:px-1.5 py-0.5 rounded-md">
                  PRO
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-black/40 backdrop-blur-xl px-2 py-1 rounded-full border border-white/5">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-spring ${
                location.pathname === '/'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zenkai-muted hover:text-white hover:bg-white/10'
              }`}
            >
              Home
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-spring ${
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
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Vibe Discovery Engine (Oracle) Button - Desktop */}
            <button
              onClick={() => {
                soundFX.playEpisodeChime();
                setIsOracleOpen(true);
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-cyan-500/30 hover:from-purple-600/50 hover:to-cyan-500/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all shadow-md shadow-purple-500/10 btn-press group cursor-pointer"
              title="Zenkai Vibe Discovery Engine"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span className="font-mono">Vibe Match</span>
            </button>

            {/* Quick Search Button */}
            <button
              onClick={() => {
                soundFX.playClick();
                onOpenSearch?.();
              }}
              className="flex items-center gap-1.5 bg-black/50 hover:bg-black/80 text-zenkai-muted hover:text-white p-2 sm:px-3 sm:py-1.5 rounded-full border border-white/10 text-xs btn-press transition-spring group shadow-sm cursor-pointer"
              title="Search Anime (Ctrl+K)"
            >
              <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 group-hover:text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-medium text-xs">Search</span>
              <kbd className="hidden md:inline-block ml-0.5 px-1.5 py-0.5 text-[9px] font-mono bg-zenkai-bg border border-zenkai-border rounded text-zenkai-dim">
                ⌘K
              </kbd>
            </button>

            {/* In-App Simulcast Notification Bell */}
            <NotificationBell />

            {/* Auth Dropdown or Login Button (Desktop) */}
            {isAuthenticated ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border rounded-full btn-press transition-spring cursor-pointer"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-6 h-6 rounded-full bg-indigo-900/40 object-cover ring-2 ring-indigo-500/30"
                  />
                  <span className="text-xs font-semibold text-zenkai-text max-w-[80px] truncate hidden md:inline">
                    {user.displayName || user.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zenkai-muted mr-1" />
                </button>

                {/* Dropdown Menu */}
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
                      Otaku Passport & Profile
                    </Link>

                    <Link
                      to="/my-anime"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zenkai-text hover:bg-indigo-600/15 hover:text-indigo-300 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      My Anime Library
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
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-zenkai-muted hover:text-white px-2.5 py-1.5 rounded-full transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-full shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Anime-Themed Animated Mobile Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-xl bg-zenkai-surface/80 hover:bg-zenkai-elevated text-zenkai-text hover:text-cyan-400 border border-white/10 transition-all cursor-pointer relative overflow-hidden group shadow-sm"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-rose-400 animate-spin-once" />
              ) : (
                <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Luxury Anime Mobile Navigation Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-xl animate-fade-in flex flex-col justify-end sm:justify-center p-3 sm:p-6">
          <div
            className="w-full max-w-lg mx-auto bg-gradient-to-b from-zenkai-card via-zenkai-surface to-[#080a12] border border-indigo-500/40 rounded-3xl shadow-2xl p-5 sm:p-6 flex flex-col max-h-[85vh] overflow-hidden relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Katana Slash Animated Energy Sheen */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-purple-500 animate-katana-slash" />

            {/* Drawer Header with Close & Brand */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  全
                </div>
                <div>
                  <h4 className="font-display font-black text-sm text-white tracking-wider uppercase">
                    ZENKAI PORTAL
                  </h4>
                  <p className="text-[10px] font-mono text-cyan-400">
                    Otaku Navigation Matrix
                  </p>
                </div>
              </div>

              <button
                onClick={toggleMobileMenu}
                className="p-1.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Portals Grid */}
            <div className="py-3 border-b border-white/10 grid grid-cols-2 gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsOracleOpen(true);
                }}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 text-purple-200 text-xs font-bold hover:border-purple-400 transition-all text-left"
              >
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <div className="min-w-0">
                  <span className="block truncate text-[11px]">Vibe Discovery</span>
                  <span className="block text-[9px] text-purple-300/70 font-mono">Smart Matching</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSearch?.();
                }}
                className="flex items-center gap-2 p-2.5 rounded-2xl bg-zenkai-surface hover:bg-zenkai-elevated border border-white/10 text-white text-xs font-bold transition-all text-left"
              >
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block truncate text-[11px]">Instant Search</span>
                  <span className="block text-[9px] text-zenkai-dim font-mono">10,000+ Titles</span>
                </div>
              </button>
            </div>

            {/* Main Navigation Scrollable Links */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1 hide-scrollbar">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === '/'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zenkai-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Home Overview
                </span>
                <span className="text-[10px] font-mono opacity-60">01</span>
              </Link>

              {navLinks.map((link, idx) => {
                const IconComponent = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-zenkai-muted hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <IconComponent className={`w-4 h-4 ${active ? 'text-white' : 'text-indigo-400'}`} />
                      {link.name}
                    </span>
                    <span className="text-[10px] font-mono opacity-60">0{idx + 2}</span>
                  </Link>
                );
              })}
            </div>

            {/* Auth / Profile Footer */}
            <div className="pt-3 border-t border-white/10 shrink-0">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-zenkai-surface border border-zenkai-border hover:border-indigo-500/50 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                        alt={user.username}
                        className="w-8 h-8 rounded-xl bg-indigo-950 object-cover ring-1 ring-indigo-500/40"
                      />
                      <div className="min-w-0">
                        <span className="block font-bold text-xs text-white truncate">
                          {user.displayName || user.username}
                        </span>
                        <span className="block text-[10px] text-cyan-400 font-mono">
                          View Otaku Passport
                        </span>
                      </div>
                    </div>
                    <UserIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                  </Link>

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-zenkai-muted hover:text-white bg-zenkai-surface rounded-xl border border-zenkai-border"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 text-center text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30"
                  >
                    Join Zenkai
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zenkai Vibe Discovery Engine Modal */}
      <ZenkaiOracleModal
        isOpen={isOracleOpen}
        onClose={() => setIsOracleOpen(false)}
      />
    </>
  );
};
