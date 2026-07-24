# FinLit Backend — Gamified Financial Literacy Platform

Node.js/Express backend implementing the Progression Engine and Gamification
Engine described in the project pitch. Uses **SQLite** via Node's built-in
`node:sqlite` module — no database server, no native compilation, no
external service. It's just a file (`data/finlit.db`) that's created and
seeded automatically the first time you run the app.

> Requires **Node.js 22.5+** (for the built-in `node:sqlite` module).
> Check with `node -v`. If you're on an older version, use `nvm install 22`.

## Setup

```bash
cp .env.example .env    # defaults are already fine for local dev
npm install
npm run dev             # nodemon, auto-restarts on change
# or
npm start
```

That's it — no schema step, no seed step. On first boot, `src/config/db.js`
creates `data/finlit.db`, runs `schema.sql`, and seeds the 4 MVP modules
from `seed.sql` if the database is empty. Server runs at
`http://localhost:4000`.

To wipe and start fresh: `npm run db:reset` (or just delete the `data/` folder).

## Verified working (tested in-sandbox)

- Register → login → JWT auth ✅
- Learning tree correctly locks/unlocks lessons in sequence ✅
- Quiz grading applies the 80% pass threshold ✅
- First-time pass awards XP and starts a streak ✅
- Locked lessons correctly reject access (403) ✅
- Weekly leaderboard aggregation + read endpoint ✅

## API Overview

### Auth
| Method | Route              | Body                                      |
|--------|--------------------|--------------------------------------------|
| POST   | `/api/auth/register` | `{ email, password, display_name }` |
| POST   | `/api/auth/login`    | `{ email, password }`                |

Both return `{ token, user }`. Send the token as `Authorization: Bearer <token>`
on every route below.

### Progression Engine
| Method | Route                         | Notes |
|--------|-------------------------------|-------|
| GET    | `/api/learning-tree`          | Full module/lesson list, each tagged `locked` / `unlocked` / `passed` |
| GET    | `/api/lessons/:lessonId`      | Lesson content + quiz questions (403 if locked) |
| POST   | `/api/lessons/:lessonId/submit` | `{ answers: [{ question_id, selected_index }] }` — grades server-side, applies the 80% pass rule, unlocks the next lesson, awards XP on first pass |

### Gamification / Leaderboard
| Method | Route              | Notes |
|--------|--------------------|-------|
| GET    | `/api/leaderboard?week=YYYY-MM-DD` | Reads the precomputed weekly XP table (defaults to current week) |

The leaderboard is populated by an hourly cron job (`src/jobs/leaderboardJob.js`)
that sums `xp_ledger` entries since Monday of the current week. For a live
demo, run `node -e "require('./src/jobs/leaderboardJob').aggregateWeeklyXp()"`
right before showing the leaderboard instead of waiting for the hourly tick.

## How the two engines map to code

- **Progression Engine** → `src/models/progressionEngine.js`
  Walks lessons in global order (`module.order_index`, `lesson.order_index`)
  and only unlocks lesson N+1 once lesson N is `passed = 1` in
  `user_progress` (score ≥ 80%, enforced server-side in
  `lessonController.submitQuiz` — never trust the client).

- **Gamification Engine** → `src/models/gamificationEngine.js`
  On first-time pass: increments `streak_count` if `last_active_timestamp`
  was within 24h (else resets to 1), adds XP to `users.xp_total`, and logs
  the event to `xp_ledger` for later aggregation. Wrapped in a manual
  transaction (`db.withTransaction`, since `node:sqlite` has no built-in
  transaction helper) so the streak/XP update and the ledger write always
  succeed or fail together.

## Moving to Postgres/MySQL later

If you outgrow SQLite (e.g. need concurrent writers at scale), only
`src/config/db.js` needs a real rewrite — swap in `pg` or `mysql2` and
adjust the schema's `AUTOINCREMENT`/`TEXT` types back to your dialect.
The engines, controllers, and routes are otherwise untouched.

## Suggested next steps for the hackathon demo

1. Point the React frontend's `VITE_API_BASE` at this server.
2. Register 2–3 test users and pass a few lessons each so the leaderboard
   isn't empty on stage.
3. Since this is file-based, you can commit `data/finlit.db` with demo
   progress already seeded in it if you want a guaranteed-good demo state.
