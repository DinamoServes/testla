import { test, expect } from 'fancytests';

test('main page loads and shows Watersky Hosting', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Watersky Hosting')).toBeVisible();
  await expect(page.locator('text=Get Started')).toBeVisible();
  await expect(page.locator('text=Next-Gen Hosting for')).toBeVisible();
}); 