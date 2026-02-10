# AGENTS.md — labBackend

## Project Overview
Express + TypeScript + MongoDB (Mongoose) backend for the "Laboratorio" LMS platform.
Runs on port 2525. Domain: `lab.undercromo.dev/api/`

## Directory Structure

```
labBackend/
├── src/
│   ├── config/         # DB connection, constants, multer config
│   │   ├── constants.ts
│   │   ├── db.ts
│   │   └── multer.ts
│   ├── controllers/    # Business logic, one file per resource
│   │   ├── authController.ts
│   │   ├── badgeController.ts
│   │   ├── cardController.ts
│   │   ├── courseController.ts
│   │   ├── moduleController.ts
│   │   └── progressController.ts
│   ├── middleware/      # Express middleware (auth, error handling)
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/          # Mongoose schemas/models, one file per model
│   │   ├── Badge.ts
│   │   ├── Card.ts
│   │   ├── Course.ts
│   │   ├── Module.ts
│   │   ├── Progress.ts
│   │   └── User.ts
│   ├── routes/          # Express route definitions, one file per resource
│   │   ├── authRoutes.ts
│   │   ├── badgeRoutes.ts
│   │   ├── cardRoutes.ts
│   │   ├── courseRoutes.ts
│   │   ├── moduleRoutes.ts
│   │   └── progressRoutes.ts
│   ├── utils/           # Helper functions (image processing, etc.)
│   │   └── imageProcessing.ts
│   └── index.ts         # App entry point
├── uploads/             # Uploaded files (profiles, modules, badges, cards)
├── .env                 # Environment variables (NEVER commit)
├── package.json
└── tsconfig.json
```

## Mandatory Conventions for Future Changes

1. **One file per concern**: Each model, controller, route file handles ONE resource
2. **Files must stay small**: If a controller exceeds ~200 lines, split into helper functions in `utils/`
3. **Naming**: `camelCase` for files in controllers/utils, `PascalCase` for models, `*Routes.ts` for routes
4. **New resources**: Create model + controller + route files, then register route in `index.ts`
5. **Auth**: All protected routes use `authenticate` middleware. Admin routes add `requireAdmin`
6. **Images**: ALL image processing goes through `utils/imageProcessing.ts` using Sharp
7. **Uploads**: Use Multer memory storage -> Sharp processing -> save to `uploads/` subdirectory
8. **Error handling**: Always try/catch in controllers, log errors, return JSON error responses
9. **Types**: Export interfaces from model files. Use `AuthRequest` for authenticated endpoints
10. **Environment**: All secrets/config in `.env`, accessed via `config/constants.ts`

## Commands
- `npm run dev` — Start dev server with nodemon + ts-node
- `npm run build` — Compile TypeScript to dist/
- `npm start` — Run compiled JS from dist/

## Data Hierarchy
Course > Module > Card (with blocks: text, image, button, quiz, code, download)

## Auth
- Login by email only (no password)
- JWT token, 30 day expiry
- Admin determined by ADMIN_EMAIL env var
