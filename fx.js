"use strict";
/* ============ Screen effects for damage rolls ============
   Lightning crackles along the top edge, fire burns at the bottom, necrotic skulls rise like smoke,
   radiant light shines down from above … one effect per damage type in the roll. Tap-through (no clicks blocked). */
const FX = {
  on() { try { return localStorage.getItem("fx") !== "off"; } catch (e) { return true; } },
  set(v) { try { localStorage.setItem("fx", v ? "on" : "off"); } catch (e) { } },
  layer() {
    let l = document.getElementById("fxlayer");
    if (!l) { l = document.createElement("div"); l.id = "fxlayer"; document.body.appendChild(l); }
    return l;
  },
  // types: ["fire", "radiant", …]; delay so it hits when the dice land
  play(types, delay = 550) {
    if (!this.on() || !types || !types.length) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const uniq = [...new Set(types.filter(t => this[t]))].slice(0, 3);
    if (!uniq.length) return;
    setTimeout(() => uniq.forEach(t => { const box = document.createElement("div"); box.className = "fx fx-" + t; this.layer().appendChild(box); this[t](box); setTimeout(() => box.remove(), 3200); }), delay);
  },
  shake() { const e = document.querySelector("#diceres .dicestage") || document.getElementById("main"); if (!e) return; e.classList.remove("fxshake"); void e.offsetWidth; e.classList.add("fxshake"); setTimeout(() => e.classList.remove("fxshake"), 700); },
  rnd(a, b) { return a + Math.random() * (b - a); },
  many(box, n, make) { for (let i = 0; i < n; i++) box.insertAdjacentHTML("beforeend", make(i)); },

  // ---- elemental ----
  lightning(box) {
    const W = 1000, bolt = () => { let x = 0, y = this.rnd(6, 30), d = `M0 ${y}`; while (x < W) { x += this.rnd(25, 70); y = Math.max(2, Math.min(70, y + this.rnd(-28, 28))); d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; } return d; };
    const branch = () => { const x = this.rnd(50, 950); let y = this.rnd(10, 35), xx = x, d = `M${x.toFixed(0)} ${y.toFixed(0)}`; for (let i = 0; i < 6; i++) { xx += this.rnd(-35, 35); y += this.rnd(18, 40); d += ` L${xx.toFixed(0)} ${y.toFixed(0)}`; } return d; };
    box.innerHTML = `<div class="flash"></div><div class="edge"></div><svg viewBox="0 0 1000 140" preserveAspectRatio="none">${[0, 1, 2, 3].map(i => `<g class="bolt" style="animation-delay:${i * 0.22}s"><path d="${bolt()}" class="glow"/><path d="${bolt()}" class="core"/>${[0, 1, 2].map(() => `<path d="${branch()}" class="core thin"/>`).join("")}</g>`).join("")}</svg>`;
  },
  fire(box) {
    this.many(box, 34, i => `<span class="flame" style="left:${(i / 34 * 104 - 2).toFixed(1)}%;--s:${this.rnd(0.6, 1.4).toFixed(2)};animation-delay:${this.rnd(0, 0.5).toFixed(2)}s;animation-duration:${this.rnd(0.7, 1.2).toFixed(2)}s"></span>`);
    this.many(box, 14, () => `<span class="ember" style="left:${this.rnd(0, 100).toFixed(1)}%;animation-delay:${this.rnd(0, 1).toFixed(2)}s;--dx:${this.rnd(-40, 40).toFixed(0)}px"></span>`);
    box.insertAdjacentHTML("afterbegin", `<div class="heat"></div>`);
  },
  necrotic(box) {
    box.insertAdjacentHTML("beforeend", `<div class="gloom"></div>`);
    this.many(box, 16, () => `<span class="smoke" style="left:${this.rnd(-5, 95).toFixed(1)}%;animation-delay:${this.rnd(0, 0.9).toFixed(2)}s;--dx:${this.rnd(-60, 60).toFixed(0)}px"></span>`);
    this.many(box, 9, () => `<span class="skull" style="left:${this.rnd(3, 88).toFixed(1)}%;font-size:${this.rnd(26, 54).toFixed(0)}px;animation-delay:${this.rnd(0, 1).toFixed(2)}s;--dx:${this.rnd(-50, 50).toFixed(0)}px;--r:${this.rnd(-25, 25).toFixed(0)}deg">💀</span>`);
  },
  radiant(box) {
    box.innerHTML = `<div class="halo"></div>${[...Array(9)].map((_, i) => `<span class="ray" style="left:${(8 + i * 10.5 + this.rnd(-3, 3)).toFixed(1)}%;--r:${((i - 4) * 7 + this.rnd(-3, 3)).toFixed(0)}deg;width:${this.rnd(28, 70).toFixed(0)}px;animation-delay:${this.rnd(0, 0.35).toFixed(2)}s"></span>`).join("")}`;
    this.many(box, 18, () => `<span class="mote" style="left:${this.rnd(5, 95).toFixed(1)}%;animation-delay:${this.rnd(0.2, 1.2).toFixed(2)}s"></span>`);
  },
  cold(box) {
    box.innerHTML = `<div class="frost"></div>`;
    this.many(box, 22, () => `<span class="flake" style="left:${this.rnd(0, 100).toFixed(1)}%;font-size:${this.rnd(12, 26).toFixed(0)}px;animation-delay:${this.rnd(0, 1).toFixed(2)}s;--dx:${this.rnd(-40, 40).toFixed(0)}px">❄</span>`);
  },
  acid(box) {
    this.many(box, 16, () => `<span class="drip" style="left:${this.rnd(0, 100).toFixed(1)}%;--h:${this.rnd(40, 160).toFixed(0)}px;animation-delay:${this.rnd(0, 0.6).toFixed(2)}s"></span>`);
  },
  poison(box) {
    box.insertAdjacentHTML("beforeend", `<div class="miasma"></div>`);
    this.many(box, 22, () => `<span class="bubble" style="left:${this.rnd(0, 100).toFixed(1)}%;--z:${this.rnd(8, 26).toFixed(0)}px;animation-delay:${this.rnd(0, 1.1).toFixed(2)}s;--dx:${this.rnd(-30, 30).toFixed(0)}px"></span>`);
  },
  thunder(box) {
    box.innerHTML = `<span class="wave"></span><span class="wave" style="animation-delay:.18s"></span><span class="wave" style="animation-delay:.36s"></span>`;
    this.shake();
  },
  force(box) { box.innerHTML = `<span class="ring"></span><span class="ring" style="animation-delay:.15s"></span><div class="fglow"></div>`; },
  psychic(box) { box.innerHTML = `<div class="pedge"></div><span class="pring"></span><span class="pring" style="animation-delay:.25s"></span><span class="pring" style="animation-delay:.5s"></span>`; },
  // ---- weapons ----
  slashing(box) { box.innerHTML = `<span class="slash"></span><span class="slash two"></span>`; },
  piercing(box) { box.innerHTML = `<span class="pierce"></span>`; },
  bludgeoning(box) { box.innerHTML = `<span class="impact"></span>`; this.shake(); }
};
