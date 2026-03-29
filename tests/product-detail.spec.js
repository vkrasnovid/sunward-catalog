// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Product Detail Page', () => {
  const productSlug = 'swe08b';
  const productUrl = `https://vkrasnovid.github.io/sunward-catalog/#/product/${productSlug}`;

  test('should navigate to product page via hash routing', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.product', { timeout: 20000 });
    await expect(page.locator('.product')).toBeVisible();
  });

  test('should display product title', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.product__title', { timeout: 20000 });
    const title = page.locator('.product__title');
    await expect(title).toBeVisible();
    const text = await title.textContent();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('should display category breadcrumb', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.product__cat', { timeout: 20000 });
    const cat = page.locator('.product__cat');
    await expect(cat).toBeVisible();
    await expect(cat).toContainText('/');
  });

  test('back button should return to catalog', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.product__back', { timeout: 20000 });
    const backLink = page.locator('.product__back');
    await expect(backLink).toBeVisible();
    await expect(backLink).toContainText('Назад к каталогу');
    await backLink.click();
    await page.waitForSelector('.catalog');
    await expect(page.locator('.catalog')).toBeVisible();
  });

  test('should display gallery with main image', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('#gallery-img', { timeout: 20000 });
    const mainImg = page.locator('#gallery-img');
    await expect(mainImg).toBeVisible();
    const src = await mainImg.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src.length).toBeGreaterThan(0);
  });

  test('should display gallery thumbnails', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.gallery__thumb', { timeout: 20000 });
    const thumbs = page.locator('.gallery__thumb');
    const count = await thumbs.count();
    expect(count).toBeGreaterThanOrEqual(2);
    // First thumb should be active
    await expect(thumbs.first()).toHaveClass(/active/);
  });

  test('clicking a thumbnail should change main image', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.gallery__thumb', { timeout: 20000 });
    const mainImg = page.locator('#gallery-img');
    const srcBefore = await mainImg.getAttribute('src');

    // Click second thumbnail
    const secondThumb = page.locator('.gallery__thumb').nth(1);
    await secondThumb.click();
    await page.waitForTimeout(400);

    await expect(secondThumb).toHaveClass(/active/);
    const srcAfter = await mainImg.getAttribute('src');
    expect(srcAfter).not.toBe(srcBefore);
  });

  test('should display quick-specs section', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.quick-specs', { timeout: 20000 });
    const quickSpecs = page.locator('.quick-specs');
    await expect(quickSpecs).toBeVisible();
    const items = quickSpecs.locator('.quick-spec');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
  });

  test('quick-spec items should have label and value', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.quick-spec', { timeout: 20000 });
    const firstSpec = page.locator('.quick-spec').first();
    await expect(firstSpec.locator('.quick-spec__label')).toBeVisible();
    await expect(firstSpec.locator('.quick-spec__value')).toBeVisible();
  });

  test('should display specs table', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.specs-table', { timeout: 20000 });
    const table = page.locator('.specs-table');
    await expect(table).toBeVisible();
    const rows = table.locator('tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('description toggle should expand/collapse text', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    // Not all products have description, check if toggle exists
    const toggle = page.locator('#desc-toggle');
    if (await toggle.isVisible()) {
      const desc = page.locator('#desc');
      // Initially not expanded
      await expect(desc).not.toHaveClass(/expanded/);

      // Click to expand
      await toggle.click();
      await expect(desc).toHaveClass(/expanded/);
      await expect(toggle).toHaveText('Свернуть');

      // Click to collapse
      await toggle.click();
      await expect(desc).not.toHaveClass(/expanded/);
      await expect(toggle).toHaveText('Читать полностью');
    }
  });

  test('should display related products', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.related', { timeout: 20000 });
    const related = page.locator('.related');
    await expect(related).toBeVisible();
    await expect(related.locator('.related__title')).toHaveText('Похожая техника');
    const relatedCards = related.locator('.card');
    const count = await relatedCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(4);
  });

  test('should display CTA button', async ({ page }) => {
    await page.goto(productUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector('.product__cta', { timeout: 20000 });
    const cta = page.locator('.product__cta');
    await expect(cta).toBeVisible();
    await expect(cta).toContainText('Узнать стоимость');
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', 'noopener');
  });

  test('navigating from catalog card to product and back', async ({ page }) => {
    await page.goto('https://vkrasnovid.github.io/sunward-catalog/', { waitUntil: 'networkidle' });
    await page.waitForSelector('.card', { timeout: 20000 });
    // Click first card's button
    const firstBtn = page.locator('.card__btn').first();
    const href = await firstBtn.getAttribute('href');
    await firstBtn.click();
    await page.waitForSelector('.product', { timeout: 20000 });
    await expect(page.locator('.product')).toBeVisible();

    // Go back
    await page.locator('.product__back').click();
    await page.waitForSelector('.catalog', { timeout: 20000 });
    await expect(page.locator('#grid .card')).toHaveCount(42);
  });
});
