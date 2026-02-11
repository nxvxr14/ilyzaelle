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
│   │   ├── admin/         # Admin-specific components
│   │   │   └── SortableItem.tsx   # Drag-and-drop item for module/card reorder
│   │   ├── course/        # Course-related components
│   │   │   ├── CardRenderer.tsx   # Renders card blocks (text, image, quiz, code, etc.)
│   │   │   ├── CardTransition.tsx # GSAP-powered card slide transitions
│   │   │   ├── CourseResults.tsx   # Multi-phase course completion flow (points→chest→badge→summary)
│   │   │   └── ModuleResults.tsx  # Multi-phase module completion flow (points→chest→badge→summary)
│   │   ├── editor/        # Admin card editor (fullscreen)
│   │   │   ├── CardBlockEditor.tsx # Block-level editing (text, image, quiz, code, etc.)
│   │   │   ├── CardEditor.tsx      # Fullscreen z-[60] editor with own header
│   │   │   └── CardPreview.tsx     # Live preview using CardRenderer internally
│   │   ├── gamification/  # Reward system with GSAP animations
│   │   │   ├── RewardBox.tsx       # Chest→slot→reveal animation + badge float/spin
│   │   │   └── WigglingChest.tsx   # GSAP wiggling chest button (course detail page)
│   │   ├── layout/        # App shell and navigation
│   │   │   ├── AdminLayout.tsx     # Admin layout: Header only, NO BottomNav
│   │   │   ├── AppLayout.tsx       # Student layout: Header + BottomNav
│   │   │   ├── BottomNav.tsx       # Student-only bottom nav (Home, Courses, Profile)
│   │   │   └── Header.tsx          # Logo + user email + logout button
│   │   └── ui/            # Reusable UI primitives
│   │       ├── ImageCropper.tsx    # Crop + resize before upload
│   │       ├── LoadingSpinner.tsx  # Full-screen loading indicator
│   │       └── Modal.tsx           # Headless UI modal wrapper
│   ├── context/           # React contexts
│   │   └── AuthContext.tsx # Auth state: loginUser, logout, updateUser, user, isAdmin
│   ├── pages/             # Route pages
│   │   ├── admin/         # Admin pages (behind AdminRoute)
│   │   │   ├── AdminBadgesPage.tsx      # CRUD badges
│   │   │   ├── AdminCourseEditPage.tsx  # Edit course + manage modules (optimistic reorder)
│   │   │   ├── AdminCoursesPage.tsx     # List/create courses
│   │   │   ├── AdminDashboard.tsx       # Admin home
│   │   │   ├── AdminModuleEditPage.tsx  # Edit module + manage cards (slider debounce, optimistic reorder)
│   │   │   └── AdminUsersPage.tsx       # User management
│   │   ├── course/        # Course pages (behind ProtectedRoute)
│   │   │   ├── CourseDetailPage.tsx     # Course info, modules list, course reward (CourseResults)
│   │   │   └── ModuleViewPage.tsx       # Fullscreen z-[60] card viewer with back nav + quiz restore
│   │   ├── CoursesPage.tsx              # Browse all courses
│   │   ├── HomePage.tsx                 # Student dashboard
│   │   ├── LandingPage.tsx              # Public landing
│   │   ├── LoginPage.tsx                # Email-only login
│   │   ├── ProfilePage.tsx              # User profile + badges
│   │   └── RegisterPage.tsx             # Registration with avatar
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # All shared types (User, Course, Module, Card, Progress, etc.)
│   ├── utils/             # Helper functions
│   │   ├── cropImage.ts   # Canvas-based image crop utility
│   │   ├── helpers.ts     # getImageUrl(), getRarityColor()
│   │   └── schemas.ts     # Zod validation schemas
│   ├── App.tsx            # Router config with PublicRoute, ProtectedRoute, AdminRoute
│   ├── main.tsx           # Entry point with providers
│   ├── index.css          # Tailwind + custom CSS animations
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

## Route Structure

```
/ → LandingPage (public)
/login → LoginPage (public)
/register → RegisterPage (public)

── AppLayout (Header + BottomNav) ── STUDENTS ONLY
/home → HomePage
/courses → CoursesPage
/courses/:id → CourseDetailPage
/courses/:courseId/modules/:moduleId → ModuleViewPage (fullscreen z-[60])
/profile → ProfilePage

── AdminLayout (Header only, NO BottomNav) ── ADMIN ONLY
/admin → AdminDashboard
/admin/courses → AdminCoursesPage
/admin/courses/new → AdminCoursesPage
/admin/courses/:id → AdminCourseEditPage
/admin/courses/:courseId/modules/:moduleId → AdminModuleEditPage
/admin/users → AdminUsersPage
/admin/badges → AdminBadgesPage
```

### Route Guards
- **PublicRoute**: Redirects admin → `/admin`, student → `/home`
- **ProtectedRoute**: Requires auth; redirects admin → `/admin`
- **AdminRoute**: Requires admin; redirects non-admin → `/home`

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
10. **Animations**: GSAP for complex animations (rewards, transitions), Tailwind for simple ones
11. **Images**: Use `getImageUrl()` helper for all server images. Use ImageCropper for uploads
12. **Path aliases**: Use `@/` prefix for imports (maps to `src/`)
13. **Mobile first**: Design for mobile (320px+), then add responsive breakpoints
14. **Fullscreen overlays**: Use `z-[60]` for pages that cover the main layout (CardEditor, ModuleViewPage)

## Commands
- `npm run dev` — Start dev server on port 6789
- `npm run build` — TypeScript compile + Vite build
- `npm run lint` — ESLint check

## Key Libraries
- **@tanstack/react-query**: Server state management
- **react-router-dom**: Routing
- **axios**: HTTP client
- **gsap**: Complex animations (RewardBox, CardTransition, WigglingChest, badge float/spin)
- **react-easy-crop**: Image cropping before upload
- **@headlessui/react**: Accessible UI primitives (Modal, etc.)
- **@heroicons/react**: Icons
- **react-toastify**: Toast notifications
- **react-hook-form + zod**: Form handling and validation
- **@dnd-kit**: Drag-and-drop for module/card reorder
- **tailwindcss**: Styling

## Color Palette (tailwind.config.ts)
- `lab-bg`: #0a0a0f (main background)
- `lab-surface`: #12121a (elevated surfaces)
- `lab-card`: #1a1a2e (card backgrounds)
- `lab-border`: #2a2a3e (borders)
- `lab-primary`: #6c5ce7 (purple, primary actions)
- `lab-primary-light`: #a29bfe (lighter purple)
- `lab-secondary`: #00cec9 (teal, success/completion)
- `lab-accent`: #fd79a8 (pink, highlights)
- `lab-gold`: #fdcb6e (gold, points/rewards)
- `lab-text`: #e2e8f0 (main text)
- `lab-text-muted`: #94a3b8 (secondary text)

## Custom CSS Animations (index.css)
- `animate-float`: Subtle vertical float
- `animate-shimmer`: Shimmer effect
- `animate-spin-slow`: Slow rotation
- `animate-glow-pulse`: Pulsing glow
- `animate-chest-glow`: Chest glow effect
