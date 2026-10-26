"use strict";
/* ============ SHOP: buy mundane equipment with your coins ============ */
const SHOP_CATS = ["Weapons", "Armor", "Adventuring Gear", "Tools", "Mounts & Vehicles", "Trinkets"];
function trinketList() {
  const out = [];
  for (const p of Object.values(S.wiki.pages || {})) for (const [t, txt] of p.sections || []) {
    if (!/trinket/i.test(t)) continue;
    txt.split("\n").forEach(l => { const m = l.match(/^\s*(\d{1,3})\s*\|\s*(.{6,})$/); if (m) out.push(m[2].trim()); });
  }
  return [...new Set(out)];
}
function shopAll() {
  if (S.ui.shopCache && S.ui.shopCache.w === S.wiki) return S.ui.shopCache.list;
  const list = shopCatalog().concat(trinketList().map((t, i) => ({ id: "k:" + i, name: t, cat: "Trinkets", sub: "Trinkets (d100 table)", cost: 0, kind: "item", invName: "Trinket: " + t })));
  S.ui.shopCache = { w: S.wiki, list }; return list;
}
function walletCp(c) { const k = c.coins || {}; return (+k.cp || 0) + 10 * (+k.sp || 0) + 50 * (+k.ep || 0) + 100 * (+k.gp || 0) + 1000 * (+k.pp || 0); }
function shopDesc(it) {
  if (it.cat === "Trinkets") return "";
  const eq = (S.idx.pages.equipment || []).map(p => p.slug);
  const tries = [it.name, it.name.replace(/\s*\(.*\)$/, ""), it.name.split(":")[0], it.name.split(",")[0]];
  for (const t of tries) { const d = lookup(t, eq); if (d) return d; }
  return "";
}
function shopList() {
  const M = S.modal, q = norm(M.q || "");
  let list = shopAll();
  list = q ? list.filter(it => norm(it.name).includes(q) || norm(it.sub || "").includes(q)) : list.filter(it => it.cat === M.cat);
  if (!list.length) return M.cat === "Trinkets" && !q ? `<p class="muted small">No trinket table in the imported rules text. Update the rules text on the laptop to get it.</p>` : `<p class="muted">Nothing found.</p>`;
  let h = "", lastHead = "";
  for (const it of list) {
    const head = (q ? it.cat + " · " : "") + (it.sub || it.cat);
    if (head !== lastHead) { h += `<div class="fphead">${esc(head)}</div>`; lastHead = head; }
    const n = M.cart[it.id] || 0, open = M.open[it.id];
    h += `<div class="shoprow ${n ? "on" : ""}"><div class="row" style="flex-wrap:nowrap;gap:8px">
      <a href="#" class="shopname" data-act="shopInfo" data-id="${esc(it.id)}">${open ? "▾" : "▸"} ${esc(it.name)}</a>
      <span class="price">${it.cost ? fmtCp(it.cost) : "—"}</span>
      <span class="qty"><button class="small ghost" data-act="shopAdd" data-id="${esc(it.id)}" data-d="-1" ${n ? "" : "disabled"}>−</button><b>${n}</b><button class="small ghost" data-act="shopAdd" data-id="${esc(it.id)}" data-d="1">+</button></span></div>
      ${open ? `<div class="desc optdesc">${it.info ? `<p><b>${esc(it.info)}</b></p>` : ""}${it.bundle > 1 ? `<p class="small muted">Adds ${it.bundle} ${esc(it.invName)} to your items.</p>` : ""}${para(shopDesc(it)) || (it.info ? "" : '<span class="muted small">No description in the imported rules text.</span>')}</div>` : ""}</div>`;
  }
  return h;
}
function mShop() {
  const M = S.modal, c = S.char, all = shopAll();
  const items = Object.entries(M.cart).filter(([id, n]) => n > 0).map(([id, n]) => ({ it: all.find(x => x.id === id), n })).filter(x => x.it);
  const total = items.reduce((t, x) => t + x.it.cost * x.n, 0), wallet = walletCp(c);
  const short = !M.free && total > wallet;
  return `<h2 style="margin-bottom:6px">🛒 Shop</h2>
    <div class="row small muted" style="margin-bottom:8px">You have <b style="color:var(--ink)">${fmtCp(wallet)}</b> ${(+c.coins.pp || 0) || (+c.coins.ep || 0) ? `(incl. ${+c.coins.pp || 0} pp, ${+c.coins.ep || 0} ep)` : ""}</div>
    <input id="shopq" placeholder="🔍 Search all items…" value="${esc(M.q || "")}" data-act-input="shopq" style="width:100%;margin-bottom:8px">
    <div class="subtabs" style="margin-bottom:4px">${SHOP_CATS.map(k => `<button class="${!M.q && M.cat === k ? "on" : ""}" data-act="shopCat" data-k="${k}">${k}</button>`).join("")}</div>
    ${M.cat === "Trinkets" && !M.q && trinketList().length ? `<button class="small ghost" data-act="shopTrinket" style="margin-bottom:6px">🎲 Random trinket</button>` : ""}
    <div id="shoplist" class="shoplist" data-sk="shop">${shopList()}</div>
    <div class="foot" style="flex-wrap:wrap">
      <div style="flex:1;min-width:200px" class="small">${items.length ? items.map(x => `<span class="chip acc">${x.n}× ${esc(x.it.name.length > 28 ? x.it.name.slice(0, 26) + "…" : x.it.name)} <a href="#" data-act="shopAdd" data-id="${esc(x.it.id)}" data-d="-999">✕</a></span>`).join("") : '<span class="muted">Cart is empty</span>'}
        <div style="margin-top:4px"><b>Total: ${fmtCp(total)}</b>${short ? ' <span class="warn">— not enough money</span>' : ""} <label style="margin-left:8px"><input type="checkbox" data-act="shopFree" ${M.free ? "checked" : ""}> free (loot / gift)</label></div></div>
      <button class="ghost" data-act="modalClose">Close</button><button data-act="shopBuy" ${!items.length || short ? "disabled" : ""}>${M.free ? "Add to items" : "Buy"}</button></div>`;
}
function pay(c, cost) {
  let rem = walletCp(c) - cost; if (rem < 0) return false;
  const pp = Math.min(+c.coins.pp || 0, Math.floor(rem / 1000)); rem -= pp * 1000;
  const ep = Math.min(+c.coins.ep || 0, Math.floor(rem / 50)); rem -= ep * 50;
  c.coins = { pp, ep, gp: Math.floor(rem / 100), sp: Math.floor((rem % 100) / 10), cp: rem % 10 };
  return true;
}
function addInventory(c, it, n) {
  if (it.kind === "weapon") { for (let i = 0; i < n; i++) c.weapons.push({ name: it.name, base: it.name, magic: 0 }); return; }
  if (it.kind === "armor" && !c.armor) { c.armor = it.armorKey; n--; }
  if (it.kind === "shield" && !c.shield) { c.shield = true; n--; }
  if (n <= 0) return;
  const name = it.invName || it.name, qty = n * (it.bundle || 1);
  const ex = c.items.find(x => (x.name || "").toLowerCase() === name.toLowerCase());
  if (ex) ex.qty = (+ex.qty || 1) + qty; else c.items.push({ name, qty, note: "" });
}
Object.assign(ACT, {
  shopOpen: () => { openModal({ type: "shop", cart: {}, cat: "Weapons", q: "", open: {}, free: false }); },
  shopCat: el => { S.modal.cat = el.dataset.k; S.modal.q = ""; renderModal(); const l = $("#shoplist"); if (l) l.scrollTop = 0; },
  shopInfo: el => { const o = S.modal.open; o[el.dataset.id] = !o[el.dataset.id]; renderModal(); },
  shopAdd: el => { const M = S.modal, id = el.dataset.id; M.cart[id] = Math.max(0, (M.cart[id] || 0) + +el.dataset.d); renderModal(); },
  shopTrinket: () => { const t = trinketList(); if (!t.length) return; const i = rollDie(t.length) - 1; S.modal.cart["k:" + i] = (S.modal.cart["k:" + i] || 0) + 1; S.modal.open["k:" + i] = true; renderModal(); },
  shopBuy: () => {
    const M = S.modal, c = S.char, all = shopAll();
    const items = Object.entries(M.cart).filter(([id, n]) => n > 0).map(([id, n]) => ({ it: all.find(x => x.id === id), n })).filter(x => x.it);
    const total = items.reduce((t, x) => t + x.it.cost * x.n, 0);
    if (!M.free && !pay(c, total)) return toast("Not enough money");
    items.forEach(x => addInventory(c, x.it, x.n));
    closeModal(); save(); render(); toast(M.free ? "Added to your items" : `Bought for ${fmtCp(total)}`);
  }
});
Object.assign(CHG, { shopFree: el => { S.modal.free = el.checked; } });
document.addEventListener("input", e => {
  if (e.target.dataset.actInput === "shopq" && S.modal?.type === "shop") { S.modal.q = e.target.value; const l = $("#shoplist"); if (l) { l.innerHTML = shopList(); l.scrollTop = 0; } }
});
