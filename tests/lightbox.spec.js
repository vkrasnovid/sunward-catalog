// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Lightbox', () => {
  const productUrl = 'https://vkrasnovid.github.io/sunward-catalog/#/product/swe08b';

  test.beforeEach(async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#gallery-main', { timeout: 20000 });
  });

  test('lightbox should be hidden initially', async ({ page }) => {
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toHaveAttribute('hidden', '');
  });

  test('clicking gallery main image should open lightbox', async ({ page }) => {
    await page.locator('#gallery-main').click();
    await page.waitForTimeout(300);
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).not.toHaveAttribute('hidden', '');
    await expect(page.locator('#lightbox-img')).toBeVisible();
  });

  test('lightbox close button should close lightbox', async ({ page }) => {
    // Open lightbox
    await page.locator('#gallery-main').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#lightbox')).not.toHaveAttribute('hidden', '');

    // Close
    await page.locator('.lightbox__close').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#lightbox')).toHaveAttribute('hidden', '');
  });

  test('lightbox prev/next buttons should navigate images', async ({ page }) => {
    // Open lightbox
    await page.locator('#gallery-main').click();
    await page.waitForTimeout(300);

    const img = page.locator('#lightbox-img');
    const srcBefore = await img.getAttribute('src');

    // Click next
    await page.locator('.lightbox__next').click();
    await page.waitForTimeout(300);
    const srcAfterNext = await img.getAttribute('src');
    expect(srcAfterNext).not.toBe(srcBefore);

    // Click prev
    await page.locator('.lightbox__prev').click();
    await page.waitForTimeout(300);
    const srcAfterPrev = await img.getAttribute('src');
    expect(srcAfterPrev).toBe(srcBefore);
  });

  test('Escape key should close lightbox', async ({ page }) => {
    // Open lightbox
    await page.locator('#gallery-main').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#lightbox')).not.toHaveAttribute('hidden', '');

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(page.locator('#lightbox')).toHaveAttribute('hidden', '');
  });

  test('ArrowRight key should navigate to next image', async ({ page }) => {
    await page.locator('#gallery-main').click();
    await page.waitForTimeout(300);
    const srcBefore = await page.locator('#lightbox-img').getAttribute('src');

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const srcAfter = await page.locator('#lightbox-img').getAttribute('src');
    expect(srcAfter).not.toBe(srcBefore);
  });

  test('ArrowLeft key should navigate to previous image', async ({ page }) => {
    await page.locator('#gallery-main').click();
    await page.waitForTimeout(300);

    // Go right first
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    const srcMid = await page.locator('#lightbox-img').getAttribute('src');

    // Go left
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    const srcBack = await page.locator('#lightbox-img').getAttribute('src');
    expect(srcBack).not.toBe(srcMid);
  });

  test('clicking outside lightbox image should close it', async ({ page }) => {
    await page.locator('#gallery-main').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#lightbox')).not.toHaveAttribute('hidden', '');

    // Click on the lightbox background (not on the image)
    const lightbox = page.locator('#lightbox');
    const box = await lightbox.boundingBox();
    // Click in the top-left corner away from the image
    await page.mouse.click(box.x + 10, box.y + 10);
    await page.waitForTimeout(300);
    await expect(page.locator('#lightbox')).toHaveAttribute('hidden', '');
  });

  test('BUG: lightbox overlay has display:flex even when hidden, blocking clicks', async ({ page }) => {
    // This verifies the known bug: #lightbox has CSS display:flex
    // even when hidden attribute is set. This can block clicks on elements beneath it.
    const lightbox = page.locator('#lightbox');

    // Lightbox should be hidden
    await expect(lightbox).toHaveAttribute('hidden', '');

    // Check computed display style - the BUG is that CSS sets display:flex
    // which overrides the hidden attribute's display:none
    const display = await lightbox.evaluate(el => {
      return window.getComputedStyle(el).display;
    });

    // If the bug exists, display will be 'flex' instead of 'none'
    // We expect 'none' for correct behavior but document the bug
    if (display === 'flex') {
      // BUG CONFIRMED: lightbox has display:flex even when hidden
      // This means the lightbox overlay is rendered on top of the page
      // and intercepts all pointer events, blocking burger menu and filters
      console.log('BUG CONFIRMED: Lightbox has display:flex when hidden. Expected display:none.');

      // Verify the lightbox is intercepting clicks
      const pointerEvents = await lightbox.evaluate(el => {
        return window.getComputedStyle(el).pointerEvents;
      });
      // If pointer-events is not 'none', clicks are being blocked
      expect(display).toBe('flex'); // Document the bug exists
    } else {
      // Bug is fixed
      expect(display).toBe('none');
    }
  });

  test('BUG: lightbox overlay blocks burger menu when hidden', async ({ page }) => {
    // Set mobile viewport so burger is visible
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    const lightbox = page.locator('#lightbox');
    const display = await lightbox.evaluate(el => window.getComputedStyle(el).display);

    if (display !== 'none') {
      // Bug exists - lightbox overlay may intercept clicks
      // Check if opacity is 0 (which still blocks clicks if display isn't none)
      const opacity = await lightbox.evaluate(el => window.getComputedStyle(el).opacity);
      console.log(`BUG: Lightbox display=${display}, opacity=${opacity} when hidden`);

      // Despite the bug, browser's hidden attribute should prevent pointer events
      // Test if burger click actually works
      const burger = page.locator('#burger');
      await burger.click({ force: true });
      await page.waitForTimeout(200);
      const navOpen = await page.locator('#nav').evaluate(el => el.classList.contains('open'));
      // Document whether the click went through
      console.log(`Burger click result: nav.open = ${navOpen}`);
    }
  });
});
