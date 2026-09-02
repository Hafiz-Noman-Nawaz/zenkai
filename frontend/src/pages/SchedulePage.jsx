import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Radio,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Plus,
  Play,
  Film,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { userAnimeApi } from '../api/userAnime';
import { useAuth } from '../context/AuthContext';
import { AnimeImage } from '../components/AnimeImage';
import { RatingBadge } from '../components/RatingStars';
import { TrackModal } from '../components/TrackModal';
import { EmptyState } from '../components/EmptyState';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SchedulePage = () => {
  const { isAuthenticated } = useAuth();
  const currentDayIndex = new Date().getDay(); // 0 is Sunday
  const todayName = currentDayIndex === 0 ? 'Sunday' : DAYS[currentDayIndex - 1];

  const [activeDay, setActiveDay] = useState(todayName);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [onlyMyShows, setOnlyMyShows] = useState(false);
  const [userEntriesMap, setUserEntriesMap] = useState({});
  const [activeTrackAnime, setActiveTrackAnime] = useState(null);

  // Fetch schedule and user library
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [scheduleRes, libraryRes] = await Promise.allSettled([
        animeApi.getWeeklySchedule(),
        isAuthenticated ? userAnimeApi.getMyList({ limit: 200 }) : Promise.resolve({ data: { list: [] } }),
      ]);

      if (scheduleRes.status === 'fulfilled' && scheduleRes.value?.data?.schedule) {
        setScheduleData(scheduleRes.value.data.schedule);
      }

      if (libraryRes.status === 'fulfilled' && libraryRes.value?.data?.list) {
        const map = {};
        libraryRes.value.data.list.forEach((entry) => {
          map[entry.animeId] = entry;
        });
        setUserEntriesMap(map);
      }
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Format time until airing helper
  const formatTimeUntil = (airingAt) => {
    const diffSec = airingAt - Math.floor(Date.now() / 1000);
    if (diffSec <= 0) {
      const timeStr = new Date(airingAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `Aired at ${timeStr}`;
    }

    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);

    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${mins}m`;
    return `in ${mins}m`;
  };

  const dayShows = scheduleData[activeDay] || [];
  const filteredShows = onlyMyShows
    ? dayShows.filter((item) => userEntriesMap[item.anime?.id])
    : dayShows;

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zenkai-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse text-rose-400" />
            <span>Simulcast Broadcast Schedule</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Weekly Airing Calendar
          </h1>
          <p className="text-xs sm:text-sm text-zenkai-muted mt-1">
            Track live episode broadcasts across Japan and streaming services, automatically converted to your local time.
          </p>
        </div>

        {/* Filter Switcher: All Airing vs My Shows */}
        {isAuthenticated && (
          <button
            onClick={() => setOnlyMyShows(!onlyMyShows)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
              onlyMyShows
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/25'
                : 'bg-zenkai-surface text-zenkai-muted border-zenkai-border hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${onlyMyShows ? 'fill-white' : ''}`} />
            <span>My Airing Shows Only</span>
          </button>
        )}
      </div>

      {/* 2. Day of Week Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar sm:grid sm:grid-cols-7 pb-1">
        {DAYS.map((day) => {
          const isToday = day === todayName;
          const isActive = day === activeDay;
          const count = (scheduleData[day] || []).length;

          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-2xl border transition-spring shrink-0 min-w-[75px] sm:min-w-0 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/20 scale-[1.02]'
                  : isToday
                  ? 'bg-zenkai-surface/90 text-white border-indigo-500/40 hover:bg-zenkai-elevated'
                  : 'bg-zenkai-surface/60 text-zenkai-muted border-zenkai-border hover:text-white hover:bg-zenkai-elevated'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold uppercase tracking-wider">{day.slice(0, 3)}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-mono opacity-70 mt-0.5">
                {count} {count === 1 ? 'Show' : 'Shows'}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Shows List for the Selected Day */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-zenkai-surface/60 rounded-2xl" />
          ))}
        </div>
      ) : filteredShows.length === 0 ? (
        <EmptyState
          title={onlyMyShows ? `No tracked shows airing on ${activeDay}` : `No broadcasts scheduled for ${activeDay}`}
          description={
            onlyMyShows
              ? 'You are not tracking any anime currently releasing on this day. Explore the catalog to add upcoming simulcasts!'
              : 'Broadcast schedules update dynamically as release dates and episode airings are announced.'
          }
          actionLabel="Explore All Anime"
          actionLink="/explore"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShows.map((item) => {
            const anime = item.anime;
            if (!anime) return null;
            const userEntry = userEntriesMap[anime.id];
            const timeUntil = formatTimeUntil(item.airingAt);
            const localAirTime = new Date(item.airingAt * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.scheduleId}
                className="group relative flex gap-4 p-3.5 rounded-2xl bg-zenkai-surface/60 hover:bg-zenkai-elevated/90 border border-zenkai-border/80 hover:border-indigo-500/40 transition-all duration-300 shadow-zenkai-subtle"
              >
                {/* Poster Artwork */}
                <Link
                  to={`/anime/${anime.id}`}
                  className="shrink-0 w-20 aspect-[2/3] rounded-xl overflow-hidden bg-zenkai-card relative shadow-md group-hover:scale-105 transition-transform duration-300"
                >
                  <AnimeImage
                    src={anime.coverImage}
                    alt={anime.title}
                    aspectRatio="aspect-[2/3]"
                    className="w-full h-full object-cover"
                  />
                  {anime.score && (
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <RatingBadge score={anime.score} size="sm" />
                    </div>
                  )}
                </Link>

                {/* Show Details & Airing Badge */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    {/* Airing Time Badge */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-300 bg-indigo-600/20 border border-indigo-500/30 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        <span>Ep {item.episode}</span>
                        <span className="opacity-60">• {localAirTime}</span>
                      </span>

                      <span className="text-[10px] font-mono text-zenkai-dim">
                        {timeUntil}
                      </span>
                    </div>

                    <Link
                      to={`/anime/${anime.id}`}
                      className="font-bold text-xs sm:text-sm text-white hover:text-indigo-300 transition-colors line-clamp-2 block"
                    >
                      {anime.title}
                    </Link>

                    {anime.genres && anime.genres.length > 0 && (
                      <p className="text-[11px] text-zenkai-muted mt-1 truncate">
                        {anime.genres.slice(0, 2).map((g) => g.name).join(' • ')}
                      </p>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-zenkai-border/40 mt-2">
                    <span className="text-[10px] uppercase font-mono text-zenkai-dim">
                      {anime.type || 'TV'} {anime.duration ? `• ${anime.duration}m` : ''}
                    </span>

                    <button
                      onClick={() => setActiveTrackAnime(anime)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        userEntry
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-zenkai-card hover:bg-zenkai-elevated text-zenkai-muted hover:text-white border-zenkai-border'
                      }`}
                    >
                      {userEntry ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Tracked</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Track</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Track Modal */}
      {activeTrackAnime && (
        <TrackModal
          isOpen={Boolean(activeTrackAnime)}
          onClose={() => setActiveTrackAnime(null)}
          anime={activeTrackAnime}
          initialEntry={userEntriesMap[activeTrackAnime.id]}
          onUpdated={fetchData}
        />
      )}
    </div>
  );
};
