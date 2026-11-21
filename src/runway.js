(() => {
  'use strict';

  /* =========================================================
     Styling bag (localStorage) + inlined catalog
     ========================================================= */
  const CATALOG_DATA = __CATALOG__;
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
        exp.disabled = true;
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
        meta.textContent = `Size ${variant.o.join(' / ')} · Quantity ${e.quantity} · ${fmt.format(item.price)}`;
        const a = document.createElement('a');
        a.href = url.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'View original piece ↗';
        info.append(h, meta, a);
        const rm = document.createElement('button');
        rm.type = 'button'; rm.textContent = '×'; rm.setAttribute('aria-label', `Remove ${item.name}`);
        rm.addEventListener('click', () => {
          this.entries = this.entries.filter((x) => x.id !== e.id);
          this.save();
          this.render();
        });
        row.append(img, info, rm);
        list.append(row);
      }
      total.textContent = `Reference subtotal ${fmt.format(sum)}`;
      exp.disabled = false;
    },
    async exportText() {
      const lines = [];
      for (const e of this.entries) {
        const hit = await this.find(e.id);
        if (!hit) continue;
        lines.push(`${hit.item.name} · Size ${hit.variant.o.join(' / ')} · Quantity ${e.quantity}\n${hit.item.url}`);
      }
      const text = ['RUNWAY — STYLING SHORTLIST', 'Reference prices; no order or payment has been placed.', '', ...lines].join('\n\n');
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
        document.getElementById('close-bag').addEventListener('click', () => dlg.close());
        dlg.addEventListener('click', (e) => {
          const r = dlg.getBoundingClientRect();
          if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dlg.close();
        });
        document.getElementById('export-bag').addEventListener('click', () => this.exportText());
      }
    },
  };
  window.runwayBag = Bag;

  /* =========================================================
     <runway-section>
     ========================================================= */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const TAU = Math.PI * 2;
  const FEELS = { snappy: [170, 0.025], balanced: [95, 0.04], soft: [55, 0.06] };
  const pad2 = (n) => String(n).padStart(2, '0');

  class RunwaySection extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.setup();
    }

    /* ---------- setup ---------- */
    setup() {
      const d = this.dataset;
      this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.mqPhone = matchMedia('(max-width: 749px)');
      this.editor = !!(window.Shopify && window.Shopify.designMode);
      const feel = FEELS[d.feel] || FEELS.balanced;
      this.K = feel[0];
      this.C = 2 * Math.sqrt(this.K);
      this.lag = feel[1];
      this.blurOn = d.blur === 'true';
      this.cfgStyle = d.style || 'ring';
      this.cfgMStyle = d.mstyle || 'classic';
      this.speed = parseInt(d.speed, 10) || 5000;
      this.msgChoose = d.msgChoose || 'Pick a size for: [items]';
      this.msgError = d.msgError || 'Couldn’t add to bag. Please try again.';
      this.msgSoldout = d.msgSoldout || 'Sold out';

      this.stage = this.querySelector('[data-rw-stage]');
      this.actors = this.querySelector('[data-rw-actors]');
      this.heroes = [...this.querySelectorAll('[data-rw-hero]')];
      this.ticks = [...this.querySelectorAll('[data-rw-tick]')];
      this.ticksWrap = this.querySelector('.rw__ticks');
      this.panels = [...this.querySelectorAll('[data-rw-panel]')];
      this.panelEl = this.querySelector('.rw__panel');
      this.live = this.querySelector('[data-rw-live]');
      this.piecesEl = this.querySelector('[data-rw-pieces]');
      this.autoBtn = this.querySelector('[data-rw-auto]');
      this.cursor = this.querySelector('[data-rw-cursor]');
      this.lb = this.querySelector('[data-rw-lb]');
      this.lbStage = this.querySelector('[data-rw-lb-stage]');
      this.sheet = this.querySelector('[data-rw-sheet]');
      this.sheetBody = this.querySelector('[data-rw-sheet-body]');

      this.n = this.heroes.length;
      this.N = this.n * Math.ceil(8 / this.n);
      const originals = [...this.actors.querySelectorAll('[data-rw-model]')];
      for (let a = this.n; a < this.N; a++) {
        const c = originals[a % this.n].cloneNode(true);
        c.setAttribute('data-rw-clone', '');
        c.dataset.index = String(a);
        c.querySelectorAll('img').forEach((img) => { img.loading = 'lazy'; img.classList.remove('is-decoded'); });
        this.actors.append(c);
      }
      this.bodies = [...this.actors.querySelectorAll('[data-rw-model]')].map((el, a) => ({
        el, a, look: a % this.n, w: 0, x: 0, g: 0, v: 0, goal: null, trip: false, from: 0, blur: -1, hit: el.querySelector('.rw__hit'),
      }));

      this.querySelectorAll('[data-model-image]').forEach((img) => this.decodeImage(img));

      // cards
      this.cards = [...this.querySelectorAll('.rw__item')];
      this.cards.forEach((card) => {
        card._picker = card.querySelector('[data-rw-picker]');
        card._add = card.querySelector('[data-rw-add]');
        card._panel = card.closest('[data-rw-panel]');
        try { card._variants = JSON.parse(card._picker.querySelector('[data-rw-variants]').textContent); } catch (e) { card._variants = []; }
        card._picker._card = card;
        this.optionChange(card, false);
      });

      // state
      this.start = this.reduced ? 0 : 1.15;
      this.index = 0;
      this.target = 0;
      this.cur = -this.start;
      this.vel = 0;
      this.still = false;
      this.visible = false;
      this.dragging = false;
      this.playing = false;
      this.engaged = false;
      this.panelHover = false;
      this.zoomed = false;
      this.raf = 0;
      this.lastT = 0;
      this.mode = null;

      this.classList.add('rw--js');
      this.measure(true);
      this.bodies.forEach((s) => {
        s.goal = this.wrapN(s.a - this.target);
        s.x = s.g = s.goal + this.start;
      });
      const params = new URLSearchParams(window.location.search);
      const hashMatch = window.location.hash.match(/look=(\d+)/);
      const targetLook = params.get('look') || (hashMatch ? hashMatch[1] : null);
      let initIdx = 0;
      if (targetLook && Number(targetLook) >= 1 && Number(targetLook) <= this.n) {
        initIdx = Number(targetLook) - 1;
        this.target = initIdx;
        this.cur = initIdx;
      }
      this.setIndex(initIdx, true);
      this.renderAll();

      window.addEventListener('hashchange', () => {
        const hm = window.location.hash.match(/look=(\d+)/);
        if (hm && Number(hm[1]) >= 1 && Number(hm[1]) <= this.n) {
          this.go(Number(hm[1]) - 1);
        }
      });

      this.bindPointer();
      this.bindClicks();
      this.bindKeys();
      this.bindCursor();
      this.bindPanel();
      this.observe();
      this.probeFeet();

      if (d.autoplay === 'true' && !this.reduced && !this.editor) this.play(true);
    }

    decodeImage(img) {
      const done = () => img.classList.add('is-decoded');
      const go = () => {
        if (typeof img.decode !== 'function') { done(); return; }
        img.decode().then(done).catch(() => { if (img.naturalWidth) done(); });
      };
      if (img.complete && img.naturalWidth) go();
      else img.addEventListener('load', go, { once: true });
    }

    wrapN(v) { const N = this.N; return ((v % N) + N) % N; }
    mod(v, m) { return ((v % m) + m) % m; }

    /* ---------- measure ---------- */
    headerHeight() {
      const els = [...document.querySelectorAll('.shopify-section-group-header-group, #shopify-section-header, #shopify-section-announcement-bar')]
        .filter((el) => !el.contains(this) && el.getClientRects().length);
      const top = els.filter((el) => !els.some((o) => o !== el && o.contains(el)));
      return top.reduce((s, el) => s + el.getBoundingClientRect().height, 0);
    }

    measure(first) {
      const phone = this.mqPhone.matches;
      const prevMode = this.mode;
      this.phone = phone;
      this.mode = phone ? this.cfgMStyle : this.cfgStyle;
      if (this.mode !== 'ring') this.mode = 'classic';

      let frameH;
      if (phone) {
        const iw = innerWidth, ih = innerHeight;
        if (this._vh == null || this._vw !== iw || Math.abs(ih - this._vh) >= 160) { this._vw = iw; this._vh = ih; }
        const pct = this.dataset.mheightMode === 'custom' ? clamp(parseFloat(this.dataset.mheightVh) || 100, 50, 120) : 100;
        frameH = this._vh * pct / 100;
      } else {
        frameH = Math.max(380, innerHeight - this.headerHeight());
      }
      this.style.setProperty('--rw-frame-h', Math.round(frameH) + 'px');

      const r = this.stage.getBoundingClientRect();
      const W = this.W = r.width;
      const H = this.H = r.height;
      const ring = this.mode === 'ring';
      this.fs = ring ? 1.08 : 1;
      this.stage.style.setProperty('--rw-fs', String(this.fs));

      let modelH, hx, hy;
      if (ring) {
        modelH = Math.max(200, Math.round((H - 34 - 18) / 1.08));
        hx = 0.5 * W; hy = 34;
      } else {
        this.cl = phone
          ? { ax: 0.3, ay: 22, sx: 0.32, sy: 22, sr: 0.76, ex: 0.55, d: 4 }
          : { ax: 0.4, ay: 36, sx: 0.125, sy: 58, sr: 0.76, ex: 0.38, d: 5 };
        modelH = Math.max(200, Math.round(H - (phone ? 24 : 36) - 18));
        hx = this.cl.ax * W; hy = this.cl.ay;
      }
      this.stage.style.setProperty('--rw-model-h', modelH + 'px');
      this.stage.style.setProperty('--rw-hx', hx.toFixed(1) + 'px');
      this.stage.style.setProperty('--rw-hy', hy + 'px');
      this.style.setProperty('--rw-ax', (W ? (hx / W) * 100 : 40).toFixed(2) + '%');
      this.unit = ring ? Math.max(phone ? 90 : 120, 0.3 * W) : (phone ? Math.max(90, W * 0.32 * 1.6) : Math.max(120, W * this.cl.sx * 2));
      this.bodies.forEach((s) => { s.w = s.el.offsetWidth || modelH * 0.5625; });

      if (!first && prevMode !== this.mode) {
        this.bodies.forEach((s) => { s.goal = this.wrapN(s.a - this.target); s.x = s.g = s.goal; s.v = 0; s.trip = false; });
        this.cur = this.target; this.vel = 0;
      }
      if (!phone && this.sheetCard) this.closeSheet(false);
      if (!first) { this.renderAll(); this.kick(); }
    }

    /* ---------- loop ---------- */
    kick() {
      if (this.raf || !this.visible || document.hidden) return;
      this.raf = requestAnimationFrame((t) => this.loop(t));
    }

    loop(t) {
      this.raf = 0;
      const dt = this.lastT ? Math.min(0.034, (t - this.lastT) / 1000) : 1 / 60;
      this.lastT = t;
      let moving;
      if (this.mode === 'ring') moving = this.stepRing(dt);
      else moving = this.stepClassic(dt);
      moving = moving || this.dragging;
      if (moving) {
        this.setStill(false);
        this.renderAll();
        if (this.visible && !document.hidden) this.raf = requestAnimationFrame((tt) => this.loop(tt));
        else this.lastT = 0;
      } else {
        this.setStill(true);
        this.renderAll();
        this.lastT = 0;
      }
    }

    stepRing(dt) {
      if (this.reduced && !this.dragging) { this.cur = this.target; this.vel = 0; return false; }
      const h = dt / 3;
      for (let i = 0; i < 3; i++) {
        const acc = -this.K * (this.cur - this.target) - this.C * this.vel;
        this.vel += acc * h;
        this.cur += this.vel * h;
      }
      if (Math.abs(this.cur - this.target) <= 0.0005 && Math.abs(this.vel) <= 0.0005) {
        this.cur = this.target; this.vel = 0;
        return false;
      }
      return true;
    }

    stepClassic(dt) {
      let moving = false;
      const N = this.N;
      for (const s of this.bodies) {
        const goal = this.wrapN(s.a - this.target);
        if (s.goal != null && Math.abs(goal - s.goal) > N / 2) { s.trip = true; s.from = s.x; }
        s.goal = goal;
        if (this.reduced && !this.dragging) { s.x = s.g = goal; s.v = 0; s.trip = false; continue; }
        const tau = this.dragging ? 0.016 : s.trip ? 0.1 : 0.03 + this.lag * Math.min(goal, 4);
        s.g += (goal - s.g) * (1 - Math.exp(-dt / tau));
        const h = dt / 3;
        for (let i = 0; i < 3; i++) {
          const acc = -this.K * (s.x - s.g) - this.C * s.v;
          s.v += acc * h;
          s.x += s.v * h;
        }
        if (s.trip && Math.abs(s.x - goal) < 0.02) s.trip = false;
        if (Math.abs(s.x - goal) < 0.0006 && Math.abs(s.v) < 0.0006 && Math.abs(s.g - goal) < 0.0006) {
          s.x = s.g = goal; s.v = 0; s.trip = false;
        } else moving = true;
      }
      return moving;
    }

    setStill(v) {
      if (this.still === v) return;
      this.still = v;
      this.classList.toggle('rw--still', v);
    }

    renderAll() {
      if (!this.W) return;
      if (this.mode === 'ring') this.renderRing();
      else this.renderClassic();
    }

    put(s, x, bottom, scale, op, blur, z) {
      const hw = (s.w * scale) / 2;
      if (x + hw < -4 || x - hw > this.W + 4) op = 0;
      const st = s.el.style;
      st.transform = `translate3d(${x.toFixed(2)}px,${(-bottom).toFixed(2)}px,0) translateX(-50%) scale(${scale.toFixed(4)})`;
      st.opacity = op.toFixed(3);
      st.zIndex = String(z);
      st.visibility = op < 0.01 ? 'hidden' : '';
      st.pointerEvents = op < 0.5 ? 'none' : '';
      if (this.blurOn) {
        let b = Math.round(blur * 10) / 10;
        if (b <= 0.05) b = 0;
        if (b !== s.blur) { s.blur = b; st.filter = b ? `blur(${b}px)` : ''; }
      }
    }

    renderRing() {
      const { W, H, N } = this;
      const step = TAU / N;
      const cx = 0.5 * W;
      const R = (this.phone ? 0.72 : 0.62) * W;
      const P = (this.phone ? 1.9 : 1.65) * W;
      const floor = H - 34, horizon = 0.36 * H;
      const fs = this.fs;
      for (const s of this.bodies) {
        let phi = ((s.a - this.cur) * step) % TAU;
        if (phi > Math.PI) phi -= TAU;
        if (phi <= -Math.PI) phi += TAU;
        const z = R * (1 - Math.cos(phi));
        const persp = P / (P + z);
        const sl = Math.abs(phi) / step;
        const scale = persp * (1 + (fs - 1) * clamp(1 - sl, 0, 1));
        const x = cx + R * Math.sin(phi) * persp;
        const feet = horizon + (floor - horizon) * persp;
        const blur = sl <= 1 ? 1.8 * sl : Math.min(1.8 + (sl - 1) * 2, 6.5);
        let op = clamp((Math.cos(phi) + 0.55) / 0.3, 0, 1);
        if (this.still && sl < 0.02) op = 0;
        this.put(s, x, H - feet, scale, op, blur, Math.round(scale * 1000));
      }
    }

    renderClassic() {
      const { W } = this;
      const c = this.cl;
      for (const s of this.bodies) {
        let k = s.x, e = -1;
        if (s.trip) {
          const span = Math.abs(s.goal - s.from) || 1;
          const u = clamp(Math.abs(s.x - s.from) / span, 0, 1);
          if (s.goal > s.from) {
            if (u < 0.5) e = 2 * u * 1.4; else k = s.goal + 2 * (1 - u);
          } else {
            if (u < 0.5) k = s.from + 2 * u; else e = 2 * (1 - u) * 1.4;
          }
        } else if (k < 0) e = Math.min(-k, 1.4);

        if (e >= 0) {
          this.put(s, W * (c.ax - c.ex * e), c.ay - 22 * e, 1 + 0.14 * e, Math.max(0, 1 - 1.05 * e), 4 * Math.min(e, 1), 1100);
        } else {
          const scale = Math.pow(c.sr, k);
          let op = k <= c.d - 1 ? 1 - 0.13 * k : Math.max(0, 0.61 * (c.d - k));
          if (this.still && Math.abs(k) < 0.02) op = 0;
          this.put(s, W * (c.ax + c.sx * k), c.ay + c.sy * k, scale, op, Math.min(0.9 * k, 3.2), 1000 - Math.round(10 * k));
        }
      }
    }

    /* ---------- index ---------- */
    rankOf(a, T = this.target) {
      const N = this.N;
      const d = this.wrapN(a - Math.round(T));
      if (this.mode === 'ring') return d > N / 2 ? d - N : d;
      return d;
    }

    setIndex(i, silent) {
      const prev = this.index;
      const first = !this._indexed;
      this._indexed = true;
      this.index = i;
      const lim = this.mode === 'ring' ? 2 : 3;
      for (const s of this.bodies) {
        const k = this.rankOf(s.a);
        const on = k !== 0 && Math.abs(k) <= lim;
        if (s.hit) s.hit.tabIndex = on ? 0 : -1;
        if (on) s.el.removeAttribute('aria-hidden'); else s.el.setAttribute('aria-hidden', 'true');
      }
      this.kick();
      if (!first && i === prev) return;

      this.closeLook();
      if (this.phone) this.closeSheet(false);
      this.style.setProperty('--rw-progress', ((i + 1) / this.n).toFixed(3));

      this.heroes.forEach((h, j) => {
        h.classList.toggle('is-on', j === i);
        h.classList.toggle('was', j === prev && j !== i);
        if (j === i) h.removeAttribute('aria-hidden'); else h.setAttribute('aria-hidden', 'true');
        const z = h.querySelector('[data-rw-zoom]');
        if (z) z.tabIndex = j === i ? 0 : -1;
      });

      if (!silent && !this.reduced) {
        this.stage.classList.remove('is-sweep');
        void this.stage.offsetWidth;
        this.stage.classList.add('is-sweep');
      }
      if (!silent && this.live) this.live.textContent = this.heroes[i].dataset.label || '';

      this.ticks.forEach((t, j) => {
        t.setAttribute('aria-current', String(j === i));
        t.classList.toggle('is-past', j < i);
      });

      const panel = this.panels[i];
      if (!silent) {
        this.panels.forEach((p) => { p.hidden = p !== panel; p.classList.remove('is-in'); });
        void panel.offsetWidth;
        panel.classList.add('is-in');
      } else {
        this.panels.forEach((p) => { p.hidden = p !== panel; });
      }
      const tpl = panel.querySelector('template[data-rw-pieces-text]');
      if (this.piecesEl && tpl) {
        this.piecesEl.textContent = tpl.content.textContent.trim();
        if (!silent) {
          this.piecesEl.classList.remove('is-swap');
          void this.piecesEl.offsetWidth;
          this.piecesEl.classList.add('is-swap');
        }
      }
      this.clearHot();
      this.restartBar();
    }

    moveTo(T) {
      this.target = T;
      this.setStill(false);
      this.setIndex(this.mod(T, this.n));
      this.kick();
    }
    next() { this.moveTo(Math.round(this.target) + 1); }
    prev() { this.moveTo(Math.round(this.target) - 1); }
    go(i) {
      let d = this.mod(i - this.index, this.n);
      if (d > this.n / 2) d -= this.n;
      if (d) this.moveTo(Math.round(this.target) + d);
    }

    /* ---------- autoplay ---------- */
    play(on) {
      this.playing = on;
      this.classList.toggle('is-playing', on);
      if (this.autoBtn) this.autoBtn.setAttribute('aria-pressed', String(on));
      this.restartBar();
    }
    restartBar() {
      clearTimeout(this.timer);
      this.ticks.forEach((t) => t.classList.remove('is-run'));
      if (!this.playing) return;
      void this.ticksWrap.offsetWidth;
      if (this.ticks[this.index]) this.ticks[this.index].classList.add('is-run');
      this.timer = setTimeout(() => this.autoTick(), this.speed);
    }
    autoTick() {
      if (this.playing && this.visible && !this.dragging && !document.hidden && !this.panelHover && !this.zoomed && !this.engaged) this.next();
      else this.restartBar();
    }
    engage() {
      if (this.engaged) return;
      this.engaged = true;
      if (this.playing) this.play(false);
    }

    /* ---------- observers ---------- */
    observe() {
      const io = new IntersectionObserver((ents) => {
        for (const e of ents) {
          this.visible = e.isIntersecting;
          if (this.visible) this.kick();
        }
      }, { threshold: 0 });
      io.observe(this);

      if (this.reduced) this.classList.add('is-revealed');
      else {
        const rio = new IntersectionObserver((ents) => {
          if (ents.some((e) => e.isIntersecting)) {
            rio.disconnect();
            requestAnimationFrame(() => requestAnimationFrame(() => this.classList.add('is-revealed')));
          }
        }, { threshold: 0, rootMargin: '0px 0px -22% 0px' });
        rio.observe(this);
      }

      let rt = 0;
      addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => this.measure(), 120); });
      if ('ResizeObserver' in window) {
        let pending = 0, lastW = 0, lastH = 0;
        new ResizeObserver((ents) => {
          const r = ents[0].contentRect;
          if (Math.abs(r.width - lastW) < 0.5 && Math.abs(r.height - lastH) < 0.5) return;
          lastW = r.width; lastH = r.height;
          cancelAnimationFrame(pending);
          pending = requestAnimationFrame(() => this.measure());
        }).observe(this.stage);
      }
      document.addEventListener('visibilitychange', () => { if (!document.hidden) { this.kick(); this.restartBar(); } });
    }

    /* ---------- feet detection (data-probe) ---------- */
    probeFeet() {
      const run = () => this.heroes.forEach((hero) => {
        const url = hero.dataset.probe;
        if (!url) return;
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.decoding = 'async';
        img.onload = () => {
          try {
            const w = 72, h = 128;
            const cv = document.createElement('canvas');
            cv.width = w; cv.height = h;
            const ctx = cv.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0, w, h);
            const data = ctx.getImageData(0, 0, w, h).data;
            let row = h - 1;
            outer: for (; row >= 0; row--) {
              for (let x = 0; x < w; x++) if (data[(row * w + x) * 4 + 3] > 24) break outer;
            }
            if (row < 0) return;
            const foot = clamp((h - 1 - row) / h, 0, 0.2);
            if (foot < 0.004) return;
            const look = +hero.dataset.index;
            const figs = [hero.querySelector('.rw__figure'), ...this.bodies.filter((s) => s.look === look).map((s) => s.el.querySelector('.rw__figure'))];
            figs.forEach((f) => f && f.style.setProperty('--rw-foot', foot.toFixed(4)));
            hero._foot = foot;
          } catch (e) { /* cross-origin pixels unavailable: keep default */ }
        };
        img.src = url;
      });
      if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1500 }); else setTimeout(run, 300);
    }

    /* ---------- pointer / drag ---------- */
    bindPointer() {
      const st = this.stage;
      let g = null;
      this.suppressUntil = 0;
      st.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        g = { x: e.clientX, y: e.clientY, t: this.target, id: e.pointerId, active: false, samples: [{ x: e.clientX, time: performance.now() }], dx: 0 };
      });
      const end = (e) => {
        if (!g) return;
        const was = g;
        g = null;
        if (!was.active) return;
        this.dragging = false;
        this.classList.remove('is-dragging');
        try { st.releasePointerCapture(was.id); } catch (err) { /* noop */ }
        this.suppressUntil = performance.now() + 60;
        const sm = was.samples, f = sm[0], l = sm[sm.length - 1];
        const vx = l.time > f.time ? (l.x - f.x) / (l.time - f.time) : 0;
        const sign = -1;
        const from = Math.round(was.t);
        const dx = was.dx;
        if (this.phone) {
          if (Math.abs(dx) > 30 || Math.abs(vx) > 0.3) {
            const dir = (Math.abs(dx) > 30 ? dx : vx) > 0 ? 1 : -1;
            this.moveTo(from + sign * dir);
          } else this.moveTo(from);
        } else {
          let i = Math.round(this.target + (sign * vx * 160) / this.unit);
          if (i === from && Math.abs(vx) > 0.3) i = from + (vx > 0 ? sign : -sign);
          i = clamp(i, from - 2, from + 2);
          this.moveTo(i);
        }
        if (e && e.pointerType === 'mouse') this.updateCursorState(e.target);
      };
      st.addEventListener('pointermove', (e) => {
        if (!g || e.pointerId !== g.id) return;
        if (e.pointerType === 'mouse' && e.buttons === 0) { end(e); return; }
        const dx = e.clientX - g.x, dy = e.clientY - g.y;
        if (!g.active) {
          if (Math.abs(dx) > 8 && Math.abs(dx) > 1.2 * Math.abs(dy)) {
            g.active = true;
            this.dragging = true;
            this.classList.add('is-dragging');
            try { st.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
            this.setStill(false);
            this.updateCursorState(null);
          } else if (Math.abs(dy) > 10) { g = null; return; } else return;
        }
        g.dx = dx;
        g.samples.push({ x: e.clientX, time: performance.now() });
        if (g.samples.length > 6) g.samples.shift();
        this.target = g.t - dx / this.unit;
        this.kick();
      });
      st.addEventListener('pointerup', end);
      st.addEventListener('pointercancel', end);
      this.addEventListener('click', (e) => {
        if (performance.now() < this.suppressUntil) { e.stopPropagation(); e.preventDefault(); }
      }, true);

      // trackpad horizontal wheel
      let acc = 0, lock = 0;
      st.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
        e.preventDefault();
        if (performance.now() < lock) return;
        acc += e.deltaX;
        if (Math.abs(acc) > 45) {
          if (acc > 0) this.next(); else this.prev();
          acc = 0;
          lock = performance.now() + 520;
        }
      }, { passive: false });
    }

    /* ---------- keys ---------- */
    bindKeys() {
      this.stage.addEventListener('keydown', (e) => {
        if (e.target !== this.stage) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
      });
      this.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (this.sheetCard) { const c = this.sheetCard; this.closeSheet(true); c._add.focus(); return; }
        if (this.zoomed) { e.preventDefault(); this.closeLook(true); }
      });
    }

    /* ---------- cursor ---------- */
    bindCursor() {
      const cur = this.cursor;
      if (!cur) return;
      if (!matchMedia('(hover: hover) and (pointer: fine)').matches) { cur.remove(); this.cursor = null; return; }
      this.classList.add('rw--cursor');
      const k = this.reduced ? 1 : 0.18;
      let x = 0, y = 0, tx = 0, ty = 0, on = false, raf = 0;
      const tick = () => {
        raf = 0;
        x += (tx - x) * k; y += (ty - y) * k;
        if (Math.hypot(tx - x, ty - y) < 0.2) { x = tx; y = ty; }
        cur.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        if (x !== tx || y !== ty) raf = requestAnimationFrame(tick);
      };
      this.stage.addEventListener('pointermove', (e) => {
        if (e.pointerType !== 'mouse') return;
        const r = this.stage.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!on) { on = true; x = tx; y = ty; cur.classList.add('is-on'); }
        this.updateCursorState(e.target);
        if (!raf) raf = requestAnimationFrame(tick);
      });
      this.stage.addEventListener('pointerleave', () => {
        on = false;
        cur.classList.remove('is-on', 'is-link', 'is-view');
      });
    }
    updateCursorState(t) {
      const cur = this.cursor;
      if (!cur) return;
      const el = t && t.closest ? t : null;
      const zoom = el && el.closest('.rw__zoom');
      const view = !this.dragging && !!zoom && !!zoom.closest('.rw__hero.is-on');
      const link = !this.dragging && !!(el && el.closest('.rw__pin, .rw__hit'));
      cur.classList.toggle('is-view', view);
      cur.classList.toggle('is-link', link);
    }

    /* ---------- clicks ---------- */
    bindClicks() {
      this.addEventListener('click', (e) => {
        const t = e.target;
        const inPanel = t.closest('.rw__panel, .rw__sheet');
        if (inPanel && t.closest('button, a, input, select, label')) this.engage();

        let el;
        if ((el = t.closest('[data-rw-pick-close]'))) {
          if (this.sheetCard) { const c = this.sheetCard; this.closeSheet(true); c._add.focus({ preventScroll: true }); }
          else { const c = el.closest('.rw__item'); if (c) this.togglePicker(c, false); }
          return;
        }
        if (t.closest('[data-rw-lb-close]')) { this.closeLook(true); return; }
        if (this.zoomed && (t === this.lb || t === this.lbStage)) { this.closeLook(true); return; }
        if ((el = t.closest('[data-rw-zoom]'))) { this.openLook(); return; }
        if (t.closest('[data-rw-next]')) { this.next(); return; }
        if (t.closest('[data-rw-prev]')) { this.prev(); return; }
        if ((el = t.closest('[data-rw-tick]'))) { this.go(+el.dataset.rwTick); return; }
        if (t.closest('[data-rw-auto]')) {
          if (!this.playing) this.engaged = false;
          this.play(!this.playing);
          return;
        }
        if ((el = t.closest('[data-rw-pin]'))) { this.engage(); this.hot(+el.dataset.rwPin, true); return; }
        if ((el = t.closest('[data-rw-go]'))) {
          const body = el.closest('[data-rw-model]');
          const k = this.rankOf(+body.dataset.index);
          if (k !== 0 && Math.abs(k) < 6) this.moveTo(Math.round(this.target) + k);
          else if (k === 0) this.openLook();
          return;
        }
        if ((el = t.closest('[data-rw-confirm]'))) {
          const c = this.cardOf(el);
          if (c) { c.dataset.touched = '1'; if (c.dataset.selected) this.addCards([c], c._panel); }
          return;
        }
        if ((el = t.closest('[data-rw-add]'))) {
          const c = el.closest('.rw__item');
          if (!c || c.classList.contains('is-added') || c.classList.contains('is-loading')) return;
          if (c.dataset.variantId) { c.dataset.selected = c.dataset.variantId; this.addCards([c], c._panel); return; }
          const open = this.phone ? this.sheetCard !== c : c._picker.hidden;
          this.togglePicker(c, open);
          return;
        }
        if ((el = t.closest('[data-rw-all]'))) { this.addAll(el.closest('[data-rw-panel]')); }
      });

      this.addEventListener('change', (e) => {
        const c = this.cardOf(e.target);
        if (!c) return;
        this.engage();
        this.optionChange(c, true);
      });
    }

    cardOf(el) {
      const c = el.closest('.rw__item');
      if (c) return c;
      const p = el.closest('[data-rw-picker]');
      return p ? p._card : null;
    }

    /* ---------- popup ---------- */
    openLook() {
      if (this.zoomed) return;
      this.engage();
      const hero = this.heroes[this.index];
      const fig = hero.querySelector('.rw__figure').cloneNode(true);
      fig.querySelectorAll('[data-rw-zoom]').forEach((z) => z.remove());
      fig.querySelectorAll('.rw__pin').forEach((p) => { p.tabIndex = 0; });
      this.lbStage.replaceChildren(fig);
      this.querySelector('[data-rw-lb-kicker]').textContent = `Look ${pad2(this.index + 1)} / ${pad2(this.n)}`;
      this.querySelector('[data-rw-lb-name]').textContent = hero.dataset.name || '';
      this.lb.setAttribute('aria-label', `View look: ${hero.dataset.name || ''}`);
      clearTimeout(this._lbT);
      this.lb.hidden = false;
      const h = Math.max(200, Math.round(this.lbStage.clientHeight));
      fig.style.height = h + 'px';
      const img = fig.querySelector('img');
      if (img) { img.sizes = Math.round(h * 0.5625) + 'px'; if (img.complete && img.naturalWidth) img.classList.add('is-decoded'); else this.decodeImage(img); }
      this.zoomed = true;
      this.classList.add('rw--zoomed');
      requestAnimationFrame(() => this.lb.classList.add('is-open'));
      const btn = this.querySelector('[data-rw-lb-close]');
      if (btn) btn.focus({ preventScroll: true });
    }
    closeLook(focus) {
      if (!this.zoomed) return;
      this.zoomed = false;
      this.classList.remove('rw--zoomed');
      this.lb.classList.remove('is-open');
      this.clearHot();
      clearTimeout(this._lbT);
      this._lbT = setTimeout(() => { if (!this.zoomed) { this.lb.hidden = true; this.lbStage.replaceChildren(); } }, this.reduced ? 0 : 450);
      if (focus) {
        const z = this.heroes[this.index].querySelector('[data-rw-zoom]');
        (this.still && z ? z : this.stage).focus({ preventScroll: true });
      }
      this.restartBar();
    }

    /* ---------- hot linking ---------- */
    clearHot() { this.querySelectorAll('.is-hot').forEach((el) => el.classList.remove('is-hot')); }
    hot(n, scroll) {
      this.clearHot();
      const scope = this.zoomed ? this.lbStage : this.heroes[this.index];
      const pin = scope && scope.querySelector(`[data-rw-pin="${n}"]`);
      if (pin) pin.classList.add('is-hot');
      const card = this.panels[this.index].querySelector(`[data-rw-card="${n}"]`);
      if (card) { card.classList.add('is-hot'); if (scroll) this.reveal(card); }
    }
    reveal(card) {
      const list = card.closest('.rw__items');
      const behavior = this.reduced ? 'auto' : 'smooth';
      if (list && list.scrollWidth > list.clientWidth + 1) {
        const cr = card.getBoundingClientRect(), lr = list.getBoundingClientRect();
        list.scrollBy({ left: cr.left - lr.left - 20, behavior });
      } else if (list && list.scrollHeight > list.clientHeight + 1) {
        list.scrollTo({ top: card.offsetTop - list.offsetTop - 12, behavior });
      } else {
        const r = card.getBoundingClientRect();
        if (r.top < 0 || r.bottom > innerHeight - 140) scrollBy({ top: r.top - 0.3 * innerHeight, behavior });
      }
    }

    /* ---------- panel ---------- */
    bindPanel() {
      const p = this.panelEl;
      if (!p) return;
      p.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') this.panelHover = true; });
      p.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        this.panelHover = false;
        this.restartBar();
      });
      p.addEventListener('pointerover', (e) => {
        if (e.pointerType !== 'mouse') return;
        const c = e.target.closest('.rw__item');
        if (c && !c.classList.contains('is-hot')) this.hot(+c.dataset.rwCard, false);
      });
      p.addEventListener('pointerout', (e) => {
        if (e.pointerType !== 'mouse') return;
        const c = e.target.closest('.rw__item');
        if (c && !(e.relatedTarget && c.contains(e.relatedTarget))) {
          c.classList.remove('is-hot');
          const scope = this.zoomed ? this.lbStage : this.heroes[this.index];
          const pin = scope && scope.querySelector(`[data-rw-pin="${c.dataset.rwCard}"]`);
          if (pin) pin.classList.remove('is-hot');
        }
      });
    }

    togglePicker(card, open) {
      if (this.phone) { if (open) this.openSheet(card); else if (this.sheetCard === card) this.closeSheet(false); return; }
      const pk = card._picker;
      pk.hidden = !open;
      card.classList.toggle('is-picking', open);
      card._add.setAttribute('aria-expanded', String(open));
      if (open) {
        const r = pk.querySelector('input:checked') || pk.querySelector('input');
        if (r) r.focus({ preventScroll: true });
        this.reveal(card);
      }
    }

    openSheet(card) {
      if (this.sheetCard && this.sheetCard !== card) this.closeSheet(false, true);
      const pk = card._picker;
      this.sheetCard = card;
      this.sheetBody.append(pk);
      pk.hidden = false;
      card.classList.add('is-picking');
      card._add.setAttribute('aria-expanded', 'true');
      this.sheet.hidden = false;
      void this.sheet.offsetWidth;
      this.sheet.classList.add('is-open');
      const r = pk.querySelector('input:checked') || pk.querySelector('input');
      if (r) r.focus({ preventScroll: true });
    }
    closeSheet(animate, keepOpen) {
      const card = this.sheetCard;
      if (!card) return;
      this.sheetCard = null;
      const pk = card._picker;
      card.classList.remove('is-picking');
      if (card._add.hasAttribute('aria-expanded')) card._add.setAttribute('aria-expanded', 'false');
      const dock = () => { pk.hidden = true; card.append(pk); };
      if (keepOpen) { dock(); return; }
      this.sheet.classList.remove('is-open');
      if (animate && !this.reduced) {
        clearTimeout(this._sheetT);
        this._sheetT = setTimeout(() => { if (!this.sheetCard) this.sheet.hidden = true; dock(); }, 420);
      } else { dock(); this.sheet.hidden = true; }
    }

    optionChange(card, user) {
      const pk = card._picker;
      const vs = card._variants || [];
      const sets = [...pk.querySelectorAll('fieldset.rw__opt')];
      const sel = sets.map((fs) => { const c = fs.querySelector('input:checked'); return c ? c.value : null; });
      const match = vs.find((v) => v.a && v.o.every((x, i) => x === sel[i]));
      sets.forEach((fs, i) => {
        fs.querySelectorAll('input').forEach((inp) => {
          const avail = vs.some((v) => v.a && v.o[i] === inp.value && v.o.every((y, j) => j === i || y === sel[j]));
          inp.closest('.rw__pill').classList.toggle('is-unavailable', !avail);
        });
      });
      const btn = pk.querySelector('[data-rw-confirm]');
      const lbl = pk.querySelector('[data-rw-confirm-label]');
      btn.disabled = !match;
      lbl.textContent = match ? lbl.dataset.add : this.msgSoldout;
      card.dataset.selected = match ? String(match.id) : '';
      if (user) card.dataset.touched = '1';
    }

    setMsg(panel, text) {
      const m = panel.querySelector('[data-rw-msg]');
      if (!m) return;
      m.textContent = '';
      if (text) { void m.offsetWidth; m.textContent = text; }
    }

    async addCards(cards, panel) {
      cards.forEach((c) => c.classList.add('is-loading'));
      try {
        await Bag.add(cards.map((c) => ({ id: Number(c.dataset.selected), quantity: 1 })));
        cards.forEach((c) => this.markAdded(c));
        return true;
      } catch (err) {
        cards.forEach((c) => c.classList.remove('is-loading'));
        this.setMsg(panel, this.msgError);
        return false;
      }
    }

    markAdded(card) {
      card.classList.remove('is-loading', 'is-picking');
      card.classList.add('is-added');
      if (this.sheetCard === card) this.closeSheet(true);
      else { card._picker.hidden = true; if (card._picker.parentNode !== card) card.append(card._picker); }
      card._add.setAttribute('aria-label', card._add.dataset.addedLabel);
      card._add.removeAttribute('aria-expanded');
      if (navigator.vibrate && this.phone && !this.reduced) { try { navigator.vibrate(12); } catch (e) { /* noop */ } }
      this.checkComplete(card._panel);
    }

    checkComplete(panel) {
      const cards = [...panel.querySelectorAll('.rw__item')];
      if (cards.length >= 2 && cards.every((c) => c.classList.contains('is-added'))) {
        panel.classList.add('is-complete');
        this.setMsg(panel, '');
      }
    }

    async addAll(panel) {
      if (!panel) return;
      const cta = panel.querySelector('[data-rw-all]');
      if (panel.classList.contains('is-complete') || cta.classList.contains('is-loading')) return;
      this.setMsg(panel, '');
      const cards = [...panel.querySelectorAll('.rw__item')].filter((c) => !c.classList.contains('is-added') && !c.classList.contains('is-soldout'));
      const ready = cards.filter((c) => c.dataset.variantId || (c.dataset.touched && c.dataset.selected));
      const pending = cards.filter((c) => !ready.includes(c));
      ready.forEach((c) => { if (c.dataset.variantId) c.dataset.selected = c.dataset.variantId; });
      if (ready.length) {
        cta.classList.add('is-loading');
        await this.addCards(ready, panel);
        cta.classList.remove('is-loading');
      }
      if (pending.length) {
        const toOpen = this.phone ? pending.slice(0, 1) : pending;
        toOpen.forEach((c) => this.togglePicker(c, true));
        if (!this.phone) this.reveal(pending[0]);
        this.setMsg(panel, this.msgChoose.replace('[items]', pending.map((c) => c.dataset.title).join(', ')));
      }
    }
  }

  Bag.init();
  if (!customElements.get('runway-section')) customElements.define('runway-section', RunwaySection);
})();
