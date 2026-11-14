import type { Lesson } from './types';

const convertirAvantage: Lesson = {
  id: 'convertir-avantage',
  title: 'Convertir un avantage',
  level: '1500-1800',
  summary:
    'Gagner une position gagnante : principe des deux faiblesses, ne pas se presser, échanger les bonnes pièces quand on est devant, simplifier vers une finale de pions gagnée.',
  sections: [
    {
      type: 'text',
      title: 'Pourquoi les positions gagnantes ne se gagnent pas toutes seules',
      paragraphs: [
        'Combien de fois as-tu eu « +3 » et fait nulle, voire perdu ? La conversion est une compétence à part entière. Elle repose sur quelques principes classiques, formulés par Capablanca et Nimzowitsch, puis systématisés par Chéréchevski et Dvoretsky.',
        '**Le principe des deux faiblesses** : une seule faiblesse adverse se défend presque toujours — l’adversaire y concentre ses pièces. Il faut en créer une **seconde**, loin de la première (souvent sur l’autre aile), puis faire basculer l’attaque de l’une à l’autre plus vite que la défense ne peut suivre. Le pion passé éloigné est la forme la plus pure de ce principe : il attire le roi adverse, et l’autre aile tombe.',
        '**Ne pas se presser** (principe popularisé par Chéréchevski dans *La stratégie des finales*) : quand l’adversaire n’a aucun contre-jeu, améliore d’abord toutes tes pièces, mets ton roi à l’abri, supprime ses dernières ressources (échecs, ruptures, pièces actives) — et seulement ensuite passe à l’action. Chaque coup « utile mais pas pressé » rend la conversion plus sûre. Le contraire, c’est le coup de pion irréversible joué trop tôt, qui donne une case ou une colonne à l’adversaire.',
        '**Échanger quand on est devant** : chaque échange augmente le poids relatif de ton avantage matériel et réduit le contre-jeu adverse. Mais échange **les bonnes pièces** : les pièces actives de l’adversaire (surtout celles qui attaquent ton roi), pas tes propres pièces dominantes. Et surtout, **les pions** de ton côté valent de l’or : n’échange pas les pions quand tu es devant en matériel, échange les pièces.',
        '**La simplification vers une finale de pions** est l’arme ultime : une finale de pions avec un pion de plus (surtout un pion passé éloigné) est presque toujours gagnante, alors qu’avec les tours sur l’échiquier la même avance est souvent nulle. Mais une finale de pions se **calcule** jusqu’au bout : on ne revient pas en arrière.',
      ],
    },
    {
      type: 'position',
      title: 'Deux faiblesses : le pion passé éloigné et l’aile roi',
      fen: '8/5pp1/4k2p/8/P3K3/6PP/5P2/8 w - - 0 1',
      caption:
        'Les Blancs ont un pion de plus : le pion a4, passé et éloigné. C’est la première faiblesse des Noirs (leur roi devra s’en occuper). Les Blancs en créent une seconde sur l’aile roi en y fabriquant un second pion passé. Stockfish : gain blanc net.',
      arrows: [
        { from: 'a4', to: 'a8', kind: 'idea' },
        { from: 'g3', to: 'g4', kind: 'good' },
      ],
      moves: [
        { uci: 'g3g4', comment: '1.g4 : on fixe l’aile roi et on prépare la création d’un second pion passé.' },
        { uci: 'h6h5', comment: '1…h5 : les Noirs cherchent à échanger des pions.' },
        { uci: 'g4h5', comment: '2.gxh5.' },
        { uci: 'g7g5', comment: '2…g5 : sinon le pion h5 avance.' },
        { uci: 'h5g6', comment: '3.hxg6 (prise en passant) fxg6.' },
        { uci: 'f7g6', comment: '3…fxg6.' },
        { uci: 'a4a5', comment: '4.a5 : le premier pion passé attire le roi noir…' },
        { uci: 'e6d6', comment: '4…Rd6.' },
        { uci: 'h3h4', comment: '5.h4 : …et le second pion passé (h) est prêt. Le roi noir ne peut pas surveiller les deux.' },
      ],
    },
    {
      type: 'position',
      title: 'Un pion de plus… qui ne suffit pas',
      fen: '8/5pk1/R5p1/p6p/P6P/6P1/5PK1/1r6 w - - 0 1',
      caption:
        'Les Blancs vont gagner le pion a5. Mais quatre pions contre trois du même côté, en finale de tours, c’est souvent nul : Stockfish ne donne que +0,3 après la prise. Comparer avec l’exercice 1, où la même avance matérielle sans les tours est gagnante. Conclusion : quand on est devant, chercher l’échange des tours.',
      moves: [
        { uci: 'a6a5', comment: '1.Txa5 : le pion est gagné…' },
        { uci: 'b1b3', comment: '1…Tb3 : …mais la tour noire s’active immédiatement.' },
        { uci: 'g2f1', comment: '2.Rf1.' },
        { uci: 'b3a3', comment: '2…Ta3 : la tour se place derrière le pion passé (règle de Tarrasch).' },
        { uci: 'a5a7', comment: '3.Ta7.' },
        { uci: 'a3a2', comment: '3…Ta2.' },
        { uci: 'a4a5', comment: '4.a5 : le pion avance, mais la tour noire derrière lui et le roi noir près de g7 tiennent. Nulle probable.' },
      ],
    },
  ],
  exercises: [
    {
      title: 'Vers la finale de pions',
      fen: '3r4/4kppp/8/8/P7/8/5PPP/3R1K2 w - - 0 1',
      prompt: 'Les Blancs ont un pion a de plus. Garder les tours, ou simplifier ?',
      solution: ['d1d8', 'e7d8'],
      explanation:
        '**1.Txd8! Rxd8** : la finale de pions est gagnante (Stockfish : plus de +5). Le pion a est un pion passé éloigné : le roi noir doit courir vers lui, et le roi blanc dévore l’aile roi. Avec les tours, en revanche, les Noirs placent leur tour derrière le pion a et l’évaluation tombe autour de +2 : 4 contre 3 du même côté avec un pion a, c’est la finale de tours la plus nulle qui soit. Échanger quand on est devant — à condition d’avoir calculé la finale de pions.',
    },
    {
      title: 'Même principe, avec les dames',
      fen: '3q4/4kppp/8/8/P7/8/5PPP/3Q2K1 w - - 0 1',
      prompt: 'Les dames se font face sur la colonne d. Que faire ?',
      solution: ['d1d8', 'e7d8'],
      explanation:
        '**1.Dxd8+! Rxd8** : on retrouve une finale de pions gagnante grâce au pion passé éloigné. Garder les dames (1.De1+ ou 1.Dc2) laisse aux Noirs des échecs perpétuels potentiels contre le roi blanc et une défense active : l’avantage reste, mais la victoire devient incertaine. Avec la dame, l’adversaire a toujours des ressources ; sans elle, il n’en a plus aucune.',
    },
    {
      title: 'Échanger la bonne pièce',
      fen: '8/3bkppp/8/1B6/P7/8/5PPP/6K1 w - - 0 1',
      prompt:
        'Fous de même couleur, un pion de plus. Les Noirs menacent …Fxb5, qui laisserait les Blancs avec un pion b doublé. Choisis bien l’échange.',
      solution: ['b5d7', 'e7d7'],
      explanation:
        '**1.Fxd7! Rxd7** : c’est aux Blancs de prendre, pas aux Noirs. Après 1.Fxd7, le pion a reste un pion passé éloigné et la finale de pions est gagnante. Si les Blancs laissent les Noirs prendre (par exemple 1.g4? Fxb5 2.axb5), le pion passé devient un pion b que le roi noir rattrape facilement : Stockfish donne l’égalité. Un échange n’est pas neutre : la question est toujours *quelle structure reste après*.',
    },
  ],
};

export default convertirAvantage;
