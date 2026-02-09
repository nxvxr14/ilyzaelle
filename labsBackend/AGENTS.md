# AGENTS.md — labsBackend

## Project Overview
Backend API for the Labs study platform (pixel art style, Codedex-inspired). Built with Express, TypeScript, Mongoose, and Node.js.

**Base URL:** `https://lab.undercromo.dev/api`

---

## Project Structure

```
labsBackend/
  .env
  package.json
  tsconfig.json
  AGENTS.md
  uploads/               # User-uploaded images (gitignored)
  src/
    index.ts             # Entry point
    config/
      db.ts              # MongoDB/Mongoose connection
      cors.ts            # CORS configuration
      server.ts          # Express server setup
    models/
      User.ts            # User schema
      Category.ts        # Category schema
      Module.ts          # Module schema (belongs to Category)
      Card.ts            # Card schema (belongs to Module)
      Progress.ts        # User progress per module
    routes/
      authRoutes.ts      # POST /auth/login, POST /auth/register
      categoryRoutes.ts  # CRUD categories
      moduleRoutes.ts    # CRUD modules
      cardRoutes.ts      # CRUD cards
      progressRoutes.ts  # User progress tracking
      adminRoutes.ts     # Admin dashboard stats
      uploadRoutes.ts    # Image upload endpoint
      leaderboardRoutes.ts # Leaderboard/ranking
    controllers/
      authController.ts
      categoryController.ts
      moduleController.ts
      cardController.ts
      progressController.ts
      adminController.ts
      uploadController.ts
      leaderboardController.ts
    middleware/
      auth.ts            # Auth middleware (token/session check)
      admin.ts           # Admin-only middleware
      upload.ts          # Multer config for file uploads
      validation/
        authValidation.ts
        categoryValidation.ts
        moduleValidation.ts
        cardValidation.ts
    types/
      index.ts           # Shared TypeScript types/interfaces
    utils/
      errorHandler.ts    # Global error handler
      response.ts        # Standardized API response helpers
```

---

## Build/Run Commands

- **Install:** `npm install`
- **Dev:** `npm run dev` (uses nodemon + ts-node)
- **Build:** `npm run build` (compiles to dist/)
- **Start:** `npm start` (runs compiled JS from dist/)
- **Lint:** `npm run lint`

---

## Environment Variables (.env)

```
DATABASE_URL=<mongodb connection string>
PORT=2525
FRONTEND_URL=https://lab.undercromo.dev
ADMIN_EMAIL=admin@lab.undercromo.dev
UPLOADS_DIR=./uploads
```

---

## Code Style

- 2-space indentation
- Single quotes
- ES module imports (`import`/`export`)
- Explicit types on all exported functions
- `interface` for object shapes, `type` for unions
- `camelCase` for variables/functions, `PascalCase` for types/models
- All async code wrapped in try/catch
- Standardized JSON responses via `utils/response.ts`
- Small, focused files — one concern per file
- No `any` types — use `unknown` with guards

---

## API Routes Summary

| Method | Route                          | Description                    | Auth   |
|--------|--------------------------------|--------------------------------|--------|
| POST   | /api/auth/login                | Login with email               | No     |
| POST   | /api/auth/register             | Register new user              | No     |
| GET    | /api/categories                | List all categories            | Yes    |
| GET    | /api/categories/:id            | Get category by ID             | Yes    |
| GET    | /api/modules/category/:catId   | Get modules by category        | Yes    |
| GET    | /api/modules/:id               | Get module by ID               | Yes    |
| GET    | /api/cards/module/:moduleId    | Get cards for a module         | Yes    |
| GET    | /api/progress/:moduleId        | Get user progress for module   | Yes    |
| POST   | /api/progress/:moduleId/answer | Submit answer for a card       | Yes    |
| POST   | /api/progress/:moduleId/complete | Complete a module            | Yes    |
| POST   | /api/upload                    | Upload image                   | Yes    |
| GET    | /api/leaderboard               | Get leaderboard                | Yes    |
| GET    | /api/admin/stats               | Admin dashboard stats          | Admin  |
| GET    | /api/admin/users               | List users with progress       | Admin  |
| POST   | /api/admin/categories          | Create category                | Admin  |
| PUT    | /api/admin/categories/:id      | Update category                | Admin  |
| DELETE | /api/admin/categories/:id      | Delete category                | Admin  |
| POST   | /api/admin/modules             | Create module                  | Admin  |
| PUT    | /api/admin/modules/:id         | Update module                  | Admin  |
| DELETE | /api/admin/modules/:id         | Delete module                  | Admin  |
| POST   | /api/admin/cards               | Create card                    | Admin  |
| PUT    | /api/admin/cards/:id           | Update card                    | Admin  |
| DELETE | /api/admin/cards/:id           | Delete card                    | Admin  |
| PUT    | /api/admin/cards/reorder       | Reorder cards in module        | Admin  |

---

## Database Models

### User
- `email` (string, unique, required)
- `name` (string, required)
- `username` (string, unique, required)
- `slogan` (string)
- `profilePhoto` (string — path)
- `isAdmin` (boolean, default false)
- `totalPoints` (number, default 0)
- `createdAt` (Date)

### Category
- `name` (string, required)
- `description` (string)
- `image` (string — path)
- `order` (number)
- `isActive` (boolean, default true)

### Module
- `categoryId` (ObjectId → Category)
- `name` (string, required)
- `description` (string)
- `image` (string — path)
- `order` (number)
- `isActive` (boolean, default true)

### Card
- `moduleId` (ObjectId → Module)
- `type` (enum: 'text', 'text-input', 'multiple-choice', 'photo-upload')
- `title` (string)
- `content` (string — markdown/text)
- `image` (string — optional path)
- `options` (array of { text, isCorrect } — for multiple-choice)
- `correctAnswer` (string — for text-input)
- `points` (number, default 0)
- `order` (number)

### Progress
- `userId` (ObjectId → User)
- `moduleId` (ObjectId → Module)
- `currentCardIndex` (number, default 0)
- `completed` (boolean, default false)
- `startedAt` (Date)
- `completedAt` (Date)
- `pointsEarned` (number, default 0)
- `answers` (array of { cardId, answer, isCorrect, pointsAwarded })

---

_Keep this document up to date with any new routes, models, or conventions._
