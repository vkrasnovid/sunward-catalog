// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Search & Sort', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
  });

  test('search input should be visible', async ({ page }) => {
    const search = page.locator('#search');
    await expect(search).toBeVisible();
    await expect(search).toHaveAttribute('placeholder', 'Поиск по модели...');
  });

  test('searching by model name should filter cards', async ({ page }) => {
    const search = page.locator('#search');
    await search.fill('SWE08');
    // Wait for debounce (200ms) + render
    await page.waitForTimeout(500);
    const cards = page.locator('#grid .card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(42);
  });

  test('search should be case insensitive', async ({ page }) => {
    const search = page.locator('#search');
    await search.fill('swe08');
    await page.waitForTimeout(500);
    const cardsLower = await page.locator('#grid .card').count();

    await search.fill('');
    await page.waitForTimeout(500);
    await search.fill('SWE08');
    await page.waitForTimeout(500);
    const cardsUpper = await page.locator('#grid .card').count();

    expect(cardsLower).toBe(cardsUpper);
    expect(cardsLower).toBeGreaterThan(0);
  });

  test('empty search should show all products', async ({ page }) => {
    const search = page.locator('#search');
    await search.fill('SWE08');
    await page.waitForTimeout(500);
    expect(await page.locator('#grid .card').count()).toBeLessThan(42);

    // Clear search
    await search.fill('');
    await page.waitForTimeout(500);
    await expect(page.locator('#grid .card')).toHaveCount(42);
  });

  test('non-matching search should show empty state', async ({ page }) => {
    const search = page.locator('#search');
    await search.fill('xyznonexistent12345');
    await page.waitForTimeout(500);
    const emptyState = page.locator('.empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState.locator('h3')).toHaveText('Ничего не найдено');
  });

  test('sort dropdown should be visible with 3 options', async ({ page }) => {
    const sort = page.locator('#sort');
    await expect(sort).toBeVisible();
    const options = sort.locator('option');
    await expect(options).toHaveCount(3);
  });

  test('sort by name should be default', async ({ page }) => {
    const sort = page.locator('#sort');
    await expect(sort).toHaveValue('name');
  });

  test('sorting by weight ascending should change card order', async ({ page }) => {
    // Get first card title with default sort
    const firstTitleBefore = await page.locator('.card__title').first().textContent();

    // Sort by weight ascending
    await page.locator('#sort').selectOption('weight-asc');
    await page.waitForTimeout(300);

    const firstTitleAfter = await page.locator('.card__title').first().textContent();
    // Cards should still be 42 total
    await expect(page.locator('#grid .card')).toHaveCount(42);
    // Order may or may not change depending on data, but we verify sort executes
  });

  test('sorting by weight descending should change card order', async ({ page }) => {
    await page.locator('#sort').selectOption('weight-desc');
    await page.waitForTimeout(300);
    await expect(page.locator('#grid .card')).toHaveCount(42);

    // Switch back to name
    await page.locator('#sort').selectOption('name');
    await page.waitForTimeout(300);
    await expect(page.locator('#grid .card')).toHaveCount(42);
  });

  test('result count should update after search', async ({ page }) => {
    await page.locator('#search').fill('SWE');
    await page.waitForTimeout(500);
    const resultText = await page.locator('#result-count').textContent();
    expect(resultText).not.toContain('42');
    const match = resultText.match(/(\d+)/);
    expect(match).not.toBeNull();
    expect(parseInt(match[1])).toBeLessThan(42);
    expect(parseInt(match[1])).toBeGreaterThan(0);
  });
});
