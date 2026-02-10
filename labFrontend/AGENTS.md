# AGENTS.md — labFrontend

## Project Overview
React + TypeScript + Vite + TailwindCSS frontend for the "Laboratorio" LMS platform.
Runs on port 6789. Domain: `lab.undercromo.dev`
Mobile-first design with dark mode.

## Directory Structure

```
labFrontend/
├── public/                # Static assets
├── src/
│   ├── api/               # Axios client and API endpoint functions
│   │   ├── client.ts      # Axios instance with interceptors
│   │   └── endpoints.ts   # All API calls, one function per endpoint
│   ├── components/
│   │   ├── layout/        # App shell: Header, BottomNav, AppLayout
│   │   ├── ui/            # Reusable UI: Modal, LoadingSpinner, ImageCropper
│   │   ├── course/        # Course-related components: CardRenderer, CardTransition
│   │   ├── editor/        # Admin card editor: CardEditor, CardBlockEditor, CardPreview
│   │   ├── gamification/  # Reward system: RewardBox (GSAP animations)
│   │   └── admin/         # Admin-specific components (future)
│   ├── context/           # React contexts: AuthContext
│   ├── hooks/             # Custom React hooks (future)
│   ├── pages/             # Route pages
│   │   ├── admin/         # Admin pages: Dashboard, Courses, Users, Badges, etc.
│   │   └── course/        # Course pages: CourseDetail, ModuleView
│   ├── types/             # TypeScript type definitions (index.ts)
│   ├── utils/             # Helper functions: helpers.ts, cropImage.ts
│   ├── App.tsx            # Router configuration
│   ├── main.tsx           # Entry point with providers
│   ├── index.css          # Tailwind + custom styles
│   └── vite-env.d.ts      # Vite type declarations
├── .env.local             # Environment variables
├── index.html             # HTML template
├── package.json
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## Mandatory Conventions for Future Changes

1. **One component per file**: Each component lives in its own `.tsx` file
2. **Files must stay small**: If a component exceeds ~150 lines, extract sub-components
3. **Naming**: `PascalCase` for component files, `camelCase` for utility files
4. **New pages**: Create in `pages/` or `pages/admin/`, add route in `App.tsx`
5. **New components**: Place in the appropriate `components/` subdirectory
6. **API calls**: ALL API calls go through `api/endpoints.ts`. Never call axios directly
7. **Types**: ALL shared types go in `types/index.ts`
8. **State management**: Use React Query for server state, Context for auth/global state
9. **Styling**: TailwindCSS only, dark mode by default. Custom colors in `lab-*` palette
10. **Animations**: GSAP for complex animations (rewards, etc.), Tailwind transitions for simple ones
11. **Images**: Use `getImageUrl()` helper for all server images. Use ImageCropper for uploads
12. **Path aliases**: Use `@/` prefix for imports (maps to `src/`)
13. **Mobile first**: Design for mobile (320px+), then add responsive breakpoints

## Commands
- `npm run dev` — Start dev server on port 6789
- `npm run build` — TypeScript compile + Vite build
- `npm run lint` — ESLint check

## Key Libraries
- **@tanstack/react-query**: Server state management
- **react-router-dom**: Routing
- **axios**: HTTP client
- **gsap**: Complex animations (RewardBox, CardTransition)
- **react-easy-crop**: Image cropping before upload
- **@headlessui/react**: Accessible UI primitives (Modal, etc.)
- **@heroicons/react**: Icons
- **react-toastify**: Toast notifications
- **react-hook-form + zod**: Form handling and validation
- **tailwindcss**: Styling

## Color Palette (tailwind.config.ts)
- `lab-bg`: #0a0a0f (main background)
- `lab-surface`: #12121a (elevated surfaces)
- `lab-card`: #1a1a2e (card backgrounds)
- `lab-border`: #2a2a3e (borders)
- `lab-primary`: #6c5ce7 (purple, primary actions)
- `lab-secondary`: #00cec9 (teal, success/completion)
- `lab-accent`: #fd79a8 (pink, highlights)
- `lab-gold`: #fdcb6e (gold, points/rewards)
