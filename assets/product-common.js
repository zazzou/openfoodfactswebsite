/* Open Food Facts – refonte : module partagé des pages produit
   (product.html, product-health.html, product-environment.html, product-contribute.html, report.html)
   - load(code)            : charge le produit (OFF → OBF → OPF), champs complets + knowledge_panels
   - renderHeader(p, el, tab, opts) : bandeau commun (image, nom, scores, pastille, actions, 4 onglets)
   - renderPanel(id, p, el) : moteur de rendu récursif des knowledge panels de l'API */
(function () {
  window.OFF = window.OFF || {};
  const T = s => (OFF.t ? OFF.t(s) : s);
  const esc = s => (OFF.esc ? OFF.esc(s) : String(s ?? ""));
  const DEFAULT_CODE = "3017620422003";
  const SERVERS = [
    ["food", "https://world.openfoodfacts.org"],
    ["beauty", "https://world.openbeautyfacts.org"],
    ["product", "https://world.openproductsfacts.org"],
  ];
  const FIELDS = ["code", "product_type", "product_name", "product_name_fr", "product_name_en", "product_name_es", "generic_name", "brands", "brands_tags", "quantity",
    "categories", "categories_tags", "labels", "labels_tags", "countries", "countries_tags", "stores", "stores_tags", "origins", "origins_tags", "emb_codes", "emb_codes_tags",
    "manufacturing_places", "image_front_url", "image_front_small_url", "image_ingredients_url", "image_nutrition_url", "image_packaging_url", "selected_images",
    "nutriscore_grade", "nutriscore_data", "nova_group", "ecoscore_grade", "ecoscore_score", "ecoscore_data", "nutriments", "nutrient_levels",
    "ingredients_text", "ingredients_text_fr", "ingredients_text_en", "ingredients_text_es", "ingredients", "ingredients_n", "allergens", "allergens_tags", "traces", "traces_tags",
    "additives_tags", "additives_n", "ingredients_analysis_tags", "packagings", "packaging", "packaging_tags", "completeness", "states_tags",
    "data_quality_errors_tags", "data_quality_warnings_tags", "data_quality_info_tags", "editors_tags", "last_editor", "last_modified_t", "last_modified_by", "created_t", "creator",
    "serving_size", "serving_quantity", "unique_scans_n", "scans_n", "knowledge_panels", "forest_footprint_data", "ingredients_from_palm_oil_n", "ingredients_that_may_be_from_palm_oil_n"].join(",");

  /* ---------- CSS partagé (injecté une fois : les composants de bandeau sont communs aux 5 pages) ---------- */
  const CSS = `
.pp-head{display:grid;grid-template-columns:260px 1fr;gap:36px;align-items:start}
.pp-head.no-img{grid-template-columns:1fr}
@media(max-width:800px){.pp-head{grid-template-columns:1fr}}
.pp-img{background:#fff;border:1px solid var(--line-2);border-radius:var(--r-lg);height:300px;display:grid;place-items:center;padding:20px;box-shadow:var(--shadow-sm)}
.pp-img img{max-height:260px;width:auto;object-fit:contain}
.pp-img.empty{background:var(--sand);border-style:dashed;text-align:center;color:var(--ink-2);font-weight:600;gap:8px;align-content:center}
.pp-img.empty svg{width:44px;height:44px;color:var(--muted);margin:0 auto 6px}
.pp-img.empty a{color:var(--orange-dark);font-size:.9rem;display:block;margin-top:4px}
.pp-match{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;margin-top:18px}
.pp-match a{font-weight:600;color:var(--orange-dark);font-size:.9rem;text-decoration:underline;text-underline-offset:3px}
.match{display:inline-flex;align-items:center;gap:10px;padding:5px 14px 5px 5px;border-radius:999px;background:#fff;border:1.5px solid var(--line)}
.match b{display:grid;place-items:center;min-width:40px;height:40px;padding:0 8px;border-radius:999px;background:var(--c);background:color-mix(in srgb,var(--c) 78%,#000);color:#fff;font-family:var(--font-head);font-size:.9rem}
.match span{font-weight:600;color:var(--ink-2);font-size:.9rem}
.match.lg b{min-width:48px;height:48px;font-size:1rem}
.score-box .unlock{font-size:.85rem;font-weight:600;color:var(--orange-dark);text-decoration:underline;text-underline-offset:3px}
.pp-noscore{background:var(--sand);border-radius:var(--r);padding:18px 20px;margin:28px 0}
.pp-noscore b{display:block;font-family:var(--font-head);color:var(--brand);font-size:1.05rem;margin-bottom:6px}
.pp-noscore p{color:var(--ink-2);font-size:.92rem}
.subnav.pp-subnav a{display:inline-flex;align-items:center;gap:8px}
.subnav.pp-subnav a svg{width:16px;height:16px}
/* knowledge panels */
.kp{border:1px solid var(--line-2);border-radius:16px;background:#fff;margin-top:12px;overflow:hidden}
.kp.lv-warning{border-left:4px solid var(--red)}.kp.lv-recommendation{border-left:4px solid var(--green)}
.kp.ev-good{border-left:4px solid var(--ns-a)}.kp.ev-bad{border-left:4px solid var(--ns-e)}.kp.ev-average{border-left:4px solid var(--ns-d)}
.kp>summary,.kp>.kp-hd{display:flex;align-items:center;gap:14px;padding:14px 18px;cursor:pointer;list-style:none}
.kp>.kp-hd{cursor:default}
.kp>summary::-webkit-details-marker{display:none}
.kp>summary::after{content:"";width:10px;height:10px;border-right:2.4px solid var(--muted);border-bottom:2.4px solid var(--muted);transform:rotate(45deg);margin-left:auto;flex:none;transition:.2s;margin-right:4px}
.kp[open]>summary::after{transform:rotate(-135deg)}
.kp .kp-icon{width:auto;height:28px;flex:none}
.kp .kp-icon.big{height:48px}
.kp .kp-t{font-family:var(--font-head);font-weight:700;color:var(--brand);font-size:1.02rem;line-height:1.2}
.kp .kp-st{font-size:.85rem;color:var(--ink-2);margin-top:2px}
.kp .kp-body{padding:4px 18px 18px}
.kp .kp>summary,.kp .kp>.kp-hd{padding:12px 14px}
.kp-grade{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:9px;font-family:var(--font-head);font-weight:800;color:#fff;flex:none}
.kp-grade.g-a,.kp-grade.g-a-plus{background:var(--ns-a)}.kp-grade.g-b{background:var(--ns-b)}.kp-grade.g-c{background:var(--ns-c);color:var(--brand)}.kp-grade.g-d{background:var(--ns-d)}.kp-grade.g-e{background:var(--ns-e)}.kp-grade.g-unknown{background:#cfc4be;color:#5a4d47}
.kp-text{font-size:.95rem;color:var(--ink-2);margin:8px 0;line-height:1.6}
.kp-text p{margin:0 0 8px}.kp-text p:last-child{margin:0}
.kp-text a{color:var(--orange-dark);font-weight:600;text-decoration:underline;text-underline-offset:3px}
.kp-text.t-warning{padding:14px 18px;border-radius:14px;background:var(--red-soft);border-left:4px solid var(--red)}
.kp-text.t-notes,.kp-text.t-note{font-size:.85rem;color:var(--muted)}
.kp-text.t-summary{font-weight:500;color:var(--ink)}
.kp-text ul{padding-left:20px;margin:6px 0}
.kp-group{margin-top:18px}
.kp-group>h3{font-size:1.05rem;margin-bottom:6px}
.kp-img{margin:12px 0;border-radius:12px;max-height:280px;width:auto}
.kp-table{overflow:auto;margin:12px 0}
.kp-table .nutri-table{min-width:420px}
.kp-table td.ev-good{color:var(--green-dark);font-weight:600}.kp-table td.ev-bad{color:#b83232;font-weight:600}.kp-table td.ev-average{color:#a35f00;font-weight:600}
.kp-table td img{height:18px;display:inline;vertical-align:middle;margin-right:6px}
.kp-action{margin:10px 0}
.kp-map{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;background:var(--blue-soft);margin:12px 0;font-size:.92rem;color:var(--ink-2)}
.kp-map svg{width:22px;height:22px;color:var(--blue);flex:none}
.kp-source{font-size:.8rem;color:var(--muted);margin-top:6px}
.kp-source a{text-decoration:underline}
.kp-src-panel{font-size:.8rem;color:var(--muted);margin-top:4px}
.pp-skel{display:grid;gap:14px}
.pp-skel i{display:block;height:20px;border-radius:8px}
.pp-empty{text-align:center;padding:72px 20px 80px;max-width:720px;margin:0 auto}
.pp-empty .pp-code{display:inline-block;font-family:var(--font-head);font-weight:800;font-size:clamp(2rem,6vw,3.4rem);letter-spacing:.06em;color:var(--brand);background:#fff;border:2px dashed var(--beige);padding:18px 30px;border-radius:20px;margin:26px 0 8px}
.pp-empty h1{font-size:clamp(2rem,4.5vw,3.2rem);margin-top:18px}
.pp-empty .lead{margin:16px auto 0}
.pp-todo{counter-reset:todo;display:grid;gap:10px;margin:18px 0 0;padding:0;list-style:none}
.pp-todo li{display:grid;grid-template-columns:44px 1fr auto;gap:14px;align-items:center;padding:14px 16px;border:1px solid var(--line-2);border-radius:14px;background:#fff}
.pp-todo li::before{counter-increment:todo;content:counter(todo);width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:var(--orange-soft);color:var(--orange-dark);font-family:var(--font-head);font-weight:800;font-size:1.3rem}
.pp-todo li.done{opacity:.7}.pp-todo li.done::before{content:"✓";background:var(--green-soft);color:var(--green-dark)}
.pp-todo li.done b{text-decoration:line-through}
.pp-todo b{display:block;color:var(--brand);font-size:1rem}
.pp-todo small{display:block;color:var(--ink-2);font-size:.85rem;margin-top:2px}
.pp-todo .dur{font-family:var(--font-head);font-weight:800;font-size:1.1rem;color:var(--orange-dark);white-space:nowrap}
.pp-todo .dur svg{width:22px;height:22px}
.pp-todo .dur small{font-size:.75rem;color:var(--muted);font-weight:600;text-align:right;margin:0}
@media(max-width:480px){.pp-todo li{grid-template-columns:36px 1fr}.pp-todo li::before{width:36px;height:36px;font-size:1.05rem}.pp-todo .dur{grid-column:2}}
.pp-bignum{font-family:var(--font-head);font-weight:800;font-size:clamp(2.4rem,4vw,3.2rem);line-height:1;color:var(--brand);letter-spacing:-.03em}
.pp-bignum em{font-style:normal;font-size:1.1rem;color:var(--muted);margin-left:4px}
`;
  function injectCss() {
    if (document.getElementById("pp-css")) return;
    const s = document.createElement("style"); s.id = "pp-css"; s.textContent = CSS; document.head.appendChild(s);
  }

  /* ---------- Utilitaires ---------- */
  function code() { const c = (new URLSearchParams(location.search).get("code") || "").replace(/\D/g, ""); return c || DEFAULT_CODE; }
  function lang() { return OFF.lang || "fr"; }
  function name(p) { return p["product_name_" + lang()] || p.product_name || p.product_name_fr || p.product_name_en || p.generic_name || T("Produit sans nom"); }
  function image(p) {
    const L = lang(), sel = p.selected_images && p.selected_images.front && p.selected_images.front.display;
    return p.image_front_url || p.image_url || (sel && (sel[L] || Object.values(sel)[0])) || "";
  }
  function readable(tag) {
    const s = String(tag || "").replace(/^[a-z]{2,3}:/, "").replace(/[-_]+/g, " ").trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }
  function ago(t) {
    if (!t) return "";
    const d = Math.max(0, Math.round((Date.now() / 1000 - t) / 86400));
    if (d === 0) return T("aujourd'hui");
    if (d === 1) return T("hier");
    if (d < 31) return T("il y a %d jours").replace("%d", d);
    if (d < 365) return T("il y a %d mois").replace("%d", Math.round(d / 30));
    { const y = Math.round(d / 365); return (y === 1 ? T("il y a 1 an") : T("il y a %d ans").replace("%d", y)); }
  }
  function fmtDate(t) { return t ? new Date(t * 1000).toLocaleDateString(OFF.locale || "fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "–"; }
  function vertical(p) {
    const pt = p && p.product_type;
    if (pt === "beauty" || pt === "food" || pt === "product" || pt === "petfood") return pt;
    return (p && p._vertical) || "food";
  }
  function editUrl(c, section) { return `edit.html?code=${c}${section ? "#" + section : ""}`; }
  function skeleton(el, n) { el.innerHTML = `<div class="pp-skel">${Array.from({ length: n || 4 }, (_, i) => `<i class="skeleton" style="width:${[70, 45, 90, 60, 80][i % 5]}%"></i>`).join("")}</div>`; }
  function demoTag() { return `<span class="tag" title="${T("L'API n'a pas répondu : données de démonstration affichées")}">${T("données de démonstration")}</span>`; }

  /* ---------- Tâches déduites des states_tags ---------- */
  const TASKS = [
    { tag: "en:front-photo-to-be-selected", alt: ["en:photos-to-be-uploaded"], label: "Prendre la photo de face", sec: 10, why: "sans elle, le produit est méconnaissable", section: "photos" },
    { tag: "en:nutrition-facts-to-be-completed", label: "Photographier le tableau nutritionnel", sec: 30, why: "débloque le Nutri-Score", section: "nutrition" },
    { tag: "en:ingredients-to-be-completed", label: "Photographier la liste d'ingrédients", sec: 30, why: "débloque allergènes, additifs et NOVA", section: "ingredients" },
    { tag: "en:categories-to-be-completed", label: "Choisir une catégorie plus précise", sec: 10, why: "débloque le Green-Score", section: "categories" },
    { tag: "en:origins-to-be-completed", label: "Indiquer l'origine des ingrédients", sec: 20, why: "affine le Green-Score (transport)", section: "origins" },
    { tag: "en:packaging-to-be-completed", label: "Décrire l'emballage", sec: 30, why: "affine le Green-Score (emballage)", section: "packaging" },
    { tag: "en:labels-to-be-completed", label: "Ajouter les labels (bio, équitable…)", sec: 10, why: "affine le Green-Score", section: "labels" },
    { tag: "en:packaging-code-to-be-completed", label: "Renseigner le code emballeur (EMB)", sec: 20, why: "permet de localiser le fabricant", section: "packaging" },
    { tag: "en:brands-to-be-completed", label: "Indiquer la marque", sec: 5, why: "", section: "brands" },
    { tag: "en:quantity-to-be-completed", label: "Indiquer la quantité", sec: 5, why: "", section: "quantity" },
    { tag: "en:product-name-to-be-completed", label: "Indiquer le nom du produit", sec: 5, why: "", section: "name" },
    { tag: "en:ingredients-photo-to-be-selected", label: "Sélectionner la photo des ingrédients", sec: 10, why: "", section: "ingredients" },
    { tag: "en:nutrition-photo-to-be-selected", label: "Sélectionner la photo du tableau nutritionnel", sec: 10, why: "", section: "nutrition" },
    { tag: "en:packaging-photo-to-be-selected", label: "Sélectionner la photo de l'emballage", sec: 10, why: "", section: "packaging" },
    { tag: "en:expiration-date-to-be-completed", label: "Indiquer la date limite de consommation", sec: 10, why: "", section: "dates" },
    { tag: "en:stores-to-be-completed", label: "Indiquer les magasins", sec: 10, why: "", section: "stores" },
    { tag: "en:countries-to-be-completed", label: "Indiquer le pays de vente", sec: 5, why: "", section: "countries" },
  ];
  function taskMissing(task, p) { const st = p.states_tags || []; return st.includes(task.tag) || (task.alt || []).some(t => st.includes(t)); }
  function tasks(p) { return TASKS.filter(t => taskMissing(t, p)); }
  function taskItem(t, p, done) {
    return `<li class="${done ? "done" : ""}"><div><b>${T(t.label)}</b>${t.why ? `<small>${done ? T("Déjà fait, merci !") : T(t.why)}</small>` : ""}</div><a class="dur" href="${editUrl(p.code, t.section)}">${t.sec} s<small>${done ? T("fait") : T("estimé")}</small></a></li>`;
  }

  /* ---------- Chargement ---------- */
  const cache = {};
  async function load(c) {
    c = c || code();
    const key = `off_pp_${c}_${lang()}`;
    if (cache[c]) return cache[c];
    try { const s = JSON.parse(sessionStorage.getItem(key) || "null"); if (s && Date.now() - s.t < 5 * 60e3) { cache[c] = s.p; return s.p; } } catch (e) { }
    let unavailable = false;
    for (const [v, base] of SERVERS) {
      try {
        const r = await fetch(`${base}/api/v2/product/${c}.json?lc=${lang()}&fields=${FIELDS}`);
        if (r.status === 404) continue;
        if (!r.ok) { unavailable = true; continue; }
        const d = await r.json();
        if (d.status !== 1 || !d.product) continue;
        const p = d.product; p.code = p.code || c; p._vertical = v; p._server = base;
        cache[c] = p;
        try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), p })); } catch (e) { }
        return p;
      } catch (e) { unavailable = true; }
    }
    const err = new Error(unavailable ? "unavailable" : "not_found"); err.code = unavailable ? "unavailable" : "not_found"; throw err;
  }

  /* ---------- Bandeau commun ---------- */
  const I = {
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    cmp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 19V9M12 19V5M20 19v-7"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7.5-4.6-9.5-9.5C1.3 8 3.5 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.5 0 5.7 3.5 4.5 7C19.5 16.4 12 21 12 21Z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5-3 8-7 8-12a8 8 0 1 0-16 0c0 5 3 9 8 12Z"/><path d="M12 22V10"/></svg>',
    hand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="9"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  };
  const TABS = [
    ["overview", "product.html", "Vue d'ensemble", "eye"],
    ["health", "product-health.html", "Santé", "heart"],
    ["environment", "product-environment.html", "Environnement", "leaf"],
    ["contribute", "product-contribute.html", "Contribuer", "hand"],
  ];
  const NSL = { a: "Excellente qualité nutritionnelle", b: "Bonne qualité nutritionnelle", c: "Qualité nutritionnelle moyenne", d: "Qualité nutritionnelle faible", e: "Qualité nutritionnelle très faible" };
  const NVL = { 1: "Aliment non transformé", 2: "Ingrédient culinaire", 3: "Aliment transformé", 4: "Aliment ultra-transformé" };
  const ECL = { "a-plus": "Impact très faible", a: "Impact très faible", b: "Impact faible", c: "Impact modéré", d: "Impact élevé", e: "Impact très élevé" };

  // Ce qui débloque un score absent
  function unlock(kind, p) {
    const st = p.states_tags || [];
    const cat = st.includes("en:categories-to-be-completed");
    if (kind === "ns") {
      if (p.nutriscore_grade === "not-applicable") return { text: "Non applicable à cette catégorie" };
      if (st.includes("en:nutrition-facts-to-be-completed")) return { text: "Photographiez le tableau nutritionnel", section: "nutrition" };
      if (cat) return { text: "Choisissez une catégorie plus précise", section: "categories" };
      return { text: "Complétez la fiche", section: "nutrition" };
    }
    if (kind === "nova") {
      if (st.includes("en:ingredients-to-be-completed")) return { text: "Photographiez les ingrédients", section: "ingredients" };
      if (cat) return { text: "Choisissez une catégorie plus précise", section: "categories" };
      return { text: "Complétez la liste d'ingrédients", section: "ingredients" };
    }
    if (p.ecoscore_grade === "not-applicable") return { text: "Non applicable à cette catégorie" };
    if (cat) return { text: "Choisissez une catégorie plus précise", section: "categories" };
    if (st.includes("en:origins-to-be-completed")) return { text: "Indiquez l'origine des ingrédients", section: "origins" };
    return { text: "Renseignez origines et emballage", section: "packaging" };
  }
  function scoreBox(cls, label, badge, desc, u, c) {
    const d = u ? (u.section ? `<a class="unlock" href="${editUrl(c, u.section)}">${T(u.text)}</a>` : `<span style="font-size:.85rem;color:var(--ink-2)">${T(u.text)}</span>`) : `<span style="font-size:.85rem;color:var(--ink-2)">${desc}</span>`;
    return `<div class="score-box ${cls}"><small>${label}</small><div class="val">${badge}</div>${d}</div>`;
  }
  function scoresHtml(p) {
    const v = vertical(p), c = p.code;
    const labelTags = (p.labels_tags || []);
    const goodLabel = t => /organic|bio|fair-trade|fairtrade|cosmos|ecocert|vegan|cruelty-free|natrue|fsc|energy-star|repairable/.test(t);
    const labels = labelTags.length ? `<div class="row" style="gap:8px;margin-top:12px">${labelTags.slice(0, 8).map(t => `<span class="tag ${goodLabel(t) ? "ok" : ""}">${esc(readable(t))}</span>`).join("")}</div>` : `<div class="row" style="gap:8px;margin-top:12px"><span class="tag">${T("Aucun label renseigné")}</span> <a href="${editUrl(c, "labels")}" style="font-size:.85rem;font-weight:600;color:var(--orange-dark)">${T("Ajouter un label")}</a></div>`;
    if (v === "beauty") return `<div class="pp-noscore"><b>${T("Pas de score officiel pour les cosmétiques")}</b><p>${T("Il n'existe pas encore d'équivalent du Nutri-Score pour la beauté. Nous affichons les labels vérifiés (bio, équitable, végan…) et la liste d'ingrédients.")}</p>${labels}</div>`;
    if (v === "product" || v === "petfood") return `<div class="pp-noscore"><b>${T("Indice de réparabilité : non applicable")}</b><p>${T("Cet article n'entre pas dans le champ des scores alimentaires. Les labels et informations d'emballage restent utiles à la communauté.")}</p>${labels}</div>`;
    const g = p.nutriscore_grade, nv = p.nova_group, ec = p.ecoscore_grade;
    const gOk = g && "abcde".includes(g), ecOk = ec && ["a-plus", "a", "b", "c", "d", "e"].includes(ec);
    return `<div class="score-row">
      ${scoreBox(gOk ? g : "unknown", "Nutri-Score", OFF.ns(g, 1), gOk ? T(NSL[g]) : "", gOk ? null : unlock("ns", p), c)}
      ${scoreBox(nv == 4 ? "nova4" : nv == 1 ? "a" : nv ? "c" : "unknown", T("Transformation"), OFF.nova(nv, 1), nv ? T(NVL[nv]) : "", nv ? null : unlock("nova", p), c)}
      ${scoreBox(ecOk ? (ec === "a-plus" ? "a" : ec) : "unknown", T("Environnement"), OFF.eco(ec, 1), ecOk ? T(ECL[ec]) : "", ecOk ? null : unlock("eco", p), c)}
    </div>`;
  }
  function subnavHtml(c, active) {
    return `<div class="subnav pp-subnav"><div class="container">${TABS.map(([id, href, lab, ic]) => `<a href="${href}?code=${c}" class="${id === active ? "active" : ""}" ${id === active ? 'aria-current="page"' : ""}>${I[ic]} ${T(lab)}</a>`).join("")}</div></div>`;
  }
  function renderHeader(p, container, activeTab, opts) {
    injectCss(); opts = opts || {};
    const c = p.code || code(), n = name(p), img = image(p), v = vertical(p);
    const comp = Math.round((p.completeness || 0) * 100);
    const vTag = v === "beauty" ? `<span class="tag info">Open Beauty Facts</span>` : v === "product" ? `<span class="tag info">Open Products Facts</span>` : v === "petfood" ? `<span class="tag info">Open Pet Food Facts</span>` : "";
    const imgHtml = opts.noImage ? "" : (img
      ? `<div class="pp-img"><img src="${esc(img)}" alt="${esc(n)}"></div>`
      : `<div class="pp-img empty">${I.camera}<span>${T("Pas encore d'image")}</span><a href="${editUrl(c, "photos")}">${T("Ajouter une photo")}</a></div>`);
    container.innerHTML = `<div class="pp-head ${opts.noImage ? "no-img" : ""}">${imgHtml}<div>
      <div class="row" style="gap:8px;margin-bottom:12px">${comp >= 80 ? `<span class="tag ok">✓ ${T("Fiche complète")}</span>` : `<span class="tag warn">${T("Fiche à compléter")} · ${comp} %</span>`}${p.last_modified_t ? `<span class="tag">${T("Modifié")} ${ago(p.last_modified_t)}</span>` : ""}${vTag}${opts.demo ? demoTag() : ""}</div>
      <h1 class="product-head" id="pp-name" style="font-size:clamp(1.8rem,3.5vw,2.6rem)">${esc(n)}</h1>
      <div class="product-meta"><span>${T("Marque")} <b>${esc(OFF.brandOf ? OFF.brandOf(p) || "–" : p.brands || "–")}</b></span><span>${T("Quantité")} <b>${esc(p.quantity || "–")}</b></span><span>${T("Code-barres")} <b>${esc(c)}</b></span>${p.countries ? `<span>${T("Vendu en")} <b>${esc(String(p.countries).replace(/[a-z]{2}:/g, ""))}</b></span>` : ""}</div>
      <div class="pp-match">${OFF.prefs ? OFF.prefs.badge(p, true) : ""}<a href="preferences.html">${T("Modifier vos préférences")}</a></div>
      ${scoresHtml(p)}
      <div class="product-actions">
        <a class="btn btn-primary" href="${editUrl(c)}">${I.pen} ${T("Modifier")}</a>
        <a class="btn btn-outline" href="#">${I.tag} ${T("Ajouter un prix")}</a>
        <a class="btn btn-outline" href="compare.html?codes=${c}">${I.cmp} ${T("Comparer")}</a>
        <a class="btn btn-ghost" href="#">${I.list} ${T("Ajouter à une liste")}</a>
      </div>
    </div></div>`;
    const sn = opts.subnav || document.getElementById("pp-subnav");
    const html = subnavHtml(c, activeTab);
    if (sn) sn.innerHTML = html; else container.insertAdjacentHTML("beforeend", html);
    document.title = `${n}${p.brands ? " – " + (OFF.brandOf ? OFF.brandOf(p) : p.brands) : ""} | Open Food Facts`;
    // liens "#" -> toast (OFF.mount ne les a câblés qu'au chargement)
    container.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener("click", e => { e.preventDefault(); OFF.toast(T("Maquette : lien non câblé")); }));
  }

  /* ---------- Moteur de rendu des knowledge panels ---------- */
  function fixLinks(el, p) {
    const base = (p && p._server) || "https://world.openfoodfacts.org";
    el.querySelectorAll("a[href]").forEach(a => {
      const h = a.getAttribute("href") || "";
      if (h.startsWith("/")) a.setAttribute("href", base + h);
      if (/^https?:/.test(a.getAttribute("href"))) { a.target = "_blank"; a.rel = "noopener"; }
    });
    el.querySelectorAll("img").forEach(i => { i.loading = "lazy"; });
  }
  const ACTION_SECTION = { add_categories: "categories", add_ingredients_image: "ingredients", add_ingredients_text: "ingredients", add_nutrition_facts: "nutrition", add_nutrition_facts_image: "nutrition", add_origins: "origins", add_labels: "labels", add_packaging_image: "packaging", add_packaging_components: "packaging", add_packaging_text: "packaging", add_stores: "stores", add_countries: "countries", add_brands: "brands", add_quantity: "quantity", add_emb_codes: "packaging", add_front_image: "photos" };
  // image d'un panel : {url} ou {sizes:{100,200,400,full:{url}}}
  function imgUrl(im) {
    if (!im) return "";
    if (im.url) return im.url;
    const sz = im.sizes || {}; const pick = sz["400"] || sz["200"] || sz.full || Object.values(sz)[0];
    return pick && pick.url ? pick.url : "";
  }
  function titleHtml(te, big) {
    if (!te) return "";
    const grade = te.grade ? String(te.grade).toLowerCase() : "";
    const icon = te.icon_url ? `<img class="kp-icon ${te.type === "grade" ? "big" : ""}" src="${esc(te.icon_url)}" alt="">` : (grade ? `<span class="kp-grade g-${esc(grade)}">${grade === "unknown" ? "?" : grade.toUpperCase().replace("-PLUS", "+")}</span>` : "");
    return `${icon}<div><div class="kp-t">${esc(te.title || te.name || "")}</div>${te.subtitle ? `<div class="kp-st">${esc(te.subtitle)}</div>` : ""}</div>`;
  }
  function elementHtml(e, kp, p, depth, seen) {
    if (!e || !e.element_type) return "";
    switch (e.element_type) {
      case "text": {
        const t = e.text_element || {}; const html = t.html || (t.text ? esc(t.text) : "");
        if (!html) return "";
        const src = t.source_text || t.source_url ? `<div class="kp-source">${T("Source :")} ${t.source_url ? `<a href="${esc(t.source_url)}">${esc(t.source_text || t.source_url)}</a>` : esc(t.source_text)}</div>` : "";
        return `<div class="kp-text t-${esc(t.type || "default")}">${html}</div>${src}`;
      }
      case "panel": return panelHtml((e.panel_element || {}).panel_id, kp, p, depth, seen);
      case "panel_group": {
        const g = e.panel_group_element || {};
        const u = imgUrl(g.image);
        const img = u ? `<img class="kp-img" src="${esc(u)}" alt="${esc(g.image.alt || "")}">` : "";
        const ico = g.icon_url ? `<img class="kp-icon" src="${esc(g.icon_url)}" alt="" style="height:22px;vertical-align:middle;margin-right:8px">` : "";
        return `<div class="kp-group ${g.evaluation ? "ev-" + esc(g.evaluation) : ""}">${g.title ? `<h3>${ico}${esc(g.title)}</h3>` : ""}${img}${(g.panel_ids || []).map(id => panelHtml(id, kp, p, depth, seen)).join("")}</div>`;
      }
      case "table": {
        const t = e.table_element || {}; const cols = t.columns || [], rows = t.rows || [];
        if (!rows.length) return "";
        // colonnes masquées par défaut (ex. comparaisons) : ignorées, ainsi que leurs cellules
        const keep = cols.length ? cols.map(c => c.shown_by_default !== false) : null;
        const cells = arr => keep ? arr.filter((_, i) => keep[i] !== false) : arr;
        const raw = v => String(v ?? ""); // HTML fourni par le serveur (déjà traduit)
        return `<div class="kp-table">${t.title ? `<h3 style="font-size:1rem;margin:12px 0 8px">${esc(t.title)}</h3>` : ""}<table class="nutri-table">${cols.length ? `<thead><tr>${cells(cols).map((c, i) => `<th ${i ? 'style="text-align:right"' : ""}>${raw(c.text)}</th>`).join("")}</tr></thead>` : ""}<tbody>${rows.map(r => `<tr>${cells(r.values || []).map((v, i) => `<td class="${i ? "num" : ""} ${v.evaluation ? "ev-" + esc(v.evaluation) : ""} ${v.level ? "sub" : ""}">${v.icon_url ? `<img src="${esc(v.icon_url)}" alt="">` : ""}${raw(v.text)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      }
      case "image": {
        const im = e.image_element || {}; const u = imgUrl(im); if (!u) return "";
        const img = `<img class="kp-img" src="${esc(u)}" alt="${esc(im.alt || "")}">`;
        const src = im.source_text || im.source_url ? `<div class="kp-source">${im.source_url ? `<a href="${esc(im.source_url)}">${esc(im.source_text || im.source_url)}</a>` : esc(im.source_text)}</div>` : "";
        return (im.link_url ? `<a href="${esc(im.link_url)}">${img}</a>` : img) + src;
      }
      case "action": {
        const a = e.action_element || {}; const act = (a.actions || [])[0] || "";
        return `<div class="kp-action"><a class="btn btn-outline btn-sm" href="${editUrl(p.code, ACTION_SECTION[act] || "")}">${I.pen} ${a.html || esc(readable(act))}</a></div>`;
      }
      case "map": {
        const pts = ((e.map_element || {}).pointers || []).filter(x => x.geo);
        if (!pts.length) return "";
        const g = pts[0].geo;
        return `<div class="kp-map">${I.map}<div><b>${pts.length} ${T(pts.length > 1 ? "lieux géolocalisés" : "lieu géolocalisé")}</b>${pts[0].text ? ` · ${esc(pts[0].text)}` : ""}<br><a href="https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=8/${g.lat}/${g.lng}" style="text-decoration:underline">${T("Voir sur OpenStreetMap")}</a></div></div>`;
      }
      default: return ""; // type inconnu : ignoré
    }
  }
  function panelHtml(id, kp, p, depth, seen) {
    const k = id && kp[id]; if (!k || seen.has(id) || depth > 8) return "";
    seen.add(id);
    const te = k.title_element, body = (k.elements || []).map(e => elementHtml(e, kp, p, depth + 1, seen)).join("");
    seen.delete(id);
    if (!body && !te) return "";
    const cls = `kp ${k.level ? "lv-" + esc(k.level) : ""} ${k.evaluation ? "ev-" + esc(k.evaluation) : ""}`;
    if (depth === 0) return body; // la carte racine : on ne répète pas son titre (la page le porte)
    if (!te || !(te.title || te.name)) return body ? `<div class="kp"><div class="kp-body" style="padding-top:12px">${body}</div></div>` : "";
    if (!body) return `<div class="${cls}"><div class="kp-hd">${titleHtml(te)}</div></div>`;
    if (k.expanded === false) return `<details class="${cls}"><summary>${titleHtml(te)}</summary><div class="kp-body">${body}</div></details>`;
    return `<div class="${cls}"><div class="kp-hd">${titleHtml(te)}</div><div class="kp-body">${body}</div></div>`;
  }
  function renderPanel(panelId, p, container) {
    injectCss();
    const kp = (p && p.knowledge_panels) || {};
    if (!kp[panelId]) { container.innerHTML = ""; return false; }
    container.innerHTML = panelHtml(panelId, kp, p, 0, new Set());
    fixLinks(container, p);
    return !!container.innerHTML.trim();
  }
  function panelTitle(panelId, p) { const k = p && p.knowledge_panels && p.knowledge_panels[panelId]; return k && k.title_element ? k.title_element.title : ""; }

  /* ---------- État "produit inconnu" (plein écran) ---------- */
  function unknownHtml(c) {
    return `<div class="container pp-empty">
      <span class="eyebrow">${T("Produit inconnu")}</span>
      <h1>${T("Nous ne connaissons pas encore ce produit !")}</h1>
      <p class="lead">${T("Vous avez découvert un nouvel article. Soyez celle ou celui qui l'ajoute.")}</p>
      <div class="pp-code" aria-label="${T("Code-barres")}">${esc(c)}</div>
      <p class="muted" style="font-size:.9rem">${T("Code-barres recherché sur Open Food Facts, Open Beauty Facts et Open Products Facts.")}</p>
      <div class="row" style="justify-content:center;gap:12px;margin-top:28px">
        <a class="btn btn-primary btn-lg" href="edit.html?code=${esc(c)}&new=1">${I.hand} ${T("Ajouter ce produit")}</a>
        <a class="btn btn-outline btn-lg" href="search.html">${T("Chercher autre chose")}</a>
      </div>
    </div>`;
  }
  function renderUnknown(c, container) { injectCss(); container.innerHTML = unknownHtml(c); }

  /* ---------- Repli statique (Nutella) si l'API ne répond pas ---------- */
  const DEMO = {
    code: DEFAULT_CODE, _vertical: "food", _demo: true, product_type: "food", product_name: "Nutella", brands: "Ferrero", quantity: "400 g", countries: "France, Belgique, Suisse, Allemagne, Italie, Espagne",
    image_front_url: "https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.879.400.jpg",
    image_ingredients_url: "https://images.openfoodfacts.org/images/products/301/762/042/2003/ingredients_en.821.400.jpg",
    image_nutrition_url: "https://images.openfoodfacts.org/images/products/301/762/042/2003/nutrition_en.822.400.jpg",
    nutriscore_grade: "e", nova_group: 4, ecoscore_grade: "d", ecoscore_score: 30, completeness: .95, last_modified_t: Math.round(Date.now() / 1000) - 3 * 86400, created_t: 1331900000, creator: "kiliweb",
    editors_tags: ["kiliweb", "moon-rabbit", "segundo", "teolemon", "openfoodfacts-contributors", "packbot", "yuka.sY2b0xO6T85zoF3NwEKvlmxuYNfml0PCJRLeq2Sd_ISefLK6AZAwyqrWEqo", "roboto-app", "scanbot", "date-limite-app", "kiliweb-bot", "prepperapp", "inf", "quechoisir", "musarana", "smoothie-app", "tacite", "ecoscore-impact-estimator", "stephane", "aleene"],
    states_tags: ["en:complete", "en:nutrition-facts-completed", "en:ingredients-completed", "en:categories-completed", "en:front-photo-selected", "en:origins-to-be-completed", "en:packaging-code-to-be-completed"],
    data_quality_warnings_tags: ["en:nutrition-value-very-high-for-category-sugars", "en:ecoscore-origins-of-ingredients-origins-are-100-percent-unknown"], data_quality_errors_tags: [],
    categories: "Petit-déjeuners, Produits à tartiner, Pâtes à tartiner, Pâtes à tartiner sucrées, Pâtes à tartiner aux noisettes et au cacao", categories_tags: ["en:breakfasts", "en:spreads", "en:sweet-spreads", "en:hazelnut-spreads", "en:cocoa-and-hazelnuts-spreads"],
    labels: "Végétarien, Sans gluten, Triman", labels_tags: ["en:vegetarian", "en:no-gluten", "fr:triman"], stores: "Carrefour, Leclerc, Auchan, Intermarché", origins: "", emb_codes: "", manufacturing_places: "Villers-Écalles (France)",
    ingredients_text: "Sucre, huile de palme, NOISETTES 13 %, cacao maigre 7,4 %, LAIT écrémé en poudre 6,6 %, LACTOSÉRUM en poudre, émulsifiants : lécithines [SOJA], vanilline. Sans gluten.",
    allergens: "en:milk, en:nuts, en:soybeans", allergens_tags: ["en:milk", "en:nuts", "en:soybeans"], traces_tags: [], additives_tags: ["en:e322", "en:e322i"], additives_n: 2,
    ingredients_analysis_tags: ["en:palm-oil", "en:vegetarian", "en:maybe-vegan"], nutrient_levels: { fat: "high", "saturated-fat": "high", sugars: "high", salt: "low" },
    nutriments: { "energy-kcal_100g": 539, fat_100g: 30.9, "saturated-fat_100g": 10.6, carbohydrates_100g: 57.5, sugars_100g: 56.3, fiber_100g: 0, proteins_100g: 6.3, salt_100g: .107 },
    serving_size: "15 g", serving_quantity: 15,
    packagings: [{ shape: "en:jar", material: "en:glass", recycling: "en:recycle", number_of_units: 1 }, { shape: "en:lid", material: "en:plastic", recycling: "en:recycle", number_of_units: 1 }, { shape: "en:seal", material: "en:aluminium", recycling: "en:recycle", number_of_units: 1 }],
    ecoscore_data: { agribalyse: { co2_total: 2.97, co2_agriculture: 2.43, co2_processing: .27, co2_packaging: .18, co2_transportation: .06, co2_distribution: .02, co2_consumption: 0, name_fr: "Pâte à tartiner aux noisettes et au cacao" }, adjustments: { origins_of_ingredients: { value: -5 }, packaging: { value: -6 }, production_system: { value: 0 }, threatened_species: { value: -10 } } },
  };
  OFF.productPage = { DEMO, DEFAULT_CODE, FIELDS, TASKS, I, T, load, renderHeader, renderPanel, renderUnknown, panelTitle, code, name, image, readable, ago, fmtDate, vertical, editUrl, skeleton, demoTag, tasks, taskMissing, taskItem, fixLinks, injectCss };
})();
