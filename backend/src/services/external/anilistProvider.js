// AniList GraphQL Data Provider Implementation
// Provides rock-solid, high-availability anime data with high-res cover and banner artwork, schedules & character cast
const AnimeDataProvider = require('./animeProvider.interface');

class AniListProvider extends AnimeDataProvider {
  constructor(endpoint = 'https://graphql.anilist.co') {
    super();
    this.endpoint = endpoint;
  }

  normalizeAnime(item) {
    if (!item) return null;

    let trailerUrl = null;
    if (item.trailer?.site === 'youtube' && item.trailer?.id) {
      trailerUrl = `https://www.youtube.com/watch?v=${item.trailer.id}`;
    }

    // Clean HTML tags from description if present
    const cleanSynopsis = item.description
      ? item.description.replace(/<[^>]*>?/gm, '').trim()
      : null;

    // Extract characters and Japanese voice actors
    const characters = (item.characters?.edges || []).map((edge) => {
      const charNode = edge.node || {};
      const vaNode = edge.voiceActors?.[0] || null;
      return {
        id: charNode.id,
        name: charNode.name?.full || charNode.name?.native || 'Unknown Character',
        nativeName: charNode.name?.native || null,
        role: edge.role || 'MAIN',
        image: charNode.image?.large || charNode.image?.medium || null,
        voiceActor: vaNode
          ? {
              id: vaNode.id,
              name: vaNode.name?.full || vaNode.name?.native || 'Unknown VA',
              nativeName: vaNode.name?.native || null,
              image: vaNode.image?.large || vaNode.image?.medium || null,
              language: 'Japanese',
            }
          : null,
      };
    });

    const studio = item.studios?.nodes?.[0]?.name || null;

    return {
      id: item.id ? String(item.id) : undefined,
      externalId: item.id,
      title: item.title?.romaji || item.title?.english || 'Untitled Anime',
      englishTitle: item.title?.english || null,
      japaneseTitle: item.title?.native || null,
      synopsis: cleanSynopsis,
      type: item.format ? item.format.toUpperCase() : 'TV',
      status: this.mapStatus(item.status),
      episodes: item.episodes || null,
      duration: item.duration || null,
      startDate: item.startDate?.year
        ? new Date(`${item.startDate.year}-${item.startDate.month || 1}-${item.startDate.day || 1}`)
        : null,
      endDate: item.endDate?.year
        ? new Date(`${item.endDate.year}-${item.endDate.month || 1}-${item.endDate.day || 1}`)
        : null,
      season: item.season || null,
      seasonYear: item.seasonYear || item.startDate?.year || null,
      score: item.averageScore ? parseFloat((item.averageScore / 10).toFixed(2)) : null,
      popularity: item.popularity || null,
      rank: item.rank || null,
      coverImage: item.coverImage?.extraLarge || item.coverImage?.large || null,
      bannerImage: item.bannerImage || null,
      trailerUrl,
      studio,
      characters,
      genres: (item.genres || []).map((name) => ({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })),
    };
  }

  mapStatus(externalStatus) {
    if (!externalStatus) return 'FINISHED';
    const s = externalStatus.toUpperCase();
    if (s === 'RELEASING') return 'RELEASING';
    if (s === 'NOT_YET_RELEASED') return 'NOT_YET_RELEASED';
    if (s === 'CANCELLED') return 'CANCELLED';
    return 'FINISHED';
  }

  async executeQuery(query, variables = {}) {
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`AniList API failed with HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(json.errors[0].message);
    }

    return json.data;
  }

  async getAnimeList({ page = 1, limit = 20, sort = 'POPULARITY_DESC', status, season, seasonYear, genre, search }) {
    const query = `
      query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $season: MediaSeason, $seasonYear: Int, $genre: String, $search: String) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            currentPage
            lastPage
            hasNextPage
            perPage
          }
          media(type: ANIME, sort: $sort, status: $status, season: $season, seasonYear: $seasonYear, genre: $genre, search: $search, isAdult: false) {
            id
            title {
              romaji
              english
              native
            }
            coverImage {
              extraLarge
              large
            }
            bannerImage
            description
            episodes
            duration
            season
            seasonYear
            status
            format
            averageScore
            popularity
            genres
            studios(isMain: true) {
              nodes {
                name
              }
            }
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            trailer {
              id
              site
            }
          }
        }
      }
    `;

    const variables = {
      page: Number(page),
      perPage: Number(limit),
      sort: Array.isArray(sort) ? sort : [sort],
    };

    if (status) variables.status = status.toUpperCase();
    if (season) variables.season = season.toUpperCase();
    if (seasonYear) variables.seasonYear = parseInt(seasonYear, 10);
    if (genre) variables.genre = genre;
    if (search) variables.search = search;

    const data = await this.executeQuery(query, variables);
    const media = data?.Page?.media || [];
    const pageInfo = data?.Page?.pageInfo || {};

    return {
      animes: media.map((m) => this.normalizeAnime(m)),
      meta: {
        total: pageInfo.total || media.length,
        page: pageInfo.currentPage || page,
        limit: pageInfo.perPage || limit,
        totalPages: pageInfo.lastPage || Math.ceil((pageInfo.total || media.length) / limit) || 1,
        hasNextPage: pageInfo.hasNextPage || false,
        hasPrevPage: (pageInfo.currentPage || page) > 1,
      },
    };
  }

  async searchAnime(query, options = {}) {
    return this.getAnimeList({
      search: query,
      page: options.page || 1,
      limit: options.limit || 20,
      sort: 'SEARCH_MATCH',
    });
  }

  async getAnimeById(externalId) {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          coverImage {
            extraLarge
            large
          }
          bannerImage
          description
          episodes
          duration
          season
          seasonYear
          status
          format
          averageScore
          popularity
          genres
          studios(isMain: true) {
            nodes {
              name
            }
          }
          characters(sort: [ROLE, RELEVANCE], perPage: 8) {
            edges {
              role
              node {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
              }
              voiceActors(language: JAPANESE) {
                id
                name {
                  full
                  native
                }
                image {
                  large
                  medium
                }
              }
            }
          }
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          trailer {
            id
            site
          }
        }
      }
    `;

    const data = await this.executeQuery(query, { id: parseInt(externalId, 10) });
    return this.normalizeAnime(data?.Media);
  }

  async getWeeklySchedule() {
    const now = Math.floor(Date.now() / 1000);
    const weekStart = now - (new Date().getDay() * 86400); // Sunday start
    const weekEnd = weekStart + (7 * 86400);

    const query = `
      query ($airingAt_greater: Int, $airingAt_lesser: Int) {
        Page(page: 1, perPage: 50) {
          airingSchedules(airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: TIME) {
            id
            airingAt
            timeUntilAiring
            episode
            media {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                extraLarge
                large
              }
              bannerImage
              format
              genres
              averageScore
              duration
              status
            }
          }
        }
      }
    `;

    const data = await this.executeQuery(query, {
      airingAt_greater: weekStart,
      airingAt_lesser: weekEnd,
    });

    const schedules = data?.Page?.airingSchedules || [];

    // Group by day of week (0=Sunday, 1=Monday... 6=Saturday)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    days.forEach((d) => (grouped[d] = []));

    schedules.forEach((item) => {
      const date = new Date(item.airingAt * 1000);
      const dayName = days[date.getDay()];
      grouped[dayName].push({
        scheduleId: item.id,
        airingAt: item.airingAt,
        airingDate: date.toISOString(),
        timeUntilAiring: item.timeUntilAiring,
        episode: item.episode,
        anime: this.normalizeAnime(item.media),
      });
    });

    return grouped;
  }

  async getTrendingAnime(options = {}) {
    return this.getAnimeList({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: 'TRENDING_DESC',
    });
  }
}

module.exports = AniListProvider;
