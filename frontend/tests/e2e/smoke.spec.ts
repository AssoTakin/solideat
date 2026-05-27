import { test, expect } from '@playwright/test';

test.describe('Smoke — pages publiques', () => {
  test('health endpoint frontend', async ({ page }) => {
    await page.goto('/health');
    await expect(page.getByText('Frontend OK')).toBeVisible();
  });

  test('page de connexion', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Connexion' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible();
  });

  test('page d\'inscription', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('link', { name: /Se connecter/i })).toBeVisible();
  });
});
