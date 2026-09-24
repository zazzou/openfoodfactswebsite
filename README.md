# Open Food Facts – proposition de refonte du site

Maquette statique (HTML / CSS / JS, sans framework) proposant une nouvelle identité visuelle pour
[world.openfoodfacts.org](https://world.openfoodfacts.org), en conservant le logo et la palette officiels
(brun `#341100`, orange `#ff8714`, vert `#00961e`, bleu `#0064c8`).

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : hero vidéo, scanner de démonstration, simulateur de Nutri-Score (algorithme 2023), défilé de vrais produits, rayons, contribuer, API |
| `search.html` | Recherche en direct sur l'API Open Food Facts, filtres Nutri-Score / NOVA / labels, tri, pagination |
| `product.html` | Fiche produit ; charge n'importe quel code-barres via `product.html?code=…` |
| `scores.html` | Nutri-Score, NOVA, Green-Score expliqués |
| `contribute.html` | Contribuer |
| `data.html` | Données ouvertes, API, SDK, exports |
| `discover.html` | Qui sommes-nous |

Français par défaut, anglais via le sélecteur de langue de l'en-tête (`assets/i18n.js`).

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
- Les liens secondaires (connexion, presse, stores…) ne sont pas câblés : la maquette affiche un toast.
