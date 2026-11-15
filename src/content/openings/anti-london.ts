import type { Opening } from './types';

// Contre le Londres et les systèmes 1.d4 sans 2.c4 : 1…d5, puis …Cf6, …c5, …Cc6, …Db6 contre le Londres,
// et le fou de cases blanches sorti en f5 (ou …c6 + …Ff5) contre les autres systèmes.
// Lignes contrôlées avec Stockfish 17.1 (profondeur 16–18).
const antiLondon: Opening = {
  id: 'anti-london',
  name: 'Contre le Londres et les systèmes 1.d4',
  side: 'black',
  family: 'repertoire',
  against: 'contre 1.d4 sans 2.c4',
  eco: 'D00, D02, A45',
  summary:
    'Contre le Londres : …Cf6, …c5, …Cc6 et …Db6, qui attaque b2 au moment où le fou f4 a quitté c1, puis …c4, …g6 + …Ff5 et …Ch5 pour chasser le fou f4. Contre Colle, Jobava, Levitsky, Blackmar-Diemer et Catalane fermée : sortir le fou en f5 et l’échanger contre le fou blanc dangereux.',
  why:
    'Tu joues toi-même le Londres : ce répertoire t’apprend exactement ce qu’il craint (la dame en b6 contre b2, la poussée …c4, le cavalier en h5 qui chasse le fou f4), et ces leçons valent aussi pour tes parties avec les Blancs. Contre les autres systèmes, une seule idée sert partout : le fou c8 sort avant …e6 et s’échange contre le fou blanc qui vise ton roi.',
  keyIdeas: [
    'Contre le Londres : …Cf6, …c5, …Cc6 puis …Db6. Le fou f4 a quitté c1, donc b2 n’est défendu par personne.',
    'Si la dame blanche vient en b3, réponds …c4 : la dame est chassée avec gain d’espace. Si elle va en c2 (avec Cd2), joue d’abord …g6 : …Ff5 tout de suite perdrait le fou sur Dxf5.',
    'Le fou f4 est la meilleure pièce du Londres : …Ch5 le chasse, et après …f6 ou …h6/…g5 il n’a plus de bonne case.',
    'Contre Colle (Fd3), Jobava et Blackmar-Diemer : …Ff5 et …Fxd3 échangent le fou blanc qui vise h7.',
    'Si les Blancs jouent c4 (Gambit Dame) ou passent par Cf3 + c4, c’est une Slave : …c6 et le fou en f5.',
    'Contre Fg5 (Levitsky), …c6 et …Db6 : même idée qu’au Londres, b2 est sans défense.',
  ],
  sections: [
    {
      type: 'text',
      title: 'Le plan : attaquer là où le Londres est faible',
      paragraphs: [
        'Le Londres a deux qualités : un fou f4 très actif et une structure c3–d4–e3 très solide. Mais il a aussi des défauts qu’un joueur de 1200 ne regarde jamais — tu les connais sûrement de l’intérieur : **quand le fou f4 sort, plus personne ne défend b2**, et le fou f4 lui-même n’a que deux cases de retraite (g3 et e5).',
        'Le plan des Noirs en découle : **…Cf6, …c5, …Cc6, …Db6**. Trois pièces et un pion visent d4 et b2. Les Blancs doivent jouer Db3 (ou Dc1/Db1, des coups passifs). Contre Db3, **…c4 !** chasse la dame avec gain d’espace, puis **…g6 et …Ff5** la chasse encore de c2 : le fou c8 sort avant …e6, comme dans la Slave et la Caro-Kann. Le petit coup …g6 n’est pas un détail : sans lui, la dame c2 prendrait le fou en f5 par la diagonale c2–f5.',
        'Ensuite vient la chasse au fou f4 : **…Ch5**. Si le fou va en g5, …f6 (ou …h6) le chasse ; s’il va en e5, …f6 ; s’il va en g3, on le prend. Les Noirs gagnent la paire de fous et le fou de cases noires du Londres disparaît.',
        'Contre les autres systèmes (Colle avec Fd3, Jobava avec Cc3 + Ff4, Blackmar-Diemer), la même idée revient : le fou blanc le plus dangereux est celui qui vise h7 depuis d3. **…Ff5 puis …Fxd3** l’échange, et l’attaque blanche n’a plus de moteur.',
      ],
    },
    {
      type: 'text',
      title: 'Ce que ça t’apprend pour ton Londres avec les Blancs',
      paragraphs: [
        'Tout ce qui fait souffrir le Londres ici doit être évité quand tu as les Blancs. **Contre …Db6, joue Db3** (ou Dc1) tout de suite : ne laisse jamais b2 en prise, et ne joue pas Tb1 (après …cxd4 et …Ff5, la tour est attaquée et b2 tombe quand même).',
        '**Si les Noirs poussent …c4 contre ta dame en b3**, la réponse la plus simple est souvent Dxb6 : la dame noire n’existe plus et tu n’as plus de soucis sur b2. Si ta dame recule en c2, regarde f5 : si les Noirs y posent leur fou sans protection, **Dxf5** gagne une pièce. Après …g6 et …Ff5, recule en c1 (pas en d1, qui lâche b2) et ne joue surtout pas e4 tant que le cavalier f6 peut prendre ce pion.',
        '**Garde une case pour ton fou f4** : contre …Ch5, la retraite g3 (préparée par h3 pour avoir h2) permet de reprendre hxg3 avec une colonne h ouverte. Beaucoup de joueurs du Londres jouent h3 tôt justement pour cela.',
      ],
    },
    {
      type: 'position',
      title: '…Db6 : le point faible b2',
      fen: 'r1bqkb1r/pp2pppp/2n2n2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR b KQkq - 2 5',
      orientation: 'black',
      caption:
        '1.d4 d5 2.Ff4 Cf6 3.e3 c5 4.c3 Cc6 5.Cd2. Le Londres classique : solide, mais le fou f4 a quitté c1 et plus rien ne défend b2. Le pion c5 et le cavalier c6 attaquent déjà d4.',
      arrows: [
        { from: 'c5', to: 'd4', kind: 'good' },
        { from: 'c6', to: 'd4', kind: 'good' },
      ],
      marks: [{ square: 'b2', kind: 'target' }],
      moves: [
        { uci: 'd8b6', comment: '5…Db6 ! : la dame attaque b2 et met une pression de plus sur d4 (via la diagonale b6–d4 si c5 s’échange). Les Blancs doivent réagir tout de suite, en général par 6.Db3.' },
      ],
    },
    {
      type: 'position',
      title: '…c4, …g6 puis …Ff5 : la dame blanche chassée deux fois',
      fen: 'r1b1kb1r/pp2pppp/1qn2n2/3p4/2pP1B2/2P1P3/PPQN1PPP/R3KBNR b KQkq - 1 7',
      orientation: 'black',
      caption:
        'Après 6.Db3 c4 ! 7.Dc2 : le pion c4 a chassé la dame et gagné de l’espace à l’aile dame (les Blancs ne peuvent plus jouer c4 ni Fd3). On voudrait sortir le fou en f5 avec gain de temps… mais attention : la dame c2 voit f5 par la diagonale c2–d3–e4–f5, et 7…Ff5?? 8.Dxf5 perd une pièce. D’abord on protège la case.',
      arrows: [
        { from: 'c2', to: 'f5', kind: 'threat' },
        { from: 'g7', to: 'g6', kind: 'good' },
      ],
      marks: [{ square: 'c4', kind: 'strong' }],
      moves: [
        { uci: 'g7g6', comment: '7…g6 ! : le pion g6 protégera le fou en f5, et le fou f8 ira en g7 sur la grande diagonale.' },
        { uci: 'g1f3', comment: '8.Cgf3 : développement naturel.' },
        { uci: 'c8f5', comment: '8…Ff5 : maintenant le fou sort, protégé par g6, et attaque la dame. Il sort avant …e6 — toujours le même principe.' },
        { uci: 'c2c1', comment: '9.Dc1 : la dame protège b2 et reste en contact avec le fou f4. Attention, 9.e4? perd un pion sur 9…Cxe4 et 9.Dd1? lâche b2.' },
      ],
    },
    {
      type: 'position',
      title: 'La chasse au fou f4',
      fen: 'r3kb1r/pp2pp1p/1qn2np1/3p1b2/2pP1B2/2P1PN2/PP1N1PPP/R1Q1KB1R b KQkq - 3 9',
      orientation: 'black',
      caption:
        'Le fou f4 est la pièce la plus active des Blancs : c’est lui qui contrôle e5 et b8. Le cavalier f6 va le chasser.',
      arrows: [{ from: 'f6', to: 'h5', kind: 'good' }],
      marks: [{ square: 'f4', kind: 'target' }],
      moves: [
        { uci: 'f6h5', comment: '9…Ch5 ! : le cavalier attaque le fou. S’il recule en g3, …Cxg3 et les Noirs ont la paire de fous.' },
        { uci: 'f4g5', comment: '10.Fg5 : le fou garde la diagonale, mais il est près des pions noirs.' },
        { uci: 'f7f6', comment: '10…f6 ! : le fou est encore chassé. Il n’a plus que h4.' },
        { uci: 'g5h4', comment: '11.Fh4 : seule case.' },
        { uci: 'g6g5', comment: '11…g5 : et encore chassé ! Le fou doit aller en g3, où le cavalier l’attend.' },
        { uci: 'h4g3', comment: '12.Fg3 : forcé.' },
        { uci: 'h5g3', comment: '12…Cxg3 : le fou du Londres a disparu.' },
        { uci: 'h2g3', comment: '13.hxg3 : les Noirs ont la paire de fous et de l’espace ; Stockfish leur donne environ un demi-pion d’avantage. Plan : …e6, …Fd6, …b5–b4.' },
      ],
    },
    {
      type: 'position',
      title: 'Système Colle : échanger le fou d3',
      fen: 'rn1qkb1r/ppp1pppp/5n2/3p1b2/3P4/3BPN2/PPP2PPP/RNBQK2R b KQkq - 2 4',
      orientation: 'black',
      caption:
        '1.d4 d5 2.Cf3 Cf6 3.e3 Ff5 4.Fd3. Dans le Colle, le fou d3 est l’arme d’attaque : après c3, Cbd2 et e4, il viserait h7. Le fou f5 lui fait face.',
      arrows: [{ from: 'd3', to: 'h7', kind: 'threat' }],
      moves: [
        { uci: 'f5d3', comment: '4…Fxd3 : on échange tout de suite le fou qui visait h7.' },
        { uci: 'd1d3', comment: '5.Dxd3 : la dame reprend.' },
        { uci: 'e7e6', comment: '5…e6 : seulement maintenant la chaîne se ferme. Les Blancs n’ont plus de fou de cases blanches pour attaquer ; plan : …c5, …Cc6, …Fd6 ou …Fe7, roque.' },
      ],
    },
    {
      type: 'position',
      title: 'Jobava : …c6 enlève b5 au cavalier',
      fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2N5/PPP1PPPP/R2QKBNR b KQkq - 3 3',
      orientation: 'black',
      caption:
        '1.d4 d5 2.Cc3 Cf6 3.Ff4 : le Jobava. L’idée des Blancs est Cb5 qui attaque c7 avec le fou f4. Un seul coup règle le problème et ramène à une structure Slave.',
      arrows: [
        { from: 'c3', to: 'b5', kind: 'threat' },
        { from: 'f4', to: 'c7', kind: 'threat' },
      ],
      moves: [
        { uci: 'c7c6', comment: '3…c6 : la case b5 est contrôlée, c7 n’est plus une cible, et le fou c8 sortira en f5 au coup suivant.' },
        { uci: 'e2e3', comment: '4.e3 : développement normal.' },
        { uci: 'c8f5', comment: '4…Ff5 : le fou sort avant …e6. Contre 5.Fd3, on échange (…Fxd3) ; contre 5.f3 et g4, on recule en g6.' },
      ],
    },
  ],
  pgn: `
1. d4 d5 {Le pion d5 occupe le centre et empêche e4. C’est le même premier coup que dans la Slave : contre 2.c4 tu joues 2…c6, contre tout le reste ce répertoire.}
2. Bf4 {[%name Système de Londres (2.Ff4)] Le Londres : le fou sort avant e3. Mais il quitte c1, et b2 n’a plus de défenseur.}
(2. Nf3 {[%name 2.Cf3 : Londres, Colle ou Catalane] Coup d’attente : les Blancs choisiront entre Ff4 (Londres), e3 (Colle), g3 (Catalane) ou c4 (Gambit Dame).}
2... Nf6 {Le cavalier contrôle e4 : on attend de voir le système des Blancs avant de décider où va le fou c8.}
3. Bf4 {On rejoint le Londres.}
(3. e3 {[%name Système Colle] Le Colle : les Blancs enferment leur fou c1 et préparent Fd3, c3, Cbd2 puis e4.}
3... Bf5 {Le fou sort avant …e6 et se place face à la case d3, où les Blancs veulent mettre leur fou d’attaque. [%cal Gc8f5]}
4. Bd3 {Les Blancs posent leur fou d’attaque en d3, face au nôtre.}
(4. c4 {Les Blancs passent dans un Gambit Dame avec e3.}
4... c6 {On soutient d5 avec c6 : c’est une Slave où notre fou est déjà sorti.}
5. Nc3 e6 {La structure Slave idéale : fou f5 dehors, chaîne c6–d5–e6. Si Db3, …Db6 ; si Ch4, …Fg6.})
4... Bxd3 {On échange le fou qui visait h7 : sans lui, le Colle n’a plus d’attaque. [%cal Gf5d3]}
5. Qxd3 {La dame reprend et soutient la poussée e4.}
(5. cxd3 {Les Blancs reprennent vers le centre pour préparer e4 avec le pion d3.}
5... e6 {La chaîne se ferme derrière le fou parti. Plan : …Fd6, …O-O, …c5. Si 6.Db3, …Dc8 ou …b6 défend b7.})
5... e6 {Maintenant on ferme la chaîne ; le fou f8 peut sortir en d6 ou e7.}
6. O-O c5 {On attaque d4 avant que les Blancs ne jouent e4. Plan : …Cc6, …Fe7 ou …Fd6, roque. Position égale. [%cal Gc5d4]})
(3. g3 {[%name Catalane fermée (3.g3)] Les Blancs mettent leur fou en g2, sur la grande diagonale ; c4 viendra plus tard.}
3... Bf5 {Le fou sort avant …e6 : il contrôle e4 et ne sera pas enfermé.}
4. Bg2 e6 {La chaîne derrière le fou ; le fou f8 sortira en e7 ou d6.}
5. O-O c6 {Le pion c6 soutient d5 : on prépare la structure Slave pour le moment où les Blancs joueront c4. Si Db3, …Db6.}
6. c4 {Les Blancs attaquent d5.}
(6. Nh4 {Le cavalier chasse le fou f5.}
6... Bg4 {Le fou s’installe en g4 où il gêne le pion e2 ; …Fh5 si h3.}
7. h3 Bh5 {Le fou garde le clouage ; si g4, …Fg6. Plan : …Cbd7, …Fe7, roque.})
6... Nbd7 {Le cavalier soutient f6 et prépare …Fe7 et roque. Plan : …Db6 contre Db3, …dxc4 et …Cb6 pour gêner la dame.})
(3. c4 {Les Blancs passent dans le Gambit Dame.}
3... c6 {On joue la Slave : voir l’ouverture « Défense Slave ».})
3... c5 {Même système qu’après 2.Ff4 : le pion c5 attaque d4 et ouvre la diagonale de la dame vers b6.}
4. e3 Nc6 {On rejoint le système principal contre le Londres (voir 2.Ff4 Cf6 3.e3 c5 4.Cf3 Cc6).})
(2. c4 {[%name Gambit Dame (2.c4)] Les Blancs attaquent d5 avec un pion.}
2... c6 {C’est la Défense Slave, l’autre ouverture de ton répertoire : le fou c8 sortira en f5 avant …e6.})
(2. Nc3 {[%name Attaque Jobava (2.Cc3)] Les Blancs veulent Ff4 et Cb5, qui attaque c7.}
2... Nf6 {Le cavalier contrôle e4, la case où les Blancs veulent pousser.}
3. Bf4 {Le Jobava : Cb5 menace d’attaquer c7 avec le fou f4.}
3... c6 {Le pion c6 enlève la case b5 au cavalier : c7 n’est plus une cible. Structure Slave. [%csl Gb5] [%cal Gc6b5]}
4. e3 Bf5 {Le fou sort avant …e6, comme toujours. [%cal Gc8f5]}
5. Bd3 {Les Blancs proposent l’échange des fous de cases blanches.}
(5. f3 {Les Blancs préparent g4 pour chasser le fou f5.}
5... e6 {On ouvre une case de retraite au fou f8 et on garde le fou f5 pour l’instant.}
6. g4 Bg6 {Le fou recule ; ne prends surtout pas en g4 (…Cxg4 ? fxg4 et une pièce est perdue).}
7. h4 h6 {On donne la case h7 au fou si h5 le chasse. Plan : …Fd6 pour échanger le fou f4, …c5 et …Cc6 : les pions blancs avancés seront des faiblesses.})
(5. Nf3 {Développement ; Ch4 pourrait suivre.}
5... e6 {La chaîne derrière le fou.}
6. Nh4 Bg6 {Le fou recule sur sa diagonale.}
7. Nxg6 hxg6 {On reprend de h7 : la colonne h s’ouvre. Plan : …Fd6 contre le fou f4, …Cbd7, …Dc7.})
5... Bxd3 {On échange le fou qui viserait h7. [%cal Gf5d3]}
6. Qxd3 {La dame reprend et contrôle e4.}
(6. Bxb8? {Le coup intermédiaire raté : les Blancs prennent le cavalier avant de reprendre en d3, mais le fou d3 s’échappe avec gain de matériel.}
6... Bxc2 {Le fou prend un pion et attaque la dame : il s’échappe avec un pion de plus.}
7. Qxc2 Rxb8 {On reprend le fou b8 : les Noirs ont un pion de plus.})
(6. cxd3 {Les Blancs reprennent vers le centre.}
6... e6 {La chaîne derrière le fou parti. Plan : …Fd6 pour échanger le fou f4, …Cbd7, roque.})
6... e6 {Structure Slave sans fou de cases blanches de part et d’autre. Plan : …Fd6 pour échanger le fou f4, …Cbd7, roque, puis …c5 ou …e5.})
(2. Bg5 {[%name Attaque Levitsky (2.Fg5)] Le fou sort en g5 avant e3 : comme au Londres, b2 perd son défenseur.}
2... c6 {Le pion c6 soutient d5 et ouvre la diagonale d8–b6 : la dame va viser b2.}
3. e3 {Les Blancs ouvrent leur fou f1.}
(3. Nf3 {Développement ; e3 suivra.}
3... Bf5 {Le fou sort avant …e6. Avec …Db6 ensuite, b2 sera attaqué.}
4. e3 Qb6 {La dame attaque b2, que le fou g5 ne défend plus. [%cal Yb6b2]}
5. Qc1 e6 {La chaîne se ferme ; plan …Cd7, …Fe7 pour échanger le fou g5, …Cgf6.})
3... Qb6 {La dame attaque b2 : le fou g5 a quitté c1. [%cal Yb6b2] [%csl Yb2]}
4. Qc1 {La dame défend b2 : passif, mais solide.}
(4. Nc3? {Le cavalier sort, mais b2 n’a toujours aucun défenseur et tombe.}
4... Qxb2 {La dame prend b2 et attaque le cavalier c3. Les Noirs ont un pion de plus (+0,9 selon Stockfish).})
(4. Nf3 {Les Blancs ignorent b2 ; Cbd2 et Tb1 donneraient du jeu si la dame le prend.}
4... Bf5 {On sort le fou ; la menace …Dxb2 reste. Si 5.Dc1, …e6.}
5. Qc1 e6 {Même structure : fou f5, chaîne c6–d5–e6, plan …Cd7 et …Fe7.})
4... Bf5 {Le fou sort avant …e6 et contrôle e4. [%cal Gc8f5]}
5. c4 e6 {La chaîne derrière le fou.}
6. Nc3 Nd7 {Le cavalier va en f6 par d7 (ou soutient …e5). Plan : …Cgf6, …Fe7 pour échanger le fou g5, roque.})
(2. e4 {[%name Gambit Blackmar-Diemer (2.e4)] Les Blancs sacrifient un pion pour ouvrir la colonne f et attaquer vite.}
2... dxe4 {On accepte le pion : refuser donnerait aux Blancs un centre gratuit.}
3. Nc3 {Le cavalier attaque e4.}
(3. f3 {Les Blancs attaquent e4 avec un pion.}
3... e5 {Le contre-gambit : on frappe d4 tout de suite.}
4. dxe5 Qxd1+ {On échange les dames : sans dame, plus d’attaque blanche.}
5. Kxd1 exf3 {On rend un peu de matériel mais on garde le pion : le roi blanc a perdu le roque.}
6. Nxf3 Nc6 {Le cavalier attaque e5. Finale avec un pion de plus et un meilleur roi : environ +0,9 pour les Noirs.})
3... Nf6 {Le cavalier défend le pion e4 et se développe.}
4. f3 {Le coup du gambit : les Blancs offrent un deuxième temps pour la colonne f.}
(4. Bg5 {Les Blancs clouent le cavalier avant f3.}
4... Bf5 {Le fou défend e4 et sort avant …e6.})
4... exf3 {On prend : la colonne f s’ouvre, mais les Noirs ont un pion de plus.}
5. Nxf3 Bf5 {Le fou sort avant …e6 et contrôle d3 et e4. [%cal Gc8f5]}
6. Bd3 {Le fou blanc d’attaque vise h7.}
(6. Bc4 {Le fou vise f7, le point faible du roque.}
6... e6 {Le pion e6 bloque la diagonale c4–f7 et ouvre le fou f8. Plan : …c6, …Fd6 ou …Fe7, roque.})
(6. Bg5 {Le fou cloue le cavalier f6.}
6... e6 {On ouvre le fou f8 : …Fe7 défera le clouage. Plan : …c6, …Cbd7, roque.})
(6. Ne5 {Le cavalier vise f7 et g6.}
6... e6 {On ouvre la diagonale du fou f8 qui vise b4. Plan : …Fd6 ou …Fb4, roque.})
6... Bxd3 {On échange le fou dangereux.}
7. Qxd3 c6 {Le pion c6 contrôle d5 et b5. Plan : …e6, …Cbd7, …Fe7, roque. Pion de plus.})
2... Nf6 {Le cavalier contrôle e4 et prépare …c5 sans bloquer quoi que ce soit.}
3. e3 {Le Londres classique : e3 soutient d4 et ouvre le fou f1.}
(3. Nf3 {Ordre de coups différent.}
3... c5 {Même plan : …c5, …Cc6, …Db6.}
4. e3 Nc6 {On rejoint 3.e3 c5 4.Cf3 Cc6.})
(3. Nc3 {Les Blancs passent dans le Jobava.}
3... c6 {Le pion c6 enlève b5 au cavalier ; on joue ensuite …Ff5 (voir 2.Cc3).})
3... c5 {Le pion attaque d4 et ouvre la diagonale d8–b6 pour la dame. [%cal Gc5d4,Bd8b6]}
4. c3 {Les Blancs soutiennent d4 : la pyramide c3–d4–e3.}
(4. Nf3 {Développement avant c3 : b2 reste défendu plus longtemps.}
4... Nc6 {Le cavalier ajoute une pièce contre d4.}
5. Nbd2 {Le cavalier va vers b3 ou f3 ; b2 reste solide pour l’instant grâce à Tb1.}
(5. c3 {On rejoint la ligne principale.}
5... Qb6 {La dame attaque b2 : voir 4.c3 Cc6 5.Cf3 Db6.})
5... Nh5 {Le cavalier chasse le fou f4 : sans c3, …Db6 marche moins bien, alors on gagne la paire de fous. [%cal Gh5f4]}
6. Bg3 {Le fou recule en g3.}
(6. Bg5 {Le fou garde sa diagonale.}
6... h6 {On chasse le fou une deuxième fois.}
7. Bh4 g5 {Encore chassé : le fou doit aller en g3, où le cavalier le prendra.})
(6. dxc5 {Les Blancs prennent c5 et laissent le fou se faire échanger.}
6... Nxf4 {On prend le fou : paire de fous pour les Noirs.}
7. exf4 Qa5 {La dame va récupérer le pion c5. Plan : …Dxc5, …e6, …Fd6.})
6... Nxg3 {Le fou du Londres disparaît : paire de fous pour les Noirs.}
7. hxg3 e6 {On ouvre le fou f8. Plan : …Fd6 (qui vise g3), …Dc7, roque ; Stockfish juge la position égale.})
(4. dxc5 {Les Blancs prennent c5 et veulent le garder par b4.}
4... e6 {On ouvre le fou f8 qui reprendra en c5. Si 5.b4, 5…a5 ! attaque la base de la chaîne.})
4... Nc6 {Le cavalier ajoute une pièce contre d4.}
5. Nd2 {Le cavalier soutient e4 et va en f3 : la ligne principale.}
(5. Nf3 {Ordre de coups avec Cf3.}
5... Qb6 {La dame attaque b2, que le fou f4 ne défend plus.}
6. Qb3 c4 {On chasse la dame avec gain d’espace.}
7. Qc2 Bf5 {Ici, sans cavalier en d2, le fou peut sortir tout de suite : si 8.Dxf5 ?, 8…Dxb2 attaque la tour a1 et le cavalier b1, et les Noirs récupèrent bien plus que la pièce (+2,5).}
8. Qc1 e6 {Même plan qu’après 5.Cd2 : …Ch5, …Fe7, roque.})
5... Qb6 {La dame attaque b2, que le fou f4 ne défend plus. [%cal Yb6b2] [%csl Yb2]}
6. Qb3 {La meilleure réponse : la dame défend b2 et propose l’échange.}
(6. Rb1? {Défendre b2 avec la tour semble logique, mais la tour devient une cible sur la diagonale h7–b1.}
6... cxd4 {On ouvre la diagonale de notre fou c8 et la colonne c.}
7. exd4 {Les Blancs reprennent avec le pion e.}
(7. cxd4 {Les Blancs reprennent avec le pion c.}
7... Bf5 {Le fou attaque la tour b1 : b2 tombe (+1,7).})
7... Bf5 {Le fou attaque la tour b1 : elle doit partir et b2 tombe (+1,4 selon Stockfish). [%cal Yf5b1]})
(6. Ngf3 {Les Blancs ignorent b2.}
6... Qxb2 {On prend : le pion b2 n’était défendu par personne.}
7. Rb1 Qxc3 {La dame prend un deuxième pion. Elle est exposée, mais Stockfish donne l’avantage aux Noirs.}
8. Bb5 cxd4 {On ouvre la colonne c et le pion d4 attaque e3.}
9. Nxd4 Bd7 {Le fou défait le clouage du cavalier c6. Plan : …e6, …Fe7, roque ; deux pions de plus.})
6... c4 {Le pion chasse la dame et gagne de l’espace : les Blancs ne pourront plus jouer c4. [%cal Gc5c4]}
7. Qc2 {La dame recule en gardant b2.}
(7. Qxb6 {Les Blancs échangent les dames.}
7... axb6 {On reprend vers le centre : la tour a8 a la colonne a ouverte et …b5–b4 suivra. Les Noirs sont à l’aise.})
7... g6 {Le coup clé : le pion g6 protégera le fou quand il viendra en f5 (sinon la dame c2 le prendrait), et le fou f8 ira en g7. [%cal Bc8f5,Bf8g7]}
(7... Bf5? {L’erreur à connaître : le fou n’est défendu par rien et la dame c2 le voit par la diagonale c2–f5. 8.Dxf5 gagne une pièce ; 8…Dxb2 ne suffit pas (environ +1,8 pour les Blancs).} 8. Qxf5 {La dame prend le fou : une pièce de plus pour les Blancs.})
8. Ngf3 {Développement naturel.}
(8. e4 {Les Blancs ouvrent le centre tout de suite.}
8... Nxe4 {On prend le pion : après 9.Cxe4 dxe4, le pion noir e4 reste solide et gêne les Blancs.}
9. Nxe4 dxe4 {On reprend avec le pion : e4 gêne le développement blanc (le cavalier g1 n’a plus f3).}
10. Bxc4 Bg7 {Le fou vise d4 sur la grande diagonale. Plan : …O-O, …Ca5 pour chasser le fou c4, …Ff5. Position équilibrée.})
8... Bf5 {Maintenant le fou sort, protégé par g6, et chasse la dame. [%cal Gc8f5,Yf5c2]}
9. Qc1 {La dame se met à l’abri et protège b2.}
(9. e4? {Les Blancs veulent chasser le fou, mais le pion e4 tombe : défendu deux fois (Cd2, Dc2), il est attaqué par le cavalier f6 et par le fou f5, et l’échange en e4 laisse la dame c2 exposée au fou.}
9... Nxe4 {Le cavalier prend e4 : si 10.Cxe4 Fxe4, le fou attaque la dame c2. Les Noirs gagnent un pion (+1,2 selon Stockfish).})
(9. Qd1? {La dame recule trop loin : b2 n’est plus défendu.}
9... Qxb2 {La dame prend b2 et attaque c3 (+1,7 selon Stockfish).})
9... Nh5 {On chasse le fou f4, la meilleure pièce du Londres. [%cal Gh5f4]}
10. Bg5 {Le fou reste sur sa diagonale.}
(10. Be5 {Le fou va en e5, la case avancée.}
10... f6 {Le fou est chassé : il ne lui reste que g3.}
11. Bg3 e5 {Plus fort que de prendre tout de suite : le pion e5 attaque d4 et gagne le centre, et le fou g3 reste sous la menace de …Cxg3, qu’on jouera au bon moment. Plan : …Fe7, …O-O-O, …Cxg3.})
(10. Bg3 {Le fou recule directement.}
10... Nxg3 {On prend : paire de fous et le fou du Londres a disparu. Après 11.hxg3 : …Fg7, roque, …b5.})
10... f6 {Le fou est chassé une nouvelle fois.}
11. Bh4 g5 {Encore ! Le fou doit aller en g3.}
12. Bg3 Nxg3 {Le fou du Londres disparaît : paire de fous et espace, Stockfish donne environ un demi-pion aux Noirs. Plan : …e6, …Fd6 ou …Fg7, …b5–b4 à l’aile dame.}
`,
  traps: [
    {
      title: 'La tour en b1 est une cible',
      fen: 'r1b1kb1r/pp2pppp/1qn2n2/2pp4/3P1B2/2P1P3/PP1N1PPP/1R1QKBNR b Kkq - 4 6',
      prompt:
        'Londres : 5…Db6 6.Tb1 ?. La tour défend b2. Comment les Noirs gagnent-ils quand même un pion ?',
      solution: ['c5d4', 'e3d4', 'c8f5'],
      explanation:
        '**6…cxd4 !** ouvre la diagonale du fou c8. Après **7.exd4 Ff5 !** (ou 7.cxd4 Ff5), le fou attaque la tour b1 : elle doit quitter la défense de b2 et la dame noire prend le pion (environ +1,4 selon Stockfish). Pour les Blancs, la bonne réponse à …Db6 est 6.Db3 : la dame défend b2 sans s’exposer. 6…Ff5 tout de suite est moins fort (7.dxc5 ou 7.Tc1).',
    },
    {
      title: 'Le pion e4 était cloué',
      fen: 'r3kb1r/pp2pp1p/1qn2np1/3p1b2/2pPPB2/2P2N2/PPQN1PPP/R3KB1R b KQkq - 0 9',
      prompt:
        'Après 6.Db3 c4 7.Dc2 g6 8.Cgf3 Ff5, les Blancs ont voulu chasser le fou avec 9.e4 ?. Que jouent les Noirs ?',
      solution: ['f6e4'],
      explanation:
        '**9…Cxe4 !** : le pion e4 semblait défendu par le cavalier d2 et la dame c2, mais si **10.Cxe4 Fxe4**, le fou attaque la dame c2 avec gain de temps, et les Noirs ont simplement un pion de plus (environ +1,2 selon Stockfish). 9…Fxe4 ? est nettement moins bon : après 10.Cxe4 Cxe4 11.Fxc4, les Blancs récupèrent leur pion et c’est l’égalité. Pour les Blancs : on ne pousse pas e4 tant que le fou f5 et le cavalier f6 le contrôlent.',
    },
    {
      title: 'Plus de case pour le fou f4',
      fen: 'r3kb1r/pp2pp1p/1qn3p1/3p1bBn/2pP4/2P1PN2/PP1N1PPP/R1Q1KB1R b KQkq - 5 10',
      prompt:
        'Le cavalier h5 a chassé le fou f4, qui est venu en g5. Comment les Noirs le traquent-ils jusqu’au bout ?',
      solution: ['f7f6', 'g5h4', 'g6g5', 'h4g3', 'h5g3'],
      acceptAlso: ['h7h6'],
      explanation:
        '**10…f6 !** (10…h6 revient au même) chasse le fou en h4, puis **11…g5** le chasse encore : il doit aller en g3, où **12…Cxg3** l’attend. Les Noirs gagnent la paire de fous et de l’espace (environ +0,5 selon Stockfish). Les pions f6/g5 avancés ne sont pas une faiblesse ici : les Blancs n’ont plus de fou de cases noires pour en profiter. Leçon pour ton Londres : quand …Ch5 arrive, recule en g3 (avec h3 joué, pour avoir h2), pas en g5.',
    },
    {
      title: 'Le coup intermédiaire qui se retourne',
      fen: 'rB1qkb1r/pp2pppp/2p2n2/3p4/3P4/2NbP3/PPP2PPP/R2QK1NR b KQkq - 0 6',
      prompt:
        'Jobava : 3…c6 4.e3 Ff5 5.Fd3 Fxd3 et, au lieu de reprendre, les Blancs ont joué le coup intermédiaire 6.Fxb8 ?. Que jouent les Noirs ?',
      solution: ['d3c2', 'd1c2', 'a8b8'],
      explanation:
        '**6…Fxc2 !** : le fou d3, en prise, s’échappe en prenant un pion avec attaque sur la dame. Après **7.Dxc2 Txb8**, chacun a pris un fou et un cavalier… mais les Noirs ont gagné le pion c2 en route (environ +1,6 selon Stockfish). (7…Dxb8 est aussi bon.) 6…Txb8 ? 7.cxd3 rendrait simplement l’égalité matérielle. Avant de jouer un coup intermédiaire, vérifie que la pièce adverse en prise n’a pas elle aussi un coup intermédiaire.',
    },
    {
      title: 'Le fou sorti trop tôt',
      fen: 'r3kb1r/pp2pppp/1qn2n2/3p1b2/2pP1B2/2P1P3/PPQN1PPP/R3KBNR w KQkq - 2 8',
      prompt:
        'Ton Londres avec les Blancs : 5.Cd2 Db6 6.Db3 c4 7.Dc2 et les Noirs ont joué 7…Ff5 ?? pour chasser ta dame. Que joues-tu ?',
      solution: ['c2f5'],
      explanation:
        '**8.Dxf5 !** : la diagonale c2–d3–e4–f5 est vide et rien ne protège le fou. La riposte 8…Dxb2 ne suffit pas : les Blancs gardent une pièce de plus (environ +1,8 selon Stockfish). C’est pour ça qu’avec les Noirs on joue **7…g6 !** d’abord, puis …Ff5 protégé par le pion. Attention, avec le cavalier en f3 au lieu de d2 (5.Cf3), 7…Ff5 est bon : 8.Dxf5 ? Dxb2 attaque à la fois la tour a1 et le cavalier b1.',
    },
  ],
};

export default antiLondon;
