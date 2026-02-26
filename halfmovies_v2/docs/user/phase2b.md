# Phase 2B – User Profiles & Favorites

## Schema
- `User.isActive` boolean default true
- `UserActivity` log table (`id`, `userId`, `action`, `metadata`, `createdAt`)
- `Favorite` (userId + movieId composite key)

## API
- `GET /api/favorites?uid=` (requires session; uid must match session)
  - Response: `{ userId, count, items: [{ movieId, title, language, rating, popularity, isFeatured }] }`
- `POST /api/favorites` body `{ movieId }` (requires session)
- `DELETE /api/favorites` body `{ movieId }` (requires session)
- `POST /api/user/updatePreferences` body `{ moods, favoriteGenres, languages, prefVector }` (requires session)
- Unauthorized requests return `401`; mismatched uid returns `403`.

## Frontend
- `/profile/[id]`: user info, preferences summary, favorites grid with heart toggle + toast
- `MovieCard` now supports favorite toggle
- Discover page shows "Top Fans" widget (favorites aggregation)

## Analytics
- Favorites add/remove and preferences update log to `UserActivity` with metadata counts

## Validation
- Start dev: `corepack pnpm --dir "./halfmovies_v2" dev`
- Curl favorites: `curl "http://localhost:3000/api/favorites?uid=<userId>"` (with auth cookie)

## Tests
- Jest: `pnpm test -- userActivity.test.ts`
- Playwright smoke: `npx playwright test tests/profile.spec.ts` (server running)
