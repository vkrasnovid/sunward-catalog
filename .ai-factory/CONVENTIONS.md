# SUNWARD Catalog SPA — QA Conventions

## Project
- **Type:** Static SPA (vanilla JS, no framework)
- **Live URL:** https://vkrasnovid.github.io/sunward-catalog/
- **Source:** index.html, js/app.js, css/style.css, data.json
- **Categories:** Экскаваторы (25), Мини-погрузчики (6), Краны (11) = 42 total

## Tech Stack
- Vanilla JS (IIFE), no build step
- Hash-based routing (#/, #/product/<slug>)
- CSS variables, responsive, no preprocessor

## Testing
- **Framework:** Playwright (@playwright/test)
- **Test directory:** tests/
- **Config:** playwright.config.js at project root
- Use real selectors from source code
- Test against LIVE URL, not local
