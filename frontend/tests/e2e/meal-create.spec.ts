import { test, expect } from '@playwright/test';

/**
 * E2E-P0-02 — Accès au formulaire de création de repas (mode mock).
 */
test.describe('Repas — création', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('votre@email.com').fill('test@solideat.fr');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('affiche le formulaire proposer un repas', async ({ page }) => {
    await page.goto('/meals/new');

    await expect(page.getByText('Proposer un repas')).toBeVisible();
    await expect(page.getByText('Nom du repas *')).toBeVisible();
  });
});
