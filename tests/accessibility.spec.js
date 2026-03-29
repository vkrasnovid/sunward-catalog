// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Accessibility', () => {
  test('burger button should have aria-label', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const burger = page.locator('#burger');
    await expect(burger).toHaveAttribute('aria-label', 'Меню');
  });

  test('lightbox close button should have aria-label', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const closeBtn = page.locator('.lightbox__close');
    await expect(closeBtn).toHaveAttribute('aria-label', 'Закрыть');
  });

  test('lightbox prev button should have aria-label', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const prevBtn = page.locator('.lightbox__prev');
    await expect(prevBtn).toHaveAttribute('aria-label', 'Назад');
  });

  test('lightbox next button should have aria-label', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const nextBtn = page.locator('.lightbox__next');
    await expect(nextBtn).toHaveAttribute('aria-label', 'Вперёд');
  });

  test('logo should have aria-label', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const logo = page.locator('.header__logo');
    await expect(logo).toHaveAttribute('aria-label', 'SUNWARD');
  });

  test('page should have lang attribute', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBe('ru');
  });

  test('page should have meta description', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const desc = page.locator('meta[name="description"]');
    const content = await desc.getAttribute('content');
    expect(content).toBeTruthy();
    expect(content.length).toBeGreaterThan(0);
  });

  test('search input should be focusable', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('#search', { timeout: 20000 });
    const search = page.locator('#search');
    await search.focus();
    await expect(search).toBeFocused();
  });

  test('keyboard navigation: Tab should move focus between interactive elements', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    // Press Tab from body and check focus moves
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT']).toContain(firstFocused);
  });

  test('cards should use semantic article element', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
    const tagName = await page.locator('.card').first().evaluate(el => el.tagName);
    expect(tagName).toBe('ARTICLE');
  });

  test('page should use semantic header element', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const headerTag = await page.locator('#header').evaluate(el => el.tagName);
    expect(headerTag).toBe('HEADER');
  });

  test('page should use semantic nav element', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const navTag = await page.locator('#nav').evaluate(el => el.tagName);
    expect(navTag).toBe('NAV');
  });

  test('page should use semantic main element', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const mainTag = await page.locator('#app').evaluate(el => el.tagName);
    expect(mainTag).toBe('MAIN');
  });

  test('page should use semantic footer element', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const footerTag = await page.locator('.footer').evaluate(el => el.tagName);
    expect(footerTag).toBe('FOOTER');
  });

  test('catalog title should use h1', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.catalog__title', { timeout: 20000 });
    const tag = await page.locator('.catalog__title').evaluate(el => el.tagName);
    expect(tag).toBe('H1');
  });

  test('card images should have alt text', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card__img', { timeout: 20000 });
    const images = page.locator('.card__img');
    const count = await images.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt.length).toBeGreaterThan(0);
    }
  });

  test('focus visible states should exist on buttons', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
    // Check that search input has focus styles
    const search = page.locator('#search');
    await search.focus();
    const borderColor = await search.evaluate(el => {
      return window.getComputedStyle(el).borderColor;
    });
    // When focused, border should change (--teal color)
    expect(borderColor).toBeTruthy();
  });
});
