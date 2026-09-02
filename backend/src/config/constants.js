// Constants used across Zenkai backend

const WATCH_STATUS = Object.freeze({
  WATCHING: 'WATCHING',
  COMPLETED: 'COMPLETED',
  PLAN_TO_WATCH: 'PLAN_TO_WATCH',
  ON_HOLD: 'ON_HOLD',
  DROPPED: 'DROPPED',
});

const VALID_STATUSES = Object.values(WATCH_STATUS);

const RATING_CONFIG = Object.freeze({
  MIN: 1.0,
  MAX: 10.0,
});

const PAGINATION_DEFAULTS = Object.freeze({
  PAGE: 1,
  LIMIT: 50,
  MAX_LIMIT: 2500,
  USER_LIBRARY_LIMIT: 1500,
});

const SORT_OPTIONS = Object.freeze({
  POPULARITY: 'popularity',
  SCORE: 'score',
  RANK: 'rank',
  NEWEST: 'newest',
  OLDEST: 'oldest',
  ALPHABETICAL: 'alphabetical',
});

module.exports = {
  WATCH_STATUS,
  VALID_STATUSES,
  RATING_CONFIG,
  PAGINATION_DEFAULTS,
  SORT_OPTIONS,
};
