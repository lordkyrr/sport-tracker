# Sport Tracker v2 — Design Spec

**Date** : 2026-06-10  
**Statut** : Approuvé

---

## Contexte

Refonte complète de l'app Sport Tracker depuis zéro. L'app v1 était un fichier unique `src/App.jsx` (688 lignes) sans architecture, avec une feature photo IA peu utilisée. L'objectif v2 est une vraie app mobile Android intuitive, paramétrable et maintenable.

**Stack conservée** : React 19 + Vite + localStorage + Capacitor → APK Android. Aucun state manager externe.

---

## Types de journée

L'app reconnaît 4 types de journée :

| Type | Description |
|---|---|
| `dynamique` | Séance muscu reps (section A) + cardio |
| `statique` | Séance muscu isométrie (section B) + cardio |
| `repos` | Jour de repos complet — marqueur uniquement |
| `match` | Match de tennis — marqueur uniquement, compte comme jour actif |

Le cardio est toujours associé à une séance Dynamique ou Statique — il n'existe pas de journée "cardio seul".

---

## Data model

Deux clés en `localStorage` :

### `program-config`

Configuration du programme, éditée dans l'écran Config.

```json
{
  "A": [
    { "id": "squats",    "label": "Squats",    "target": 100, "quickAdd": 20, "color": "#f97316" },
    { "id": "abdos",     "label": "Abdos",     "target": 200, "quickAdd": 50, "color": "#ec4899" },
    { "id": "tractions", "label": "Tractions", "target": 40,  "quickAdd": 5,  "color": "#8b5cf6" },
    { "id": "pompes",    "label": "Pompes",    "target": 50,  "quickAdd": 10, "color": "#06b6d4" }
  ],
  "B": [
    { "id": "planche",       "label": "Planche",            "targetSec": 300, "quickAddSec": 60, "color": "#f472b6" },
    { "id": "chaise",        "label": "Chaise",             "targetSec": 300, "quickAddSec": 60, "color": "#e879f9" },
    { "id": "superman",      "label": "Superman",           "targetSec": 300, "quickAddSec": 60, "color": "#fb923c" },
    { "id": "pompebasse",    "label": "Pompe pos. basse",   "targetSec": 120, "quickAddSec": 15, "color": "#34d399" },
    { "id": "tractionhaute", "label": "Traction pos. haute","targetSec": 120, "quickAddSec": 15, "color": "#60a5fa" }
  ],
  "C": [
    { "id": "running", "label": "Running", "emoji": "🏃" },
    { "id": "velo",    "label": "Vélo",    "emoji": "🚴" },
    { "id": "piscine", "label": "Piscine", "emoji": "🏊" },
    { "id": "tennis",  "label": "Tennis",  "emoji": "🎾" }
  ]
}
```

**Règles** :
- Sections A et B : pas d'emoji, couleur par exercice, objectif fixe mais éditable
- Section C : emoji uniquement, pas d'objectif numérique
- Les objectifs sont dans la config — jamais dans les sessions. Modifier un objectif ne corrompt pas l'historique.

### `sessions`

Journal quotidien des séances.

```json
{
  "2026-06-10": {
    "type": "statique",
    "exercises": {
      "planche": [60, 60, 60],
      "chaise": [45, 60]
    },
    "cardio": ["running"]
  },
  "2026-06-09": {
    "type": "dynamique",
    "exercises": {
      "squats": [20, 30, 20],
      "abdos": [50, 50, 50, 50]
    },
    "cardio": ["velo"]
  },
  "2026-06-08": { "type": "repos" },
  "2026-06-07": { "type": "match" }
}
```

**Règles** :
- Les journées `repos` et `match` n'ont pas de champ `exercises` ni `cardio`
- `exercises` ne stocke que les valeurs saisies (tableaux de nombres) — pas les objectifs
- Section A : valeurs en reps (entiers), Section B : valeurs en secondes (entiers)

---

## Moteur de suggestion (`src/lib/suggestion.js`)

Retourne le type de journée recommandé pour aujourd'hui, avec un motif textuel affiché dans l'UI.

### Algorithme

```
1. Récupérer les sessions passées (< aujourd'hui), triées du plus récent au plus ancien

2. Compter les jours actifs consécutifs depuis hier
   → un jour est "actif" si son type est dynamique, statique ou match
   → s'arrêter dès qu'on rencontre un jour repos (ou un jour sans session)

3. Si jours actifs consécutifs >= 2 → suggérer "repos"
   (motif : "2 jours actifs consécutifs")

4. Sinon, trouver la dernière session de type dynamique ou statique
   → si la dernière était "dynamique" → suggérer "statique"
   → si la dernière était "statique"  → suggérer "dynamique"
   → si aucune session de muscu trouvée → suggérer "dynamique" (défaut)
```

### Interface

```js
// src/lib/suggestion.js
export function suggestDay(sessions) {
  // → { type: "dynamique" | "statique" | "repos", reason: string }
}
```

La suggestion est **indicative** — l'utilisateur peut choisir n'importe quel type via les pills.

---

## Architecture des fichiers

```
src/
├── hooks/
│   ├── useStorage.js       # get/set générique pour localStorage
│   ├── useSessions.js      # CRUD sessions par date
│   └── useProgram.js       # lecture/écriture program-config
├── components/
│   ├── exercises/
│   │   ├── RepExercise.jsx     # exercice à reps (section A)
│   │   └── TimeExercise.jsx    # exercice isométrique (section B)
│   ├── CardioSelector.jsx      # multi-select activités cardio
│   ├── DayTypePills.jsx        # sélecteur Dynamique/Statique/Repos/Match
│   └── ProgressBar.jsx         # barre de progression (avec glow à 100%)
├── screens/
│   ├── TodayScreen.jsx         # séance du jour
│   ├── HistoryScreen.jsx       # journal des séances passées
│   ├── StatsScreen.jsx         # graphiques 14 jours
│   └── ConfigScreen.jsx        # gestion du programme
├── lib/
│   └── suggestion.js           # moteur de suggestion
├── App.jsx                     # routing + bottom nav
└── main.jsx
```

---

## Navigation

**3 onglets en bas** : Séance · Historique · Stats  
**Icône ⚙️ dans le header** de l'écran Séance → ouvre ConfigScreen

Pas de router externe — état `view` dans App.jsx suffit.

---

## Écrans

### TodayScreen

- Header : date courante + badge suggestion (ex: *"Statique suggéré · alternance"*)
- `DayTypePills` : 4 pills sélectionnables — Dynamique · Statique · Repos · Match
- Si `repos` ou `match` sélectionné : afficher un grand marqueur visuel, pas d'exercices
- Si `dynamique` : liste des exercices Section A via `RepExercise`, puis `CardioSelector`
- Si `statique` : liste des exercices Section B via `TimeExercise`, puis `CardioSelector`
- Navigation jour précédent / suivant (flèches) — le jour suivant est bloqué si c'est aujourd'hui
- Bouton Reset discret (confirmation avant suppression)

### HistoryScreen

- Liste des sessions passées, triée du plus récent au plus ancien
- Chaque item : card collapsible avec date, type de journée (badge coloré), et résumé des exercices
- Repos et Match : card simplifiée, couleur distincte
- Pas de pagination — scroll natif

### StatsScreen

- Bloc cardio : comptage par activité sur les 14 derniers jours
- Section A : graphique en barres par exercice (total reps par jour, 14j)
- Section B : graphique en barres par exercice (total secondes par jour, 14j)
- Résumé en haut : streak actuel (jours consécutifs de type `dynamique` ou `statique`, repos/match ne comptent pas), séances cette semaine

### ConfigScreen

- Section A : liste des exercices avec édition inline (label, target, quickAdd, couleur)
- Section B : liste des exercices avec édition inline (label, targetSec, quickAddSec, couleur)
- Section C : liste des activités cardio avec édition inline (label, emoji)
- Bouton "Ajouter" en bas de chaque section
- Suppression par bouton ✕ sur chaque ligne (pas de swipe — évite une dépendance externe)

---

## Style visuel

**Direction** : Dark glass (style B) avec glow à 100%

| Token | Valeur |
|---|---|
| Fond principal | `#0a0a0f` |
| Fond carte | `rgba(255,255,255,0.04)` |
| Bordure | `rgba(255,255,255,0.08)` |
| Bordure active | `<color>44` |
| Police | Syne (Google Fonts) |
| Nav bar | `rgba(10,10,15,0.95)` + `backdrop-filter: blur(20px)` |

**Barres de progression** :
- En cours : `linear-gradient(90deg, <color>88, <color>)`
- À 100% : `linear-gradient(90deg, <color>, #fff)` + `box-shadow: 0 0 8px <color>66`

**Couleurs par type de journée** :
- Dynamique : orange `#f97316`
- Statique : violet `#8b5cf6`
- Repos : indigo `#6366f1`
- Match : vert `#10b981`

---

## Ce qui est supprimé

- Feature photo / import IA (PhotoTab, appel API Anthropic)
- Dépendance `VITE_ANTHROPIC_API_KEY`
- Onglet Photo dans la navigation

---

## Ce qui est conservé

- Stack technique : React 19 + Vite + Capacitor + PWA
- `localStorage` comme seul storage
- Police Syne
- Dark theme
- Navigation jour précédent/suivant sur l'écran Séance
