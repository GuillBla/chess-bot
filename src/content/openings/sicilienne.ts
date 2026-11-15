import type { Opening } from './types';

// Ouverture « culture » : arbre court, idées des deux camps, pièges vérifiés avec Stockfish (profondeur 16–18).
const sicilienne: Opening = {
  id: 'sicilienne',
  name: 'Défense sicilienne',
  side: 'black',
  family: 'culture',
  against: 'contre 1.e4 c5',
  eco: 'B20–B99',
  summary:
    'La réponse la plus combative à 1.e4 : 1…c5 crée un déséquilibre immédiat. Sicilienne ouverte (idées Najdorf : …a6, …e5 ou …e6, …b5, la case d5), et les systèmes anti-siciliens qu’on rencontre en club : Alapin 2.c3, Fermée et Grand Prix 2.Cc3 (+ f4), Gambit Smith-Morra.',
  why:
    'Même si tu joues la Caro-Kann, la Sicilienne est l’ouverture la plus jouée contre 1.e4 : tu la verras dans les parties des autres, dans les vidéos, et ses idées (colonne c semi-ouverte, roques opposés, la case d5, …b5–b4 contre le cavalier c3) reviennent partout. Et la ligne conseillée ici contre l’Alapin et le Smith-Morra (…d5, …Fg4 avant …e6) applique le même principe que ta Caro-Kann : sortir le fou de cases blanches avant de fermer la chaîne de pions.',
  keyIdeas: [
    'Asymétrie : 1…c5 échange un pion d’aile contre le pion central d4 ; les Noirs gardent deux pions centraux (d et e) et la colonne c semi-ouverte.',
    'Sicilienne ouverte : les Blancs ont l’espace et l’avance de développement, les Noirs la colonne c (…Tc8, …Dc7, …Txc3!?) et une structure plus saine à long terme.',
    'Najdorf 5…a6 : contrôle b5 et prépare …b5 ; selon le coup blanc, les Noirs jouent …e5 (en surveillant le trou en d5) ou …e6.',
    'Après …e5, la case d5 est le point clé : les Noirs doivent pouvoir jouer …d5 un jour ou empêcher un cavalier blanc de s’y installer (…Fe6, …Cbd7–b6).',
    'Roques opposés (attaque anglaise Fe3–f3–Dd2–O-O-O–g4) : course à l’attaque, les Noirs avancent …b5–b4 contre le roi blanc.',
    'Contre l’Alapin (2.c3) et le Smith-Morra (2.d4 cxd4 3.c3) : …d5 et le fou en g4 avant …e6, comme dans la Caro-Kann.',
    'Contre 2.Cc3 et f4 (Grand Prix) : …e6 et …d5 pour fermer la diagonale du fou c4 et contester e4.',
  ],
  sections: [
    {
      type: 'text',
      title: 'Les idées de la Sicilienne',
      paragraphs: [
        'Avec 1…c5, les Noirs contrôlent d4 avec un pion d’aile. Si les Blancs jouent d4, les Noirs échangent leur pion c contre le pion d blanc : ils gardent **deux pions centraux** (d et e) contre un seul (e4), et obtiennent la **colonne c semi-ouverte**. En échange, les Blancs ont plus d’espace et de l’avance de développement. C’est un déséquilibre volontaire : les Noirs jouent pour gagner, pas pour égaliser.',
        '**La Sicilienne ouverte** (2.Cf3 d6 3.d4 cxd4 4.Cxd4 Cf6 5.Cc3) : les Blancs ont un cavalier en d4 et visent l’attaque. **5…a6 (Najdorf)** est un coup d’attente très utile : il contrôle b5 (plus de Cb5 ni de Fb5+) et prépare …b5 pour prendre de l’espace à l’aile dame. Ensuite, les Noirs choisissent **…e5** (chasse le cavalier d4, prend sa part du centre, mais laisse un trou en **d5**) ou **…e6** (structure Scheveningen, plus compacte).',
        '**Les roques opposés** : dans l’attaque anglaise (Fe3, f3, Dd2, O-O-O, g4), les Blancs roquent du côté dame et lancent leurs pions g et h sur le roi noir. Les Noirs, roqués côté roi, répondent par **…b5–b4** et la colonne c. Celui qui arrive le premier gagne : chaque tempo compte.',
        '**Les anti-siciliennes** : à ton niveau, beaucoup d’adversaires évitent la théorie. **2.c3 (Alapin)** prépare d4 pour reprendre avec un pion : réponds **2…d5**, puis le fou en g4 avant …e6, exactement comme dans ta Caro-Kann. **2.Cc3 + f4 (Grand Prix)** vise une attaque à l’aile roi avec Fc4 ou Fb5 : …e6 et …d5 coupent le fou. **2.d4 cxd4 3.c3 (Smith-Morra)** sacrifie un pion pour le développement : on peut l’accepter, mais en se développant prudemment (…e6 avant …Cf6), sinon e4–e5 fait mal.',
      ],
    },
    {
      type: 'position',
      title: 'La Najdorf : …a6 et les deux plans',
      fen: 'rnbqkb1r/1p2pppp/p2p1n2/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 6',
      orientation: 'black',
      caption:
        'Après 5…a6. Le pion a6 enlève b5 aux pièces blanches et prépare …b5. Les Noirs choisiront ensuite …e5 (en surveillant la case d5, en vert : un cavalier blanc y serait très fort) ou …e6. La colonne c est déjà semi-ouverte pour la tour et la dame noires.',
      arrows: [
        { from: 'b7', to: 'b5', kind: 'idea' },
        { from: 'e7', to: 'e5', kind: 'idea' },
        { from: 'c8', to: 'c3', kind: 'good' },
      ],
      marks: [
        { square: 'd5', kind: 'weak' },
        { square: 'b5', kind: 'strong' },
      ],
    },
    {
      type: 'position',
      title: 'Roques opposés : la course à l’attaque',
      fen: 'r2q1rk1/1p1nbppp/p2pbn2/4p3/4P1P1/1NN1BP2/PPPQ3P/2KR1B1R b - - 0 11',
      orientation: 'black',
      caption:
        'Attaque anglaise après 11.g4. Les Blancs ont roqué côté dame et lancent g4–g5 contre le cavalier f6. Les Noirs ne défendent pas : ils contre-attaquent avec …b5–b4 contre le cavalier c3, défenseur du roi blanc. Stockfish donne un léger avantage aux Blancs, mais le premier qui hésite perd.',
      arrows: [
        { from: 'g4', to: 'g5', kind: 'threat' },
        { from: 'b7', to: 'b5', kind: 'good' },
        { from: 'b5', to: 'b4', kind: 'good' },
      ],
      moves: [
        { uci: 'b7b5', comment: '11…b5 : les Noirs lancent leur propre attaque, sans perdre de temps.' },
        { uci: 'g4g5', comment: '12.g5 : le pion chasse le cavalier f6…' },
        { uci: 'b5b4', comment: '12…b4 : … et le pion noir chasse le cavalier c3. Chacun attaque l’autre.' },
        { uci: 'g5f6', comment: '13.gxf6 : les Blancs prennent le cavalier.' },
        { uci: 'b4c3', comment: '13…bxc3 : les Noirs reprennent la pièce et ouvrent des lignes vers le roi blanc.' },
        { uci: 'd2c3', comment: '14.Dxc3 : la dame reprend.' },
        { uci: 'e7f6', comment: '14…Fxf6 : matériel égal. Le roi blanc a perdu son pion b et son cavalier c3, le roi noir son cavalier f6 : les deux rois sont exposés, il faut attaquer vite (…Tc8, …Db6, …a5–a4).' },
      ],
    },
    {
      type: 'position',
      title: 'Alapin : le fou dehors avant …e6',
      fen: 'r3kb1r/pp3ppp/2n1pn2/3q3b/3P4/4BN1P/PP2BPP1/RN1Q1RK1 b kq - 0 10',
      orientation: 'black',
      caption:
        '2.c3 d5 3.exd5 Dxd5 4.d4 Cf6 5.Cf3 Fg4 6.Fe2 e6 7.h3 Fh5 8.O-O Cc6 9.Fe3 cxd4 10.cxd4. La dame noire est bien en d5 (le pion c3 a privé les Blancs de la case c3 pour chasser la dame avec gain de temps). Le fou h5 est sorti AVANT …e6, comme dans ta Caro-Kann. Les Blancs ont un pion isolé en d4 : les Noirs le bloquent (case d5) et l’attaquent.',
      marks: [
        { square: 'd4', kind: 'target' },
        { square: 'd5', kind: 'strong' },
      ],
      arrows: [{ from: 'h5', to: 'f3', kind: 'good' }],
      moves: [
        { uci: 'f8e7', comment: '10…Fe7 : on termine le développement, puis O-O.' },
        { uci: 'b1c3', comment: '11.Cc3 : le cavalier chasse la dame.' },
        { uci: 'd5d6', comment: '11…Dd6 : la dame se replie en gardant l’œil sur d4 et la case de blocage d5. Plan : O-O, Tfd8, Cd5 : pression sur le pion isolé. Stockfish : égalité.' },
      ],
    },
  ],
  pgn: `
1. e4 {Les Blancs prennent le centre.}
1... c5 {[%cal Gc5d4] La Sicilienne : le pion c contrôle d4 depuis l’aile. Si les Blancs jouent d4, les Noirs échangeront un pion d’aile contre un pion central.}
2. Nf3 {[%name Sicilienne ouverte] Les Blancs préparent d4 pour ouvrir le jeu.}
(2. c3 {[%name Alapin] Les Blancs préparent d4 pour pouvoir reprendre avec un pion (cxd4) et garder un centre e4–d4.}
2... d5 {[%cal Gd5e4] Le plus simple : on attaque e4 tout de suite, avant que d4 ne soutienne le centre. La dame pourra reprendre en d5 : le pion c3 enlève la case c3 au cavalier blanc, qui ne pourra pas la chasser.}
3. exd5 {Les Blancs échangent.}
3... Qxd5 {La dame reprend, centralisée ; personne ne peut la chasser avec gain de temps.}
4. d4 {Les Blancs construisent le centre.}
4... Nf6 {Développe et contrôle e4 et d5.}
5. Nf3 {Les Blancs se développent.}
5... Bg4 {[%cal Gg4f3] Comme dans ta Caro-Kann : le fou de cases blanches sort AVANT …e6. Il cloue le cavalier f3, défenseur de d4.}
6. Be2 {Les Blancs déclouent.}
6... e6 {Maintenant seulement on ferme la diagonale : le fou est déjà dehors.}
7. h3 {Les Blancs demandent au fou de choisir.}
7... Bh5 {On garde le clouage ; le fou reste actif.}
8. O-O {Les Blancs roquent.}
8... Nc6 {Le cavalier attaque d4 une deuxième fois.}
9. Be3 {Les Blancs défendent d4.}
9... cxd4 {[%csl Yd4] On échange pour laisser aux Blancs un pion isolé en d4.}
10. cxd4 {Le pion d4 est isolé.}
10... Be7 {[%csl Gd5,Yd4] Plan : O-O, Td8, …Cd5 ou …Cb4–d5 : bloquer et attaquer le pion isolé d4. Position égale et facile à jouer pour les Noirs.})
(2. Nc3 {[%name Sicilienne fermée / Grand Prix] Les Blancs gardent d4 pour plus tard et préparent f4 ou g3 : une attaque à l’aile roi sans théorie.}
2... Nc6 {Les Noirs contrôlent d4 et e5.}
3. f4 {[%name Attaque Grand Prix] Les Blancs veulent Cf3, Fc4 ou Fb5, O-O puis f5 contre le roi noir.}
(3. g3 {[%name Sicilienne fermée] Le fou ira en g2 sur la grande diagonale ; les Blancs joueront d3, f4 et Cf3 à l’aile roi.}
3... g6 {[%cal Gg7b2] Les Noirs font pareil : leur fou ira en g7 sur la grande diagonale, vers b2.}
4. Bg2 {Le fou blanc sur la grande diagonale.}
4... Bg7 {Le fou noir vise b2 et le centre.}
5. d3 {Les Blancs soutiennent e4.}
5... d6 {Les Noirs soutiennent e5 et ouvrent le fou c8.}
6. f4 {Les Blancs préparent f5 ou e5 à l’aile roi.}
6... e6 {[%cal Ge6f5] Contrôle f5 et d5 ; le cavalier ira en e7 pour ne pas se faire chasser par e5 ou f5.}
7. Nf3 {Les Blancs se développent.}
7... Nge7 {Le cavalier en e7 soutient …d5 ou …f5 et ne bloque pas le fou g7.}
8. O-O {Les Blancs roquent.}
8... O-O {Plan noir : …Tb8, …b5–b4 à l’aile dame (là où le fou g7 regarde), ou …d5 au centre. Les Blancs jouent à l’aile roi : chacun son côté.})
3... e6 {[%cal Ge6d5] Prépare …d5 pour contester e4 et couper la diagonale du fou s’il vient en c4.}
4. Nf3 {Les Blancs se développent.}
4... d5 {[%cal Gd5e4] Le centre est contesté : le pion d5 attaque e4.}
5. Bb5 {Le fou cloue le cavalier c6.}
5... Nge7 {[%cal Ge7c6] Le cavalier soutient c6 : si Fxc6, on reprend avec le cavalier.}
6. O-O {Les Blancs roquent.}
6... a6 {Demande au fou de choisir.}
7. Bxc6+ {Les Blancs échangent.}
7... Nxc6 {[%csl Gd5] Les Noirs ont la paire de fous et un bon centre (d5, e6). Plan : …Fe7, O-O, …b5 et …d4 pour gagner de l’espace. Égalité confortable.})
(2. d4 {[%name Gambit Smith-Morra] Les Blancs proposent d’ouvrir le centre tout de suite.}
2... cxd4 {On prend : un pion central contre un pion d’aile, comme toujours dans la Sicilienne.}
3. c3 {Le gambit : les Blancs offrent un pion pour une avance de développement (Cxc3, Fc4, Cf3, O-O, De2, Td1).}
3... dxc3 {On accepte : un pion, c’est un pion, à condition de se développer prudemment.}
4. Nxc3 {Les Blancs ont trois pièces prêtes à sortir vite.}
4... Nc6 {Développe et contrôle d4 et e5.}
5. Nf3 {Les Blancs se développent.}
5... d6 {Contrôle e5 : la poussée e4–e5 est l’arme principale des Blancs.}
6. Bc4 {[%cal Yc4f7] Le fou vise f7, et e4–e5 menace d’ouvrir la diagonale.}
6... e6 {[%cal Ge6d5] Le bon ordre : on coupe la diagonale du fou c4 vers f7 AVANT de sortir le cavalier en f6.}
(6... Nf6? {L’erreur classique : 7.e5! menace de prendre en f6, et 7…Cxe5?? 8.Cxe5 dxe5?? 9.Fxf7+ Rxf7 10.Dxd8 perd la dame.}
7. e5 {Le pion attaque le cavalier f6.}
7... Ng4 {La bonne défense : le cavalier s’échappe en attaquant e5. Les Noirs survivent, mais les Blancs ont l’initiative.})
7. O-O {Les Blancs roquent.}
7... Nf6 {Maintenant le cavalier peut sortir : f7 est protégé par le pion e6.}
8. Qe2 {La dame dégage la colonne d pour la tour.}
8... Be7 {Le fou se développe et le roi pourra roquer.}
9. Rd1 {[%cal Yd1d6] La tour vise le pion d6 sur la colonne ouverte.}
9... e5 {[%cal Ge5d4] On ferme la colonne d et on prend la case d4 ; le pion d6 est protégé par la dame.}
10. Be3 {Les Blancs visent b6 et a7.}
10... O-O {Les Noirs ont un pion de plus et une position solide. Plan : …Fe6, …Tc8, échanger les pièces actives des Blancs ; la compensation blanche s’effrite avec chaque échange.})
2... d6 {Protège e5 et prépare …Cf6 sans risquer e4–e5.}
3. d4 {Les Blancs ouvrent le jeu.}
3... cxd4 {[%cal Gc5d4] L’échange typique : un pion d’aile contre un pion central. La colonne c s’ouvre pour les Noirs.}
4. Nxd4 {Le cavalier reprend, centralisé.}
(4. Qxd4 {Un coup fréquent en club : la dame reprend, mais elle va se faire chasser.}
4... Nc6 {[%cal Gc6d4] Le cavalier attaque la dame avec gain de temps.}
5. Bb5 {Les Blancs clouent le cavalier pour garder la dame au centre.}
5... Bd7 {Le fou décloue le cavalier et prépare …Cxd4 si la dame reste.}
6. Bxc6 {Les Blancs échangent.}
6... Bxc6 {Les Noirs ont la paire de fous, et le fou c6 vise e4.}
7. Nc3 {Les Blancs défendent e4.}
7... Nf6 {Développe le dernier cavalier et met une deuxième pièce sur e4, avec le fou c6.}
8. Bg5 {Les Blancs clouent le cavalier f6.}
8... e6 {Solidifie d5 et ouvre le fou f8.}
9. O-O-O {Les Blancs roquent du côté dame.}
9... Be7 {Plan noir : O-O, …Da5, …Tc8 et …b5 contre le roi blanc ; la paire de fous et la colonne c compensent l’espace blanc.})
4... Nf6 {Développe en attaquant e4 : les Blancs doivent le défendre.}
5. Nc3 {Les Blancs défendent e4.}
5... a6 {[%name Najdorf] [%cal Gb7b5] [%csl Gb5] Contrôle b5 (plus de Cb5 ni de Fb5+) et prépare …b5. Les Noirs choisiront …e5 ou …e6 selon le coup blanc.}
6. Be2 {Un développement calme : les Blancs roqueront.}
(6. Be3 {[%name Attaque anglaise] Les Blancs préparent f3, Dd2 et O-O-O : roques opposés.}
6... e5 {[%cal Ge5d4] Chasse le cavalier d4 et prend sa part du centre ; le trou en d5 sera surveillé par …Fe6.}
7. Nb3 {Le cavalier recule à l’abri, mais il ne contrôle plus d5 ni f5.}
7... Be6 {[%csl Gd5] Le fou surveille d5, la case clé.}
8. f3 {Les Blancs soutiennent e4 et préparent g4.}
8... Be7 {Les Noirs se développent.}
9. Qd2 {Les Blancs préparent O-O-O.}
9... O-O {Les Noirs roquent du côté où ils ne seront pas attaqués… en principe.}
10. O-O-O {Roques opposés.}
10... Nbd7 {Le cavalier soutient f6 et pourra aller en b6, vers d5 ou a4.}
11. g4 {Les Blancs lancent g4–g5.}
11... b5 {[%cal Gb5b4] Contre-attaque : …b4 chassera le cavalier c3. Plan : …b4, …a5, …Tc8, …Db6 ; on attaque, on ne défend pas.})
(6. Bc4 {[%name Attaque Sozin] Le fou vise f7 et d5.}
6... e6 {[%cal Ge6d5] Le pion coupe la diagonale du fou c4 ; …e5 laisserait un trou en d5.}
7. Bb3 {Le fou se met à l’abri de …d5 et …b5.}
7... b5 {[%cal Gb5b4] Prend de l’espace : …b4 chassera le cavalier c3.}
8. O-O {Les Blancs roquent.}
8... Be7 {Le fou se développe et prépare O-O. Plan : …O-O, …Fb7 (pression sur e4), …b4 ; le fou b3 bute sur le pion e6.})
6... e5 {[%cal Ge5d4] Le pion chasse le cavalier d4 et prend sa part du centre.}
7. Nb3 {Le cavalier recule à l’abri, mais il ne contrôle plus d5 ni f5.}
(7. Nf5?! {Tentant, mais le cavalier est mal placé en f5 : 7…d5! ouvre le centre.}
7... d5 {[%cal Gd5e4] La contre-attaque au centre : si 8.exd5? Fxf5 et les Noirs gagnent une pièce.}
8. Bg5 {Les Blancs clouent le cavalier f6, défenseur de d5.}
8... d4 {Le pion chasse le cavalier c3 avec gain de temps.}
9. Bxf6 {Les Blancs échangent le cavalier f6.}
9... Qxf6 {La dame reprend, active. Les Noirs ont plus d’espace au centre et la paire de fous ; le cavalier f5 va devoir reculer.})
7... Be7 {Le fou se développe ; le roi va roquer.}
8. O-O {Les Blancs roquent.}
8... O-O {Le roi à l’abri : les Noirs sont prêts pour …Fe6 et …Cbd7.}
9. Be3 {Les Blancs visent b6 et contrôlent d4.}
9... Be6 {[%csl Gd5] [%cal Gb7b5,Ga8c8] Le fou surveille d5. Plan : …Cbd7, …Tc8, …Dc7, …b5 ; et la poussée …d5 dès qu’elle est possible, qui libère toute la position.}
`,
  traps: [
    {
      title: 'Smith-Morra : 6…Cf6? 7.e5!',
      fen: 'r1bqkb1r/pp2pppp/2np1n2/4P3/2B5/2N2N2/PP3PPP/R1BQK2R b KQkq - 0 7',
      prompt:
        'Tu as les Noirs. Tu as accepté le gambit, mais tu as sorti trop tôt le cavalier (6…Cf6?) et les Blancs ont poussé 7.e5!. Le cavalier f6 est attaqué : trouve la défense (attention à la prise tentante).',
      solution: ['f6g4', 'e5d6', 'e7d6'],
      acceptAlso: ['d6d5'],
      explanation:
        '**7…Cg4!** (ou 7…d5) : le cavalier se sauve en attaquant e5. La prise tentante **7…Cxe5??** perd : 8.Cxe5! et si 8…dxe5?? 9.Fxf7+! Rxf7 10.Dxd8 gagne la dame (et sans 8…dxe5, les Noirs ont juste une pièce de moins). 7…dxe5 8.Dxd8+ Rxd8 est moins bon : le roi noir perd le roque et les Blancs gardent l’initiative (9.Cg5). La leçon : dans le Smith-Morra, joue **…e6 avant …Cf6** pour couper le fou c4 de f7.',
    },
    {
      title: 'Najdorf : le cavalier en f5',
      fen: 'rnbqkb1r/1p3ppp/p2p1n2/4pN2/4P3/2N5/PPP1BPPP/R1BQK2R b KQkq - 1 7',
      prompt:
        'Tu as les Noirs. Après 6.Fe2 e5, les Blancs ont joué le tentant 7.Cf5?! au lieu de 7.Cb3. Comment profiter du cavalier mal placé ?',
      solution: ['d6d5', 'c1g5', 'd5d4'],
      explanation:
        '**7…d5!** : la contre-attaque au centre. Si 8.exd5?, 8…Fxf5 gagne une pièce (le cavalier n’est plus défendu). Après **8.Fg5 d4** le cavalier c3 doit reculer et les Noirs ont plus d’espace : Stockfish les préfère nettement. Prendre 7…Fxf5 8.exf5 est jouable mais moins fort. Retiens l’idée : dans la Sicilienne, la poussée …d5 libère la position dès qu’elle est possible.',
    },
  ],
};

export default sicilienne;
