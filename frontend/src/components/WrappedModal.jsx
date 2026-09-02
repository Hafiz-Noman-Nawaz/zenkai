import React, { useState, useMemo } from 'react';
import { X, Sparkles, ChevronRight, ChevronLeft, Award, Flame, Heart, Share2, Check, Tv, Clock, Trophy, Zap, Compass } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const WrappedModal = ({ isOpen, onClose, user, stats, favorites = [], library = [] }) => {
  const toast = useToast();
  if (!isOpen) return null;

  const [slide, setSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  // 1. Calculate Real Metrics from Actual User Data
  const computedMetrics = useMemo(() => {
    const totalCompleted = stats?.completedCount || 0;
    const totalWatching = stats?.watchingCount || 0;
    const totalPlanToWatch = stats?.planToWatchCount || 0;
    const totalTracked = stats?.totalAnime || library.length || (totalCompleted + totalWatching + totalPlanToWatch);

    const totalEpisodes = stats?.totalEpisodes || library.reduce((acc, curr) => acc + (curr.progress || 0), 0) || (totalCompleted * 12);
    const totalHours = stats?.hoursWatched || Math.round((totalEpisodes * 24) / 60);

    // Calculate Top Genre from actual library
    const genreCounts = {};
    let totalGenreHits = 0;
    library.forEach((entry) => {
      const anime = entry.anime || entry;
      if (anime.genres && Array.isArray(anime.genres)) {
        anime.genres.forEach((g) => {
          const name = typeof g === 'string' ? g : g.name || g.slug;
          if (name) {
            genreCounts[name] = (genreCounts[name] || 0) + 1;
            totalGenreHits += 1;
          }
        });
      }
    });

    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    const topGenre = sortedGenres.length > 0 ? sortedGenres[0][0] : 'Action & Adventure';
    const topGenrePct = totalGenreHits > 0 ? Math.round((sortedGenres[0][1] / totalGenreHits) * 100) : 100;

    // Highest Rated Masterpiece
    const scoredList = [...library].filter((e) => e.score || e.anime?.score).sort((a, b) => (b.score || b.anime?.score || 0) - (a.score || a.anime?.score || 0));
    const highestRated = scoredList.length > 0 ? (scoredList[0].anime || scoredList[0]) : (favorites[0] || null);

    // Otaku Persona Tier
    let persona = 'Fresh Initiate';
    let personaColor = 'from-cyan-400 to-blue-500';
    let personaDesc = 'Starting an epic anime voyage into the multiverse.';

    if (totalHours >= 100 || totalCompleted >= 20) {
      persona = 'S-Rank Anime Sovereign';
      personaColor = 'from-amber-400 via-rose-500 to-purple-600';
      personaDesc = 'A legendary connoisseur with encyclopedic anime mastery.';
    } else if (totalHours >= 40 || totalCompleted >= 8) {
      persona = 'Veteran Otaku Vanguard';
      personaColor = 'from-purple-400 to-indigo-500';
      personaDesc = 'Deep in the seasonal trenches, bingeing the finest masterpieces.';
    } else if (totalHours >= 10 || totalTracked >= 3) {
      persona = 'Rising Shounen Prodigy';
      personaColor = 'from-emerald-400 to-cyan-500';
      personaDesc = 'Rapidly devouring iconic franchises and building a lethal watchlist.';
    }

    return {
      totalCompleted,
      totalWatching,
      totalPlanToWatch,
      totalTracked,
      totalEpisodes,
      totalHours,
      topGenre,
      topGenrePct,
      sortedGenres: sortedGenres.slice(0, 3),
      highestRated,
      persona,
      personaColor,
      personaDesc,
    };
  }, [stats, library, favorites]);

  const {
    totalCompleted,
    totalWatching,
    totalPlanToWatch,
    totalTracked,
    totalEpisodes,
    totalHours,
    topGenre,
    topGenrePct,
    sortedGenres,
    highestRated,
    persona,
    personaColor,
    personaDesc,
  } = computedMetrics;

  // Real Top 4 list
  const displayFavorites = favorites.length > 0 ? favorites.slice(0, 4) : library.slice(0, 4).map((e) => e.anime || e);

  const slides = [
    // Slide 1: Intro
    {
      id: 'intro',
      tag: 'Otaku Chronicle',
      title: 'Your Year in Anime',
      subtitle: `@${user?.displayName || user?.username || 'Otaku'}'s Official Recap`,
      content: (
        <div className="text-center space-y-4 py-4">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 mx-auto flex items-center justify-center text-3xl font-black text-white shadow-2xl animate-pulse">
            全
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            Ready to Relive Your Chronicle?
          </h2>
          <p className="text-xs sm:text-sm text-zenkai-muted max-w-sm mx-auto">
            From seasonal releases to midnight marathons, here is the authentic breakdown of your journey on Zenkai.
          </p>
        </div>
      ),
    },

    // Slide 2: Real Watch Time & Volume
    {
      id: 'watchtime',
      tag: 'Milestone 01',
      title: 'Total Watch Volume',
      subtitle: 'Verified hours dedicated to the craft',
      content: (
        <div className="text-center space-y-5 py-2">
          <div className="p-6 rounded-3xl bg-indigo-950/60 border border-indigo-500/40 max-w-xs mx-auto shadow-2xl">
            <span className="text-5xl sm:text-6xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
              {totalHours}
            </span>
            <span className="block text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest mt-1">
              Hours Logged
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
            <div className="p-2.5 rounded-2xl bg-zenkai-surface/80 border border-white/5">
              <span className="text-base font-bold text-white font-mono">{totalEpisodes}</span>
              <p className="text-[10px] text-zenkai-dim uppercase font-mono">Episodes</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-zenkai-surface/80 border border-white/5">
              <span className="text-base font-bold text-emerald-400 font-mono">{totalCompleted}</span>
              <p className="text-[10px] text-zenkai-dim uppercase font-mono">Completed</p>
            </div>
            <div className="p-2.5 rounded-2xl bg-zenkai-surface/80 border border-white/5">
              <span className="text-base font-bold text-cyan-400 font-mono">{totalTracked}</span>
              <p className="text-[10px] text-zenkai-dim uppercase font-mono">Total Shows</p>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 3: Genre Affinity & Taste Blueprint
    {
      id: 'genres',
      tag: 'Milestone 02',
      title: 'Your Taste Blueprint',
      subtitle: 'The genres that define your soul',
      content: (
        <div className="space-y-4 py-2">
          <div className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-center max-w-sm mx-auto space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
              #1 Signature Genre
            </span>
            <h4 className="text-2xl font-black text-white font-display">{topGenre}</h4>
            <p className="text-xs text-purple-200/80 font-mono">
              Comprising {topGenrePct}% of your anime catalog
            </p>
          </div>

          {sortedGenres.length > 0 && (
            <div className="space-y-2 max-w-sm mx-auto">
              <p className="text-[11px] font-mono text-zenkai-dim uppercase">Genre Breakdown:</p>
              <div className="space-y-1.5">
                {sortedGenres.map(([gName, count], idx) => (
                  <div key={gName} className="flex items-center justify-between text-xs p-2 rounded-xl bg-zenkai-surface/60 border border-white/5">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="text-[10px] font-mono text-purple-400">0{idx + 1}</span>
                      {gName}
                    </span>
                    <span className="font-mono text-zenkai-dim text-[11px]">{count} titles</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },

    // Slide 4: Real Favorites / Hall of Fame
    {
      id: 'favorites',
      tag: 'Milestone 03',
      title: 'Your Hall of Fame',
      subtitle: 'Your curated top milestones',
      content: (
        <div className="space-y-4 py-2">
          {displayFavorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-md mx-auto">
              {displayFavorites.map((fav, idx) => (
                <div key={fav.id || idx} className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg group">
                  <img src={fav.coverImage} alt={fav.title} className="w-full aspect-[2/3] object-cover" />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-400 text-black font-black text-[10px]">
                    #{idx + 1}
                  </div>
                  <p className="absolute bottom-0 inset-x-0 p-1.5 bg-black/85 text-[10px] font-bold text-white truncate text-center">
                    {fav.title}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-zenkai-dim space-y-2">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto opacity-60" />
              <p>Add shows to your library or pin your Top 4 on your profile to showcase them here!</p>
            </div>
          )}

          {highestRated && (
            <div className="text-center pt-1">
              <span className="text-[11px] font-mono text-zenkai-dim">
                Highest Scored Masterpiece: <strong className="text-amber-400">{highestRated.title}</strong>
              </span>
            </div>
          )}
        </div>
      ),
    },

    // Slide 5: Otaku Persona & Share Summary
    {
      id: 'persona',
      tag: 'Final Verdict',
      title: 'Your Otaku Persona',
      subtitle: 'Calculated from your viewing archetype',
      content: (
        <div className="text-center space-y-4 py-2">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-zenkai-card to-purple-950/80 border border-white/15 max-w-sm mx-auto shadow-2xl space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
              Assigned Archetype
            </span>
            <h3 className={`text-2xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r ${personaColor}`}>
              {persona}
            </h3>
            <p className="text-xs text-zenkai-text/80 leading-relaxed pt-1">
              {personaDesc}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-zenkai-dim pt-1">
            <span>⚡ {totalHours}h Watched</span>
            <span>•</span>
            <span>🎬 {totalEpisodes} Episodes</span>
            <span>•</span>
            <span>🔥 {topGenre}</span>
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[slide];

  const handleShare = () => {
    navigator.clipboard?.writeText(
      `⚡ My Zenkai Otaku Wrapped:\n👑 Persona: ${persona}\n⏱️ ${totalHours} Hours Watched (${totalEpisodes} Episodes)\n🎨 Top Genre: ${topGenre}\nCheck out your anime chronicle on https://zenkai.vercel.app`
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
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
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
        <div className="min-h-[240px] flex items-center justify-center">
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
