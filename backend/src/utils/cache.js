// High-Performance In-Memory TTL Cache Utility
class MemoryCache {
  constructor(defaultTtlMs = 180000) { // 3 minutes default TTL
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttlMs = this.defaultTtlMs) {
    // Limit cache size to prevent memory bloat
    if (this.cache.size > 2000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = new MemoryCache();
