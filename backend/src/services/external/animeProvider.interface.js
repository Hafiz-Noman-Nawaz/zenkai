// Abstract interface definition for external anime data providers
// This design makes it trivial to swap Jikan for AniList, Kitsu, or custom scrappers/microservices later

class AnimeDataProvider {
  async searchAnime(query, options = {}) { // eslint-disable-line no-unused-vars
    throw new Error('Method searchAnime() must be implemented');
  }

  async getAnimeById(externalId) { // eslint-disable-line no-unused-vars
    throw new Error('Method getAnimeById() must be implemented');
  }

  async getTrendingAnime(options = {}) { // eslint-disable-line no-unused-vars
    throw new Error('Method getTrendingAnime() must be implemented');
  }
}

module.exports = AnimeDataProvider;
