/* Open Food Facts – refonte : préférences alimentaires (stockées dans le navigateur)
   et calcul du "score de correspondance" d'un produit avec ces préférences.
   Même logique que les attributs de l'app officielle, simplifiée. */
(function () {
  const KEY = "off_prefs";
  // importance : 0 = pas important, 1 = important, 2 = très important, 3 = obligatoire
  const CRITERIA = [
    { id: "nutriscore", group: "Qualité nutritionnelle", label: "Bonne qualité nutritionnelle (Nutri-Score)" },
    { id: "salt", group: "Qualité nutritionnelle", label: "Sel en faible quantité" },
    { id: "sugars", group: "Qualité nutritionnelle", label: "Sucres en faible quantité" },
    { id: "fat", group: "Qualité nutritionnelle", label: "Matières grasses en faible quantité" },
    { id: "saturated-fat", group: "Qualité nutritionnelle", label: "Graisses saturées en faible quantité" },
    { id: "nova", group: "Transformation", label: "Aliment peu ou pas transformé (groupe NOVA)" },
    { id: "additives", group: "Transformation", label: "Sans ou avec peu d'additifs" },
    { id: "gluten", group: "Allergènes", label: "Sans gluten", allergen: "en:gluten" },
    { id: "milk", group: "Allergènes", label: "Sans lait", allergen: "en:milk" },
    { id: "eggs", group: "Allergènes", label: "Sans œufs", allergen: "en:eggs" },
    { id: "nuts", group: "Allergènes", label: "Sans fruits à coque", allergen: "en:nuts" },
    { id: "peanuts", group: "Allergènes", label: "Sans arachides", allergen: "en:peanuts" },
    { id: "sesame", group: "Allergènes", label: "Sans sésame", allergen: "en:sesame-seeds" },
    { id: "soybeans", group: "Allergènes", label: "Sans soja", allergen: "en:soybeans" },
    { id: "celery", group: "Allergènes", label: "Sans céleri", allergen: "en:celery" },
    { id: "mustard", group: "Allergènes", label: "Sans moutarde", allergen: "en:mustard" },
    { id: "lupin", group: "Allergènes", label: "Sans lupin", allergen: "en:lupin" },
    { id: "fish", group: "Allergènes", label: "Sans poisson", allergen: "en:fish" },
    { id: "crustaceans", group: "Allergènes", label: "Sans crustacés", allergen: "en:crustaceans" },
    { id: "molluscs", group: "Allergènes", label: "Sans mollusques", allergen: "en:molluscs" },
    { id: "sulphites", group: "Allergènes", label: "Sans sulfites", allergen: "en:sulphur-dioxide-and-sulphites" },
    { id: "vegan", group: "Ingrédients", label: "Végan" },
    { id: "vegetarian", group: "Ingrédients", label: "Végétarien" },
    { id: "palm-oil-free", group: "Ingrédients", label: "Sans huile de palme" },
    { id: "organic", group: "Labels", label: "Agriculture biologique", label_tag: "en:organic" },
    { id: "fair-trade", group: "Labels", label: "Commerce équitable", label_tag: "en:fair-trade" },
    { id: "ecoscore", group: "Environnement", label: "Faible impact environnemental (Green-Score)" },
    { id: "forest-footprint", group: "Environnement", label: "Faible risque de déforestation" },
  ];
  const IMPORTANCE = ["Pas important", "Important", "Très important", "Obligatoire"];
  const DEFAULT = { nutriscore: 2, ecoscore: 1, nova: 1 };

  function get() { try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(KEY) || "null") || {}); } catch (e) { return Object.assign({}, DEFAULT); } }
  function set(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { } }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) { } }
  function active() { const p = get(); return CRITERIA.filter(c => (p[c.id] || 0) > 0).map(c => Object.assign({ importance: p[c.id] }, c)); }

  const GRADE = { "a-plus": 100, a: 100, b: 80, c: 60, d: 40, e: 20, f: 0 };
  const LEVEL = { low: 100, moderate: 50, high: 0 };
  // renvoie un score 0-100, ou null si inconnu
  function attr(c, p) {
    const tags = p.ingredients_analysis_tags || [], al = p.allergens_tags || [], tr = p.traces_tags || [], labels = p.labels_tags || [], nl = p.nutrient_levels || {};
    switch (c.id) {
      case "nutriscore": return GRADE[p.nutriscore_grade] ?? null;
      case "ecoscore": return GRADE[p.ecoscore_grade] ?? null;
      case "nova": return p.nova_group ? { 1: 100, 2: 75, 3: 50, 4: 25 }[p.nova_group] : null;
      case "additives": return p.additives_n == null ? null : Math.max(0, 100 - 25 * p.additives_n);
      case "salt": case "sugars": case "fat": case "saturated-fat": return nl[c.id] ? LEVEL[nl[c.id]] : null;
      case "vegan": return tags.includes("en:vegan") ? 100 : tags.includes("en:non-vegan") ? 0 : tags.includes("en:maybe-vegan") ? 50 : null;
      case "vegetarian": return tags.includes("en:vegetarian") ? 100 : tags.includes("en:non-vegetarian") ? 0 : tags.includes("en:maybe-vegetarian") ? 50 : null;
      case "palm-oil-free": return tags.includes("en:palm-oil-free") ? 100 : tags.includes("en:palm-oil") ? 0 : tags.includes("en:may-contain-palm-oil") ? 50 : null;
      case "organic": case "fair-trade": return labels.includes(c.label_tag) ? 100 : 0;
      case "forest-footprint": return p.forest_footprint_data ? (p.forest_footprint_data.grade === "a" ? 100 : 40) : null;
      default:
        if (c.allergen) { if (!p.ingredients_text && !al.length) return null; return al.includes(c.allergen) ? 0 : tr.includes(c.allergen) ? 20 : 100; }
        return null;
    }
  }
  const W = [0, 1, 2, 4];
  function score(p) {
    const crit = active(); if (!crit.length) return { pct: null, status: "none", label: "Aucun critère", details: [] };
    let sum = 0, wsum = 0, mandatoryFail = false, unknown = 0;
    const details = crit.map(c => {
      const v = attr(c, p);
      if (v == null) { unknown++; return Object.assign({ value: null }, c); }
      if (c.importance === 3 && v < 50) mandatoryFail = true;
      sum += v * W[c.importance]; wsum += W[c.importance];
      return Object.assign({ value: v }, c);
    });
    if (mandatoryFail) return { pct: 0, status: "does_not_match", label: "Ne correspond pas", details };
    if (!wsum) return { pct: null, status: "unknown", label: "Données insuffisantes", details };
    const pct = Math.round(sum / wsum);
    const status = pct >= 75 ? "very_good" : pct >= 50 ? "good" : pct >= 25 ? "poor" : "very_poor";
    const label = { very_good: "Très bonne correspondance", good: "Bonne correspondance", poor: "Faible correspondance", very_poor: "Très faible correspondance" }[status];
    return { pct, status, label: unknown ? label + " (données partielles)" : label, details, unknown };
  }
  // pastille HTML "xx % · label"
  function badge(p, lg) {
    const s = score(p); const T = (window.OFF && OFF.t) ? OFF.t : x => x;
    const col = { very_good: "var(--ns-a)", good: "var(--ns-b)", poor: "var(--ns-d)", very_poor: "var(--ns-e)", does_not_match: "var(--ns-e)", unknown: "#cfc4be", none: "#cfc4be" }[s.status];
    return `<span class="match ${lg ? "lg" : ""}" style="--c:${col}" title="${T(s.label)}"><b>${s.pct == null ? "?" : s.pct + " %"}</b><span>${T(s.label)}</span></span>`;
  }
  const FIELDS = "nutriscore_grade,ecoscore_grade,nova_group,additives_n,nutrient_levels,ingredients_analysis_tags,allergens_tags,traces_tags,labels_tags,ingredients_text";
  window.OFF = window.OFF || {};
  OFF.prefs = { CRITERIA, IMPORTANCE, DEFAULT, get, set, reset, active, score, badge, FIELDS };
})();
