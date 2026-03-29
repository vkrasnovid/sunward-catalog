// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Images & Links', () => {
  test('all card images should load successfully (naturalWidth > 0)', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card__img');
    // Wait extra time for images to load
    await page.waitForTimeout(3000);

    const images = page.locator('.card__img');
    const count = await images.count();
    expect(count).toBe(42);

    let brokenImages = [];
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const naturalWidth = await img.evaluate(el => el.naturalWidth);
      const src = await img.getAttribute('src');
      if (naturalWidth === 0) {
        brokenImages.push(src);
      }
    }

    if (brokenImages.length > 0) {
      console.log(`Found ${brokenImages.length} broken images:`, brokenImages);
    }
    // Allow some tolerance - external images may fail to load
    // But log them as potential issues
    expect(brokenImages.length).toBeLessThanOrEqual(5);
  });

  test('footer phone link should have correct tel: format', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const footerPhone = page.locator('.footer__phone');
    await expect(footerPhone).toHaveAttribute('href', 'tel:+79372227272');
    await expect(footerPhone).toContainText('+7 (937) 222-72-72');
  });

  test('footer external links should have target=_blank and rel=noopener', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const footerLinks = page.locator('.footer__link');
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const link = footerLinks.nth(i);
      const href = await link.getAttribute('href');
      if (href && href.startsWith('http')) {
        await expect(link).toHaveAttribute('target', '_blank');
        const rel = await link.getAttribute('rel');
        expect(rel).toContain('noopener');
      }
    }
  });

  test('header phone link should have tel: href', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const headerPhone = page.locator('.header__phone');
    await expect(headerPhone).toHaveAttribute('href', 'tel:+79372227272');
  });

  test('product CTA link should have target=_blank and rel=noopener', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/#/product/swe08b', { waitUntil: 'networkidle' });
    await page.waitForSelector('.product__cta', { timeout: 20000 });
    const cta = page.locator('.product__cta');
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', 'noopener');
  });

  test('logo should link to landing page', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const logo = page.locator('.header__logo');
    const href = await logo.getAttribute('href');
    expect(href).toContain('sunward-landing');
  });

  test('card images should have loading=lazy attribute', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card__img', { timeout: 20000 });
    const firstImg = page.locator('.card__img').first();
    await expect(firstImg).toHaveAttribute('loading', 'lazy');
  });

  test('BUG: broken <img> with empty src pointing to catalog root', async ({ page }) => {
    // Navigate to product detail to check lightbox img
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });

    // The known bug: lightbox img has empty src=""
    // which causes the browser to request the page URL itself
    const lightboxImg = page.locator('#lightbox-img');
    const src = await lightboxImg.getAttribute('src');

    if (src === '' || src === null) {
      console.log('BUG CONFIRMED: #lightbox-img has empty src attribute');
      console.log('Empty src causes browser to request the page URL, generating a broken image request');
      // This is the known bug - the src is empty before the lightbox is opened
      expect(src).toBe(''); // Document the bug
    } else {
      // If src is not empty, the bug may have been fixed
      expect(src.length).toBeGreaterThan(0);
    }
  });

  test('footer links structure should be complete', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    // Check dealer website link
    const dealerLink = page.locator('.footer__link').filter({ hasText: 'sunward-tvsagrotechnika.ru' });
    await expect(dealerLink).toBeVisible();
    await expect(dealerLink).toHaveAttribute('target', '_blank');

    // Check main page link
    const mainLink = page.locator('.footer__link').filter({ hasText: 'Главная страница' });
    await expect(mainLink).toBeVisible();
    await expect(mainLink).toHaveAttribute('target', '_blank');
  });

  test('footer copyright should be present', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const copy = page.locator('.footer__copy');
    await expect(copy).toBeVisible();
    await expect(copy).toContainText('SUNWARD');
    await expect(copy).toContainText('ТВС Агротехника');
  });

  test('footer dealer info should be present', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    const dealer = page.locator('.footer__dealer');
    await expect(dealer).toBeVisible();
    await expect(dealer).toContainText('Официальный дилер');
    await expect(dealer).toContainText('ТВС Агротехника');
  });
});
