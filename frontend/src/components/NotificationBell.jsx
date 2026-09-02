import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Sparkles, Calendar, Check, ExternalLink, Flame } from 'lucide-react';
import { animeApi } from '../api/anime';
import { useAuth } from '../context/AuthContext';

export const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAiringAlerts = async () => {
      try {
        const res = await animeApi.getWeeklySchedule();
        if (res.success && res.data?.schedule) {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const today = days[new Date().getDay()];
          const todayShows = res.data.schedule[today] || [];

          const alerts = todayShows.slice(0, 5).map((item, idx) => ({
            id: `alert-${item.anime?.id || idx}`,
            animeId: item.anime?.id,
            title: item.anime?.title,
            coverImage: item.anime?.coverImage,
            episode: item.episodeNumber || 'New',
            airingTime: item.airingTime || 'Today',
            read: false,
            timeAgo: 'Broadcasting Today',
          }));

          setNotifications(alerts);
          setUnreadCount(alerts.length);
        }
      } catch (e) {
        console.warn('Could not load notification alerts:', e);
      }
    };

    fetchAiringAlerts();
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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full bg-zenkai-surface/80 hover:bg-zenkai-elevated border border-white/10 text-zenkai-muted hover:text-white transition-spring btn-press"
        title="Simulcast Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-rose-500 to-amber-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl glass-luxury border border-white/10 shadow-2xl z-50 p-4 animate-scale-in space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Simulcast Radar
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  {unreadCount} New
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

          <div className="space-y-2 max-h-72 overflow-y-auto hide-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((n) => (
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
                    <p className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-cyan-400 font-mono mt-0.5">
                      Ep {n.episode} • {n.airingTime}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zenkai-dim group-hover:text-white shrink-0 opacity-50" />
                </Link>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-zenkai-dim">
                No active simulcasts broadcasting right now.
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
