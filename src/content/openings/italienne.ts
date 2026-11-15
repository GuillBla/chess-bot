import type { Opening } from './types';

// Ouverture « culture » : arbre court, idées des deux camps, pièges vérifiés avec Stockfish (profondeur 16–18).
const italienne: Opening = {
  id: 'italienne',
  name: 'Partie italienne',
  side: 'white',
  family: 'culture',
  against: '1.e4 e5 2.Cf3 Cc6 3.Fc4',
  eco: 'C50–C59',
  summary:
    'La plus ancienne des ouvertures ouvertes : le fou c4 vise f7, les Blancs se développent vite et roquent. Version lente (Giuoco Pianissimo avec c3–d3 et la manœuvre Cbd2–f1–g3) ou version tranchante (Deux cavaliers, Fried Liver), avec des pièges célèbres des deux côtés.',
  why:
    'C’est l’ouverture que tu rencontreras le plus souvent avec les Noirs si tu joues 1…e5 — et même avec la Caro-Kann, beaucoup d’adversaires de club jouent Fc4 et Cg5 contre f7 dans toutes les ouvertures. Connaître le Fried Liver, le piège de Légal et celui de Blackburne-Shilling t’évite de perdre en 10 coups. Enfin, le plan lent c3–d3–Te1–Cbd2–f1–g3 est un modèle de manœuvre qu’on retrouve dans l’Espagnole et dans beaucoup de structures fermées.',
  keyIdeas: [
    'Le fou c4 vise f7, la case que seul le roi noir défend : tous les pièges de l’Italienne tournent autour de f7.',
    'Giuoco Pianissimo (c3 + d3) : pas de bagarre immédiate, on roque, Te1, Fb3, puis le cavalier b1 fait le tour Cbd2–f1–g3 vers l’aile roi.',
    'Le pion c3 prépare d3–d4 au bon moment et enlève la case d4 au cavalier c6 ; le fou blanc recule en b3 (et le noir en a7) pour éviter d’être chassé avec gain de temps.',
    'Deux cavaliers (3…Cf6 4.Cg5) : après 4…d5 5.exd5, la bonne défense est 5…Ca5! qui chasse le fou ; 5…Cxd5?! permet le Fried Liver 6.Cxf7!.',
    'Un clouage …Fg4 sur le cavalier f3 n’est pas toujours un vrai clouage : piège de Légal (Cxe5! abandonnant la dame, puis Fxf7+ et Cd5#).',
    'Contre 3…Cd4?! (Blackburne-Shilling), ne prends pas e5 : 4.Cxd4! ; après 4.Cxe5? Dg5! la fourchette sur e5 et g2 tourne mal.',
  ],
  sections: [
    {
      type: 'text',
      title: 'Les idées de l’Italienne',
      paragraphs: [
        'Après 1.e4 e5 2.Cf3 Cc6 3.Fc4, le fou blanc est sur la diagonale a2–g8 et regarde **f7**, la case la plus fragile du camp noir : au départ, seul le roi la défend. Les Blancs veulent roquer vite, puis soit ouvrir le centre avec d4, soit manœuvrer lentement.',
        '**Giuoco Piano (3…Fc5)** : les Noirs font la même chose contre f2. Les Blancs jouent **c3** (prépare d4, enlève d4 au cavalier) et **d3** (défend e4 sans rien lâcher) : c’est le *Pianissimo*, la ligne des grands maîtres d’aujourd’hui. Plan blanc : O-O, Te1, Fb3, puis le cavalier b1, qui n’a pas de case en c3, part en **d2–f1–g3** pour viser f5 et h5. La poussée d3–d4 vient quand tout est prêt. Les Noirs font souvent pareil : …a6, …Fa7, …Fe6, …h6 et le cavalier en g6 par e7.',
        '**Deux cavaliers (3…Cf6)** : plus combatif, les Noirs attaquent e4 au lieu de protéger f7. Alors **4.Cg5!?** attaque f7 deux fois. Après 4…d5 5.exd5, il faut connaître la bonne défense, **5…Ca5!**, qui chasse le fou : les Noirs sacrifient un pion mais se développent vite. Le coup naturel 5…Cxd5?! permet le **Fried Liver** (« foie frit ») 6.Cxf7! Rxf7 7.Df3+ : le roi noir doit venir en e6, au milieu de l’échiquier.',
        '**Les pièges** : l’Italienne est l’ouverture des pièges célèbres. Avec les Blancs, celui de **Légal** (le clouage …Fg4 qui n’en est pas un) ; avec les Noirs, celui de **Blackburne-Shilling** (3…Cd4 qui « offre » e5). Les connaître, c’est savoir quand prendre et quand ne pas prendre.',
        '**Le lien avec ton répertoire** : la manœuvre Cbd2–f1–g3 est la même que dans l’Espagnole fermée, et l’idée « f7 est faible tant que le roi n’a pas roqué » vaut dans toutes les ouvertures, y compris contre ta Caro-Kann quand l’adversaire sort Fc4 et Cg5.',
      ],
    },
    {
      type: 'position',
      title: 'Giuoco Pianissimo : le tour du cavalier b1',
      fen: 'r1bq1rk1/bpp2ppp/p1np1n2/4p3/4P3/1BPP1N2/PP3PPP/RNBQR1K1 w - - 2 9',
      caption:
        'Position typique après 8…Fa7. Les deux camps ont roqué, les fous sont rentrés en b3 et a7 pour éviter …Ca5/d4 et Fe3 avec gain de temps. Le cavalier b1 n’a pas de case en c3 (le pion y est) : il va faire le tour par d2 et f1 vers g3, d’où il visera f5. Stockfish donne un très léger avantage aux Blancs : une partie de manœuvres, pas de tactique immédiate.',
      arrows: [
        { from: 'b1', to: 'd2', kind: 'good' },
        { from: 'd2', to: 'f1', kind: 'good' },
        { from: 'f1', to: 'g3', kind: 'good' },
        { from: 'b3', to: 'f7', kind: 'idea' },
      ],
      marks: [{ square: 'f5', kind: 'strong' }],
      moves: [
        { uci: 'b1d2', comment: '9.Cbd2 : première étape. La tour e1 a libéré f1 exprès.' },
        { uci: 'c8e6', comment: '9…Fe6 : les Noirs proposent l’échange du fou b3, le meilleur attaquant blanc (il vise f7).' },
        { uci: 'd2f1', comment: '10.Cf1 : deuxième étape. Si 10…Fxb3, axb3 ouvre la colonne a à la tour : pas de souci.' },
        { uci: 'h7h6', comment: '10…h6 : prophylaxie, le cavalier blanc ne pourra pas venir en g5.' },
        { uci: 'f1g3', comment: '11.Cg3 : le cavalier est arrivé. Il vise f5 et h5 ; ensuite h3, Fe3 ou d3–d4 selon ce que font les Noirs.' },
      ],
    },
    {
      type: 'position',
      title: 'Deux cavaliers : pourquoi 5…Ca5! est la bonne défense',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p1N1/2B1P3/8/PPPP1PPP/RNBQK2R b KQkq - 5 4',
      caption:
        'Après 4.Cg5, le cavalier et le fou attaquent f7 : 5.Cxf7 fourchetterait la dame et la tour h8. Les Noirs doivent couper la diagonale du fou avec 4…d5. Ensuite, la question est : comment reprendre le pion d5 ?',
      arrows: [
        { from: 'g5', to: 'f7', kind: 'threat' },
        { from: 'c4', to: 'f7', kind: 'threat' },
      ],
      marks: [{ square: 'f7', kind: 'target' }],
      moves: [
        { uci: 'd7d5', comment: '4…d5 : le pion coupe la diagonale c4–f7. Obligatoire.' },
        { uci: 'e4d5', comment: '5.exd5 : le pion blanc reprend et menace …' },
        { uci: 'c6a5', comment: '5…Ca5! : on ne reprend pas en d5 (Fried Liver), on chasse le fou, qui ne pourra plus viser f7. Les Noirs donnent un pion contre un développement rapide.' },
        { uci: 'c4b5', comment: '6.Fb5+ : le fou garde le pion d5 indirectement en donnant échec.' },
        { uci: 'c7c6', comment: '6…c6 : on chasse encore le fou en ouvrant des lignes.' },
        { uci: 'd5c6', comment: '7.dxc6 : les Blancs gardent leur pion de plus.' },
        { uci: 'b7c6', comment: '7…bxc6 : les Noirs ont un pion de moins mais une avance de développement, et …h6, …e4 vont chasser les pièces blanches. Stockfish considère que les Noirs ont une bonne compensation.' },
      ],
    },
    {
      type: 'position',
      title: 'Le Fried Liver : le roi noir au milieu',
      fen: 'r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6',
      caption:
        'Les Noirs ont repris 5…Cxd5?!. Le cavalier d5 bloque la diagonale… mais f7 n’a toujours qu’un défenseur. 6.Cxf7! sacrifie un cavalier pour sortir le roi noir.',
      arrows: [{ from: 'g5', to: 'f7', kind: 'good' }],
      marks: [{ square: 'f7', kind: 'target' }],
      moves: [
        { uci: 'g5f7', comment: '6.Cxf7! : le cavalier prend f7 et fourchette la dame et la tour h8.' },
        { uci: 'e8f7', comment: '6…Rxf7 : forcé, sinon les Blancs gagnent la qualité gratuitement.' },
        { uci: 'd1f3', comment: '7.Df3+ : échec, et la dame attaque le cavalier d5 (deux fois avec le fou c4).' },
        { uci: 'f7e6', comment: '7…Re6 : le seul moyen de garder d5 ; le roi est en plein centre. (7…Re8 8.Fxd5 rend la pièce : un pion de moins et plus de roque.)' },
        { uci: 'b1c3', comment: '8.Cc3 : troisième attaque sur le cavalier cloué d5. Les Blancs vont ajouter d4, O-O et Te1. Stockfish donne un net avantage aux Blancs (environ +0,9) : en partie rapide, les Noirs s’effondrent souvent.' },
      ],
    },
  ],
  pgn: `
1. e4 {Le pion prend le centre et ouvre la diagonale du fou f1 et celle de la dame.}
1... e5 {Les Noirs prennent leur part du centre.}
2. Nf3 {[%cal Gf3e5] Le cavalier attaque e5 dès maintenant : les Noirs doivent répondre à une menace avant de faire ce qu’ils veulent.}
2... Nc6 {Défend e5 en développant une pièce.}
3. Bc4 {[%cal Gc4f7] [%csl Yf7] La Partie italienne. Le fou vise f7, la case la plus faible du camp noir (seul le roi la défend), et libère la case f1 pour roquer vite.}
3... Bc5 {[%name Giuoco Piano] [%cal Gc5f2] Le fou noir fait la même chose et vise f2 : position symétrique et calme.}
(3... Nf6 {[%name Deux cavaliers] Les Noirs attaquent e4 au lieu de protéger f7 : plus combatif, mais f7 reste fragile.}
4. Ng5 {[%cal Gg5f7,Gc4f7] [%csl Yf7] Le cavalier et le fou attaquent f7, que seul le roi défend : menace 5.Cxf7 qui fourchette la dame d8 et la tour h8. Jouer deux fois la même pièce va contre les principes, mais cela force les Noirs à réagir tout de suite.}
4... d5 {[%cal Gd7d5] La bonne défense : le pion coupe la diagonale du fou c4 vers f7.}
5. exd5 {Le pion prend : maintenant, comment les Noirs vont-ils reprendre ce pion ?}
5... Na5 {[%cal Gc6a5,Ya5c4] La bonne défense : le cavalier chasse le fou c4, qui ne visera plus f7. Les Noirs sacrifient un pion contre un développement rapide.}
(5... Nxd5?! {Le coup naturel, mais une erreur pratique : f7 n’a toujours que le roi pour défenseur et le cavalier d5 est fragile. Les Blancs ont le Fried Liver (6.Cxf7!).}
6. Nxf7 {[%name Fried Liver] [%cal Gg5f7] Le sacrifice : le cavalier prend f7 et fourchette la dame et la tour h8. Le roi noir va devoir sortir.}
6... Kxf7 {Forcé : sinon les Blancs gagnent la qualité gratuitement.}
7. Qf3+ {[%cal Gf3d5,Gc4d5] Échec, et la dame attaque le cavalier d5 avec le fou c4 : le roi noir est obligé de venir défendre.}
7... Ke6 {Le seul coup pour garder le cavalier d5 : le roi est au milieu de l’échiquier. (Après 7…Re8 8.Fxd5, les Blancs ont repris la pièce avec un pion de plus et le roi noir ne peut plus roquer.)}
8. Nc3 {[%cal Gc3d5] Troisième attaque sur le cavalier d5, cloué contre le roi. Plan : d4 pour ouvrir le centre, O-O, Te1, et chasser le roi noir. Stockfish donne environ +0,9 aux Blancs, et en partie rapide les Noirs s’effondrent souvent.})
6. Bb5+ {Le fou reste actif en donnant échec ; il gêne le développement noir et protège indirectement d5.}
6... c6 {Les Noirs chassent encore le fou et ouvrent des lignes pour leurs pièces.}
7. dxc6 {Les Blancs prennent : ils garderont un pion de plus.}
7... bxc6 {Les Noirs ont un pion de moins mais vont gagner du temps sur les pièces blanches avec …h6 et …e4.}
8. Be2 {Le fou recule à l’abri, d’où il défendra l’aile roi. Les Noirs ont de la compensation : c’est la ligne classique de cette variante.}
8... h6 {Chasse le cavalier g5, qui n’a plus rien à faire là.}
9. Nf3 {Le seul retour raisonnable : le cavalier défend l’aile roi.}
9... e4 {Chasse encore le cavalier : les Noirs gagnent du temps et de l’espace pour compenser le pion.}
10. Ne5 {[%csl Ge5] Le cavalier s’installe en e5, une case centrale d’où personne ne le chasse facilement. Plan blanc : d4, O-O, f4 pour soutenir e5 et garder le pion de plus ; les Noirs jouent …Fd6 ou …Dc7 et attaquent e5.})
(3... d6 {Passif : le pion d6 enferme le fou f8. Les Noirs veulent souvent clouer le cavalier par …Fg4.}
4. Nc3 {[%cal Gc3d5] Le cavalier se développe et vise d5. Pas besoin de se presser : la position noire est déjà un peu passive.}
4... Bg4 {Cloue le cavalier f3 contre la dame d1… en apparence.}
5. h3 {On demande tout de suite au fou de choisir : prendre en f3 ou reculer en h5.}
5... Bxf3 {Le bon choix : les Noirs échangent avant que le clouage ne se retourne contre eux.}
(5... Bh5? {[%name Piège de Légal] L’erreur : le fou garde le « clouage »… qui n’en est pas un.}
6. Nxe5! {[%cal Gf3e5,Rh5d1] [%csl Yf7] Le cavalier abandonne la dame ! Si 6…Fxd1?? 7.Fxf7+ Re7 8.Cd5#. Si 6…Cxe5, 7.Dxh5 et les Blancs gagnent un pion.}
6... Bxd1?? {La dame est gratuite… mais c’est mat en deux coups.}
(6... Nxe5 {La meilleure défense : les Noirs reprennent le cavalier, mais le fou h5 est en l’air.}
7. Qxh5 {La dame reprend le fou : les Blancs ont gagné un pion (e5) et attaquent maintenant f7 et le cavalier e5.}
7... Nxc4 {Les Noirs prennent le fou c4.}
8. Qb5+ {[%cal Gb5c4] Échec, et la dame attaque aussi le cavalier c4, qu’elle va reprendre au coup suivant.}
8... c6 {Le plus simple pour parer l’échec.}
9. Qxc4 {Les Blancs ont un pion de plus (e5) et un bon développement. Plan : d4, O-O, f4 pour exploiter le centre.})
7. Bxf7+ {Le fou donne échec ; le roi n’a qu’une case, e7.}
7... Ke7 {Forcé.}
8. Nd5# {[%csl Ge7] Le mat de Légal : trois pièces mineures suffisent. Le roi est entouré de ses propres pièces (dame d8, pion d6), le fou f7 tient e8 et e6, le cavalier e5 tient f7 et d7.})
6. Qxf3 {[%cal Gf3f7] La dame reprend avec gain : elle vise f7 avec le fou c4, et les Blancs ont la paire de fous.}
6... Nf6 {Les Noirs défendent f7 indirectement et se développent.}
7. d3 {Défend e4 et ouvre la diagonale du fou c1. Plan : Fe3, O-O, puis Cd5 ou la poussée f4 ; la paire de fous fera la différence dans une position qui s’ouvre.})
(3... Nd4?! {[%name Piège de Blackburne-Shilling] Un coup piège : le cavalier bouge une deuxième fois et abandonne e5… exprès.}
4. Nxd4! {[%cal Gf3d4] Le plus simple : on échange le cavalier piégeux. Après 4…exd4, les Blancs ont une avance de développement et le pion d4 deviendra une cible.}
(4. Nxe5? {Le coup « gratuit » qui tombe dans le piège : 4…Dg5! attaque à la fois le cavalier e5 et le pion g2.}
4... Qg5! {[%cal Yg5g2,Yg5e5] Double attaque sur e5 et g2. Les Blancs doivent rendre la pièce : 5.O-O Dxe5 et les Noirs sont mieux.}
5. Nxf7?? {Le cavalier fourchette la dame et la tour… mais l’aile roi s’effondre : c’est la suite du piège.}
5... Qxg2 {La dame attaque la tour h1.}
6. Rf1 {La tour fuit l’attaque de la dame, mais e4 est maintenant sans défense.}
6... Qxe4+ {Échec, et le fou c4 doit s’interposer.}
7. Be2?? {Le coup naturel, qui permet le mat. Il fallait 7.De2, qui perd la dame après 7…Cxe2 mais évite le mat : la partie blanche est de toute façon perdue.}
7... Nf3# {Mat : le roi e1 est enfermé par ses propres pièces (dame d1, fou e2, tour f1, pions d2 et f2), et le fou e2 ne peut pas prendre le cavalier f3 car il est cloué par la dame e4. Blackburne y a gagné beaucoup de parties.})
4... exd4 {Le pion reprend et se retrouve en d4, avancé mais isolé de ses soutiens.}
5. O-O {Le roi à l’abri d’abord. Plan : c3 pour échanger le pion d4 et prendre le centre, puis Te1 et d3 ; la position blanche est simplement meilleure, sans piège à craindre.})
4. c3 {[%cal Gc2c3,Bd2d4] Prépare d2–d4 pour construire un centre de pions et enlève la case d4 au cavalier c6. Quand d4 arrivera, le fou c5 devra reculer.}
4... Nf6 {Contre-attaque le pion e4, qui n’est pas défendu.}
5. d3 {[%name Giuoco Pianissimo] Le « très tranquille » : on défend e4 solidement et on garde la poussée d3–d4 pour plus tard, quand tout sera prêt. C’est la ligne préférée des grands maîtres : peu de risques, beaucoup de manœuvres.}
5... d6 {Les Noirs consolident e5 et ouvrent la diagonale de leur fou c8.}
6. O-O {Le roi se met à l’abri avant toute ouverture du jeu ; la tour f1 va pouvoir venir en e1.}
6... O-O {Les Noirs roquent aussi.}
7. Re1 {La tour soutient e4 et libère la case f1… pour le cavalier b1 : c’est le début de la manœuvre Cbd2–f1–g3.}
7... a6 {Prépare 8…Fa7 et donne une case de repli au fou : il ne pourra pas être chassé avec gain de temps par d3–d4.}
8. Bb3 {[%cal Gb3f7] Le fou se met hors de portée de …b5 ou …Ca5 (qui le chasseraient avec gain de temps) tout en gardant f7 dans le viseur.}
8... Ba7 {Le fou noir fait pareil : à l’abri de d3–d4 et de Fe3.}
9. Nbd2 {[%cal Gd2f1,Gf1g3] Le cavalier b1 n’a pas de bonne case en c3 (le pion l’occupe) : il part en d2, puis f1 et g3, vers l’aile roi.}
9... Be6 {Les Noirs proposent l’échange du fou b3, le meilleur attaquant blanc.}
10. Nf1 {[%cal Gf1g3,Bg3f5] [%csl Gf5] Suite de la manœuvre : Cg3, puis h3, Fe3 ou d3–d4 selon les cas, et le cavalier visera f5. Si 10…Fxb3, on reprend 11.axb3 et la colonne a s’ouvre pour la tour. Plan : manœuvrer, préparer d4 ou une attaque à l’aile roi, sans jamais lâcher e4.}
`,
  traps: [
    {
      title: 'Le piège de Légal',
      fen: 'r2qkbnr/ppp2ppp/2np4/4p2b/2B1P3/2N2N1P/PPPP1PP1/R1BQK2R w KQkq - 1 6',
      prompt:
        'Les Noirs ont joué 5…Fh5? pour garder le clouage du cavalier f3 contre ta dame. Est-ce vraiment un clouage ? Trouve le coup qui gagne au moins un pion.',
      solution: ['f3e5', 'h5d1', 'c4f7', 'e8e7', 'c3d5'],
      explanation:
        '**6.Cxe5!** : le cavalier « cloué » quitte f3 et abandonne la dame. Si **6…Fxd1??**, **7.Fxf7+ Re7 8.Cd5#** : le célèbre mat de Légal avec trois pièces mineures. La meilleure défense est 6…Cxe5 7.Dxh5 Cxc4 8.Db5+ c6 9.Dxc4 : les Blancs ont un pion de plus et Stockfish leur donne près de +2. Morale : un clouage contre la dame n’est pas absolu, la pièce clouée peut bouger si elle crée une menace plus forte.',
    },
    {
      title: 'Le Fried Liver',
      fen: 'r1bqkb1r/ppp2ppp/2n5/3np1N1/2B5/8/PPPP1PPP/RNBQK2R w KQkq - 0 6',
      prompt:
        'Deux cavaliers : les Noirs ont repris 5…Cxd5?! au lieu de 5…Ca5!. f7 n’a qu’un défenseur. Trouve la suite la plus dangereuse.',
      solution: ['g5f7', 'e8f7', 'd1f3', 'f7e6', 'b1c3'],
      acceptAlso: ['d2d4'],
      explanation:
        '**6.Cxf7!** (le Fried Liver) : après 6…Rxf7 7.Df3+ Re6 (seul moyen de garder le cavalier d5), **8.Cc3** ajoute une troisième attaque sur le cavalier cloué d5, et le roi noir est en plein centre. Stockfish donne environ +1 aux Blancs. 6.d4! (l’attaque Lolli) est aussi très fort et accepté. Pour les Noirs, la leçon est claire : après 4.Cg5 d5 5.exd5, on joue **5…Ca5!**, pas 5…Cxd5.',
    },
    {
      title: 'Le piège de Blackburne-Shilling (vu des Noirs)',
      fen: 'r1bqkbnr/pppp1ppp/8/4N3/2BnP3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4',
      prompt:
        'Tu as les Noirs. Après 3…Cd4, ton adversaire a pris le pion 4.Cxe5?. Trouve la punition (et la suite si les Blancs prennent en f7).',
      solution: ['d8g5', 'e5f7', 'g5g2', 'h1f1', 'g2e4', 'c4e2', 'd4f3'],
      explanation:
        '**4…Dg5!** attaque à la fois le cavalier e5 et le pion g2. Si l’adversaire continue avec **5.Cxf7??** (fourchette dame–tour), **5…Dxg2 6.Tf1 Dxe4+ 7.Fe2 Cf3#**, un mat célèbre (le fou e2 est cloué par la dame e4 et ne peut pas prendre le cavalier). La meilleure défense blanche est 5.O-O Dxe5 : les Noirs ont regagné la pièce et sont un peu mieux. Avec les Blancs, retiens l’inverse : contre 3…Cd4, joue **4.Cxd4!** et ne touche pas à e5.',
    },
  ],
};

export default italienne;
