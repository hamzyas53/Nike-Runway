// Master build script: generates index.html & home.html (Home), runway.html (Runway), looks.html (All Looks 2-column), shop.html (Shop), rail.html (Hand Rail Pro), and about.html (About)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const publicDir = new URL('./public/', import.meta.url);
mkdirSync(publicDir, { recursive: true });

function writePage(filename, content) {
  writeFileSync(new URL('./' + filename, import.meta.url), content);
  writeFileSync(new URL('./public/' + filename, import.meta.url), content);
}

const A = 'https://reel-ref-try-the-look.vercel.app/assets/';
const SID = 'template--28035983671601__the_runway_wdM8BG';
const SHOP = 'https://nike-makknzjs.myshopify.com/products/';

const shoe = ['40', '41', '42', '43', '44', '45', '46'];
const app = ['S', 'L', 'M', 'XL'];
const P = {
  'tatum-5-orbit-copy': { name: 'Air Jordan 12 Retro', vendor: 'Nikey | Password: 1', price: 149, img: 'source-tatum-5-orbit-copy.webp', h: 400, sh: 160, legend: 'Shoe size', vals: shoe, ids: [57015167025457, 57015167058225, 57015167090993, 57015167123761, 57015167156529, 57015167189297, 57015167222065] },
  'tshirt': { name: 'Tshirt', vendor: 'Nike', price: 199, img: 'source-tshirt.webp', h: 563, sh: 225, legend: 'Size', vals: app, ids: [56835911582001, 56835911614769, 56835911647537, 56835911680305] },
  'sweatshirt': { name: 'Sweatshirt', vendor: 'Nike', price: 199, img: 'source-sweatshirt.webp', h: 581, sh: 232, legend: 'Size', vals: app, ids: [56835806396721, 56835806429489, 56835806462257, 56835806495025] },
  'tatum-5-orbit': { name: 'Tatum 5 Orbit', vendor: 'Nikey | Password: 1', price: 149, img: 'source-tatum-5-orbit.webp', h: 400, sh: 160, legend: 'Shoe size', vals: shoe, ids: [57015166730545, 57015166763313, 57015166796081, 57015166828849, 57015166861617, 57015166894385, 57015166927153] },
  'hoodie-black': { name: 'Hoodie Black', vendor: 'Nike', price: 199, img: 'source-hoodie-black.webp', h: 536, sh: 214, legend: 'Size', vals: app, ids: [56836251681073, 56836251713841, 56836251746609, 56836251779377] },
  'sweatshirt-plus': { name: 'Sweatshirt Plus', vendor: 'Nike', price: 199, img: 'source-sweatshirt-plus.webp', h: 610, sh: 244, legend: 'Size', vals: app, ids: [56836143743281, 56836143776049, 56836143808817, 56836143841585] },
  'hoodie': { name: 'Hoodie', vendor: 'Nike', price: 199, img: 'source-hoodie.webp', h: 555, sh: 222, legend: 'Size', vals: app, ids: [56836002185521, 56836002218289, 56836002251057, 56836002283825] },
  'air-jordan-12-retro-copy': { name: 'Luka 5', vendor: 'Nikey | Password: 1', price: 149, img: 'source-air-jordan-12-retro-copy.webp', h: 400, sh: 160, legend: 'Shoe size', vals: shoe, ids: [57015176364337, 57015176397105, 57015176429873, 57015176462641, 57015176495409, 57015176528177, 57015176560945] },
};
const pinsStd = [[50, 28], [48, 58], [45, 88]];
const L = [
  { key: 'bndthK', name: 'The City Edit', m: 1, o: 1, desc: 'A charcoal knit and easy denim.', items: ['tatum-5-orbit-copy', 'tshirt', 'sweatshirt'], pins: [[47, 27], [48, 58], [45, 96]] },
  { key: 'XckgG6', name: 'Gallery Opening', m: 5, o: 5, desc: 'A clean white tee and relaxed denim.', items: ['tatum-5-orbit', 'hoodie-black', 'tshirt'], tag: 2 },
  { key: 'rLfAhC', name: 'Gallery Opening', m: 4, o: 4, desc: 'Olive knitwear. A grounded palette.', items: ['sweatshirt-plus', 'tatum-5-orbit', 'tshirt'], tag: 2 },
  { key: 'FKg67q', name: 'Studio Day', m: 6, o: 6, desc: 'Black, white and laid-back denim.', items: ['hoodie-black', 'tatum-5-orbit-copy', 'tshirt'] },
  { key: '8KREEE', name: 'Studio Day', m: 3, o: 3, desc: 'Burgundy layers. A tailored perspective.', items: ['sweatshirt', 'tatum-5-orbit', 'tshirt'] },
  { key: 'N3bfm9', name: 'Studio Day', m: 2, o: 2, desc: 'A grey crew and your favourite denim.', items: ['hoodie', 'air-jordan-12-retro-copy', 'tshirt'] },
];

const money = (n) => '$' + n.toFixed(2);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');

const font = readFileSync(new URL('./inter.woff2', import.meta.url)).toString('base64');
const baseCss = readFileSync(new URL('./src/styles.css', import.meta.url), 'utf8').replace('__INTER__', 'data:font/woff2;base64,' + font);
const homeCss = readFileSync(new URL('./src/home.css', import.meta.url), 'utf8');
const looksCss = readFileSync(new URL('./src/looks.css', import.meta.url), 'utf8');
const shopCss = readFileSync(new URL('./src/shop.css', import.meta.url), 'utf8');
const railCss = readFileSync(new URL('./src/rail.css', import.meta.url), 'utf8');
const aboutCss = readFileSync(new URL('./src/about.css', import.meta.url), 'utf8');

// Catalog
const catalog = {
  source: 'https://nike-makknzjs.myshopify.com/pages/runway',
  looks: L.map((l) => ({ name: l.name, description: l.desc, image: `${A}original-look-${l.o}.webp`, products: l.items })),
  items: Object.entries(P).map(([id, p]) => ({ id, name: p.name, type: 'From the original lookbook', price: p.price, image: A + p.img, sizes: p.vals, variants: p.ids.map((v, k) => ({ id: v, a: true, o: [p.vals[k]] })), url: SHOP + id })),
};

import { getSharedBagScript } from './src/shared-bag.js';
const sharedBagCode = getSharedBagScript(JSON.stringify(catalog));

const getHeader = (activePage) => `
  <header class="site-header shopify-section-group-header-group">
    <a href="./index.html" class="brand" aria-label="Runway home"><img src="${A}nike-logo.svg" width="68" height="24" alt="Nike"></a>
    <nav aria-label="Main navigation">
      <a href="./index.html" ${activePage === 'home' ? 'aria-current="page"' : ''}>Home</a>
      <a href="./runway.html" ${activePage === 'runway' ? 'aria-current="page"' : ''}>Runway</a>
      <a href="./looks.html" ${activePage === 'looks' ? 'aria-current="page"' : ''}>All Looks</a>
      <a href="./shop.html" ${activePage === 'shop' ? 'aria-current="page"' : ''}>Shop Pieces</a>
      <a href="./rail.html" ${activePage === 'rail' ? 'aria-current="page"' : ''}>Hand Rail Pro</a>
      <a href="./about.html" ${activePage === 'about' ? 'aria-current="page"' : ''}>About</a>
    </nav>
    <button type="button" id="open-bag" aria-label="Open styling bag">
      <svg width="22" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 8h16l1 16H3L4 8zM8 8V6a4 4 0 0 1 8 0v2"/></svg>
      <span data-cart-count>0</span>
    </button>
  </header>`;

const getBagModals = () => `
  <dialog id="bag-dialog" aria-labelledby="bag-title">
    <div class="bag-heading">
      <h2 id="bag-title">Your styling bag</h2>
      <button type="button" id="close-bag" aria-label="Close styling bag">&times;</button>
    </div>
    <p class="bag-note">A local outfit shortlist. No payment or order is collected here. Open a piece on the original demo to continue.</p>
    <div id="bag-items"></div>
    <p id="bag-total"></p>
    <button type="button" id="export-bag" disabled>Download outfit shortlist</button>
  </dialog>
  <div id="bag-status" role="status" aria-live="polite"></div>`;

/* =========================================================================
   1. BUILD Home Page (index.html and home.html)
   ========================================================================= */
const homeModelCards = L.map((l, i) => `
      <a href="./runway.html#look=${i + 1}" class="home-model-card" title="Look 0${i + 1}: ${esc(l.name)}">
        <span class="home-model-shadow"></span>
        <img src="${A}model-${l.m}-640.webp" alt="Look 0${i + 1}: ${esc(l.name)}" loading="lazy">
        <span class="home-model-chip">Look 0${i + 1} — ${esc(l.name)}</span>
      </a>`).join('');

const homeSpotlights = [L[0], L[1], L[3]].map((l, idx) => {
  const lookNum = idx === 0 ? 1 : idx === 1 ? 2 : 4;
  return `
      <article class="home-spotlight-card">
        <div class="home-spotlight-thumb">
          <img src="${A}model-${l.m}-640.webp" alt="${esc(l.name)}" loading="lazy">
        </div>
        <div>
          <span style="font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#888">Look 0${lookNum}</span>
          <h3>${esc(l.name)}</h3>
          <p>${esc(l.desc)}</p>
        </div>
        <div class="home-spotlight-pricing">
          <span>Complete 3-Piece Bundle</span>
          <div><s>$547.00</s> <strong>$492.30</strong></div>
        </div>
        <a href="./runway.html#look=${lookNum}" class="home-cta-secondary" style="min-height:44px;font-size:11px;justify-content:center">
          Experience on 3D Runway Ring →
        </a>
      </article>`;
}).join('');

const homeHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>Try the Look. — Streetwear Runway 2026</title>
  <meta name="description" content="Explore six head-to-toe Nike streetwear looks arranged on an interactive 3D runway ring.">
  <style>
${baseCss}
${homeCss}
  </style>
</head>
<body>
  ${getHeader('home')}

  <main class="home-layout">
    <!-- Hero Section -->
    <section class="home-hero">
      <span class="home-kicker">Winter 2026 Runway Showcase</span>
      <h1 class="home-hero-title">
        Try the Look.
        <span>Head to Toe Streetwear</span>
      </h1>
      <p class="home-hero-desc">
        Six complete silhouettes arranged in depth on an interactive 3D ring. Relaxed volumes, 450 GSM French Terry knits, washed denim, and retro court icons.
      </p>

      <div class="home-hero-ctas">
        <a href="./runway.html" class="home-cta-primary">
          Enter 3D Runway Ring →
        </a>
        <a href="./looks.html" class="home-cta-secondary">
          Browse Lookbook (2-Col)
        </a>
        <a href="./shop.html" class="home-cta-secondary">
          Shop 8 Pieces
        </a>
      </div>

      <!-- Interactive Model Lineup Ribbon -->
      <div class="home-model-ribbon">
        ${homeModelCards}
      </div>
    </section>

    <!-- 3D Runway Innovation Feature Section -->
    <section class="home-feature-section">
      <div class="home-feature-inner">
        <div class="home-feature-content">
          <span class="home-feature-badge">Digital Runway Experience</span>
          <h2>A Turning 3D Ring Arranged in Depth</h2>
          <p>
            Models stand on a pure white stage arranged along an elliptical depth ring. Outer figures dynamically soften with camera depth-blur, while the hero figure takes center stage with interactive numbered pins. Tap any pin to isolate a piece or bundle the full 3-piece look for 10% savings.
          </p>

          <div class="home-stats-grid">
            <div class="home-stat-box">
              <strong>06</strong>
              <span>Styled Head-to-Toe Looks</span>
            </div>
            <div class="home-stat-box">
              <strong>08</strong>
              <span>Unique Signature Pieces</span>
            </div>
            <div class="home-stat-box">
              <strong>10%</strong>
              <span>Complete Look Bundle Savings</span>
            </div>
            <div class="home-stat-box">
              <strong>3D</strong>
              <span>Turning Ring with Depth Blur</span>
            </div>
          </div>

          <div style="margin-top:14px">
            <a href="./runway.html" class="home-cta-primary">Launch 3D Runway Carousel →</a>
          </div>
        </div>

        <div class="home-feature-visual">
          <div class="home-stage-preview-ring"></div>
          <img src="${A}model-1-640.webp" alt="3D Model Hero Preview">
        </div>
      </div>
    </section>

    <!-- Spotlight Looks -->
    <section class="home-spotlight-section">
      <div class="home-section-head">
        <div>
          <span style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#888">Curated Silhouettes</span>
          <h2>Featured Runway Looks</h2>
          <p>Hand-selected head-to-toe combinations from the 2026 lookbook.</p>
        </div>
        <a href="./looks.html" class="home-cta-secondary" style="min-height:44px;font-size:11px">View All 6 Looks →</a>
      </div>

      <div class="home-spotlight-grid">
        ${homeSpotlights}
      </div>
    </section>

    <!-- Hand Rail Pro Scene Rail Teaser Banner -->
    <section class="home-rail-banner">
      <div class="home-rail-banner-inner">
        <div>
          <span style="font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#888">Interactive Feature</span>
          <h3>Hand Rail Pro — Continuous Scene Rail</h3>
          <p>Glide horizontally across all six runway silhouettes with kinetic inertia and instant piece inspection.</p>
        </div>
        <a href="./rail.html" class="home-cta-primary" style="background:#fff;color:#151413">
          Explore Scene Rail →
        </a>
      </div>
    </section>
  </main>

  ${getBagModals()}

  <script>
${sharedBagCode}
  </script>
</body>
</html>`;

// Write index.html (as root landing page for Vercel) and home.html
writePage('index.html', homeHtml);
writePage('home.html', homeHtml);
console.log('Built index.html (Home) and home.html:', homeHtml.length, 'bytes');

/* =========================================================================
   2. BUILD runway.html (Flagship 3D Runway Carousel)
   ========================================================================= */
const modelImg = (l) => `<img src="${A}model-${l.m}-640.webp" srcset="${A}model-${l.m}-640.webp 640w, ${A}original-look-${l.o}.webp 1080w" sizes="(min-width: 1800px) 540px, (min-width: 750px) 420px, 320px" loading="eager" decoding="async" width="1100" height="1956" draggable="false" data-model-image alt="${esc(l.name)}">`;
const SHADOW = `<span class="rw__shadow"></span>`;

const bodies = L.map((l, i) => `
          <div class="rw__model" data-rw-model data-index="${i}" aria-hidden="true">
            ${SHADOW}
            <div class="rw__figure" style="--rw-ar: 0.5625">
              <div class="rw__art">
                ${modelImg(l)}
                <button type="button" class="rw__hit" data-rw-go="${i}" aria-label="Look ${i + 1}: ${esc(l.name)}" tabindex="-1"></button>
              </div>
            </div>
          </div>`).join('');

const heroes = L.map((l, i) => {
  const pins = (l.pins || pinsStd).map(([x, y], j) => {
    const n = j + 1, t = P[l.items[j]].name;
    return `
                  <button type="button" class="rw__pin" data-rw-pin="${n}" data-tip="${esc(t)}" style="left:${x}%; top:${y}%; --pi:${n}" aria-label="${n}: ${esc(t)}" tabindex="-1"><span class="rw__pin-dot">${n}</span></button>`;
  }).join('');
  return `
          <div class="rw__hero${i === 0 ? ' is-on' : ''}" data-rw-hero data-index="${i}" data-name="${esc(l.name)}" data-label="Look ${i + 1}: ${esc(l.name)}" data-probe="${A}model-${l.m}-640.webp"${i ? ' aria-hidden="true"' : ''}>
            <div class="rw__morph">
              ${SHADOW}
              <div class="rw__figure" style="--rw-ar: 0.5625">
                <div class="rw__art">
                  ${modelImg(l)}
                  <button type="button" class="rw__zoom" data-rw-zoom aria-label="View look: ${esc(l.name)}" tabindex="-1"></button>
                  <div class="rw__pins">${pins}
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}).join('');

const ticks = L.map((l, i) => `
            <button type="button" class="rw__tick" data-rw-tick="${i}" aria-current="${i === 0}" aria-label="Look ${i + 1}: ${esc(l.name)}"><span class="rw__tick-bar"></span><span class="rw__tick-label">${pad(i + 1)}<span class="rw__tick-name">&nbsp;&nbsp;${esc(l.name)}</span></span></button>`).join('');

const ARROW_R = `<svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>`;
const ARROW_L = `<svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M25 7H1M7 1L1 7l6 6"/></svg>`;

const item = (l, li, pid, j) => {
  const p = P[pid], n = j + 1, url = SHOP + pid;
  const pickId = `Picker-${SID}-look_${l.key}-${n}`, opt = `Opt-${SID}-look_${l.key}-${n}-1`;
  const variants = JSON.stringify(p.ids.map((id, k) => ({ id, a: true, o: [p.vals[k]] })));
  const pills = p.vals.map((v, k) => `<label class="rw__pill"><input type="radio" name="${opt}" value="${v}" data-rw-option="0"${k === 0 ? ' checked' : ''}><span class="rw__pill-label">${v}</span></label>`).join('');
  return `
              <li class="rw__item" data-rw-card="${n}" style="--i:${n}" data-title="${esc(p.name)}">${l.tag === n ? `
                <span class="rw__tag"><span class="rw__tag-text">New</span></span>` : ''}
                <a class="rw__media" href="${url}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><img src="${A}${p.img}" loading="lazy" decoding="async" alt="" width="400" height="${p.h}"><span class="rw__num">${n}</span></a>
                <div class="rw__info">
                  <span class="rw__type">${esc(p.vendor)}</span>
                  <a class="rw__name" href="${url}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a>
                  <span class="rw__price"><span>${money(p.price)}</span></span>
                </div>
                <button type="button" class="rw__add" data-rw-add aria-expanded="false" aria-controls="${pickId}" aria-label="Add to bag: ${esc(p.name)}" data-added-label="Added to bag: ${esc(p.name)}">
                  <svg class="rw__i-plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>
                  <svg class="rw__i-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 12.5l5 5L19.5 7"/></svg>
                  <svg class="rw__i-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9"/></svg>
                </button>
                <div class="rw__picker" id="${pickId}" data-rw-picker hidden>
                  <div class="rw__picker-head">
                    <img src="${A}${p.img}" loading="lazy" decoding="async" alt="" width="160" height="${p.sh}">
                    <div class="rw__picker-copy"><span class="rw__picker-title">${esc(p.name)}</span><span class="rw__picker-price">${money(p.price)}</span></div>
                    <button type="button" class="rw__pick-close" data-rw-pick-close aria-label="Close size picker">&times;</button>
                  </div>
                  <fieldset class="rw__opt">
                    <legend class="rw__opt-name">${p.legend}</legend>
                    <div class="rw__values">${pills}</div>
                  </fieldset>
                  <button type="button" class="rw__confirm" data-rw-confirm><span data-rw-confirm-label data-add="Add to bag">Add to bag</span><span class="rw__sr"> — ${esc(p.name)}</span></button>
                  <script type="application/json" data-rw-variants>${variants}</script>
                </div>
              </li>`;
};

const panels = L.map((l, i) => {
  const total = l.items.reduce((s, id) => s + P[id].price, 0);
  return `
          <div class="rw__look-panel${i === 0 ? ' is-in' : ''}" data-rw-panel="${i}"${i ? ' hidden' : ''}>
            <div class="rw__mhead"><span class="rw__mhead-title">${esc(l.name)}</span><span class="rw__label">3 pieces</span></div>
            <ul class="rw__items" role="list">${l.items.map((id, j) => item(l, i, id, j)).join('')}
            </ul>
            <div class="rw__bundle has-rule">
              <p class="rw__msg" data-rw-msg role="status" aria-live="polite"></p>
              <div class="rw__bundle-row">
                <div class="rw__bundle-copy"><span class="rw__bundle-title">Complete the look</span><span class="rw__bundle-note">Bundle all 3 and save 10%</span></div>
                <div class="rw__bundle-price"><s>${money(total)}</s><strong>${money(total * 0.9)}</strong></div>
              </div>
              <button type="button" class="rw__cta" data-rw-all>
                <span class="rw__cta-add">Add full look to bag</span>
                <span class="rw__cta-m">Add full look — ${money(total * 0.9)}</span>
                <span class="rw__cta-done">Full look in your bag</span>
                <svg class="rw__cta-arrow" width="22" height="12" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 7h24M19 1l6 6-6 6"/></svg>
                <svg class="rw__cta-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 1-9 9"/></svg>
              </button>
              <template data-rw-pieces-text>3 pieces</template>
            </div>
          </div>`;
}).join('');

const tokens = [
  ['--rw-c-stage', '#ffffff'], ['--rw-c-panel', '#ffffff'], ['--rw-c-text', '#151413'], ['--rw-c-muted', '#66625c'], ['--rw-c-accent', '#0e0e0e'], ['--rw-c-on-accent', '#ffffff'], ['--rw-c-line', '#c8c8c8'], ['--rw-card', '#DFDFDF'],
  ['--rw-hf', 'var(--font-heading--family, inherit)'], ['--rw-hw', '400'], ['--rw-h-d', '46px'], ['--rw-h-m', '24px'], ['--rw-sub-d', '12px'], ['--rw-sub-m', '12px'], ['--rw-eyebrow-d', '11px'], ['--rw-eyebrow-m', '10px'],
  ['--rw-label-d', '10px'], ['--rw-label-m', '9px'], ['--rw-chip-d', '17px'], ['--rw-chip-m', '18px'], ['--rw-ph-d', '18px'], ['--rw-ph-m', '16px'], ['--rw-pt-size-d', '13px'], ['--rw-pt-size-m', '12px'],
  ['--rw-price-d', '12px'], ['--rw-price-m', '12px'], ['--rw-opt-d', '11px'], ['--rw-opt-m', '11px'], ['--rw-total-d', '16px'], ['--rw-total-m', '16px'], ['--rw-thumb-d', '92px'], ['--rw-thumb-m', '62px'],
  ['--rw-tag-top', '18px'], ['--rw-tag-left', '0px'], ['--rw-thumb-radius', '0px'], ['--rw-morph', '900ms'], ['--rw-bar-r', '20px'], ['--rw-panel-w', '380px'], ['--rw-panel-pad-d', '32px'], ['--rw-radius', '0px'],
  ['--rw-max', 'none'], ['--rw-speed', '5s'], ['--rw-ax', '40%'], ['--rw-btn-radius', '0px'], ['--rw-pill-radius', '30px'], ['--rw-add-radius', '20px'],
].map(([k, v]) => `${k}: ${v}`).join('; ');

const runwayJs = readFileSync(new URL('./src/runway.js', import.meta.url), 'utf8').replace('__CATALOG__', JSON.stringify(catalog));

const runwayHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>Try the Look — Runway</title>
  <meta name="description" content="Six looks, styled head to toe. Explore the runway, isolate a look, and tap a pin to see the piece.">
  <link rel="preload" as="image" href="${A}model-1-640.webp" fetchpriority="high">
  <style>
${baseCss}
  </style>
</head>
<body>
  ${getHeader('runway')}

  <main>
    <runway-section id="Runway-${SID}" class="rw rw--add-icon rw--popup rw--list has-dividers has-border"
      data-feel="balanced" data-blur="true" data-mblur="true" data-style="ring" data-mstyle="classic" data-fit="true"
      data-height-mode="original" data-height-vh="100" data-mheight-mode="custom" data-mheight-vh="109" data-reflect="false"
      data-autoplay="true" data-speed="5000" data-after-add="stay" data-bundle-code=""
      data-msg-choose="Pick a size for: [items]" data-msg-error="Couldn’t add to bag. Please try again." data-msg-soldout="Sold out"
      style="${tokens}">
      <div class="rw__sticky">
        <div class="rw__grid">
          <div class="rw__left">
            <div class="rw__head">
              <div class="rw__intro">
                <h2 class="rw__title">Try the Look.</h2>
                <p class="rw__sub">Six looks, styled head to toe. Tap a pin to see the piece.</p>
              </div>
              <span class="rw__sr" aria-live="polite" aria-atomic="true" data-rw-live></span>
            </div>

            <div class="rw__stage" data-rw-stage tabindex="0" role="region" aria-roledescription="carousel" aria-label="Try the Look. — use arrow keys or swipe to change look">
              <div class="rw__actors" data-rw-actors>${bodies}
              </div>
              <div class="rw__heroes" data-rw-heroes>${heroes}
              </div>
              <span class="rw__sweep"></span>
              <span class="rw__cursor" data-rw-cursor><span class="rw__cursor-in"><span class="rw__cursor-label rw__cursor-drag">Drag</span><span class="rw__cursor-label rw__cursor-view">View</span></span></span>
              <span class="rw__walk"><span class="rw__walk-line"></span></span>
            </div>

            <div class="rw__controls">
              <button type="button" class="rw__icon" data-rw-prev aria-label="Previous look">${ARROW_L}</button>
              <div class="rw__ticks">${ticks}
              </div>
              <button type="button" class="rw__icon rw__auto" data-rw-auto aria-pressed="false" aria-label="Autoplay">
                <svg class="rw__i-play" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>
                <svg class="rw__i-pause" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 4.5h3.5v15H6.5zM14 4.5h3.5v15H14z"/></svg>
              </button>
              <button type="button" class="rw__icon" data-rw-next aria-label="Next look">${ARROW_R}</button>
            </div>

            <div class="rw__lb" data-rw-lb role="dialog" aria-label="View look" hidden>
              <div class="rw__lb-top"><span class="rw__lb-kicker" data-rw-lb-kicker>Look 01 / 06</span><span class="rw__lb-name" data-rw-lb-name></span></div>
              <button type="button" class="rw__icon rw__lb-close" data-rw-lb-close aria-label="Close look">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
              </button>
              <div class="rw__lb-stage" data-rw-lb-stage></div>
            </div>
          </div>

          <aside class="rw__panel has-rule" aria-label="In this look">
            <div class="rw__panel-inner">
              <div class="rw__panel-head">
                <h3 class="rw__panel-title">In this look</h3>
                <span class="rw__label" data-rw-pieces>3 pieces</span>
              </div>${panels}
            </div>
          </aside>
        </div>
      </div>
      <div class="rw__sheet" data-rw-sheet hidden>
        <div class="rw__sheet-scrim" data-rw-pick-close></div>
        <div class="rw__sheet-panel" role="dialog" aria-modal="true" aria-label="Choose a size">
          <span class="rw__sheet-grab"></span>
          <div data-rw-sheet-body></div>
        </div>
      </div>
    </runway-section>
  </main>

  ${getBagModals()}

  <script>
${runwayJs}
  </script>
</body>
</html>`;
writePage('runway.html', runwayHtml);
console.log('Built runway.html:', runwayHtml.length, 'bytes');

/* =========================================================================
   3. BUILD looks.html (All Looks Lookbook - TWO COLUMNS PER ROW)
   ========================================================================= */
const looksJs = readFileSync(new URL('./src/looks.js', import.meta.url), 'utf8');

const looksHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>All Looks — Runway Lookbook</title>
  <meta name="description" content="Explore all six head-to-toe streetwear looks from the Nike runway collection.">
  <style>
${baseCss}
${looksCss}
  </style>
</head>
<body>
  ${getHeader('looks')}

  <main class="looks-layout">
    <header class="looks-hero">
      <span style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#888">Winter 2026 Collection</span>
      <h1>All Looks — The Editorial Lookbook</h1>
      <p>Six looks, styled head to toe. Explore relaxed silhouettes, heavy knits, washed denim, and signature retro footwear in a curated two-column editorial spread.</p>
    </header>

    <div class="looks-filter-bar">
      <div class="looks-filter-pills">
        <button type="button" class="look-pill active" data-filter="all">All 6 Looks</button>
        <button type="button" class="look-pill" data-filter="the city edit">The City Edit</button>
        <button type="button" class="look-pill" data-filter="gallery opening">Gallery Opening</button>
        <button type="button" class="look-pill" data-filter="studio day">Studio Day</button>
      </div>
      <a href="./runway.html" class="look-pill" style="text-decoration:none">Experience 3D Runway Ring ↗</a>
    </div>

    <!-- 2 Columns Per Row Grid -->
    <section class="looks-container" id="looks-container"></section>
  </main>

  ${getBagModals()}

  <script>
${sharedBagCode}
${looksJs}
  </script>
</body>
</html>`;
writePage('looks.html', looksHtml);
console.log('Built looks.html:', looksHtml.length, 'bytes');

/* =========================================================================
   4. BUILD shop.html (Shop the Pieces)
   ========================================================================= */
const shopJs = readFileSync(new URL('./src/shop.js', import.meta.url), 'utf8');

const shopHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>Shop the Pieces — Runway Collection</title>
  <meta name="description" content="Shop all eight signature garments and sneakers featured across the Nike runway looks.">
  <style>
${baseCss}
${shopCss}
  </style>
</head>
<body>
  ${getHeader('shop')}

  <main class="shop-layout">
    <header class="shop-hero">
      <span style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#888">The Catalog</span>
      <h1>Shop the Pieces</h1>
      <p>Eight signature garments and retro silhouettes. From heavy 450 GSM French Terry knits to full-grain leather court icons. Pick your size and add directly to your shortlist.</p>
    </header>

    <div class="shop-filter-bar">
      <div class="shop-filter-pills">
        <button type="button" class="shop-pill active" data-cat="all">All Pieces (8)</button>
        <button type="button" class="shop-pill" data-cat="shoes">Footwear (3)</button>
        <button type="button" class="shop-pill" data-cat="hoodies">Hoodies (2)</button>
        <button type="button" class="shop-pill" data-cat="sweatshirts">Sweatshirts (2)</button>
        <button type="button" class="shop-pill" data-cat="tees">Tees (1)</button>
      </div>
      <select id="shop-sort-select" class="shop-sort-select" aria-label="Sort products">
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Alphabetical (A-Z)</option>
      </select>
    </div>

    <section class="shop-grid" id="shop-grid"></section>
  </main>

  ${getBagModals()}

  <script>
${sharedBagCode}
${shopJs}
  </script>
</body>
</html>`;
writePage('shop.html', shopHtml);
console.log('Built shop.html:', shopHtml.length, 'bytes');

/* =========================================================================
   5. BUILD rail.html (Hand Rail Pro Scene Rail)
   ========================================================================= */
const railJs = readFileSync(new URL('./src/rail.js', import.meta.url), 'utf8');

const railHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>Hand Rail Pro — Continuous Scene Rail</title>
  <meta name="description" content="Infinite continuous horizontal runway conveyor. Drag and scrub across all six head-to-toe Nike looks.">
  <style>
${baseCss}
${railCss}
  </style>
</head>
<body>
  ${getHeader('rail')}

  <main class="rail-layout">
    <div class="rail-bar">
      <div class="rail-bar-title">
        <h1>Hand Rail Pro — Continuous Scene Rail</h1>
        <p>A gliding horizontal perspective of all runway silhouettes. Click and drag or scroll horizontally to inspect.</p>
      </div>
      <div class="rail-hint">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        <span>Drag canvas left / right to scrub</span>
      </div>
    </div>

    <section class="rail-viewport" id="rail-viewport">
      <div class="rail-track" id="rail-track"></div>
    </section>

    <!-- Bottom Scrubber Bar -->
    <footer class="rail-footer-bar">
      <div class="rail-ticks" id="rail-ticks-wrap"></div>
      <a href="./looks.html" class="st-btn" style="text-decoration:none;padding:8px 16px;border:1px solid #c8c8c8;font-size:11px;font-weight:600;text-transform:uppercase;color:#151413">
        View All Looks Lookbook ↗
      </a>
    </footer>

    <!-- Inspect Drawer -->
    <aside class="rail-drawer" id="rail-drawer" aria-label="Inspect look details">
      <div class="drawer-head">
        <h3 id="drawer-look-title">Look 01 — The City Edit</h3>
        <button type="button" class="drawer-close" id="rail-drawer-close" aria-label="Close drawer">&times;</button>
      </div>
      <div class="drawer-body">
        <div class="drawer-items" id="drawer-items-list"></div>
        <div class="drawer-pricing">
          <span style="font-size:12px;color:#666">Bundle All 3 (Save 10%)</span>
          <div>
            <s id="drawer-subtotal" style="margin-right:8px">$547.00</s>
            <strong id="drawer-final">$492.30</strong>
          </div>
        </div>
        <div class="drawer-actions">
          <button type="button" class="drawer-cta" id="rail-drawer-cta">Add Full Look — $492.30</button>
          <a href="./runway.html" class="drawer-remix" id="drawer-remix-link">View in 3D Runway Ring ↗</a>
        </div>
      </div>
    </aside>
  </main>

  ${getBagModals()}

  <script>
${sharedBagCode}
${railJs}
  </script>
</body>
</html>`;
writePage('rail.html', railHtml);
console.log('Built rail.html:', railHtml.length, 'bytes');

/* =========================================================================
   6. BUILD about.html (About the Runway Edit)
   ========================================================================= */
const aboutHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>About — The Runway Collection</title>
  <meta name="description" content="Discover the creative vision, styling ethos, and material craftsmanship behind the Try the Look runway.">
  <style>
${baseCss}
${aboutCss}
  </style>
</head>
<body>
  ${getHeader('about')}

  <main class="about-layout">
    <header class="about-hero">
      <span class="about-kicker">Collection Ethos</span>
      <h1>Try the Look. — The 2026 Runway Edit</h1>
      <p>Six looks styled head to toe. An exploration of volume, textured knits, wide denim, and heritage court silhouettes designed to blur the boundaries between athlete performance and street luxury.</p>
    </header>

    <div class="about-content">
      <section class="about-section">
        <h2>The Styling Philosophy</h2>
        <p>The collection was conceived around the effortless juxtaposition of structured knitwear and easy drape denim. Each silhouette balances high and low: oversized 450 GSM collegiate French Terry hoodies sit atop vintage washed denim, anchored by iconic basketball models like the Air Jordan 12 Retro, Tatum 5 Orbit, and Luka 5.</p>
        <p>Rather than presenting isolated garments, "Try the Look." presents complete head-to-toe styling solutions. Shoppers can isolate any individual piece via interactive pins or take advantage of the 10% bundle pricing to adopt the entire look.</p>
      </section>

      <section class="about-section">
        <h2>Craftsmanship &amp; Materials</h2>
        <div class="about-grid-features">
          <div class="about-feat-card">
            <h3>450 GSM French Terry</h3>
            <p>Heavyweight brushed cotton fleece with pre-shrunk vintage dye wash for a structured yet relaxed drape.</p>
          </div>
          <div class="about-feat-card">
            <h3>Full-Grain Leather</h3>
            <p>Tumbled leather uppers with heritage elephant-print overlays, engineered for longevity and patina over time.</p>
          </div>
          <div class="about-feat-card">
            <h3>Air Zoom &amp; Formula 23</h3>
            <p>Court-ready reactive cushioning units embedded directly beneath the foot for all-day responsive comfort.</p>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2>The 3D Digital Runway Ring</h2>
        <p>Our custom &lt;runway-section&gt; carousel stages six full-body figures arranged along a three-dimensional ring with depth perspective. Outer models dynamically soften with atmospheric depth blur, while the front hero figure seamlessly isolates into an interactive hot-spot modal for detailed piece inspection.</p>
      </section>

      <div class="about-cta-box">
        <h3>Experience the Collection</h3>
        <p>Step onto the 3D rotating stage or explore all six curated head-to-toe looks in the editorial lookbook.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a href="./runway.html" class="about-cta-btn">Enter 3D Runway Ring →</a>
          <a href="./looks.html" class="about-cta-btn" style="background:transparent;color:#fff;border:1px solid #fff">Browse Lookbook</a>
          <a href="./shop.html" class="about-cta-btn" style="background:transparent;color:#fff;border:1px solid #fff">Shop 8 Pieces</a>
        </div>
      </div>
    </div>
  </main>

  ${getBagModals()}

  <script>
${sharedBagCode}
  </script>
</body>
</html>`;
writePage('about.html', aboutHtml);
console.log('Built about.html:', aboutHtml.length, 'bytes');

writeFileSync(new URL('./public/catalog.json', import.meta.url), JSON.stringify(catalog, null, 2));

console.log('Complete build finished successfully! Generated both root and public/ output directories.');
