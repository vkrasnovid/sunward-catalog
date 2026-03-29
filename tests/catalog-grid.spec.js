// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Catalog Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
  });

  test('should render .card elements in the grid', async ({ page }) => {
    const grid = page.locator('#grid');
    await expect(grid).toBeVisible();
    const cards = grid.locator('.card');
    await expect(cards).toHaveCount(42);
  });

  test('each card should have an image', async ({ page }) => {
    const images = page.locator('.card__img');
    const count = await images.count();
    expect(count).toBe(42);
    // Check first card image has a src attribute
    const firstSrc = await images.first().getAttribute('src');
    expect(firstSrc).toBeTruthy();
    expect(firstSrc.length).toBeGreaterThan(0);
  });

  test('each card should have a title', async ({ page }) => {
    const titles = page.locator('.card__title');
    const count = await titles.count();
    expect(count).toBe(42);
    // First title should not be empty
    const firstText = await titles.first().textContent();
    expect(firstText.trim().length).toBeGreaterThan(0);
  });

  test('each card should have a subcategory label', async ({ page }) => {
    const cats = page.locator('.card__cat');
    const count = await cats.count();
    expect(count).toBe(42);
  });

  test('each card should have specs section', async ({ page }) => {
    const specs = page.locator('.card__specs');
    const count = await specs.count();
    expect(count).toBe(42);
  });

  test('each card should have a "Подробнее" button', async ({ page }) => {
    const buttons = page.locator('.card__btn');
    const count = await buttons.count();
    expect(count).toBe(42);
    await expect(buttons.first()).toHaveText('Подробнее');
  });

  test('card button should link to product detail', async ({ page }) => {
    const firstBtn = page.locator('.card__btn').first();
    const href = await firstBtn.getAttribute('href');
    expect(href).toMatch(/^#\/product\/.+$/);
  });

  test('card image wrap should link to product detail', async ({ page }) => {
    const firstWrap = page.locator('.card__img-wrap').first();
    const href = await firstWrap.getAttribute('href');
    expect(href).toMatch(/^#\/product\/.+$/);
  });

  test('result count should show 42', async ({ page }) => {
    const resultCount = page.locator('#result-count');
    await expect(resultCount).toContainText('42');
  });
});
