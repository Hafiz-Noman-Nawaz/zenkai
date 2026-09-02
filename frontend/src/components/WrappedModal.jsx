import React, { useState } from 'react';
import { X, Sparkles, ChevronRight, ChevronLeft, Award, Flame, Heart, Share2, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const WrappedModal = ({ isOpen, onClose, user, stats, favorites = [] }) => {
  const toast = useToast();
  if (!isOpen) return null;

  const [slide, setSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  const totalEpisodes = stats?.totalEpisodes || (stats?.completedCount ? stats.completedCount * 12 : 48);
  const totalHours = Math.round((totalEpisodes * 24) / 60);

  const slides = [
    {
      id: 'intro',
      tag: 'Otaku Chronicle',
      title: 'Your Year in Anime',
      subtitle: `@${user?.username || 'Otaku'}'s Definitive Legacy`,
      content: (
        <div className="text-center space-y-4 py-8">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 mx-auto flex items-center justify-center text-3xl font-black text-white shadow-2xl animate-pulse">
            全
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            What a Journey It Has Been.
          </h2>
          <p className="text-xs sm:text-sm text-zenkai-muted max-w-sm mx-auto">
            From seasonal premieres to late-night binging, here is your official Zenkai Chronicle.
          </p>
        </div>
      ),
    },
    {
      id: 'watchtime',
      tag: 'Milestone 01',
      title: 'Total Watch Time',
      subtitle: 'Hours dedicated to the craft',
      content: (
        <div className="text-center space-y-6 py-6">
          <div className="p-6 rounded-3xl bg-indigo-950/60 border border-indigo-500/40 max-w-xs mx-auto shadow-2xl">
            <span className="text-4xl sm:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-300">
              {totalHours}
            </span>
            <span className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest mt-1">
              Hours Logged
            </span>
          </div>
          <p className="text-xs text-zenkai-muted">
            Across <span className="text-white font-bold">{totalEpisodes} episodes</span> and{' '}
            <span className="text-white font-bold">{stats?.completedCount || 4} completed masterworks</span>.
          </p>
        </div>
      ),
    },
    {
      id: 'favorites',
      tag: 'Milestone 02',
      title: 'Your Hall of Fame',
      subtitle: 'Highest rated milestones',
      content: (
        <div className="space-y-4 py-4">
          <p className="text-xs text-center text-zenkai-muted">Your personal top picks of the year:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {favorites.length > 0 ? (
              favorites.slice(0, 4).map((fav, idx) => (
                <div key={fav.id} className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                  <img src={fav.coverImage} alt={fav.title} className="w-full aspect-[2/3] object-cover" />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-black font-black text-[10px]">
                    #{idx + 1}
                  </div>
                  <p className="absolute bottom-0 inset-x-0 p-1 bg-black/80 text-[10px] font-bold text-white truncate text-center">
                    {fav.title}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-6 text-xs text-zenkai-dim">
                Pin titles to your profile to highlight them here!
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[slide];

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `Check out my Zenkai Anime Chronicle! I watched ${totalHours} hours and ${totalEpisodes} episodes on https://zenkai.anime`
    );
    setCopied(true);
    toast.success('Wrapped summary copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl glass-luxury border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zenkai-surface hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress Bars */}
        <div className="flex gap-1.5">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx <= slide ? 'bg-cyan-400 shadow-sm shadow-cyan-400/50' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Slide Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
            {currentSlide.tag}
          </span>
          <h3 className="font-display font-black text-xl text-white">{currentSlide.title}</h3>
          <p className="text-xs text-zenkai-muted font-mono">{currentSlide.subtitle}</p>
        </div>

        {/* Dynamic Slide Content */}
        <div className="min-h-[220px] flex items-center justify-center">
          {currentSlide.content}
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            onClick={() => setSlide((prev) => Math.max(0, prev - 1))}
            disabled={slide === 0}
            className="p-2.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated disabled:opacity-30 border border-white/10 text-white transition-spring"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-spring btn-press"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Chronicle'}</span>
          </button>

          <button
            onClick={() => {
              if (slide < slides.length - 1) {
                setSlide((prev) => prev + 1);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-spring btn-press"
          >
            <span>{slide === slides.length - 1 ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
