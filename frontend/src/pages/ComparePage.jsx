import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Swords, Search, Star, Film, Award, Sparkles, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { animeApi } from '../api/anime';
import { AnimeImage } from '../components/AnimeImage';

export const ComparePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const animeIdA = searchParams.get('a');
  const animeIdB = searchParams.get('b');

  const [animeA, setAnimeA] = useState(null);
  const [animeB, setAnimeB] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search selectors state
  const [queryA, setQueryA] = useState('');
  const [resultsA, setResultsA] = useState([]);
  const [queryB, setQueryB] = useState('');
  const [resultsB, setResultsB] = useState([]);

  // Popular battle presets
  const presets = [
    { title: 'JJK vs Demon Slayer', a: 'jujutsu-kaisen', b: 'demon-slayer-kimetsu-no-yaiba' },
    { title: 'Death Note vs Code Geass', a: 'death-note', b: 'code-geass-lelouch-of-the-rebellion' },
    { title: 'Frieren vs Violet Evergarden', a: 'frieren-beyond-journeys-end', b: 'violet-evergarden' },
  ];

  // Fetch both animes
  useEffect(() => {
    const fetchPair = async () => {
      setLoading(true);
      try {
        if (animeIdA) {
          const resA = await animeApi.getAnimeById(animeIdA);
          if (resA.success && resA.data?.anime) setAnimeA(resA.data.anime);
        }
        if (animeIdB) {
          const resB = await animeApi.getAnimeById(animeIdB);
          if (resB.success && resB.data?.anime) setAnimeB(resB.data.anime);
        }
      } catch (e) {
        console.error('Failed to load comparison pair:', e);
      } finally {
        setLoading(false);
      }
    };

    if (animeIdA || animeIdB) {
      fetchPair();
    } else {
      // Default initial pair if none in query params
      searchDefaultPair();
    }
  }, [animeIdA, animeIdB]);

  const searchDefaultPair = async () => {
    try {
      const res = await animeApi.getAnimeList({ sortBy: 'score', limit: 2 });
      if (res.success && res.data?.animes && res.data.animes.length >= 2) {
        setAnimeA(res.data.animes[0]);
        setAnimeB(res.data.animes[1]);
        const np = new URLSearchParams();
        np.set('a', res.data.animes[0].id);
        np.set('b', res.data.animes[1].id);
        setSearchParams(np);
      }
    } catch (e) {}
  };

  // Search anime A
  useEffect(() => {
    if (!queryA.trim()) {
      setResultsA([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await animeApi.searchAnime(queryA.trim(), 5);
      if (res.success) setResultsA(res.data?.animes || res.data?.anime || []);
    }, 200);
    return () => clearTimeout(t);
  }, [queryA]);

  // Search anime B
  useEffect(() => {
    if (!queryB.trim()) {
      setResultsB([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await animeApi.searchAnime(queryB.trim(), 5);
      if (res.success) setResultsB(res.data?.animes || res.data?.anime || []);
    }, 200);
    return () => clearTimeout(t);
  }, [queryB]);

  const selectAnime = (target, anime) => {
    const np = new URLSearchParams(searchParams);
    if (target === 'a') {
      setAnimeA(anime);
      np.set('a', anime.id);
      setQueryA('');
      setResultsA([]);
    } else {
      setAnimeB(anime);
      np.set('b', anime.id);
      setQueryB('');
      setResultsB([]);
    }
    setSearchParams(np);
  };

  const applyPreset = (preset) => {
    const np = new URLSearchParams();
    np.set('a', preset.a);
    np.set('b', preset.b);
    setSearchParams(np);
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider">
          <Swords className="w-4 h-4 text-indigo-400" />
          <span>Head-to-Head Anime Arena</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
          Compare Masterpieces
        </h1>
        <p className="text-xs sm:text-sm text-zenkai-muted">
          Pick any two titles to evaluate ratings, studio pedigree, episode length, and community reception.
        </p>

        {/* Quick Presets */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          {presets.map((p) => (
            <button
              key={p.title}
              onClick={() => applyPreset(p)}
              className="px-3 py-1 rounded-xl bg-zenkai-surface/80 hover:bg-zenkai-elevated border border-white/10 text-xs text-zenkai-muted hover:text-white transition-spring font-semibold btn-press"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Arena Stage: Dual Posters & Search Pickers */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
        {/* Fighter 1 (Cols 1-5) */}
        <div className="md:col-span-5 p-6 rounded-3xl glass-luxury border border-white/10 space-y-4 relative">
          <div className="relative">
            <Search className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryA}
              onChange={(e) => setQueryA(e.target.value)}
              placeholder="Search Anime 1..."
              className="w-full bg-zenkai-surface border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
            />
            {resultsA.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zenkai-card border border-white/10 rounded-2xl shadow-2xl p-2 z-30 space-y-1">
                {resultsA.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectAnime('a', r)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-zenkai-surface text-left transition-colors"
                  >
                    <img src={r.coverImage} alt={r.title} className="w-8 aspect-[2/3] object-cover rounded" />
                    <span className="text-xs font-bold text-white truncate">{r.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {animeA ? (
            <div className="flex gap-4 items-center">
              <Link to={`/anime/${animeA.id}`} className="w-28 aspect-[2/3] rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10">
                <AnimeImage src={animeA.coverImage} alt={animeA.title} />
              </Link>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Fighter 1</span>
                <h3 className="font-display font-black text-lg text-white truncate">{animeA.title}</h3>
                <p className="text-xs text-zenkai-muted line-clamp-2">{animeA.synopsis}</p>
                {animeA.score && (
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold font-mono text-xs pt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Score: {animeA.score.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-zenkai-dim">Select Anime 1</div>
          )}
        </div>

        {/* Center VS Indicator (Col 6) */}
        <div className="md:col-span-1 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-rose-600 flex items-center justify-center shadow-xl text-white font-black font-display text-sm tracking-tighter">
            VS
          </div>
        </div>

        {/* Fighter 2 (Cols 7-11) */}
        <div className="md:col-span-5 p-6 rounded-3xl glass-luxury border border-white/10 space-y-4 relative">
          <div className="relative">
            <Search className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryB}
              onChange={(e) => setQueryB(e.target.value)}
              placeholder="Search Anime 2..."
              className="w-full bg-zenkai-surface border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-rose-500"
            />
            {resultsB.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zenkai-card border border-white/10 rounded-2xl shadow-2xl p-2 z-30 space-y-1">
                {resultsB.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectAnime('b', r)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-zenkai-surface text-left transition-colors"
                  >
                    <img src={r.coverImage} alt={r.title} className="w-8 aspect-[2/3] object-cover rounded" />
                    <span className="text-xs font-bold text-white truncate">{r.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {animeB ? (
            <div className="flex gap-4 items-center">
              <Link to={`/anime/${animeB.id}`} className="w-28 aspect-[2/3] rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10">
                <AnimeImage src={animeB.coverImage} alt={animeB.title} />
              </Link>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Fighter 2</span>
                <h3 className="font-display font-black text-lg text-white truncate">{animeB.title}</h3>
                <p className="text-xs text-zenkai-muted line-clamp-2">{animeB.synopsis}</p>
                {animeB.score && (
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold font-mono text-xs pt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Score: {animeB.score.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-zenkai-dim">Select Anime 2</div>
          )}
        </div>
      </div>

      {/* Comparison Deep-Dive Matrix */}
      {animeA && animeB && (
        <div className="p-6 sm:p-8 rounded-3xl glass-luxury border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-display font-black text-lg text-white">Statistical Matchup</h2>
            <span className="text-xs font-mono text-zenkai-dim">Zenkai Head-to-Head Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Anime A Metric */}
            <div className="space-y-4 text-center md:text-left">
              <p className="font-bold text-sm text-cyan-400 truncate">{animeA.title}</p>
              <div className="space-y-3 font-mono text-xs">
                <p className="text-white"><span className="text-zenkai-dim">Score:</span> {animeA.score?.toFixed(2) || 'N/A'}</p>
                <p className="text-white"><span className="text-zenkai-dim">Studio:</span> {animeA.studio || 'Unknown'}</p>
                <p className="text-white"><span className="text-zenkai-dim">Episodes:</span> {animeA.episodes || 'Ongoing'}</p>
                <p className="text-white"><span className="text-zenkai-dim">Season:</span> {animeA.season || ''} {animeA.seasonYear || ''}</p>
              </div>
            </div>

            {/* Verdict Center Column */}
            <div className="p-4 rounded-2xl bg-zenkai-surface/80 border border-white/10 text-center space-y-2">
              <Award className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-xs font-mono font-bold text-zenkai-dim uppercase">Higher Rated</p>
              <p className="font-display font-black text-sm text-white">
                {animeA.score && animeB.score
                  ? animeA.score >= animeB.score
                    ? animeA.title
                    : animeB.title
                  : 'Undetermined'}
              </p>
            </div>

            {/* Anime B Metric */}
            <div className="space-y-4 text-center md:text-right">
              <p className="font-bold text-sm text-rose-400 truncate">{animeB.title}</p>
              <div className="space-y-3 font-mono text-xs">
                <p className="text-white"><span className="text-zenkai-dim">Score:</span> {animeB.score?.toFixed(2) || 'N/A'}</p>
                <p className="text-white"><span className="text-zenkai-dim">Studio:</span> {animeB.studio || 'Unknown'}</p>
                <p className="text-white"><span className="text-zenkai-dim">Episodes:</span> {animeB.episodes || 'Ongoing'}</p>
                <p className="text-white"><span className="text-zenkai-dim">Season:</span> {animeB.season || ''} {animeB.seasonYear || ''}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
