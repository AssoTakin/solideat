import { test, expect } from '@playwright/test';

/**
 * E2E-P0-08 — Plans d'abonnement (lecture, mode mock).
 */
test.describe('Abonnements — plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('votre@email.com').fill('test@solideat.fr');
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('affiche les plans premium', async ({ page }) => {
    await page.goto('/subscriptions/plans');

    await expect(page.getByRole('heading', { name: "Plans d'abonnement" })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Premium Mensuel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Premium Annuel' })).toBeVisible();
  });
});
