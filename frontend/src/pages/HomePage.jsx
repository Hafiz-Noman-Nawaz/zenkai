import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Tv, Compass, Flame, Film, ArrowRight, BookOpen, Star } from 'lucide-react';
import { animeApi } from '../api/anime';
import { userAnimeApi } from '../api/userAnime';
import { reviewsApi } from '../api/reviews';
import { useAuth } from '../context/AuthContext';
import { HeroSection } from '../components/HeroSection';
import { AnimeRail } from '../components/AnimeRail';
import { ReviewCard } from '../components/ReviewCard';
import { RailSkeleton } from '../components/SkeletonLoader';
import { AnimeImage } from '../components/AnimeImage';
import { VersusArena } from '../components/VersusArena';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();

  const [spotlightAnime, setSpotlightAnime] = useState(null);
  const [airingAnime, setAiringAnime] = useState([]);
  const [topRatedAnime, setTopRatedAnime] = useState([]);
  const [seasonAnime, setSeasonAnime] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [recommendedAnime, setRecommendedAnime] = useState([]);
  const [userWatching, setUserWatching] = useState([]);
  const [userEntriesMap, setUserEntriesMap] = useState({});
  const [recentReviews, setRecentReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all user tracking entries into a quick lookup map
  const fetchUserLibrary = useCallback(async () => {
    if (!isAuthenticated) {
      setUserEntriesMap({});
      setUserWatching([]);
      return;
    }

    try {
      const response = await userAnimeApi.getMyList({ limit: 1000 });
      if (response.success && response.data?.list) {
        const map = {};
        const watching = [];
        response.data.list.forEach((entry) => {
          map[entry.animeId] = entry;
          if (entry.status === 'WATCHING') {
            watching.push(entry);
          }
        });
        setUserEntriesMap(map);
        setUserWatching(watching);
      }
    } catch (err) {
      console.warn('Could not fetch user tracking map:', err.message);
    }
  }, [isAuthenticated]);

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        spotlightRes,
        airingRes,
        topRatedRes,
        seasonRes,
        trendingRes,
        recRes,
        reviewsRes,
      ] = await Promise.allSettled([
        animeApi.getAnimeList({ sortBy: 'score', sortOrder: 'desc', limit: 5 }),
        animeApi.getAnimeList({ status: 'RELEASING', limit: 10 }),
        animeApi.getAnimeList({ sortBy: 'score', sortOrder: 'desc', limit: 10 }),
        animeApi.getAnimeList({ season: 'WINTER', seasonYear: 2026, limit: 10 }),
        animeApi.getAnimeList({ sortBy: 'popularity', sortOrder: 'desc', limit: 10 }),
        animeApi.getRecommendations(10),
        reviewsApi.getRecentReviews({ limit: 4 }),
      ]);

      if (spotlightRes.status === 'fulfilled') {
        const list = spotlightRes.value?.data?.anime || spotlightRes.value?.data?.animes || [];
        setSpotlightAnime(list);
      }
      if (airingRes.status === 'fulfilled') {
        const list = airingRes.value?.data?.anime || airingRes.value?.data?.animes || [];
        setAiringAnime(list);
      }
      if (topRatedRes.status === 'fulfilled') {
        const list = topRatedRes.value?.data?.anime || topRatedRes.value?.data?.animes || [];
        setTopRatedAnime(list);
      }
      if (seasonRes.status === 'fulfilled') {
        const list = seasonRes.value?.data?.anime || seasonRes.value?.data?.animes || [];
        setSeasonAnime(list);
      }
      if (trendingRes.status === 'fulfilled') {
        const list = trendingRes.value?.data?.anime || trendingRes.value?.data?.animes || [];
        setTrendingAnime(list);
      }
      if (recRes.status === 'fulfilled') {
        const list = recRes.value?.data?.recommendations || [];
        setRecommendedAnime(list);
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value?.data?.reviews) {
        setRecentReviews(reviewsRes.value.data.reviews);
      }
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
    fetchUserLibrary();
  }, [fetchHomeData, fetchUserLibrary]);

  const handleTrackUpdated = () => {
    fetchUserLibrary();
  };

  const studios = [
    { name: 'MAPPA', count: 'Jujutsu Kaisen, CSM' },
    { name: 'Ufotable', count: 'Demon Slayer, Fate' },
    { name: 'Madhouse', count: 'Frieren, Death Note' },
    { name: 'Wit Studio', count: 'AOT S1-3, Spy x Family' },
    { name: 'Bones', count: 'Mob Psycho, MHA' },
    { name: 'Kyoto Animation', count: 'Violet Evergarden' },
    { name: 'CloverWorks', count: 'Bocchi, Promised Neverland' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* 1. EDITORIAL HERO SPOTLIGHT */}
      {loading && (!spotlightAnime || spotlightAnime.length === 0) ? (
        <div className="w-full h-[480px] rounded-3xl bg-zenkai-surface/50 border border-zenkai-border/50 animate-pulse" />
      ) : spotlightAnime && (Array.isArray(spotlightAnime) ? spotlightAnime.length > 0 : Boolean(spotlightAnime)) ? (
        <HeroSection
          spotlights={Array.isArray(spotlightAnime) ? spotlightAnime : [spotlightAnime]}
          userEntriesMap={userEntriesMap}
          onTrackUpdated={handleTrackUpdated}
        />
      ) : null}

      {/* 2. PRODUCTION POWERHOUSE STUDIOS SHOWCASE */}
      <div className="p-6 rounded-3xl glass-luxury border border-white/10 space-y-3.5 shadow-zenkai-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Powerhouse Production Studios</span>
          </div>
          <span className="text-[11px] font-mono text-zenkai-dim">Curated Masterpieces</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {studios.map((st) => (
            <Link
              key={st.name}
              to={`/explore?q=${encodeURIComponent(st.name)}`}
              className="p-3 rounded-2xl bg-zenkai-surface/60 hover:bg-zenkai-elevated border border-zenkai-border hover:border-indigo-500/50 transition-spring group text-left"
            >
              <p className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">{st.name}</p>
              <p className="text-[10px] text-zenkai-dim font-mono truncate mt-0.5">{st.count}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. LUXURY BENTO DISCOVERY HUB */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Bento 1: Live Simulcast Broadcast Radar (Cols 1-7) */}
        <div className="md:col-span-7 p-6 sm:p-8 rounded-3xl glass-luxury border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-cyan-500/40 transition-spring">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Simulcast Broadcast Radar</span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white">
              Broadcasting Live This Week
            </h3>
            <p className="text-xs sm:text-sm text-zenkai-muted max-w-lg leading-relaxed">
              Track upcoming episodes converted directly to your local timezone with live countdowns and airtime notifications.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
                Winter 2026 Season
              </span>
              <span className="text-xs text-zenkai-dim font-mono hidden sm:inline">14 Shows Airing Today</span>
            </div>

            <Link
              to="/schedule"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-lg shadow-cyan-500/25 transition-spring btn-press"
            >
              <span>View Live Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bento 2: Anime Gacha & Choice Paralysis Engine (Cols 8-12) */}
        <div className="md:col-span-5 p-6 sm:p-8 rounded-3xl glass-luxury border border-white/10 relative overflow-hidden flex flex-col justify-between space-y-6 group hover:border-purple-500/40 transition-spring">
          <div className="absolute top-0 right-0 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Zenkai Gacha Engine</span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white">
              Cure Choice Paralysis
            </h3>
            <p className="text-xs sm:text-sm text-zenkai-muted leading-relaxed">
              Spin the roulette wheel to let fate pick your next anime obsession by mood, minimum score, or personal watchlist.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 relative z-10 flex items-center justify-between">
            <span className="text-xs font-mono text-zenkai-dim">500+ Curated Pool</span>
            <Link
              to="/random"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-spring btn-press"
            >
              <span>Spin Gacha</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. PERSONAL CONTINUE WATCHING AREA (If authenticated and has watching entries) */}
      {isAuthenticated && userWatching.length > 0 && (
        <section className="space-y-4 bg-gradient-to-r from-indigo-950/20 via-zenkai-surface/40 to-transparent p-6 rounded-3xl border border-indigo-500/20 shadow-zenkai-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg sm:text-xl text-white">
                  Continue Watching
                </h2>
                <p className="text-xs text-zenkai-muted">
                  Pick up right where you left off
                </p>
              </div>
            </div>
            <Link
              to="/my-anime?status=WATCHING"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>Manage List</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userWatching.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zenkai-card/90 border border-zenkai-border/80 hover:border-indigo-500/30 transition-all shadow-sm group"
              >
                <Link
                  to={`/anime/${entry.anime?.id || entry.animeId}`}
                  className="shrink-0 w-14 aspect-[2/3] relative overflow-hidden rounded-xl"
                >
                  <AnimeImage
                    src={entry.anime?.coverImage}
                    alt={entry.anime?.title}
                    aspectRatio="aspect-[2/3]"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </Link>

                <div className="flex-1 min-w-0 space-y-1">
                  <Link
                    to={`/anime/${entry.anime?.id || entry.animeId}`}
                    className="font-bold text-xs sm:text-sm text-white hover:text-indigo-300 transition-colors truncate block"
                  >
                    {entry.anime?.title || 'Anime Title'}
                  </Link>
                  <p className="text-[11px] text-zenkai-muted">
                    Progress: <span className="font-mono font-bold text-indigo-300">Ep {entry.progress}</span> / {entry.anime?.episodes || '??'}
                  </p>
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-zenkai-surface h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          entry.anime?.episodes
                            ? Math.min(100, (entry.progress / entry.anime.episodes) * 100)
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <Link
                  to={`/anime/${entry.anime?.id || entry.animeId}`}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold shrink-0 transition-all"
                >
                  +1 Ep
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. DISCOVERY RAILS */}
      {loading ? (
        <div className="space-y-12">
          <RailSkeleton />
          <RailSkeleton />
          <RailSkeleton />
        </div>
      ) : (
        <div className="space-y-14">
          {/* Currently Airing Rail */}
          {airingAnime.length > 0 && (
            <AnimeRail
              title="Currently Airing"
              subtitle="Broadcasting this season worldwide"
              animes={airingAnime}
              viewAllLink="/explore?status=RELEASING"
              userEntriesMap={userEntriesMap}
              onTrackUpdated={handleTrackUpdated}
            />
          )}

          {/* Recommended For You Rail */}
          {recommendedAnime.length > 0 && (
            <AnimeRail
              title="Recommended For You"
              subtitle="Personalized titles tailored to your watch history and taste"
              animes={recommendedAnime}
              viewAllLink="/explore"
              userEntriesMap={userEntriesMap}
              onTrackUpdated={handleTrackUpdated}
            />
          )}

          {/* Top Rated Masterpieces Rail */}
          {topRatedAnime.length > 0 && (
            <AnimeRail
              title="Top Rated Masterpieces"
              subtitle="Critically acclaimed titles across all eras"
              animes={topRatedAnime}
              viewAllLink="/explore?sortBy=score"
              userEntriesMap={userEntriesMap}
              onTrackUpdated={handleTrackUpdated}
            />
          )}

          {/* Current Season Rail */}
          {seasonAnime.length > 0 && (
            <AnimeRail
              title="Winter 2026 Season"
              subtitle="The freshest releases of the current season"
              animes={seasonAnime}
              viewAllLink="/explore?season=WINTER&seasonYear=2026"
              userEntriesMap={userEntriesMap}
              onTrackUpdated={handleTrackUpdated}
            />
          )}

          {/* Trending & Popular Rail */}
          {trendingAnime.length > 0 && (
            <AnimeRail
              title="Most Popular on Zenkai"
              subtitle="Most tracked and discussed titles by the community"
              animes={trendingAnime}
              viewAllLink="/explore?sortBy=popularity"
              userEntriesMap={userEntriesMap}
              onTrackUpdated={handleTrackUpdated}
            />
          )}
        </div>
      )}

      {/* 4. Weekly Community Versus Duel Arena */}
      <section className="pt-2">
        <VersusArena />
      </section>

      {/* 5. RECENT COMMUNITY REVIEWS SECTION */}
      {recentReviews.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display font-bold text-xl text-white tracking-tight">
                Community Reviews & Essays
              </h2>
              <p className="text-xs text-zenkai-muted mt-0.5">
                Thoughtful reflections and critiques from fellow anime enthusiasts
              </p>
            </div>
            <Link
              to="/reviews"
              className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <span>View All Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showAnime={true}
                onDeleted={(id) =>
                  setRecentReviews((prev) => prev.filter((r) => r.id !== id))
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
