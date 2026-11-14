// Contenu de l'encyclopédie « Les moteurs d'échecs ».
// Faits vérifiés (sources en bas de fichier) au 14/11/2026. Les chiffres incertains sont
// volontairement formulés de façon approximative.
// Mini-balisage dans les textes : **gras** et `code` (rendus par components/engines/RichText).

export type Era = 'pionniers' | 'machines' | 'commerciaux' | 'opensource' | 'neuronal';

export const ERA_LABELS: Record<Era, string> = {
  pionniers: 'Pionniers',
  machines: 'Machines dédiées',
  commerciaux: 'Moteurs commerciaux',
  opensource: 'Open source',
  neuronal: 'Réseaux de neurones',
};

export interface HistoryEvent {
  year: string;
  title: string;
  era: Era;
  text: string;
}

export const HISTORY: HistoryEvent[] = [
  {
    year: '1950',
    title: 'Shannon pose le problème',
    era: 'pionniers',
    text: "Claude Shannon publie « Programming a Computer for Playing Chess ». Il distingue la stratégie de **type A** (force brute : examiner tous les coups jusqu'à une profondeur fixe) et de **type B** (sélective : n'examiner que les coups « plausibles », comme un humain). Il estime le nombre de parties possibles à ~10^120 — le fameux « nombre de Shannon » : impossible de tout calculer.",
  },
  {
    year: '1948–1952',
    title: 'Le Turochamp de Turing',
    era: 'pionniers',
    text: "Alan Turing et David Champernowne écrivent un algorithme d'échecs… sans ordinateur assez puissant pour l'exécuter. En 1952, Turing le « joue » à la main, à raison d'une demi-heure par coup, et perd contre un collègue. Le programme contient déjà une fonction d'évaluation (matériel, mobilité, sécurité du roi).",
  },
  {
    year: '1956–1975',
    title: 'Alpha-bêta et la victoire du type A',
    era: 'pionniers',
    text: "L'élagage **alpha-bêta** est décrit à la fin des années 1950 (McCarthy, Newell-Shaw-Simon…). Contre l'intuition de Shannon, ce sont les programmes « force brute » bien élagués (Chess 4.x à Northwestern) qui gagnent : mieux vaut tout voir un peu moins loin que choisir mal ce qu'on regarde.",
  },
  {
    year: '1996',
    title: 'Deep Blue gagne une partie… mais perd le match',
    era: 'machines',
    text: "À Philadelphie, le supercalculateur d'IBM bat Garry Kasparov dans la 1re partie — première victoire d'une machine sur un champion du monde en cadence classique. Kasparov s'impose finalement 4–2.",
  },
  {
    year: '1997',
    title: 'Deep Blue bat Kasparov',
    era: 'machines',
    text: "Revanche à New York : Deep Blue (puces spécialisées, environ 200 millions de positions par seconde) gagne 3½–2½. Le choc est mondial. IBM démonte la machine peu après ; c'était une prouesse matérielle plus qu'algorithmique.",
  },
  {
    year: '1991–2006',
    title: "Fritz et l'ère ChessBase",
    era: 'commerciaux',
    text: "Fritz (Frans Morsch et Mathias Feist, édité par ChessBase) met un moteur fort sur tous les PC. En 2006, Deep Fritz bat le champion du monde Vladimir Kramnik 4–2 à Bonn, sur un simple PC multicœur : désormais, même le matériel grand public dépasse les humains.",
  },
  {
    year: '2005–2011',
    title: 'Rybka et la controverse',
    era: 'commerciaux',
    text: "Rybka (Vasik Rajlich) domine les classements de 2007 à 2010. En 2011, l'ICGA conclut à un plagiat des moteurs open source Fruit et Crafty, retire ses titres et bannit son auteur. La décision reste débattue (série d'articles de Søren Riis chez ChessBase en 2012). Dans la foulée, des clones (Ippolit, Robbolito) et Houdini (2010) prennent la tête.",
  },
  {
    year: '2008',
    title: 'Naissance de Stockfish',
    era: 'opensource',
    text: "Marco Costalba forke **Glaurung 2.1** (de Tord Romstad) ; avec Romstad et Joona Kiiski, il publie Stockfish 1.0 le 2 novembre 2008, sous licence GPL. À partir de 2013, l'infrastructure de test distribuée **Fishtest** (Gary Linscott) permet à des centaines de bénévoles de tester chaque idée : Stockfish devient le n° 1 et ne lâche plus la place.",
  },
  {
    year: '2017',
    title: 'AlphaZero : la révolution neuronale',
    era: 'neuronal',
    text: "DeepMind publie AlphaZero : aucun savoir humain, juste les règles. Il apprend en jouant contre lui-même puis écrase Stockfish 8 (+28 =72 −0 sur 100 parties, prépublication de décembre 2017 ; puis +155 −6 =839 sur 1 000 parties dans *Science* en 2018). Son style — sacrifices de pions à long terme, roi adverse étouffé — fascine les grands maîtres.",
  },
  {
    year: '2018',
    title: 'Leela Chess Zero',
    era: 'neuronal',
    text: "Gary Linscott lance **Lc0**, réimplémentation open source d'AlphaZero entraînée par la communauté (calcul distribué de bénévoles). Leela remporte le TCEC aux saisons 15 et 17 et reste depuis le principal rival de Stockfish.",
  },
  {
    year: '2018–2020',
    title: 'NNUE : du shogi aux échecs',
    era: 'neuronal',
    text: "Yu Nasu invente en 2018, pour le shogi, le réseau **NNUE** (« Efficiently Updatable Neural Network »), un petit réseau optimisé pour le CPU. Hisayori Noda (« nodchip ») le porte dans Stockfish : **Stockfish 12** (septembre 2020) gagne d'un coup environ 100 points Elo. Presque tous les moteurs alpha-bêta l'adoptent en quelques mois.",
  },
  {
    year: '2020',
    title: 'Maia, le moteur qui joue comme toi',
    era: 'neuronal',
    text: "Des chercheurs (Cornell, Toronto, Microsoft Research) entraînent des réseaux de type Leela non pas à gagner, mais à **prédire le coup qu'un humain d'un niveau donné jouerait** (Maia 1100 à 1900, à partir de parties Lichess). Maia-2 (2024) unifie tous les niveaux dans un seul modèle.",
  },
  {
    year: '2023',
    title: 'Torch, le moteur de chess.com',
    era: 'neuronal',
    text: "Chess.com dévoile Torch (juillet 2023), développé par une équipe réunissant des auteurs d'Ethereal, Koivisto, Berserk et Dragon. Il se hisse rapidement juste derrière Stockfish.",
  },
  {
    year: '2024',
    title: "Fin de l'évaluation « à la main » dans Stockfish",
    era: 'opensource',
    text: "Stockfish 16.1 (février 2024) supprime définitivement l'ancienne évaluation classique écrite par des humains : tout passe désormais par le réseau NNUE.",
  },
  {
    year: '2026',
    title: 'Stockfish 19 et un peloton serré',
    era: 'opensource',
    text: "Stockfish 18 (janvier) puis **Stockfish 19** (septembre 2026, nouvelle architecture de réseau) : le moteur remporte son 19e titre TCEC (saison 29, face au moteur open source Reckless). Sur la liste CCRL 40/15, une quinzaine de moteurs se tiennent pourtant en une vingtaine de points Elo, autour de 3 630–3 650.",
  },
];

export interface EngineSheet {
  id: string;
  name: string;
  tagline: string;
  origin: string;
  license: string;
  openSource: boolean;
  search: string;
  evaluation: string;
  hardware: string;
  strength: string;
  style: string;
  specifics: string;
  whereToMeet: string;
  historical?: boolean;
}

export const ENGINES: EngineSheet[] = [
  {
    id: 'stockfish',
    name: 'Stockfish',
    tagline: 'Le n° 1 incontesté, et celui qui tourne sur ce site',
    origin: "Fork de Glaurung (Tord Romstad) par Marco Costalba en 2008, avec Joona Kiiski. Aujourd'hui développé par une large communauté de bénévoles. Dernière version : Stockfish 19 (septembre 2026).",
    license: 'GPLv3 (open source)',
    openSource: true,
    search: "Alpha-bêta (PVS) extrêmement élagué : approfondissement itératif, table de transposition, null move, LMR, extensions, quiescence… chaque réglage est validé statistiquement sur Fishtest.",
    evaluation: "NNUE uniquement depuis la version 16.1 (2024). Entrées « roi × pièce × case » (famille HalfKA), plus des entrées de menaces dans les versions récentes ; première couche d'environ 1 024 neurones par camp, mise à jour incrémentalement.",
    hardware: "CPU (des dizaines de millions de positions/s sur un PC récent multicœur). Ici, une version WebAssembly allégée, mono-thread, beaucoup plus lente.",
    strength: "≈ 3 650 Elo CCRL 40/15 : en tête de tous les classements. 19 titres TCEC.",
    style: "Universel et d'une précision clinique ; défend des positions que les humains jugent perdues, et convertit le moindre avantage.",
    specifics: "Fishtest : chaque modification est jouée sur des dizaines de milliers de parties et acceptée par un test SPRT. Supporte les tablebases Syzygy. Réseaux entraînés en partie sur des données de Leela.",
    whereToMeet: "Analyse Lichess (dans le navigateur aussi), analyse chess.com, ChessBase, apps mobiles, TCEC, CCC… et ce site (Stockfish 17.1 WASM).",
  },
  {
    id: 'lc0',
    name: 'Leela Chess Zero (Lc0)',
    tagline: "L'héritière open source d'AlphaZero",
    origin: "Projet communautaire lancé en 2018 par Gary Linscott (déjà à l'origine de Fishtest). Réseaux entraînés par self-play sur les machines de bénévoles. Dernière version stable : 0.32 (fin 2025), 0.33 en préparation.",
    license: 'GPLv3 (open source)',
    openSource: true,
    search: "MCTS (Monte Carlo Tree Search) guidé par le réseau, avec la formule PUCT : peu de nœuds (des dizaines de milliers par seconde), mais très bien choisis.",
    evaluation: "Gros réseau profond (aujourd'hui de type Transformer) avec deux têtes : policy (probabilité de chaque coup) et value (probabilités Victoire/Nulle/Défaite).",
    hardware: "GPU (carte graphique) indispensable pour sa pleine force ; sur CPU seul elle est nettement plus faible.",
    strength: "Parmi les tout meilleurs moteurs sur GPU ; vainqueur du TCEC (saisons 15 et 17), finaliste régulier face à Stockfish.",
    style: "Très « humain-stratège » : compensation à long terme, sacrifices positionnels, compréhension des forteresses. Peut rater des tactiques courtes et profondes.",
    specifics: "Évaluation native en WDL (probabilité de gain/nulle/perte) plutôt qu'en centipions. Ses réseaux servent aussi à entraîner Stockfish et à construire Maia.",
    whereToMeet: "TCEC, CCC, logiciels d'analyse (Nibbler, ChessBase, En Croissant), bots Lichess.",
  },
  {
    id: 'alphazero',
    name: 'AlphaZero',
    tagline: 'Le coup de tonnerre de DeepMind (2017)',
    origin: "Google DeepMind (David Silver, Demis Hassabis et al.). Prépublication en décembre 2017, article dans Science en décembre 2018. Même algorithme pour les échecs, le shogi et le go.",
    license: 'Propriétaire, jamais publié',
    openSource: false,
    search: "MCTS + PUCT guidé par le réseau (≈ 60 000 positions/s, contre ~60 millions pour le Stockfish de l'époque).",
    evaluation: 'Réseau résiduel profond (ResNet) policy + value appris uniquement par self-play, à partir des seules règles.',
    hardware: 'TPU de Google (des milliers pour générer les parties d’entraînement, 4 pour jouer).',
    strength: "Supérieur à Stockfish 8 en 2017–2018 (+155 −6 sur 1 000 parties). Les conditions du premier match (Stockfish sans livre, hachage limité) ont été critiquées.",
    style: "Dynamique : sacrifices de pions pour l'initiative, avancées de pions h, restriction de la mobilité adverse.",
    specifics: "A prouvé qu'un savoir 100 % auto-appris pouvait battre des décennies d'expertise humaine encodée. Le livre « Game Changer » (Sadler & Regan) analyse son style.",
    whereToMeet: 'Nulle part : ses parties publiées sont étudiées, le programme ne l’est pas.',
    historical: true,
  },
  {
    id: 'dragon',
    name: 'Komodo / Komodo Dragon',
    tagline: 'Le moteur commercial des créateurs de Komodo, propriété de chess.com',
    origin: "Komodo naît vers 2010 (Don Dailey et le GM Larry Kaufman, rejoints par Mark Lefler). Racheté par chess.com en 2018. Dragon (2020) y ajoute NNUE. Dernière version : Dragon 3.3 (2023) ; la vente a été arrêtée en 2026.",
    license: 'Commercial, propriétaire',
    openSource: false,
    search: "Alpha-bêta ; propose aussi un mode MCTS sur CPU (original pour un moteur classique).",
    evaluation: "Historiquement une évaluation à la main très « humaine » (Kaufman est GM) ; NNUE depuis Dragon.",
    hardware: 'CPU',
    strength: "Top 5 mondial à son époque ; aujourd'hui quelque peu distancé par les moteurs plus récents.",
    style: "Réputé pour son jugement positionnel et ses niveaux de jeu bridés « humains » (personnalités).",
    specifics: "Fournit les bots à personnalités et une partie de l'analyse de chess.com ; ses auteurs ont participé à Torch.",
    whereToMeet: 'Chess.com (bots, analyse), anciennes éditions commerciales.',
  },
  {
    id: 'torch',
    name: 'Torch',
    tagline: 'Le moteur maison de chess.com',
    origin: "Dévoilé par chess.com en juillet 2023 (il était apparu au CCC sous le nom « Mystery »). Équipe : Andrew Grant (Ethereal), Finn Eggers et Kim Kåhre (Koivisto), Jay Honnold (Berserk), Michael Whiteley et Dietrich Kappe (Dragon), avec Larry Kaufman et Mark Lefler comme conseillers.",
    license: 'Propriétaire (non distribué)',
    openSource: false,
    search: 'Alpha-bêta moderne (PVS + élagages agressifs).',
    evaluation: 'NNUE entraîné maison.',
    hardware: 'CPU',
    strength: "≈ 3 640 Elo CCRL 40/15 (version v4d) : dans le peloton de tête, souvent 2e derrière Stockfish au CCC. Selon chessprogramming.org, son développement « en force » s'est arrêté mi-2024.",
    style: "Solide et universel, proche de Stockfish.",
    specifics: "Illustration du fait que les meilleurs auteurs de moteurs open source peuvent unir leurs forces sur un projet fermé.",
    whereToMeet: 'Chess.com Computer Chess Championship (CCC), certaines fonctions de chess.com.',
  },
  {
    id: 'ethereal',
    name: 'Ethereal',
    tagline: "Le moteur pédagogique d'Andrew Grant, père d'OpenBench",
    origin: "Andrew Grant, à partir du milieu des années 2010. Dernière version listée : 14.25 (2023).",
    license: "GPL pour le code (versions classiques) ; les versions NNUE (13 et +) ont été vendues commercialement.",
    openSource: true,
    search: 'Alpha-bêta (PVS) classique, code réputé très lisible.',
    evaluation: 'Évaluation à la main soigneusement réglée (tuning automatique), puis NNUE propre à partir de la version 13 (2021).',
    hardware: 'CPU',
    strength: 'Longtemps dans le top 10 CCRL ; dépassé depuis par des moteurs plus récents.',
    style: 'Équilibré.',
    specifics: "Son auteur a créé **OpenBench**, l'équivalent de Fishtest utilisé par une grande partie des moteurs open source modernes. Code souvent cité comme référence pour apprendre.",
    whereToMeet: 'CCRL, TCEC (ligues), dépôt GitHub pour les curieux.',
  },
  {
    id: 'berserk',
    name: 'Berserk',
    tagline: 'Un des meilleurs moteurs open source en C',
    origin: "Jay Honnold, première version en 2021 ; NNUE depuis la version 6. Version 14 en 2026.",
    license: 'GPLv3 (open source)',
    openSource: true,
    search: 'Alpha-bêta (PVS) moderne avec tous les élagages classiques.',
    evaluation: 'NNUE entraîné sur ses propres parties.',
    hardware: 'CPU',
    strength: 'Dans le groupe de tête des moteurs CCRL (quelques dizaines de points derrière Stockfish).',
    style: 'Agressif, comme son nom l’indique.',
    specifics: 'Son auteur fait aussi partie de l’équipe Torch.',
    whereToMeet: 'CCRL, TCEC, bots Lichess.',
  },
  {
    id: 'reckless',
    name: 'Reckless (et le peloton CCRL)',
    tagline: 'Le challenger open source de 2026, écrit en Rust',
    origin: "Moteur open source écrit en Rust, développé sur GitHub. Il a atteint la superfinale du TCEC (saison 29, 2026), perdue contre Stockfish.",
    license: 'Open source',
    openSource: true,
    search: 'Alpha-bêta (PVS) moderne.',
    evaluation: 'NNUE.',
    hardware: 'CPU',
    strength: "≈ 3 645 Elo CCRL 40/15, à quelques points de Stockfish — comme PlentyChess, Obsidian, Viridithas, Stormphrax, Caissa… tous dans un mouchoir de poche.",
    style: 'Universel.',
    specifics: "Montre la démocratisation des techniques : NNUE + outils partagés (OpenBench, entraîneurs de réseaux open source) permettent à de petites équipes d'atteindre le sommet.",
    whereToMeet: 'TCEC, CCRL.',
  },
  {
    id: 'maia',
    name: 'Maia',
    tagline: 'Le moteur entraîné à jouer comme un humain de ton niveau',
    origin: "Projet de recherche (Reid McIlroy-Young, Siddhartha Sen, Jon Kleinberg, Ashton Anderson — Cornell, Toronto, Microsoft Research), publié à KDD 2020. Maia-2 (NeurIPS 2024) : un seul modèle conditionné par l'Elo.",
    license: 'Open source (code et réseaux publiés)',
    openSource: true,
    search: "Aucune ou presque : le coup est choisi directement par la tête policy du réseau (1 nœud), justement pour ne pas « calculer » mieux qu'un humain.",
    evaluation: "Réseaux de l'architecture Leela, mais entraînés en supervision sur des millions de parties Lichess d'une tranche d'Elo donnée (maia-1100 … maia-1900).",
    hardware: 'CPU suffisant (un seul passage du réseau par coup).',
    strength: "Volontairement modeste : chaque réseau joue à peu près au niveau de la tranche qu'il imite. Il prédit le coup humain réel environ une fois sur deux, bien mieux que Stockfish bridé.",
    style: "Humain, erreurs comprises : il rate les mêmes tactiques qu'un joueur de 1200 et « voit » les mêmes coups naturels.",
    specifics: "Idéal pour s'entraîner contre un adversaire crédible, ou pour comprendre quelles erreurs sont typiques de ton niveau.",
    whereToMeet: 'Bots Lichess maia1, maia5, maia9 (depuis 2020) ; site de recherche Maia.',
  },
  {
    id: 'houdini',
    name: 'Houdini',
    tagline: 'Le roi des années 2010–2013 (historique)',
    origin: "Robert Houdart, première version en 2010, dernière en 2017 (Houdini 6, vainqueur du TCEC saison 10).",
    license: 'Commercial, propriétaire',
    openSource: false,
    search: 'Alpha-bêta.',
    evaluation: 'Évaluation à la main.',
    hardware: 'CPU',
    strength: "N° 1 mondial vers 2010–2013, puis dépassé par Stockfish et Komodo.",
    style: "Réputé pour sa défense « d'évasion » (d'où le nom), capable de sauver des positions difficiles.",
    specifics: "Accusé d'être dérivé des clones Ippolit/Robbolito, puis (versions 5–6) de Stockfish, ce qui a mené au litige Stockfish c. ChessBase en 2021. Il s'agit d'accusations, pas toutes tranchées.",
    whereToMeet: 'Archives de parties, anciennes versions ChessBase.',
    historical: true,
  },
];

export interface ComparisonRow {
  name: string;
  search: string;
  evaluation: string;
  hardware: 'CPU' | 'GPU' | 'TPU' | 'CPU/GPU';
  openSource: 'Oui' | 'Non' | 'Partiel';
  strength: string;
}

export const COMPARISON: ComparisonRow[] = [
  { name: 'Stockfish 19', search: 'Alpha-bêta (PVS)', evaluation: 'NNUE', hardware: 'CPU', openSource: 'Oui', strength: '★★★★★ n° 1 (≈ 3 650 CCRL)' },
  { name: 'Leela (Lc0)', search: 'MCTS / PUCT', evaluation: 'Réseau profond policy + value', hardware: 'GPU', openSource: 'Oui', strength: '★★★★★ top (sur GPU)' },
  { name: 'Torch', search: 'Alpha-bêta', evaluation: 'NNUE', hardware: 'CPU', openSource: 'Non', strength: '★★★★★ (≈ 3 640)' },
  { name: 'Reckless / PlentyChess…', search: 'Alpha-bêta', evaluation: 'NNUE', hardware: 'CPU', openSource: 'Oui', strength: '★★★★★ (≈ 3 630–3 645)' },
  { name: 'Berserk', search: 'Alpha-bêta', evaluation: 'NNUE', hardware: 'CPU', openSource: 'Oui', strength: '★★★★½' },
  { name: 'Komodo Dragon 3.3', search: 'Alpha-bêta (+ mode MCTS)', evaluation: 'NNUE', hardware: 'CPU', openSource: 'Non', strength: '★★★★' },
  { name: 'Ethereal', search: 'Alpha-bêta', evaluation: 'Manuelle → NNUE', hardware: 'CPU', openSource: 'Partiel', strength: '★★★★' },
  { name: 'AlphaZero (2017)', search: 'MCTS / PUCT', evaluation: 'Réseau profond (ResNet)', hardware: 'TPU', openSource: 'Non', strength: 'Historique (> Stockfish 8)' },
  { name: 'Houdini 6 (2017)', search: 'Alpha-bêta', evaluation: 'Manuelle', hardware: 'CPU', openSource: 'Non', strength: 'Historique' },
  { name: 'Maia', search: 'Aucune (policy seule)', evaluation: 'Réseau type Leela imitant les humains', hardware: 'CPU/GPU', openSource: 'Oui', strength: '1100–1900 (voulu)' },
];

export interface Concept {
  id: string;
  title: string;
  /** Paragraphes (mini-balisage **gras** / `code`). */
  body: string[];
  /** Encadré « en une phrase ». */
  takeaway?: string;
  /** Visualisation à afficher sous le texte. */
  visual?: 'alphabeta' | 'nnue' | 'mcts' | 'demo';
}

export const CONCEPTS: Concept[] = [
  {
    id: 'minimax',
    title: 'Minimax et alpha-bêta',
    body: [
      "Un moteur classique construit un **arbre** : la position actuelle à la racine, chaque coup légal crée une branche, chaque réponse une sous-branche, etc. Aux feuilles, une fonction d'évaluation donne une note. Puis on remonte : quand c'est aux Blancs de jouer, ils prennent le **maximum** des notes de leurs coups ; quand c'est aux Noirs, ils prennent le **minimum**. C'est le **minimax** : « je joue le coup dont la pire conséquence est la meilleure ».",
      "Problème : avec ~35 coups légaux par position, 6 demi-coups représentent déjà ~1,8 milliard de feuilles. **L'élagage alpha-bêta** évite de calculer des branches qui ne peuvent pas changer le résultat. Intuition : « J'ai déjà un coup qui me garantit +3. J'examine un autre coup, et je découvre que l'adversaire a une réponse qui me laisse à +2. Inutile de chercher ses autres réponses : ce coup est déjà moins bon que mon +3. » **α** est ce que le joueur Max s'est déjà assuré, **β** ce que Min s'est déjà assuré ; dès que α ≥ β, on coupe.",
      "Avec un bon **ordre des coups** (essayer d'abord les meilleurs), alpha-bêta ne visite qu'environ la racine carrée des nœuds de minimax : à temps égal, on calcule presque **deux fois plus profond**. D'où l'obsession des moteurs pour l'ordonnancement : coup de la table de transposition d'abord, puis captures (MVV-LVA), coups « killer », historique…",
    ],
    takeaway: "Alpha-bêta donne exactement le même résultat que minimax, en sautant les branches qui ne peuvent pas changer la décision.",
    visual: 'alphabeta',
  },
  {
    id: 'pruning',
    title: 'Élagages agressifs : null move et LMR',
    body: [
      "Alpha-bêta est « sûr ». Les moteurs modernes ajoutent des élagages **risqués mais rentables** :",
      "**Null move pruning** : « Et si je passais mon tour ? » Si même en laissant l'adversaire jouer deux fois de suite ma position reste au-dessus de β, alors ma position est si bonne que la branche ne vaut pas la peine d'être calculée en détail. On teste cela avec une recherche réduite, très bon marché. (Dangereux en finale à cause du zugzwang, où passer serait justement un avantage : les moteurs le désactivent alors.)",
      "**LMR (Late Move Reductions)** : grâce au bon ordre des coups, les derniers coups de la liste sont rarement bons. On les cherche donc **moins profondément** ; si l'un d'eux surprend en dépassant α, on le re-cherche à pleine profondeur. Ajoutez le futility pruning, le late move pruning, les extensions de coups singuliers… Résultat : Stockfish a un facteur de branchement effectif inférieur à 2, au lieu de ~35.",
    ],
    takeaway: "Un moteur moderne ne regarde sérieusement qu'une poignée de coups par position — un peu comme un humain, mais choisis par statistiques.",
  },
  {
    id: 'iterative',
    title: 'Approfondissement itératif',
    body: [
      "Plutôt que de lancer directement une recherche à profondeur 20, le moteur cherche à profondeur 1, puis 2, puis 3… Ça paraît du gaspillage, mais chaque itération ne coûte qu'une fraction de la suivante, et elle fournit le **meilleur ordre des coups** pour l'itération suivante (via la table de transposition). On peut aussi s'arrêter à tout moment avec un coup valable : idéal pour gérer la pendule.",
      "C'est exactement ce que tu vois défiler dans une analyse Lichess : « profondeur 18… 19… 20 ». Et parfois, **le meilleur coup change** quand la profondeur augmente : une ressource cachée apparaît enfin dans l'horizon de calcul. La démo ci-dessous le montre en direct.",
    ],
    visual: 'demo',
  },
  {
    id: 'tt',
    title: 'Tables de transposition et hachage Zobrist',
    body: [
      "La même position peut être atteinte par des ordres de coups différents (1.e4 e5 2.Cf3 = 1.Cf3 e5 2.e4) : c'est une **transposition**. Le moteur garde en mémoire (option `Hash`, en Mo) un grand tableau : position → meilleur coup, score, profondeur. Avant de chercher une position, il regarde s'il la connaît déjà.",
      "Pour indexer ce tableau, il faut une « empreinte » rapide : le **hachage Zobrist**. On tire au hasard un nombre de 64 bits pour chaque couple (pièce, case), plus le trait, les roques et la prise en passant. L'empreinte d'une position est le XOR de tous ces nombres. Jouer un coup ne coûte que 2 ou 3 XOR (retirer la pièce de sa case, la remettre sur l'autre) : pas besoin de tout recalculer.",
    ],
    takeaway: "La mémoire du moteur lui évite de recalculer les mêmes positions, et le XOR rend l'empreinte quasi gratuite.",
  },
  {
    id: 'quiescence',
    title: "Quiescence et effet d'horizon",
    body: [
      "Si on arrête la recherche pile au moment où ta dame vient de prendre un pion défendu, l'évaluation dira « +1 pion » alors que la dame est perdue au coup suivant. C'est l'**effet d'horizon** : ce qui se passe juste après la profondeur limite est invisible. Un moteur naïf peut même retarder une catastrophe inévitable par des coups inutiles pour la « repousser » au-delà de l'horizon.",
      "Remède : la **recherche de quiescence**. Aux feuilles, au lieu d'évaluer tout de suite, le moteur continue à jouer **uniquement les captures** (et parfois les échecs) jusqu'à une position « calme ». Les échanges en cours sont ainsi résolus avant de noter la position.",
    ],
  },
  {
    id: 'eval',
    title: 'Évaluation : à la main, NNUE ou réseau profond',
    body: [
      "**Évaluation classique** (avant 2020) : une somme de termes écrits par des humains. Matériel (P=1, C=F≈3, T=5, D=9, en centipions), **tables pièce-case** (un cavalier vaut plus au centre qu'au bord, un roi doit rester abrité en milieu de partie mais s'activer en finale), puis des centaines de termes : paire de fous, pions doublés/isolés/passés, mobilité, sécurité du roi, tours sur colonne ouverte… Les poids sont ensuite ajustés automatiquement sur des millions de positions.",
      "**NNUE** remplace cette somme par un petit réseau de neurones. Les entrées sont des milliers de cases binaires « telle pièce sur telle case, sachant que **mon roi** est sur telle case » (famille **HalfKP** puis **HalfKA** : K = roi, P = pièces, A = toutes les pièces y compris les rois). Seules ~30 entrées sont actives à la fois. La première couche (l'**accumulateur**, ~1 000 neurones par camp) est énorme, mais quand un coup déplace une pièce, seules 2 à 4 entrées changent : on **ajoute et soustrait quelques colonnes de poids** au lieu de tout recalculer. Les couches suivantes sont minuscules (quelques dizaines de neurones) et calculées en entiers 8/16 bits avec les instructions vectorielles (SIMD) du processeur. Résultat : une évaluation bien plus fine, à une vitesse comparable — **pas besoin de GPU**.",
      "Ce mécanisme ne marche que si une position évaluée est « voisine » de la précédente — exactement ce que fait une recherche alpha-bêta qui joue et déjoue des coups. Quand le roi bouge, sa moitié d'accumulateur doit être recalculée (d'où les astuces de cache dans Stockfish).",
      "**Réseau profond + MCTS** (AlphaZero, Leela) : un gros réseau (des dizaines de couches, aujourd'hui des Transformers chez Leela) regarde l'échiquier entier et produit deux sorties : une **policy** (« quels coups ont l'air prometteurs », une probabilité par coup) et une **value** (« qui gagne », en probabilités Victoire/Nulle/Défaite). Chaque évaluation est ~1 000 fois plus coûteuse qu'avec NNUE, il faut donc chercher beaucoup moins de positions : c'est le rôle du **MCTS**.",
    ],
    visual: 'nnue',
  },
  {
    id: 'mcts',
    title: 'MCTS et PUCT : chercher peu, mais bien',
    body: [
      "Le MCTS d'AlphaZero/Leela répète des milliers de fois quatre étapes : **Sélection** (descendre dans l'arbre en choisissant à chaque nœud le coup qui maximise la formule **PUCT** : valeur moyenne observée + bonus d'exploration proportionnel à la policy et décroissant avec le nombre de visites) → **Expansion** (une nouvelle position est atteinte) → **Évaluation** par le réseau (policy pour ses coups, value pour la note) → **Rétropropagation** (la value remonte le chemin et met à jour les moyennes).",
      "Contrairement à alpha-bêta, il n'y a pas de « profondeur » fixe : l'arbre est très asymétrique, profond sur les lignes prometteuses. Le coup joué est celui qui a reçu **le plus de visites**. Point faible : une tactique cachée derrière un coup que la policy juge improbable peut être explorée trop tard.",
    ],
    visual: 'mcts',
  },
  {
    id: 'selfplay',
    title: 'Auto-apprentissage par self-play',
    body: [
      "Comment entraîner le réseau sans parties humaines ? Le moteur joue des millions de parties contre lui-même. Pour chaque position, on enregistre la distribution de visites du MCTS (meilleure que la policy brute) et le résultat final de la partie. On entraîne ensuite le réseau à **prédire ces visites** (policy) et **ce résultat** (value). Le nouveau réseau joue mieux, produit de meilleures parties, et ainsi de suite : une boucle d'amélioration autonome.",
      "Les réseaux NNUE de Stockfish, eux, sont entraînés de façon **supervisée** sur des milliards de positions notées par une recherche (une partie de ces données provient d'ailleurs de Leela) : moins « pur », mais très efficace.",
    ],
  },
  {
    id: 'cp-wdl',
    title: 'Centipions vs WDL',
    body: [
      "Le **centipion** (cp) est l'unité historique : +100 ≈ un pion d'avance pour les Blancs. Mais « +1,5 » ne dit pas directement tes chances : dans une finale de fous de couleurs opposées, +1,5 peut être nulle ; dans une attaque de mat, c'est presque gagné.",
      "Le **WDL** (Win/Draw/Loss) donne des probabilités, par exemple « 42 % gain, 55 % nulle, 3 % perte ». C'est la sortie naturelle des réseaux value de Leela. Stockfish calcule lui aussi un WDL à partir de son score (option `UCI_ShowWDL`), et depuis 2022 son échelle est normalisée : **+1,00 correspond à environ 50 % de chances de gain** entre moteurs forts. Les sites (Lichess, chess.com) convertissent les cp en « probabilité de gain » pour classer tes coups en imprécision/erreur/gaffe.",
    ],
  },
  {
    id: 'depth-nps',
    title: 'Profondeur, nœuds par seconde, MultiPV',
    body: [
      "La **profondeur** affichée est la profondeur nominale de l'itération en demi-coups ; avec les réductions et extensions, certaines lignes vont bien plus loin (la « seldepth »), d'autres moins. Comparer les profondeurs de deux moteurs différents n'a donc pas grand sens.",
      "Les **nœuds par seconde** (nps) mesurent la vitesse : un Stockfish sur un PC récent multicœur visite des dizaines de millions de positions par seconde ; Leela sur GPU quelques dizaines de milliers — et pourtant ils sont de force comparable. La qualité de chaque nœud compte autant que leur nombre.",
      "**MultiPV** demande au moteur les N meilleures lignes au lieu d'une seule. C'est plus lent (chaque ligne doit être prouvée), mais très instructif : si les trois premiers coups sont à 0,1 près, la position est « tolérante » ; si le 2e coup perd 3 points, il y a un coup unique à trouver. Ce site utilise MultiPV pour expliquer « pourquoi pas X ? ».",
    ],
  },
  {
    id: 'tablebases',
    title: 'Tablebases Syzygy et livres d’ouvertures',
    body: [
      "Les **tablebases** contiennent le résultat parfait de toutes les positions avec peu de pièces, calculé à rebours depuis les mats. Les tables **Syzygy** (Ronald de Man) couvrent jusqu'à **7 pièces** (complétées en 2018, ~18 To). Quand une recherche atteint une position à 7 pièces ou moins, le moteur connaît la vérité absolue : gain, nulle ou perte. Lichess les propose dans son analyse.",
      "Les **livres d'ouvertures** sont des bases de coups préparés à l'avance (souvent issus de parties de maîtres ou de calculs). Les moteurs n'en ont plus vraiment besoin pour bien jouer, mais les tournois en imposent pour varier les parties : au TCEC, chaque ouverture imposée est jouée deux fois, couleurs inversées.",
    ],
  },
  {
    id: 'testing',
    title: 'Fishtest, OpenBench et tests SPRT',
    body: [
      "Comment savoir si un changement de 3 lignes rend Stockfish plus fort ? En le faisant jouer. Beaucoup. Sur **Fishtest**, des bénévoles prêtent leurs processeurs ; chaque patch joue des dizaines de milliers de parties rapides contre la version de référence.",
      "Le verdict est donné par un **SPRT** (Sequential Probability Ratio Test) : on fixe deux hypothèses, par exemple « gain ≤ 0 Elo » contre « gain ≥ 2 Elo », et on met à jour un rapport de vraisemblance après chaque paire de parties. Le test s'arrête dès que l'une des hypothèses est suffisamment probable — tôt pour les patchs clairement bons ou mauvais, tard pour les cas serrés. C'est de l'A/B testing statistiquement rigoureux, appliqué au code. **OpenBench** (Andrew Grant) offre le même outil à d'autres moteurs.",
    ],
  },
  {
    id: 'rankings',
    title: 'TCEC, CCC et CCRL : qui est le plus fort ?',
    body: [
      "**TCEC** (Top Chess Engine Championship) est le « championnat du monde » officieux, organisé en saisons depuis 2010 sur du matériel puissant, avec ouvertures imposées. La **superfinale** oppose les deux meilleurs : Stockfish y a remporté 19 titres, Leela 2.",
      "**CCC** (Computer Chess Championship) est l'équivalent organisé par chess.com, avec beaucoup de cadences rapides. **CCRL** (Computer Chess Rating Lists) publie des classements Elo calculés sur des dizaines de milliers de parties en conditions standardisées (par ex. 40 coups en 15 minutes sur un seul cœur). Attention : ces Elo (~3 600) ne sont **pas comparables** aux Elo humains, ils ne mesurent que les moteurs entre eux.",
    ],
  },
  {
    id: 'weak',
    title: 'Comment un moteur se bride pour jouer à 1200',
    body: [
      "Stockfish propose deux réglages : **Skill Level** (0 à 20) et **UCI_LimitStrength + UCI_Elo** (de 1320 à 3190, calibré sur l'échelle CCRL). En interne, il cherche à faible profondeur puis choisit **volontairement un coup moins bon** parmi les meilleurs candidats (MultiPV), avec un tirage aléatoire pondéré par la faiblesse demandée.",
      "Le résultat est **peu humain** : le moteur joue 15 coups parfaits puis lâche une tour sans raison, ou rate un mat en 1 tout en trouvant une manœuvre positionnelle brillante. Un vrai 1200 ne se trompe pas « au hasard » : il oublie les reculs de pièces, sous-estime les coups calmes, rate les fourchettes de cavalier… C'est précisément ce que **Maia** apprend en imitant des millions de parties humaines. Le bot de ce site combine Skill Level, profondeur réduite et erreurs choisies parmi les lignes MultiPV ; c'est une approximation.",
    ],
    takeaway: "Un moteur bridé fait des erreurs aléatoires ; un humain fait des erreurs typiques. Maia imite les secondes.",
  },
];

export const TIPS: { title: string; text: string }[] = [
  {
    title: "Joue d'abord, analyse ensuite",
    text: "Pendant la partie, aucun moteur (évidemment). Après : commence par revoir la partie **toi-même**, sans évaluation, et note les moments où tu as hésité. Ensuite seulement, compare avec le moteur.",
  },
  {
    title: "Cache la barre d'évaluation",
    text: "Une éval affichée en permanence court-circuite ta réflexion. Cherche le coup, engage-toi, puis vérifie. Le progrès vient de l'écart entre ton idée et celle du moteur.",
  },
  {
    title: 'Demande « pourquoi », pas seulement « quoi »',
    text: "Un « +2,3 » ne t'apprend rien. Joue la variation du moteur sur l'échiquier, regarde ce qu'elle menace, et demande-toi pourquoi ton coup était moins bon. C'est le rôle de l'explication en mots de ce site (pages Analyse et Jouer).",
  },
  {
    title: 'Concentre-toi sur les grosses erreurs',
    text: "À 1200, l'essentiel des points se perd sur des pièces en prise et des tactiques à 2–3 coups. Ignore les différences de 0,2 : une « imprécision » de moteur est souvent un coup tout à fait jouable pour un humain.",
  },
  {
    title: 'Méfie-toi des coups « de moteur »',
    text: "Si le meilleur coup demande de calculer 15 coups précis, il n'est pas forcément le bon choix pratique. Regarde aussi les lignes 2 et 3 (MultiPV) : souvent un coup presque aussi bon est bien plus simple à jouer.",
  },
  {
    title: 'Laisse le moteur réfléchir',
    text: "Une évaluation à profondeur 10 peut être fausse (voir la démo). Pour une position critique, attends une profondeur d'au moins 20, ou regarde si le meilleur coup reste stable sur plusieurs profondeurs.",
  },
  {
    title: 'Entraîne-toi contre des adversaires crédibles',
    text: "Contre un Stockfish bridé, tu apprends à profiter de cadeaux aléatoires. Contre Maia (bots Lichess) ou des humains, tu apprends à battre les erreurs que tu rencontreras vraiment.",
  },
];

export interface DemoPosition {
  id: string;
  name: string;
  fen: string;
  depth: number;
  description: string;
  /** Ce que la démo est censée montrer (vérifié avec Stockfish 17.1 lite, Hash par défaut, après ucinewgame). */
  expectation: string;
}

export const DEMO_POSITIONS: DemoPosition[] = [
  {
    id: 'bk02',
    name: 'La rupture d4-d5 (le meilleur coup change sans cesse)',
    fen: '3r1k2/4npp1/1ppr3p/p6P/P2PPPP1/1NR5/5K2/2R5 w - - 0 1',
    depth: 23,
    description: "Position n° 2 du test Bratko-Kopec (1982). Les Blancs ont plus d'espace ; la solution est la rupture de pion d5!, qui ouvre le jeu au bon moment.",
    expectation: "Le moteur hésite longtemps (f5, Tc2, Rf3, Tb1, Re3…) et ne trouve d5! qu'autour de la profondeur 21 : l'éval remonte alors nettement. Compte 30 à 60 secondes.",
  },
  {
    id: 'wac229',
    name: 'Le coup de fou Fh4 (tactique)',
    fen: 'r1b1k2r/1pp1q2p/p1n3p1/3QPp2/8/1BP3B1/P5PP/3R1RK1 w kq - 0 1',
    depth: 20,
    description: "Position du recueil « Win At Chess ». Le coup naturel e6 menace beaucoup, mais il y a plus fort.",
    expectation: "Jusqu'à la profondeur 6 environ, le moteur préfère e6 ; ensuite il découvre Fh4!, qui chasse la dame adverse avec un gain décisif, et l'éval grimpe vers +5.",
  },
  {
    id: 'bk17',
    name: 'Ouvrir le jeu avec f4',
    fen: 'r2qnrnk/p2b2b1/1p1p2pp/2pPpp2/1PP1P3/PRNBB3/3QNPPP/5RK1 w - - 0 1',
    depth: 20,
    description: "Position n° 17 du test Bratko-Kopec : structure bloquée, typique d'une Est-Indienne. Quelle rupture choisir ?",
    expectation: "Aux faibles profondeurs, b4xc5 ou exf5 ; à partir de la profondeur 9 environ, f4! s'impose définitivement.",
  },
  {
    id: 'bk14',
    name: 'Finale de tours : la poussée g6',
    fen: '2r3k1/pppR1pp1/4p3/4P1P1/5P2/1P4K1/P1P5/8 w - - 0 1',
    depth: 22,
    description: "Position n° 14 du test Bratko-Kopec. Les Blancs ont une tour en 7e ; comment en profiter ?",
    expectation: "Le moteur passe de a4 / Rf2 à g6! vers la profondeur 7, puis l'évaluation monte régulièrement de +0,8 à plus de +2 : il « comprend » progressivement l'attaque sur f7.",
  },
];

export const SOURCES: { label: string; url: string }[] = [
  { label: 'Chessprogramming wiki (Stockfish, Leela, Torch, Ethereal, Berserk, Houdini, Syzygy…)', url: 'https://www.chessprogramming.org/' },
  { label: 'Stockfish — blog officiel (versions 16.1, 18, 19)', url: 'https://stockfishchess.org/blog/' },
  { label: 'Stockfish — dépôt GitHub et options UCI', url: 'https://github.com/official-stockfish/Stockfish/wiki/UCI-&-Commands' },
  { label: 'Leela Chess Zero — dépôt GitHub', url: 'https://github.com/LeelaChessZero/lc0' },
  { label: 'DeepMind — AlphaZero (article Science 2018)', url: 'https://deepmind.google/blog/alphazero-shedding-new-light-grand-games-chess-shogi-and-go/' },
  { label: 'Chess.com — annonce de Torch', url: 'https://www.chess.com/news/view/torch-chess-engine' },
  { label: 'Komodo Chess — Dragon 3.3', url: 'https://komodochess.com/dragon-3.3.htm' },
  { label: 'Maia Chess (CSSLab) — code et article KDD 2020', url: 'https://github.com/CSSLab/maia-chess' },
  { label: 'Maia-2 (NeurIPS 2024)', url: 'https://arxiv.org/abs/2409.20553' },
  { label: 'NNUE — Wikipédia', url: 'https://en.wikipedia.org/wiki/Efficiently_updatable_neural_network' },
  { label: 'CCRL 40/15 — classement', url: 'https://computerchess.org.uk/ccrl/4040/' },
  { label: 'TCEC', url: 'https://tcec-chess.com/' },
  { label: 'Chessdom — superfinale TCEC saison 29 (2026)', url: 'https://www.chessdom.com/stockfish-claims-its-19th-tcec-title-defeating-reckless-in-the-superfinal/' },
  { label: 'ChessBase — Kramnik vs Deep Fritz (2006)', url: 'https://en.chessbase.com/newsroom/post/kramnik-vs-deep-fritz-computer-wins-match-by-4-2' },
  { label: 'ChessBase — « A Gross Miscarriage of Justice » (affaire Rybka, 2012)', url: 'https://en.chessbase.com/post/a-gro-miscarriage-of-justice-in-computer-che-part-three' },
];
