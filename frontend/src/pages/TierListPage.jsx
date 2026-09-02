import React, { useState, useEffect, useRef } from 'react';
import { Layers, Plus, Trash2, Download, RotateCcw, Search, Sparkles, Star } from 'lucide-react';
import { animeApi } from '../api/anime';
import { userAnimeApi } from '../api/userAnime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEFAULT_TIERS = [
  { id: 'tier-s', name: 'S - God Tier', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', bgTag: 'bg-rose-600', items: [] },
  { id: 'tier-a', name: 'A - Masterpiece', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', bgTag: 'bg-amber-600', items: [] },
  { id: 'tier-b', name: 'B - Great', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', bgTag: 'bg-emerald-600', items: [] },
  { id: 'tier-c', name: 'C - Good', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', bgTag: 'bg-cyan-600', items: [] },
  { id: 'tier-d', name: 'D - Mid / Skip', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', bgTag: 'bg-slate-600', items: [] },
];

export const TierListPage = () => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const tierListRef = useRef(null);

  // Fetch pool of anime
  useEffect(() => {
    const loadPool = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          const res = await userAnimeApi.getUserLibrary();
          if (res.success && res.data?.entries && res.data.entries.length > 0) {
            const userAnimes = res.data.entries.map((e) => e.anime).filter(Boolean);
            setPool(userAnimes);
            setLoading(false);
            return;
          }
        }
        // Fallback: top 30 anime
        const res = await animeApi.getAnimeList({ sortBy: 'score', limit: 30 });
        if (res.success && res.data?.animes) {
          setPool(res.data.animes);
        }
      } catch (e) {
        console.error('Failed to load tier pool:', e);
      } finally {
        setLoading(false);
      }
    };

    loadPool();
  }, [isAuthenticated]);

  const addToTier = (tierId, anime) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.id === tierId) {
          if (t.items.some((item) => item.id === anime.id)) return t;
          return { ...t, items: [...t.items, anime] };
        }
        // Remove from other tiers if present
        return { ...t, items: t.items.filter((item) => item.id !== anime.id) };
      })
    );
    // Remove from unranked pool
    setPool((prev) => prev.filter((item) => item.id !== anime.id));
  };

  const removeFromTier = (tierId, anime) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.id === tierId) {
          return { ...t, items: t.items.filter((item) => item.id !== anime.id) };
        }
        return t;
      })
    );
    // Return back to pool
    setPool((prev) => (prev.some((p) => p.id === anime.id) ? prev : [anime, ...prev]));
  };

  const resetTiers = () => {
    // Gather all placed items back to pool
    const allPlaced = tiers.flatMap((t) => t.items);
    setPool((prev) => [...prev, ...allPlaced]);
    setTiers(DEFAULT_TIERS.map((t) => ({ ...t, items: [] })));
    toast.info('Tier list reset');
  };

  const filteredPool = pool.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Tier Maker</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white">
            Anime Tier List Studio
          </h1>
          <p className="text-xs sm:text-sm text-zenkai-muted">
            Click or drag anime into rank tiers to create your definitive personal ranking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={resetTiers}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated border border-white/10 text-xs font-bold text-zenkai-muted hover:text-white transition-spring btn-press"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Tier Canvas */}
      <div ref={tierListRef} className="space-y-3 p-4 sm:p-6 rounded-3xl glass-luxury border border-white/10 shadow-2xl">
        {tiers.map((tier) => (
          <div
            key={tier.id}
            className="flex flex-col sm:flex-row rounded-2xl bg-black/40 border border-white/5 overflow-hidden min-h-[90px]"
          >
            {/* Tier Label Header */}
            <div
              className={`w-full sm:w-36 ${tier.bgTag} p-3 sm:p-4 flex items-center justify-center font-display font-black text-white text-sm sm:text-base text-center shrink-0 shadow-lg`}
            >
              {tier.name}
            </div>

            {/* Dropped Anime Items Container */}
            <div className="flex-1 p-3 flex items-center gap-2.5 flex-wrap min-h-[70px]">
              {tier.items.length > 0 ? (
                tier.items.map((anime) => (
                  <div
                    key={anime.id}
                    onClick={() => removeFromTier(tier.id, anime)}
                    className="relative group cursor-pointer w-14 sm:w-16 aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-md hover:scale-105 transition-spring"
                    title={`Click to return "${anime.title}" to pool`}
                  >
                    <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-rose-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-xs text-zenkai-dim font-mono italic pl-2">
                  Click anime below or select a tier to place here
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Available Anime Pool */}
      <div className="p-6 rounded-3xl glass-luxury border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-black text-base text-white">Unranked Anime Pool</h3>
            <p className="text-xs text-zenkai-muted font-mono">{filteredPool.length} titles available</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zenkai-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pool..."
              className="w-full bg-zenkai-surface border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-96 overflow-y-auto hide-scrollbar p-1">
          {filteredPool.map((anime) => (
            <div
              key={anime.id}
              className="relative group rounded-xl overflow-hidden border border-white/10 shadow-sm bg-zenkai-surface hover:border-indigo-500/50 transition-spring flex flex-col"
            >
              <div className="w-full aspect-[2/3] overflow-hidden relative">
                <img src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 p-1 transition-opacity">
                  <span className="text-[9px] font-mono text-cyan-300 font-bold">Assign Tier:</span>
                  <div className="flex gap-1 flex-wrap justify-center">
                    {tiers.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => addToTier(t.id, anime)}
                        className={`w-5 h-5 rounded text-[10px] font-black text-white ${t.bgTag} hover:scale-110 transition-transform shadow`}
                      >
                        {t.name[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[10px] font-bold text-white truncate p-1.5 text-center">{anime.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
