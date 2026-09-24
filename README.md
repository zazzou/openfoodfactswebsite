# Open Food Facts – proposition de refonte du site

Maquette statique (HTML / CSS / JS, sans framework) proposant une nouvelle identité visuelle pour
[world.openfoodfacts.org](https://world.openfoodfacts.org), en conservant le logo et la palette officiels
(brun `#341100`, orange `#ff8714`, vert `#00961e`, bleu `#0064c8`).

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : hero vidéo, scanner de démonstration, simulateur de Nutri-Score, rayons, contribuer, API |
| `search.html` · `facets.html` · `facet-values.html` · `facet.html` | Recherche plein texte et navigation par facettes (catégories, marques, labels, scores, pays) |
| `product.html` · `product-health.html` · `product-environment.html` · `product-contribute.html` | Fiche produit et ses trois sous-pages, via `?code=` ; gère aussi les cosmétiques et les produits non alimentaires |
| `compare.html` · `ranking.html` | Comparateur côte à côte et classement personnalisé selon vos préférences |
| `preferences.html` | Préférences alimentaires (28 critères), stockées dans le navigateur |
| `edit.html` · `report.html` | Formulaire d'édition d'un produit et signalement à la modération |
| `hunger.html` · `hunger-play.html` · `leaderboard.html` | Hunger Games : questions de Robotoff, jeu et classement |
| `guides.html` · `guide.html` | Les huit guides (Nutri-Score, Green-Score, ultra-transformation, projets de la famille) |
| `properties.html` · `property.html` · `product-properties.html` | Folksonomie : propriétés libres clé/valeur |
| `changes.html` | Historique des modifications, global et par produit |
| `countries.html` · `map.html` | Produits par pays et résultats de recherche sur une carte |
| `signin.html` · `signup.html` · `reset.html` · `profile.html` | Compte contributeur et profil |
| `scores.html` · `contribute.html` · `data.html` · `discover.html` | Scores expliqués, contribuer, données/API, qui sommes-nous |

**Trois langues** : français (source), anglais et espagnol, via le sélecteur de l'en-tête
(`assets/i18n.js`, `assets/i18n-es.js`). Le sélecteur sépare le **pays** (qui filtre les produits)
et la **langue** (interface et contenus) : deux réglages indépendants, avec les langues du pays
proposées en tête et l'anglais toujours disponible.

## Lancer en local

```bash
python -m http.server 8765
```

puis ouvrir <http://localhost:8765>. Le site fonctionne aussi tel quel sur GitHub Pages (chemins relatifs).

## Notes

- Les données produits, images et badges de scores viennent des API et serveurs publics d'Open Food Facts.
- La recherche texte utilise `cgi/search.pl` (limitée à ~10 requêtes/min par IP) ; au-delà, un jeu de
  démonstration local est affiché.
- Photos : Unsplash. Vidéos : Mixkit (licence libre, sans attribution requise).
- Les liens secondaires (presse, stores, wiki…) ne sont pas câblés : la maquette affiche un toast.
- L'écriture (connexion, édition, envoi de photo, réponse à Robotoff) nécessite un vrai compte :
  les formulaires valident et simulent, puis affichent un message explicite.
- 33 pages, sans framework ni étape de build.
