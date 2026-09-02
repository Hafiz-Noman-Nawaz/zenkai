import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Compass,
  Calendar,
  Sparkles,
  ArrowDownCircle,
  Loader2,
  X,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { userAnimeApi } from '../api/userAnime';
import { useAuth } from '../context/AuthContext';
import { AnimeCard } from '../components/AnimeCard';
import { GridSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';

const ALPHABET = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // URL state sync
  const queryParam = searchParams.get('q') || '';
  const genreParam = searchParams.get('genre') || '';
  const statusParam = searchParams.get('status') || '';
  const seasonParam = searchParams.get('season') || '';
  const yearParam = searchParams.get('seasonYear') || '';
  const typeParam = searchParams.get('type') || '';
  const letterParam = searchParams.get('letter') || '';
  const sortByParam = searchParams.get('sortBy') || 'popularity';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local component states
  const [searchInput, setSearchInput] = useState(queryParam);
  const [genresList, setGenresList] = useState([]);
  const [animes, setAnimes] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: 24 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [paginationMode, setPaginationMode] = useState('infinite'); // 'infinite' | 'paged'
  const [userEntriesMap, setUserEntriesMap] = useState({});

  // Ref for automatic infinite scroll intersection observer
  const sentinelRef = useRef(null);

  // Fetch genres catalog on mount
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await animeApi.getAllGenres();
        if (res.success && res.data) {
          const list = Array.isArray(res.data)
            ? res.data
            : res.data.genres || [];
          setGenresList(list);
        }
      } catch (err) {
        console.warn('Failed to load genres:', err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch user library for bookmark tracking status
  const fetchUserLibrary = useCallback(async () => {
    if (!isAuthenticated) {
      setUserEntriesMap({});
      return;
    }
    try {
      const res = await userAnimeApi.getMyList({ limit: 200 });
      if (res.success && res.data?.list) {
        const map = {};
        res.data.list.forEach((entry) => {
          map[entry.animeId] = entry;
        });
        setUserEntriesMap(map);
      }
    } catch (err) {
      console.warn('Could not fetch user library map:', err);
    }
  }, [isAuthenticated]);

  // Fetch anime catalog based on query params
  const fetchCatalog = useCallback(async (targetPage = pageParam, isAppend = false) => {
    if (isAppend) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = {
        page: targetPage,
        limit: 24,
        sortBy: sortByParam,
      };

      if (queryParam) params.q = queryParam;
      if (genreParam) params.genre = genreParam;
      if (statusParam) params.status = statusParam;
      if (seasonParam) params.season = seasonParam;
      if (yearParam) params.seasonYear = parseInt(yearParam, 10);
      if (typeParam) params.type = typeParam;
      if (letterParam) params.letter = letterParam;

      const response = await animeApi.getAnimeList(params);
      if (response.success && response.data) {
        const list = response.data.anime || response.data.animes || [];
        if (isAppend) {
          setAnimes((prev) => {
            // Deduplicate by id
            const existingIds = new Set(prev.map((a) => a.id));
            const newItems = list.filter((a) => !existingIds.has(a.id));
            return [...prev, ...newItems];
          });
        } else {
          setAnimes(list);
        }
        if (response.meta) {
          setMeta(response.meta);
        }
      }
    } catch (err) {
      console.error('Failed to fetch anime catalog:', err);
      if (!isAppend) setAnimes([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [queryParam, genreParam, statusParam, seasonParam, yearParam, typeParam, letterParam, sortByParam, pageParam]);

  // Fetch when filters change (resets to page 1)
  useEffect(() => {
    fetchCatalog(pageParam, false);
    fetchUserLibrary();
  }, [queryParam, genreParam, statusParam, seasonParam, yearParam, typeParam, letterParam, sortByParam, pageParam, fetchCatalog, fetchUserLibrary]);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(queryParam);
  }, [queryParam]);

  // Automatic Infinite Scroll Intersection Observer
  useEffect(() => {
    if (paginationMode !== 'infinite') return;
    if (loading || loadingMore) return;
    if (!meta.hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && meta.hasNextPage && !loadingMore && !loading) {
          const nextPage = meta.page + 1;
          fetchCatalog(nextPage, true);
        }
      },
      { rootMargin: '400px' }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [paginationMode, loading, loadingMore, meta, fetchCatalog]);

  // Update query params helper
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1'); // Reset to page 1 on filter change
    }
    setSearchParams(newParams);
  };

  // Toggle letter filter (clicking active letter deselects it)
  const toggleLetter = (char) => {
    if (letterParam.toUpperCase() === char.toUpperCase()) {
      updateParam('letter', '');
    } else {
      updateParam('letter', char);
    }
  };

  // Toggle genre filter (clicking active genre deselects it)
  const toggleGenre = (slug) => {
    if (genreParam.toLowerCase() === slug.toLowerCase()) {
      updateParam('genre', '');
    } else {
      updateParam('genre', slug);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('q', searchInput.trim());
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams({ sortBy: 'popularity', page: '1' }));
  };

  const seasons = [
    { value: '', label: 'All Seasons' },
    { value: 'WINTER', label: 'Winter' },
    { value: 'SPRING', label: 'Spring' },
    { value: 'SUMMER', label: 'Summer' },
    { value: 'FALL', label: 'Fall' },
  ];

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'RELEASING', label: 'Currently Airing' },
    { value: 'FINISHED', label: 'Finished Airing' },
    { value: 'NOT_YET_RELEASED', label: 'Upcoming' },
  ];

  const types = [
    { value: '', label: 'All Formats' },
    { value: 'TV', label: 'TV Series' },
    { value: 'MOVIE', label: 'Movie' },
    { value: 'ONA', label: 'ONA' },
    { value: 'OVA', label: 'OVA' },
    { value: 'SPECIAL', label: 'Special' },
  ];

  const sortOptions = [
    { value: 'popularity', label: 'Most Popular' },
    { value: 'score', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest Release' },
    { value: 'oldest', label: 'Oldest Release' },
    { value: 'title', label: 'Alphabetical (A-Z)' },
  ];

  const quickPills = [
    {
      label: '🔥 All Anime',
      onClick: resetAllFilters,
      active: !seasonParam && !statusParam && !genreParam && !yearParam && !letterParam && !queryParam,
    },
    {
      label: '❄️ Winter 2026',
      onClick: () => {
        if (seasonParam === 'WINTER' && yearParam === '2026') {
          updateParam('season', '');
          updateParam('seasonYear', '');
        } else {
          const np = new URLSearchParams(searchParams);
          np.set('season', 'WINTER');
          np.set('seasonYear', '2026');
          np.set('page', '1');
          setSearchParams(np);
        }
      },
      active: seasonParam === 'WINTER' && yearParam === '2026',
    },
    {
      label: '🍂 Fall 2025',
      onClick: () => {
        if (seasonParam === 'FALL' && yearParam === '2025') {
          updateParam('season', '');
          updateParam('seasonYear', '');
        } else {
          const np = new URLSearchParams(searchParams);
          np.set('season', 'FALL');
          np.set('seasonYear', '2025');
          np.set('page', '1');
          setSearchParams(np);
        }
      },
      active: seasonParam === 'FALL' && yearParam === '2025',
    },
    {
      label: '☀️ Summer 2025',
      onClick: () => {
        if (seasonParam === 'SUMMER' && yearParam === '2025') {
          updateParam('season', '');
          updateParam('seasonYear', '');
        } else {
          const np = new URLSearchParams(searchParams);
          np.set('season', 'SUMMER');
          np.set('seasonYear', '2025');
          np.set('page', '1');
          setSearchParams(np);
        }
      },
      active: seasonParam === 'SUMMER' && yearParam === '2025',
    },
    {
      label: '🌸 Spring 2025',
      onClick: () => {
        if (seasonParam === 'SPRING' && yearParam === '2025') {
          updateParam('season', '');
          updateParam('seasonYear', '');
        } else {
          const np = new URLSearchParams(searchParams);
          np.set('season', 'SPRING');
          np.set('seasonYear', '2025');
          np.set('page', '1');
          setSearchParams(np);
        }
      },
      active: seasonParam === 'SPRING' && yearParam === '2025',
    },
    {
      label: '📺 Currently Airing',
      onClick: () => updateParam('status', statusParam === 'RELEASING' ? '' : 'RELEASING'),
      active: statusParam === 'RELEASING',
    },
    {
      label: '✨ Upcoming',
      onClick: () => updateParam('status', statusParam === 'NOT_YET_RELEASED' ? '' : 'NOT_YET_RELEASED'),
      active: statusParam === 'NOT_YET_RELEASED',
    },
    {
      label: '🎬 Top Movies',
      onClick: () => {
        if (typeParam === 'MOVIE') {
          updateParam('type', '');
        } else {
          const np = new URLSearchParams(searchParams);
          np.set('type', 'MOVIE');
          np.set('sortBy', 'score');
          np.set('page', '1');
          setSearchParams(np);
        }
      },
      active: typeParam === 'MOVIE',
    },
  ];

  const hasActiveFilters = Boolean(
    queryParam || genreParam || statusParam || seasonParam || yearParam || typeParam || letterParam || sortByParam !== 'popularity'
  );

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Page Header & Live Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zenkai-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Complete Anime Directory</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Explore Anime Catalog
          </h1>
          <p className="text-xs sm:text-sm text-zenkai-muted mt-1">
            Browse, filter, and discover over <span className="text-white font-bold">{meta.total > 0 ? meta.total : '500+'}</span> anime titles across all eras, formats, and seasons.
          </p>
        </div>

        {/* View Mode & Pagination Mode Switchers */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 rounded-xl bg-zenkai-surface border border-zenkai-border">
            <button
              onClick={() => setPaginationMode('infinite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                paginationMode === 'infinite'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zenkai-muted hover:text-white'
              }`}
            >
              Infinite Scroll
            </button>
            <button
              onClick={() => setPaginationMode('paged')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                paginationMode === 'paged'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zenkai-muted hover:text-white'
              }`}
            >
              Numbered Pages
            </button>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-zenkai-surface border border-zenkai-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zenkai-muted hover:text-white'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zenkai-muted hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Era / Seasonal Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {quickPills.map((pill) => (
          <button
            key={pill.label}
            onClick={pill.onClick}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              pill.active
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/40'
                : 'bg-zenkai-surface/80 hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border border-zenkai-border'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* 3. A-Z Alphabetical Directory Jump Bar */}
      <div className="bg-zenkai-surface/60 p-2 rounded-2xl border border-zenkai-border flex items-center gap-1 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => updateParam('letter', '')}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
            !letterParam
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zenkai-muted hover:text-white hover:bg-zenkai-elevated'
          }`}
        >
          ALL
        </button>
        {ALPHABET.map((char) => (
          <button
            key={char}
            onClick={() => toggleLetter(char)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
              letterParam.toUpperCase() === char
                ? 'bg-indigo-600 text-white shadow-sm scale-105 ring-2 ring-indigo-400/50'
                : 'text-zenkai-muted hover:text-white hover:bg-zenkai-elevated'
            }`}
            title={`Anime starting with ${char}`}
          >
            {char}
          </button>
        ))}
      </div>

      {/* 4. Filter Toolbar & Search Control */}
      <div className="space-y-3 bg-zenkai-surface/60 p-4 rounded-3xl border border-zenkai-border shadow-zenkai-subtle">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-zenkai-dim absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search anime title..."
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zenkai-dim focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  updateParam('q', '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zenkai-dim hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Season Dropdown */}
          <div className="md:col-span-2">
            <select
              value={seasonParam}
              onChange={(e) => updateParam('season', e.target.value)}
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {seasons.map((s) => (
                <option key={s.value} value={s.value} className="bg-zenkai-card text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="md:col-span-2">
            <select
              value={yearParam}
              onChange={(e) => updateParam('seasonYear', e.target.value)}
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="" className="bg-zenkai-card text-white">All Years</option>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2016, 2013, 2011, 2009, 2006, 2002, 1999, 1998, 1995].map((y) => (
                <option key={y} value={y} className="bg-zenkai-card text-white">{y}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <select
              value={statusParam}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value} className="bg-zenkai-card text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortByParam}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 cursor-pointer font-medium"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value} className="bg-zenkai-card text-white">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Genre Tag Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar pt-1 border-t border-zenkai-border/50">
          <button
            onClick={() => updateParam('genre', '')}
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
              !genreParam
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50'
                : 'bg-zenkai-card text-zenkai-muted border border-zenkai-border/80 hover:text-white'
            }`}
          >
            All Genres
          </button>
          {genresList.map((g) => (
            <button
              key={g.id || g.slug || g.name}
              onClick={() => toggleGenre(g.slug)}
              className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 transition-all ${
                genreParam === g.slug
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                  : 'bg-zenkai-card text-zenkai-muted border border-zenkai-border/80 hover:text-white hover:border-zenkai-border'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Active Filters Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-zenkai-muted px-1 pt-1">
            <span>
              Showing <span className="text-white font-bold">{meta.total}</span> anime matching filters
              {letterParam && (
                <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-300 font-mono">
                  Starts with '{letterParam}'
                </span>
              )}
            </span>
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors font-medium cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. Catalog Display Grid */}
      {loading ? (
        <GridSkeleton count={18} />
      ) : animes.length === 0 ? (
        <EmptyState
          title="No anime matching filters"
          description="Try clearing some of your filter constraints or search keywords to broaden your results."
          actionLabel="Reset All Filters"
          onAction={resetAllFilters}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animes.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              variant="standard"
              userEntry={userEntriesMap[anime.id]}
              onTrackUpdated={fetchUserLibrary}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2.5">
          {animes.map((anime) => (
            <AnimeCard
              key={anime.id}
              anime={anime}
              variant="compact"
              userEntry={userEntriesMap[anime.id]}
              onTrackUpdated={fetchUserLibrary}
            />
          ))}
        </div>
      )}

      {/* 6. Automatic Infinite Scroll Sentinel or Numbered Pages */}
      {paginationMode === 'infinite' ? (
        <div ref={sentinelRef} className="py-8 flex flex-col items-center justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold py-4">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more anime...</span>
            </div>
          )}
          {!meta.hasNextPage && animes.length > 0 && (
            <p className="text-xs font-mono text-zenkai-dim py-4">
              ✓ All {meta.total} anime loaded
            </p>
          )}
        </div>
      ) : (
        meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 border-t border-zenkai-border/60">
            <button
              onClick={() => updateParam('page', Math.max(1, pageParam - 1).toString())}
              disabled={pageParam <= 1}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zenkai-surface border border-zenkai-border text-xs font-semibold text-zenkai-text hover:bg-zenkai-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs font-mono font-medium text-zenkai-muted px-2">
              Page <span className="text-white font-bold">{meta.page}</span> of{' '}
              <span className="text-white font-bold">{meta.totalPages}</span>
            </span>

            <button
              onClick={() => updateParam('page', Math.min(meta.totalPages, pageParam + 1).toString())}
              disabled={pageParam >= meta.totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-zenkai-surface border border-zenkai-border text-xs font-semibold text-zenkai-text hover:bg-zenkai-elevated disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )
      )}
    </div>
  );
};
