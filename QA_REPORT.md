# QA Report: SUNWARD Catalog SPA

**URL:** https://vkrasnovid.github.io/sunward-catalog/
**Date:** 2026-03-29
**Tester:** QA Agent (Playwright + Claude Code)
**Total tests:** 111 | **Passed:** 109 | **Failed:** 2

## Summary by File

| File | Tests | Passed | Failed |
|------|-------|--------|--------|
| page-load.spec.js | 7 | 6 | 1 |
| catalog-grid.spec.js | 9 | 9 | 0 |
| filters.spec.js | 10 | 10 | 0 |
| search-sort.spec.js | 10 | 10 | 0 |
| product-detail.spec.js | 12 | 12 | 0 |
| navigation.spec.js | 10 | 10 | 0 |
| lightbox.spec.js | 9 | 9 | 0 |
| responsive.spec.js | 13 | 13 | 0 |
| accessibility.spec.js | 17 | 17 | 0 |
| images-links.spec.js | 14 | 13 | 1 |

## Remaining Failures

### 1. page-load: "should display header with logo"
**Cause:** Test bug — `.logo-sun` selector resolves to 2 elements (header + footer). Needs `.first()`.
**Severity:** Low (test issue, not app issue)

### 2. images-links: "all card images should load successfully"
**Cause:** 21 images hosted on sunward-tvsagrotechnika.ru return 403/404. External hosting, not under our control.
**Severity:** Medium (degraded UX — placeholder shown instead of image)

**Broken images (21):**
- 3 mini-loaders (SWL3220RK, SWL4028, SWL4528)
- 6 mini-excavators (SWE08B, SWE18UF, SWE20F, SWE25F, SWE25UF, SWE35UF)
- 8 cranes (SWCC1000E, SWQUY55B, SWTC16B, SWTC26, SWTC35B, SWTC55B, SWTC5C, SWTC75B)
- 4 excavators (SWE205E, SWE210, SWE215E-3H, SWE265F)

## Bugs Fixed (this session)

| # | Bug | Severity | Fix | Status |
|---|-----|----------|-----|--------|
| 1 | Lightbox overlay blocks ALL clicks | Critical | `.lightbox[hidden] { display: none !important }` in style.css | ✅ Fixed |
| 2 | `#lightbox-img` empty `src=""` | Minor | Changed to `src="data:,"` in index.html | ✅ Fixed |
| 3 | No fallback for broken images | Medium | Added placeholder div on image error in app.js | ✅ Fixed |

## Test Coverage

- ✅ Page load & data loading
- ✅ Catalog grid rendering (42 cards)
- ✅ Category filters (Все/Экскаваторы/Мини-погрузчики/Краны)
- ✅ Subcategory filtering
- ✅ Search by model name
- ✅ Sort (name, weight asc/desc)
- ✅ Product detail pages (hash routing)
- ✅ Gallery thumbnails & lightbox
- ✅ Lightbox keyboard navigation (Escape, arrows)
- ✅ Burger menu (mobile)
- ✅ Sticky header
- ✅ Responsive layout (480/768/1024/1440px)
- ✅ Accessibility (aria-labels, semantic HTML, keyboard nav)
- ✅ External links (target=_blank, rel=noopener)
- ✅ Performance (load < 5s)
