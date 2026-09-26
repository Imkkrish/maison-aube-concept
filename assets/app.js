// Maison Aube (concept by webtheory.co): bag drawer, image settle, collection + product pages.
// Nothing leaves the browser: the bag lives in localStorage, checkout only shows a concept note.
import { collections, byId, inCollection, inr, art } from "./data.js";

const KEY = "maison-aube-bag";
const MAX = 5;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ── bag state ─────────────────────────────────────────────────────── */
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    // stored data is untrusted: keep only lines that match a real piece and size
    return Array.isArray(raw)
      ? raw
          .filter((l) => l && byId(l.id)?.sizes.includes(l.size) && Number.isInteger(l.qty) && l.qty > 0)
          .map((l) => ({ id: l.id, size: l.size, qty: Math.min(MAX, l.qty) }))
      : [];
  } catch {
    return [];
  }
}
let bag = load();
let justAdded = null;
const save = () => {
  try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch { /* private mode: bag lasts this page view */ }
};
const keyOf = (l) => `${l.id}|${l.size}`;
const sizeText = (s) => (s === "One size" ? "One size" : `Size ${s}`);

/* ── drawer ────────────────────────────────────────────────────────── */
const dlg = document.createElement("dialog");
dlg.className = "bag";
dlg.setAttribute("aria-labelledby", "bag-title");
dlg.innerHTML = `<div class="bag-inner">
  <header class="bag-head"><h2 id="bag-title" tabindex="-1">Your bag</h2>
    <button class="bag-close" type="button" data-bag-close aria-label="Close bag"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3l14 14M17 3L3 17" stroke="currentColor" stroke-width="1.4"/></svg></button></header>
  <p class="visually-hidden" role="status" data-bag-status></p>
  <div class="bag-body" data-bag-body></div>
  <footer class="bag-foot" data-bag-foot>
    <dl class="subtotal"><dt>Subtotal</dt><dd data-subtotal></dd></dl>
    <p class="note">Delivery would be worked out at checkout.</p>
    <button class="btn btn--block" type="button" data-checkout>Checkout</button>
    <p class="concept-msg" role="status" data-checkout-msg></p>
  </footer></div>`;
document.body.append(dlg);
const body = $("[data-bag-body]", dlg);
const foot = $("[data-bag-foot]", dlg);
const status = $("[data-bag-status]", dlg);
const checkoutMsg = $("[data-checkout-msg]", dlg);

function announce(text) {
  status.textContent = "";
  setTimeout(() => (status.textContent = text), 60);
}

const lineHTML = (l) => {
  const p = byId(l.id);
  const k = keyOf(l);
  return `<li class="line" data-key="${k}">
    <div class="arch"><img src="${art(p)}" alt="" width="72" height="90"></div>
    <div><p class="line-name"><a href="product.html?id=${p.id}">${p.name}</a></p>
      <p class="line-meta">${p.colour} · ${sizeText(l.size)}${l.qty > 1 ? ` · ${inr(p.price)} each` : ""}</p>
      ${justAdded === k ? `<span class="just">Just added</span>` : ""}
      <div class="qty" role="group" aria-label="Quantity of ${p.name}, ${sizeText(l.size)}">
        <button type="button" data-act="dec" aria-label="One fewer" aria-disabled="${l.qty <= 1}">−</button>
        <output>${l.qty}</output>
        <button type="button" data-act="inc" aria-label="One more" aria-disabled="${l.qty >= MAX}">+</button>
      </div></div>
    <div class="line-end"><p class="line-price">${inr(p.price * l.qty)}</p>
      <button type="button" class="line-remove" data-act="remove">Remove<span class="visually-hidden"> ${p.name}, ${sizeText(l.size)}</span></button></div>
  </li>`;
};

function renderBag() {
  const count = bag.reduce((n, l) => n + l.qty, 0);
  $$("[data-bag-count]").forEach((el) => (el.textContent = `(${count})`));
  $$("[data-bag-open]").forEach((b) => b.setAttribute("aria-label", `Bag, ${count} ${count === 1 ? "item" : "items"}`));
  foot.hidden = !bag.length;
  body.innerHTML = bag.length
    ? `<ul class="lines">${bag.map(lineHTML).join("")}</ul>`
    : `<div class="bag-empty"><p>Your bag is empty.</p><p class="muted">Take your time. Everything here waits.</p>
        <ul>${Object.values(collections).map((c) => `<li><a href="collection.html?c=${c.id}"><span>${c.name}</span><span aria-hidden="true">→</span></a></li>`).join("")}</ul></div>`;
  $("[data-subtotal]", dlg).textContent = inr(bag.reduce((n, l) => n + byId(l.id).price * l.qty, 0));
}

function openBag() {
  checkoutMsg.textContent = "";
  if (!dlg.open) dlg.showModal();
}
dlg.addEventListener("close", () => {
  justAdded = null;
  checkoutMsg.textContent = "";
  renderBag();
});

function addToBag(id, size) {
  const p = byId(id);
  const line = bag.find((l) => l.id === id && l.size === size);
  let msg = `Added to your bag: ${p.name}, ${sizeText(size)}.`;
  if (!line) bag.push({ id, size, qty: 1 });
  else if (line.qty < MAX) line.qty++;
  else msg = `You already have ${MAX} of these, the most we hold per order.`;
  justAdded = `${id}|${size}`;
  save();
  renderBag();
  openBag();
  announce(msg);
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-bag-open]")) openBag();
});
dlg.addEventListener("click", (e) => {
  // a click on the dialog element itself is a click on the backdrop
  if (e.target === dlg || e.target.closest("[data-bag-close]")) return dlg.close();
  if (e.target.closest("[data-checkout]")) {
    checkoutMsg.textContent = "This is a concept — nothing was ordered and no payment was taken. Maison Aube is a fictional label designed by webtheory.co.";
    return;
  }
  const btn = e.target.closest("[data-act]");
  if (!btn) return;
  const li = btn.closest("[data-key]");
  const i = bag.findIndex((l) => keyOf(l) === li.dataset.key);
  const l = bag[i];
  const p = byId(l.id);
  const act = btn.dataset.act;
  if (btn.getAttribute("aria-disabled") === "true") {
    announce(act === "dec" ? "Quantity is one. Use Remove to take it out." : `${MAX} is the most we hold per order.`);
    return;
  }
  checkoutMsg.textContent = "";
  if (act === "remove") bag.splice(i, 1);
  else l.qty += act === "inc" ? 1 : -1;
  save();
  renderBag();
  if (act === "remove") {
    announce(`${p.name} removed. ${bag.length ? "" : "Your bag is empty."}`);
    const next = $$(".line-remove", dlg)[Math.min(i, bag.length - 1)];
    (next || $("#bag-title", dlg)).focus();
  } else {
    announce(`${p.name}, quantity ${l.qty}.`);
    $(`[data-key="${li.dataset.key}"] [data-act="${act}"]`, dlg)?.focus();
  }
});

/* ── images settle into place ──────────────────────────────────────── */
// A scroll check rather than IntersectionObserver: it also catches images a fast fling skipped past.
const pending = new Set();
const check = () => pending.forEach((el) => {
  if (el.getBoundingClientRect().top < innerHeight * 0.94) { el.classList.add("in"); pending.delete(el); }
});
addEventListener("scroll", () => requestAnimationFrame(check), { passive: true });
addEventListener("resize", check);
const settle = (root = document) => { $$(".settle:not(.in)", root).forEach((el) => pending.add(el)); check(); };

/* ── shared markup ─────────────────────────────────────────────────── */
const card = (p, n, cls = "", h = "h3") => `<article class="card ${cls}"><a href="product.html?id=${p.id}">
  <span class="plate-no" aria-hidden="true">Plate ${String(n).padStart(2, "0")}</span>
  <div class="arch settle"><img src="${art(p)}" alt="" width="800" height="1000" loading="lazy" decoding="async"></div>
  <div class="card-meta"><${h} class="card-name">${p.name}</${h}><p class="card-price">${inr(p.price)}</p><p class="card-short">${p.short}</p></div></a></article>`;

const notFound = (what) => `<div class="wrap fallback"><p class="label">Not here</p><h1 class="display">That ${what} <em>isn't in the season.</em></h1>
  <p>It may have been a piece from another run. Both landscapes are still open:</p>
  <p><a class="textlink" href="collection.html?c=valley">Madder Valley <span class="arrow" aria-hidden="true">→</span></a>&emsp;<a class="textlink" href="collection.html?c=coast">Salt Coast <span class="arrow" aria-hidden="true">→</span></a></p></div>`;

const markNav = (href) => $$(".nav a").forEach((a) => a.getAttribute("href") === href && a.setAttribute("aria-current", "page"));

/* ── collection page ───────────────────────────────────────────────── */
function renderCollection(root, id) {
  const c = collections[id];
  if (!c) { root.innerHTML = notFound("collection"); document.title = "Not found — Maison Aube (concept)"; return; }
  const list = inCollection(id);
  const other = collections[id === "valley" ? "coast" : "valley"];
  document.title = `${c.name} — Maison Aube (concept)`;
  markNav(`collection.html?c=${id}`);
  const cards = list.map((p, i) => card(p, i + 1, `s${i + 1}`));
  cards.splice(2, 0, `<figure class="interlude"><blockquote><p>“${c.quote}”</p></blockquote><figcaption class="label">${c.quoteSource}</figcaption></figure>`);
  root.innerHTML = `<section class="wrap c-intro" aria-labelledby="c-title">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li><span aria-current="page">${c.name}</span></li></ol></nav>
    <div class="arch arch--wide settle"><img src="${c.art}" alt="${c.alt}" width="1200" height="1200"></div>
    <div class="grid12 c-head">
      <div class="c-title"><p class="label">${c.chapter} · Autumn — Winter 26</p><h1 class="display" id="c-title">${c.name}</h1><p class="place">${c.place}</p></div>
      <div class="c-body"><p>${c.intro[0]}</p><p class="muted">${c.intro[1]}</p>
        <p class="c-meta">${c.materials}</p></div>
    </div></section>
  <section class="wrap" aria-labelledby="look-h">
    <div class="look-head"><h2 class="label" id="look-h">The pieces</h2><p class="label muted">${String(list.length).padStart(2, "0")} in this chapter</p></div>
    <div class="grid12 look">${cards.join("")}</div>
  </section>
  <section class="wrap c-next" aria-label="Next chapter">
    <a class="next-link" href="collection.html?c=${other.id}"><div class="arch settle"><img src="${other.art}" alt="" width="1200" height="1200" loading="lazy"></div>
    <div><p class="label">${other.chapter}</p><p class="display">Continue to <em>${other.name}</em> <span aria-hidden="true">→</span></p></div></a>
  </section>`;
}

/* ── product page ──────────────────────────────────────────────────── */
function renderProduct(root, id) {
  const p = byId(id);
  if (!p) { root.innerHTML = notFound("piece"); document.title = "Not found — Maison Aube (concept)"; return; }
  const c = collections[p.collection];
  const siblings = inCollection(p.collection);
  const n = siblings.indexOf(p) + 1;
  const oneSize = p.sizes.length === 1;
  document.title = `${p.name} — ${c.name} — Maison Aube (concept)`;
  markNav(`collection.html?c=${c.id}`);
  const sizes = p.sizes.map((s) => {
    const out = p.soldOut.includes(s);
    const sid = `size-${s.replace(/\s/g, "")}`;
    return `<input type="radio" name="size" id="${sid}" value="${s}"${out ? " disabled" : ""}${oneSize ? " checked" : ""}><label for="${sid}">${s}${out ? `<span class="visually-hidden">, sold out in this run</span>` : ""}</label>`;
  }).join("");
  const more = siblings.filter((x) => x !== p).slice(0, 3);
  root.innerHTML = `<div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li><a href="collection.html?c=${c.id}">${c.name}</a></li><li><span aria-current="page">${p.name}</span></li></ol></nav>
    <div class="grid12 p-grid">
      <figure class="p-art"><div class="arch settle"><img src="${art(p)}" alt="${p.alt}" width="800" height="1000"></div>
        <figcaption>Plate ${String(n).padStart(2, "0")} · ${c.name}</figcaption></figure>
      <div class="p-buy">
        <p class="label">${c.chapter} · ${c.name}</p>
        <h1 class="display">${p.name}</h1>
        <p class="p-price">${inr(p.price)}</p>
        <p class="p-lede">${p.lede}</p>
        <p class="p-colour"><span class="dot" style="--c:${p.swatch}" aria-hidden="true"></span>Colour: ${p.colour}</p>
        <form class="p-form" novalidate>
          <fieldset class="sizes" aria-describedby="size-note size-error">
            <legend>Size${p.soldOut.length ? ` <span class="muted">· crossed out means sold out in this run</span>` : ""}</legend>
            <div class="size-row">${sizes}</div>
            <p class="note" id="size-note">${oneSize ? "One size, cut generously." : "Cut with room to move. Between sizes? Take the smaller."}</p>
            <p class="error" id="size-error" aria-live="assertive"></p>
          </fieldset>
          <button class="btn btn--block" type="submit">Add to bag · ${inr(p.price)}</button>
        </form>
        <p class="p-run">Made in a single run of ${p.run}. When it's gone, the next one is a season away.</p>
      </div>
    </div></div>
  <section class="p-story" aria-labelledby="ms-h"><div class="wrap">
    <div class="grid12 ms-head"><p class="label">Materials &amp; making</p>
      <h2 class="display h2" id="ms-h">How it was <em>made.</em></h2>
      <p class="making-text drop">${p.making}</p></div>
    <div class="grid12 ms-body">
      <figure class="swatch-fig"><div class="arch swatch" style="--c:${p.swatch}" aria-hidden="true"></div><figcaption>The cloth, close up: ${p.colour.toLowerCase()}.</figcaption></figure>
      <dl class="specs">
        <div><dt>Fibre</dt><dd>${p.fibre}</dd></div>
        <div><dt>Weave</dt><dd>${p.weave}</dd></div>
        <div><dt>Dye</dt><dd>${p.dye}</dd></div>
        <div><dt>Trims</dt><dd>${p.trims}</dd></div>
        <div><dt>Made at</dt><dd>${p.madeIn}</dd></div>
        <div><dt>At the bench</dt><dd>${p.time}</dd></div>
      </dl>
      <div class="care"><h3>Care</h3><ul>${p.care.map((x) => `<li>${x}</li>`).join("")}</ul></div>
    </div></div></section>
  <section class="wrap p-more" aria-labelledby="more-h">
    <h2 class="display h2" id="more-h">More from <em>${c.name}</em></h2>
    <div class="more-grid">${more.map((x) => card(x, siblings.indexOf(x) + 1)).join("")}
      <a class="more-all" href="collection.html?c=${c.id}"><span class="label">${c.chapter}</span><span class="display">The whole chapter <span aria-hidden="true">→</span></span></a></div>
  </section>`;

  const form = $(".p-form", root);
  const fs = $(".sizes", root);
  const err = $("#size-error", root);
  fs.addEventListener("change", () => { err.textContent = ""; fs.classList.remove("invalid"); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const size = $("input[name=size]:checked", form)?.value;
    if (!size) {
      fs.classList.add("invalid");
      err.textContent = "Please choose a size first, so we know which one to keep for you.";
      $("input[name=size]:enabled", form)?.focus();
      return;
    }
    addToBag(p.id, size);
  });
}

/* ── boot ──────────────────────────────────────────────────────────── */
const params = new URLSearchParams(location.search);
const root = $("#page-root");
if (document.body.dataset.page === "collection") renderCollection(root, params.get("c") || "valley");
if (document.body.dataset.page === "product") renderProduct(root, params.get("id"));
renderBag();
settle();
