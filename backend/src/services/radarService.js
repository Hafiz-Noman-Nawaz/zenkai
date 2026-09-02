// Zenkai Anime Radar & Notification Engine
// 1. Airing Releases: Monitors shows in user's WATCHING list and triggers alerts when new episodes air.
// 2. Franchise Announcements: Monitors shows in user's COMPLETED list and detects new seasons, movies & spin-offs.

const prisma = require('../config/database');
const animeService = require('./animeService');
const emailService = require('./emailService');

class RadarService {
  /**
   * Generates live radar feed for a user based on their Watching and Completed lists
   */
  async getUserRadarFeed(userId) {
    if (!userId) return { airingAlerts: [], franchiseAlerts: [] };

    const [watchingEntries, completedEntries, weeklySchedule] = await Promise.all([
      prisma.userAnime.findMany({
        where: { userId, status: 'WATCHING' },
        include: { anime: true },
      }),
      prisma.userAnime.findMany({
        where: { userId, status: 'COMPLETED' },
        include: { anime: true },
      }),
      animeService.getWeeklySchedule(),
    ]);

    const watchingAnimeMap = new Map();
    watchingEntries.forEach((e) => {
      if (e.anime) {
        watchingAnimeMap.set(e.anime.id, e);
        if (e.anime.externalId) watchingAnimeMap.set(String(e.anime.externalId), e);
      }
    });

    const completedAnimeMap = new Map();
    completedEntries.forEach((e) => {
      if (e.anime) {
        completedAnimeMap.set(e.anime.id, e);
        if (e.anime.externalId) completedAnimeMap.set(String(e.anime.externalId), e);
      }
    });

    // 1. Process Airing Alerts (For WATCHING shows)
    const airingAlerts = [];
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    const todayShows = weeklySchedule[todayName] || [];

    todayShows.forEach((item) => {
      const anime = item.anime;
      if (!anime) return;
      const targetId = anime.id || anime.externalId;
      const isWatching = watchingAnimeMap.has(targetId) || watchingAnimeMap.has(String(anime.externalId));

      if (isWatching) {
        airingAlerts.push({
          id: `airing-${targetId}-${item.episode}`,
          type: 'AIRING_EPISODE',
          animeId: targetId,
          title: anime.title,
          coverImage: anime.coverImage,
          episode: item.episode || 'New',
          airingAt: item.airingAt,
          badge: `Ep ${item.episode} Airing Today`,
          timeAgo: 'Broadcasting Today',
          isWatching: true,
        });
      }
    });

    // If no watching shows airing today, also list upcoming broadcasts this week
    if (airingAlerts.length === 0) {
      days.forEach((d) => {
        (weeklySchedule[d] || []).forEach((item) => {
          const a = item.anime;
          if (!a) return;
          const targetId = a.id || a.externalId;
          if (watchingAnimeMap.has(targetId) || watchingAnimeMap.has(String(a.externalId))) {
            airingAlerts.push({
              id: `airing-${targetId}-${item.episode}`,
              type: 'AIRING_EPISODE',
              animeId: targetId,
              title: a.title,
              coverImage: a.coverImage,
              episode: item.episode || 'New',
              airingAt: item.airingAt,
              badge: `${d} • Ep ${item.episode}`,
              timeAgo: `Simulcast on ${d}`,
              isWatching: true,
            });
          }
        });
      });
    }

    // 2. Process Franchise Announcements (For COMPLETED shows)
    const franchiseAlerts = [];
    const completedList = completedEntries.slice(0, 15); // Check top 15 recent completed shows

    for (const entry of completedList) {
      const anime = entry.anime;
      if (!anime) continue;

      try {
        const relationsData = await animeService.getFranchiseRelations(anime.id);
        const siblings = relationsData.relations || [];

        // Find sequels or movies that are NOT yet watched or upcoming
        siblings.forEach((sib) => {
          const isAlreadyTracked = completedAnimeMap.has(sib.id) || watchingAnimeMap.has(sib.id);
          const isUpcomingOrNew =
            sib.status === 'NOT_YET_RELEASED' ||
            sib.status === 'RELEASING' ||
            (sib.relationType && (sib.relationType.includes('Sequel') || sib.relationType.includes('Movie')));

          if (!isAlreadyTracked && isUpcomingOrNew) {
            franchiseAlerts.push({
              id: `franchise-${anime.id}-${sib.id}`,
              type: 'FRANCHISE_ANNOUNCEMENT',
              animeId: sib.id,
              parentAnimeId: anime.id,
              parentTitle: anime.title,
              title: sib.title,
              coverImage: sib.coverImage || anime.coverImage,
              format: sib.type || 'New Season / Movie',
              badge: sib.relationType || 'New Season Announced',
              status: sib.status,
              timeAgo: 'Newly Announced',
            });
          }
        });
      } catch (err) {
        // Skip on relation fetch error
      }
    }

    return {
      airingAlerts: airingAlerts.slice(0, 10),
      franchiseAlerts: franchiseAlerts.slice(0, 10),
    };
  }

  /**
   * Dispatches real-time automated emails for airing episodes and franchise announcements
   */
  async dispatchRadarAlerts(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      return { success: false, message: 'User or email not found' };
    }

    const { airingAlerts, franchiseAlerts } = await this.getUserRadarFeed(userId);
    const results = [];

    // Dispatch Airing Alert for top airing show in Watching
    if (airingAlerts.length > 0) {
      const topAiring = airingAlerts[0];
      const sendRes = await emailService.sendAiringAlertEmail(
        user,
        topAiring.title,
        topAiring.episode,
        topAiring.animeId
      );
      results.push({ type: 'AIRING', title: topAiring.title, result: sendRes });
    }

    // Dispatch Franchise Radar Alert for top completed show announcement
    if (franchiseAlerts.length > 0) {
      const topFranchise = franchiseAlerts[0];
      const sendRes = await emailService.sendFranchiseAnnouncementEmail(
        user,
        topFranchise.parentTitle,
        topFranchise.title,
        topFranchise.format,
        topFranchise.animeId
      );
      results.push({ type: 'FRANCHISE', title: topFranchise.title, result: sendRes });
    }

    return {
      success: true,
      user: user.email,
      dispatchedCount: results.length,
      alerts: results,
    };
  }
}

module.exports = new RadarService();
