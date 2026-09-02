import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Plus,
  Check,
  Info,
  Star,
  Calendar,
  Sparkles,
  Flame,
  Award,
  Film,
  Zap,
} from 'lucide-react';
import { RatingBadge } from './RatingStars';
import { TrackModal } from './TrackModal';
import { TrailerModal } from './TrailerModal';
import { AnimeImage } from './AnimeImage';

export const HeroSection = ({
  anime: singleAnime,
  spotlights = [],
  userEntry = null,
  userEntriesMap = {},
  onTrackUpdated,
}) => {
  const allSpotlights = spotlights.length > 0 ? spotlights : singleAnime ? [singleAnime] : [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const anime = allSpotlights[selectedIndex] || singleAnime;
  const currentEntry = userEntriesMap[anime?.id] || (selectedIndex === 0 ? userEntry : null);

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // Auto rotation with progress line
  useEffect(() => {
    if (allSpotlights.length <= 1) return;
    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % allSpotlights.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [allSpotlights.length]);

  if (!anime) return null;

  const currentStatus = currentEntry?.status;
  const bannerImg = anime.bannerImage || anime.coverImage;

  return (
    <>
      <section className="relative w-full rounded-[2rem] overflow-hidden glass-luxury border border-white/10 shadow-2xl animate-fade-in group">
        {/* Layer 1: Lightweight Ambient Background Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-br from-indigo-950/40 via-zenkai-bg to-zenkai-bg">
          {/* Ambient Static Glows */}
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/15 rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full pointer-events-none" />

          {/* Massive Japanese Kanji Atmospheric Watermark */}
          {anime.japaneseTitle && (
            <div className="absolute top-1/2 right-12 -translate-y-1/2 select-none pointer-events-none kanji-watermark text-[140px] lg:text-[180px] xl:text-[220px] font-black text-white/[0.03] leading-none whitespace-nowrap overflow-hidden z-0">
              {anime.japaneseTitle}
            </div>
          )}

          {/* Gradients to ensure pristine contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050608] via-transparent to-[#050608]/40" />
        </div>

        {/* Layer 2: Main Responsive Grid Composition */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Title, Metadata, Synopsis & Actions (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-5 animate-slide-up">
            {/* Top Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-indigo-600/30 to-purple-600/30 border border-amber-500/40 text-amber-200 text-xs font-bold uppercase tracking-wider backdrop-blur-xl shadow-lg shadow-amber-500/10">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Featured Masterpiece 0{selectedIndex + 1}
              </span>

              {anime.score && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zenkai-card/90 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{anime.score.toFixed(2)}</span>
                </div>
              )}

              {anime.studio && (
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-lg backdrop-blur-md">
                  {anime.studio}
                </span>
              )}

              {anime.seasonYear && (
                <span className="text-xs font-medium text-zenkai-muted bg-zenkai-surface/90 border border-zenkai-border px-3 py-1 rounded-lg backdrop-blur-md">
                  {anime.season} {anime.seasonYear}
                </span>
              )}

              {anime.type && (
                <span className="text-xs font-mono uppercase text-zenkai-dim bg-zenkai-surface/90 border border-zenkai-border px-2.5 py-1 rounded-lg">
                  {anime.type}
                </span>
              )}
            </div>

            {/* Title Section */}
            <div className="space-y-1.5">
              {anime.japaneseTitle && (
                <p className="text-xs sm:text-sm font-mono text-cyan-400 tracking-widest uppercase font-bold text-glow-cyan">
                  {anime.japaneseTitle}
                </p>
              )}
              <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1] drop-shadow-2xl">
                {anime.title}
              </h1>
              {anime.englishTitle && anime.englishTitle !== anime.title && (
                <p className="text-sm sm:text-base text-zenkai-muted font-medium tracking-wide">
                  {anime.englishTitle}
                </p>
              )}
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-zenkai-text/85 line-clamp-3 leading-relaxed max-w-xl font-normal">
              {anime.synopsis}
            </p>

            {/* Genre Tags */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {anime.genres.slice(0, 4).map((g) => (
                  <span
                    key={g.id || g.name}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-zenkai-surface/80 border border-white/10 text-zenkai-muted hover:text-white hover:border-indigo-500/50 transition-colors"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 flex-wrap">
              <button
                onClick={() => setIsTrackModalOpen(true)}
                className={`flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-display font-bold text-xs sm:text-sm btn-press transition-spring shadow-2xl ${
                  currentStatus
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-600/40'
                    : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:scale-105 text-white shadow-indigo-600/40'
                }`}
              >
                {currentStatus ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tracking ({currentStatus.replace(/_/g, ' ')})</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to My Anime</span>
                  </>
                )}
              </button>

              <Link
                to={`/anime/${anime.id}`}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-zenkai-surface/90 hover:bg-zenkai-elevated border border-white/10 text-white text-xs sm:text-sm font-semibold btn-press transition-spring backdrop-blur-md shadow-lg hover:border-indigo-500/40"
              >
                <Info className="w-4 h-4 text-indigo-400" />
                <span>Details & Reviews</span>
              </Link>

              {anime.trailerUrl && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-black/60 hover:bg-black/80 border border-white/10 text-zenkai-muted hover:text-white text-xs sm:text-sm font-medium btn-press transition-spring backdrop-blur-md"
                >
                  <Play className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>Trailer</span>
                </button>
              )}
            </div>

            {/* Luxury Multi-Spotlight Carousel Switcher Dock */}
            {allSpotlights.length > 1 && (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
                  {allSpotlights.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`relative flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-spring text-xs shrink-0 overflow-hidden ${
                        idx === selectedIndex
                          ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-zenkai-surface/60 border-white/5 text-zenkai-muted hover:text-white hover:bg-zenkai-elevated'
                      }`}
                    >
                      <span className="font-mono text-[10px] text-cyan-400 font-bold">0{idx + 1}</span>
                      <span className="max-w-[130px] truncate font-bold">{item.title}</span>
                      {idx === selectedIndex && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: 3D Floating Featured Poster Showcase */}
          <div className="lg:col-span-5 hidden lg:flex justify-end animate-scale-in">
            <Link
              to={`/anime/${anime.id}`}
              className="relative w-80 xl:w-96 aspect-[2/3] rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl group/poster hover:border-cyan-400/80 hover-card-lift transition-spring"
            >
              <AnimeImage
                key={anime.id}
                src={anime.coverImage}
                alt={anime.title}
                aspectRatio="aspect-[2/3]"
                className="w-full h-full object-cover group-hover/poster:scale-105 transition-transform duration-300 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover/poster:opacity-20 transition-opacity" />
              {anime.score && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-amber-500/40 text-amber-300 font-bold font-mono text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>★ {anime.score.toFixed(2)}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white/90 bg-black/75 px-3 py-1 rounded-xl backdrop-blur-md border border-white/10">
                    {anime.episodes ? `${anime.episodes} EPS` : 'ONGOING'}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </section>

      <TrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        anime={anime}
        initialEntry={currentEntry}
        onUpdated={onTrackUpdated}
      />

      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={anime.trailerUrl}
        title={anime.title}
      />
    </>
  );
};
