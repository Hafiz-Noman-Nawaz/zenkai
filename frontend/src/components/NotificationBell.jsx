import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Sparkles,
  Calendar,
  Check,
  ExternalLink,
  Flame,
  Smartphone,
  BellRing,
  Tv,
  Star,
  Film,
  Zap,
} from 'lucide-react';
import { animeApi } from '../api/anime';
import { notificationApi } from '../api/notifications';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

export const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [airingAlerts, setAiringAlerts] = useState([]);
  const [franchiseAlerts, setFranchiseAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'airing' | 'franchise'
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPushActive, setIsPushActive] = useState(notificationService.isPushEnabled());
  const dropdownRef = useRef(null);

  useEffect(() => {
    setIsPushActive(notificationService.isPushEnabled());
  }, [isOpen]);

  useEffect(() => {
    const fetchRadarFeed = async () => {
      try {
        if (isAuthenticated) {
          const res = await notificationApi.getUserRadar();
          if (res.success && res.data) {
            const airing = res.data.airingAlerts || [];
            const franchise = res.data.franchiseAlerts || [];
            setAiringAlerts(airing);
            setFranchiseAlerts(franchise);
            const total = airing.length + franchise.length;
            setUnreadCount(total);

            // Push notification trigger if enabled
            if (notificationService.isPushEnabled()) {
              if (airing.length > 0) {
                const topAiring = airing[0];
                notificationService.notifyEpisodeRelease(topAiring.title, topAiring.episode, topAiring.animeId);
              } else if (franchise.length > 0) {
                const topFranchise = franchise[0];
                notificationService.notifyEpisodeRelease(
                  `🌟 New Announcement: ${topFranchise.title}`,
                  topFranchise.badge,
                  topFranchise.animeId
                );
              }
            }
            return;
          }
        }

        // Fallback for guest
        const schedRes = await animeApi.getWeeklySchedule();
        if (schedRes.success && schedRes.data?.schedule) {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = days[new Date().getDay()];
          const todayShows = schedRes.data.schedule[today] || [];

          const alerts = todayShows.slice(0, 6).map((item, idx) => {
            const showId = item.anime?.id || item.anime?.externalId;
            return {
              id: `alert-${showId || idx}`,
              type: 'AIRING_EPISODE',
              animeId: showId,
              title: item.anime?.title,
              coverImage: item.anime?.coverImage,
              episode: item.episode || 'New',
              badge: `Ep ${item.episode} • Today`,
              timeAgo: 'Broadcasting Today',
            };
          });

          setAiringAlerts(alerts);
          setUnreadCount(alerts.length);
        }
      } catch (e) {
        console.warn('Could not load notification alerts:', e);
      }
    };

    fetchRadarFeed();
  }, [isAuthenticated]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const handleTogglePush = async () => {
    if (!isPushActive) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setIsPushActive(true);
        notificationService.sendTestNotification();
      }
    } else {
      notificationService.setPushEnabled(false);
      setIsPushActive(false);
    }
  };

  const allAlerts = [
    ...airingAlerts.map((a) => ({ ...a, category: 'airing' })),
    ...franchiseAlerts.map((f) => ({ ...f, category: 'franchise' })),
  ];

  const displayedAlerts =
    activeTab === 'airing'
      ? airingAlerts
      : activeTab === 'franchise'
      ? franchiseAlerts
      : allAlerts;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-zenkai-surface/80 hover:bg-zenkai-elevated border border-white/10 text-zenkai-muted hover:text-white transition-spring btn-press"
        title="Simulcast & Franchise Radar"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-rose-500 to-amber-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl glass-luxury border border-white/10 shadow-2xl z-50 p-4 animate-scale-in space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Anime Radar</span>
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  {unreadCount} Alerts
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-zenkai-muted hover:text-white flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-zenkai-surface/60 rounded-xl border border-white/5 text-[11px]">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1 rounded-lg font-bold transition-colors ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zenkai-muted hover:text-white'
              }`}
            >
              All ({allAlerts.length})
            </button>
            <button
              onClick={() => setActiveTab('airing')}
              className={`flex-1 py-1 rounded-lg font-bold transition-colors flex items-center justify-center gap-1 ${
                activeTab === 'airing'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zenkai-muted hover:text-white'
              }`}
            >
              <Tv className="w-3 h-3 text-cyan-400" />
              <span>Episodes ({airingAlerts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('franchise')}
              className={`flex-1 py-1 rounded-lg font-bold transition-colors flex items-center justify-center gap-1 ${
                activeTab === 'franchise'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zenkai-muted hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Seasons ({franchiseAlerts.length})</span>
            </button>
          </div>

          {/* Mobile & Desktop Push Notification Toggle */}
          <div className="p-2.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate">Mobile Push Radar</p>
                <p className="text-[10px] text-zenkai-dim truncate">Airing episodes & new season alerts</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isPushActive && (
                <button
                  onClick={() => notificationService.sendTestNotification()}
                  className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono text-cyan-300 border border-white/10 transition-colors"
                  title="Send instant test alert to device"
                >
                  Test
                </button>
              )}
              <button
                onClick={handleTogglePush}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-spring ${
                  isPushActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-indigo-600 text-white shadow-sm'
                }`}
              >
                {isPushActive ? 'Active ✓' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="space-y-2 max-h-64 overflow-y-auto hide-scrollbar">
            {displayedAlerts.length > 0 ? (
              displayedAlerts.map((n) => {
                const isFranchise = n.type === 'FRANCHISE_ANNOUNCEMENT' || n.category === 'franchise';

                return (
                  <Link
                    key={n.id}
                    to={`/anime/${n.animeId}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl bg-zenkai-surface/60 hover:bg-zenkai-elevated border border-white/5 transition-spring group"
                  >
                    <img
                      src={n.coverImage}
                      alt={n.title}
                      className="w-10 aspect-[2/3] object-cover rounded-lg shrink-0 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-md border ${
                            isFranchise
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                          }`}
                        >
                          {isFranchise ? '🌟 Sequel Radar' : '🎬 Simulcast'}
                        </span>
                        {n.parentTitle && (
                          <span className="text-[10px] text-zenkai-dim truncate">
                            For {n.parentTitle}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {n.title}
                      </p>
                      <p className="text-[10px] text-zenkai-muted font-mono mt-0.5">
                        {n.badge || `Episode ${n.episode}`}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zenkai-dim group-hover:text-white shrink-0 opacity-50" />
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-zenkai-dim">
                No active alerts in this category right now.
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 text-center">
            <Link
              to="/schedule"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View Full 7-Day Airing Calendar →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
