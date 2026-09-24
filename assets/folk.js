/* Open Food Facts - refonte : helpers Folksonomy (propriétés libres) et historique.
   Partagé par properties.html, property.html, product-properties.html, changes.html. */
(function () {
  const FOLK = "https://api.folksonomy.openfoodfacts.org";
  const API = "https://world.openfoodfacts.org";

  /* ---- Libellés lisibles (FR) ---- */
  const GROUPS = {
    packaging: "Emballage", weight: "Poids", data_quality: "Qualité des données", nutrition_facts: "Valeurs nutritionnelles",
    evolutions: "Évolutions du produit", conservation: "Conservation", ingredient_list: "Liste d'ingrédients", ingredients: "Ingrédients",
    has_funny_barcode: "Code-barres inhabituel", storage_conditions: "Conditions de conservation", producer_information: "Informations producteur",
    contact: "Contact", importer_information: "Importateur", instructions: "Instructions", can_be_opened_with: "Ouverture",
    same_product: "Même produit", new_picture_needed: "Nouvelle photo nécessaire", barcode_conflict: "Conflit de code-barres",
    deutsch_einwegpfand: "Consigne allemande (Einwegpfand)", deutsch_einwegpfand_preis_euro: "Montant de la consigne (€)", reformulated: "Produit reformulé",
    color: "Couleur", producer_data_issue: "Problème de données producteur", model_name: "Nom du modèle",
    france: "Indice de réparabilité (France)", consumer_electronics: "Électronique grand public", allergens: "Allergènes", taste: "Goût",
    price: "Prix", origin: "Origine", certification: "Certification", energy: "Énergie", recycling: "Recyclage", vegan: "Végan",
    distributor_information: "Informations distributeur", brand_owner: "Propriétaire de la marque", labels: "Labels", size: "Taille", material: "Matériau",
  };
  const KEYS = {
    "conservation:shelf_life": "Durée de conservation", "conservation:date_type": "Type de date limite", "weight:net": "Poids net",
    "weight:net:g": "Poids net (g)", "weight:net:source": "Source du poids net", "weight:drained": "Poids égoutté", "weight:gross": "Poids brut",
    "packaging:has_character": "Emballage avec personnage", "nutrition_facts:multiple": "Plusieurs tableaux nutritionnels", "nutrition_facts:changed": "Valeurs nutritionnelles modifiées",
    "ingredient_list:multiple": "Plusieurs listes d'ingrédients", "ingredients:garlic": "Contient de l'ail", "data_quality:robotoff_issue": "Problème signalé par Robotoff",
    "data_quality:robotoff_issue:product_version": "Version du produit (Robotoff)", "data_quality:product_opener_issue": "Problème Product Opener",
    "producer_data_issue:from_sent_data": "Problème dans les données envoyées", "contact:website": "Site web", "contact:phone": "Téléphone", "contact:whatsapp": "WhatsApp",
    "contact:email": "E-mail", "storage_conditions": "Conditions de conservation", "producer_information": "Informations producteur", "importer_information": "Importateur",
    "instructions": "Instructions", "france:reparability_index:score": "Indice de réparabilité", "france:reparability_index:calculation_date": "Date de calcul de l'indice",
  };
  const LANGS = new Set("aa,ab,af,ar,az,be,bg,bn,bs,ca,cs,cy,da,de,el,en,eo,es,et,eu,fa,fi,fr,ga,gl,he,hi,hr,hu,hy,id,is,it,ja,ka,kk,ko,ku,la,lb,lt,lv,mk,mn,ms,mt,nb,ne,nl,nn,no,pl,pt,ro,ru,sk,sl,sq,sr,sv,sw,ta,th,tr,uk,ur,uz,vi,zh".split(","));
  const LANG_NAMES = { fr: "français", en: "anglais", de: "allemand", es: "espagnol", it: "italien", he: "hébreu", nl: "néerlandais", pt: "portugais", pl: "polonais", ru: "russe", ar: "arabe", ja: "japonais", zh: "chinois", tr: "turc", sv: "suédois", da: "danois", fi: "finnois", cs: "tchèque", ro: "roumain", hu: "hongrois", el: "grec", uk: "ukrainien", bg: "bulgare", sk: "slovaque", sl: "slovène", hr: "croate", ca: "catalan", nb: "norvégien", no: "norvégien", ko: "coréen", th: "thaï", vi: "vietnamien", id: "indonésien" };
  const NONFOOD = /^(france:reparability_index|consumer_electronics|model_name|producer_data_issue)/;

  const t = s => (window.OFF && window.OFF.t) ? window.OFF.t(s) : s;
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const human = s => cap(String(s || "").replace(/_/g, " "));

  function lang(k) { const m = /:([a-z]{2})$/.exec(k); return m && LANGS.has(m[1]) ? m[1] : ""; }
  function base(k) { const l = lang(k); return l ? k.slice(0, -3) : k; }
  function groupOf(k) { const i = k.indexOf(":"); return i < 0 ? k : k.slice(0, i); }
  function groupLabel(g) { return t(GROUPS[g] || human(g)); }
  function label(k) {
    const b = base(k);
    if (KEYS[b]) return t(KEYS[b]);
    const g = groupOf(b);
    if (b === g) return t(GROUPS[g] || human(g));
    const rest = b.slice(g.length + 1).split(":").map(human).join(" · ");
    return t(GROUPS[g] || human(g)) + " · " + rest;
  }
  function langName(l) { return t(LANG_NAMES[l] || l.toUpperCase()); }
  function isNonFood(k) { return NONFOOD.test(k); }

  /* ---- Valeurs : durée "12m" → "12 mois" ---- */
  function prettyValue(k, v) {
    const m = /^(\d+)\s*([dwmy])$/i.exec(String(v).trim());
    if (m && /shelf_life|duration|delay/.test(k)) {
      const n = +m[1], u = m[2].toLowerCase();
      const U = { d: ["jour", "jours"], w: ["semaine", "semaines"], m: ["mois", "mois"], y: ["an", "ans"] }[u];
      return `${n} ${t(n > 1 ? U[1] : U[0])}`;
    }
    return "";
  }

  /* ---- Contributeurs ---- */
  const APPS = ["openfoodfacts-dart", "macrofactor", "kiliweb", "yuka", "smoothie-app", "waistline-app", "roboto-app", "date-limite-app", "additives-app-chakib", "allergies-app-chakib", "ecoscore-impact-estimator", "openfoodfacts-contributors", "off.", "scanbot", "foodvisor", "prepperapp", "inf", "elcoco", "halal-app-chakib", "foodrepo", "moon-rabbit", "musarana", "packbot", "org-database-usda"];
  function who(u) {
    u = String(u || "");
    if (/^org-/.test(u)) return { kind: "producer", label: t("compte du producteur"), name: u.replace(/^org-/, "").replace(/-/g, " ") };
    if (/^anonymous-/.test(u)) return { kind: "anon", label: t("anonyme"), name: t("anonyme") };
    if (APPS.some(a => u === a || u.startsWith(a))) return { kind: "app", label: "app", name: u };
    return { kind: "user", label: "", name: u };
  }

  /* ---- Réseau ---- */
  async function json(url, ms = 9000) {
    const c = new AbortController(); const h = setTimeout(() => c.abort(), ms);
    try { const r = await fetch(url, { signal: c.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json(); }
    finally { clearTimeout(h); }
  }
  const keys = () => json(`${FOLK}/keys`, 12000);
  const products = k => json(`${FOLK}/products?k=${encodeURIComponent(k)}`, 12000);
  const stats = k => json(`${FOLK}/products/stats?k=${encodeURIComponent(k)}`, 12000);
  const ofProduct = code => json(`${FOLK}/product/${encodeURIComponent(code)}`);
  async function lite(code, fields) {
    const lc = (window.OFF && window.OFF.lang) || "fr";
    const d = await json(`${API}/api/v2/product/${encodeURIComponent(code)}.json?lc=${lc}&fields=${fields || "code,product_name,product_name_" + lc + ",brands,quantity,image_front_small_url"}`);
    if (d.status !== 1 || !d.product) throw new Error("not found");
    d.product.code = d.product.code || code;
    return d.product;
  }
  function nameOf(p, code) { const L = (window.OFF && window.OFF.lang) || "fr"; return p["product_name_" + L] || p.product_name || p.product_name_fr || p.product_name_en || (t("Produit") + " " + (code || p.code || "")); }

  /* ---- Formats ---- */
  const loc = () => (window.OFF && window.OFF.locale) || "fr-FR";
  const num = n => (+n || 0).toLocaleString(loc());
  function date(x, withTime) {
    const d = typeof x === "number" ? new Date(x * 1000) : new Date(x);
    if (isNaN(d)) return "–";
    return d.toLocaleDateString(loc(), withTime ? { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "long", year: "numeric" });
  }
  function ago(x) {
    const d = typeof x === "number" ? x * 1000 : new Date(x).getTime();
    const s = Math.max(0, (Date.now() - d) / 1000);
    if (s < 3600) return t("il y a") + " " + Math.max(1, Math.round(s / 60)) + " min";
    if (s < 86400) return t("il y a") + " " + Math.round(s / 3600) + " h";
    if (s < 86400 * 30) return t("il y a") + " " + Math.round(s / 86400) + " " + t("j");
    if (s < 86400 * 365) return t("il y a") + " " + Math.round(s / (86400 * 30)) + " " + t("mois");
    return t("il y a") + " " + Math.round(s / (86400 * 365)) + " " + t("ans");
  }

  /* ---- Repli statique : /keys (extrait réel, avril 2026) ---- */
  const KEYS_FALLBACK = [
    ["producer_data_issue", 1907, 152], ["france:reparability_index:company:id", 1499, 16], ["model_name", 1499, 1466], ["france:reparability_index:documentation_score", 1499, 19],
    ["france:reparability_index:spare_parts_availability_score", 1498, 21], ["france:reparability_index:company:id:referential", 1498, 2], ["france:reparability_index:calculation_date", 1498, 118],
    ["france:reparability_index:price_score", 1498, 24], ["france:reparability_index:specific_criteria_score", 1498, 15], ["france:reparability_index:dismantlability_score", 1498, 51],
    ["france:reparability_index:score", 1498, 80], ["france:reparability_index:scoring_details_url", 432, 92], ["consumer_electronics:screen_size", 640, 35], ["consumer_electronics:ram", 512, 12],
    ["producer_data_issue:from_sent_data", 231, 113],
    ["has_funny_barcode", 454, 1], ["packaging:has_character", 372, 2], ["packaging:material", 31, 9], ["packaging:recycling", 22, 4], ["packaging:number_of_units", 14, 6], ["packaging:weight", 10, 8],
    ["weight:net", 150, 65], ["weight:net:source", 72, 5], ["weight:drained", 65, 30], ["weight:net:g", 58, 40], ["weight:gross", 34, 22], ["weight:packaging", 24, 18],
    ["data_quality", 223, 6], ["data_quality:robotoff_issue:product_version", 59, 43], ["data_quality:robotoff_issue", 59, 1], ["data_quality:product_opener_issue", 51, 12], ["data_quality:comment", 1, 1],
    ["nutrition_facts:multiple", 280, 9], ["nutrition_facts:changed", 51, 1], ["nutrition_facts:per_serving", 17, 9],
    ["evolutions", 272, 8], ["conservation:shelf_life", 161, 40], ["conservation:date_type", 82, 4], ["conservation:after_opening", 22, 15],
    ["ingredient_list:multiple", 243, 13], ["ingredient_list:changed", 3, 1], ["ingredients:garlic", 193, 3], ["same_product", 161, 128], ["new_picture_needed", 111, 11],
    ["barcode_conflict", 87, 6], ["deutsch_einwegpfand", 87, 2], ["producer_information:he", 85, 63], ["producer_information:en", 40, 31], ["deutsch_einwegpfand_preis_euro", 70, 3],
    ["storage_conditions:he", 65, 45], ["storage_conditions:en", 38, 20], ["reformulated", 62, 2], ["importer_information:israel:he", 59, 37], ["importer_information:gb", 12, 9],
    ["color", 47, 16], ["contact:phone:israel", 47, 35], ["contact:website", 41, 30], ["contact:whatsapp", 12, 10], ["instructions:he", 30, 28], ["can_be_opened_with", 9, 3],
  ].map(([k, count, values]) => ({ k, count, values }));

  window.OFF = window.OFF || {};
  window.OFF.folk = { FOLK, API, GROUPS, KEYS, KEYS_FALLBACK, lang, langName, base, groupOf, groupLabel, label, isNonFood, prettyValue, who, json, keys, products, stats, ofProduct, lite, nameOf, num, date, ago, human };
})();
