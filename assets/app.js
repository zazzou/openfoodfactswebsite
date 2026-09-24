/* Open Food Facts - refonte : helpers partagés (header, footer, badges, API) */
(function () {
  const LOGO = "https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg";
  const LOGO_WHITE = "https://static.openfoodfacts.org/images/logos/off-logo-horizontal-mono-white.svg";
  const API = (window.OFF && OFF.locale && OFF.locale.api) ? OFF.locale.api() : "https://world.openfoodfacts.org";
  const SEARCH = "https://search.openfoodfacts.org";

  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 8v8M11 8v8M15 8v8M18 8v8" stroke-width="2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  };

  const NAV = [
    ["search.html", "Explorer"],
    ["scores.html", "Scores"],
    ["contribute.html", "Contribuer"],
    ["data.html", "Données & API"],
    ["discover.html", "À propos"],
  ];

  function localeButton(mode) {
    const L = OFF.locale || { country: "world", lang: "fr", info: () => ["world", "Monde"], LANGUAGES: { fr: "Français", en: "English" } };
    const c = L.info(L.country), id = mode === "mobile" ? "localeBtnM" : "localeBtn";
    return `<div class="localewrap"><button class="country" type="button" id="${id}" aria-haspopup="dialog" aria-expanded="false"><span class="cc">${L.country.toUpperCase()}</span> ${c[1]} <span class="sep">·</span> ${L.LANGUAGES[L.lang] || L.lang} ${I.chev}</button></div>`;
  }
  function localeMenu() {
    const L = OFF.locale; if (!L) return "";
    const c = L.info(L.country);
    const fmt = n => n.toLocaleString(OFF.locale && OFF.numLocale || "fr-FR");
    const countries = L.COUNTRIES.map(x => `<button type="button" role="option" data-cc="${x[0]}" class="${x[0] === L.country ? "on" : ""}"><span class="cc">${x[0].toUpperCase()}</span><span class="nm">${x[1]}</span><span class="n">${fmt(x[2])}</span></button>`).join("");
    const suggested = [...new Set([...(c[3] || []), "en"])];
    const rank = l => suggested.includes(l) ? 0 : L.UI_LANGS.includes(l) ? 1 : 2;
    const langs = Object.keys(L.LANGUAGES).sort((a, b) => (rank(a) - rank(b)) || L.LANGUAGES[a].localeCompare(L.LANGUAGES[b]));
    const langBtn = l => `<button type="button" role="option" data-lang="${l}" class="${l === L.lang ? "on" : ""}"><span class="cc">${l.toUpperCase()}</span><span class="nm">${L.LANGUAGES[l]}</span>${L.UI_LANGS.includes(l) ? '<span class="ui" title="Interface traduite">UI</span>' : ""}${suggested.includes(l) ? '<span class="sug">' + (l === "en" && !(c[3] || []).includes("en") ? "toujours proposé" : "langue du pays") + "</span>" : ""}</button>`;
    return `<div class="locale-menu" id="localeMenu" role="dialog" aria-label="Pays et langue">
      <div class="col">
        <h4>Pays <small>filtre les produits</small></h4>
        <input type="search" id="localeSearch" placeholder="Rechercher un pays…" aria-label="Rechercher un pays">
        <div class="list" id="localeCountries">${countries}</div>
      </div>
      <div class="col">
        <h4>Langue <small>interface et contenus</small></h4>
        <div class="list" id="localeLangs">${langs.map(langBtn).join("")}</div>
        <p class="hint">Les deux réglages sont indépendants : vous pouvez lire les produits vendus en Allemagne en français. L'interface de cette maquette est traduite en FR, EN et ES ; les contenus produits suivent la langue choisie.</p>
      </div>
    </div>`;
  }
  function header(active) {
    const links = NAV.map(([h, l]) => `<a href="${h}" class="${h === active ? "active" : ""}">${l}</a>`).join("");
    return `
<header class="topbar">
  <div class="container">
    <a class="logo" href="index.html" aria-label="Open Food Facts"><img class="logo-dark" src="${LOGO}" alt="Open Food Facts"><img class="logo-light" src="${LOGO_WHITE}" alt="" aria-hidden="true"></a>
    <nav class="nav" aria-label="Navigation principale">${links}</nav>
    <div class="topbar-actions">
      ${localeButton()}
      ${(() => { let u = null; try { u = JSON.parse(localStorage.getItem("off_user") || "null"); } catch (e) { } return u && u.name ? `<a class="btn btn-ghost" href="profile.html?user=${encodeURIComponent(u.name)}">${I.user} ${esc(u.name)}</a>` : `<a class="btn btn-ghost" href="signin.html">${I.user} Se connecter</a>`; })()}
      <a class="btn btn-primary btn-sm" href="edit.html?new=1">${I.plus} Ajouter</a>
      <button class="btn btn-icon btn-outline burger" type="button" aria-label="Menu" id="burger">${I.menu}</button>
    </div>
  </div>
</header>
${localeMenu()}<nav class="mobile-nav" id="mobileNav">${links}<a href="signin.html">Se connecter</a><div style="padding:14px 16px">${localeButton("mobile")}</div></nav>`;
  }

  function footer() {
    return `
<footer>
  <div class="container">
    <div class="foot-grid">
      <div class="foot-brand">
        <img src="${LOGO}" alt="Open Food Facts" style="height:36px">
        <p>Une base de données de produits alimentaires, ouverte et collaborative, faite par tout le monde, pour tout le monde.</p>
        <div class="socials">
          <a href="https://x.com/OpenFoodFacts" target="_blank" rel="noopener" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.4 8.5L23 22h-6.8l-5.3-6.9L4.8 22H1.7l7.9-9L0 2h7l4.8 6.3L18.9 2Zm-1.2 18h1.9L6.4 3.9H4.4L17.7 20Z"/></svg></a>
          <a href="https://mastodon.social/@openfoodfacts" target="_blank" rel="noopener" aria-label="Mastodon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.3 13.6c-.3 1.6-2.8 3.4-5.7 3.7-1.5.2-3 .3-4.6.3-2.6-.1-4.6-.6-4.6-.6v.6c.4 2.7 2.7 2.9 4.9 3 2.2.1 4.2-.5 4.2-.5l.1 2s-1.6.8-4.3.9c-1.5.1-3.4-.1-5.6-.6C1 20.9.1 15.8 0 10.7V6.5C0 1.3 3.4.1 3.4.1 5.1-.7 8.1-1 11.2-1h.1c3.1 0 6.1.3 7.8 1.1 0 0 3.4 1.2 3.4 6.4 0 0 0 3.7-.5 6.2M17.7 7.3v6.3h-2.5V7.5c0-1.3-.5-1.9-1.6-1.9-1.2 0-1.8.8-1.8 2.3v3.3H9.3V7.9c0-1.5-.6-2.3-1.8-2.3-1.1 0-1.6.6-1.6 1.9v6.1H3.4V7.3c0-1.3.3-2.3 1-3 .7-.8 1.6-1.2 2.7-1.2 1.3 0 2.2.5 2.9 1.5l.6 1 .6-1c.7-1 1.6-1.5 2.9-1.5 1.1 0 2 .4 2.7 1.2.6.7.9 1.7.9 3Z"/></svg></a>
          <a href="https://github.com/openfoodfacts" target="_blank" rel="noopener" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/></svg></a>
          <a href="https://slack.openfoodfacts.org" target="_blank" rel="noopener" aria-label="Slack"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 15.1a2.5 2.5 0 1 1-2.5-2.5H5v2.5Zm1.3 0a2.5 2.5 0 0 1 5 0v6.4a2.5 2.5 0 0 1-5 0v-6.4ZM8.8 5a2.5 2.5 0 1 1 2.5-2.5V5H8.8Zm0 1.3a2.5 2.5 0 0 1 0 5H2.5a2.5 2.5 0 0 1 0-5h6.3ZM19 8.8a2.5 2.5 0 1 1 2.5 2.5H19V8.8Zm-1.3 0a2.5 2.5 0 0 1-5 0V2.5a2.5 2.5 0 0 1 5 0v6.3ZM15.2 19a2.5 2.5 0 1 1-2.5 2.5V19h2.5Zm0-1.3a2.5 2.5 0 0 1 0-5h6.3a2.5 2.5 0 0 1 0 5h-6.3Z"/></svg></a>
        </div>
      </div>
      <div><h4>Découvrir</h4><ul><li><a href="discover.html">Qui sommes-nous</a></li><li><a href="scores.html">Nutri-Score, NOVA, Green-Score</a></li><li><a href="guides.html">Guides</a></li><li><a href="https://world.openfoodfacts.org/press" target="_blank" rel="noopener">Presse</a></li><li><a href="https://world.openfoodfacts.org/partners" target="_blank" rel="noopener">Partenaires</a></li><li><a href="https://world.openfoodfacts.org/code-of-conduct" target="_blank" rel="noopener">Code de conduite</a></li><li><a href="facets.html">Parcourir par facette</a></li><li><a href="countries.html">Pays et carte</a></li><li><a href="compare.html">Comparer des produits</a></li></ul></div>
      <div><h4>Contribuer</h4><ul><li><a href="edit.html?new=1">Ajouter un produit</a></li><li><a href="hunger.html">Hunger Games</a></li><li><a href="leaderboard.html">Classement des contributeurs</a></li><li><a href="changes.html">Dernières modifications</a></li><li><a href="contribute.html#dev">Développer</a></li><li><a href="https://world.openfoodfacts.org/donate-to-open-food-facts" target="_blank" rel="noopener">Faire un don</a></li><li><a href="https://forum.openfoodfacts.org/" target="_blank" rel="noopener">Forum</a></li></ul></div>
      <div><h4>Données</h4><ul><li><a href="data.html">Données ouvertes</a></li><li><a href="data.html#api">API</a></li><li><a href="data.html#sdk">SDK</a></li><li><a href="data.html#exports">Exports</a></li><li><a href="properties.html">Propriétés (folksonomie)</a></li><li><a href="https://wiki.openfoodfacts.org" target="_blank" rel="noopener">Wiki</a></li></ul></div>
      <div><h4>Mon compte</h4><ul><li><a href="signin.html">Se connecter</a></li><li><a href="signup.html">Créer un compte</a></li><li><a href="preferences.html">Mes préférences alimentaires</a></li><li><a href="profile.html?user=teolemon">Mon profil</a></li><li><a href="https://world.openfoodfacts.org/legal" target="_blank" rel="noopener">Mentions légales</a></li><li><a href="https://world.openfoodfacts.org/privacy" target="_blank" rel="noopener">Confidentialité</a></li></ul></div>
    </div>
    <div class="foot-bottom">
      <div>© 2012 – 2026 Open Food Facts · Données sous licence ODbL · Association loi 1901</div>
      <div class="family">
        <a class="beauty" href="https://world.openbeautyfacts.org" target="_blank" rel="noopener">Open Beauty Facts</a>
        <a class="pet" href="https://world.openpetfoodfacts.org" target="_blank" rel="noopener">Open Pet Food Facts</a>
        <a class="products" href="https://world.openproductsfacts.org" target="_blank" rel="noopener">Open Products Facts</a>
        <a class="prices" href="https://prices.openfoodfacts.org/" target="_blank" rel="noopener">Open Prices</a>
      </div>
    </div>
  </div>
</footer>`;
  }

  /* --- Badges --- */
  function ns(grade, lg) {
    const g = (grade || "").toLowerCase();
    if (!"abcde".includes(g) || !g) return `<span class="pill unknown ${lg ? "lg" : ""}" title="Nutri-Score inconnu">Nutri-Score ?</span>`;
    return `<span class="ns ${lg ? "lg" : ""}" title="Nutri-Score ${g.toUpperCase()}">${"abcde".split("").map(l => `<i class="${l} ${l === g ? "on" : ""}">${l.toUpperCase()}</i>`).join("")}</span>`;
  }
  function nova(n, lg) {
    const v = n == null || n === "" ? "unknown" : n;
    return `<span class="pill nova-${v} ${lg ? "lg" : ""}" title="Groupe NOVA ${v}">NOVA ${v === "unknown" ? "?" : v}</span>`;
  }
  const ECO_LABEL = { "a-plus": "A+", a: "A", b: "B", c: "C", d: "D", e: "E" };
  function eco(g, lg) {
    const v = (g || "unknown").toLowerCase();
    const label = ECO_LABEL[v] || (v === "not-applicable" ? "N/A" : "?");
    return `<span class="pill eco-${v} ${lg ? "lg" : ""}" title="Green-Score ${label}">Green-Score ${label}</span>`;
  }
  function brandOf(p) {
    const b = p.brands;
    return Array.isArray(b) ? b.join(", ") : (b || "");
  }
  function tile(p) {
    const img = p.image_front_small_url || p.image_front_url || p.image_url;
    const L = (window.OFF && OFF.lang) || "fr"; const name = p["product_name_" + L] || p.product_name || p.product_name_fr || (OFF.t ? OFF.t("Produit sans nom") : "Produit sans nom");
    return `<a class="tile" href="product.html?code=${p.code}">
      <div class="img ${img ? "" : "empty"}">${img ? `<img loading="lazy" src="${img}" alt="${esc(name)}">` : (OFF.t ? OFF.t("Pas de photo") : "Pas de photo")}</div>
      <div class="name">${esc(name)}</div>
      <div class="brand">${esc(brandOf(p))}${p.quantity ? " · " + esc(p.quantity) : ""}</div>
      <div class="scores">${ns(p.nutriscore_grade)}${nova(p.nova_group)}</div>
    </a>`;
  }
  function esc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  /* --- API --- */
  const FIELDS = "code,product_name,product_name_fr,brands,quantity,nutriscore_grade,nova_group,ecoscore_grade,image_front_small_url,image_front_url";
  // facets : [{type:"nutrition_grades", value:"a"}, ...] ; flags : {additives:"without", palm:"without"}
  async function search(q, { page = 1, pageSize = 24, sort = "", facets = [], flags = {} } = {}) {
    // 1) API classique (CORS ouvert). Search-a-licious n'expose pas encore de CORS pour les origines tierces.
    try {
      const u = new URL(`${API}/cgi/search.pl`);
      u.searchParams.set("search_terms", q || ""); u.searchParams.set("json", "1"); u.searchParams.set("action", "process");
      u.searchParams.set("page", page); u.searchParams.set("page_size", pageSize); u.searchParams.set("fields", FIELDS + ",product_name_en"); u.searchParams.set("lc", (window.OFF && OFF.lang) || "fr");
      if (sort) u.searchParams.set("sort_by", sort);
      facets.forEach((f, i) => { u.searchParams.set(`tagtype_${i}`, f.type); u.searchParams.set(`tag_contains_${i}`, "contains"); u.searchParams.set(`tag_${i}`, f.value); });
      const ct = (OFF.locale && OFF.locale.countryTag) ? OFF.locale.countryTag() : null;
      if (ct) { const i = facets.length; u.searchParams.set(`tagtype_${i}`, "countries"); u.searchParams.set(`tag_contains_${i}`, "contains"); u.searchParams.set(`tag_${i}`, ct); }
      if (flags.additives) u.searchParams.set("additives", flags.additives);
      if (flags.palm) u.searchParams.set("ingredients_from_palm_oil", flags.palm);
      const r = await fetch(u);
      if (r.ok) { const d = await r.json(); return { products: d.products, count: d.count, pages: Math.ceil(d.count / pageSize) }; }
    } catch (e) { /* fallback */ }
    // 2) API v2 (facettes uniquement : le texte libre n'y est pas supporté)
    if (!q && (facets.length || Object.keys(flags).length)) try {
      const u = new URL(`${API}/api/v2/search`);
      u.searchParams.set("page", page); u.searchParams.set("page_size", pageSize); u.searchParams.set("fields", FIELDS);
      facets.forEach(f => { const key = { nutrition_grades: "nutrition_grades_tags", nova_groups: "nova_groups_tags", labels: "labels_tags" }[f.type]; if (key) u.searchParams.set(key, f.value); });
      const ct2 = (OFF.locale && OFF.locale.countryTag) ? OFF.locale.countryTag() : null;
      if (ct2) u.searchParams.set("countries_tags", ct2);
      if (flags.additives) u.searchParams.set("additives_n", "0");
      if (flags.palm) u.searchParams.set("ingredients_analysis_tags", "en:palm-oil-free");
      const r = await fetch(u);
      if (r.ok) { const d = await r.json(); return { products: d.products, count: d.count, pages: Math.ceil(d.count / pageSize) }; }
    } catch (e) { /* fallback */ }
    // 3) Données locales (hors-ligne)
    const local = await fetch("assets/sample.json").then(r => r.json()).catch(() => []);
    const ql = (q || "").toLowerCase();
    const products = local.filter(p => !ql || (p.product_name + " " + brandOf(p)).toLowerCase().includes(ql));
    return { products, count: products.length, pages: 1, offline: true };
  }
  async function product(code) {
    const r = await fetch(`${API}/api/v2/product/${code}.json?lc=${(window.OFF && OFF.lang) || "fr"}`);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const d = await r.json();
    if (d.status !== 1) throw new Error("not found");
    return d.product;
  }

  /* --- UI helpers --- */
  function counters() {
    document.querySelectorAll("[data-count]").forEach(el => {
      const target = +el.dataset.count, suffix = el.dataset.suffix || "";
      el.textContent = "0" + suffix;
      const start = performance.now(), dur = 1600;
      const step = t => {
        const p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e).toLocaleString("fr-FR") + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      const io = new IntersectionObserver(en => { if (en[0].isIntersecting) { requestAnimationFrame(step); io.disconnect(); } });
      io.observe(el);
    });
  }
  function reveal() {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  }
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 2600);
  }
  function mount(active) {
    document.getElementById("site-header").outerHTML = header(active);
    document.getElementById("site-footer").outerHTML = footer();
    const b = document.getElementById("burger"), m = document.getElementById("mobileNav");
    b && b.addEventListener("click", () => m.classList.toggle("open"));
    const lm = document.getElementById("localeMenu");
    if (lm && OFF.locale) {
      const open = (btn) => {
        const r = btn.getBoundingClientRect();
        if (innerWidth < 720) { lm.style.cssText = "position:fixed;left:12px;right:12px;top:" + Math.min(r.bottom + 8, innerHeight - 380) + "px;width:auto;max-height:calc(100vh - 96px);overflow:auto"; }
        else { const w = Math.min(680, innerWidth - 24); lm.style.cssText = "position:absolute;top:" + (r.bottom + 8 + scrollY) + "px;left:" + Math.max(12, Math.min(r.left, innerWidth - w - 12)) + "px;width:" + w + "px"; }
        lm.classList.add("open"); btn.setAttribute("aria-expanded", "true"); const q = document.getElementById("localeSearch"); q && q.focus();
      };
      ["localeBtn", "localeBtnM"].forEach(id => { const b = document.getElementById(id); b && b.addEventListener("click", e => { e.stopPropagation(); lm.classList.contains("open") ? lm.classList.remove("open") : open(b); }); });
      lm.addEventListener("click", e => e.stopPropagation());
      document.addEventListener("click", () => lm.classList.remove("open"));
      document.addEventListener("keydown", e => { if (e.key === "Escape") lm.classList.remove("open"); });
      lm.querySelectorAll("[data-cc]").forEach(b => b.addEventListener("click", () => OFF.locale.set({ country: b.dataset.cc })));
      lm.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => OFF.locale.set({ lang: b.dataset.lang })));
      const q = document.getElementById("localeSearch");
      q && q.addEventListener("input", () => { const v = q.value.trim().toLowerCase(); lm.querySelectorAll("[data-cc]").forEach(b => b.hidden = v && !b.textContent.toLowerCase().includes(v)); });
    }
    document.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener("click", e => { e.preventDefault(); toast(OFF.t ? OFF.t("Maquette : lien non câblé") : "Maquette : lien non câblé"); }));
    reveal(); counters();
    // Formulaires de recherche -> search.html
    document.querySelectorAll("form.searchbar").forEach(f => f.addEventListener("submit", e => {
      e.preventDefault();
      const q = f.querySelector("input").value.trim();
      if (/^\d{8,14}$/.test(q)) location.href = "product.html?code=" + q;
      else location.href = "search.html?q=" + encodeURIComponent(q);
    }));
    document.querySelectorAll(".btn-scan").forEach(b => b.addEventListener("click", () => toast(OFF.t ? OFF.t("Le scan caméra est disponible dans l'app mobile") : "Le scan caméra est disponible dans l'app mobile")));
  }

  function tilt(sel, max = 8) {
    if (matchMedia("(hover:none)").matches) return;
    document.querySelectorAll(sel).forEach(el => {
      el.classList.add("tilt");
      el.addEventListener("mousemove", e => { const b = el.getBoundingClientRect(); const x = (e.clientX - b.left) / b.width - .5, y = (e.clientY - b.top) / b.height - .5; el.style.transform = `perspective(700px) rotateX(${-y * max}deg) rotateY(${x * max}deg) translateY(-3px)`; });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }
  window.OFF = Object.assign(window.OFF || {}, { tilt, I, LOGO, header, footer, ns, nova, eco, tile, esc, search, product, mount, toast, brandOf });
})();
