// Jikan (MyAnimeList API v4) Provider Implementation
const AnimeDataProvider = require('./animeProvider.interface');
const env = require('../../config/env');

class JikanProvider extends AnimeDataProvider {
  constructor(baseUrl = env.ANIME_API_BASE_URL) {
    super();
    this.baseUrl = baseUrl;
  }

  // Normalize external Jikan data model to Zenkai Anime model
  normalizeAnimeData(jikanItem) {
    if (!jikanItem) return null;

    return {
      externalId: jikanItem.mal_id,
      title: jikanItem.title || jikanItem.title_english || 'Untitled Anime',
      englishTitle: jikanItem.title_english || null,
      japaneseTitle: jikanItem.title_japanese || null,
      synopsis: jikanItem.synopsis || null,
      type: jikanItem.type ? jikanItem.type.toUpperCase() : 'TV',
      status: this.mapStatus(jikanItem.status),
      episodes: jikanItem.episodes || null,
      duration: jikanItem.duration ? parseInt(jikanItem.duration, 10) || null : null,
      startDate: jikanItem.aired?.from ? new Date(jikanItem.aired.from) : null,
      endDate: jikanItem.aired?.to ? new Date(jikanItem.aired.to) : null,
      season: jikanItem.season ? jikanItem.season.toUpperCase() : null,
      seasonYear: jikanItem.year || (jikanItem.aired?.from ? new Date(jikanItem.aired.from).getFullYear() : null),
      score: jikanItem.score || null,
      popularity: jikanItem.popularity || null,
      rank: jikanItem.rank || null,
      coverImage: jikanItem.images?.webp?.large_image_url || jikanItem.images?.jpg?.large_image_url || null,
      bannerImage: null,
      trailerUrl: jikanItem.trailer?.url || jikanItem.trailer?.embed_url || null,
      genres: (jikanItem.genres || []).map((g) => ({
        name: g.name,
        slug: g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      })),
    };
  }

  mapStatus(externalStatus) {
    if (!externalStatus) return 'NOT_YET_RELEASED';
    const lower = externalStatus.toLowerCase();
    if (lower.includes('finished') || lower.includes('complete')) return 'FINISHED';
    if (lower.includes('airing') || lower.includes('currently')) return 'RELEASING';
    if (lower.includes('upcoming') || lower.includes('not yet')) return 'NOT_YET_RELEASED';
    if (lower.includes('cancelled')) return 'CANCELLED';
    return 'FINISHED';
  }

  async searchAnime(query, options = {}) {
    const page = options.page || 1;
    const limit = options.limit || 20;

    const url = new URL(`${this.baseUrl}/anime`);
    url.searchParams.set('q', query);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('sfw', 'true');

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`Jikan API request failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      data: (data.data || []).map((item) => this.normalizeAnimeData(item)),
      pagination: {
        currentPage: data.pagination?.current_page || page,
        hasNextPage: data.pagination?.has_next_page || false,
        total: data.pagination?.items?.total || (data.data || []).length,
      },
    };
  }

  async getAnimeById(externalId) {
    const url = `${this.baseUrl}/anime/${externalId}/full`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Jikan API request failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return this.normalizeAnimeData(data.data);
  }

  async getTrendingAnime(options = {}) {
    const limit = options.limit || 20;
    const url = `${this.baseUrl}/top/anime?filter=bypopularity&limit=${limit}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      throw new Error(`Jikan API request failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      data: (data.data || []).map((item) => this.normalizeAnimeData(item)),
    };
  }
}

module.exports = JikanProvider;
