import { test, expect } from '@playwright/test';

// Smoke test: unauthorized favorites endpoint returns 401
// Run with `npx playwright test` after starting dev server.
test('favorites endpoint requires auth', async ({ request }) => {
  const res = await request.get('http://localhost:3000/api/favorites');
  expect(res.status()).toBe(401);
});
