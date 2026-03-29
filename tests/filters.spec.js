// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Category Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
  });

  test('should display 4 category tabs (All + 3 categories)', async ({ page }) => {
    const tabs = page.locator('.cat-tab');
    await expect(tabs).toHaveCount(4);
  });

  test('"Все" tab should be active by default and show 42', async ({ page }) => {
    const allTab = page.locator('.cat-tab[data-cat="all"]');
    await expect(allTab).toHaveClass(/active/);
    await expect(allTab).toContainText('42');
  });

  test('clicking Экскаваторы tab should filter to 25 cards', async ({ page }) => {
    const tab = page.locator('.cat-tab[data-cat="Экскаваторы"]');
    await tab.click();
    await expect(tab).toHaveClass(/active/);
    // Wait for grid to update
    await page.waitForTimeout(300);
    const cards = page.locator('#grid .card');
    await expect(cards).toHaveCount(25);
    await expect(page.locator('#result-count')).toContainText('25');
  });

  test('clicking Мини-погрузчики tab should filter to 6 cards', async ({ page }) => {
    const tab = page.locator('.cat-tab[data-cat="Мини-погрузчики"]');
    await tab.click();
    await expect(tab).toHaveClass(/active/);
    await page.waitForTimeout(300);
    const cards = page.locator('#grid .card');
    await expect(cards).toHaveCount(6);
    await expect(page.locator('#result-count')).toContainText('6');
  });

  test('clicking Краны tab should filter to 11 cards', async ({ page }) => {
    const tab = page.locator('.cat-tab[data-cat="Краны"]');
    await tab.click();
    await expect(tab).toHaveClass(/active/);
    await page.waitForTimeout(300);
    const cards = page.locator('#grid .card');
    await expect(cards).toHaveCount(11);
    await expect(page.locator('#result-count')).toContainText('11');
  });

  test('subcategory tabs should appear when a category is selected', async ({ page }) => {
    const tab = page.locator('.cat-tab[data-cat="Экскаваторы"]');
    await tab.click();
    await page.waitForTimeout(300);
    const subTabs = page.locator('#sub-tabs');
    await expect(subTabs).toHaveClass(/visible/);
    // Should have "Все" + subcategories
    const subTabButtons = page.locator('.sub-tab');
    const count = await subTabButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('clicking subcategory should further filter products', async ({ page }) => {
    // Select Экскаваторы
    await page.locator('.cat-tab[data-cat="Экскаваторы"]').click();
    await page.waitForTimeout(300);
    // Click first non-"Все" subcategory
    const subTabs = page.locator('.sub-tab:not([data-sub="all"])');
    const firstSub = subTabs.first();
    await firstSub.click();
    await page.waitForTimeout(300);
    // Should have fewer than 25 cards
    const cards = page.locator('#grid .card');
    const count = await cards.count();
    expect(count).toBeLessThan(25);
    expect(count).toBeGreaterThan(0);
  });

  test('resetting to "Все" should show all 42 cards', async ({ page }) => {
    // First filter to a category
    await page.locator('.cat-tab[data-cat="Краны"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#grid .card')).toHaveCount(11);

    // Reset to all
    await page.locator('.cat-tab[data-cat="all"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#grid .card')).toHaveCount(42);
  });

  test('subcategory tabs should hide when "Все" is selected', async ({ page }) => {
    // Select a category to show subtabs
    await page.locator('.cat-tab[data-cat="Экскаваторы"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#sub-tabs')).toHaveClass(/visible/);

    // Reset to all
    await page.locator('.cat-tab[data-cat="all"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#sub-tabs')).not.toHaveClass(/visible/);
  });

  test('tab count badges should show correct numbers', async ({ page }) => {
    const allCount = page.locator('.cat-tab[data-cat="all"] .tab-count');
    await expect(allCount).toHaveText('42');

    const excCount = page.locator('.cat-tab[data-cat="Экскаваторы"] .tab-count');
    await expect(excCount).toHaveText('25');

    const miniCount = page.locator('.cat-tab[data-cat="Мини-погрузчики"] .tab-count');
    await expect(miniCount).toHaveText('6');

    const craneCount = page.locator('.cat-tab[data-cat="Краны"] .tab-count');
    await expect(craneCount).toHaveText('11');
  });
});
