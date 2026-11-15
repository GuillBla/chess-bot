import type { Opening } from './types';

// Ouverture « culture » : arbre court, idées des deux camps, pièges vérifiés avec Stockfish (profondeur 16–18).
const espagnole: Opening = {
  id: 'espagnole',
  name: 'Partie espagnole',
  side: 'white',
  family: 'culture',
  against: '1.e4 e5 2.Cf3 Cc6 3.Fb5',
  eco: 'C60–C99',
  summary:
    'La « torture espagnole » : le fou b5 attaque le défenseur de e5 et les Blancs mettent une pression lente et durable sur le centre noir. Variante fermée (c3, h3, d4 et le cavalier en g3), variante d’échange (structure et finale), Berlinoise, et le piège de l’arche de Noé.',
  why:
    'C’est l’ouverture reine de 1.e4 e5, jouée par tous les champions du monde : ses plans (c3 + d4, h3 contre …Fg4, Cbd2–f1–g3) se retrouvent dans l’Italienne et dans beaucoup de structures fermées. En face, à ton niveau, tu verras surtout la variante d’échange et des pièges comme l’arche de Noé : savoir pourquoi le fou b3 peut se faire enfermer, et pourquoi on ne prend pas e5 tout de suite après Fxc6, t’évite des défaites rapides.',
  keyIdeas: [
    'Le fou b5 attaque le cavalier c6, défenseur de e5 : la pression sur e5 est indirecte, Fxc6 suivi de Cxe5 n’est une menace que si e5 n’a pas d’autre défenseur.',
    'Après 3…a6 4.Fa4 Cf6 5.O-O Fe7 6.Te1 b5 7.Fb3 d6 8.c3 O-O 9.h3 : c3 prépare d4, h3 empêche …Fg4, et le fou finit en c2 où il vise l’aile roi.',
    'Le plan de manœuvre : Cbd2–f1–g3 (comme dans l’Italienne), puis Cf5 ou une attaque à l’aile roi ; les Noirs jouent à l’aile dame (…Ca5, …c5, …Dc7).',
    'Variante d’échange 4.Fxc6 dxc6 : les Blancs ont 4 pions contre 3 à l’aile roi, les Noirs ont un pion doublé mais la paire de fous. Les finales sont bonnes pour les Blancs.',
    'Après 4.Fxc6 dxc6, 5.Cxe5? ne gagne pas de pion : 5…Dd4! fourchette e5 et e4.',
    'L’arche de Noé : quand les Blancs reprennent 8.Dxd4?? sur la colonne d, …c5 et …c4 enferment le fou b3 (le pion a2 lui bloque la sortie).',
  ],
  sections: [
    {
      type: 'text',
      title: 'Les idées de l’Espagnole',
      paragraphs: [
        'Après 1.e4 e5 2.Cf3 Cc6 3.Fb5, le fou attaque le **défenseur** de e5. Ce n’est pas encore une menace (3…a6 4.Fxc6 dxc6 5.Cxe5? Dd4! regagne le pion), mais c’est une pression constante sur le centre noir, qui dure souvent 30 coups : d’où le surnom de « torture espagnole ».',
        '**La variante fermée** (3…a6 4.Fa4 Cf6 5.O-O Fe7 6.Te1 b5 7.Fb3 d6 8.c3 O-O 9.h3) est la ligne principale. Chaque coup blanc a une idée simple : **c3** prépare d4 et offre une case de repli au fou (c2), **h3** empêche …Fg4 qui clouerait le cavalier f3 défenseur de d4, puis **d4** installe le centre. Ensuite, le cavalier b1 fait le même voyage que dans l’Italienne : **Cbd2–f1–g3**, vers f5. Les Noirs, eux, jouent à l’aile dame : …Ca5 chasse le fou, …c5 attaque d4, …Dc7. Attaque Marshall (7…O-O 8.c3 d5!? au lieu de 7…d6) : un gambit noir très étudié, hors de propos à ton niveau.',
        '**La variante d’échange (4.Fxc6 dxc6)** change tout : les Blancs donnent la paire de fous pour une structure meilleure. Ils ont **4 pions contre 3 à l’aile roi** (e, f, g, h contre f, g, h), alors que la majorité noire de l’aile dame (4 contre 3) est **paralysée par le pion doublé c**. En finale, les Blancs peuvent créer un pion passé, les Noirs non : c’est pour ça que les Blancs aiment échanger les dames. Les Noirs cherchent le jeu actif (…Fg4, …h5!? ou …f6 et …c5).',
        '**La Berlinoise (3…Cf6 4.O-O Cxe4)** est la défense « mur » : après 5.d4 Cd6 6.Fxc6 dxc6 7.dxe5 Cf5 8.Dxd8+ Rxd8, les dames sont échangées dès le 8e coup. Le roi noir ne peut plus roquer, mais la paire de fous et l’absence de faiblesses rendent cette finale très solide. Rare à ton niveau ; il suffit de savoir que les Blancs jouent ensuite Cc3, h3, Td1 et s’appuient sur leur pion e5.',
        '**Le lien avec ton répertoire** : comme dans le Londres, les Blancs construisent d’abord (c3, h3, Cbd2) avant d’agir, et le coup h3 contre …Fg4 est le même réflexe que h3 contre …Fh5/…Fg4 dans tes parties. La structure de l’échange (majorité saine contre majorité paralysée) est une leçon de finale qui sert partout.',
      ],
    },
    {
      type: 'position',
      title: 'Variante fermée : le plan blanc',
      fen: 'r1bq1rk1/2p1bppp/p1np1n2/1p2p3/4P3/1BP2N1P/PP1P1PP1/RNBQR1K1 b - - 0 9',
      caption:
        'Après 9.h3, la position de référence de l’Espagnole fermée. c3 prépare d4 et la case c2 pour le fou ; h3 empêche …Fg4. Les Noirs jouent à l’aile dame (…Ca5, …c5), les Blancs construisent le centre puis amènent le cavalier b1 vers l’aile roi.',
      arrows: [
        { from: 'd2', to: 'd4', kind: 'idea' },
        { from: 'b1', to: 'd2', kind: 'good' },
        { from: 'c6', to: 'a5', kind: 'threat' },
      ],
      marks: [{ square: 'g4', kind: 'strong' }],
      moves: [
        { uci: 'c6a5', comment: '9…Ca5 (Tchigorine) : le cavalier chasse le fou b3 et libère le pion c pour …c5.' },
        { uci: 'b3c2', comment: '10.Fc2 : le fou recule sur la case préparée par c3 ; il vise maintenant h7.' },
        { uci: 'c7c5', comment: '10…c5 : les Noirs prennent de l’espace à l’aile dame et visent d4.' },
        { uci: 'd2d4', comment: '11.d4 : le centre blanc est en place, défendu par c3 et le cavalier f3.' },
        { uci: 'd8c7', comment: '11…Dc7 : la dame défend e5 et se met sur la colonne c.' },
        { uci: 'b1d2', comment: '12.Cbd2 : le cavalier b1 part en voyage…' },
        { uci: 'c8d7', comment: '12…Fd7 : les Noirs relient leurs tours.' },
        { uci: 'd2f1', comment: '13.Cf1 : … par f1, puis g3 ou e3, vers f5 et d5. C’est le plan type : manœuvrer derrière les pions, puis attaquer à l’aile roi.' },
      ],
    },
    {
      type: 'position',
      title: 'Variante d’échange : la structure qui gagne les finales',
      fen: 'r1b1kbnr/1pp3pp/p4p2/2p5/4P3/1N6/PPP2PPP/RNBR2K1 b kq - 0 9',
      caption:
        'Après 4.Fxc6 dxc6 5.O-O f6 6.d4 exd4 7.Cxd4 c5 8.Cb3 Dxd1 9.Txd1, les dames sont parties. Compte les pions : à l’aile roi, les Blancs ont e4, f2, g2, h2 contre f6, g7, h7 — ils pourront créer un pion passé. À l’aile dame, les Noirs ont quatre pions contre trois, mais le pion doublé c les empêche d’en faire un pion passé. En compensation, les Noirs ont la paire de fous : Stockfish juge la position à peu près égale, mais elle est plus facile à jouer pour les Blancs.',
      marks: [
        { square: 'c7', kind: 'weak' },
        { square: 'c5', kind: 'weak' },
        { square: 'e4', kind: 'strong' },
      ],
      arrows: [
        { from: 'f2', to: 'f4', kind: 'idea' },
        { from: 'e4', to: 'e5', kind: 'idea' },
      ],
    },
    {
      type: 'position',
      title: 'L’arche de Noé : le fou b3 enfermé',
      fen: 'r1bqkbnr/2p2ppp/p2p4/1p6/3QP3/1B6/PPP2PPP/RNB1K2R b KQkq - 0 8',
      caption:
        '3…a6 4.Fa4 d6 5.d4 b5 6.Fb3 Cxd4 7.Cxd4 exd4 8.Dxd4?? : les Blancs reprennent naturellement le pion. Mais regarde le fou b3 : a4 est tenu par le pion b5, c4 est libre, a2 et c2 sont occupés par ses propres pions. Si les Noirs prennent c4 avec gain de temps, le fou est mort.',
      marks: [
        { square: 'b3', kind: 'target' },
        { square: 'c4', kind: 'weak' },
      ],
      arrows: [
        { from: 'c7', to: 'c5', kind: 'threat' },
        { from: 'c5', to: 'c4', kind: 'threat' },
      ],
      moves: [
        { uci: 'c7c5', comment: '8…c5! : le pion chasse la dame avec gain de temps.' },
        { uci: 'd4d5', comment: '9.Dd5 : la dame attaque la tour a8 et le pion f7…' },
        { uci: 'c8e6', comment: '9…Fe6 : le fou noir s’interpose avec gain de temps : il attaque la dame.' },
        { uci: 'd5c6', comment: '10.Dc6+ : un échec, en espérant gagner du temps.' },
        { uci: 'e6d7', comment: '10…Fd7 : on chasse encore la dame.' },
        { uci: 'c6d5', comment: '11.Dd5 : la dame revient.' },
        { uci: 'c5c4', comment: '11…c4 : le piège se referme. Le fou b3 n’a plus aucune case : les Noirs gagnent une pièce. C’est l’« arche » : le fou est enfermé par les pions a2, c4 et b5.' },
      ],
    },
  ],
  pgn: `
1. e4 {Le pion prend le centre et ouvre les diagonales du fou f1 et de la dame.}
1... e5 {Les Noirs prennent leur part du centre.}
2. Nf3 {[%cal Gf3e5] Le cavalier attaque e5 : les Noirs doivent le défendre.}
2... Nc6 {Défend e5 en développant.}
3. Bb5 {[%cal Gb5c6,Bc6e5] La Partie espagnole : le fou attaque le cavalier c6, le défenseur de e5. Pas encore une vraie menace, mais une pression qui va durer toute la partie.}
3... a6 {[%name Défense Morphy] Les Noirs demandent tout de suite au fou de se décider : prendre en c6 ou reculer.}
(3... Nf6 {[%name Berlinoise] Les Noirs ignorent le fou et contre-attaquent e4 : la défense « mur », très solide.}
4. O-O {On roque sans défendre e4 : si 4…Cxe4, la tour viendra en e1 ou le pion d4 frappera le centre.}
4... Nxe4 {Les Noirs prennent le pion : la Berlinoise principale.}
5. d4 {[%cal Gd4e5] Le pion attaque e5 et ouvre la colonne e : les Blancs vont regagner leur pion.}
5... Nd6 {Le cavalier recule en attaquant le fou b5.}
6. Bxc6 {On échange : le cavalier c6 défendait e5, et le fou b5 était attaqué.}
6... dxc6 {Les Noirs reprennent vers le centre et ouvrent la colonne d pour leur dame.}
7. dxe5 {[%cal Ge5d6] Le pion chasse le cavalier d6 et gagne de l’espace.}
7... Nf5 {Le cavalier se replie, et propose l’échange des dames sur la colonne d.}
8. Qxd8+ {On échange les dames : le roi noir perd le droit de roquer.}
8... Kxd8 {La finale berlinoise : les Noirs ont la paire de fous et pas de faiblesses.}
9. Nc3 {Plan blanc : h3, Td1, Fg5 ou Ff4, et utiliser le pion e5 qui gagne de l’espace ; la majorité de l’aile roi (e5, f, g, h) est l’atout à long terme. Une finale très technique, où le moindre relâchement est puni des deux côtés.})
4. Ba4 {Le fou recule et garde le clouage du cavalier c6 : la pression sur e5 continue.}
(4. Bxc6 {[%name Variante d’échange] Les Blancs donnent la paire de fous pour abîmer la structure noire (pion doublé c) et viser les finales.}
4... dxc6 {On reprend vers le centre : la colonne d s’ouvre pour la dame et le fou c8.}
5. O-O {On protège d’abord le roi (et indirectement e4 : 5…Fg4 ou 5…Dd4 ne gagnent rien). La menace Cxe5 devient réelle, car le roi n’est plus sur la colonne e.}
(5. Nxe5? {Le pion semble gratuit… mais 5…Dd4! fourchette le cavalier e5 et le pion e4.}
5... Qd4! {[%cal Yd4e5,Yd4e4] Double attaque : le cavalier recule et e4 tombe.}
6. Nf3 {Le cavalier défend en reculant, mais il laisse le pion e4 sans défense.}
6... Qxe4+ {Le pion est regagné, avec échec.}
7. Qe2 {On propose l’échange pour couvrir l’échec.}
7... Qxe2+ {Matériel égal, mais les Noirs ont la paire de fous et le roi blanc ne peut plus roquer : l’échange 4.Fxc6 n’a rien rapporté.}
8. Kxe2 {Les Blancs n’ont plus d’avantage : les Noirs ont la paire de fous dans une position ouverte.})
5... Bg4 {Les Noirs clouent le cavalier f3 et préparent …h5 pour attaquer le roi par la colonne h.}
(5... f6 {Les Noirs défendent e5 solidement par un pion : la ligne principale.}
6. d4 {[%cal Gd2d4] On ouvre le centre pour échanger des pions : chaque échange rapproche la finale favorable.}
6... exd4 {Les Noirs prennent.}
7. Nxd4 {[%csl Gd4] Le cavalier reprend au centre, prêt à échanger les dames.}
7... c5 {Chasse le cavalier et propose l’échange des dames.}
8. Nb3 {Le cavalier recule en évitant l’échange qui libérerait les Noirs ; il vise c5 et a5.}
8... Qxd1 {Les Noirs échangent les dames pour éviter une attaque.}
9. Rxd1 {[%cal Gf2f4,Ge4e5] La finale typique de l’échange : 4 pions contre 3 à l’aile roi pour les Blancs, majorité de l’aile dame paralysée par le pion doublé pour les Noirs. Plan : Fe3, Cc3, f4 et e5 pour créer un pion passé ; les Noirs comptent sur leur paire de fous.})
6. h3 {On demande au fou de choisir.}
6... h5 {[%cal Yh5g4,Yh8h1] Le piège : le fou ne recule pas. Si 7.hxg4? hxg4, la colonne h s’ouvre pour la tour h8 et la dame noire arrive en h4.}
7. d3 {[%cal Rh3g4] On ne prend pas le fou : on développe tranquillement et on défend e4. Le fou g4 reste en prise, mais le prendre ouvrirait la colonne h vers le roi blanc. Plan : Cbd2–c4, Fe3, et garder la structure pour la finale.}
(7. hxg4? {Gagne une pièce… et ouvre la colonne h vers son propre roi : 7…hxg4 et les Noirs ont une attaque terrible (la tour h8 est déjà sur la colonne ouverte).}
7... hxg4 {Le pion reprend et ouvre la colonne h ; le cavalier f3 est attaqué.}
8. Nxe5?? {[%cal Rd8h4] Le cavalier fuit en prenant un pion, mais 8…Dh4! menace …Dh2# et …Dh1#.}
8... Qh4 {[%cal Yh4h1,Yh4h2] Mat imparable : par exemple 9.f4 g3 et …Dh2# arrive (10.Dh5 Dxh5 ne fait que retarder le mat).}
9. f4 {Libère la case f2 pour le roi, mais c’est trop tard : 9…g3 et le mat arrive.}
9... g3 {Le pion prend la case f2 au roi blanc : …Dh2# ne peut plus être paré durablement.})
7... Qf6 {La dame prépare …Fxf3 et …Ce7–g6 ; elle reste près de l’aile roi.}
8. Nbd2 {Le cavalier vise c4 puis e3 ; il défend aussi f3. Plan : Te1, Cc4, Fe3, et échanger les pièces pour aller vers une finale où la majorité blanche de l’aile roi fera la différence.})
4... Nf6 {Les Noirs se développent et attaquent e4.}
(4... d6 {[%name Steinitz différée] Les Noirs défendent e5 solidement par un pion ; le fou c8 peut sortir.}
5. d4 {[%cal Gd2d4] On prend le centre tout de suite. Attention au piège de l’arche de Noé après 5…b5 6.Fb3 Cxd4 7.Cxd4 exd4.}
5... b5 {Les Noirs chassent le fou et préparent le piège.}
(5... Bd7 {Les Noirs déclouent le cavalier c6 : maintenant, …Cxd4 serait une vraie menace.}
6. c3 {[%cal Gc3d4] Le pion soutient d4 et prépare une case de repli au fou (c2). Plan : O-O, Te1, Cbd2 : la même construction que dans la variante fermée.}
6... Nf6 {Les Noirs attaquent e4.}
7. O-O {Le roi à l’abri ; e4 est défendu indirectement (7…Cxe4 8.Te1). Plan : Te1, Cbd2–f1–g3 et h3, comme dans la variante fermée.})
6. Bb3 {Le fou recule sur la diagonale a2–g8 où il vise f7.}
6... Nxd4 {Les Noirs échangent le cavalier sur d4.}
7. Nxd4 {On reprend le cavalier ; le pion e5 va reprendre en d4 et ouvrir la diagonale du piège.}
7... exd4 {[%csl Yb3] Le moment clé : 8.Dxd4?? tombe dans l’arche de Noé.}
8. Bd5 {[%cal Gd5a8] Le bon coup : le fou quitte b3 avant d’être enfermé et attaque la tour a8. Les Blancs reprendront le pion d4 ensuite.}
(8. Qxd4?? {[%name Piège de l’arche de Noé] La reprise naturelle… qui perd une pièce : 8…c5! 9.Dd5 Fe6 10.Dc6+ Fd7 11.Dd5 c4 et le fou b3 est enfermé.}
8... c5 {[%cal Gc5c4] Le pion chasse la dame avec gain de temps.}
9. Qd5 {La dame attaque la tour a8 avec un tempo, la case la plus tentante.}
9... Be6 {Le fou s’interpose en attaquant la dame.}
10. Qc6+ {Échec : la dame cherche à gagner du temps.}
10... Bd7 {On chasse encore la dame.}
11. Qd5 {La dame revient, faute de mieux.}
11... c4 {[%csl Rb3] Le fou b3 n’a plus de case : a4 et c4 sont tenus par les pions noirs, a2 et c2 par ses propres pions. Les Noirs gagnent une pièce.})
8... Rb8 {La tour se met à l’abri.}
9. Bc6+ {Échec : le fou s’échange contre son homologue au lieu de rester exposé en d5.}
9... Bd7 {Les Noirs couvrent l’échec.}
10. Bxd7+ {On échange les fous : la dame noire devra reprendre et le pion d4 restera sans défense.}
10... Qxd7 {La dame reprend.}
11. Qxd4 {[%csl Gd4] Le pion est regagné : matériel égal, la dame est centralisée et les Noirs ont des pions affaiblis à l’aile dame (a6, b5). Plan : O-O, Cc3, Fe3 et viser la colonne d.})
5. O-O {Le roi à l’abri avant tout : e4 est défendu indirectement (5…Cxe4 6.Te1 ou 6.d4 regagne le pion).}
5... Be7 {[%name Variante fermée] Les Noirs se développent sans prendre e4 : la ligne principale.}
6. Re1 {La tour défend e4 : maintenant, Fxc6 suivi de Cxe5 devient une vraie menace.}
6... b5 {Les Noirs chassent le fou pour supprimer la menace sur e5.}
7. Bb3 {[%cal Gb3f7] Le fou recule sur la diagonale a2–g8, d’où il vise f7.}
7... d6 {Défend e5 avec un pion et ouvre le fou c8.}
8. c3 {[%cal Gc3d4,Bb3c2] Prépare d4 et offre une case de repli au fou (c2), au cas où les Noirs joueraient …Ca5.}
8... O-O {Les Noirs roquent.}
9. h3 {[%csl Rg4] Empêche …Fg4, qui clouerait le cavalier f3, un défenseur de la future case d4. Les Blancs pourront jouer d4 sans souci.}
9... Na5 {[%name Variante Tchigorine] Le cavalier chasse le fou b3 et libère le pion c pour …c5.}
10. Bc2 {[%cal Gc2h7] Le fou recule sur la case préparée par c3 et vise l’aile roi noire (h7).}
10... c5 {Les Noirs prennent de l’espace à l’aile dame et visent d4.}
11. d4 {[%cal Gb1d2,Gd2f1,Gf1g3] Le centre blanc est installé, défendu par c3 et Cf3. Plan : Cbd2–f1–g3 (ou e3), puis Cf5 ou d5 pour bloquer ; les Noirs jouent …Dc7, …Fd7 ou …Cc6 à l’aile dame. Une partie de manœuvres, où il faut avoir le plan en tête.}
`,
  traps: [
    {
      title: 'L’arche de Noé',
      fen: 'r1bqkbnr/2p2ppp/p2p4/1p6/3QP3/1B6/PPP2PPP/RNB1K2R b KQkq - 0 8',
      prompt:
        'Tu as les Noirs. Les Blancs viennent de reprendre le pion d4 avec la dame (8.Dxd4??). Regarde le fou b3 : trouve comment l’enfermer.',
      solution: ['c7c5', 'd4d5', 'c8e6', 'd5c6', 'e6d7', 'c6d5', 'c5c4'],
      explanation:
        '**8…c5!** chasse la dame avec gain de temps. Après **9.Dd5 Fe6 10.Dc6+ Fd7 11.Dd5 c4**, le fou b3 n’a plus aucune case (a4 et c4 sont tenus par les pions noirs, a2 et c2 par ses propres pions) : les Noirs gagnent une pièce. Si 9.Dc3, 9…c4 enferme le fou tout de suite. Avec les Blancs, retiens le bon coup à la place de 8.Dxd4?? : **8.Fd5!**, qui sort le fou du piège en attaquant la tour a8.',
    },
    {
      title: 'Échange : le pion e5 est-il gratuit ?',
      fen: 'r1bqkbnr/1pp2ppp/p1p5/4N3/4P3/8/PPPP1PPP/RNBQK2R b KQkq - 0 5',
      prompt:
        'Tu as les Noirs. Après 4.Fxc6 dxc6, ton adversaire a pris le pion 5.Cxe5?. Trouve comment regagner le pion avec un jeu confortable.',
      solution: ['d8d4', 'e5f3', 'd4e4', 'd1e2', 'e4e2', 'e1e2'],
      acceptAlso: ['d8e7'],
      explanation:
        '**5…Dd4!** fourchette le cavalier e5 et le pion e4. Après 6.Cf3 Dxe4+ 7.De2 Dxe2+ 8.Rxe2, le matériel est égal, les Noirs ont la paire de fous et le roi blanc ne peut plus roquer : Stockfish préfère les Noirs. 5…De7 (qui attaque aussi e5 puis e4) marche aussi bien. Avec les Blancs, retiens : dans l’échange, on roque d’abord (5.O-O), et alors seulement Cxe5 devient une menace.',
    },
    {
      title: 'Échange : la colonne h',
      fen: 'r2qkbnr/1pp2pp1/p1p5/4N3/4P1p1/8/PPPP1PP1/RNBQ1RK1 b kq - 0 8',
      prompt:
        'Tu as les Noirs. Après 5…Fg4 6.h3 h5!, les Blancs ont pris le fou (7.hxg4? hxg4) puis le pion e5 (8.Cxe5??). La colonne h est ouverte : trouve le coup décisif.',
      solution: ['d8h4', 'f2f4', 'g4g3'],
      explanation:
        '**8…Dh4!** : la dame rejoint la tour h8 sur la colonne h ouverte et menace …Dh2# et …Dh1#. Les Blancs n’ont pas de défense : par exemple **9.f4 g3** et …Dh2# arrive (10.Dh5 Dxh5 ne fait que retarder le mat). Stockfish annonce un mat en quatre coups. C’est tout le sens de 6…h5 : si les Blancs prennent le fou, la colonne h s’ouvre vers leur roi. Avec les Blancs, ne prends pas : **7.d3** et la partie est égale.',
    },
  ],
};

export default espagnole;
