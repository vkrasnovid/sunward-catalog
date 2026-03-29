// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
  });

  test('header should have 4 nav links', async ({ page }) => {
    const navLinks = page.locator('.nav-link');
    await expect(navLinks).toHaveCount(4);
  });

  test('first nav link "Каталог" should be active by default', async ({ page }) => {
    const catalogLink = page.locator('.nav-link[data-cat="all"]');
    await expect(catalogLink).toHaveClass(/active/);
    await expect(catalogLink).toHaveText('Каталог');
  });

  test('clicking nav link should filter by category', async ({ page }) => {
    const excLink = page.locator('.nav-link[data-cat="Экскаваторы"]');
    await excLink.click();
    await page.waitForTimeout(300);
    await expect(excLink).toHaveClass(/active/);
    await expect(page.locator('#grid .card')).toHaveCount(25);
  });

  test('clicking nav link should update active state', async ({ page }) => {
    const craneLink = page.locator('.nav-link[data-cat="Краны"]');
    await craneLink.click();
    await page.waitForTimeout(300);

    // Crane link should be active
    await expect(craneLink).toHaveClass(/active/);
    // Catalog link should NOT be active
    await expect(page.locator('.nav-link[data-cat="all"]')).not.toHaveClass(/active/);
  });

  test('phone link should have correct tel: href', async ({ page }) => {
    const phone = page.locator('.header__phone');
    await expect(phone).toBeVisible();
    await expect(phone).toHaveAttribute('href', 'tel:+79372227272');
  });

  test('phone link should display number', async ({ page }) => {
    const phone = page.locator('.header__phone');
    await expect(phone).toContainText('+7 (937) 222-72-72');
  });

  test('sticky header should get .scrolled class on scroll', async ({ page }) => {
    const header = page.locator('#header');
    // Initially no scrolled class
    await expect(header).not.toHaveClass(/scrolled/);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(200);
    await expect(header).toHaveClass(/scrolled/);

    // Scroll back up
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    await expect(header).not.toHaveClass(/scrolled/);
  });

  test('burger button should exist in DOM', async ({ page }) => {
    const burger = page.locator('#burger');
    // Burger exists but may be hidden on desktop
    await expect(burger).toBeAttached();
  });

  test('burger should open/close nav on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    const burger = page.locator('#burger');
    const nav = page.locator('#nav');

    // Burger should be visible on mobile
    await expect(burger).toBeVisible();

    // Nav should not have .open initially
    await expect(nav).not.toHaveClass(/open/);

    // Click burger to open
    await burger.click();
    await page.waitForTimeout(200);
    await expect(nav).toHaveClass(/open/);

    // Click burger to close
    await burger.click();
    await page.waitForTimeout(200);
    await expect(nav).not.toHaveClass(/open/);
  });

  test('nav links should route correctly from product page', async ({ page }) => {
    // Go to a product page first
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/#/product/swe08b', { waitUntil: 'networkidle' });
    await page.waitForSelector('.product', { timeout: 20000 });

    // Click "Каталог" nav link
    const catalogLink = page.locator('.nav-link[data-cat="all"]');
    await catalogLink.click();
    await page.waitForSelector('.catalog', { timeout: 20000 });
    await expect(page.locator('.catalog')).toBeVisible();
  });
});
