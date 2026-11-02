"use strict";
/* ============ Items and loot from the DM Tool (the player taps "Add to my character" on the DM's table page) ============
   The link carries the items gzip-compressed in the address: …/#dmloot=<data> */
async function readDmLoot() {
  const m = location.hash.match(/^#dmloot=([\w-]+)/); if (!m) return null;
  try {
    const b64 = m[1].replace(/-/g, "+").replace(/_/g, "/"), bin = atob(b64 + "===".slice((b64.length + 3) % 4)), b = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    return JSON.parse(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream("gzip"))).text());
  } catch (e) { toast("Could not read the items from the DM"); return null; }
}
const coinTxt = c => ["pp", "gp", "ep", "sp", "cp"].filter(k => +(c || {})[k]).map(k => `${c[k]} ${k}`).join(", ");
function mDmLoot() {
  const L = S.modal.loot, chars = S.chars || [];
  const guess = S.modal.cid || (chars.find(c => norm(c.name) === norm(L.forName)) || chars[0] || {}).id;
  return `<h2>🎁 From your DM: ${esc(L.title || "Loot")}</h2>
    ${(L.items || []).map(it => `<div class="feat"><div class="h" style="cursor:default">${it.img ? `<img src="${it.img}" style="width:46px;height:46px;object-fit:cover;border-radius:8px">` : "🎒"}<b>${esc(it.name)}</b>${+it.qty > 1 ? ` ×${it.qty}` : ""}${it.rarity ? `<span class="chip">${esc(it.rarity)}${it.attune ? " · attunement" : ""}</span>` : ""}${it.weapon ? '<span class="chip acc">goes to your weapons too</span>' : ""}</div>
      ${it.desc ? `<div class="desc small" style="padding:4px 8px">${para(it.desc)}${it.curse ? `<p class="warn"><b>Curse:</b> ${esc(it.curse)}</p>` : ""}</div>` : ""}</div>`).join("") || '<p class="muted">No items.</p>'}
    ${coinTxt(L.coins) ? `<p><b>Coins:</b> ${coinTxt(L.coins)}</p>` : ""}
    ${chars.length ? `<p>Add to <select id="dmlChar">${chars.map(c => `<option value="${esc(c.id)}" ${c.id === guess ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></p>` : '<p class="warn">You have no characters on this device yet.</p>'}
    <div class="foot"><button class="ghost" data-act="dmLootSkip">Not now</button>${chars.length ? `<button data-act="dmLootAdd">➕ Add to this character</button>` : ""}</div>`;
}
function clearDmHash() { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { location.hash = ""; } }
Object.assign(ACT, {
  dmLootSkip: () => { clearDmHash(); closeModal(); render(); },
  dmLootAdd: async () => {
    const L = S.modal.loot, c = await DB.getChar($("#dmlChar").value); if (!c) return toast("Character not found");
    migrate(c); c.items ||= []; c.weapons ||= []; c.coins ||= {};
    (L.items || []).forEach(it => {
      const note = [it.rarity, it.attune ? "requires attunement" : "", it.value ? it.value + " gp" : ""].filter(Boolean).join(", ");
      c.items.push({ name: it.name, qty: +it.qty || 1, note, desc: [it.desc, it.curse ? "Curse: " + it.curse : ""].filter(Boolean).join("\n\n"), img: it.img || "" });
      if (it.weapon && WEAPONS.some(w => w.name === it.weapon.base)) c.weapons.push({ name: it.name, base: it.weapon.base, magic: +it.weapon.magic || 0, extra: it.weapon.extra || "" });
    });
    for (const k in L.coins || {}) c.coins[k] = (+c.coins[k] || 0) + (+L.coins[k] || 0);
    await storeSaveChar(c); clearDmHash(); closeModal(); await loadChars(); await openChar(c.id); S.sheetTab = "inventory"; S.mtab = "inventory"; render();
    toast(`Added to ${c.name}'s inventory`);
  },
  itemInfo: el => { const it = S.char.items[+el.dataset.i]; if (!it) return;
    openModal({ type: "info", title: it.name, sub: it.note || "", html: `${it.img ? `<img src="${it.img}" style="max-width:100%;max-height:300px;border-radius:10px;display:block;margin:0 auto 10px">` : ""}${diceLinks(para(it.desc || ""), it.name) || '<span class="muted">No description.</span>'}` }); }
});
async function checkDmLoot() { const L = await readDmLoot(); if (L) openModal({ type: "dmloot", loot: L }); }
window.addEventListener("hashchange", checkDmLoot);
