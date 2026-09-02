import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Grid,
  List,
  Plus,
  Minus,
  Star,
  Heart,
  Edit3,
  Trash2,
  Sparkles,
  CheckCircle2,
  Eye,
  Clock,
  Check,
  Loader2,
  FolderOpen,
  Upload,
  Zap,
} from 'lucide-react';
import { userAnimeApi } from '../api/userAnime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AnimeCard } from '../components/AnimeCard';
import { TrackModal } from '../components/TrackModal';
import { ImportModal } from '../components/ImportModal';
import { BatchAddModal } from '../components/BatchAddModal';
import { RatingBadge } from '../components/RatingStars';
import { EmptyState } from '../components/EmptyState';
import { AnimeImage } from '../components/AnimeImage';

export const MyAnimePage = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeStatus = searchParams.get('status') || '';
  const isFavoritesOnly = searchParams.get('favorites') === 'true';

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt'); // 'score' | 'progress' | 'title' | 'updatedAt'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [selectedEntryForModal, setSelectedEntryForModal] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBatchAddOpen, setIsBatchAddOpen] = useState(false);

  const fetchList = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isFavoritesOnly) {
        response = await userAnimeApi.getFavorites({ limit: 100 });
      } else if (activeStatus === 'WATCHING') {
        response = await userAnimeApi.getWatching({ limit: 100 });
      } else if (activeStatus === 'COMPLETED') {
        response = await userAnimeApi.getCompleted({ limit: 100 });
      } else if (activeStatus === 'PLAN_TO_WATCH') {
        response = await userAnimeApi.getPlanToWatch({ limit: 100 });
      } else if (activeStatus === 'ON_HOLD') {
        response = await userAnimeApi.getOnHold({ limit: 100 });
      } else if (activeStatus === 'DROPPED') {
        response = await userAnimeApi.getDropped({ limit: 100 });
      } else {
        response = await userAnimeApi.getMyList({ limit: 100 });
      }

      if (response.success && response.data?.list) {
        setEntries(response.data.list);
      }
    } catch (err) {
      console.error('Failed to fetch library:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeStatus, isFavoritesOnly]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // Quick inline episode progress +1 increment
  const handleQuickProgress = async (entry, increment = 1) => {
    const anime = entry.anime;
    const animeId = anime?.id || entry.animeId || anime?.externalId;
    if (!animeId) return;

    const current = entry.progress || 0;
    const max = anime?.episodes || 9999;
    const nextVal = Math.min(max, Math.max(0, current + increment));

    if (nextVal === current) return;

    try {
      const res = await userAnimeApi.updateProgress(animeId, nextVal);
      if (res.success) {
        setEntries((prev) =>
          prev.map((item) => (item.id === entry.id ? { ...item, progress: nextVal } : item))
        );
        toast.success(`Updated ${anime?.title || 'Anime'} to Ep ${nextVal}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update progress');
    }
  };

  // Quick favorite toggle
  const handleToggleFavorite = async (entry) => {
    const anime = entry.anime;
    const animeId = anime?.id || entry.animeId || anime?.externalId;
    if (!animeId) return;
    const newFav = !entry.isFavorite;

    try {
      const res = await userAnimeApi.toggleFavorite(animeId, newFav);
      if (res.success) {
        setEntries((prev) =>
          prev.map((item) => (item.id === entry.id ? { ...item, isFavorite: newFav } : item))
        );
        toast.info(newFav ? `Added "${anime?.title || 'Anime'}" to favorites` : `Removed from favorites`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to toggle favorite');
    }
  };

  // Quick remove
  const handleRemove = async (entry) => {
    const anime = entry.anime;
    const animeId = anime?.id || entry.animeId || anime?.externalId;
    if (!animeId) return;
    if (!window.confirm(`Remove "${anime?.title || 'Anime'}" from your library?`)) return;

    try {
      const res = await userAnimeApi.removeEntry(animeId);
      if (res.success) {
        setEntries((prev) => prev.filter((item) => item.id !== entry.id));
        toast.info(`Removed "${anime?.title || 'Anime'}" from your library`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to remove anime');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-xl text-white">Sign In to View Your Library</h2>
        <p className="text-xs text-zenkai-muted leading-relaxed">
          Maintain your personal anime list, track watched episodes, rate series, and view your viewing milestones.
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
          >
            Sign In with Account
          </Link>
        </div>
      </div>
    );
  }

  // Filter & Sort entries
  const filteredEntries = entries
    .filter((entry) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        entry.anime?.title?.toLowerCase().includes(term) ||
        entry.anime?.englishTitle?.toLowerCase().includes(term) ||
        entry.anime?.japaneseTitle?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0);
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      if (sortBy === 'title') return (a.anime?.title || '').localeCompare(b.anime?.title || '');
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  // Calculate quick stats from user entries
  const totalInLibrary = entries.length;
  const watchingCount = entries.filter((e) => e.status === 'WATCHING').length;
  const completedCount = entries.filter((e) => e.status === 'COMPLETED').length;
  const totalEps = entries.reduce((acc, e) => acc + (e.progress || 0), 0);
  const ratedEntries = entries.filter((e) => e.score);
  const meanScore = ratedEntries.length
    ? (ratedEntries.reduce((acc, e) => acc + e.score, 0) / ratedEntries.length).toFixed(1)
    : '—';

  const statusTabs = [
    { label: 'All', status: '', favorites: false, count: totalInLibrary },
    { label: 'Watching', status: 'WATCHING', favorites: false, count: watchingCount },
    { label: 'Completed', status: 'COMPLETED', favorites: false, count: completedCount },
    { label: 'Plan to Watch', status: 'PLAN_TO_WATCH', favorites: false },
    { label: 'On Hold', status: 'ON_HOLD', favorites: false },
    { label: 'Dropped', status: 'DROPPED', favorites: false },
    { label: 'Favorites', status: '', favorites: true },
  ];

  const handleTabClick = (tab) => {
    const params = new URLSearchParams();
    if (tab.status) params.set('status', tab.status);
    if (tab.favorites) params.set('favorites', 'true');
    setSearchParams(params);
  };

  const statusColors = {
    WATCHING: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    COMPLETED: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    PLAN_TO_WATCH: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    ON_HOLD: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    DROPPED: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Page Header with Quick Statistics Strip */}
      <div className="space-y-4 border-b border-zenkai-border/70 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Personal Collection</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
              My Anime Library
            </h1>
            <p className="text-xs text-zenkai-muted mt-1">
              Curate, rate, and track your episode journey across your anime history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setIsBatchAddOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 btn-press cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>⚡ Rapid Batch Add (140+ Shows)</span>
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-zenkai-text hover:text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>Import MAL / AniList</span>
            </button>

            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Explore</span>
            </Link>
          </div>
        </div>

        {/* Quick Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-zenkai-surface/60 border border-zenkai-border">
            <span className="text-[10px] font-bold text-zenkai-dim uppercase tracking-wider block">
              Library Total
            </span>
            <span className="font-display font-black text-lg text-white">
              {totalInLibrary} <span className="text-xs text-zenkai-muted font-normal">titles</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zenkai-surface/60 border border-zenkai-border">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
              Currently Watching
            </span>
            <span className="font-display font-black text-lg text-white">
              {watchingCount} <span className="text-xs text-zenkai-muted font-normal">series</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zenkai-surface/60 border border-zenkai-border">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Episodes Watched
            </span>
            <span className="font-display font-black text-lg text-white">
              {totalEps} <span className="text-xs text-zenkai-muted font-normal">episodes</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-zenkai-surface/60 border border-zenkai-border">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Mean Rating
            </span>
            <span className="font-display font-black text-lg text-white">
              ★ {meanScore} <span className="text-xs text-zenkai-muted font-normal">/ 10</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {statusTabs.map((tab) => {
          const isTabActive =
            (tab.favorites && isFavoritesOnly) ||
            (!tab.favorites && !isFavoritesOnly && activeStatus === tab.status);

          return (
            <button
              key={tab.label}
              onClick={() => handleTabClick(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                isTabActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-zenkai-surface border border-zenkai-border text-zenkai-muted hover:text-white hover:border-zenkai-subtle'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className="ml-1.5 opacity-70 font-mono text-[11px]">({tab.count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Toolbar (Search in list, Sort, View mode) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zenkai-surface/50 p-3 rounded-2xl border border-zenkai-border">
        {/* Search within library */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zenkai-dim absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by title..."
            className="w-full bg-zenkai-card border border-zenkai-border rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Sort and View Mode */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-zenkai-muted">
            <span className="text-[11px] font-semibold text-zenkai-dim hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="score">Personal Rating</option>
              <option value="progress">Episode Progress</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center bg-zenkai-card p-1 rounded-xl border border-zenkai-border">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-zenkai-muted hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-zenkai-muted hover:text-white'
              }`}
              title="Poster Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Content Area: Table / List vs Poster Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zenkai-dim flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          <span>Loading your library...</span>
        </div>
      ) : filteredEntries.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No anime in this list"
          description={
            searchTerm
              ? `No tracked anime matched "${searchTerm}".`
              : 'Start exploring the anime catalog and add titles to this tracking category.'
          }
          actionLabel="Explore Anime Catalog"
          actionLink="/explore"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredEntries.map((entry) => (
            <AnimeCard
              key={entry.id}
              anime={entry.anime}
              variant="standard"
              userEntry={entry}
              onTrackUpdated={fetchList}
            />
          ))}
        </div>
      ) : (
        /* Detailed List / Table View */
        <div className="space-y-2.5">
          {filteredEntries.map((entry) => {
            const anime = entry.anime;
            const totalEps = anime?.episodes || 0;
            const statusLabel = entry.status.replace(/_/g, ' ');

            return (
              <div
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-zenkai-surface/70 hover:bg-zenkai-surface border border-zenkai-border/80 hover:border-zenkai-border transition-all shadow-sm group"
              >
                {/* Left: Thumbnail & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <Link
                    to={`/anime/${anime?.id}`}
                    className="shrink-0 w-12 aspect-[2/3] rounded-xl overflow-hidden bg-zenkai-card border border-zenkai-border relative group-hover:scale-105 transition-transform"
                  >
                    <AnimeImage
                      src={anime?.coverImage}
                      alt={anime?.title}
                      aspectRatio="aspect-[2/3]"
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="min-w-0 space-y-1">
                    <Link
                      to={`/anime/${anime?.id}`}
                      className="font-bold text-xs sm:text-sm text-white hover:text-indigo-300 transition-colors truncate block"
                    >
                      {anime?.title}
                    </Link>

                    <div className="flex items-center gap-2 text-[11px] text-zenkai-muted">
                      <span
                        className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          statusColors[entry.status]
                        }`}
                      >
                        {statusLabel}
                      </span>
                      {anime?.type && <span>• {anime.type}</span>}
                      {anime?.seasonYear && <span>• {anime.seasonYear}</span>}
                    </div>
                  </div>
                </div>

                {/* Right: Episode Stepper + Score + Favorite + Edit */}
                <div className="flex items-center gap-3 sm:gap-5 justify-between sm:justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zenkai-border/50">
                  {/* Episode Stepper */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickProgress(entry, -1)}
                      disabled={entry.progress <= 0}
                      className="w-7 h-7 rounded-lg bg-zenkai-card border border-zenkai-border flex items-center justify-center text-zenkai-dim hover:text-white disabled:opacity-20 transition-colors"
                      title="-1 Episode"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="font-mono text-xs font-bold text-white px-2">
                      <span className="text-indigo-300">{entry.progress}</span> / {totalEps || '??'}
                    </span>

                    <button
                      onClick={() => handleQuickProgress(entry, 1)}
                      disabled={totalEps > 0 && entry.progress >= totalEps}
                      className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 hover:bg-indigo-600/30 disabled:opacity-20 transition-colors"
                      title="+1 Episode"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Personal Rating */}
                  <div className="shrink-0 min-w-[54px] text-right">
                    {entry.score ? (
                      <RatingBadge score={entry.score} size="sm" />
                    ) : (
                      <span className="text-[11px] text-zenkai-dim font-mono">— / 10</span>
                    )}
                  </div>

                  {/* Favorite Toggle */}
                  <button
                    onClick={() => handleToggleFavorite(entry)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      entry.isFavorite
                        ? 'text-pink-400 bg-pink-950/40 border-pink-500/30'
                        : 'text-zenkai-dim border-zenkai-border hover:text-white hover:border-zenkai-muted'
                    }`}
                    title={entry.isFavorite ? 'Favorited' : 'Favorite'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${entry.isFavorite ? 'fill-pink-400' : ''}`} />
                  </button>

                  {/* Edit Modal Trigger */}
                  <button
                    onClick={() => setSelectedEntryForModal(entry)}
                    className="p-1.5 text-zenkai-dim hover:text-indigo-300 rounded-lg hover:bg-zenkai-elevated border border-transparent hover:border-zenkai-border transition-colors"
                    title="Edit entry details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(entry)}
                    className="p-1.5 text-zenkai-dim hover:text-rose-400 rounded-lg hover:bg-rose-950/20 transition-colors"
                    title="Remove from list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Entry Modal */}
      {selectedEntryForModal && (
        <TrackModal
          isOpen={!!selectedEntryForModal}
          onClose={() => setSelectedEntryForModal(null)}
          anime={selectedEntryForModal.anime}
          initialEntry={selectedEntryForModal}
          onUpdated={fetchList}
        />
      )}

      {/* 1-Click Library Import Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportCompleted={fetchList}
      />

      {/* Rapid Batch Add Modal */}
      <BatchAddModal
        isOpen={isBatchAddOpen}
        onClose={() => setIsBatchAddOpen(false)}
        onUpdated={fetchList}
      />
    </div>
  );
};
