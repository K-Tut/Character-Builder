"use strict";
/* ============ SHOP: buy mundane equipment with your coins ============ */
const SHOP_CATS = ["Weapons", "Armor", "Adventuring Gear", "Tools", "Mounts & Vehicles", "Trinkets", "★ Own items"];
// your own items (saved on this device; a character that has one carries its picture and text, so it travels with exports)
function customShopItems() { return (S.customItems || []).map(ci => ({ id: "u:" + ci.id, name: ci.name, cat: "★ Own items", sub: "★ Own items", cost: Math.round((+ci.gp || 0) * 100), kind: "item", custom: ci })); }
async function saveCustomItems() { await DB.set("customItems", S.customItems || []); S.ui.shopCache = null; }
// pull own items out of an imported character into this device's shop
async function mergeCustomItems(c) {
  let changed = false; S.customItems ||= [];
  for (const it of c.items || []) if (it.custom && it.name && !S.customItems.some(x => norm(x.name) === norm(it.name))) {
    S.customItems.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: it.name, gp: it.gp || 0, desc: it.desc || "", img: it.img || "", note: it.note || "" }); changed = true; }
  if (changed) await saveCustomItems();
}
function resizeImage(file, max = 320) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onerror = rej; r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => {
    const s = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement("canvas"); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
    cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height); res(cv.toDataURL("image/jpeg", 0.82)); }; img.src = r.result; }; r.readAsDataURL(file); });
}
function ciForm() {
  const e = S.modal.edit;
  return `<div class="ciform"><h3 style="margin-top:4px">${e.id ? "Edit item" : "New item"}</h3>
    <div class="row" style="align-items:flex-start">
      <label class="ciimg">${e.img ? `<img src="${e.img}">` : `<span>📷<br><small>add picture</small></span>`}<input type="file" accept="image/*" data-act="ciImg" hidden></label>
      <div class="grow" style="display:grid;gap:6px">
        <input id="ci_name" placeholder="Item name" value="${esc(e.name || "")}">
        <div class="row small"><label>Price <input id="ci_gp" type="number" min="0" step="0.01" value="${+e.gp || 0}" style="width:80px"> gp</label><input id="ci_note" placeholder="Short note (e.g. rare, attunement)" value="${esc(e.note || "")}" style="flex:1;min-width:120px"></div>
      </div></div>
    <textarea id="ci_desc" placeholder="Description — what does it do?" style="margin-top:8px;min-height:110px">${esc(e.desc || "")}</textarea>
    ${e.img ? `<a href="#" class="small" data-act="ciImgDel">remove picture</a>` : ""}
    <div class="row" style="margin-top:8px">${e.id ? `<button class="ghost small" data-act="ciDel">🗑 Delete item</button>` : ""}<span class="grow"></span><button class="ghost" data-act="ciCancel">Cancel</button><button data-act="ciSave">Save item</button></div></div>`;
}
function readCiForm() { const e = S.modal.edit, v = id => document.getElementById(id); if (!v("ci_name")) return; e.name = v("ci_name").value; e.gp = +v("ci_gp").value || 0; e.note = v("ci_note").value; e.desc = v("ci_desc").value; }
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
  const list = shopCatalog().concat(customShopItems(), trinketList().map((t, i) => ({ id: "k:" + i, name: t, cat: "Trinkets", sub: "Trinkets (d100 table)", cost: 0, kind: "item", invName: "Trinket: " + t })));
  S.ui.shopCache = { w: S.wiki, list }; return list;
}
function walletCp(c) { const k = c.coins || {}; return (+k.cp || 0) + 10 * (+k.sp || 0) + 50 * (+k.ep || 0) + 100 * (+k.gp || 0) + 1000 * (+k.pp || 0); }
function shopDesc(it) {
  if (it.cat === "Trinkets") return "";
  if (it.custom) return it.custom.desc || "";
  const eq = (S.idx.pages.equipment || []).map(p => p.slug);
  const tries = [it.name, it.name.replace(/\s*\(.*\)$/, ""), it.name.split(":")[0], it.name.split(",")[0]];
  for (const t of tries) { const d = lookup(t, eq); if (d) return d; }
  return "";
}
function shopList() {
  const M = S.modal, q = norm(M.q || "");
  let list = shopAll();
  list = q ? list.filter(it => norm(it.name).includes(q) || norm(it.sub || "").includes(q)) : list.filter(it => it.cat === M.cat);
  const own = !q && M.cat === "★ Own items";
  if (own && M.edit) return ciForm();
  const ownHead = own ? `<div class="row" style="margin:4px 0 8px"><span class="small muted grow">Your own items, with picture and description. A character who has one keeps its picture and text, also in exports.</span><button class="small" data-act="ciNew">＋ New item</button></div>` : "";
  if (!list.length) return own ? ownHead + `<p class="muted small">No own items yet.</p>` : M.cat === "Trinkets" && !q ? `<p class="muted small">No trinket table in the imported rules text. Update the rules text on the laptop to get it.</p>` : `<p class="muted">Nothing found.</p>`;
  let h = ownHead, lastHead = "";
  for (const it of list) {
    const head = (q ? it.cat + " · " : "") + (it.sub || it.cat);
    if (head !== lastHead) { h += `<div class="fphead">${esc(head)}</div>`; lastHead = head; }
    const n = M.cart[it.id] || 0, open = M.open[it.id];
    h += `<div class="shoprow ${n ? "on" : ""}"><div class="row" style="flex-wrap:nowrap;gap:8px">
      ${it.custom?.img ? `<img class="shopthumb" src="${it.custom.img}" alt="">` : ""}<a href="#" class="shopname" data-act="shopInfo" data-id="${esc(it.id)}">${open ? "▾" : "▸"} ${esc(it.name)}</a>
      <span class="price">${it.cost ? fmtCp(it.cost) : "—"}</span>
      <span class="qty"><button class="small ghost" data-act="shopAdd" data-id="${esc(it.id)}" data-d="-1" ${n ? "" : "disabled"}>−</button><b>${n}</b><button class="small ghost" data-act="shopAdd" data-id="${esc(it.id)}" data-d="1">+</button></span></div>
      ${open ? `<div class="desc optdesc">${it.custom?.img ? `<img src="${it.custom.img}" class="shopbig">` : ""}${it.custom?.note ? `<p><b>${esc(it.custom.note)}</b></p>` : ""}${it.info ? `<p><b>${esc(it.info)}</b></p>` : ""}${it.bundle > 1 ? `<p class="small muted">Adds ${it.bundle} ${esc(it.invName)} to your items.</p>` : ""}${para(shopDesc(it)) || (it.info ? "" : '<span class="muted small">No description in the imported rules text.</span>')}${it.custom ? `<button class="small ghost" data-act="ciEdit" data-id="${esc(it.custom.id)}">✎ Edit</button>` : ""}</div>` : ""}</div>`;
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
  if (it.custom) { const ci = it.custom, ex = c.items.find(x => x.custom && norm(x.name) === norm(ci.name));
    if (ex) ex.qty = (+ex.qty || 1) + n; else c.items.push({ name: ci.name, qty: n, note: ci.note || "", desc: ci.desc || "", img: ci.img || "", gp: +ci.gp || 0, custom: true }); return; }
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
Object.assign(CHG, { shopFree: el => { S.modal.free = el.checked; },
  ciImg: async el => { readCiForm(); const f = el.files[0]; if (!f) return; try { S.modal.edit.img = await resizeImage(f); } catch (e) { toast("Could not read that picture"); } renderModal(); } });
Object.assign(ACT, {
  ciNew: () => { S.modal.edit = { name: "", gp: 0, desc: "", img: "", note: "" }; renderModal(); },
  ciEdit: el => { const ci = (S.customItems || []).find(x => x.id === el.dataset.id); if (ci) { S.modal.cat = "★ Own items"; S.modal.q = ""; S.modal.edit = { ...ci }; renderModal(); } },
  ciCancel: () => { S.modal.edit = null; renderModal(); },
  ciImgDel: (el, e) => { e.preventDefault(); readCiForm(); S.modal.edit.img = ""; renderModal(); },
  ciSave: async () => { readCiForm(); const e = S.modal.edit; if (!e.name.trim()) return toast("Give the item a name");
    S.customItems ||= []; if (e.id) { const i = S.customItems.findIndex(x => x.id === e.id); if (i >= 0) S.customItems[i] = { ...e }; }
    else S.customItems.push({ ...e, id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6) });
    await saveCustomItems(); S.modal.edit = null; renderModal(); toast("Item saved"); },
  ciDel: async () => { const e = S.modal.edit; if (!confirm(`Delete "${e.name}" from your own items? Characters who already have it keep theirs.`)) return;
    S.customItems = (S.customItems || []).filter(x => x.id !== e.id); await saveCustomItems(); S.modal.edit = null; renderModal(); }
});
document.addEventListener("input", e => {
  if (e.target.dataset.actInput === "shopq" && S.modal?.type === "shop") { S.modal.q = e.target.value; const l = $("#shoplist"); if (l) { l.innerHTML = shopList(); l.scrollTop = 0; } }
});
