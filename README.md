# ♞ Chess Bot — jouer, comprendre, progresser

Application web statique (déployable sur GitHub Pages) pour progresser aux échecs au-delà de 1200 Elo :

- **Jouer** contre Stockfish 17.1 réglable de 400 à 3000 Elo, avec indices **expliqués en français** (tactique, menaces, structure, plan, « pourquoi pas ce coup ? »).
- **Analyse** d'une position ou d'un PGN avec explications par règles (aucune IA générative, aucune clé API).
- **Professeur** : leçons interactives avancées (structures de pions, prophylaxie, finales de tours…) avec exercices vérifiés par Stockfish, et analyse de tes parties chess.com avec recommandations de leçons.
- **Moteurs d'échecs** : comment fonctionnent Stockfish, Leela, AlphaZero, Torch, Maia…
- **Mes statistiques** : évolution de l'Elo, ouvertures, résultats, via l'API publique chess.com (aucune connexion requise, juste le pseudo).

## Lancer en local

Prérequis : Node.js 20+.

```bash
npm install      # copie aussi Stockfish (WASM) dans public/stockfish
npm run dev      # http://localhost:5173
npm test         # tests unitaires (Vitest)
npm run build    # build de production dans dist/
```

## Déployer sur GitHub Pages

1. Crée un dépôt GitHub (ex. `chess-bot`) et pousse la branche `main` :
   ```bash
   git remote add origin https://github.com/<ton-compte>/chess-bot.git
   git push -u origin main
   ```
2. Sur GitHub : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
3. Le workflow `.github/workflows/deploy.yml` teste, construit (avec `BASE_PATH=/<nom-du-repo>/`) et publie le site à chaque push sur `main`.
   Le site sera disponible sur `https://<ton-compte>.github.io/chess-bot/`.

## Notes techniques

- **Stack** : Vite, React 18, TypeScript, chess.js, react-chessboard, recharts, HashRouter (pas de 404 au rafraîchissement sur Pages).
- **Moteur** : Stockfish 17.1 « lite single-thread » en WebAssembly dans un Web Worker. La version multi-thread exige des en-têtes COOP/COEP que GitHub Pages ne fournit pas.
- **Force du bot** : `UCI_LimitStrength` + `UCI_Elo` à partir de 1320 ; en dessous, `Skill Level`, profondeur réduite et erreurs aléatoires choisies parmi les lignes MultiPV (`src/engine/strength.ts`). L'Elo Stockfish (échelle CCRL) ne correspond pas exactement à l'Elo chess.com.
- **Explications** : générées par règles (`src/analysis/`) à partir de l'analyse Stockfish et de la détection de motifs tactiques et positionnels.
- **Données chess.com** : API publique `api.chess.com/pub`, mise en cache dans le navigateur.

## Licence

Ce projet est distribué sous licence **GNU GPL v3 ou ultérieure** (voir [`LICENSE`](LICENSE)).
Il embarque [Stockfish](https://stockfishchess.org/) 17.1 (WebAssembly, via le paquet npm `stockfish`), lui-même sous GPLv3 ; son code source est disponible sur https://github.com/official-stockfish/Stockfish.

Les pièces d'échecs SVG sont le jeu « cburnett » de Colin M.L. Burnett (GPLv2 ou ultérieure), tel que distribué par [Lichess](https://github.com/lichess-org/lila/tree/master/public/piece/cburnett).
