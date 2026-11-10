/* =====================================================================
   LUNA — PAGE LOGIC
   You normally don't need to edit this file.
   All words, prices, products, photos, reviews and contact details live
   in the /content folder (edited by Luna in Pages CMS, or by hand).
   ===================================================================== */
(function () {
  "use strict";

  /* Categories are fixed here; their PRICES live in content/shop.json.
     To add a new category, add it here AND in .pages.yml (product "category" options). */
  const CATEGORIES = [
    { id: "keychains", label: "Keychains",    tag: "Keychain" },
    { id: "charms",    label: "Phone charms", tag: "Phone charm" },
    { id: "bags",      label: "Bag charms",   tag: "Bag charm" },
    { id: "canvas",    label: "Canvas art",   tag: "Canvas" },
  ];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const hearts = (html) => html.replace(/♡/g, '<span aria-hidden="true">♡</span>'); // shown, not read aloud
  const rupees = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const hasValue = (v) => v !== null && v !== undefined && String(v).trim() !== "";
  // Image paths may come from the editor with a leading "/" — make them relative so the site works in any folder
  const imgPath = (p) => String(p || "").replace(/^\/+/, "");

  /* ---------- Load content ---------- */
  const files = ["page", "shop", "reviews", "faq", "contact"];
  Promise.all(files.map((f) => fetch(`content/${f}.json`, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(`content/${f}.json (${r.status})`);
    return r.json();
  })))
    .then(([page, shop, reviews, faq, contact]) => render({ page, shop, reviews, faq, contact }))
    .catch((err) => {
      console.error("Couldn't load site content:", err.message,
        "\n→ If you opened index.html by double-clicking, use Live Server instead (see README).",
        "\n→ Otherwise check that file for a typo (a missing comma or quote).");
      $("#products").innerHTML = '<p class="load-note">The shop couldn’t load. Please refresh the page.</p>';
    });

  function render({ page, shop, reviews, faq, contact }) {
    renderText(page || {});
    wireContact(contact || {});
    renderShop(shop || {});
    renderReviews(Array.isArray(reviews) ? reviews : []);
    renderFaq(Array.isArray(faq) ? faq : []);
    wireContactLinks(document);
  }

  /* ---------- Page text and photos ---------- */
  function renderText(page) {
    document.querySelectorAll("[data-text]").forEach((el) => {
      const v = page[el.dataset.text];
      if (hasValue(v)) el.innerHTML = hearts(esc(v));
    });

    // Headline with one highlighted word (e.g. "moonlit")
    const h1 = $("[data-hero-title]");
    if (h1 && hasValue(page.hero_title)) {
      let html = esc(page.hero_title);
      const hi = hasValue(page.hero_highlight) ? esc(page.hero_highlight) : "";
      if (hi && html.includes(hi)) html = html.replace(hi, `<em>${hi}</em>`);
      h1.innerHTML = hearts(html);
    }

    // Paragraph text: a blank line between paragraphs starts a new one
    document.querySelectorAll("[data-paras]").forEach((el) => {
      const v = page[el.dataset.paras];
      if (!hasValue(v)) return;
      el.innerHTML = String(v).split(/\n\s*\n/).map((p) => `<p>${hearts(esc(p.trim()))}</p>`).join("");
    });

    // Trust row
    (page.trust || []).slice(0, 3).forEach((t, i) => {
      const el = document.querySelector(`[data-trust="${i}"]`);
      if (el && hasValue(t)) el.innerHTML = hearts(esc(t));
    });

    // Custom order steps
    if (Array.isArray(page.custom_steps) && page.custom_steps.length) {
      $("#custom-steps").innerHTML = page.custom_steps
        .filter(hasValue)
        .map((s, i) => `<li><span class="num">${i + 1}</span><span>${hearts(esc(s))}</span></li>`)
        .join("");
    }

    // Photos
    const setImg = (sel, path, alt) => { const img = $(sel); if (img && hasValue(path)) { img.src = imgPath(path); if (alt !== undefined) img.alt = alt; } };
    setImg("#hero-photo-1", page.hero_photo_1, "");
    setImg("#hero-photo-2", page.hero_photo_2, "");
    setImg("#about-photo", page.about_photo, "Luna's work table");
  }

  /* ---------- Contact links ---------- */
  let phone = "", insta = "";
  function wireContact(contact) {
    phone = String(contact.whatsapp || "").replace(/\D/g, "");
    if (phone.length === 10) phone = "91" + phone; // a plain Indian mobile number → add the country code
    insta = String(contact.instagram || "").replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "").trim();
  }
  const links = {
    whatsapp: (el) => (phone ? `https://wa.me/${phone}?text=${encodeURIComponent(el.dataset.message || "Hi Luna!")}` : ""),
    instagram: () => (insta ? `https://instagram.com/${insta}` : ""),
    "instagram-dm": () => (insta ? `https://ig.me/m/${insta}` : ""),
  };
  function wireContactLinks(root) {
    root.querySelectorAll("[data-link]").forEach((el) => {
      if (el.dataset.wired) return;
      el.dataset.wired = "1";
      const href = (links[el.dataset.link] || (() => ""))(el);
      if (href) {
        el.href = href;
      } else {
        el.href = "#";
        el.removeAttribute("target");
        el.addEventListener("click", (e) => { e.preventDefault(); toast("Ordering opens soon ♡ Check back in a little while."); });
      }
    });
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(text) {
    const t = $("#toast");
    t.innerHTML = hearts(esc(text));
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- Shop ---------- */
  let currentFilter = "all";
  let products = [];
  let prices = {};
  const catById = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
  const priceOf = (p) => (hasValue(p.price) ? Number(p.price) : hasValue(prices[p.category]) ? Number(prices[p.category]) : null);

  function renderShop(shop) {
    prices = shop.prices || {};
    products = (shop.products || []).filter((p) => hasValue(p.name) && hasValue(p.image));

    // Price tiles in the hero, for categories that have a price
    $("#price-tiles").innerHTML = CATEGORIES
      .filter((c) => hasValue(prices[c.id]))
      .slice(0, 3)
      .map((c) => `<div class="price-tile"><b>${rupees(prices[c.id])}</b><small>${esc(c.label)}</small></div>`)
      .join("");

    renderFilters();
    renderProducts();
  }

  function renderFilters() {
    const used = CATEGORIES.filter((c) => products.some((p) => p.category === c.id));
    $("#filters").innerHTML = [{ id: "all", label: "All" }, ...used]
      .map((t) => `<button type="button" class="chip press" data-filter="${esc(t.id)}" aria-pressed="${t.id === currentFilter}">${esc(t.label)}</button>`)
      .join("");
  }

  function productCard(p) {
    const price = priceOf(p);
    const hasPrice = price != null && !Number.isNaN(price);
    const hangs = p.hanging === true || p.hanging === "true";
    const tag = catById[p.category]?.tag || "";
    const message = hasPrice
      ? `Hi Luna! I would love a ${p.name} (${rupees(price)}). Could you make one for me?`
      : `Hi Luna! I love the ${p.name}. Could you tell me the price?`;
    return `
      <article class="card">
        ${hangs ? '<span class="ring" aria-hidden="true"></span>' : ""}
        <div class="ph"${hangs ? " data-swing" : ""}>
          <div class="card-swing${hangs ? " hangs" : ""}">
            <img class="card-img" src="${esc(imgPath(p.image))}" alt="${esc(hasValue(p.alt) ? p.alt : p.name)}" loading="lazy" width="1000" height="1000">
          </div>
          ${tag ? `<span class="tag">${esc(tag)}</span>` : ""}
        </div>
        <h3>${hearts(esc(p.name))}</h3>
        ${hasValue(p.description) ? `<p>${hearts(esc(p.description))}</p>` : ""}
        <div class="meta">
          ${hasPrice ? `<b>${rupees(price)}</b>` : `<b class="ask-price">On request</b>`}
          <span>Made to order</span>
        </div>
        <a class="ask press" data-link="whatsapp" data-message="${esc(message)}" href="#" target="_blank" rel="noopener">${hasPrice ? "Ask to buy" : "Ask for price"}</a>
      </article>`;
  }

  function renderProducts() {
    const list = products.filter((p) => currentFilter === "all" || p.category === currentFilter);
    $("#products").innerHTML = list.map(productCard).join("");
    wireContactLinks($("#products"));
  }

  $("#filters").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn || btn.dataset.filter === currentFilter) return;
    currentFilter = btn.dataset.filter;
    $("#filters").querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === currentFilter)));
    renderProducts(); // instant on purpose: filtering is frequent, so no animation
  });

  /* ---------- Swinging charms ---------- */
  function swing(el) {
    if (reduceMotion || !el.animate) return;
    if (el.getAnimations().some((a) => a.playState === "running")) return; // don't restart mid-swing
    el.animate(
      [
        { transform: "rotate(0deg)" }, { transform: "rotate(3.5deg)" }, { transform: "rotate(-2.6deg)" },
        { transform: "rotate(1.4deg)" }, { transform: "rotate(-0.6deg)" }, { transform: "rotate(0deg)" },
      ],
      { duration: 1300, easing: "ease-in-out" }
    );
  }
  $("#products").addEventListener("pointerover", (e) => {
    if (e.pointerType !== "mouse") return;
    const tile = e.target.closest("[data-swing]");
    if (tile && !tile.contains(e.relatedTarget)) swing(tile.firstElementChild);
  });
  $("#products").addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    const tile = e.target.closest("[data-swing]");
    if (tile) swing(tile.firstElementChild);
  });

  // Pause the hero's swaying charms while they're off screen
  const stage = $("#stage");
  if (stage && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => stage.classList.toggle("is-paused", !entry.isIntersecting)).observe(stage);
  }

  /* ---------- Reviews ---------- */
  function renderReviews(reviews) {
    const list = reviews.filter((r) => hasValue(r.quote));
    $("#reviews-list").innerHTML = list
      .map((r) => `
        <figure class="review">
          ${hasValue(r.image) ? `<img src="${esc(imgPath(r.image))}" alt="${esc(r.alt || "")}" loading="lazy">` : ""}
          <blockquote>“${hearts(esc(String(r.quote).replace(/^["“]|["”]$/g, "")))}”</blockquote>
          <figcaption><strong>${esc(r.name)}</strong>${hasValue(r.piece) ? ` · ${esc(r.piece)}` : ""}</figcaption>
        </figure>`)
      .join("");
    $("#reviews").hidden = !list.length;
  }

  /* ---------- FAQ ---------- */
  function renderFaq(faq) {
    $("#faq-list").innerHTML = faq
      .filter((f) => hasValue(f.question))
      .map((f) => `
        <details>
          <summary><span>${hearts(esc(f.question))}</span><svg class="plus" aria-hidden="true"><use href="#i-plus"/></svg></summary>
          <p>${hearts(esc(f.answer))}</p>
        </details>`)
      .join("");
  }

  $("#year").textContent = new Date().getFullYear();
})();
