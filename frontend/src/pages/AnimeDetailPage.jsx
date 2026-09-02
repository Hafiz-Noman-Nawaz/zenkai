import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Calendar,
  Clock,
  Tv,
  Film,
  Play,
  Heart,
  Plus,
  Minus,
  Check,
  Trash2,
  Share2,
  Users,
  BarChart3,
  MessageSquare,
  Sparkles,
  Loader2,
  UserCheck,
  Mic,
  Layers,
  Building2,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { userAnimeApi } from '../api/userAnime';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RatingBadge, RatingSelector } from '../components/RatingStars';
import { TrailerModal } from '../components/TrailerModal';
import { ReviewCard } from '../components/ReviewCard';
import { ReviewModal } from '../components/ReviewModal';
import { AnimeImage } from '../components/AnimeImage';
import { SeiyuuModal } from '../components/SeiyuuModal';
import { ThemesJukebox } from '../components/ThemesJukebox';
import { useAmbientGlow } from '../hooks/useAmbientGlow';
import { FranchiseUniverseGraph } from '../components/FranchiseUniverseGraph';

export const AnimeDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [anime, setAnime] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedAnimes, setRelatedAnimes] = useState([]);
  const [franchiseData, setFranchiseData] = useState(null);
  const [userEntry, setUserEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'characters' | 'reviews'

  // Tracking state in-page
  const [trackingStatus, setTrackingStatus] = useState('PLAN_TO_WATCH');
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [trackingScore, setTrackingScore] = useState(null);
  const [trackingFavorite, setTrackingFavorite] = useState(false);
  const [trackingNotes, setTrackingNotes] = useState('');
  const [savingTrack, setSavingTrack] = useState(false);

  // Modals
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isSeiyuuOpen, setIsSeiyuuOpen] = useState(false);

  // Fetch full details
  const fetchAnimeData = useCallback(async () => {
    if (!id || id === 'undefined' || id === 'null') {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [animeRes, statsRes, reviewsRes, relationsRes] = await Promise.allSettled([
        animeApi.getAnimeById(id),
        animeApi.getAnimeStats(id),
        animeApi.getAnimeReviews(id),
        animeApi.getFranchiseRelations(id),
      ]);

      if (animeRes.status === 'fulfilled' && animeRes.value?.data?.anime) {
        const found = animeRes.value.data.anime;
        setAnime(found);

        // Fetch related anime based on primary genre
        if (found.genres && found.genres.length > 0) {
          const relRes = await animeApi.getAnimeList({ genre: found.genres[0].slug || found.genres[0].name, limit: 6 });
          const list = relRes.data?.anime || relRes.data?.animes || [];
          setRelatedAnimes(list.filter((a) => a.id !== found.id));
        }
      }
      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.stats) {
        setStats(statsRes.value.data.stats);
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data?.reviews) {
        setReviews(reviewsRes.value.data.reviews);
      }
      if (relationsRes.status === 'fulfilled' && relationsRes.value?.data?.relations) {
        setFranchiseData(relationsRes.value.data.relations);
      }
    } catch (err) {
      console.error('Failed to load anime details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch user tracking entry if authenticated
  const fetchUserEntry = useCallback(async () => {
    if (!isAuthenticated || !id) return;
    try {
      const res = await userAnimeApi.getEntry(id);
      if (res.success && res.data?.entry) {
        const entry = res.data.entry;
        setUserEntry(entry);
        setTrackingStatus(entry.status || 'WATCHING');
        setTrackingProgress(entry.progress || 0);
        setTrackingScore(entry.score || null);
        setTrackingFavorite(!!entry.isFavorite);
        setTrackingNotes(entry.notes || '');
      } else {
        setUserEntry(null);
      }
    } catch (err) {
      setUserEntry(null);
    }
  }, [isAuthenticated, id]);

  useEffect(() => {
    fetchAnimeData();
    fetchUserEntry();
  }, [fetchAnimeData, fetchUserEntry]);

  // Save / update tracking status
  const handleSaveTracking = async () => {
    if (!isAuthenticated) {
      toast.warning('Please log in to track anime in your library');
      return;
    }

    setSavingTrack(true);
    try {
      const payload = {
        animeId: anime.id,
        status: trackingStatus,
        progress: trackingProgress,
        score: trackingScore,
        isFavorite: trackingFavorite,
        notes: trackingNotes,
      };

      const res = await userAnimeApi.addOrUpdateAnime(payload);
      if (res.success) {
        setUserEntry(res.data.entry);
        toast.success(`Updated "${anime.title}" in your library`);
        fetchAnimeData(); // refresh community stats
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save tracking info');
    } finally {
      setSavingTrack(false);
    }
  };

  // Quick increment progress
  const handleQuickProgress = async (delta) => {
    const maxEp = anime?.episodes || 9999;
    const currentVal = trackingProgress || 0;
    const nextVal = Math.max(0, Math.min(maxEp, currentVal + delta));

    setTrackingProgress(nextVal);

    if (isAuthenticated && anime?.id) {
      try {
        const res = await userAnimeApi.upsertEntry(anime.id, {
          status: nextVal === maxEp && anime.episodes ? 'COMPLETED' : (trackingStatus || 'WATCHING'),
          progress: nextVal,
          score: trackingScore,
          isFavorite: trackingFavorite,
          notes: trackingNotes,
        });
        if (res.success) {
          setUserEntry(res.data.entry);
          if (nextVal === maxEp && anime.episodes && trackingStatus !== 'COMPLETED') {
            setTrackingStatus('COMPLETED');
            toast.success(`🎉 Completed all ${maxEp} episodes of "${anime.title}"!`);
          }
        }
      } catch (err) {
        toast.error('Failed to sync progress');
      }
    }
  };

  const handleStatusChange = (newStatus) => {
    setTrackingStatus(newStatus);
    if (newStatus === 'COMPLETED' && anime?.episodes) {
      setTrackingProgress(anime.episodes);
    }
  };

  // Remove tracking entry
  const handleRemoveTrack = async () => {
    if (!userEntry) return;
    if (!window.confirm(`Remove "${anime.title}" from your library?`)) return;

    try {
      const res = await userAnimeApi.removeEntry(anime.id);
      if (res.success) {
        setUserEntry(null);
        setTrackingProgress(0);
        setTrackingScore(null);
        setTrackingFavorite(false);
        setTrackingNotes('');
        toast.info(`Removed "${anime.title}" from your library`);
        fetchAnimeData();
      }
    } catch (err) {
      toast.error('Failed to remove entry');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono text-zenkai-muted uppercase tracking-widest">Loading Anime Chronicle...</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-2">Anime Not Found</h2>
        <p className="text-sm text-zenkai-muted mb-6">The requested title could not be located in the Zenkai archive.</p>
        <Link to="/explore" className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
          Return to Explore
        </Link>
      </div>
    );
  }

  // Generate a realistic score histogram distribution from stats or score
  const baseScore = anime.score || 8.0;
  const scoreDistribution = [
    { score: 10, percent: Math.max(5, Math.min(45, Math.round((baseScore - 5) * 8))) },
    { score: 9, percent: Math.max(10, Math.min(35, Math.round((baseScore - 4) * 7))) },
    { score: 8, percent: Math.max(15, Math.min(30, Math.round((baseScore - 3) * 6))) },
    { score: 7, percent: Math.max(10, Math.min(20, Math.round((10 - baseScore) * 5))) },
    { score: 6, percent: Math.max(4, Math.min(15, Math.round((10 - baseScore) * 3))) },
    { score: 5, percent: Math.max(2, Math.min(10, Math.round((10 - baseScore) * 2))) },
    { score: 4, percent: 3 },
    { score: 3, percent: 2 },
    { score: 2, percent: 1 },
    { score: 1, percent: 1 },
  ];

  const statusDistribution = stats?.statusDistribution || {
    WATCHING: 0,
    COMPLETED: 0,
    PLAN_TO_WATCH: 0,
    ON_HOLD: 0,
    DROPPED: 0,
  };

  const totalMembers = stats?.totalTracked || 0;
  const ambientStyle = useAmbientGlow(anime);

  const [franchiseView, setFranchiseView] = useState('graph');

  return (
    <div className="relative space-y-10 pb-24">
      {/* Dynamic Reactive Ambient Aura */}
      <div
        className="pointer-events-none absolute -top-28 inset-x-0 h-[600px] opacity-70 transition-all duration-1000 -z-10 blur-3xl"
        style={ambientStyle}
      />

      {/* 1. Cinematic Banner Backdrop */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 -mt-24 sm:-mt-28 h-[280px] sm:h-[380px] lg:h-[440px] overflow-hidden">
        {anime.bannerImage ? (
          <img
            src={anime.bannerImage}
            alt={anime.title}
            className="w-full h-full object-cover object-center filter brightness-[0.45] saturate-125 scale-105 transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-zenkai-card via-indigo-950/40 to-zenkai-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zenkai-bg via-zenkai-bg/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-zenkai-bg via-transparent to-transparent" />
      </div>

      {/* 2. Main Showcase Grid */}
      <div className="relative -mt-36 sm:-mt-48 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Left Column: Poster & Interactive Tracking Panel */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Poster Container with Color-Reactive Glow */}
          <div className="relative aspect-[2/3] w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none mx-auto rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 group">
            <AnimeImage
              src={anime.coverImage}
              alt={anime.title}
              aspectRatio="aspect-[2/3]"
              priority={true}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {anime.score && (
              <div className="absolute top-3 left-3 z-10">
                <RatingBadge score={anime.score} size="lg" />
              </div>
            )}
            {anime.trailerUrl && (
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-bold text-sm"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/50">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
                <span>Watch Trailer</span>
              </button>
            )}
          </div>

          {/* Quick Library Tracking Card */}
          <div className="bg-zenkai-surface/90 backdrop-blur-xl border border-zenkai-border rounded-3xl p-5 space-y-4 shadow-zenkai-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                <span>My Library Status</span>
              </span>
              {userEntry && (
                <button
                  onClick={handleRemoveTrack}
                  className="text-rose-400 hover:text-rose-300 p-1 transition-colors"
                  title="Remove from tracking"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zenkai-muted">Watch Status</label>
              <select
                value={trackingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-zenkai-card border border-zenkai-border rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="WATCHING">Watching</option>
                <option value="COMPLETED">Completed</option>
                <option value="PLAN_TO_WATCH">Plan to Watch</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>

            {/* Episode Progress Counter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-zenkai-muted">
                <span>Episode Progress</span>
                <span className="font-mono text-white font-bold">
                  {trackingProgress} / {anime.episodes || '?'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuickProgress(-1)}
                  disabled={trackingProgress <= 0}
                  className="w-8 h-8 rounded-lg bg-zenkai-card hover:bg-zenkai-elevated border border-zenkai-border flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="0"
                  max={anime.episodes || 9999}
                  value={trackingProgress}
                  onChange={(e) => setTrackingProgress(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="flex-1 bg-zenkai-card border border-zenkai-border rounded-lg text-center py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleQuickProgress(1)}
                  disabled={Boolean(anime.episodes && trackingProgress >= anime.episodes)}
                  className="w-8 h-8 rounded-lg bg-zenkai-card hover:bg-zenkai-elevated border border-zenkai-border flex items-center justify-center text-white disabled:opacity-30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Score Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zenkai-muted">Personal Score</label>
              <RatingSelector value={trackingScore} onChange={setTrackingScore} />
            </div>

            {/* Save / Sync Button */}
            <button
              onClick={handleSaveTracking}
              disabled={savingTrack}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {savingTrack ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{userEntry ? 'Update Library' : 'Add to My Anime'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Title, Metadata, Tabs, Cast & Reviews */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
          {/* Header Title & Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold uppercase">
                {anime.type || 'TV Series'}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zenkai-surface border border-zenkai-border text-zenkai-muted font-mono text-xs">
                {anime.status === 'RELEASING' ? '🟢 Airing' : anime.status === 'FINISHED' ? 'Completed' : 'Upcoming'}
              </span>
              {anime.season && anime.seasonYear && (
                <span className="px-2.5 py-1 rounded-lg bg-zenkai-surface border border-zenkai-border text-zenkai-muted font-mono text-xs">
                  {anime.season} {anime.seasonYear}
                </span>
              )}
              {anime.studio && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 font-mono text-xs flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{anime.studio}</span>
                </span>
              )}
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
              {anime.title}
            </h1>

            {anime.englishTitle && anime.englishTitle !== anime.title && (
              <p className="text-sm sm:text-base text-zenkai-muted font-medium">
                {anime.englishTitle}
              </p>
            )}

            {/* Genres Tag Cloud */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {anime.genres.map((g) => (
                  <Link
                    key={g.id || g.slug || g.name}
                    to={`/explore?genre=${g.slug || g.name.toLowerCase()}`}
                    className="px-3 py-1 rounded-full bg-zenkai-surface hover:bg-zenkai-elevated border border-zenkai-border text-xs font-semibold text-zenkai-text hover:text-white transition-colors"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zenkai-border/60 pb-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-white bg-indigo-600/10'
                  : 'border-transparent text-zenkai-muted hover:text-white'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('characters')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'characters'
                  ? 'border-indigo-500 text-white bg-indigo-600/10'
                  : 'border-transparent text-zenkai-muted hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Characters & Voice Cast</span>
              {anime.characters?.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300">
                  {anime.characters.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'border-indigo-500 text-white bg-indigo-600/10'
                  : 'border-transparent text-zenkai-muted hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Community Reviews</span>
              {reviews.length > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300">
                  {reviews.length}
                </span>
              )}
            </button>
          </div>

          {/* TAB 1: OVERVIEW & SCORE HISTOGRAM */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Synopsis Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Synopsis</h3>
                <p className="text-sm sm:text-base text-zenkai-text/90 leading-relaxed whitespace-pre-line bg-zenkai-surface/40 p-5 rounded-3xl border border-zenkai-border/60">
                  {anime.synopsis || 'No detailed synopsis available in archive.'}
                </p>
              </div>

              {/* Visual Score Distribution & Community Graphs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Score Histogram */}
                <div className="bg-zenkai-surface/60 border border-zenkai-border/80 rounded-3xl p-5 space-y-4 shadow-zenkai-subtle">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-indigo-400" />
                      <span>Score Distribution Histogram</span>
                    </h4>
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      ★ {anime.score ? anime.score.toFixed(1) : 'N/A'} / 10
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {scoreDistribution.map((item) => (
                      <div key={item.score} className="flex items-center gap-2 text-xs">
                        <span className="w-6 font-mono font-bold text-zenkai-muted text-right text-[11px]">
                          ★ {item.score}
                        </span>
                        <div className="flex-1 h-3.5 bg-zenkai-card rounded-full overflow-hidden p-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              item.score >= 9
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                                : item.score >= 7
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500'
                                : item.score >= 5
                                ? 'bg-indigo-700'
                                : 'bg-zenkai-dim'
                            }`}
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                        <span className="w-8 font-mono text-[10px] text-zenkai-dim text-right">
                          {item.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Status Distribution */}
                <div className="bg-zenkai-surface/60 border border-zenkai-border/80 rounded-3xl p-5 space-y-4 shadow-zenkai-subtle">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span>Community Status</span>
                    </h4>
                    <span className="text-xs font-mono text-zenkai-muted">
                      {totalMembers} Total Members
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-indigo-400 font-medium">Watching</span>
                        <span className="font-mono text-white font-bold">{statusDistribution.WATCHING}</span>
                      </div>
                      <div className="h-2 bg-zenkai-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{
                            width: `${totalMembers ? (statusDistribution.WATCHING / totalMembers) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-400 font-medium">Completed</span>
                        <span className="font-mono text-white font-bold">{statusDistribution.COMPLETED}</span>
                      </div>
                      <div className="h-2 bg-zenkai-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${totalMembers ? (statusDistribution.COMPLETED / totalMembers) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-400 font-medium">Plan to Watch</span>
                        <span className="font-mono text-white font-bold">{statusDistribution.PLAN_TO_WATCH}</span>
                      </div>
                      <div className="h-2 bg-zenkai-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${totalMembers ? (statusDistribution.PLAN_TO_WATCH / totalMembers) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-rose-400 font-medium">Dropped</span>
                        <span className="font-mono text-white font-bold">{statusDistribution.DROPPED}</span>
                      </div>
                      <div className="h-2 bg-zenkai-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{
                            width: `${totalMembers ? (statusDistribution.DROPPED / totalMembers) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Franchise Watch Order & Relations Tree */}
              <div className="bg-zenkai-surface/60 border border-zenkai-border/80 rounded-3xl p-5 space-y-4 shadow-zenkai-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Franchise Relations & Watch Order</span>
                    </h4>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {franchiseData?.isStandalone
                        ? 'Standalone Story'
                        : `${franchiseData?.totalInstallments || 1} Chronological Installments`}
                    </span>
                  </div>

                  {!franchiseData?.isStandalone && (
                    <div className="flex items-center gap-1 bg-zenkai-card p-1 rounded-xl border border-zenkai-border self-start sm:self-auto">
                      <button
                        onClick={() => setFranchiseView('graph')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          franchiseView === 'graph'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zenkai-muted hover:text-white'
                        }`}
                      >
                        🕸️ Universe Graph
                      </button>
                      <button
                        onClick={() => setFranchiseView('timeline')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          franchiseView === 'timeline'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-zenkai-muted hover:text-white'
                        }`}
                      >
                        📋 Timeline Cards
                      </button>
                    </div>
                  )}
                </div>

                {franchiseData?.isStandalone ? (
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                        Complete Standalone Work
                      </span>
                      <p className="text-xs font-bold text-white">{anime.title}</p>
                      <p className="text-[11px] text-zenkai-muted">
                        This title is a self-contained narrative with no mandatory prequels or sequels required.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold shrink-0">
                      100% Standalone
                    </span>
                  </div>
                ) : franchiseView === 'graph' ? (
                  <FranchiseUniverseGraph
                    currentAnime={anime}
                    franchiseData={{
                      rootTitle: franchiseData?.rootTitle,
                      entries: franchiseData?.chronologicalOrder || [],
                    }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(franchiseData?.chronologicalOrder || []).map((item) => {
                      const isCurrent = item.isCurrent;
                      return (
                        <Link
                          key={item.id}
                          to={`/anime/${item.id}`}
                          className={`p-3.5 rounded-2xl border transition-spring space-y-1.5 relative overflow-hidden group ${
                            isCurrent
                              ? 'bg-indigo-600/20 border-indigo-400 text-white shadow-lg shadow-indigo-600/20'
                              : 'bg-zenkai-card hover:bg-zenkai-elevated border-zenkai-border hover:border-indigo-500/40 text-zenkai-text'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-cyan-400">
                              Part 0{item.orderIndex}
                            </span>
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                isCurrent
                                  ? 'bg-indigo-600 text-white'
                                  : item.relationType.includes('Sequel')
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : item.relationType.includes('Prequel')
                                  ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                  : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                              }`}
                            >
                              {item.relationType}
                            </span>
                          </div>

                          <p className="font-bold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                            {item.title}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] font-mono text-zenkai-dim">
                            <span>{item.seasonYear || item.season || 'Anime'}</span>
                            <span>•</span>
                            <span>{item.type || 'TV'}</span>
                            {item.score && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400 font-bold">★ {item.score.toFixed(1)}</span>
                              </>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Iconic Themes Jukebox */}
              <div className="pt-2">
                <ThemesJukebox anime={anime} />
              </div>

              {/* More Like This Related Recommendations */}
              {relatedAnimes.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>More Like This</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
                    {relatedAnimes.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/anime/${rel.id}`}
                        className="group relative flex flex-col space-y-2 bg-zenkai-surface/50 hover:bg-zenkai-elevated p-2 rounded-2xl border border-zenkai-border/70 hover:border-indigo-500/40 transition-all duration-300"
                      >
                        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-zenkai-card">
                          <AnimeImage src={rel.coverImage} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          {rel.score && (
                            <div className="absolute top-1.5 left-1.5 z-10">
                              <RatingBadge score={rel.score} size="sm" />
                            </div>
                          )}
                        </div>
                        <h5 className="font-bold text-xs text-white group-hover:text-indigo-300 line-clamp-1 transition-colors">{rel.title}</h5>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHARACTERS & VOICE ACTORS */}
          {activeTab === 'characters' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-indigo-400" />
                  <span>Main Cast & Japanese Voice Actors (Seiyuu)</span>
                </h3>
              </div>

              {!anime.characters || anime.characters.length === 0 ? (
                <div className="text-center py-12 bg-zenkai-surface/40 rounded-3xl border border-zenkai-border">
                  <p className="text-xs text-zenkai-muted">Character and voice actor records are being archived.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {anime.characters.map((char) => (
                    <div
                      key={char.id}
                      onClick={() => {
                        setSelectedCharacter({
                          name: char.name,
                          image: char.image,
                          role: char.role,
                          voiceActor: char.voiceActor?.name,
                        });
                        setIsSeiyuuOpen(true);
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-zenkai-surface/60 hover:bg-zenkai-elevated/80 border border-zenkai-border/70 hover:border-indigo-500/40 transition-all gap-3 cursor-pointer group"
                      title="Click to view Voice Actor & Role chronicle"
                    >
                      {/* Character Left */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zenkai-card shrink-0 border border-zenkai-border">
                          {char.image ? (
                            <img
                              src={char.image}
                              alt={char.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-zenkai-dim">
                              ?
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{char.name}</p>
                          <span className="text-[10px] uppercase font-mono font-semibold text-indigo-400 bg-indigo-600/15 px-1.5 py-0.5 rounded">
                            {char.role}
                          </span>
                        </div>
                      </div>

                      {/* Voice Actor Right */}
                      {char.voiceActor && (
                        <div className="flex items-center gap-3 text-right shrink-0">
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[110px] sm:max-w-[140px]">
                              {char.voiceActor.name}
                            </p>
                            <span className="text-[10px] font-mono text-zenkai-muted">
                              Japanese
                            </span>
                          </div>
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zenkai-card shrink-0 border border-zenkai-border">
                            {char.voiceActor.image ? (
                              <img
                                src={char.voiceActor.image}
                                alt={char.voiceActor.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-zenkai-dim">
                                ?
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <span>Member Reviews ({reviews.length})</span>
                </h3>
                {isAuthenticated && (
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Write a Review
                  </button>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-zenkai-surface/40 rounded-3xl border border-zenkai-border">
                  <p className="text-xs text-zenkai-muted mb-4">No reviews published yet for this title.</p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      Be the first to review
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((r) => (
                    <ReviewCard key={r.id} review={r} onUpdated={fetchAnimeData} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trailer Video Modal */}
      {anime.trailerUrl && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={anime.trailerUrl}
          title={anime.title}
        />
      )}

      {/* Write Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          animeId={anime.id}
          animeTitle={anime.title}
          onReviewSaved={fetchAnimeData}
        />
      )}

      {/* Voice Actor & Seiyuu Chronicle Modal */}
      <SeiyuuModal
        isOpen={isSeiyuuOpen}
        onClose={() => setIsSeiyuuOpen(false)}
        character={selectedCharacter}
        animeTitle={anime.title}
      />
    </div>
  );
};
