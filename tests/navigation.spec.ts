import { test, expect } from '@playwright/test';

test.describe('Navigation & Core Pages', () => {
  test('Landing page loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that the main Oratii branding is visible
    await expect(page.locator('text=Oratii').first()).toBeVisible();
    
    // Check for the main call to action
    await expect(page.locator('text=Get Started Free').first()).toBeVisible();
  });

  test('About page loads correctly', async ({ page }) => {
    await page.goto('/about');
    
    // Check for the "Our Mission" or "Why Oratii?" text
    await expect(page.locator('text=Our Mission')).toBeVisible();
    await expect(page.locator('text=Why Oratii?')).toBeVisible();
  });

  test('Login page loads correctly', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login elements
    await expect(page.locator('text=Welcome back!')).toBeVisible();
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible();
  });
});
