// Hand Rail Pro Scene Rail Script
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

  const Rail = {
    catalog: null,
    scrollX: 0,
    targetX: 0,
    velX: 0,
    isDragging: false,
    dragActive: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    minX: 0,
    maxX: 0,
    activeLook: null,

    async init() {
      this.catalog = await window.runwayBag.getCatalog();
      this.renderTrack();
      this.bindDrag();
      this.bindDrawer();
      this.startLoop();
      this.measure();
      window.addEventListener('resize', () => this.measure());
    },

    measure() {
      const track = document.getElementById('rail-track');
      const vp = document.getElementById('rail-viewport');
      if (!track || !vp) return;
      const totalWidth = track.scrollWidth;
      const vpWidth = vp.clientWidth;
      this.minX = Math.min(0, -(totalWidth - vpWidth + 80));
      this.maxX = 0;
    },

    renderTrack() {
      const track = document.getElementById('rail-track');
      if (!track) return;

      track.innerHTML = LOOKS.map((l, idx) => `
        <div class="rail-card" data-idx="${idx}">
          <div class="rail-figure">
            <span class="rail-shadow"></span>
            <img src="${A}model-${l.m}-640.webp" srcset="${A}model-${l.m}-640.webp 640w, ${A}original-look-${l.o}.webp 1080w" sizes="320px" alt="${l.name}">
          </div>
          <div class="rail-card-meta">
            <span class="rail-look-num">Look 0${l.id}</span>
            <span class="rail-look-name">${l.name}</span>
            <button type="button" class="rail-inspect-btn" data-idx="${idx}">Inspect Look ↗</button>
          </div>
        </div>`).join('');

      track.querySelectorAll('.rail-card, .rail-inspect-btn').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const idx = +el.dataset.idx;
          if (!isNaN(idx)) this.openDrawer(idx);
        });
      });

      // Render bottom ticks
      const ticksWrap = document.getElementById('rail-ticks-wrap');
      if (ticksWrap) {
        ticksWrap.innerHTML = LOOKS.map((l, idx) => `
          <button type="button" class="rail-tick-btn${idx === 0 ? ' active' : ''}" data-idx="${idx}">0${l.id}</button>`).join('');

        ticksWrap.querySelectorAll('.rail-tick-btn').forEach((btn) => {
          btn.addEventListener('click', () => this.scrollToIndex(+btn.dataset.idx));
        });
      }
    },

    scrollToIndex(idx) {
      const card = document.querySelector(`.rail-card[data-idx="${idx}"]`);
      if (!card) return;
      const target = -card.offsetLeft + 100;
      this.targetX = Math.max(this.minX, Math.min(this.maxX, target));
      this.updateActiveTick(idx);
    },

    updateActiveTick(idx) {
      document.querySelectorAll('.rail-tick-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
      });
    },

    bindDrag() {
      const vp = document.getElementById('rail-viewport');
      if (!vp) return;

      vp.addEventListener('pointerdown', (e) => {
        // Do NOT capture pointer immediately so clicks on cards fire normally!
        this.isDragging = true;
        this.dragActive = false;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.lastX = e.clientX;
        this.velX = 0;
      });

      vp.addEventListener('pointermove', (e) => {
        if (!this.isDragging) return;
        const dx = e.clientX - this.lastX;
        const totalDist = Math.hypot(e.clientX - this.startX, e.clientY - this.startY);

        if (!this.dragActive && totalDist > 6) {
          this.dragActive = true;
          vp.classList.add('is-dragging');
          try { vp.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
        }

        if (this.dragActive) {
          this.lastX = e.clientX;
          this.targetX += dx;
          this.velX = dx;
        }
      });

      const handleEnd = (e) => {
        if (!this.isDragging) return;
        const wasActive = this.dragActive;
        this.isDragging = false;
        this.dragActive = false;
        vp.classList.remove('is-dragging');
        try { vp.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }

        // If it was a quick click without drag, trigger click on target card
        if (!wasActive) {
          const card = e.target.closest('.rail-card');
          if (card) {
            this.openDrawer(+card.dataset.idx);
          }
        }
      };

      vp.addEventListener('pointerup', handleEnd);
      vp.addEventListener('pointercancel', handleEnd);

      // Trackpad wheel
      vp.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
          e.preventDefault();
          this.targetX -= e.deltaX;
        } else if (Math.abs(e.deltaY) > 5) {
          e.preventDefault();
          this.targetX -= e.deltaY;
        }
      }, { passive: false });
    },

    bindDrawer() {
      const closeBtn = document.getElementById('rail-drawer-close');
      if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());

      const cta = document.getElementById('rail-drawer-cta');
      if (cta) {
        cta.addEventListener('click', async () => {
          if (!this.activeLook) return;
          const itemsToAdd = [];
          for (const pid of this.activeLook.items) {
            const it = this.catalog.items.find((x) => x.id === pid);
            if (it && it.variants.length) {
              itemsToAdd.push({ id: it.variants[0].id, quantity: 1 });
            }
          }
          cta.textContent = 'Adding look...';
          cta.disabled = true;
          try {
            await window.runwayBag.add(itemsToAdd);
            cta.textContent = '✓ Full Look in Bag!';
            setTimeout(() => {
              cta.disabled = false;
              cta.textContent = 'Add Full Look — $492.30';
            }, 1500);
          } catch (err) {
            window.runwayBag.toast(err.message || 'Error adding look.');
            cta.disabled = false;
          }
        });
      }
    },

    openDrawer(idx) {
      const l = LOOKS[idx];
      if (!l) return;
      this.activeLook = l;
      const drawer = document.getElementById('rail-drawer');
      const title = document.getElementById('drawer-look-title');
      const itemsList = document.getElementById('drawer-items-list');
      const remix = document.getElementById('drawer-remix-link');

      if (title) title.textContent = `Look 0${l.id} — ${l.name}`;
      if (remix) remix.href = `./studio.html?look=${l.id}`;

      if (itemsList && this.catalog) {
        let total = 0;
        itemsList.innerHTML = l.items.map((pid) => {
          const it = this.catalog.items.find((x) => x.id === pid);
          if (!it) return '';
          total += it.price;
          return `
            <div class="drawer-item">
              <img src="${it.image}" alt="${it.name}">
              <div>
                <h4 style="margin:0 0 4px;font-size:13px;font-weight:500">${it.name}</h4>
                <span style="font-size:11px;color:#666">${fmt.format(it.price)}</span>
              </div>
            </div>`;
        }).join('');

        const subtotalEl = document.getElementById('drawer-subtotal');
        const finalEl = document.getElementById('drawer-final');
        if (subtotalEl) subtotalEl.textContent = fmt.format(total);
        if (finalEl) finalEl.textContent = fmt.format(total * 0.9);
      }

      if (drawer) drawer.classList.add('is-open');
    },

    closeDrawer() {
      const drawer = document.getElementById('rail-drawer');
      if (drawer) drawer.classList.remove('is-open');
    },

    startLoop() {
      const track = document.getElementById('rail-track');
      const tick = () => {
        if (!this.isDragging) {
          this.targetX += this.velX;
          this.velX *= 0.92;
        }

        // Clamp targetX
        if (this.targetX > this.maxX) {
          this.targetX += (this.maxX - this.targetX) * 0.2;
        } else if (this.targetX < this.minX) {
          this.targetX += (this.minX - this.targetX) * 0.2;
        }

        this.scrollX += (this.targetX - this.scrollX) * 0.15;

        if (track) {
          track.style.transform = `translate3d(${this.scrollX.toFixed(2)}px, 0, 0)`;
        }

        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },
  };

  window.addEventListener('DOMContentLoaded', () => Rail.init());
})();
