/* SUNWARD Catalog SPA */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const app = $('#app');
  let products = [];
  let state = { cat: 'all', sub: 'all', search: '', sort: 'name', lightboxImages: [], lightboxIdx: 0 };

  /* ── Data Loading ── */
  async function loadData() {
    try {
      const res = await fetch('data.json');
      products = await res.json();
      products.forEach(p => {
        p.cleanDesc = cleanDescription(p.description);
        p.weight = parseWeight(p.quickSpecs);
        p.cleanSpecs = cleanSpecs(p.specs);
      });
      route();
    } catch (e) {
      app.innerHTML = '<div class="empty-state"><h3>Ошибка загрузки каталога</h3><p>Попробуйте обновить страницу</p></div>';
    }
  }

  function cleanDescription(raw) {
    if (!raw) return '';
    const markers = [
      /Техника высоких стандартов.*?(?=SUNWARD|$)/s,
      /-->[\s\S]*?(?=SUNWARD|[А-ЯЁ]{2,}\s+[A-Z])/,
      /\.card__[\s\S]*?(?=\n\s*[А-ЯЁ])/,
      /\n\s*Главная[\s\S]*?(?=\n\s*[А-ЯЁ]{3,})/,
    ];
    let text = raw;
    const sunwardIdx = text.indexOf('SUNWARD ');
    if (sunwardIdx > 0) {
      text = text.substring(sunwardIdx);
    }
    text = text.replace(/\.card__[\s\S]*$/m, '');
    text = text.replace(/ВНИМАНИЕ![\s\S]*$/i, '');
    text = text.replace(/\s+/g, ' ').trim();
    if (text.length < 20) return '';
    return text;
  }

  function parseWeight(qs) {
    if (!qs) return 0;
    const key = Object.keys(qs).find(k => k.toLowerCase().includes('вес') || k.toLowerCase().includes('масса'));
    if (!key) return 0;
    return parseFloat(String(qs[key]).replace(/\s/g, '')) || 0;
  }

  function cleanSpecs(specs) {
    if (!specs) return {};
    const result = {};
    const seen = new Set();
    for (const [key, val] of Object.entries(specs)) {
      const parts = key.split('\n');
      const cleanKey = parts[parts.length - 1].trim();
      if (cleanKey && !seen.has(cleanKey)) {
        seen.add(cleanKey);
        result[cleanKey] = val;
      }
    }
    return result;
  }

  /* ── Router ── */
  function route() {
    const hash = location.hash || '#/';
    const productMatch = hash.match(/^#\/product\/(.+)$/);
    if (productMatch) {
      const slug = decodeURIComponent(productMatch[1]);
      const product = products.find(p => p.slug === slug);
      if (product) return renderProduct(product);
    }
    renderCatalog();
  }

  window.addEventListener('hashchange', route);

  /* ── Catalog View ── */
  function renderCatalog() {
    const categories = [...new Set(products.map(p => p.category))];
    const catCounts = {};
    categories.forEach(c => { catCounts[c] = products.filter(p => p.category === c).length; });

    app.innerHTML = `
      <div class="catalog container">
        <div class="catalog__hero">
          <h1 class="catalog__title">Каталог техники SUNWARD</h1>
          <p class="catalog__subtitle">Экскаваторы, мини-погрузчики и краны для любых задач</p>
        </div>

        <div class="cat-tabs" id="cat-tabs">
          <button class="cat-tab ${state.cat === 'all' ? 'active' : ''}" data-cat="all">
            Все<span class="tab-count">${products.length}</span>
          </button>
          ${categories.map(c => `
            <button class="cat-tab ${state.cat === c ? 'active' : ''}" data-cat="${c}">
              ${c}<span class="tab-count">${catCounts[c]}</span>
            </button>
          `).join('')}
        </div>

        <div class="sub-tabs" id="sub-tabs"></div>

        <div class="toolbar">
          <div class="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" id="search" placeholder="Поиск по модели..." value="${state.search}" autocomplete="off">
          </div>
          <select class="sort-select" id="sort">
            <option value="name" ${state.sort === 'name' ? 'selected' : ''}>По названию</option>
            <option value="weight-asc" ${state.sort === 'weight-asc' ? 'selected' : ''}>По весу ↑</option>
            <option value="weight-desc" ${state.sort === 'weight-desc' ? 'selected' : ''}>По весу ↓</option>
          </select>
          <span class="result-count" id="result-count"></span>
        </div>

        <div class="grid" id="grid"></div>
      </div>
    `;

    updateNavLinks();
    updateSubTabs();
    filterAndRender();
    bindCatalogEvents();
  }

  function updateNavLinks() {
    $$('.nav-link').forEach(link => {
      const cat = link.dataset.cat;
      link.classList.toggle('active', cat === state.cat);
    });
  }

  function getSubcategories(cat) {
    const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
    return [...new Set(filtered.map(p => p.subcategory))];
  }

  function updateSubTabs() {
    const container = $('#sub-tabs');
    if (!container) return;
    if (state.cat === 'all') {
      container.classList.remove('visible');
      container.innerHTML = '';
      return;
    }
    const subs = getSubcategories(state.cat);
    if (subs.length <= 1) {
      container.classList.remove('visible');
      container.innerHTML = '';
      return;
    }
    container.innerHTML = `
      <button class="sub-tab ${state.sub === 'all' ? 'active' : ''}" data-sub="all">Все</button>
      ${subs.map(s => `<button class="sub-tab ${state.sub === s ? 'active' : ''}" data-sub="${s}">${s}</button>`).join('')}
    `;
    container.classList.add('visible');

    $$('.sub-tab', container).forEach(btn => {
      btn.addEventListener('click', () => {
        state.sub = btn.dataset.sub;
        $$('.sub-tab', container).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAndRender();
      });
    });
  }

  function filterAndRender() {
    let filtered = [...products];

    if (state.cat !== 'all') {
      filtered = filtered.filter(p => p.category === state.cat);
    }
    if (state.sub !== 'all') {
      filtered = filtered.filter(p => p.subcategory === state.sub);
    }
    if (state.search) {
      const q = state.search.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }

    switch (state.sort) {
      case 'name': filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru')); break;
      case 'weight-asc': filtered.sort((a, b) => a.weight - b.weight); break;
      case 'weight-desc': filtered.sort((a, b) => b.weight - a.weight); break;
    }

    const grid = $('#grid');
    const count = $('#result-count');
    if (count) count.textContent = `${filtered.length} ${pluralize(filtered.length, 'модель', 'модели', 'моделей')}`;

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M8 11h6"/></svg>
          <h3>Ничего не найдено</h3>
          <p>Попробуйте изменить параметры поиска</p>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(p => cardHTML(p)).join('');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });

    $$('.card', grid).forEach((card, i) => {
      card.style.transitionDelay = `${i * 50}ms`;
      observer.observe(card);
    });

    $$('.card__img', grid).forEach(img => {
      img.addEventListener('load', () => {
        const skeleton = img.parentElement.querySelector('.skeleton');
        if (skeleton) skeleton.remove();
      });
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const skeleton = img.parentElement.querySelector('.skeleton');
        if (skeleton) skeleton.remove();
        const wrap = img.parentElement;
        if (!wrap.querySelector('.card__img-placeholder')) {
          const ph = document.createElement('div');
          ph.className = 'card__img-placeholder';
          ph.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:.85rem;text-align:center;padding:16px;';
          ph.innerHTML = '<span>Изображение<br>недоступно</span>';
          wrap.appendChild(ph);
        }
      });
    });
  }

  function cardHTML(p) {
    const specs = Object.entries(p.quickSpecs || {}).slice(0, 4);
    return `
      <article class="card">
        <a href="#/product/${p.slug}" class="card__img-wrap">
          <div class="skeleton"></div>
          <img class="card__img" src="${p.mainImage}" alt="${p.title}" loading="lazy">
          ${p.isHit ? '<span class="card__badge">Хит</span>' : ''}
        </a>
        <div class="card__body">
          <span class="card__cat">${p.subcategory}</span>
          <h3 class="card__title">${p.title}</h3>
          <div class="card__specs">
            ${specs.map(([k, v]) => `
              <div class="card__spec">
                ${truncLabel(k)}
                <strong>${v}</strong>
              </div>
            `).join('')}
          </div>
          <a href="#/product/${p.slug}" class="card__btn">Подробнее</a>
        </div>
      </article>`;
  }

  function truncLabel(label) {
    const clean = label.replace(/,\s*[а-яёa-z³²/]+$/i, '').trim();
    return clean.length > 24 ? clean.substring(0, 22) + '...' : clean;
  }

  function bindCatalogEvents() {
    $$('.cat-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.cat = tab.dataset.cat;
        state.sub = 'all';
        $$('.cat-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updateNavLinks();
        updateSubTabs();
        filterAndRender();
      });
    });

    const searchInput = $('#search');
    if (searchInput) {
      let timer;
      searchInput.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          state.search = searchInput.value.trim();
          filterAndRender();
        }, 200);
      });
    }

    const sortSelect = $('#sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        filterAndRender();
      });
    }

    $$('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        state.cat = link.dataset.cat;
        state.sub = 'all';
        state.search = '';
        location.hash = '#/';
        renderCatalog();
      });
    });
  }

  /* ── Product Detail ── */
  function renderProduct(p) {
    const images = (p.images || []).filter(url => !url.includes('/square/'));
    if (images.length === 0 && p.mainImage) images.push(p.mainImage);
    const videoId = extractYouTubeId(p.video);
    const related = products.filter(r => r.category === p.category && r.slug !== p.slug).slice(0, 4);
    const specEntries = Object.entries(p.cleanSpecs || {});

    app.innerHTML = `
      <div class="product container">
        <a href="#/" class="product__back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Назад к каталогу
        </a>

        <div class="product__top">
          <div class="gallery">
            <div class="gallery__main" id="gallery-main">
              <img src="${images[0] || p.mainImage}" alt="${p.title}" id="gallery-img">
            </div>
            ${images.length > 1 ? `
              <div class="gallery__thumbs">
                ${images.map((img, i) => `
                  <div class="gallery__thumb ${i === 0 ? 'active' : ''}" data-idx="${i}">
                    <img src="${img}" alt="" loading="lazy">
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="product__info">
            <span class="product__cat">${p.category} / ${p.subcategory}</span>
            <h1 class="product__title">${p.title}</h1>

            ${p.cleanDesc ? `
              <div class="product__desc" id="desc">${p.cleanDesc}</div>
              <button class="product__desc-toggle" id="desc-toggle">Читать полностью</button>
            ` : ''}

            ${Object.keys(p.quickSpecs || {}).length ? `
              <div class="quick-specs">
                ${Object.entries(p.quickSpecs).map(([k, v]) => `
                  <div class="quick-spec">
                    <div class="quick-spec__label">${k}</div>
                    <div class="quick-spec__value">${v}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <a href="${p.url}" target="_blank" rel="noopener" class="product__cta">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              Узнать стоимость
            </a>
          </div>
        </div>

        ${specEntries.length ? `
          <section class="specs-section">
            <h2 class="specs-section__title">Технические характеристики</h2>
            <table class="specs-table">
              ${specEntries.map(([k, v]) => `
                <tr><td>${k}</td><td>${v}</td></tr>
              `).join('')}
            </table>
          </section>
        ` : ''}

        ${p.features && p.features.length ? `
          <section class="specs-section">
            <h2 class="specs-section__title">Особенности</h2>
            <ul class="features-list">
              ${p.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </section>
        ` : ''}

        ${videoId ? `
          <section class="specs-section video-section">
            <h2 class="specs-section__title">Видеообзор</h2>
            <div class="video-wrap">
              <iframe src="https://www.youtube.com/embed/${videoId}" title="Видео ${p.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
            </div>
          </section>
        ` : ''}

        ${related.length ? `
          <section class="related">
            <h2 class="related__title">Похожая техника</h2>
            <div class="grid">
              ${related.map(r => cardHTML(r)).join('')}
            </div>
          </section>
        ` : ''}
      </div>
    `;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    bindProductEvents(images);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    $$('.card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 80}ms`;
      observer.observe(card);
    });
  }

  function bindProductEvents(images) {
    /* Gallery thumbnails */
    $$('.gallery__thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.idx);
        const img = $('#gallery-img');
        img.style.opacity = 0;
        setTimeout(() => {
          img.src = images[idx];
          img.style.opacity = 1;
        }, 200);
        $$('.gallery__thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });

    /* Lightbox */
    const galleryMain = $('#gallery-main');
    if (galleryMain) {
      galleryMain.addEventListener('click', () => {
        state.lightboxImages = images;
        const activeThumb = $('.gallery__thumb.active');
        state.lightboxIdx = activeThumb ? parseInt(activeThumb.dataset.idx) : 0;
        openLightbox();
      });
    }

    /* Description toggle */
    const toggle = $('#desc-toggle');
    const desc = $('#desc');
    if (toggle && desc) {
      toggle.addEventListener('click', () => {
        desc.classList.toggle('expanded');
        toggle.textContent = desc.classList.contains('expanded') ? 'Свернуть' : 'Читать полностью';
      });
    }
  }

  /* ── Lightbox ── */
  function openLightbox() {
    const lb = $('#lightbox');
    const img = $('#lightbox-img');
    img.src = state.lightboxImages[state.lightboxIdx];
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lb = $('#lightbox');
    lb.hidden = true;
    document.body.style.overflow = '';
  }

  function lightboxNav(dir) {
    const len = state.lightboxImages.length;
    state.lightboxIdx = (state.lightboxIdx + dir + len) % len;
    const img = $('#lightbox-img');
    img.style.opacity = 0;
    setTimeout(() => {
      img.src = state.lightboxImages[state.lightboxIdx];
      img.style.opacity = 1;
    }, 150);
  }

  $('#lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });
  $('.lightbox__close').addEventListener('click', closeLightbox);
  $('.lightbox__prev').addEventListener('click', () => lightboxNav(-1));
  $('.lightbox__next').addEventListener('click', () => lightboxNav(1));

  document.addEventListener('keydown', (e) => {
    if ($('#lightbox').hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });

  /* ── Header ── */
  const burger = $('#burger');
  const nav = $('#nav');
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    const spans = $$('span', burger);
    const isOpen = nav.classList.contains('open');
    spans[0].style.transform = isOpen ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity = isOpen ? '0' : '1';
    spans[2].style.transform = isOpen ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const header = $('#header');
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });

  /* ── Helpers ── */
  function pluralize(n, one, few, many) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 19) return many;
    if (mod10 === 1) return one;
    if (mod10 >= 2 && mod10 <= 4) return few;
    return many;
  }

  function extractYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  /* ── Init ── */
  loadData();
})();
