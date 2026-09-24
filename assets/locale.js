/* Open Food Facts – refonte : pays et langue.
   Deux réglages indépendants, mémorisés dans le navigateur :
   - le PAYS (off_country) filtre les produits (sous-domaine de l'API : fr.openfoodfacts.org…), "world" par défaut ;
   - la LANGUE (off_lang) pilote l'interface et le contenu renvoyé par l'API (lc).
   Ce fichier doit être chargé AVANT app.js et i18n.js. */
(function () {
  const COUNTRIES = [
    ["world", "Monde", 4768553, ["en"]],
    ["fr", "France", 1262032, ["fr"]], ["us", "États-Unis", 958748, ["en", "es"]], ["de", "Allemagne", 422850, ["de"]],
    ["es", "Espagne", 369983, ["es", "ca"]], ["it", "Italie", 269910, ["it"]], ["uk", "Royaume-Uni", 193130, ["en"]],
    ["ca", "Canada", 125216, ["en", "fr"]], ["nl", "Pays-Bas", 107104, ["nl"]], ["ch", "Suisse", 104927, ["de", "fr", "it"]],
    ["be", "Belgique", 100997, ["fr", "nl", "de"]], ["ie", "Irlande", 79523, ["en"]], ["au", "Australie", 79513, ["en"]],
    ["pl", "Pologne", 62211, ["pl"]], ["pt", "Portugal", 58940, ["pt"]], ["at", "Autriche", 52107, ["de"]],
    ["se", "Suède", 48302, ["sv"]], ["mx", "Mexique", 46110, ["es"]], ["br", "Brésil", 41870, ["pt"]],
    ["ru", "Russie", 39112, ["ru"]], ["dk", "Danemark", 31740, ["da"]], ["cz", "Tchéquie", 30215, ["cs"]],
    ["ro", "Roumanie", 28911, ["ro"]], ["hu", "Hongrie", 26504, ["hu"]], ["ma", "Maroc", 25877, ["fr", "ar"]],
    ["no", "Norvège", 24310, ["nb"]], ["fi", "Finlande", 22860, ["fi", "sv"]], ["gr", "Grèce", 21430, ["el"]],
    ["ar", "Argentine", 20195, ["es"]], ["jp", "Japon", 19870, ["ja"]], ["in", "Inde", 18640, ["en", "hi"]],
    ["tr", "Turquie", 17520, ["tr"]], ["hr", "Croatie", 16210, ["hr"]], ["nz", "Nouvelle-Zélande", 15430, ["en"]],
    ["za", "Afrique du Sud", 14120, ["en"]], ["sk", "Slovaquie", 12980, ["sk"]], ["bg", "Bulgarie", 12100, ["bg"]],
    ["rs", "Serbie", 11540, ["sr"]], ["dz", "Algérie", 10930, ["fr", "ar"]], ["tn", "Tunisie", 10210, ["fr", "ar"]],
    ["cl", "Chili", 9870, ["es"]], ["co", "Colombie", 9120, ["es"]], ["il", "Israël", 8760, ["he", "en"]],
    ["kr", "Corée du Sud", 8430, ["ko"]], ["cn", "Chine", 8020, ["zh"]], ["th", "Thaïlande", 7650, ["th", "en"]],
    ["id", "Indonésie", 6980, ["id"]], ["vn", "Viêt Nam", 6210, ["vi"]], ["ua", "Ukraine", 5890, ["uk"]],
    ["si", "Slovénie", 4289, ["sl"]], ["ae", "Émirats arabes unis", 4010, ["ar", "en"]], ["sa", "Arabie saoudite", 3870, ["ar", "en"]],
    ["eg", "Égypte", 3120, ["ar"]], ["ng", "Nigeria", 1980, ["en"]], ["ke", "Kenya", 708, ["en"]],
  ];
  const LANGUAGES = {
    fr: "Français", en: "English", es: "Español", de: "Deutsch", it: "Italiano", nl: "Nederlands", pt: "Português", pl: "Polski",
    ca: "Català", sv: "Svenska", da: "Dansk", nb: "Norsk", fi: "Suomi", cs: "Čeština", hu: "Magyar", ro: "Română", el: "Ελληνικά",
    hr: "Hrvatski", sl: "Slovenščina", sk: "Slovenčina", bg: "Български", sr: "Srpski", tr: "Türkçe", ar: "العربية", he: "עברית",
    ru: "Русский", uk: "Українська", ja: "日本語", ko: "한국어", zh: "中文", hi: "हिन्दी", th: "ไทย", id: "Bahasa Indonesia", vi: "Tiếng Việt",
  };
  const UI_LANGS = ["fr", "en", "es"]; // langues dont l'interface est traduite dans ce prototype
  const store = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { } };
  const read = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  let country = read("off_country") || "world";
  if (!COUNTRIES.some(c => c[0] === country)) country = "world";
  let lang = read("off_lang");
  if (!lang) { const nav = (navigator.language || "fr").slice(0, 2).toLowerCase(); lang = LANGUAGES[nav] ? nav : "en"; }
  if (!LANGUAGES[lang]) lang = "en";
  const uiLang = UI_LANGS.includes(lang) ? lang : "en";

  /* Les sous-domaines pays refusent la recherche aux navigateurs (503) : on interroge
     toujours world et on filtre par pays avec countries_tags. */
  const COUNTRY_TAGS = {"fr": "en:france", "us": "en:united-states", "de": "en:germany", "es": "en:spain", "it": "en:italy", "uk": "en:united-kingdom", "ca": "en:canada", "nl": "en:netherlands", "ch": "en:switzerland", "be": "en:belgium", "ie": "en:ireland", "au": "en:australia", "pl": "en:poland", "pt": "en:portugal", "at": "en:austria", "se": "en:sweden", "mx": "en:mexico", "br": "en:brazil", "ru": "en:russia", "dk": "en:denmark", "cz": "en:czech-republic", "ro": "en:romania", "hu": "en:hungary", "ma": "en:morocco", "no": "en:norway", "fi": "en:finland", "gr": "en:greece", "ar": "en:argentina", "jp": "en:japan", "in": "en:india", "tr": "en:turkey", "hr": "en:croatia", "nz": "en:new-zealand", "za": "en:south-africa", "sk": "en:slovakia", "bg": "en:bulgaria", "rs": "en:serbia", "dz": "en:algeria", "tn": "en:tunisia", "cl": "en:chile", "co": "en:colombia", "il": "en:israel", "kr": "en:south-korea", "cn": "en:china", "th": "en:thailand", "id": "en:indonesia", "vn": "en:vietnam", "ua": "en:ukraine", "si": "en:slovenia", "ae": "en:united-arab-emirates", "sa": "en:saudi-arabia", "eg": "en:egypt", "ng": "en:nigeria", "ke": "en:kenya"};
  const api = () => "https://world.openfoodfacts.org";
  const countryTag = () => COUNTRY_TAGS[country] || null;
  function set({ country: c, lang: l }) {
    if (c !== undefined) store("off_country", c === "world" ? null : c);
    if (l !== undefined) store("off_lang", l);
    location.reload();
  }
  const info = cc => COUNTRIES.find(c => c[0] === cc) || COUNTRIES[0];

  window.OFF = window.OFF || {};
  OFF.locale = Object.assign(OFF.locale || {}, { COUNTRIES, LANGUAGES, UI_LANGS, COUNTRY_TAGS, country, lang, uiLang, api, countryTag, set, info });
  OFF.lang = lang; OFF.uiLang = uiLang; OFF.country = country;
})();
