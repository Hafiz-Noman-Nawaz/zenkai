import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  Plus,
  Loader2,
  CheckCircle2,
  Sparkles,
  Star,
  Film,
  Bookmark,
  Zap,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { userAnimeApi } from '../api/userAnime';
import { AnimeImage } from './AnimeImage';
import { useToast } from '../context/ToastContext';

export const BatchAddModal = ({ isOpen, onClose, onUpdated }) => {
  const toast = useToast();
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addedMap, setAddedMap] = useState({}); // { [animeId]: { status, progress, score } }
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [sessionCount, setSessionCount] = useState(0);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await animeApi.getAnimeList({ search: query.trim(), limit: 12 });
        const list = res.data?.animes || res.data?.anime || [];
        setResults(list);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleQuickAdd = async (anime, status, score = null) => {
    const targetId = anime.id || anime.externalId;
    setLoadingActionId(`${targetId}-${status}`);

    try {
      const maxEp = anime.episodes || 12;
      const progress = status === 'COMPLETED' ? maxEp : 0;

      const res = await userAnimeApi.upsertEntry(targetId, {
        status,
        progress,
        score,
        animeId: targetId,
      });

      if (res.success) {
        setAddedMap((prev) => ({
          ...prev,
          [targetId]: { status, progress, score },
        }));
        setSessionCount((prev) => prev + 1);
        toast.success(`Added "${anime.title}" (${status})`);
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add anime');
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-3xl bg-zenkai-card border border-zenkai-border rounded-3xl shadow-2xl p-5 sm:p-7 flex flex-col max-h-[88vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zenkai-border shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400/30" />
              </div>
              <h3 className="font-display font-black text-xl text-white">Rapid Batch Add</h3>
            </div>
            <p className="text-xs text-zenkai-muted mt-1">
              Rapidly build your catalog of 140+ anime with instant 1-click status and scores.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {sessionCount > 0 && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                ✓ {sessionCount} Added
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-zenkai-border transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="pt-4 pb-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zenkai-dim" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type any anime name (e.g., Death Note, Naruto, Demon Slayer, Steins;Gate)..."
              className="w-full bg-zenkai-surface border border-zenkai-border rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder:text-zenkai-dim focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
            />
            {searching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
            )}
            {query && !searching && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zenkai-dim hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pt-2 hide-scrollbar">
          {results.length > 0 ? (
            results.map((anime) => {
              const targetId = anime.id || anime.externalId;
              const addedInfo = addedMap[targetId];

              return (
                <div
                  key={targetId}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                    addedInfo
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-zenkai-surface/60 hover:bg-zenkai-surface border-zenkai-border'
                  }`}
                >
                  {/* Anime Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-16 shrink-0 rounded-xl overflow-hidden bg-zenkai-card relative shadow-md">
                      <AnimeImage src={anime.coverImage} alt={anime.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs sm:text-sm text-white truncate hover:text-indigo-300">
                        {anime.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-zenkai-muted mt-0.5">
                        <span className="font-mono uppercase">{anime.type || 'TV'}</span>
                        <span>•</span>
                        <span>{anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}</span>
                        {anime.score && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-bold">★ {anime.score}</span>
                          </>
                        )}
                      </div>
                      {addedInfo && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md mt-1">
                          <Check className="w-3 h-3" />
                          <span>Added as {addedInfo.status}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Fast Action Buttons */}
                  <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-end pt-1 sm:pt-0">
                    <button
                      onClick={() => handleQuickAdd(anime, 'COMPLETED')}
                      disabled={loadingActionId === `${targetId}-COMPLETED`}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-spring border ${
                        addedInfo?.status === 'COMPLETED'
                          ? 'bg-emerald-600 text-white border-emerald-400'
                          : 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border-indigo-500/30'
                      }`}
                    >
                      {loadingActionId === `${targetId}-COMPLETED` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Completed</span>
                    </button>

                    <button
                      onClick={() => handleQuickAdd(anime, 'WATCHING')}
                      disabled={loadingActionId === `${targetId}-WATCHING`}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-spring border ${
                        addedInfo?.status === 'WATCHING'
                          ? 'bg-cyan-600 text-white border-cyan-400'
                          : 'bg-zenkai-card hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border-zenkai-border'
                      }`}
                    >
                      {loadingActionId === `${targetId}-WATCHING` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Film className="w-3.5 h-3.5" />
                      )}
                      <span>Watching</span>
                    </button>

                    <button
                      onClick={() => handleQuickAdd(anime, 'PLAN_TO_WATCH')}
                      disabled={loadingActionId === `${targetId}-PLAN_TO_WATCH`}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-spring border ${
                        addedInfo?.status === 'PLAN_TO_WATCH'
                          ? 'bg-purple-600 text-white border-purple-400'
                          : 'bg-zenkai-card hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border-zenkai-border'
                      }`}
                    >
                      {loadingActionId === `${targetId}-PLAN_TO_WATCH` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                      <span>Plan</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : query.length >= 2 && !searching ? (
            <div className="text-center py-12 text-zenkai-dim text-xs space-y-1">
              <p>No anime matched "{query}".</p>
              <p className="text-[11px]">Try searching by alternate titles or main franchise name.</p>
            </div>
          ) : (
            <div className="text-center py-12 text-zenkai-dim text-xs space-y-3 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="font-medium text-white text-sm">Start typing to quickly add anime</p>
              <p className="text-[11px] leading-relaxed text-zenkai-muted">
                Type any anime title above and click <strong>Completed</strong> or <strong>Watching</strong> to instantly add it to your profile.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zenkai-border flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zenkai-dim font-mono">
            Pro-Tip: You can also use <strong>Import from MAL/AniList</strong> for 1-click import.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            Done Adding
          </button>
        </div>
      </div>
    </div>
  );
};
