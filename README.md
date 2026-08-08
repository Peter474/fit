# FitTrack

A personal, local-first fitness and nutrition tracker. Built as a mobile-first
Progressive Web App: React + TypeScript + Vite + Tailwind CSS v4, with data
persisted in IndexedDB (added in Phase 11) — no backend, no accounts.

## Status: Phase 1 — Project setup & basic UI

This first pass delivers the app shell and the Dashboard's visual design,
running on static preview data so the full layout is easy to review before
any storage logic is wired in.

**What's in place:**
- Vite + React 19 + TypeScript, Tailwind v4 (CSS-based theme, no config file)
- Route structure: Dashboard, History, Workouts, Analytics, Settings
- Responsive shell: sidebar nav on desktop/tablet, bottom tab bar on mobile
- Dashboard UI: calorie / water / protein / steps ring cards, weight card,
  workout status card, and a daily summary strip — all on placeholder data
- Reusable UI primitives: `Card`, `ProgressRing`, `ProgressBar`, `RingStatCard`
- Design tokens in `src/index.css` (`@theme`): dark surface palette, four
  functional accent colors (calories/water/protein/steps), Space Grotesk for
  numerals, Inter for UI text
- `src/types/tracking.ts` sketches the data shapes the next phases build on

**Not yet built** (matches the phase plan from the brief):
3. Calorie logging (meals, macros, quick add)
4. Water logging (quick-add buttons, custom amount, entry list)
5. Protein logging
6. Weight logging + history graph
7. Workout logging + history
8. History page (daily log table)
9. Analytics page (charts, date-range filters)
10. Settings page (editable goals, weight unit, theme)
11. IndexedDB persistence layer (everything above is currently static)
12. PWA: manifest, icons, service worker, offline support
13. Final responsive/animation polish pass

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Project layout

```
src/
  components/
    layout/    AppShell, Sidebar, BottomNav, PageHeader
    ui/        Card, ProgressRing, ProgressBar, RingStatCard
  pages/       Dashboard, History, Workouts, Analytics, Settings
  lib/         nav config (storage/business logic land here in later phases)
  types/       shared domain types
```

Say "next phase" (or name a specific phase) whenever you want to continue —
each phase keeps the app working end-to-end before moving on.
