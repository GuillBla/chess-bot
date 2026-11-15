import type { Opening } from './types';

// Ouverture « culture » : arbre court, idées des deux camps, pièges vérifiés avec Stockfish (profondeur 16–18).
const gambitDame: Opening = {
  id: 'gambit-dame',
  name: 'Gambit Dame',
  side: 'white',
  family: 'culture',
  against: '1.d4 d5 2.c4',
  eco: 'D06–D69',
  summary:
    'Le coup c4 attaque le pion d5 pour détourner les Noirs du centre. Refusé (…e6 : variante d’échange, structure de Carlsbad et attaque de minorité, piège de l’Éléphant), Accepté (…dxc4 : pourquoi les Blancs récupèrent le pion), Slave (…c6, ton répertoire) et Albin (…e5) en bref.',
  why:
    'Avec les Noirs, tu joues la Slave : c’est justement une réponse au Gambit Dame. Comprendre ce que les Blancs veulent (pression sur d5, structure de Carlsbad, attaque de minorité b4–b5) t’aide à jouer la Slave. Et la structure de Carlsbad (pions d4/e3 contre c6/d5) arrive aussi dans le Londres et dans la Caro-Kann variante d’échange : l’attaque de minorité est un plan à connaître des deux côtés.',
  keyIdeas: [
    'Ce n’est pas un vrai gambit : après 2…dxc4, les Blancs récupèrent presque toujours le pion (e3 puis Fxc4), et le défendre par …b5 se retourne contre les Noirs.',
    'Les trois grandes réponses : 2…e6 (Refusé, solide mais le fou c8 est enfermé), 2…dxc4 (Accepté), 2…c6 (Slave : soutient d5 sans enfermer le fou, qui sortira en f5 ou g4).',
    'Variante d’échange (cxd5 exd5) : structure de Carlsbad. Plan blanc : Dc2, Fd3, O-O, Tab1 puis b4–b5 (attaque de minorité) pour créer un pion faible en c6.',
    'Piège de l’Éléphant : le cavalier d7 n’est pas cloué par Fg5 ; après Cxd5?? Cxd5! Fxd8 Fb4+ les Noirs gagnent une pièce.',
    'Gambit Dame accepté : les Blancs jouent e3 (ou e4) et Fxc4 ; ensuite ils ont plus d’espace au centre et les Noirs jouent …c5 pour l’attaquer.',
    'Albin (2…e5) : le pion d4 noir gêne, mais les Blancs gardent leur pion avec Cf3, g3, Fg2 ; attention au piège de Lasker après 4.e3?.',
  ],
  sections: [
    {
      type: 'text',
      title: 'Les idées du Gambit Dame',
      paragraphs: [
        'Après 1.d4 d5 2.c4, le pion c4 attaque d5. Si les Noirs prennent, ils abandonnent le centre ; s’ils ne prennent pas, les Blancs pourront échanger cxd5 au bon moment et ouvrir la colonne c. Ce n’est **pas un vrai gambit** : le pion c4 est presque toujours regagné.',
        '**Le Refusé (2…e6)** : les Noirs défendent d5 avec le pion e. C’est très solide, mais le fou c8 est enfermé derrière e6. Les Blancs jouent Cc3, Fg5 (clouage du cavalier f6, défenseur de d5) et souvent **cxd5 exd5** : c’est la **structure de Carlsbad**. Les Blancs ont la colonne c semi-ouverte et un plan célèbre, l’**attaque de minorité** : deux pions (a et b) avancent contre trois (a, b, c) avec Tab1, b4, b5. Le but n’est pas de percer mais de créer une faiblesse : après b5xc6, les Noirs gardent un pion c6 arriéré ou un pion d5 isolé. Les Noirs, eux, jouent à l’aile roi (…Cf8–g6, …Ce4).',
        '**L’Accepté (2…dxc4)** : les Noirs prennent et, s’ils sont sages, rendent le pion. Les Blancs jouent **e3** (le fou f1 menace de reprendre) puis Fxc4, et gardent un beau centre. Défendre le pion par …b5 est une erreur : a4 attaque la chaîne, et la grande diagonale vers a8 s’ouvre (piège Df3).',
        '**La Slave (2…c6)** est ta défense : elle soutient d5 avec le pion c, sans enfermer le fou c8. Le fou sort en f5 (ou g4) **avant** …e6, exactement comme dans le Londres avec les Blancs et dans ta Caro-Kann. Elle a sa propre fiche dans le répertoire.',
        '**L’Albin (2…e5)** est un contre-gambit : après 3.dxe5 d4, le pion d4 gêne le développement blanc. La bonne recette : 4.Cf3, g3, Fg2, Cbd2 et garder le pion e5. Le piège de Lasker (4.e3? Fb4+ 5.Fd2 dxe3 6.Fxb4?? exf2+ 7.Re2 fxg1=C+!) est à connaître.',
      ],
    },
    {
      type: 'position',
      title: 'Structure de Carlsbad : l’attaque de minorité',
      fen: 'r1bqrnk1/pp2bppp/2p2n2/3p2B1/3P4/2NBPN2/PPQ2PPP/1R3RK1 b - - 8 11',
      caption:
        'Variante d’échange après 11.Tab1. Les Blancs ont deux pions à l’aile dame (a2, b2) contre trois (a7, b7, c6). La tour b1 soutient b2–b4–b5 : le but est d’échanger en c6 pour laisser aux Noirs un pion faible (c6 arriéré ou d5 isolé). Les Noirs cherchent du jeu à l’aile roi avec le cavalier f8 (…Cg6, …Ce4).',
      arrows: [
        { from: 'b2', to: 'b4', kind: 'idea' },
        { from: 'b4', to: 'b5', kind: 'idea' },
      ],
      marks: [{ square: 'c6', kind: 'target' }],
      moves: [
        { uci: 'f8g6', comment: '11…Cg6 : le cavalier rejoint l’aile roi, où les Noirs cherchent leur jeu.' },
        { uci: 'b2b4', comment: '12.b4 : l’attaque de minorité commence.' },
        { uci: 'a7a6', comment: '12…a6 : les Noirs freinent b5.' },
        { uci: 'a2a4', comment: '13.a4 : on prépare b5 malgré tout.' },
        { uci: 'e7d6', comment: '13…Fd6 : le fou vise l’aile roi blanche.' },
        { uci: 'b4b5', comment: '14.b5 : le pion arrive.' },
        { uci: 'a6b5', comment: '14…axb5.' },
        { uci: 'a4b5', comment: '15.axb5 : la prochaine étape est bxc6. Si les Noirs reprennent bxc6, le pion c6 sera arriéré sur la colonne c ; s’ils laissent faire, b5xc6 et le pion d5 devient faible. Mission accomplie : une cible à long terme.' },
      ],
    },
    {
      type: 'position',
      title: 'Gambit accepté : pourquoi …b5 ne garde pas le pion',
      fen: 'rnbqkbnr/ppp1pppp/8/8/2pP4/4P3/PP3PPP/RNBQKBNR b KQkq - 0 3',
      caption:
        'Après 2…dxc4 3.e3, le fou f1 menace de reprendre en c4. Les Noirs sont tentés de défendre le pion avec …b5. Regarde ce qui arrive à la grande diagonale h1–a8.',
      arrows: [{ from: 'f1', to: 'c4', kind: 'good' }],
      marks: [{ square: 'c4', kind: 'target' }],
      moves: [
        { uci: 'b7b5', comment: '3…b5? : le pion c4 est défendu…' },
        { uci: 'a2a4', comment: '4.a4! : on attaque la base de la chaîne.' },
        { uci: 'c7c6', comment: '4…c6? : on soutient b5 encore une fois.' },
        { uci: 'a4b5', comment: '5.axb5 : on prend quand même.' },
        { uci: 'c6b5', comment: '5…cxb5 : les Noirs ont gardé leurs pions… mais la diagonale h1–a8 est ouverte.' },
        { uci: 'd1f3', comment: '6.Df3! : la dame attaque la tour a8 et le cavalier b8 ne peut pas s’interposer utilement. Les Blancs gagnent une pièce. Stockfish : environ +2,8.' },
      ],
    },
    {
      type: 'position',
      title: 'La Slave : ta réponse au Gambit Dame',
      fen: 'rn1qkb1r/pp2pppp/2p2n2/5b2/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq - 1 6',
      caption:
        '2…c6 3.Cf3 Cf6 4.Cc3 dxc4 5.a4 Ff5 : les Noirs ont pris en c4, a4 a empêché …b5, et le fou c8 est sorti en f5 AVANT …e6. Les Blancs vont jouer e3 et Fxc4 (ou Ce5) : ils récupèrent le pion, et les Noirs ont une position solide où aucun fou n’est enfermé. C’est la même idée que le Londres (fou f4 avant e3) et la Caro-Kann (…Ff5 avant …e6).',
      arrows: [{ from: 'f5', to: 'b1', kind: 'good' }],
      marks: [{ square: 'c4', kind: 'target' }],
    },
  ],
  pgn: `
1. d4 {Le pion prend le centre et ouvre la diagonale du fou c1.}
1... d5 {Les Noirs bloquent le pion d4 et prennent leur part du centre.}
2. c4 {[%cal Gc4d5] Le Gambit Dame : le pion c attaque d5 pour détourner les Noirs du centre. Si 2…dxc4, les Blancs récupéreront le pion.}
2... e6 {[%name Gambit Dame refusé] Les Noirs défendent d5 avec le pion e : très solide, mais le fou c8 est enfermé derrière e6.}
(2... dxc4 {[%name Gambit Dame accepté] Les Noirs prennent : ils abandonnent le centre pour un temps.}
3. e3 {[%cal Gf1c4] Le fou f1 menace de reprendre en c4 ; le pion e3 soutient aussi d4.}
3... Nf6 {Le plus sage : les Noirs se développent et rendent le pion.}
(3... b5? {Les Noirs essaient de garder le pion, mais 4.a4! attaque la chaîne et la diagonale h1–a8 va s’ouvrir.}
4. a4 {[%cal Ga4b5] On attaque la base de la chaîne b5–c4.}
4... c6? {Le coup naturel pour défendre b5… et l’erreur décisive : la diagonale h1–a8 va s’ouvrir.}
5. axb5 {On prend quand même : le pion c6 va devoir reprendre et quitter la diagonale.}
5... cxb5 {Les Noirs reprennent : la tour a8 est maintenant exposée.}
6. Qf3 {[%cal Gf3a8] La dame attaque la tour a8 par la grande diagonale. Si 6…Cc6 7.Dxc6+ Fd7 8.De4 : les Blancs ont gagné une pièce.})
4. Bxc4 {Le pion est regagné, et le fou est actif sur la diagonale a2–g8.}
4... e6 {Les Noirs ouvrent leur fou f8 et préparent …c5.}
5. Nf3 {Les Blancs se développent et contrôlent e5.}
5... c5 {[%cal Gc5d4] Les Noirs attaquent le centre blanc : c’est la réaction typique du Gambit accepté.}
6. O-O {Le roi à l’abri avant d’ouvrir le centre.}
6... a6 {Prépare …b5 pour chasser le fou c4 avec gain de temps.}
7. Qe2 {[%cal Ge3e4,Gf1d1] La dame prépare Td1 et la poussée e4 ; elle défend aussi le fou c4.}
7... b5 {Les Noirs chassent le fou et préparent …Fb7.}
8. Bb3 {Le fou recule sur la diagonale a2–g8, où il garde f7 et d5 dans le viseur.}
8... Bb7 {Le fou noir vise e4 et la grande diagonale.}
9. Rd1 {[%cal Gd1d8] La tour sur la colonne d, face à la dame noire : elle soutient d4–d5.}
9... Nbd7 {Les Noirs se développent.}
10. Nc3 {[%cal Ge3e4,Bd4d5] Plan blanc : e4 puis d5 pour ouvrir le centre, où les Blancs sont mieux développés ; les Noirs ont des pions a6–b5 qui peuvent devenir des cibles (a4).})
(2... c6 {[%name Défense slave] Ta défense : le pion c soutient d5 sans enfermer le fou c8, qui sortira en f5.}
3. Nf3 {Les Blancs se développent et contrôlent e5.}
3... Nf6 {Les Noirs se développent et contrôlent e4.}
4. Nc3 {Troisième pièce sur d5 : les Blancs menacent de gagner le pion d5 après cxd5.}
4... dxc4 {Les Noirs prennent : maintenant, le pion c6 empêche Cb5 et permettra …b5.}
5. a4 {[%cal Ga4b5] Empêche …b5, qui garderait le pion c4.}
5... Bf5 {[%csl Gf5] Le fou sort AVANT …e6 : c’est l’idée de la Slave (et de ta Caro-Kann).}
6. e3 {Prépare Fxc4 pour reprendre le pion.}
6... e6 {Maintenant seulement les Noirs ferment la chaîne : le fou f5 est déjà dehors.}
7. Bxc4 {Le pion est regagné et le fou vise e6 et f7.}
7... Bb4 {Le fou cloue le cavalier c3 et contrôle e4.}
8. O-O {Plan blanc : De2, e4 pour gagner le centre ; les Noirs ont une position solide, sans fou enfermé, et jouent …O-O, …Cbd7, …Fg6.})
(2... e5 {[%name Contre-gambit Albin] Un contre-gambit : les Noirs donnent un pion pour gêner le développement blanc avec un pion en d4.}
3. dxe5 {On prend : le pion e5 bloque le jeu noir.}
3... d4 {[%csl Yd4] Le pion d4 gêne : le cavalier b1 n’a plus la case c3, et e3 serait dangereux.}
4. Nf3 {Le développement naturel : le cavalier défend e5 et prépare g3–Fg2.}
(4. e3? {Le coup « logique » pour attaquer d4… et le piège de Lasker : 4…Fb4+ 5.Fd2 dxe3! 6.Fxb4?? exf2+ 7.Re2 fxg1=C+!.}
4... Bb4+ {Le fou donne échec et prépare …dxe3.}
5. Bd2 {L’interposition naturelle.}
5... dxe3 {[%cal Ye3f2] Le pion attaque f2 et d2 : 6.Fxb4?? perd.}
6. Bxb4?? {On prend le fou… mais f2 tombe avec échec.}
6... exf2+ {Échec, et le pion vise g1.}
7. Ke2 {Forcé : 7.Rxf2 Dxd1 perd la dame.}
7... fxg1=N+ {[%name Piège de Lasker] La sous-promotion en cavalier, avec échec ! Une dame en g1 serait prise par la tour.}
8. Rxg1? {La tour reprend le cavalier… (8.Re1 Dh4+ résistait plus longtemps, mais la position blanche reste perdue).}
8... Bg4+ {[%cal Rg4d1] … et ce fou donne échec en attaquant la dame d1 : les Noirs gagnent la dame.})
4... Nc6 {Les Noirs attaquent e5 et soutiennent d4.}
5. g3 {[%cal Gf1g2] Le fou ira en g2 : il vise la grande diagonale et le pion b7, et protège le roi.}
5... Be6 {Les Noirs attaquent c4 et préparent …Dd7 et O-O-O.}
6. Nbd2 {Le cavalier défend c4 et pourra aller en b3 contre le pion d4.}
6... Qd7 {Prépare le grand roque et …Fh3 contre le fou g2.}
7. Bg2 {[%cal Gg2b7] Le fou sur la grande diagonale.}
7... O-O-O {Les Noirs roquent du côté dame et visent l’aile roi blanche (…Fh3, …h5).}
8. O-O {[%cal Gb2b4,Gb4b5] Les Blancs ont un pion de plus. Plan : Db3/Da4, b4–b5 contre le roi noir et Cb3 contre le pion d4. Stockfish donne environ +0,8 aux Blancs.})
3. Nc3 {Troisième attaque possible sur d5 ; le cavalier contrôle aussi e4.}
3... Nf6 {Les Noirs défendent d5 et se développent.}
4. cxd5 {[%name Variante d’échange] [%cal Gc4d5] On fixe la structure tout de suite : les Blancs savent exactement quel plan suivre.}
4... exd5 {[%csl Gd5] Les Noirs reprennent avec le pion e : la structure de Carlsbad. Le fou c8 est libéré, mais le pion d5 est fixé.}
(4... Nxd5 {Les Noirs reprennent avec le cavalier, mais laissent les Blancs prendre tout le centre.}
5. e4 {[%cal Ge4d5] Le pion chasse le cavalier et construit un grand centre.}
5... Nxc3 {Les Noirs échangent.}
6. bxc3 {[%cal Ge4e5,Gd4d5] Les Blancs ont un centre e4–d4 très fort et la colonne b semi-ouverte. Plan : Fd3, Cf3, O-O, puis d5 ou e5 au bon moment ; les Noirs jouent …c5 pour attaquer d4.})
5. Bg5 {[%cal Gg5f6] Le fou cloue le cavalier f6 et met la pression sur d5.}
5... c6 {Les Noirs soutiennent d5 et ouvrent la case c7 à la dame.}
(5... Nbd7 {Un coup normal, qui tend un piège : le cavalier d7 semble cloué, mais il ne l’est pas vraiment.}
6. e3 {On ne prend pas en d5. Les Blancs continuent le plan : Fd3, Dc2, Cge2 ou Cf3, O-O.}
(6. Nxd5?? {[%name Piège de l’Éléphant] Le pion d5 semble gratuit car le cavalier f6 est cloué sur la dame… mais 6…Cxd5! 7.Fxd8 Fb4+ et les Noirs gagnent une pièce.}
6... Nxd5 {[%cal Rg5d8] Le cavalier « cloué » reprend quand même : les Noirs donnent leur dame…}
7. Bxd8 {Les Blancs prennent la dame…}
7... Bb4+ {[%cal Yb4e1] … mais l’échec du fou oblige à rendre la dame.}
8. Qd2 {Le seul coup pour ne pas perdre davantage.}
8... Bxd2+ {Le fou prend la dame avec échec.}
9. Kxd2 {Le roi reprend le fou, et la dame blanche d8 tombe au coup suivant.}
9... Kxd8 {Bilan : les Noirs ont gagné une pièce (un cavalier contre un pion).})
6... c6 {Les Noirs soutiennent d5.}
7. Bd3 {[%cal Gd3h7] Le fou vise h7 et contrôle e4.}
7... Be7 {Les Noirs se développent.}
8. Qc2 {[%cal Gc2h7] La dame renforce la diagonale vers h7. Même plan que dans la ligne principale : Cf3, O-O, Tab1 et l’attaque de minorité.})
6. Qc2 {[%cal Gc2h7] La dame contrôle e4 et la diagonale vers h7 ; elle empêche …Ff5, la meilleure case du fou c8.}
6... Be7 {Les Noirs se développent.}
7. e3 {Soutient d4 et ouvre la diagonale du fou f1.}
7... Nbd7 {Le cavalier soutient f6 et ira en f8 puis g6.}
8. Bd3 {[%cal Gd3h7] Le fou vise h7 avec la dame : …Ff5 n’est plus possible.}
8... O-O {Les Noirs roquent.}
9. Nf3 {Le cavalier contrôle e5 et défend d4.}
9... Re8 {La tour sur la colonne e semi-ouverte, et la case f8 se libère pour le cavalier.}
10. O-O {Les Blancs roquent du côté où ils ne vont pas pousser leurs pions.}
10... Nf8 {Le cavalier va en g6 ou e6 pour le jeu à l’aile roi.}
11. Rab1 {[%cal Gb2b4,Gb4b5] [%csl Yc6] L’attaque de minorité : la tour soutient b4–b5. Plan : a3, b4, b5 et bxc6 pour créer un pion faible en c6 ou d5, puis le viser avec les tours sur la colonne c.}
`,
  traps: [
    {
      title: 'Le piège de l’Éléphant',
      fen: 'r1bqkb1r/pppn1ppp/5n2/3N2B1/3P4/8/PP2PPPP/R2QKBNR b KQkq - 0 6',
      prompt:
        'Tu as les Noirs. Les Blancs viennent de prendre le pion d5 (6.Cxd5??) en pensant que ton cavalier f6 est cloué sur ta dame. Trouve la punition.',
      solution: ['f6d5', 'g5d8', 'f8b4', 'd1d2', 'b4d2', 'e1d2', 'e8d8'],
      explanation:
        '**6…Cxd5!** : le cavalier n’est pas vraiment cloué. Si **7.Fxd8**, **7…Fb4+!** oblige à **8.Dd2 Fxd2+ 9.Rxd2 Rxd8** : les Noirs ont gagné une pièce (cavalier contre pion). Et si les Blancs ne prennent pas la dame, ils ont simplement perdu un cavalier pour un pion. Avec les Blancs, retiens : contre …Cbd7, le clouage de Fg5 n’est pas absolu, ne prends pas en d5.',
    },
    {
      title: 'Gambit accepté : la grande diagonale',
      fen: 'rnbqkbnr/p3pppp/8/1p6/2pP4/4P3/1P3PPP/RNBQKBNR w KQkq - 0 6',
      prompt:
        'Les Noirs ont voulu garder le pion du gambit avec …b5 et …c6. Après 5.axb5 cxb5, la diagonale h1–a8 est ouverte. Trouve le coup qui gagne du matériel.',
      solution: ['d1f3', 'b8c6', 'f3c6', 'c8d7', 'c6e4'],
      explanation:
        '**6.Df3!** attaque la tour a8 par la grande diagonale. 6…Cc6 ne sauve rien : **7.Dxc6+ Fd7 8.De4** et les Blancs ont gagné une pièce. Stockfish donne près de +3. La leçon pour les deux camps : dans le Gambit Dame accepté, garder le pion avec …b5 affaiblit tout, mieux vaut se développer et le rendre (3…Cf6, 4…e6, …c5).',
    },
    {
      title: 'Albin : le piège de Lasker',
      fen: 'rnbqk1nr/ppp2ppp/8/4P3/1BP5/4p3/PP3PPP/RN1QKBNR b KQkq - 0 6',
      prompt:
        'Tu as les Noirs (contre-gambit Albin). Après 4.e3? Fb4+ 5.Fd2 dxe3, les Blancs ont pris ton fou 6.Fxb4??. Trouve la suite gagnante (elle contient un coup très rare).',
      solution: ['e3f2', 'e1e2', 'f2g1n', 'h1g1', 'c8g4'],
      explanation:
        '**6…exf2+!** : 7.Rxf2 Dxd1 perdrait la dame, donc **7.Re2**. Puis **7…fxg1=C+!** : la sous-promotion en cavalier donne échec (une dame en g1 serait simplement prise par la tour h1). Après **8.Txg1 Fg4+**, le fou attaque la dame d1 en donnant échec : les Noirs gagnent la dame. (8.Re1 Dh4+ est aussi gagnant pour les Noirs.) Avec les Blancs, contre l’Albin, joue **4.Cf3** et pas 4.e3?.',
    },
  ],
};

export default gambitDame;
