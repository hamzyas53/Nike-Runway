// Shared Styling Bag implementation for all pages
export const getSharedBagScript = (catalogJsonStr) => `
(() => {
  'use strict';
  const CATALOG_DATA = ${catalogJsonStr};
  const BAG_KEY = 'runway-styling-bag-v3';
  const SHOP_HOST = 'nike-makknzjs.myshopify.com';
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  const Bag = {
    entries: [],
    catalog: null,
    _toastTimer: 0,
    load() {
      let raw = [];
      try { raw = JSON.parse(localStorage.getItem(BAG_KEY) || '[]'); } catch (e) { raw = []; }
      if (!Array.isArray(raw)) raw = [];
      this.entries = raw
        .filter((e) => e && Number.isSafeInteger(e.id) && Number.isSafeInteger(e.quantity) && e.quantity >= 1 && e.quantity <= 20)
        .slice(0, 50)
        .map((e) => ({ id: e.id, quantity: e.quantity }));
    },
    save() {
      try { localStorage.setItem(BAG_KEY, JSON.stringify(this.entries)); } catch (e) { /* storage unavailable */ }
    },
    async getCatalog() {
      if (this.catalog) return this.catalog;
      let data;
      try { data = JSON.parse(JSON.stringify(CATALOG_DATA)); } catch (e) { throw new Error('The product list could not load.'); }
      const ok = data && Array.isArray(data.items) && data.items.every((it) =>
        it && typeof it.id === 'string' && typeof it.name === 'string' && Number.isFinite(it.price) && it.price >= 0 &&
        Array.isArray(it.variants) && it.variants.every((v) => v && Number.isSafeInteger(v.id) && typeof v.a === 'boolean' &&
          Array.isArray(v.o) && v.o.every((s) => typeof s === 'string')));
      if (!ok) throw new Error('The product list is unavailable.');
      this.catalog = data;
      return data;
    },
    async find(id) {
      const cat = await this.getCatalog();
      for (const item of cat.items) {
        const v = item.variants.find((x) => x.id === id);
        if (v) return { item, variant: v };
      }
      return null;
    },
    count() { return this.entries.reduce((s, e) => s + e.quantity, 0); },
    async add(items) {
      const cat = await this.getCatalog();
      for (const it of items) {
        const hit = await this.find(it.id);
        if (!hit || !hit.variant.a) throw new Error('Please choose an available size.');
      }
      void cat;
      for (const it of items) {
        const e = this.entries.find((x) => x.id === it.id);
        if (e) e.quantity = Math.min(20, e.quantity + 1);
        else if (this.entries.length < 50) this.entries.push({ id: it.id, quantity: 1 });
      }
      this.save();
      await this.render();
      this.toast(items.length > 1 ? 'Look saved to your styling bag' : 'Piece saved to your styling bag');
      this.updateCount();
    },
    updateCount() {
      const c = String(this.count());
      document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = c; });
    },
    async render() {
      this.updateCount();
      const list = document.getElementById('bag-items');
      const total = document.getElementById('bag-total');
      const exp = document.getElementById('export-bag');
      if (!list) return;
      list.replaceChildren();
      if (!this.entries.length) {
        const p = document.createElement('p');
        p.className = 'bag-note';
        p.textContent = 'Your styling bag is empty. Choose a size beside a piece to save it.';
        list.append(p);
        total.textContent = '';
        if (exp) exp.disabled = true;
        return;
      }
      await this.getCatalog();
      let sum = 0;
      for (const e of this.entries) {
        const hit = await this.find(e.id);
        if (!hit) continue;
        const { item, variant } = hit;
        const url = new URL(item.url);
        if (url.hostname !== SHOP_HOST) throw new Error('Unexpected product link.');
        sum += item.price * e.quantity;
        const row = document.createElement('div');
        row.className = 'bag-row';
        const img = document.createElement('img');
        img.src = item.image; img.alt = item.name; img.width = 60; img.height = 80; img.loading = 'lazy';
        const info = document.createElement('div');
        const h = document.createElement('h3'); h.textContent = item.name;
        const meta = document.createElement('p');
        meta.textContent = \`Size \${variant.o.join(' / ')} · Quantity \${e.quantity} · \${fmt.format(item.price)}\`;
        const a = document.createElement('a');
        a.href = url.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'View original piece ↗';
        info.append(h, meta, a);
        const rm = document.createElement('button');
        rm.type = 'button'; rm.textContent = '×'; rm.setAttribute('aria-label', \`Remove \${item.name}\`);
        rm.addEventListener('click', () => {
          this.entries = this.entries.filter((x) => x.id !== e.id);
          this.save();
          this.render();
        });
        row.append(img, info, rm);
        list.append(row);
      }
      if (total) total.textContent = \`Reference subtotal \${fmt.format(sum)}\`;
      if (exp) exp.disabled = false;
    },
    async exportText() {
      const lines = [];
      for (const e of this.entries) {
        const hit = await this.find(e.id);
        if (!hit) continue;
        lines.push(\`\${hit.item.name} · Size \${hit.variant.o.join(' / ')} · Quantity \${e.quantity}\\n\${hit.item.url}\`);
      }
      const text = ['RUNWAY — STYLING SHORTLIST', 'Reference prices; no order or payment has been placed.', '', ...lines].join('\\n\\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href; a.download = 'runway-outfit-shortlist.txt';
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    },
    toast(msg) {
      const el = document.getElementById('bag-status');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('is-on');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => el.classList.remove('is-on'), 2500);
    },
    init() {
      this.load();
      this.updateCount();
      const dlg = document.getElementById('bag-dialog');
      const open = document.getElementById('open-bag');
      if (open && dlg) {
        open.addEventListener('click', async () => {
          try { await this.render(); } catch (e) { this.toast(e.message); }
          if (!dlg.open) dlg.showModal();
        });
        const closeBtn = document.getElementById('close-bag');
        if (closeBtn) closeBtn.addEventListener('click', () => dlg.close());
        dlg.addEventListener('click', (e) => {
          const r = dlg.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
        });
        const expBtn = document.getElementById('export-bag');
        if (expBtn) expBtn.addEventListener('click', () => this.exportText());
      }
      window.addEventListener('storage', (e) => {
        if (e.key === BAG_KEY) {
          this.load();
          this.updateCount();
        }
      });
    },
  };
  window.runwayBag = Bag;
  Bag.init();
})();
`;
