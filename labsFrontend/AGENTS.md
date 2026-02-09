# AGENTS.md — labsFrontend

## Project Overview
Frontend for the Labs study platform. Pixel art aesthetic inspired by Codedex.io. Built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion.

**URL:** `https://lab.undercromo.dev`  
**API:** `https://lab.undercromo.dev/api`

---

## Project Structure

```
labsFrontend/
  .env.local
  index.html
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  tailwind.config.js
  postcss.config.js
  AGENTS.md
  public/
    fonts/
    images/
  src/
    main.tsx              # React entry point
    App.tsx               # App root with router
    index.css             # Global styles + Tailwind + pixel art
    router.tsx            # React Router config
    vite-env.d.ts         # Vite env types
    api/
      axios.ts            # Axios instance
      authApi.ts          # Auth endpoints
      categoryApi.ts      # Category endpoints
      moduleApi.ts        # Module endpoints
      cardApi.ts          # Card endpoints
      progressApi.ts      # Progress endpoints
      adminApi.ts         # Admin endpoints
      leaderboardApi.ts   # Leaderboard endpoints
      uploadApi.ts        # Image upload endpoints
    components/
      common/
        PixelButton.tsx   # Pixel art styled button
        PixelCard.tsx     # Pixel art styled card container
        PixelInput.tsx    # Pixel art styled input
        PixelModal.tsx    # Modal with pixel art border
        Loading.tsx       # Loading spinner/animation
        Logo.tsx          # Platform logo
        ProgressBar.tsx   # XP/progress bar
        XPAnimation.tsx   # Points earning animation
      auth/
        LoginForm.tsx     # Email input + submit
        RegisterForm.tsx  # Name, username, slogan, photo
      home/
        CategoryCard.tsx  # Single category card
        CategoryGrid.tsx  # Grid of category cards
      module/
        ModuleCard.tsx    # Single module in list
        ModuleList.tsx    # List of modules
        ModuleProgress.tsx # Progress indicator per module
      study/
        StudyContainer.tsx     # TikTok-style scroll container
        TextCard.tsx           # Text content card
        TextInputCard.tsx      # Text input answer card
        MultipleChoiceCard.tsx # Multiple choice card
        PhotoUploadCard.tsx    # Camera capture card
        CardWrapper.tsx        # Animation wrapper for cards
        CompletionScreen.tsx   # Module completion animation
        PointsAnimation.tsx    # Gacha-style points reveal
        TimerDisplay.tsx       # Time taken display
      admin/
        AdminSidebar.tsx   # Admin navigation sidebar
        StatsCard.tsx      # Dashboard stat card
        UserList.tsx       # Users table
        UserProgressDetail.tsx # Single user details
        CategoryManager.tsx    # CRUD categories
        ModuleManager.tsx      # CRUD modules
        CardEditor.tsx         # Card editor (drag/drop order)
        CardForm.tsx           # Form for individual card
        ImageUploader.tsx      # Image upload component
      leaderboard/
        LeaderboardList.tsx    # Leaderboard table
        LeaderboardItem.tsx    # Single leaderboard row
      profile/
        UserProfile.tsx        # User profile display
    context/
      AuthContext.tsx      # Auth state management
    hooks/
      useAuth.ts           # Auth hook
      useCategories.ts     # Categories data hook
      useModules.ts        # Modules data hook
      useProgress.ts       # Progress tracking hook
      useStudy.ts          # Study session hook
      useLeaderboard.ts    # Leaderboard data hook
      useCamera.ts         # Camera capture hook
    layouts/
      AppLayout.tsx        # Main app layout (navbar + content)
      AdminLayout.tsx      # Admin panel layout
      AuthLayout.tsx       # Auth pages layout
    types/
      index.ts             # Shared TypeScript types
    utils/
      points.ts            # Points calculation helpers
      time.ts              # Time formatting helpers
      animations.ts        # Framer Motion animation presets
    views/
      LoginView.tsx        # Login page
      RegisterView.tsx     # Registration page
      HomeView.tsx         # Categories grid (main page)
      CategoryView.tsx     # Modules list for a category
      StudyView.tsx        # Study session (TikTok scroll)
      CompletionView.tsx   # Module completion screen
      LeaderboardView.tsx  # Leaderboard page
      ProfileView.tsx      # User profile page
      admin/
        AdminDashboardView.tsx  # Admin stats
        AdminCategoriesView.tsx # Manage categories
        AdminModulesView.tsx    # Manage modules
        AdminCardEditorView.tsx # Edit cards for a module
        AdminUsersView.tsx      # User management
```

---

## Build/Run Commands

- **Install:** `npm install`
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Lint:** `npm run lint`

---

## Key Design Decisions

### Pixel Art Aesthetic
- **Font:** Press Start 2P (Google Fonts)
- **Borders:** CSS pixel-art borders (box-shadow based)
- **Colors:** Retro palette (dark backgrounds, neon accents)
- **Animations:** Framer Motion for page transitions, card flips

### Mobile-First
- All layouts designed for mobile screens first
- Touch-friendly interactions
- Camera capture (not file upload) for photo cards
- Vertical scroll (TikTok-style) for study sessions

### Study Flow (TikTok-style)
1. User enters a module → starts timer
2. Cards appear one at a time, full viewport height
3. Scroll/swipe triggers animated transition (flip/slide)
4. Each card type has its own interaction
5. Progress auto-saved on each card transition
6. On completion → gacha-style points animation

### Admin Panel
- Accessible when admin email logs in
- Separate layout with sidebar navigation
- CRUD for categories, modules, cards
- Drag-and-drop card ordering
- User progress monitoring

---

## Code Style

- 2-space indentation
- Single quotes
- ES module imports
- React functional components with explicit prop types
- `interface` for props, `type` for unions
- `camelCase` variables, `PascalCase` components
- Small, focused component files
- Custom hooks for data fetching
- No inline styles — use Tailwind utilities
- No `any` — use proper TypeScript types

---

## Environment Variables

```
VITE_API_URL=https://lab.undercromo.dev/api
```

---

_Keep this document up to date with any new components, routes, or conventions._
