# ⛩️ Zenkai Backend API

Production-ready, modular REST API for **Zenkai** — a personal anime tracking and discovery platform. Built with Node.js, Express, PostgreSQL, Prisma ORM, JWT authentication, and Zod validation.

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Variables](#-environment-variables)
- [Installation & Setup](#-installation--setup)
- [Database Migrations & Seeding](#-database-migrations--seeding)
- [Running the Server](#-running-the-server)
- [Running Automated Tests](#-running-automated-tests)
- [API Reference & Endpoints](#-api-reference--endpoints)
  - [Authentication](#1-authentication)
  - [User Profiles & Public Data](#2-user-profiles)
  - [Anime Catalog & Search](#3-anime-catalog)
  - [User Tracking Lists (My Anime)](#4-user-tracking-lists)
  - [Reviews](#5-reviews)
  - [Statistics](#6-statistics)
- [Connecting the Frontend](#-connecting-the-frontend)
- [Future Extensibility](#-future-extensibility)

---

## ✨ Features

- **Robust Authentication**: JWT with bcrypt hashing, strict username/email uniqueness, rate-limited auth endpoints.
- **Relational Data Modeling**: PostgreSQL schema with Prisma ORM handling Users, Anime, Genres (many-to-many), User Tracking Lists, and Reviews with cascading delete rules and composite uniqueness constraints.
- **Intelligent Episode & Progress Tracking**: Progress boundaries validated against total episode counts; automatic status progression to `COMPLETED` when the final episode is watched with automatic timestamps.
- **Personal Decimal Rating Scale**: 1.0 to 10.0 numeric ratings (supports decimals like `9.5`, `8.7`) separate from global community scores.
- **Review System**: 1 active review per user per anime, with strict authorization guards preventing unauthorized modifications.
- **Comprehensive Statistics Engine**: High-performance SQL aggregations for total count, status breakdown, episodes watched, mean rating, favorites count, genre distribution, and highest/lowest rated highlights.
- **Pluggable External Anime Provider**: Clean adapter architecture (`services/external/`) abstracting Jikan/MyAnimeList sync so data sources can be swapped without touching core business logic.
- **Security**: Helmet HTTP headers, CORS whitelisting, Zod payload validation, sanitized error masks in production.

---

## 🛠️ Architecture & Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation**: [Zod](https://zod.dev/)
- **Testing**: [Jest](https://jestjs.io/) & [Supertest](https://github.com/ladjs/supertest)
- **Security & Logging**: `helmet`, `cors`, `express-rate-limit`, `morgan`

---

## 📂 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma           # Prisma relational schema
│   └── seed.js                 # Realistic seed data script
├── src/
│   ├── config/
│   │   ├── constants.js        # Enums, limits, rating scales
│   │   ├── db.js               # PrismaClient singleton
│   │   └── env.js              # Validated environment configuration
│   ├── controllers/
│   │   ├── animeController.js  # Catalog, search, anime stats
│   │   ├── authController.js   # Register, login, me
│   │   ├── reviewController.js # Review CRUD
│   │   ├── statsController.js  # Personal and user stats
│   │   ├── userAnimeController.js # My Anime tracking list
│   │   └── userController.js   # Profile & settings
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification & req.user injection
│   │   ├── errorHandler.js     # Centralized error handler
│   │   ├── notFoundHandler.js  # 404 handler
│   │   ├── rateLimiter.js      # Endpoint rate limiters
│   │   └── validateMiddleware.js # Generic Zod request validator
│   ├── routes/
│   │   ├── animeRoutes.js
│   │   ├── authRoutes.js
│   │   ├── index.js            # Aggregated API root
│   │   ├── reviewRoutes.js
│   │   ├── statsRoutes.js
│   │   ├── userAnimeRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── animeService.js
│   │   ├── authService.js
│   │   ├── external/
│   │   │   ├── animeProvider.interface.js
│   │   │   └── jikanProvider.js
│   │   ├── reviewService.js
│   │   ├── statsService.js
│   │   ├── userAnimeService.js
│   │   └── userService.js
│   ├── utils/
│   │   ├── apiError.js         # Standardized ApiError class
│   │   ├── apiResponse.js      # Structured JSON response builder
│   │   ├── asyncWrapper.js     # Async catch controller wrapper
│   │   ├── jwt.js              # Token signer & verifier
│   │   └── password.js         # bcrypt password utility
│   ├── app.js                  # Express application pipeline
│   └── server.js               # HTTP server listener & graceful shutdown
├── tests/
│   ├── auth.test.js
│   ├── review.test.js
│   ├── stats.test.js
│   ├── testHelpers.js
│   └── userAnime.test.js
├── .env.example
├── package.json
└── README.md
```

---

## 📋 Prerequisites

1. **Node.js** (v18.0.0 or higher)
2. **PostgreSQL** (v14 or higher) running locally or hosted on Supabase/Neon/Railway/Docker.

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Server listening port | `5000` |
| `NODE_ENV` | Environment (`development`, `production`, `test`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@localhost:5432/zenkai_db?schema=public` |
| `JWT_SECRET` | Secret key for signing JWTs | *Strong random string* |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `CLIENT_URL` | Frontend URL for CORS whitelist | `http://localhost:3000` |
| `ANIME_API_BASE_URL` | External Anime Provider base URL | `https://api.jikan.moe/v4` |

---

## 🚀 Installation & Setup

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

---

## 🗄️ Database Migrations & Seeding

1. **Push Schema to Database** (or run migrations):
   ```bash
   npm run prisma:push
   # OR for migration history:
   # npm run prisma:migrate
   ```

2. **Seed Initial Data**:
   Populates genres, 8+ rich anime entries, 3 development test users, lists, scores, and reviews:
   ```bash
   npm run prisma:seed
   ```

### 🧑‍💻 Development Test Accounts (After Seeding)
- **Demo User**: `demo@zenkai.dev` / `password123` (Username: `demo_user`)
- **Sakura**: `sakura@zenkai.dev` / `password123` (Username: `sakura_watcher`)
- **Master**: `master@zenkai.dev` / `password123` (Username: `otaku_master`)

---

## 🏃 Running the Server

- **Development Mode** (with Nodemon hot reloading):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```
- **Prisma Studio** (Visual database GUI):
  ```bash
  npm run prisma:studio
  ```

---

## 🧪 Running Automated Tests

Run the Jest integration test suite:
```bash
npm test
```

---

## 📡 API Reference & Endpoints

All endpoints are prefixed with `/api` (or `/api/v1`).

### Standard Response Format

**Success Response (200 / 201)**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional status message",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Error Response (400 / 401 / 403 / 404 / 409 / 500)**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

---

### 1. Authentication

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/register` | ❌ | Register new account (`username`, `email`, `password`, `displayName`) |
| `POST` | `/api/auth/login` | ❌ | Login with email/username & password, returns JWT token |
| `GET` | `/api/auth/me` | ✅ | Get currently authenticated user profile |

---

### 2. User Profiles

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/users/:username` | ❌ | Retrieve public profile with tracking summary |
| `PATCH` | `/api/users/me` | ✅ | Update authenticated user's profile (`displayName`, `bio`, `avatar`, `username`) |
| `GET` | `/api/users/me/statistics` | ✅ | Get full personal anime tracking statistics |
| `GET` | `/api/users/:username/statistics` | ❌ | Get public statistics for any user |

---

### 3. Anime Catalog & Genres

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/genres` | ❌ | List all available anime genres for UI dropdowns & filters |
| `GET` | `/api/anime` | ❌ | Browse catalog with filtering (`genre`, `status`, `season`, `seasonYear`, `type`), sorting (`popularity`, `score`, `rank`, `newest`, `alphabetical`), and pagination |
| `GET` | `/api/anime/search?q=frieren` | ❌ | Fast title search |
| `GET` | `/api/anime/:id` | ❌ | Get full anime details, genres, and community stats (supports cuid or externalId) |
| `GET` | `/api/anime/:id/genres` | ❌ | List genres for a specific anime |
| `GET` | `/api/anime/:id/stats` | ❌ | Get aggregate rating and status distribution for an anime |
| `GET` | `/api/anime/:id/reviews` | ❌ | Get paginated reviews for an anime |
| `POST` | `/api/anime/:animeId/reviews` | ✅ | Post a review (`title`, `content`, `rating` [1.0 - 10.0]) |

---

### 4. User Tracking Lists

All tracking list endpoints require `Authorization: Bearer <TOKEN>`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/my-anime` | Fetch entire user list with status/favorite filters, search, and pagination |
| `GET` | `/api/my-anime/watching` | Get currently watching list |
| `GET` | `/api/my-anime/completed` | Get completed list |
| `GET` | `/api/my-anime/plan-to-watch`| Get plan-to-watch list |
| `GET` | `/api/my-anime/on-hold` | Get on-hold list |
| `GET` | `/api/my-anime/dropped` | Get dropped list |
| `GET` | `/api/my-anime/favorites` | Get favorited anime list |
| `GET` | `/api/my-anime/:animeId` | Get tracking details for a specific anime |
| `POST` | `/api/my-anime` | Add / upsert anime (`animeId`, `status`, `score`, `progress`, `notes`, `isFavorite`) |
| `PATCH` | `/api/my-anime/:animeId` | Update tracking details |
| `PATCH` | `/api/my-anime/:animeId/progress` | Quick update episode progress (`progress: 14`) |
| `PATCH` | `/api/my-anime/:animeId/score` | Quick update rating (`score: 9.5`) |
| `PATCH` | `/api/my-anime/:animeId/favorite` | Toggle favorite state (`isFavorite: true`) |
| `DELETE` | `/api/my-anime/:animeId` | Remove anime from user's list |

---

### 5. Reviews

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/reviews` | ❌ | Get recent global reviews |
| `PATCH` | `/api/reviews/:reviewId` | ✅ | Update review (owner only) |
| `DELETE` | `/api/reviews/:reviewId` | ✅ | Delete review (owner only) |

---

### 6. Statistics

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/statistics/me` | ✅ | Compute personal analytics (total anime, watching, completed, episodes watched, mean score, genre breakdown, top/lowest rated) |
| `GET` | `/api/statistics/users/:username` | ❌ | Compute public analytics for a user |

---

## 🌐 Connecting the Frontend

When the frontend is created in the root folder, configure an API client (such as Axios or native `fetch`) to communicate with the backend:

```javascript
// Example Frontend API Service
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchMyAnimeList(token) {
  const res = await fetch(`${API_BASE}/my-anime`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}
```

---

## 🔮 Future Extensibility

The architecture is deliberately structured to support planned Zenkai features:
- **Social Graph**: Follow/followers relations can be added to the `User` model without breaking existing APIs.
- **ML Recommendation Engine**: Ratings, favorites, and genre distribution data are stored with high precision to feed collaborative filtering and vector embeddings.
- **External Providers**: Add AniList or Kitsu providers in `src/services/external/` implementing `AnimeDataProvider`.
