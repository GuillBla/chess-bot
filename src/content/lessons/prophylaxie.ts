import type { Lesson } from './types';

const prophylaxie: Lesson = {
  id: 'prophylaxie',
  title: 'Prophylaxie : « que veut l’adversaire ? »',
  level: '1800+',
  summary:
    'Penser au plan adverse avant le sien : la question de Nimzowitsch et Petrosian, les coups prophylactiques, et les fausses prophylaxies qui perdent.',
  sections: [
    {
      type: 'text',
      title: 'La question qui change tout',
      paragraphs: [
        'Nimzowitsch a inventé le mot, Petrosian en a fait un style, Dvoretsky une méthode : la **prophylaxie**, c’est empêcher l’adversaire de réaliser ses idées avant même qu’il ne les joue. Elle part d’une seule question, à poser **à chaque coup adverse** : *si c’était encore à lui de jouer, que ferait-il ?* Imagine que l’adversaire rejoue immédiatement (un « coup nul » de ton côté) et cherche sa meilleure suite : une menace tactique, une rupture de pions, une manœuvre de pièce vers un avant-poste.',
        'Les joueurs de 1500 regardent leurs plans ; les joueurs de 2000 regardent ceux de l’adversaire. La plupart des défaites « sans erreur visible » viennent d’une idée adverse qu’on a laissée se réaliser : un cavalier qui s’installe en d4, une rupture …f5 qui ouvre la colonne, un fou qui arrive sur la grande diagonale.',
        'Les coups prophylactiques typiques : **Rb1/Rh1** (le roi quitte une diagonale ou une colonne qui pourrait s’ouvrir), **a3/a4/h3** (enlever une case à une pièce adverse : …Cb4, …b5, …Fg4), **une tour sur la colonne qui va s’ouvrir** avant qu’elle ne s’ouvre, **échanger la pièce adverse qui menace de devenir forte**. Petrosian ajoutait le sacrifice de qualité « positionnel » pour supprimer une pièce clé ou neutraliser une attaque.',
        'Attention : la prophylaxie doit être **concrète**. Un coup « prophylactique » qui ne tient pas compte des menaces tactiques immédiates est simplement une erreur — les exercices de cette leçon le montrent.',
      ],
    },
    {
      type: 'position',
      title: 'Un coup prophylactique d’ouverture : 6.a3 dans la Française',
      fen: 'r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/P1P2N2/1P3PPP/RNBQKB1R b KQkq - 0 6',
      caption:
        '6.a3 ne développe rien, mais il répond à la question « que veulent les Noirs ? » : …cxd4 suivi de …Fb4+ ou …Cb4 contre la base de la chaîne. Le pion a3 enlève la case b4 aux pièces noires et prépare b2–b4, qui gagne de l’espace et peut chasser une pièce de c5. Les Blancs gardent un léger avantage selon Stockfish.',
      arrows: [{ from: 'b2', to: 'b4', kind: 'idea' }],
      marks: [{ square: 'b4', kind: 'strong' }],
    },
    {
      type: 'position',
      title: 'Empêcher …b5 : 10.a4 dans la Najdorf',
      fen: 'rn1q1rk1/1p2bppp/p2pbn2/4p1B1/4P3/1NN5/PPP1BPPP/R2Q1RK1 w - - 6 10',
      caption:
        'Sicilienne Najdorf. Le plan noir est connu : …b5–b4 pour chasser le cavalier c3 qui défend e4 et d5, et gagner de l’espace. 10.a4 (le premier choix de Stockfish) tue ce plan avant qu’il ne naisse ; la case b5 pourra même servir à un fou ou un cavalier blanc.',
      arrows: [{ from: 'b7', to: 'b5', kind: 'bad' }],
      marks: [{ square: 'b5', kind: 'strong' }],
      moves: [{ uci: 'a2a4', comment: '10.a4 : le coup « qui ne fait rien » mais supprime le meilleur plan noir.' }],
    },
  ],
  exercises: [
    {
      title: 'Le piège sibérien (Gambit Smith-Morra)',
      fen: 'r1b1kb1r/ppqp1ppp/2n1p3/8/2B1P1n1/2N2N1P/PP2QPP1/R1B2RK1 b kq - 0 9',
      prompt:
        'Les Blancs ont vu la menace …Dxh2# et ont répondu par le « prophylactique » 9.h3?. C’est aux Noirs : montre pourquoi cette prophylaxie n’en était pas une.',
      solution: ['c6d4', 'h3g4', 'd4e2', 'c4e2'],
      explanation:
        '**9…Cd4!** : le cavalier attaque la dame e2 et ouvre la diagonale c7–h2. Si **10.Cxd4??**, **10…Dh2#** — la menace initiale revient. Si 10.hxg4, **10…Cxe2+ 11.Fxe2** et les Noirs ont gagné la dame. Le coup h3 chassait le cavalier g4 mais ignorait la seconde idée des Noirs : retirer le défenseur f3. Une prophylaxie doit vérifier toutes les menaces, pas seulement la plus visible.',
    },
    {
      title: 'La bonne prophylaxie',
      fen: 'r1b1kb1r/ppqp1ppp/2n1p3/8/2B1P1n1/2N2N2/PP2QPPP/R1B2RK1 w kq - 6 9',
      prompt:
        'Même position, un coup plus tôt : les Noirs menacent …Dxh2#. 9.h3? perd (exercice précédent). Que veulent les Noirs, et quel coup répond à toutes leurs idées ?',
      solution: ['f1d1'],
      explanation:
        '**9.Td1!** : la tour libère la case f1 pour le roi — après …Dxh2+ le roi s’échappe par f1 et ce n’est plus mat — et elle s’installe sur la colonne d face au pion d7 et à la future case d6, là où les Blancs ont leur compensation pour le pion. Les autres défenses de h2 sont inférieures : 9.g3 affaiblit les cases claires autour du roi, et 9.h3?? perd sur 9…Cd4!. 9.Cb5 (qui chasse la dame) se défend aussi, mais Stockfish préfère nettement Td1.',
    },
    {
      title: 'Que veut le cavalier f6 ?',
      fen: 'r1bq1rk1/pp2bppp/2n1pn2/3p2B1/3P3Q/2PB4/PP3PPP/RN3RK1 w - - 0 1',
      prompt:
        'Les Blancs ont installé la batterie Dh4 + Fg5 + Fd3 contre le roi noir. Mais regarde la position avec les yeux des Noirs : quelle est leur menace, et comment la neutraliser ?',
      solution: ['g5f6', 'g7g6', 'f6e7', 'd8e7'],
      explanation:
        'La menace noire est **…Ce4!** : le cavalier quitte f6 en démasquant le fou e7 sur le fou g5, cloué contre la dame h4 — une pièce tombe. Le seul bon coup est **1.Fxf6!**, qui supprime le cavalier avant qu’il ne bouge. Et les Noirs ne peuvent pas reprendre naturellement : 1…Fxf6?? 2.Dxh7# et 1…gxf6?? 2.Dxh7#. Après **1…g6 2.Fxe7 Dxe7**, le matériel est égal. Tous les coups « actifs » (Cd2, f3, a4…) perdent une pièce sur …Ce4. Échanger une pièce n’est pas toujours passif : ici, c’est la prophylaxie.',
    },
  ],
};

export default prophylaxie;
