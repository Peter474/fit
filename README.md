# FitTrack

A personal, local-first-feeling fitness and nutrition tracker. React + TypeScript
+ Vite + Tailwind CSS v4 on the frontend, Firebase Firestore for persistence,
anonymous Firebase Auth so data can be scoped securely without a login screen.

No fake data anywhere: every number on screen comes from what you've actually
logged. Goals in Settings are defaults you can change at any time; changing a
goal never touches previously logged history.

## Status

Fully wired up: Dashboard, Settings, Workouts, History and Analytics all read
and write real Firestore data in real time. Nothing is mocked.

- **Dashboard** — calories, water, protein, weight, steps, workout status,
  daily notes, and a daily summary — add/edit/delete everything, updates
  instantly, no page refresh.
- **Settings** — daily goals (calories/water/protein/steps), weight unit.
  Changing a goal only changes the target going forward.
- **Workouts** — build a workout for any day (name + exercises: sets/reps/
  weight/notes), mark completed/skipped, browse the last 30 days.
- **History** — every day you've logged anything, filterable by 30 days /
  3 months / all time, desktop table + mobile card list. Click a day to open
  it on the Dashboard for full detail and editing.
- **Analytics** — real charts (weight trend, calories/water/protein/steps
  per day vs. goal, workout frequency), same range filters. Shows "not
  enough data yet" instead of a fabricated chart when there's too little
  history.

## 1. Create a Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Add project** → name it anything (e.g. `fittrack`) → you can skip Google Analytics.
2. In the project, click **Build → Firestore Database → Create database**. Start in **production mode** (the security rules below lock it down properly). Pick any region close to you.
3. Click **Build → Authentication → Get started**. Under **Sign-in method**, enable **Anonymous**.
4. Click the gear icon → **Project settings** → scroll to **Your apps** → click the **</>** (web) icon → register an app (any nickname, no hosting needed) → copy the `firebaseConfig` object it shows you.

## 2. Configure the app

Copy `.env.example` to `.env.local` and paste in the values from step 1:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
```

These are the **public web config** values — Firebase's own docs confirm
they're safe to ship in a client bundle; they identify the project, they
don't grant access. Real access control comes from the security rules below
plus requiring a signed-in `uid`, so `.env.local` is git-ignored mainly to
keep your project ID out of a public repo, not because these values are
secret credentials.

Restart the dev server after editing `.env.local` (Vite only reads env files
on startup). Until it's configured, the app runs with a banner and empty
local state — nothing you add is saved, but nothing crashes either.

## 3. Add Firestore security rules

In the Firebase console: **Firestore Database → Rules**, replace the contents with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This is the whole security model: every document lives under
`users/{uid}/...`, and only the signed-in user matching that `uid` can touch
it. Since sign-in is anonymous, "signed in" just means "this browser has an
anonymous session" — see the auth tradeoff note below.

Publish the rules, then run:

```bash
npm install
npm run dev       # http://localhost:5173
```

Open the app — you should see the "Firebase isn't configured" banner
disappear, and a moment later the Dashboard should load with all-zero data,
ready to use.

## Auth tradeoff (read this)

Sign-in is **anonymous** — no email, no password. On first load, Firebase
silently creates an anonymous user and stores that session in this browser
(`browserLocalPersistence`), so closing the tab or restarting your computer
keeps the same account and the same data.

The tradeoff: a *different* browser or device gets a *different* anonymous
uid — i.e., a separate, empty account, not your existing data. That's fine
for single-device personal use, which is what this app is built for. If you
ever want the same data on your phone and your laptop, swap anonymous
sign-in for email-link or Google sign-in in `src/lib/firebase.ts` — the
Firestore structure (`users/{uid}/...`) and every hook/service already work
the same way regardless of *how* `uid` was obtained, so nothing else in the
app needs to change.

## Firestore data structure

```
users/{uid}/
  settings/app                    → Goals (calories, waterMl, proteinG, steps, weightUnit, theme)
  dailyLogs/{YYYY-MM-DD}           → DailyLog
    meals: MealEntry[]             (name, calories, proteinG, carbsG, fatG, notes, loggedAt)
    water: WaterEntry[]            (amountMl, loggedAt)
    manualProtein: ProteinEntry[]  (amountG, note, loggedAt)
    weightKg: number | null
    weightLoggedAt: number | null
    steps: number
    workout: { name, status, exercises: Exercise[] }
    notes: string
    updatedAt: server timestamp
```

Each day is a single document (not a subcollection of entries), which keeps
one `onSnapshot` listener per day cheap and simple, and is well within
Firestore's 1 MiB document limit for realistic personal logging volume.
Dates are always the browser's **local** calendar date (`src/lib/date.ts`),
so "today" matches what you actually experience as today, not UTC.

Derived totals (`totalCalories`, `totalWater`, `totalProtein` in
`src/types/tracking.ts`) are computed from the entry arrays on read — they're
never separately stored, so they can't drift out of sync with the entries
that make them up.

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
    layout/      AppShell, Sidebar, BottomNav, PageHeader
    ui/          Card, Modal, Button, FormField, ProgressRing, ProgressBar,
                 RingStatCard, EmptyState, Spinner, SetupNotice
    dashboard/   MealModal, MealsSection, WaterSection, NumberEntryModal,
                 WorkoutStatusCard, NotesCard
    workouts/    ExerciseModal
    analytics/   TrendBarChart, WeightLineChart, WorkoutFrequencyChart, AnalyticsCard
  context/       ToastContext, AppDataContext (auth + goals)
  hooks/         useDailyLog (single day), useDailyLogsRange (History/Analytics)
  lib/           firebase.ts, firestoreService.ts, date.ts, nav.ts
  pages/         Dashboard, History, Workouts, Analytics, Settings
  types/         tracking.ts — Goals, DailyLog, MealEntry, WaterEntry, Exercise, etc.
```

## Testing checklist

If any Add/Save button seems to do nothing: check the banner at the top of
the app first. It now covers both failure modes explicitly — "Firebase
isn't configured yet" (env vars missing, locally or in Vercel) or "Signed
in to Firebase failed" (env vars present but Anonymous auth is rejecting,
with the real Firebase error message shown inline). Every save action also
now shows an error toast rather than failing silently, so a stuck form
should always tell you why.

Once your Firebase project is connected, these are worth running through
once end-to-end (all of this works off real Firestore writes, so it also
verifies persistence across refresh/close/reopen):

1. Settings → set calorie goal to 2200 → Save.
2. Dashboard → Add calories → 500 kcal → confirm `500 / 2,200` and the toast.
3. Add another meal → 700 kcal → confirm `1,200 / 2,200`.
4. Delete the 700 kcal meal → confirm it drops back to `500 / 2,200`.
5. Water → tap `+500 ml`, then `+1000 ml` → confirm `1,500 ml` total.
6. Delete the `+500 ml` entry → confirm total becomes `1,000 ml`.
7. Log today's weight → refresh the browser → confirm it's still there.
8. Close the browser fully, reopen the app → confirm all of today's data is still there.
9. Settings → change the calorie goal → confirm the Dashboard ring/target updates immediately.
10. History → confirm today shows up with the right totals; click it → confirm it opens today on the Dashboard.
11. Analytics → confirm the charts reflect what you just logged (may need 2+ days of weight entries for the weight chart to render, by design).

## Not built (out of scope for this pass)

- PWA install/offline support (manifest, service worker) — the app already
  runs fine as a regular responsive web app; this is a separate follow-up.
- Multi-device sign-in (see the auth tradeoff above).
