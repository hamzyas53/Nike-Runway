// Lookbook All Looks Script
(() => {
  'use strict';
  const A = 'https://reel-ref-try-the-look.vercel.app/assets/';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  const LOOKS = [
    { id: 1, name: 'The City Edit', m: 1, o: 1, desc: 'A charcoal knit and easy denim.', items: ['tatum-5-orbit-copy', 'tshirt', 'sweatshirt'] },
    { id: 2, name: 'Gallery Opening', m: 5, o: 5, desc: 'A clean white tee and relaxed denim.', items: ['tatum-5-orbit', 'hoodie-black', 'tshirt'] },
    { id: 3, name: 'Gallery Opening', m: 4, o: 4, desc: 'Olive knitwear. A grounded palette.', items: ['sweatshirt-plus', 'tatum-5-orbit', 'tshirt'] },
    { id: 4, name: 'Studio Day', m: 6, o: 6, desc: 'Black, white and laid-back denim.', items: ['hoodie-black', 'tatum-5-orbit-copy', 'tshirt'] },
    { id: 5, name: 'Studio Day', m: 3, o: 3, desc: 'Burgundy layers. A tailored perspective.', items: ['sweatshirt', 'tatum-5-orbit', 'tshirt'] },
    { id: 6, name: 'Studio Day', m: 2, o: 2, desc: 'A grey crew and your favourite denim.', items: ['hoodie', 'air-jordan-12-retro-copy', 'tshirt'] },
  ];

  const Looks = {
    catalog: null,
    activeFilter: 'all',

    async init() {
      this.catalog = await window.runwayBag.getCatalog();
      this.render();
      this.bindFilter();
    },

    render() {
      const container = document.getElementById('looks-container');
      if (!container || !this.catalog) return;
      container.replaceChildren();

      LOOKS.forEach((l) => {
        if (this.activeFilter !== 'all' && l.name.toLowerCase() !== this.activeFilter.toLowerCase()) return;

        const card = document.createElement('article');
        card.className = 'look-editorial-card';

        // Model Column
        const modelCol = document.createElement('div');
        modelCol.className = 'look-model-col';
        modelCol.innerHTML = `
          <span class="look-model-shadow"></span>
          <img src="${A}model-${l.m}-640.webp" srcset="${A}model-${l.m}-640.webp 640w, ${A}original-look-${l.o}.webp 1080w" sizes="(max-width: 960px) 320px, 420px" alt="${l.name}">`;

        // Details Column
        const detailsCol = document.createElement('div');
        detailsCol.className = 'look-details-col';

        let subtotal = 0;
        const piecesHtml = l.items.map((pid) => {
          const it = this.catalog.items.find((x) => x.id === pid);
          if (!it) return '';
          subtotal += it.price;
          const vendor = it.id.includes('orbit') || it.id.includes('retro') ? 'Nikey | Password: 1' : 'Nike';
          return `
            <div class="look-piece-row">
              <div class="look-piece-thumb"><img src="${it.image}" alt="${it.name}"></div>
              <div class="look-piece-info">
                <span class="look-piece-vendor">${vendor}</span>
                <a href="${it.url}" target="_blank" rel="noopener noreferrer" class="look-piece-name">${it.name}</a>
                <span class="look-piece-price">${fmt.format(it.price)}</span>
              </div>
            </div>`;
        }).join('');

        const finalPrice = subtotal * 0.9;

        detailsCol.innerHTML = `
          <div>
            <span class="look-header-badge">Look 0${l.id} / 06</span>
            <h2 class="look-title">${l.name}</h2>
            <p class="look-desc">${l.desc}</p>
          </div>

          <div class="look-pieces-list">
            ${piecesHtml}
          </div>

          <div class="look-bundle-footer">
            <div class="look-bundle-pricing-row">
              <div>
                <div class="look-bundle-title">Complete the look</div>
                <div class="look-bundle-note">Bundle all 3 and save 10%</div>
              </div>
              <div class="look-bundle-prices">
                <s>${fmt.format(subtotal)}</s>
                <strong>${fmt.format(finalPrice)}</strong>
              </div>
            </div>
            <div class="look-actions-row">
              <button type="button" class="look-add-bundle-btn" data-look-idx="${l.id}">
                Add Full Look to Bag — ${fmt.format(finalPrice)}
              </button>
              <a href="./index.html#look=${l.id}" class="look-view-runway-link">
                View on 3D Runway Ring ↗
              </a>
            </div>
          </div>`;

        // Add to bag button
        detailsCol.querySelector('.look-add-bundle-btn').addEventListener('click', async (e) => {
          const btn = e.currentTarget;
          const itemsToAdd = [];
          for (const pid of l.items) {
            const it = this.catalog.items.find((x) => x.id === pid);
            if (it && it.variants.length) {
              itemsToAdd.push({ id: it.variants[0].id, quantity: 1 });
            }
          }
          btn.textContent = 'Adding look...';
          btn.disabled = true;
          try {
            await window.runwayBag.add(itemsToAdd);
            btn.textContent = '✓ Full Look in Bag!';
            setTimeout(() => {
              btn.disabled = false;
              btn.textContent = `Add Full Look to Bag — ${fmt.format(finalPrice)}`;
            }, 1500);
          } catch (err) {
            window.runwayBag.toast(err.message || 'Error adding look.');
            btn.disabled = false;
          }
        });

        card.append(modelCol, detailsCol);
        container.append(card);
      });
    },

    bindFilter() {
      document.querySelectorAll('.look-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          document.querySelectorAll('.look-pill').forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          this.activeFilter = pill.dataset.filter || 'all';
          this.render();
        });
      });
    },
  };

  window.addEventListener('DOMContentLoaded', () => Looks.init());
})();
