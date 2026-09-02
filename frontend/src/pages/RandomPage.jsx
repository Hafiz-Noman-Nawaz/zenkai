import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Dices,
  Play,
  RotateCw,
  Star,
  Check,
  Plus,
  Compass,
  Film,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { userAnimeApi } from '../api/userAnime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimeImage } from '../components/AnimeImage';
import { RatingBadge } from '../components/RatingStars';
import { TrailerModal } from '../components/TrailerModal';
import { TrackModal } from '../components/TrackModal';

export const RandomPage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minScore, setMinScore] = useState(7.5);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [sourcePool, setSourcePool] = useState('all'); // 'all' | 'plan_to_watch'

  const [rolling, setRolling] = useState(false);
  const [resultAnime, setResultAnime] = useState(null);
  const [rollHistory, setRollHistory] = useState([]);
  const [userEntriesMap, setUserEntriesMap] = useState({});

  // Modals
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [activeTrackAnime, setActiveTrackAnime] = useState(null);

  // Fetch genres & user library
  useEffect(() => {
    const init = async () => {
      try {
        const [genresRes, libRes] = await Promise.allSettled([
          animeApi.getAllGenres(),
          isAuthenticated ? userAnimeApi.getMyList({ limit: 200 }) : Promise.resolve({ data: { list: [] } }),
        ]);

        if (genresRes.status === 'fulfilled' && genresRes.value?.data) {
          const list = Array.isArray(genresRes.value.data) ? genresRes.value.data : genresRes.value.data.genres || [];
          setGenres(list);
        }

        if (libRes.status === 'fulfilled' && libRes.value?.data?.list) {
          const map = {};
          libRes.value.data.list.forEach((entry) => {
            map[entry.animeId] = entry;
          });
          setUserEntriesMap(map);
        }
      } catch (err) {
        console.warn('Failed to load randomizer prerequisites:', err);
      }
    };
    init();
  }, [isAuthenticated]);

  const handleSpin = async () => {
    setRolling(true);
    setResultAnime(null);

    try {
      let pool = [];

      if (sourcePool === 'plan_to_watch' && isAuthenticated) {
        const res = await userAnimeApi.getPlanToWatch({ limit: 1000 });
        pool = (res.data?.list || []).map((e) => e.anime).filter(Boolean);
      } else {
        // Fetch matching page from catalog
        const res = await animeApi.getAnimeList({
          limit: 50,
          genre: selectedGenre || undefined,
          type: selectedFormat || undefined,
          sortBy: 'popularity',
          page: Math.floor(Math.random() * 4) + 1,
        });
        pool = res.data?.anime || res.data?.animes || [];
      }

      // Filter by min score if specified
      if (minScore > 0) {
        const filtered = pool.filter((a) => (a.score || 0) >= minScore);
        if (filtered.length > 0) pool = filtered;
      }

      if (pool.length === 0) {
        toast.warning('No anime matching these constraints in pool. Broadening selection...');
        const fallbackRes = await animeApi.getAnimeList({ limit: 30, sortBy: 'popularity' });
        pool = fallbackRes.data?.anime || fallbackRes.data?.animes || [];
      }

      // Roll animation delay
      await new Promise((r) => setTimeout(r, 900));

      const randomChoice = pool[Math.floor(Math.random() * pool.length)];
      setResultAnime(randomChoice);
      setRollHistory((prev) => [randomChoice, ...prev.slice(0, 4)]);
    } catch (err) {
      toast.error('Gacha roll failed');
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="space-y-10 pb-24 max-w-5xl mx-auto">
      {/* 1. Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Dices className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Curated Anime Roulette & Gacha</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
          What Should You Watch Next?
        </h1>
        <p className="text-xs sm:text-sm text-zenkai-muted max-w-lg mx-auto">
          Cure choice paralysis with the Zenkai Gacha Engine. Filter by your mood or let fate pick your next anime obsession.
        </p>
      </div>

      {/* 2. Filter Controls Box */}
      <div className="bg-zenkai-surface/70 border border-zenkai-border rounded-3xl p-6 shadow-zenkai-subtle space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Genre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Genre</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Any Genre</option>
              {genres.map((g) => (
                <option key={g.id || g.slug} value={g.slug}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Min Score</label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="0">Any Score</option>
              <option value="7.0">★ 7.0+ (Good)</option>
              <option value="7.5">★ 7.5+ (Great)</option>
              <option value="8.0">★ 8.0+ (Acclaimed)</option>
              <option value="8.5">★ 8.5+ (Masterpiece)</option>
            </select>
          </div>

          {/* Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Formats</option>
              <option value="TV">TV Series Only</option>
              <option value="MOVIE">Movie Only</option>
            </select>
          </div>

          {/* Source Pool */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider">Pool</label>
            <select
              value={sourcePool}
              onChange={(e) => setSourcePool(e.target.value)}
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Entire 500+ Catalog</option>
              {isAuthenticated && <option value="plan_to_watch">My Plan to Watch List</option>}
            </select>
          </div>
        </div>

        {/* Big Spin Action Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleSpin}
            disabled={rolling}
            className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-700 hover:scale-105 text-white font-display font-black text-sm sm:text-base tracking-wide shadow-xl shadow-indigo-600/30 transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            <Dices className={`w-5 h-5 ${rolling ? 'animate-spin' : ''}`} />
            <span>{rolling ? 'Spinning Roulette...' : 'Spin Anime Roulette'}</span>
          </button>
        </div>
      </div>

      {/* 3. Result Reveal Spotlight */}
      {resultAnime && (
        <div className="bg-gradient-to-br from-zenkai-surface via-zenkai-card to-zenkai-elevated border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
            {/* Poster */}
            <div className="md:col-span-4 aspect-[2/3] w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative group">
              <AnimeImage
                src={resultAnime.coverImage}
                alt={resultAnime.title}
                aspectRatio="aspect-[2/3]"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {resultAnime.score && (
                <div className="absolute top-2.5 left-2.5 z-10">
                  <RatingBadge score={resultAnime.score} size="md" />
                </div>
              )}
            </div>

            {/* Content Details */}
            <div className="md:col-span-8 space-y-4 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600/25 border border-indigo-500/40 text-indigo-300 font-mono text-[11px] font-bold">
                  MATCH FOUND
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-zenkai-surface border border-zenkai-border text-zenkai-muted font-mono text-[11px]">
                  {resultAnime.type || 'TV'} {resultAnime.episodes ? `• ${resultAnime.episodes} eps` : ''}
                </span>
                {resultAnime.season && resultAnime.seasonYear && (
                  <span className="px-2.5 py-0.5 rounded-full bg-zenkai-surface border border-zenkai-border text-zenkai-muted font-mono text-[11px]">
                    {resultAnime.season} {resultAnime.seasonYear}
                  </span>
                )}
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                {resultAnime.title}
              </h2>

              <p className="text-xs sm:text-sm text-zenkai-muted line-clamp-4 leading-relaxed">
                {resultAnime.synopsis || 'No synopsis recorded.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/anime/${resultAnime.id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all"
                >
                  <span>View Full Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => setActiveTrackAnime(resultAnime)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-white font-semibold text-xs transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{userEntriesMap[resultAnime.id] ? 'Update Tracking' : 'Add to My Anime'}</span>
                </button>

                {resultAnime.trailerUrl && (
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-zenkai-muted hover:text-white font-semibold text-xs transition-all"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Trailer</span>
                  </button>
                )}

                <button
                  onClick={handleSpin}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-zenkai-dim hover:text-white font-semibold text-xs transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Spin Again</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Roll History Carousel */}
      {rollHistory.length > 1 && (
        <div className="space-y-3 pt-4 border-t border-zenkai-border/50">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Previous Spins
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {rollHistory.slice(1).map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                to={`/anime/${item.id}`}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-zenkai-surface/60 hover:bg-zenkai-elevated border border-zenkai-border transition-all group"
              >
                <div className="w-10 aspect-[2/3] rounded overflow-hidden shrink-0">
                  <AnimeImage src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-zenkai-muted font-mono">★ {item.score || 'N/A'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {resultAnime?.trailerUrl && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={resultAnime.trailerUrl}
          title={resultAnime.title}
        />
      )}

      {activeTrackAnime && (
        <TrackModal
          isOpen={Boolean(activeTrackAnime)}
          onClose={() => setActiveTrackAnime(null)}
          anime={activeTrackAnime}
          initialEntry={userEntriesMap[activeTrackAnime.id]}
          onUpdated={() => {}}
        />
      )}
    </div>
  );
};
