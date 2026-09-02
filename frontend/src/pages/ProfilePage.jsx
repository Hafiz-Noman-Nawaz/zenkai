import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Calendar,
  Sparkles,
  Heart,
  BookOpen,
  Star,
  Tv,
  CheckCircle2,
  Edit3,
  MessageSquare,
  BarChart3,
  Loader2,
  Check,
  X,
  Pin,
  Clock,
  Layers,
  Bell,
  Mail,
  Smartphone,
  Send,
} from 'lucide-react';
import { usersApi, statsApi } from '../api/users';
import { userAnimeApi } from '../api/userAnime';
import { notificationApi } from '../api/notifications';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatCard } from '../components/StatCard';
import { AnimeRail } from '../components/AnimeRail';
import { ReviewCard } from '../components/ReviewCard';
import { RatingBadge } from '../components/RatingStars';
import { AnimeImage } from '../components/AnimeImage';
import { WrappedModal } from '../components/WrappedModal';
import { OtakuPassport } from '../components/OtakuPassport';

export const ProfilePage = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated, updateCurrentUser } = useAuth();
  const toast = useToast();

  const isOwnProfile = !username || (currentUser && currentUser.username === username);
  const targetUsername = username || currentUser?.username;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [watching, setWatching] = useState([]);
  const [top4List, setTop4List] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notification states
  const [isPushEnabled, setIsPushEnabled] = useState(notificationService.isPushEnabled());
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Pinboard selection modal
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [allLibraryAnimes, setAllLibraryAnimes] = useState([]);

  const fetchProfileData = useCallback(async () => {
    if (!targetUsername) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [profRes, statsRes] = await Promise.allSettled([
        usersApi.getProfile(targetUsername),
        statsApi.getUserStats(targetUsername),
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.data?.profile) {
        const prof = profRes.value.data.profile;
        setProfile(prof);
        setEditDisplayName(prof.displayName || '');
        setEditBio(prof.bio || '');
        setEditAvatar(prof.avatar || '');

        // Extract favorites & watching
        if (prof.userAnimes) {
          const favs = prof.userAnimes.filter((e) => e.isFavorite && e.anime).map((e) => e.anime);
          const watch = prof.userAnimes.filter((e) => e.status === 'WATCHING' && e.anime).map((e) => e.anime);
          const allAnimes = prof.userAnimes.map((e) => e.anime).filter(Boolean);

          setFavorites(favs);
          setWatching(watch);
          setAllLibraryAnimes(allAnimes);

          // Build top 4: prioritize favorites, then highest rated
          const sortedByScore = [...prof.userAnimes]
            .filter((e) => e.anime)
            .sort((a, b) => (b.score || 0) - (a.score || 0) || (b.isFavorite ? 1 : -1))
            .map((e) => e.anime);

          setTop4List(favs.length >= 4 ? favs.slice(0, 4) : sortedByScore.slice(0, 4));
        }
      }

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.statistics) {
        setStats(statsRes.value.data.statistics);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }, [targetUsername]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await usersApi.updateProfile({
        displayName: editDisplayName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar.trim(),
      });
      if (res.success) {
        setProfile(res.data.user);
        if (isOwnProfile && updateCurrentUser) {
          updateCurrentUser(res.data.user);
        }
        toast.success('Profile updated successfully');
        setIsEditingProfile(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSelectTop4 = (anime) => {
    if (top4List.some((a) => a.id === anime.id)) {
      setTop4List((prev) => prev.filter((a) => a.id !== anime.id));
    } else {
      if (top4List.length >= 4) {
        toast.info('You can select up to 4 favorite anime');
        return;
      }
      setTop4List((prev) => [...prev, anime]);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-mono text-zenkai-muted uppercase tracking-wider">
          Loading Otaku Profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">User Not Found</h2>
        <p className="text-sm text-zenkai-muted">
          The user @{targetUsername} does not exist or has closed their account.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Derive stats
  const totalTitles = stats?.totalAnimeTracked || profile.stats?.totalAnime || 0;
  const episodesWatched = stats?.totalEpisodesWatched || profile.stats?.episodesWatched || 0;
  const daysWatched = stats?.daysWatched ? stats.daysWatched.toFixed(1) : (episodesWatched * 24 / 1440).toFixed(1);
  const hoursWatched = Math.round((episodesWatched * 24) / 60);
  const averageRating = stats?.meanScore ? stats.meanScore.toFixed(1) : 'N/A';
  const statusCounts = stats?.statusDistribution || {};
  const genreBreakdown = stats?.genreBreakdown || [];

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Profile Header Showcase */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-zenkai-surface/60 border border-zenkai-border shadow-zenkai-subtle overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={
                  profile.avatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`
                }
                alt={profile.username}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/30 object-cover shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full ring-4 ring-zenkai-card" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                  {profile.displayName || profile.username}
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                  Otaku Tier
                </span>
              </div>

              <p className="text-xs text-zenkai-dim font-mono">@{profile.username}</p>

              {profile.bio && (
                <p className="text-xs sm:text-sm text-zenkai-text/90 max-w-xl leading-relaxed pt-1">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center gap-4 text-[11px] text-zenkai-muted pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-zenkai-dim" />
                  Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zenkai-dim" />
                  {hoursWatched} Hours Watched
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="shrink-0 self-stretch sm:self-auto flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsWrappedOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-xs font-bold text-purple-200 shadow-lg shadow-purple-500/20 transition-all btn-press"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Otaku Wrapped</span>
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-zenkai-card hover:bg-zenkai-elevated border border-zenkai-border text-xs font-semibold text-white shadow-sm transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3D Holographic Otaku Passport */}
      <OtakuPassport
        user={profile}
        stats={stats}
        library={allLibraryAnimes}
        topFavorites={top4List.length > 0 ? top4List : favorites}
      />

      {/* 2. Top 4 Favorites Pinboard Showcase (Letterboxd Style) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-400 rotate-45" />
              <span>Top 4 Favorite Anime</span>
            </h2>
            <p className="text-xs text-zenkai-muted">
              Pinnacle anime milestones curated by @{profile.username}
            </p>
          </div>
          {isOwnProfile && allLibraryAnimes.length > 0 && (
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              Curate Top 4
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {top4List.length > 0
            ? top4List.map((anime, idx) => (
                <Link
                  key={anime.id}
                  to={`/anime/${anime.id}`}
                  className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-zenkai-card border-2 border-amber-500/30 hover:border-amber-400 shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                >
                  <AnimeImage
                    src={anime.coverImage}
                    alt={anime.title}
                    aspectRatio="aspect-[2/3]"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Gold Pin Badge */}
                  <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[11px] flex items-center justify-center shadow-lg shadow-amber-500/30">
                    #{idx + 1}
                  </div>
                  {anime.score && (
                    <div className="absolute top-2 right-2 z-10">
                      <RatingBadge score={anime.score} size="sm" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <span className="font-bold text-xs text-white line-clamp-2">{anime.title}</span>
                  </div>
                </Link>
              ))
            : Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[2/3] rounded-2xl bg-zenkai-surface/40 border border-dashed border-zenkai-border flex flex-col items-center justify-center p-4 text-center text-zenkai-dim"
                >
                  <Pin className="w-6 h-6 opacity-30 mb-2 rotate-45" />
                  <span className="text-xs font-mono">Pin #{idx + 1}</span>
                </div>
              ))}
        </div>
      </div>

      {/* 3. Personal Anime Journey & Statistics Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Watch Analytics & Life Investment</span>
          </h2>
          <p className="text-xs text-zenkai-muted">
            Aggregated metrics based on personal watch progress and ratings
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <StatCard
            icon={BookOpen}
            label="Total in Library"
            value={totalTitles}
            subtext="Titles tracked"
            color="indigo"
          />
          <StatCard
            icon={Tv}
            label="Episodes Watched"
            value={episodesWatched}
            subtext={`${daysWatched} days (${hoursWatched}h total)`}
            color="sky"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed Anime"
            value={statusCounts.COMPLETED || profile.stats?.completed || 0}
            subtext="Finished series"
            color="emerald"
          />
          <StatCard
            icon={Star}
            label="Average Rating"
            value={`★ ${averageRating}`}
            subtext="Personal score mean"
            color="amber"
          />
        </div>
      </div>

      {/* 4. Genre Taste Distribution Breakdown */}
      {genreBreakdown.length > 0 && (
        <div className="p-6 rounded-3xl bg-zenkai-surface/70 border border-zenkai-border space-y-4 shadow-zenkai-subtle">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Taste Profile & Genre Distribution</span>
            </h3>
            <span className="text-xs text-zenkai-dim font-mono">Calculated from library history</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {genreBreakdown.slice(0, 6).map((g) => {
              const maxCount = genreBreakdown[0]?.count || 1;
              const percent = Math.round((g.count / maxCount) * 100);

              return (
                <div key={g.genre} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{g.genre}</span>
                    <span className="text-zenkai-dim font-mono">
                      {g.count} titles ({g.episodes} eps)
                    </span>
                  </div>
                  <div className="w-full bg-zenkai-card h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Favorites Showcase Rail */}
      {favorites.length > 0 && (
        <AnimeRail
          title="Favorite Anime Showcase"
          subtitle="Hand-picked milestone series chosen by the user"
          animes={favorites}
          viewAllLink={isOwnProfile ? '/my-anime?favorites=true' : null}
        />
      )}

      {/* 6. Currently Watching Rail */}
      {watching.length > 0 && (
        <AnimeRail
          title="Currently Watching"
          subtitle="Currently ongoing viewing list"
          animes={watching}
          viewAllLink={isOwnProfile ? '/my-anime?status=WATCHING' : null}
        />
      )}

      {/* 7. User Published Reviews */}
      {profile.reviews && profile.reviews.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Published Reviews ({profile.reviews.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.reviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={{ ...rev, user: profile }}
                showAnime={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* 6. Notification & Radar Preferences (Only on Own Profile) */}
      {isOwnProfile && (
        <div className="bg-zenkai-surface/60 border border-zenkai-border/80 rounded-3xl p-5 sm:p-6 space-y-4 shadow-zenkai-subtle">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" />
              <span>Simulcast Radar & Notification Preferences</span>
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Real-Time Alerts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mobile Push Alert Card */}
            <div className="p-4 rounded-2xl bg-zenkai-card border border-zenkai-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Mobile & Browser Push Alerts</h4>
                    <p className="text-[11px] text-zenkai-muted">Pings your phone when tracked episodes air</p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const nextState = !isPushEnabled;
                    if (nextState) {
                      const granted = await notificationService.requestPermission();
                      if (granted) {
                        setIsPushEnabled(true);
                        toast.success('Mobile & browser push alerts enabled!');
                        notificationService.sendTestNotification();
                      } else {
                        toast.error('Push notification permission was denied by your browser.');
                      }
                    } else {
                      notificationService.setPushEnabled(false);
                      setIsPushEnabled(false);
                      toast.info('Push alerts disabled.');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                    isPushEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                  }`}
                >
                  {isPushEnabled ? 'Active ✓' : 'Enable'}
                </button>
              </div>

              {isPushEnabled && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      notificationService.sendTestNotification();
                      toast.success('Dispatched test ping to device!');
                    }}
                    className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>Send Test Push Ping →</span>
                  </button>
                </div>
              )}
            </div>

            {/* Email Digest Alert Card */}
            <div className="p-4 rounded-2xl bg-zenkai-card border border-zenkai-border/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Email Airing Digests</h4>
                    <p className="text-[11px] text-zenkai-muted">Dispatches weekly recaps & season alerts</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                  Active
                </span>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  disabled={sendingTestEmail}
                  onClick={async () => {
                    setSendingTestEmail(true);
                    try {
                      await notificationApi.sendTestEmail();
                      toast.success(`Dispatched simulated airing alert to ${currentUser?.email || 'your email'}!`);
                    } catch (err) {
                      toast.error('Could not send test email.');
                    } finally {
                      setSendingTestEmail(false);
                    }
                  }}
                  className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  {sendingTestEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  <span>Send Test Email Digest →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Curate Top 4 Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-zenkai-card border border-zenkai-border rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zenkai-border">
              <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-400 rotate-45" />
                <span>Select Your Top 4 Anime ({top4List.length} / 4)</span>
              </h3>
              <button onClick={() => setIsPinModalOpen(false)} className="p-1 text-zenkai-dim hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {allLibraryAnimes.map((a) => {
                const isSelected = top4List.some((t) => t.id === a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => handleSelectTop4(a)}
                    className={`relative aspect-[2/3] rounded-xl overflow-hidden border-2 transition-all group ${
                      isSelected ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-zenkai-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <AnimeImage src={a.coverImage} alt={a.title} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-xs">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25"
              >
                Save Top 4 Pinboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div
            className="w-full max-w-md bg-zenkai-card border border-zenkai-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-zenkai-border bg-zenkai-surface/90">
              <h3 className="text-sm font-bold text-white">Edit Profile Details</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 text-zenkai-dim hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zenkai-text">Display Name</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="e.g. Kenji Tanaka"
                  className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zenkai-text">Bio / Taste Summary</label>
                <textarea
                  rows="3"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Share your favorite genres, director tastes, or tracking philosophy..."
                  className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zenkai-text">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://... avatar image link"
                  className="w-full bg-zenkai-surface border border-zenkai-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zenkai-muted hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  {savingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Otaku Wrapped Modal */}
      <WrappedModal
        isOpen={isWrappedOpen}
        onClose={() => setIsWrappedOpen(false)}
        user={profile}
        stats={stats}
        favorites={top4List.length > 0 ? top4List : favorites}
        library={allLibraryAnimes}
      />
    </div>
  );
};
