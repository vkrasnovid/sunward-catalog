// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Page Load', () => {
  test('should return HTTP 200', async ({ page }) => {
    const response = await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    expect(response.status()).toBe(200);
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('SUNWARD — Каталог техники');
  });

  test('should load data.json successfully', async ({ page }) => {
    const dataPromise = page.waitForResponse(resp =>
      resp.url().includes('data.json') && resp.status() === 200
    );
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const dataResponse = await dataPromise;
    const json = await dataResponse.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBe(42);
  });

  test('should render 42 product cards', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(42);
  });

  test('should display catalog title', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.catalog__title', { timeout: 20000 });
    await expect(page.locator('.catalog__title')).toHaveText('Каталог техники SUNWARD');
  });

  test('should display header with logo', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await expect(page.locator('.header__logo')).toBeVisible();
    await expect(page.locator('.logo-sun')).toHaveText('SUN');
    await expect(page.locator('.logo-ward').first()).toHaveText('WARD');
  });

  test('should display footer', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await expect(page.locator('.footer')).toBeVisible();
  });
});
