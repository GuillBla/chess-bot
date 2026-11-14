import type { Lesson } from './types';

const dynamiqueVsStatique: Lesson = {
  id: 'dynamique-vs-statique',
  title: 'Dynamique contre statique : initiative, compensation, timing',
  level: '1800+',
  summary:
    'Avantages durables (structure, matériel, bon contre mauvais fou) contre avantages temporaires (développement, initiative, activité) : quand sacrifier, et pourquoi il faut agir tout de suite.',
  sections: [
    {
      type: 'text',
      title: 'Deux sortes d’avantages',
      paragraphs: [
        'Silman distingue les **déséquilibres** d’une position. Certains sont **statiques** : un pion de plus, une meilleure structure, un avant-poste, la paire de fous, un bon fou contre un mauvais. Ils durent : le temps travaille pour celui qui les possède. D’autres sont **dynamiques** : avance de développement, initiative, roi adverse au centre, pièces plus actives, attaque. Ils sont **temporaires** : si l’on n’agit pas, ils s’évaporent — l’adversaire roque, développe ses pièces, et l’avantage disparaît.',
        'D’où la règle de **timing** : *le camp qui a l’avantage dynamique doit agir immédiatement*, quitte à investir du matériel (pion, qualité, pièce) pour garder l’initiative ; *le camp qui a l’avantage statique doit neutraliser l’activité adverse*, échanger les pièces actives, consolider — et le temps jouera pour lui.',
        '**La compensation** : un sacrifice est justifié si ce qu’on obtient (développement, roi adverse exposé, pièces actives, contrôle d’une colonne) vaut au moins le matériel donné **et ne peut pas être neutralisé à temps**. La question clé n’est pas « combien de temps l’attaque dure-t-elle ? », mais « l’adversaire peut-il consolider ? ». Si oui, le matériel reviendra en pleine force.',
        '**L’initiative** : la capacité à faire des menaces qui obligent l’adversaire à réagir. Tant que tu as l’initiative, l’adversaire ne réalise pas ses propres plans. C’est pourquoi un développement plus rapide se convertit en ouvrant le jeu (rupture centrale, sacrifice de pion) : un roi resté au centre dans une position ouverte est un avantage dynamique colossal.',
      ],
    },
    {
      type: 'position',
      title: 'Steinitz – von Bardeleben, Hastings 1895 : 17.d5!',
      fen: 'r3k2r/pp1qn1pp/2p2p2/8/3P4/5N2/PP2QPPP/2R1R1K1 w kq - 0 17',
      caption:
        'Le roi noir est encore au centre et le cavalier e7 est cloué par la dame e2, soutenue par la tour e1. Avantage dynamique blanc. Steinitz sacrifie un pion pour ouvrir le centre et gagner la case d4 pour son cavalier, avant que les Noirs ne mettent leur roi à l’abri. Stockfish confirme : 17.d5 est nettement le meilleur coup.',
      arrows: [
        { from: 'd4', to: 'd5', kind: 'good' },
        { from: 'f3', to: 'd4', kind: 'idea' },
      ],
      marks: [{ square: 'e8', kind: 'target' }],
      moves: [
        { uci: 'd4d5', comment: '17.d5! : le pion est sacrifié pour gagner du temps et des cases.' },
        { uci: 'c6d5', comment: '17…cxd5.' },
        { uci: 'f3d4', comment: '18.Cd4 : le cavalier occupe la case libérée, bloque le pion isolé d5 et vise e6.' },
        { uci: 'e8f7', comment: '18…Rf7 : le roi cherche un abri…' },
        { uci: 'd4e6', comment: '19.Ce6 : le cavalier s’installe au cœur du camp noir.' },
        { uci: 'h8c8', comment: '19…Thc8.' },
        { uci: 'e2g4', comment: '20.Dg4 : menace Dxg7+.' },
        { uci: 'g7g6', comment: '20…g6.' },
        { uci: 'e6g5', comment: '21.Cg5+ : le roi est chassé vers le centre.' },
        { uci: 'f7e8', comment: '21…Re8 : et c’est la position de l’exercice de la leçon « Tactique avancée » (22.Txe7+!).' },
      ],
    },
    {
      type: 'position',
      title: 'Byrne – Fischer, New York 1956 : la dame contre l’initiative',
      fen: 'r3r1k1/pp3pbp/1qp1b1p1/2B5/2BP4/Q1n2N2/P4PPP/3R1K1R w - - 4 18',
      caption:
        'Fischer, 13 ans, vient de jouer 17…Fe6!! en laissant sa dame en prise. S’il la donne, c’est qu’il reçoit en échange une avalanche d’échecs et de prises : le « moulin » du cavalier et du fou.',
      arrows: [{ from: 'e6', to: 'c4', kind: 'threat' }],
      moves: [
        { uci: 'c5b6', comment: '18.Fxb6 : Byrne prend la dame.' },
        { uci: 'e6c4', comment: '18…Fxc4+ : le fou reprend avec échec, et le moulin commence.' },
        { uci: 'f1g1', comment: '19.Rg1.' },
        { uci: 'c3e2', comment: '19…Ce2+.' },
        { uci: 'g1f1', comment: '20.Rf1.' },
        { uci: 'e2d4', comment: '20…Cxd4+ : échec à la découverte du fou c4, le cavalier prend un pion.' },
        { uci: 'f1g1', comment: '21.Rg1.' },
        { uci: 'd4e2', comment: '21…Ce2+.' },
        { uci: 'g1f1', comment: '22.Rf1.' },
        { uci: 'e2c3', comment: '22…Cc3+ : échec à la découverte, et le cavalier attaque la tour d1.' },
        { uci: 'f1g1', comment: '23.Rg1.' },
        { uci: 'a7b6', comment: '23…axb6 : Fischer a récupéré bien plus que la dame (tour, fou, pions) et gagnera la partie.' },
      ],
    },
  ],
  exercises: [
    {
      title: 'Morphy, 10e coup : le développement avant le matériel',
      fen: 'rn2kb1r/p3qppp/2p2n2/1p2p1B1/2B1P3/1QN5/PPP2PPP/R3K2R w KQkq - 0 10',
      prompt:
        'Morphy contre le duc de Brunswick et le comte Isouard (Paris, 1858). Le fou c4 est attaqué. Les Noirs ont trois pièces non développées et leur roi au centre. Que fait un joueur dynamique ?',
      solution: ['c3b5'],
      explanation:
        '**10.Cxb5!** : Morphy donne une pièce pour deux pions et, surtout, pour ouvrir les lignes vers le roi noir avant qu’il ne roque. Dans la partie : 10…cxb5 11.Fxb5+ Cbd7 12.O-O-O et toutes les pièces blanches arrivent avec gain de temps. Stockfish préfère aussi 10.Cxb5 (meilleure défense 10…Db4+ 11.Dxb4 Fxb4+ 12.c3, et les Blancs gardent un net avantage). Le retrait 10.Fe2 (ou Fd3) est « sain » mais laisse les Noirs terminer leur développement : l’avantage dynamique disparaît.',
    },
    {
      title: 'Morphy, 12e coup : un temps de plus',
      fen: 'r3kb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/R3K2R w KQkq - 1 12',
      prompt: 'Le cavalier d7 est cloué. Quel coup amène une pièce de plus contre lui, avec la sécurité du roi en prime ?',
      solution: ['e1c1'],
      explanation:
        '**12.O-O-O!** : le grand roque met le roi à l’abri **et** amène la tour sur la colonne d contre le cavalier cloué d7, en un seul coup. Le timing est tout : les Noirs n’ont pas le temps de dégager le clouage (…Td8 arrive, mais après 13.Txd7! la combinaison décide). Les coups qui récupèrent du matériel tout de suite (12.Fxf6) relâchent la pression : Stockfish les évalue bien moins favorablement.',
    },
    {
      title: 'Byrne – Fischer, New York 1956 : 11…Ca4!!',
      fen: 'r2q1rk1/pp2ppbp/1np2np1/2Q3B1/3PP1b1/2N2N2/PP3PPP/3RKB1R b K - 6 11',
      prompt:
        'Le roi blanc est encore au centre et le développement blanc est incomplet (fou f1, tour h1). Le jeune Fischer trouve un coup qui ouvre la position à tout prix.',
      solution: ['b6a4', 'c5a3', 'a4c3', 'b2c3', 'f6e4'],
      explanation:
        '**11…Ca4!!** : le cavalier s’offre (12.Cxa4 Cxe4 et la diagonale du fou g7 s’ouvre, le fou g5 et la dame c5 sont en l’air). Après **12.Da3 Cxc3 13.bxc3 Cxe4!**, les Noirs détruisent le centre blanc : le pion e4 tombe et le roi blanc, toujours en e1, fait face à toutes les pièces noires. Fischer jouera ensuite 17…Fe6!! (position commentée). Un coup lent comme 11…Te8 laisse les Blancs roquer et consolider : l’avantage dynamique se perd.',
    },
  ],
};

export default dynamiqueVsStatique;
