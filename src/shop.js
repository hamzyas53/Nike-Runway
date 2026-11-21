// Shop Catalog Script
(() => {
  'use strict';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  const LOOK_APPEARANCES = {
    'tatum-5-orbit-copy': [1, 4],
    'tshirt': [1, 2, 3, 4, 5, 6],
    'sweatshirt': [1, 5],
    'tatum-5-orbit': [2, 3, 5],
    'hoodie-black': [2, 4],
    'sweatshirt-plus': [3],
    'hoodie': [6],
    'air-jordan-12-retro-copy': [6],
  };

  const Shop = {
    catalog: null,
    activeCategory: 'all',
    activeSort: 'featured',
    selectedSizes: {},

    async init() {
      this.catalog = await window.runwayBag.getCatalog();
      this.initDefaultSizes();
      this.render();
      this.bindControls();
    },

    initDefaultSizes() {
      if (!this.catalog) return;
      this.catalog.items.forEach((it) => {
        if (!this.selectedSizes[it.id] && it.sizes.length) {
          this.selectedSizes[it.id] = it.sizes[0];
        }
      });
    },

    getCategory(it) {
      if (it.id.includes('orbit') || it.id.includes('retro')) return 'shoes';
      if (it.id.includes('hoodie')) return 'hoodies';
      if (it.id.includes('sweatshirt')) return 'sweatshirts';
      return 'tees';
    },

    render() {
      const grid = document.getElementById('shop-grid');
      if (!grid || !this.catalog) return;
      grid.replaceChildren();

      let items = [...this.catalog.items];

      // Filter
      if (this.activeCategory !== 'all') {
        items = items.filter((it) => this.getCategory(it) === this.activeCategory);
      }

      // Sort
      if (this.activeSort === 'price-asc') {
        items.sort((a, b) => a.price - b.price);
      } else if (this.activeSort === 'price-desc') {
        items.sort((a, b) => b.price - a.price);
      } else if (this.activeSort === 'name-asc') {
        items.sort((a, b) => a.name.localeCompare(b.name));
      }

      items.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'shop-card';

        const isNew = item.id === 'tatum-5-orbit' || item.id === 'hoodie-black';
        const vendor = item.id.includes('orbit') || item.id.includes('retro') ? 'Nikey | Password: 1' : 'Nike';
        const looks = LOOK_APPEARANCES[item.id] || [];
        const looksHtml = looks.map((n) => `<a href="./index.html#look=${n}">Look 0${n}</a>`).join(', ');

        const sizesHtml = item.sizes.map((sz) => `
          <button type="button" class="shop-size-pill${this.selectedSizes[item.id] === sz ? ' active' : ''}" data-item="${item.id}" data-size="${sz}">${sz}</button>`).join('');

        card.innerHTML = `
          <div class="shop-card-thumb">
            ${isNew ? '<span class="shop-new-badge">New</span>' : ''}
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </div>
          <div class="shop-card-info">
            <span class="shop-card-vendor">${vendor}</span>
            <h3 class="shop-card-title">${item.name}</h3>
            <span class="shop-card-price">${fmt.format(item.price)}</span>
            <div class="shop-featured-in">Featured in: ${looksHtml}</div>
          </div>
          <div class="shop-sizes-wrap">
            ${sizesHtml}
          </div>
          <button type="button" class="shop-add-btn" data-item="${item.id}">
            Add to Bag — ${fmt.format(item.price)}
          </button>`;

        // Size button selection
        card.querySelectorAll('.shop-size-pill').forEach((pill) => {
          pill.addEventListener('click', () => {
            this.selectedSizes[item.id] = pill.dataset.size;
            card.querySelectorAll('.shop-size-pill').forEach((p) => p.classList.toggle('active', p === pill));
          });
        });

        // Add button
        const addBtn = card.querySelector('.shop-add-btn');
        addBtn.addEventListener('click', async () => {
          const sz = this.selectedSizes[item.id] || item.sizes[0];
          const variant = item.variants.find((v) => v.o.includes(sz)) || item.variants[0];
          if (!variant) return;

          addBtn.textContent = 'Adding...';
          addBtn.disabled = true;
          try {
            await window.runwayBag.add([{ id: variant.id, quantity: 1 }]);
            addBtn.textContent = '✓ Added to Styling Bag!';
            setTimeout(() => {
              addBtn.disabled = false;
              addBtn.textContent = `Add to Bag — ${fmt.format(item.price)}`;
            }, 1400);
          } catch (err) {
            window.runwayBag.toast(err.message || 'Error adding piece.');
            addBtn.disabled = false;
          }
        });

        grid.append(card);
      });
    },

    bindControls() {
      document.querySelectorAll('.shop-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          document.querySelectorAll('.shop-pill').forEach((p) => p.classList.remove('active'));
          pill.classList.add('active');
          this.activeCategory = pill.dataset.cat || 'all';
          this.render();
        });
      });

      const sortSelect = document.getElementById('shop-sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          this.activeSort = e.target.value;
          this.render();
        });
      }
    },
  };

  window.addEventListener('DOMContentLoaded', () => Shop.init());
})();
