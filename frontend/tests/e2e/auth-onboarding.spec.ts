import { test, expect } from '@playwright/test';

/**
 * E2E-P0-01 — Parcours auth (mode dev avec données mockées).
 * Prérequis : `npm run dev` (USE_MOCK_DATA actif en DEV).
 */
test.describe('Auth — connexion mock', () => {
  test('connexion et accès au dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('votre@email.com').fill('test@solideat.fr');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByText(/Hello @MarieCuisine/i)).toBeVisible({ timeout: 10000 });
  });

  test('navigation login → inscription', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: "S'inscrire" }).click();
    await expect(page).toHaveURL(/\/register/);
  });
});
