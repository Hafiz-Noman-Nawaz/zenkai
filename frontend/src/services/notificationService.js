// Zenkai Browser & Mobile Web Push Notification Service

export const notificationService = {
  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  },

  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  async requestPermission() {
    if (!this.isSupported()) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('zenkai_push_enabled', 'true');
        return true;
      } else {
        localStorage.setItem('zenkai_push_enabled', 'false');
        return false;
      }
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  },

  isPushEnabled() {
    return localStorage.getItem('zenkai_push_enabled') === 'true' && this.getPermission() === 'granted';
  },

  setPushEnabled(enabled) {
    localStorage.setItem('zenkai_push_enabled', enabled ? 'true' : 'false');
  },

  async registerServiceWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (err) {
        console.warn('Service Worker registration failed:', err);
        return null;
      }
    }
    return null;
  },

  async showNotification(title, options = {}) {
    if (!this.isSupported() || Notification.permission !== 'granted') return false;

    const defaultOptions = {
      body: 'New update from Zenkai Anime Radar',
      icon: '/vite.svg',
      badge: '/vite.svg',
      vibrate: [200, 100, 200],
      tag: 'zenkai-alert',
      ...options,
    };

    try {
      // Prefer ServiceWorker registration notification for mobile support
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, defaultOptions);
          return true;
        }
      }

      // Fallback to standard window Notification
      new Notification(title, defaultOptions);
      return true;
    } catch (err) {
      console.warn('Failed to display notification:', err);
      return false;
    }
  },

  async sendTestNotification() {
    const isGranted = await this.requestPermission();
    if (!isGranted) return false;

    return this.showNotification('⚡ Zenkai Simulcast Radar', {
      body: '🔥 Mobile & Browser Notifications are active! You will be alerted when new episodes and seasons drop.',
      data: { url: '/schedule' },
    });
  },

  async notifyEpisodeRelease(animeTitle, episodeNumber, animeId) {
    if (!this.isPushEnabled()) return false;

    const key = `notified_ep_${animeId}_${episodeNumber}`;
    if (sessionStorage.getItem(key)) return false; // Don't notify twice in same session

    sessionStorage.setItem(key, 'true');

    return this.showNotification(`⚡ New Episode Released!`, {
      body: `${animeTitle} ${episodeNumber ? `Episode ${episodeNumber}` : ''} is now streaming live!`,
      data: { url: `/anime/${animeId}` },
    });
  },
};
