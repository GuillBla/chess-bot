import type { Lesson } from './types';

const attaqueSurLeRoi: Lesson = {
  id: 'attaque-sur-le-roi',
  title: 'Attaque sur le roi : roques opposés, sacrifices thématiques',
  level: '1500-1800',
  summary:
    'Course de pions sur roques opposés, attaque avec roques du même côté, et les sacrifices à connaître : Fxh7+ (le « sacrifice grec »), double sacrifice de fous, Cd5/Cf5, sacrifice de qualité.',
  sections: [
    {
      type: 'text',
      title: 'Les conditions d’une attaque',
      paragraphs: [
        'Une attaque réussie n’est pas une question d’audace mais de **conditions** (Vukovic, *L’art de l’attaque*) : plus de pièces près du roi adverse que de défenseurs, des lignes ouvertes ou ouvrables vers lui, et un centre stable (un centre mobile permet à l’adversaire de contre-attaquer au milieu). Compte les attaquants et les défenseurs avant de sacrifier.',
        '**Roques opposés** : c’est une course. Les pions qui avancent vers le roi adverse ne découvrent pas ton propre roi, donc on pousse sans retenue (h4–h5, g4–g5 contre le petit roque). Chaque temps compte : on n’échange pas un attaquant contre une pièce passive, on ouvre une colonne plutôt que d’en fermer une, et un sacrifice qui ouvre une ligne d’un temps plus tôt vaut souvent plus que le matériel. Le défenseur, lui, fait de la prophylaxie au bon moment (Rb1, …Rh8) et sacrifie volontiers une qualité pour casser l’attaque (…Txc3 dans la Dragon).',
        '**Roques du même côté** : pousser ses pions devant son roi est risqué, donc l’attaque se fait surtout avec les pièces (transfert de tour par la 3e rangée, cavalier en f5/g5, dame en h5) et par des sacrifices sur h7, g7, f7, h6 ou e6.',
        '**Le sacrifice grec Fxh7+** fonctionne quand : un fou vise h7 (Fd3), un cavalier peut venir en g5 avec échec, la dame peut rejoindre h5 (ou g4), et **aucune pièce noire ne défend h7 ni ne contrôle g5** (pas de cavalier en f6, souvent chassé par un pion e5 ; pas de fou e7 qui reprendrait en g5 avec gain). **Le double sacrifice** (Lasker 1889) ajoute Fxg7 : les deux fous se sacrifient pour mettre le roi à nu. **Cd5 / Cf5** : dans la Sicilienne ou les positions à pion e4, le cavalier se sacrifie sur d5 ou f5 pour ouvrir la colonne e ou la diagonale vers le roi.',
      ],
    },
    {
      type: 'position',
      title: 'Roques opposés : la Dragon yougoslave',
      fen: '2rq1rk1/pp1bppb1/3p1np1/4n2p/3NP2P/1BN1BP2/PPPQ2P1/2KR3R w - - 0 13',
      caption:
        'Les Blancs veulent ouvrir la colonne h (g2–g4 contre le pion h5) et échanger le fou g7 par Fh6. Les Noirs ont leurs propres armes : …Cc4 pour éliminer le fou b3, la colonne c ouverte et le sacrifice de qualité …Txc3 qui détruit l’abri du roi blanc. Stockfish recommande d’abord 13.Rb1 : un coup prophylactique qui sort le roi de la colonne c avant que les Noirs n’attaquent.',
      arrows: [
        { from: 'g2', to: 'g4', kind: 'idea' },
        { from: 'e3', to: 'h6', kind: 'idea' },
        { from: 'c8', to: 'c3', kind: 'threat' },
        { from: 'e5', to: 'c4', kind: 'threat' },
      ],
      marks: [
        { square: 'c1', kind: 'target' },
        { square: 'g8', kind: 'target' },
      ],
    },
    {
      type: 'position',
      title: 'Lasker – Bauer, Amsterdam 1889 : après le double sacrifice',
      fen: 'r4r2/1b2bpk1/ppq1p3/2pp3Q/5P2/1P2P3/P1PP2PP/R4RK1 w - - 0 18',
      caption:
        'Lasker vient de sacrifier ses deux fous en h7 et g7 (exercice 2). Le roi noir est nu ; il reste à amener la tour f1 par la 3e rangée. Observe comment chaque coup est un échec ou une menace de mat.',
      arrows: [
        { from: 'h5', to: 'g4', kind: 'good' },
        { from: 'f1', to: 'f3', kind: 'idea' },
        { from: 'f3', to: 'h3', kind: 'idea' },
      ],
      moves: [
        { uci: 'h5g4', comment: '18.Dg4+ : la dame contrôle la colonne g.' },
        { uci: 'g7h7', comment: '18…Rh7.' },
        { uci: 'f1f3', comment: '19.Tf3 : la tour menace Th3#.' },
        { uci: 'e6e5', comment: '19…e5 : pour défendre par …Dh6 via la 6e rangée.' },
        { uci: 'f3h3', comment: '20.Th3+.' },
        { uci: 'c6h6', comment: '20…Dh6.' },
        { uci: 'h3h6', comment: '21.Txh6+ Rxh6.' },
        { uci: 'h7h6', comment: '21…Rxh6.' },
        { uci: 'g4d7', comment: '22.Dd7! : la fourchette — la dame attaque e7 et b7.' },
        { uci: 'e7f6', comment: '22…Ff6.' },
        { uci: 'd7b7', comment: '23.Dxb7 : les Blancs ont récupéré le matériel avec une dame contre deux tours et un roi exposé. Lasker gagna.' },
      ],
    },
  ],
  exercises: [
    {
      title: 'Le sacrifice grec',
      fen: 'r1b2rk1/pp1n1ppp/1qn1p3/3pP3/1b1P4/2NB1N2/PP3PPP/R1BQ1RK1 w - - 0 1',
      prompt:
        'Fou d3, cavalier f3, dame d1, pion e5 qui chasse tout cavalier de f6, et aucun fou noir en e7 pour contrôler g5 : toutes les conditions sont réunies.',
      solution: ['d3h7', 'g8h7', 'f3g5'],
      explanation:
        '**1.Fxh7+! Rxh7 2.Cg5+** : le roi n’a que de mauvaises cases. Si les Noirs refusent par 1…Rh8, les Blancs ont gagné un pion et gardent une attaque très forte (Stockfish : environ +3). Après 1…Rxh7 : 2…Rg8 3.Dh5 menace Dh7# : la défense est désespérée. 2…Rg6 3.Dd3+ (ou 3.Dg4) et le roi, sorti de son abri, subit une attaque décisive. 2…Rh6 permet un échec à la découverte du fou c1 (par exemple Cxe6+). Le coup « solide » 1.Ca4 (qui chasse la dame) garde un avantage, mais Stockfish l’évalue environ deux pions de moins que le sacrifice.',
    },
    {
      title: 'Lasker – Bauer, Amsterdam 1889',
      fen: 'r4rk1/1b2bppp/ppq1p3/2ppB2n/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 15',
      prompt: 'Les Noirs viennent de prendre le cavalier h5. Ne reprends pas : les deux fous blancs visent le roi.',
      solution: ['d3h7', 'g8h7', 'e2h5', 'h7g8', 'e5g7'],
      explanation:
        '**15.Fxh7+! Rxh7 16.Dxh5+ Rg8 17.Fxg7!!** : le premier fou ouvre h7, la dame reprend le cavalier avec échec, et le second fou détruit le pion g7. Si 17…Rxg7, **18.Dg4+ Rh7 19.Tf3** et la tour arrive en h3 (voir la position commentée) ; les autres réponses ne sauvent pas davantage le roi. La reprise tranquille 15.Dxh5? f5 laisse les Noirs consolider : il fallait garder le rythme.',
    },
    {
      title: 'Edward Lasker – Thomas, Londres 1912',
      fen: 'rn3rk1/pbppq1pp/1p2pb2/4N2Q/3PN3/3B4/PPP2PPP/R3K2R w KQ - 6 11',
      prompt: 'Tout est en place… sauf que la dame doit être sacrifiée. Commence par le coup le plus forcé, et mène la chasse au roi jusqu’au mat.',
      solution: ['h5h7', 'g8h7', 'e4f6', 'h7h6', 'e5g4', 'h6g5', 'h2h4', 'g5f4', 'g2g3'],
      explanation:
        '**11.Dxh7+!! Rxh7 12.Cxf6+** (échec double : cavalier et fou d3) **Rh6 13.Ceg4+ Rg5 14.h4+ Rf4 15.g3+ Rf3 16.Fe2+ Rg2 17.Th2+ Rg1 18.Rd2#** (18.O-O-O# matait aussi). Stockfish note que la chasse pouvait même finir un coup plus tôt (16.O-O ou 16.Rf1 au lieu de 16.Fe2+), et que 14.f4+ valait 14.h4+ : peu importe, tout est forcé. Le roi noir est traîné de g8 à g1. L’attraction du roi par le sacrifice de dame, puis l’échec double, rendent chaque coup noir forcé : c’est le calcul le plus simple qui soit, à condition d’oser le premier coup. Un coup « solide » comme 11.O-O laisse les Noirs échanger le cavalier e5 et l’attaque s’évapore.',
    },
  ],
};

export default attaqueSurLeRoi;
