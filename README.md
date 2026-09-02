# ⛩️ Zenkai — Anime Tracking & Discovery Platform

Zenkai is a modern, personal anime tracking and discovery platform designed for discovering anime, managing watch lists, rating titles, tracking episode progress, writing reviews, and viewing in-depth personal statistics.

---

## 🏗️ Monorepo Architecture

The Zenkai repository is structured to hold both backend and frontend applications in a clean monorepo format:

```
Zenkai/
├── backend/                  # Production-ready Node.js/Express/Prisma REST API
│   ├── prisma/               # Schema, migrations, and seed scripts
│   ├── src/                  # Controllers, services, routes, middleware, validators
│   ├── tests/                # Jest integration test suites
│   ├── package.json
│   └── README.md
│
├── frontend/                 # (Reserved for future web frontend)
│
├── .gitignore                # Root gitignore
└── README.md                 # Project root documentation
```

---

## 🚀 Quick Start (Backend)

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies & Generate Prisma Client**:
   ```bash
   npm install
   npm run prisma:generate
   ```

4. **Setup Database & Seed Initial Data**:
   Ensure PostgreSQL is running, then run:
   ```bash
   npm run prisma:push
   npm run prisma:seed
   ```

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The backend API will be live at `http://localhost:5000/api`.

6. **Run Automated Test Suite**:
   ```bash
   npm test
   ```

---

## 📖 Complete API Documentation

For the full list of REST API endpoints, request/response formats, security parameters, and data models, refer to the [Backend Documentation](file:///c:/Users/nawaz/OneDrive/Desktop/Zenkai/backend/README.md).
