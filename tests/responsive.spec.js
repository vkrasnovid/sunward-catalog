// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Responsive Design', () => {
  test('desktop (1440px): grid should have multiple columns', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    const grid = page.locator('#grid');
    const gridColumns = await grid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    // Multiple columns means multiple values separated by spaces
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBeGreaterThanOrEqual(3);
  });

  test('desktop (1440px): burger should be hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
    await expect(page.locator('#burger')).not.toBeVisible();
  });

  test('desktop (1440px): nav should be visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
    await expect(page.locator('#nav')).toBeVisible();
  });

  test('tablet (768px): burger should appear', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
    await expect(page.locator('#burger')).toBeVisible();
  });

  test('tablet (768px): nav should be hidden by default', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
    await expect(page.locator('#nav')).not.toBeVisible();
  });

  test('tablet (768px): grid columns should adjust', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    const grid = page.locator('#grid');
    const gridColumns = await grid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBeGreaterThanOrEqual(1);
    expect(columnCount).toBeLessThanOrEqual(3);
  });

  test('mobile (480px): grid should be single column', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 812 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    const grid = page.locator('#grid');
    const gridColumns = await grid.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    const columnCount = gridColumns.split(' ').length;
    expect(columnCount).toBe(1);
  });

  test('mobile (480px): toolbar should be column layout', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 812 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.toolbar', { timeout: 20000 });

    const toolbar = page.locator('.toolbar');
    const flexDir = await toolbar.evaluate(el => {
      return window.getComputedStyle(el).flexDirection;
    });
    expect(flexDir).toBe('column');
  });

  test('mobile (480px): search box should take full width', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 812 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.search-box', { timeout: 20000 });

    const searchBox = page.locator('.search-box');
    const minWidth = await searchBox.evaluate(el => {
      return window.getComputedStyle(el).minWidth;
    });
    expect(minWidth).toBe('100%');
  });

  test('no horizontal overflow at 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('no horizontal overflow at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('no horizontal overflow at 480px', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 812 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('product detail: layout changes at 1024px breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/#/product/swe08b', { waitUntil: 'networkidle' });
    await page.waitForSelector('.product__top', { timeout: 20000 });

    const productTop = page.locator('.product__top');
    const columns = await productTop.evaluate(el => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });
    // At 1024px, should be single column
    const colCount = columns.split(' ').length;
    expect(colCount).toBe(1);
  });
});
