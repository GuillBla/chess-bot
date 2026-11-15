import type { Opening } from './types';

// Répertoire Caro-Kann (Noirs contre 1.e4). Coups de répertoire et pièges contrôlés avec Stockfish (profondeur 16–18).
const caroKann: Opening = {
  id: 'caro-kann',
  name: 'Défense Caro-Kann',
  side: 'black',
  family: 'repertoire',
  against: 'contre 1.e4',
  eco: 'B10–B19',
  summary:
    '1.e4 c6 2.d4 d5 : les Noirs contestent tout de suite le centre avec un pion d5 solidement soutenu par c6, puis sortent leur fou de cases blanches (…Ff5 ou …Fg4) AVANT de jouer …e6. Une défense solide, logique et peu théorique à ton niveau.',
  why:
    'C’est le Londres vu de l’autre côté : on construit une structure solide (c6–d5–e6) et on sort le « mauvais » fou avant de fermer la chaîne. Le même schéma revient contre 1.d4 (Slave) : un seul système de pensée avec les Noirs. Les Blancs ont peu de pièges vraiment dangereux, les plans sont clairs (…c5 contre la chaîne d’avance, développement tranquille puis …c5 ou …e5 ailleurs), et les finales sont souvent agréables pour les Noirs.',
  keyIdeas: [
    'Le fou c8 sort en f5 (ou g4) AVANT …e6 : sinon il resterait enfermé derrière ses propres pions, comme le fou c1 du Londres avant e3.',
    'Contre la variante d’avance (3.e5), on attaque la chaîne de pions à sa base avec …c5, puis on met la pression sur d4 avec …Cc6, …Db6 et …Cge7–f5.',
    'Quand le fou est en g6 et que les Blancs avancent h4–h5, il faut une case de retraite : …h6 (ou …h5) AVANT qu’il soit pris au piège.',
    'Dans la Classique (3.Cc3 dxe4 4.Cxe4 Ff5), on joue solide : …Cd7, …e6, …Cgf6, …Fe7, puis on libère le jeu par …c5 ou …e5.',
    'Contre l’Échange et le Panov, le pion d5 isolé (ou celui des Blancs) décide du plan : on bloque la case devant le pion isolé et on échange les pièces.',
    'Contre la dame en b3 qui vise b7, on défend avec …Dd7, …Dc8 ou …Ca5 — jamais …e6 qui laisse prendre b7 avec tempo.',
    'Ne sors pas tes cavaliers « au hasard » : dans la Classique, 4…Cd7 5.De2 Cgf6?? permet 6.Cd6 mat.',
  ],
  sections: [
    {
      type: 'text',
      title: 'L’idée de la Caro-Kann : d5 d’abord, le fou ensuite',
      paragraphs: [
        'Après 1.e4 c6 2.d4 d5, les Noirs attaquent le pion e4 avec un pion d5 **soutenu par c6** : si les Blancs échangent (exd5), on reprend avec le pion c6 et on garde un pion au centre. C’est la grande différence avec la Française (1…e6 2.d4 d5), où le pion e6 enferme tout de suite le fou c8.',
        'Ici, la case e6 reste libre le temps de sortir ce fou : **…Ff5** (ou **…Fg4** quand un cavalier est en f3). Une fois le fou dehors, on joue …e6 et on obtient une chaîne c6–d5–e6 très solide, avec toutes les pièces actives. C’est exactement le principe du **Londres** que tu joues avec les Blancs : sortir le fou en f4 avant de jouer e3.',
        'Le prix à payer : le fou sorti tôt peut devenir une cible. Les Blancs essaient de le chasser avec Cg3, h4–h5 ou g4. Retiens trois réflexes : **…h6/…h5 contre h4**, **…Fg6 contre Cg3 ou g4**, et **échanger le fou contre Fd3** (…Fxd3) plutôt que de le laisser se faire coincer.',
      ],
    },
    {
      type: 'position',
      title: 'Variante d’avance : attaquer la chaîne à sa base',
      fen: 'rn1qkbnr/pp3ppp/4p3/2ppPb2/3P4/5N2/PPP1BPPP/RNBQK2R w KQkq - 0 6',
      orientation: 'black',
      caption:
        'Après 3.e5 Ff5 4.Cf3 e6 5.Fe2 c5 : le fou f5 est DEHORS, devant la chaîne e6–d5. Les Blancs ont une chaîne d4–e5 qui leur donne de l’espace. On l’attaque à sa base, le pion d4, avec …c5. Ensuite viendront …Cc6, …Db6 et …Cge7–f5 : quatre pièces contre d4, que les Blancs ont du mal à défendre.',
      arrows: [
        { from: 'c5', to: 'd4', kind: 'good' },
        { from: 'b8', to: 'c6', kind: 'idea' },
        { from: 'd8', to: 'b6', kind: 'idea' },
      ],
      marks: [{ square: 'd4', kind: 'target' }],
      moves: [
        { uci: 'e1g1', comment: '6.O-O : les Blancs mettent leur roi à l’abri et attendent.' },
        { uci: 'b8c6', comment: '6…Cc6 : deuxième attaquant de d4 (avec le pion c5).' },
        { uci: 'c2c3', comment: '7.c3 : les Blancs soutiennent d4 avec un pion.' },
        { uci: 'c5d4', comment: '7…cxd4 : on échange pour ouvrir la colonne c ; après 8.cxd4 le pion d4 n’a plus de pion pour le soutenir.' },
        { uci: 'c3d4', comment: '8.cxd4 : d4 est maintenant un pion que seules des pièces peuvent défendre.' },
        { uci: 'g8e7', comment: '8…Cge7 : le cavalier va en f5, d’où il attaque d4 une troisième fois. Ensuite …Fg4 (pour échanger le défenseur f3) ou …Db6.' },
      ],
    },
    {
      type: 'position',
      title: 'Le piège h4–h5 : le fou g6 doit avoir une case',
      fen: 'rn1qkbnr/pp2pppp/2p3b1/8/3P3P/6N1/PPP2PP1/R1BQKBNR b KQkq - 0 6',
      orientation: 'black',
      caption:
        'Classique après 5.Cg3 Fg6 6.h4 : les Blancs menacent 7.h5, qui chasse le fou. Or ses cases de retraite sont toutes mauvaises : h7 est occupé par notre propre pion, f5 est attaqué par le cavalier g3. Il faut réagir TOUT DE SUITE.',
      arrows: [{ from: 'h4', to: 'h5', kind: 'threat' }],
      marks: [{ square: 'g6', kind: 'hanging' }],
      moves: [
        { uci: 'b8d7', comment: '6…Cd7? Un coup de développement « normal »… mais il ignore la menace.' },
        { uci: 'h4h5', comment: '7.h5! Le fou g6 est attaqué et n’a pas de bonne case : h7 est bouché par notre pion.' },
        { uci: 'g6f5', comment: '7…Ff5 : la seule retraite, mais le cavalier g3 l’attend.' },
        { uci: 'g3f5', comment: '8.Cxf5 : les Blancs gagnent la paire de fous et ont une grosse avance de développement (+1,3 pour Stockfish). Le bon coup était 6…h6!, qui prépare la retraite 7.h5 Fh7.' },
      ],
    },
    {
      type: 'position',
      title: 'Le mat le plus célèbre de la Caro-Kann : 6.Cd6#',
      fen: 'rnbqkbnr/pp2pppp/2p5/8/3PN3/8/PPP2PPP/R1BQKBNR b KQkq - 0 4',
      orientation: 'black',
      caption:
        'Classique après 3.Cc3 dxe4 4.Cxe4. Notre répertoire joue 4…Ff5, mais la variante 4…Cd7 est très jouée, et elle cache un piège mortel : il ne faut pas bloquer le pion e7 quand la dame blanche est sur la colonne e.',
      marks: [{ square: 'd6', kind: 'weak' }],
      moves: [
        { uci: 'b8d7', comment: '4…Cd7 : coup jouable (variante Karpov), qui prépare …Cgf6.' },
        { uci: 'd1e2', comment: '5.De2 : un piège ! La dame se place en face du pion e7.' },
        { uci: 'g8f6', comment: '5…Cgf6?? : le coup « naturel »… et la faute fatale.' },
        { uci: 'e4d6', comment: '6.Cd6# : mat ! Le pion e7 est cloué par la dame e2 et ne peut pas prendre le cavalier ; le roi n’a aucune case (d7 et f7… le cavalier contrôle f7, le Cd7 bloque d7). Après 5.De2, il fallait jouer 5…Cdf6 ou 5…Dc7.' },
      ],
    },
    {
      type: 'position',
      title: 'Classique : le plan après les échanges',
      fen: 'r2qkbnr/pp1n1pp1/2p1p2p/7P/3P4/3Q1NN1/PPP2PP1/R1B1K2R w KQkq - 0 11',
      orientation: 'black',
      caption:
        'Après 5.Cg3 Fg6 6.h4 h6 7.Cf3 Cd7 8.h5 Fh7 9.Fd3 Fxd3 10.Dxd3 e6 : le fou c8 a été échangé (pas de mauvais fou !), la chaîne c6–e6 est solide et le pion h5 blanc pourra même devenir une faiblesse en finale. Les Noirs finissent leur développement (…Cgf6, …Fe7 ou …Dc7, roque) puis libèrent le jeu avec …c5 pour attaquer d4.',
      arrows: [
        { from: 'c6', to: 'c5', kind: 'idea' },
        { from: 'g8', to: 'f6', kind: 'good' },
      ],
      marks: [
        { square: 'h5', kind: 'target' },
        { square: 'd4', kind: 'target' },
      ],
      moves: [
        { uci: 'c1d2', comment: '11.Fd2 : les Blancs préparent le grand roque.' },
        { uci: 'g8f6', comment: '11…Cgf6 : le cavalier défend le roi et surveille e4 et d5.' },
        { uci: 'e1c1', comment: '12.O-O-O : les rois vont se retrouver de côtés opposés.' },
        { uci: 'f8e7', comment: '12…Fe7 : on prépare le petit roque. Plan : …O-O, …Dc7 et …c5 ; on reste solide, sans pion faible.' },
      ],
    },
    {
      type: 'text',
      title: 'Un plan par variante',
      paragraphs: [
        '**Variante d’avance (3.e5)** : 3…Ff5, …e6, puis **…c5** contre la base de la chaîne. Les pièces suivent : …Cc6, …Cge7–f5, …Db6, toutes contre d4. Attention à ne pas jouer …Db6 trop tôt quand les Blancs peuvent répondre dxc5 suivi de b4 (le pion c5 tombe ou les Blancs gagnent de l’espace avec tempo).',
        '**Classique (3.Cc3 ou 3.Cd2 dxe4 4.Cxe4)** : 4…Ff5, et quand le fou est chassé (5.Cg3 Fg6), on prévoit sa retraite contre h4 avec …h6. Développement calme (…Cd7, …e6, …Cgf6, …Fe7), puis …c5 ou …e5 pour libérer le jeu. Si les Blancs jouent Fd3, on échange : …Fxd3.',
        '**Échange (3.exd5 cxd5)** : structure symétrique. On joue …Cc6, …Cf6, **…Fg4** (le fou sort encore avant …e6 !) puis …e6, …Fd6, roque. Si la dame va en b3 contre b7, on défend b7 avec la dame (…Dd7 ou …Dc8).',
        '**Panov (3.exd5 cxd5 4.c4)** : les Blancs auront souvent un **pion isolé en d4**. Plan noir : bloquer la case d5 avec un cavalier, échanger des pièces (moins il y a de pièces, plus le pion isolé est faible), et viser d4.',
        '**Systèmes sans 2.d4** (2.Cc3, 2.Cf3, 2.d3, 2.c4) : on joue quand même …d5, puis …Fg4 contre Cf3 ou …e5 contre les systèmes lents : le centre est à nous.',
      ],
    },
    {
      type: 'position',
      title: 'Panov : bloquer le pion isolé',
      fen: 'r1bq1rk1/pp2bppp/2n1p3/3n4/3P4/2NB1N2/PP3PPP/R1BQR1K1 b - - 5 10',
      orientation: 'black',
      caption:
        'Panov après 4.c4 Cf6 5.Cc3 e6 6.Cf3 Fe7 7.cxd5 Cxd5 8.Fd3 Cc6 9.O-O O-O 10.Te1 : le pion d4 blanc est isolé (plus de pion en c ou en e pour le soutenir). Le cavalier d5 est parfaitement placé : il bloque le pion, et aucun pion blanc ne peut le chasser. Les Noirs visent d4 avec …Ff6, …Cc6 et échangent les pièces : en finale, ce pion sera une faiblesse.',
      arrows: [
        { from: 'e7', to: 'f6', kind: 'good' },
        { from: 'c6', to: 'd4', kind: 'idea' },
      ],
      marks: [
        { square: 'd5', kind: 'strong' },
        { square: 'd4', kind: 'target' },
      ],
      moves: [
        { uci: 'e7f6', comment: '10…Ff6 : le fou vise d4 sur la grande diagonale ; d4 est attaqué deux fois (Ff6, Cc6).' },
      ],
    },
  ],
  pgn: `
1.e4 {Les Blancs occupent le centre et ouvrent les diagonales de leur dame et de leur fou f1.}
1...c6 {Prépare 2…d5 : si les Blancs prennent un jour exd5, on reprendra avec le pion c6 et on gardera un pion au centre. La case e6 reste libre pour l’instant : le fou c8 pourra sortir. [%cal Gc6d5,Bc8f5]}
2.d4 {La suite principale : les Blancs prennent tout le centre avec deux pions (e4 et d4). On attaque e4 tout de suite.} (2.Nc3 {[%name Deux cavaliers] Les Blancs développent d’abord leurs cavaliers et gardent la possibilité de jouer d4 plus tard.}
  2...d5 {On joue quand même …d5 : le pion e4 est attaqué deux fois (…d5, et bientôt …Cf6), il faut le défendre ou l’échanger.}
  3.Nf3 {Défend indirectement e4 et prépare un jeu sans d4 ; si 3.d4, c’est la Classique (3…dxe4 4.Cxe4 Ff5).}
  3...Bg4 {Le fou sort AVANT …e6 et cloue le cavalier f3 contre la dame : le cavalier qui défend e5 et d4 devient gênant pour les Blancs. [%cal Gc8g4]}
  4.h3 {Demande au fou de se décider.}
  4...Bxf3 {On donne la paire de fous, mais on gagne du temps pour jouer …e6, …Cf6 et contester e4 ; la dame blanche, en f3, sera une cible.}
  (4...Bh5?! {Plus risqué : après 5.exd5 cxd5 6.Fb5+ Cc6 7.g4 Fg6 8.Ce5, les Blancs attaquent c6 et le fou g6 avec gain de temps ; les Noirs doivent trouver des coups précis (8…Tc8 9.d4). À ton niveau, 4…Fxf3 est bien plus simple.}
   5.exd5 cxd5 {On reprend avec le pion, mais le fou h5 est loin de la défense.} 6.Bb5+ Nc6 {Seule interposition naturelle : le cavalier c6 est maintenant cloué.} 7.g4 Bg6 {Le fou est chassé : les pions blancs avancent avec tempo.} 8.Ne5 {Le cavalier attaque c6 deux fois et le fou g6 est menacé par Cxg6 : les Noirs souffrent.})
  5.Qxf3 e6 {La chaîne c6–d5–e6 est en place et le fou f8 est libéré. Les Blancs ne peuvent pas facilement garder e4 sans d3 ou d4. [%cal Gf8b4]}
  6.d4 {Prend le centre ; d4 n’est défendu que par la dame d1… qui n’y est plus : il l’est par la dame f3? Non, seulement par les pièces qui le surveillent, d’où …Db6 ou …dxe4 plus tard.}
  (6.d3 {Le plan lent : les Blancs gardent e4 avec un pion et préparent Fe2, O-O, puis g3 ou Dg3.}
   6...Nf6 {Attaque e4 une troisième fois et développe vers le roque ; …Fb4 ou …Fd6 suivront.}
   7.Be2 Bd6 {Le fou vise h2 et g3 et prépare le petit roque. Plan : …O-O, …Cbd7, puis …e5 ou …d4 pour gagner de l’espace au centre. [%cal Gd6h2]})
  6...Nf6 {Attaque e4 : les Blancs doivent décider entre e5 (structure de Française) et Fd3.}
  7.Bd3 {Développe le fou et défend e4 une deuxième fois.} (7.e5 {Gagne de l’espace et chasse le cavalier, comme dans la variante d’avance.}
   7...Nfd7 {Le cavalier recule pour préparer …c5 : on attaque la chaîne d4–e5 à sa base, exactement comme dans l’Avance. [%cal Gc6c5,Gc5d4]}
   8.Bf4 c5 {Le plan habituel : …c5, …Cc6, …Db6 contre d4. Sans fou de cases blanches en face, les Blancs ont du mal à tenir d4.})
  7...dxe4 {On échange au centre pour ouvrir la position… et pour mettre la question à la dame f3.}
  8.Nxe4 Nxe4 {Échanger un couple de cavaliers soulage la position : moins de pièces, moins de risques pour la paire de fous blanche. [%cal Gf6e4]}
  9.Qxe4 Nd7 {Le cavalier va en f6 en chassant la dame. Plan : …Cf6, …Fe7, …O-O, puis …c5 ou …Da5+. Les Noirs sont solides, sans aucune faiblesse. [%cal Gd7f6]})
 (2.c4 {[%name Accélérée c4] Les Blancs jouent « à l’anglaise » : ils veulent prendre en d5 avec le pion c pour garder un pion de plus au centre.}
  2...d5 {Le contre logique : on attaque e4 et on profite de ce que c4 n’est pas soutenu.}
  3.exd5 cxd5 {On reprend avec le pion : on garde un pion central et la colonne c s’ouvre.} 4.cxd5 {Les Blancs ont un pion de plus pour l’instant, mais il est isolé en d5 et va tomber.}
  4...Nf6 {On ne reprend pas tout de suite avec la dame (elle serait chassée par Cc3) : le cavalier attaque d5 et regagnera le pion avec développement. [%cal Gf6d5]}
  5.Nc3 {Défend le pion d5 avec une pièce.} (5.Bb5+ {Les Blancs essaient de garder le pion d5.}
   5...Nbd7 {Interpose une pièce qui veut de toute façon aller vers b6 ou f6 ; …a6 et …b5 chasseront le fou.}
   6.Nc3 a6 {Chasse le fou ; ensuite …b5 et …Fb7, puis on reprend d5 tranquillement. Stockfish donne l’égalité. [%cal Ga7a6,Bb7b5]})
  5...Nxd5 {Le pion est récupéré : le cavalier centralisé contrôle c3, e3, b4 et f4.}
  6.Nf3 Nc6 {Développe en surveillant d4 et e5 : …e6, …Fe7 et …O-O vont suivre.}
  7.Bb5 e6 {Libère le fou f8 : la structure ressemble à un Panov (voir 3.exd5 cxd5 4.c4).}
  8.O-O Be7 {Prépare le roque ; le fou défend aussi la case f6.}
  9.d4 O-O {Même plan que dans le Panov : le pion d4 sera isolé, on le bloque avec le cavalier d5 et on échange des pièces. [%csl Gd5,Yd4]})
 (2.d3 {[%name Est-indienne inversée] Les Blancs préparent un fianchetto (g3, Fg2) et un jeu lent, sans contester le centre tout de suite.}
  2...d5 {On prend le centre puisque les Blancs le laissent.}
  3.Nd2 e5 {Avec un coup lent comme 2.d3, on a le temps de mettre DEUX pions au centre : d5 et e5 contrôlent c4, d4, e4 et f4. [%cal Ge5d4,Gd5e4]}
  4.Ngf3 Bd6 {Le fou défend e5 sans gêner le cavalier g8 et prépare le petit roque.}
  5.g3 Nf6 {Développe vers le roque et attaque e4 une deuxième fois.}
  6.Bg2 O-O {Le roi est en sécurité ; la tour pourra venir en e8 pour soutenir e5.}
  7.O-O Re8 {La tour soutient e5. Plan : …Cbd7, …a5 et …Fc7 ; si les Blancs jouent un jour exd5 cxd5, nos deux pions centraux sont superbes. [%cal Ge8e5]})
 (2.Nf3 {[%name 2.Cf3] Les Blancs développent en gardant le choix entre d4, Cc3 ou e5.}
  2...d5 {Toujours le même coup : on conteste e4.}
  3.Nc3 {On est dans la variante des deux cavaliers.}
  (3.e5 {Les Blancs avancent : la structure de la variante d’avance.}
   3...Bf5 {Le fou sort avant …e6, comme dans la variante d’avance. [%cal Gc8f5]}
   4.d4 e6 {On retombe exactement sur la variante d’avance (3.e5 Ff5 4.Cf3 e6) : plan …c5, …Cc6, …Db6.})
  (3.exd5 {Les Blancs échangent tout de suite pour simplifier.}
   3...cxd5 {On reprend avec le pion pour garder un pion central.}
   4.d4 Nc6 {Structure d’Échange : …Cf6, …Fg4 (fou sorti avant …e6), puis …e6, …Fd6 et roque.}
   5.c3 Nf6 {Le cavalier surveille e4 et défend d5 ; la diagonale c8–g4 reste ouverte.}
   6.Bd3 Bg4 {Le fou sort avant …e6 et cloue le cavalier f3 qui surveille e5. On jouera ensuite …e6, …Fd6 et …O-O, comme dans l’Échange. [%cal Gc8g4]})
  3...Bg4 {Comme contre 2.Cc3 : le fou cloue le cavalier f3. On continuera par …Fxf3 et …e6 si les Blancs jouent h3. [%cal Gc8g4]})
 (2.Bc4 {[%name 2.Fc4] Fréquent à ton niveau : le fou vise f7… mais il va se heurter au pion d5.}
  2...d5 {Le fou c4 est attaqué tout de suite : on gagne du temps sur lui.}
  3.exd5 {Les Blancs échangent pour éviter de perdre du temps.} (3.Bb3 {Le fou recule sans échanger.}
   3...dxe4 {On prend un pion : e4 n’est plus défendu.}
   4.Qh5 {Les Blancs visent f7 avec la dame et le fou b3.}
   4...e6 {Ferme la diagonale du fou b3 : f7 est maintenant bien défendu. Les Noirs ont un pion de plus. [%cal Re6f7]}
   5.Nc3 Nf6 {Développe en chassant la dame. Plan : …Cbd7, …Fe7, roque ; garder le pion e4 aussi longtemps que possible.})
  3...cxd5 {Encore un pion central en plus, et le fou c4 est attaqué.}
  4.Bb5+ Bd7 {On interpose le fou et on propose l’échange : les Blancs perdent du temps avec leur fou. [%cal Gd7b5]}
  5.Bxd7+ Qxd7 {La dame reprend en restant active. Plan : …Cc6, …e6, …Fd6 et roque ; avec le pion d5 seul au centre, les Noirs sont déjà un peu mieux selon Stockfish.}
  6.d4 e6 {Libère le fou f8 qui ira en d6. Ensuite …Cc6, …Cge7 ou …Cf6 et roque.})
2...d5 {Le cœur de la Caro-Kann : d5 attaque e4, soutenu par c6. Les Blancs doivent choisir : avancer (3.e5), défendre (3.Cc3/Cd2), échanger (3.exd5) ou soutenir avec f3. [%cal Gd5e4,Gc6d5]}
3.e5 {[%name Variante d’avance] Les Blancs gagnent de l’espace et enlèvent la case f6 au cavalier g8. La chaîne d4–e5 est solide, mais sa base, d4, sera notre cible.}
(3.Nc3 {[%name Classique] Défend e4 avec un cavalier.}
 3...dxe4 {On échange en e4 : le cavalier blanc va reprendre, mais on gagne du temps pour sortir le fou en f5 en attaquant ce cavalier.}
 4.Nxe4 Bf5 {Le fou sort AVANT …e6, avec gain de temps sur le cavalier e4. C’est la Caro-Kann classique. [%cal Gc8f5,Yf5e4]}
 (4...Nd7 {Jouable (variante Karpov), mais attention au piège : après 5.De2, surtout pas 5…Cgf6?? 6.Cd6 mat. Notre répertoire joue 4…Ff5.}
  5.Qe2 {Le piège : la dame se met sur la colonne e, face au pion e7.}
  5...Ngf6?? {Le coup de développement « naturel »… mais il bloque la case de fuite et laisse le cavalier sauter en d6. Il fallait jouer 5…Cdf6 ou 5…Dc7.}
  6.Nd6# {Mat : le pion e7 est cloué par la dame e2 et ne peut pas prendre le cavalier, et le roi n’a plus de case. [%csl Rd6,Re7]})
 5.Ng3 {Attaque le fou une deuxième fois ; c’est la suite principale.}
 (5.Bd3?! {Une erreur fréquente : le fou d3 défend le cavalier, mais d4 n’est plus défendu que par la dame… et la nôtre peut le prendre.}
  5...Qxd4 {On prend le pion central. Le cavalier e4 est attaqué par la dame et par le fou f5. [%cal Gd8d4,Yd4e4]}
  6.Nf3 Qd8 {La dame rentre à la maison : un pion de plus, et le cavalier e4 reste une cible pour …Fxe4. Ensuite …e6, …Cf6 et roque.})
 (5.Nc5 {Le cavalier attaque b7 et gêne le développement des Noirs.}
  5...b6 {Chasse le cavalier tout de suite ; la case c6 reste solide grâce au pion. [%cal Gb7b6]}
  6.Nb3 e6 {Le fou f5 est dehors : on peut fermer la chaîne. Plan : …Cf6, …Fd6 ou …Fe7, roque, puis …c5.}
  7.Nf3 Nf6 {Développe le cavalier vers le roque et surveille e4 et d5. Plan : …Fe7, …O-O, …c5 pour attaquer d4.})
 (5.Qf3 {La dame défend le cavalier e4 et vise b7 et f7.}
  5...e6 {Ferme la diagonale vers f7 et libère le fou f8 ; le fou f5 cloue maintenant le cavalier e4 contre la dame f3 ! [%cal Gf5e4]}
  6.Ne2 Bxe4 {On échange en profitant du clouage : la dame blanche, en e4, devra encore bouger quand on jouera …Cf6. Plan : …Cf6, …Cbd7, …Fe7, roque.})
 5...Bg6 {Le fou recule sur la diagonale h7–b1 où il reste actif. Il surveille e4 et c2. [%csl Gg6]}
 6.h4 {La menace : 7.h5, et le fou g6 n’aurait plus de bonne case (h7 est occupé par notre pion).}
 (6.Nf3 {Développement simple, sans h4.}
  6...Nd7 {Le cavalier contrôle e5 (où Ce5 pourrait attaquer le fou g6) et prépare …Cgf6 sans risquer de doubler les pions.}
  7.Bd3 {Les Blancs proposent l’échange des fous.}
  (7.h4 {Menace 8.h5 contre le fou g6.} h6 {Toujours la même réponse à h4 : on prépare la retraite …Fh7.} 8.h5 Bh7 {On rejoint la ligne principale (6.h4 h6 7.Cf3 Cd7 8.h5 Fh7).})
  7...e6 {On laisse les Blancs échanger en g6 si ils veulent : après Fxg6 hxg6, la colonne h s’ouvre pour notre tour.}
  8.O-O Ngf6 {Le second cavalier défend le roc et surveille e4 et d5.}
  9.Re1 Be7 {Le fou prépare le roque. Plan : …O-O, …Dc7, puis …c5 ou …e5 pour libérer le jeu.}
  10.c4 O-O {Le roi est à l’abri ; les Noirs ont une position compacte, sans faiblesse, et attendent le bon moment pour …c5.})
 (6.Bd3? {Erreur courante : comme en 5.Fd3, le pion d4 n’est plus défendu.}
  6...Qxd4 {On prend le pion central gratuitement ; si 7.Fxg6, 7…Dxd1+ 8.Rxd1 hxg6 et la colonne h s’ouvre pour notre tour. [%cal Gd8d4]}
  7.N1e2 {Le cavalier défend c3 et ira en f4.} (7.Bxg6 {Les Blancs échangent les fous en espérant gagner du temps.}
   7...Qxd1+ {Obligatoire : il faut échanger les dames avant de reprendre en g6, sinon 8.Fxf7+ ou 8.Fd3 et la dame d4 est en danger.}
   8.Kxd1 hxg6 {Un pion de plus et la colonne h à moitié ouverte pour la tour h8 : une finale très agréable pour les Noirs.})
  7...Qd8 {La dame se met à l’abri. Les Noirs ont un pion de plus ; ils continuent par …e6, …Cf6, …Cbd7 et roque.}
  8.Nf4 e6 {Ferme la diagonale a2–g8, protège f7 et libère le fou f8. Plan : …Cf6, …Cbd7, …Fe7, roque.})
 (6.Bc4 {Le fou vise e6 et f7.}
  6...e6 {Ferme la diagonale du fou c4 vers f7. Le fou g6 est déjà dehors, donc …e6 ne bloque rien. [%cal Re6f7]}
  7.N1e2 {Le cavalier ira en f4 pour attaquer le fou g6.} (7.Nf3 {Développement classique.}
   7...Nd7 {Contrôle e5 pour empêcher Ce5 contre le fou g6, et prépare …Cgf6.}
   8.O-O Ngf6 {Développe en défendant le roi. Plan : …Fe7, …O-O, …Cd5 pour bloquer le fou c4, puis …c5.}
   9.Re1 Be7 {Le roque suit ; la position noire est solide et sans faiblesse.})
  7...Nf6 {Développe vers le roque et surveille d5 et e4.}
  8.Nf4 Bd6 {Le fou attaque le cavalier f4 et prépare le roque. Si 9.Cxg6 hxg6 : la colonne h s’ouvre pour notre tour. Plan : …O-O, …Cbd7, …c5 ou …e5.})
 6...h6 {Prépare la retraite : si 7.h5, le fou ira en h7, où il restera sur la belle diagonale b1–h7. [%cal Gg6h7,Rh4h5]}
 (6...Nd7? {Développe, mais oublie la menace : 7.h5! et le fou g6 n’a plus de bonne case.}
  7.h5 Bf5 {La seule retraite, mais le cavalier g3 la contrôle.}
  8.Nxf5 {Les Blancs ont gagné la paire de fous et une grosse avance de développement (+1,3 pour Stockfish). Morale : contre h4, joue …h6 tout de suite.})
 7.Nf3 {Développe en contrôlant e5 ; h5 viendra au prochain coup.}
 (7.h5 {Les Blancs poussent tout de suite le pion h.} Bh7 {Le fou se réfugie en h7 : la case existe grâce à 6…h6.} 8.Nf3 Nd7 {On rejoint la ligne principale.})
 7...Nd7 {Empêche Ce5 qui attaquerait le fou g6, et prépare …Cgf6. [%cal Gd7e5]}
 8.h5 Bh7 {Le fou est à l’abri en h7 et vise toujours c2 et b1. [%csl Gh7]}
 9.Bd3 Bxd3 {On échange notre fou contre celui des Blancs : le « mauvais fou » de la Caro-Kann a disparu, mission accomplie.}
 10.Qxd3 e6 {La chaîne c6–e6 est en place, le fou f8 est libre. Le pion h5 blanc, avancé, pourra devenir une cible en finale. [%csl Yh5]}
 11.Bd2 Ngf6 {Le cavalier défend le roi et surveille e4 et d5.}
 12.O-O-O Be7 {On prépare le petit roque. Plan : …O-O, …Dc7 ou …Da5, et la rupture …c5 contre d4 pour activer les pièces. [%cal Bc6c5,Gc5d4]})
(3.Nd2 {[%name Classique (3.Cd2)] Comme 3.Cc3, mais le pion c2 reste libre d’aller en c3.}
 3...dxe4 {Même réponse qu’à 3.Cc3 : on échange et on sort le fou avec gain de temps.}
 4.Nxe4 Bf5 {Même position qu’après 3.Cc3 dxe4 4.Cxe4 Ff5 : suis le même plan (5.Cg3 Fg6 6.h4 h6). [%cal Gc8f5]})
(3.exd5 {[%name Échange] Les Blancs simplifient : la structure devient symétrique.}
 3...cxd5 {On reprend avec le pion : chaque camp a un pion en d4/d5, et la colonne c s’ouvre pour nos tours.}
 4.Bd3 {Le fou empêche …Ff5 ; c’est l’Échange « classique ».}
 (4.c4 {[%name Panov] Les Blancs attaquent d5 et acceptent d’avoir un pion isolé en d4.}
  4...Nf6 {Défend d5 et développe ; on ne prend pas en c4 tout de suite.}
  5.Nc3 e6 {Défend d5 une troisième fois et libère le fou f8. On évite 5…Cc6 6.Cf3 Fg4 7.cxd5 Cxd5 8.Db3, une ligne très tactique. [%cal Ge6d5]}
  6.Nf3 {Développe et surveille e5 ; le choix entre cxd5 et Fd3 viendra au prochain coup.}
  (6.c5?! {Inexact : les Blancs ferment le jeu à l’aile dame et lâchent la pression sur d5 ; les Noirs égalisent sans peine.}
   6...b6 {On attaque la pointe de la chaîne b2–c5 : …bxc5 ouvrira la colonne b, ou le pion d4 deviendra faible. [%cal Gb6c5]}
   7.b4 Be7 {Le fou prépare le roque. Plan : …O-O, …a5 pour attaquer b4, puis …bxc5. La position est équilibrée et les Blancs n’ont plus de pression sur d5.})
  6...Be7 {Prépare le roque ; le fou défend aussi la case f6.}
  7.cxd5 {Les Blancs échangent en d5 : leur pion d4 devient isolé.} (7.Bd3 {Les Blancs gardent la tension.}
   7...dxc4 {On prend en c4 pour faire perdre un temps au fou, et on laisse aux Blancs un pion isolé en d4.}
   8.Bxc4 O-O {Le roi est en sécurité. Plan : …Cc6, …b6 et …Fb7, et un cavalier en d5 pour bloquer le pion isolé. [%csl Gd5,Yd4]}
   9.O-O Nc6 {Attaque d4 et prépare …b6, …Fb7. Avec les échanges, le pion d4 deviendra une faiblesse.})
  7...Nxd5 {Le cavalier reprend en d5, la case devant le pion isolé : il bloque et aucun pion blanc ne peut le chasser. [%csl Gd5]}
  8.Bd3 Nc6 {Attaque d4 et vise b4 et e5.}
  9.O-O O-O {Le roi est à l’abri ; les Noirs vont viser d4 avec …Ff6.}
  10.Re1 Bf6 {Le fou attaque d4 sur la grande diagonale. Plan : échanger les pièces, garder le cavalier en d5 et attaquer le pion isolé. [%cal Gf6d4,Gc6d4]})
 (4.Bf4 {Le « Londres » contre la Caro-Kann : les Blancs sortent leur fou avant e3.}
  4...Nc6 {Attaque d4 et surveille e5 ; le fou c8 reste libre de sortir.}
  5.c3 Nf6 {Développe et prépare …Fg4 ou …Ff5.}
  6.Nf3 Bg4 {Le fou sort avant …e6 et cloue le cavalier f3. [%cal Gc8g4]}
  7.Nbd2 e6 {Ferme la chaîne une fois le fou dehors : c’est l’idée de la Caro-Kann.}
  8.Qb3 {Attaque b7.}
  8...Qc8 {Défend b7 sans enfermer la dame ; ensuite …Fe7 ou …Fd6, roque, et l’attaque de minorité …b5–b4.}
  (8...Qd7? {Semble naturel, mais 9.Ce5! attaque la dame et le fou g4 en même temps : les Noirs perdent beaucoup de terrain (+2 pour Stockfish).}
   9.Ne5 {Fourchette : la dame d7 est attaquée et le fou g4 aussi.}))
 4...Nc6 {Développe en surveillant d4 et e5, et laisse la diagonale du fou c8 ouverte.}
 5.c3 Nf6 {Développe et défend d5 ; …Fg4 suivra.}
 6.Bf4 {Le fou sort avant e3, comme dans le Londres.}
 (6.Nf3 {Développement plus calme.}
  6...Bg4 {Le fou cloue le cavalier f3 avant …e6. [%cal Gc8g4]}
  7.h3 Bh5 {On garde le clouage. Ensuite …e6, …Fd6 et roque.}
  8.Bf4 e6 {Ferme la chaîne derrière le fou sorti : structure idéale.}
  9.O-O Bd6 {Propose l’échange du bon fou blanc f4. Plan : …O-O, …Tc8, puis l’attaque de minorité …b5–b4 contre c3.})
 6...Bg4 {Le fou sort avant …e6 et vise la dame d1 à travers le cavalier ; il gêne le développement Cf3. [%cal Gc8g4]}
 7.Qb3 {L’idée blanche : attaquer b7, qui n’est plus défendu depuis le départ du fou c8.}
 (7.Nf3 {Développement simple.}
  7...e6 {Ferme la chaîne une fois le fou dehors.}
  8.Nbd2 Bd6 {Propose l’échange du fou f4, le meilleur fou blanc.}
  9.Bxd6 Qxd6 {La dame reprend et contrôle e5 et b4.}
  10.O-O O-O {Le roi est à l’abri. Plan : …Tab8 et …b5–b4 (attaque de minorité) pour créer une faiblesse en c3. [%cal Bb7b5,Bb5b4]})
 7...Qd7 {Défend b7 avec la dame. Si 8.h3, 8…Fh5 : le fou garde son clouage. [%csl Gb7]}
 (7...e6? {Oublie b7 : 8.Dxb7 gagne un pion et menace la tour a8 (+2 pour Stockfish).}
  8.Qxb7 {Le pion b7 tombe et la dame menace …Cb4? Non : elle menace déjà Dxc6+ et Dxa8.})
 8.Nd2 e6 {Ferme la chaîne une fois le fou dehors, et libère le fou f8.}
 9.Ngf3 Bxf3 {On échange le fou contre le cavalier qui contrôlait e5 : la case e4 et la case e5 deviennent plus faibles pour les Blancs.}
 10.Nxf3 Bd6 {Propose l’échange des fous de cases noires : sans son bon fou f4, la position blanche perd son dynamisme.}
 11.Bxd6 Qxd6 {La dame est bien placée en d6. Plan : …O-O, …Tab8 et …b5–b4 (attaque de minorité) contre le pion c3. [%cal Bb7b5,Bb5b4]}
 12.O-O O-O {Le roi est à l’abri. Les Noirs sont égaux et ont un plan clair : …Tab8, …b5, …b4.})
(3.f3 {[%name Fantaisie] Les Blancs soutiennent e4 avec un pion. C’est agressif, mais f3 enlève la meilleure case du cavalier g1 et affaiblit la diagonale e1–h4.}
 3...e6 {Solide : on renforce d5 et on libère le fou f8, qui va mettre la pression sur e4 par …Fb4. Ici, le fou c8 n’a pas de bonne case en f5 (e4 est soutenu, g4 est interdit). [%cal Gf8b4]}
 4.Nc3 {Défend e4 une deuxième fois.}
 (4.Be3 {Défend d4 et prépare Cd2, Dd2.}
  4...Qb6 {La dame vise b2 et d4 : les Blancs doivent prendre une décision désagréable. [%cal Gb6b2,Gb6d4]}
  5.Qc1 c5 {On attaque d4 une deuxième fois. Plan : …Cc6, …Cf6, et …cxd4 pour ouvrir le jeu. Stockfish préfère légèrement les Noirs.})
 4...Bb4 {Cloue le cavalier c3 : il ne défend plus vraiment e4. [%cal Gb4c3,Yd5e4]}
 5.Bd2 {Défait le clouage en défendant le cavalier c3.} (5.a3 {Les Blancs chassent le fou.}
  5...Bxc3+ {On abîme la structure blanche (pions doublés en c).}
  6.bxc3 dxe4 {On prend en e4 : si 7.fxe4, la diagonale e1–h4 s’ouvre.}
  7.fxe4 Qh4+ {Le roi blanc est en échec et va devoir bouger (8.Re2) : il ne pourra plus roquer, et 8.g3?? perd la tour h1 après 8…Dxe4+. [%cal Gd8h4,Yh4e1]}
  8.Ke2 Qxe4+ {On récupère le pion avec échec ; le roi blanc est perdu au centre. Les Noirs sont mieux (−0,6 pour Stockfish).})
 (5.e5 {Les Blancs bloquent le centre comme dans l’Avance.}
  5...c5 {Le plan de l’Avance : on attaque d4, la base de la chaîne. [%cal Gc5d4]}
  6.a3 Bxc3+ {On abîme la structure blanche avant de continuer …Cc6, …Cge7, …Db6 contre d4.}
  7.bxc3 Ne7 {Le cavalier ira en c6 ou f5 pour attaquer d4. Plan : …Cbc6, …Da5, …cxd4.})
 5...Ne7 {Le cavalier va en c6 ou f5, et laisse le pion f libre ; si les Blancs jouent e5, il ira en f5.}
 6.Bd3 c5 {On attaque d4 : avec …Cbc6 et …Db6, le centre blanc va céder. Plan : …Cbc6, …cxd4, roque. [%cal Gc5d4]})
3...Bf5 {Le fou sort AVANT …e6 : dehors, il est actif ; après …e6, il ne pourrait plus sortir. [%cal Gc8f5]}
4.Nf3 {Développement calme, la ligne la plus fréquente : les Blancs veulent Fe2 et O-O.}
(4.Nc3 {Prépare g4 pour chasser le fou.}
 4...e6 {Le fou est dehors, on ferme la chaîne. On ne craint pas g4 : le fou ira en g6.}
 5.g4 {Chasse le fou f5.}
 5...Bg6 {Le fou recule en g6 : il reste sur la diagonale b1–h7. [%csl Gg6]}
 (5...Be4? {Le fou va se faire échanger contre un cavalier, et notre pion e4 sera faible : 6.Cxe4 dxe4 7.Fg2 et e4 tombe (+1,4 pour Stockfish).}
  6.Nxe4 dxe4 {Le pion e4 est isolé et attaqué.}
  7.Bg2 {Le pion e4 va tomber.})
 6.Nge2 {Prépare Cf4 contre le fou g6, et h4–h5.}
 (6.h4 {Menace 7.h5 pour piéger le fou.}
  6...h5! {On bloque le pion h4 : le fou g6 garde la case h7 et le pion g4 est attaqué. Stockfish donne déjà l’avantage aux Noirs (−0,6). [%cal Gh7h5,Yh5g4]}
  7.g5 {Les Blancs ferment l’aile roi.}
  7...c5 {Le plan habituel contre la chaîne : attaquer d4. Les Noirs sont mieux (−1,0). [%cal Gc5d4]}
  8.Nge2 Nc6 {Deuxième attaquant de d4. Plan : …Cge7–f5, …Db6, …cxd4. Les pions blancs avancés ont laissé des cases faibles (f5, f4).})
 6...c5 {On attaque la chaîne à sa base : c’est le contre-jeu le plus rapide.}
 7.h4 {Menace h5 pour piéger le fou g6.}
 (7.Be3 {Le fou défend d4 contre …cxd4.}
  7...Nc6 {Deuxième attaquant de d4.}
  8.dxc5 h5 {On attaque la chaîne de pions g4–h... de l’autre côté : …hxg4 ouvrira la colonne h. Les Noirs récupèrent c5 plus tard avec …Cge7 et …Cxe5.})
 7...h6 {Prépare la retraite …Fh7 si 8.h5. Le fou reste dehors.}
 8.h5 Bh7 {Le fou est en sécurité en h7.}
 9.Be3 Nc6 {Attaque d4. Plan : …Db6, …cxd4, …Cge7. La chaîne blanche est attaquée de tous les côtés. [%cal Gc6d4,Bd8b6]})
(4.h4 {Les Blancs préparent g4 et h5 pour piéger le fou f5.}
 4...h5 {On bloque l’avance h4–h5 : le fou garde une case de retraite en h7 et g4 ne viendra pas facilement. [%cal Gh7h5]}
 (4...e6? {On oublie la menace : 5.g4! Fe4 6.f3 Fg6 7.h5 et le fou est piégé (+3 pour Stockfish).}
  5.g4 Be4 {Le fou fuit vers le centre, mais f3 va le chasser encore.} 6.f3 Bg6 {Le fou n’a déjà plus de bonne case (6…Fxc2 7.Dxc2 rend une pièce pour deux pions).} 7.h5 {Le fou g6 n’a plus de case : h7 est bouché par notre pion, f5 est attaqué par g4.})
 5.c4 {Les Blancs attaquent d5.}
 5...e6 {Défend d5 et ferme la chaîne derrière le fou f5.}
 6.Nc3 Be7 {Le fou vise le pion h4 et prépare …Fxh4 si les Blancs l’oublient. [%cal Ge7h4]}
 7.Nf3 Bg4 {On cloue le cavalier f3 qui défend d4. Plan : …Cd7, …Ch6–f5 pour attaquer d4, …dxc4 au bon moment.})
(4.Bd3 {Les Blancs proposent l’échange de leur meilleur fou.}
 4...Bxd3 {On accepte : notre « mauvais » fou s’échange contre leur bon fou.}
 5.Qxd3 e6 {Le fou est échangé, on ferme la chaîne et on libère le fou f8.}
 6.Nf3 c5 {On attaque d4 tout de suite.}
 7.O-O Nc6 {Deuxième attaquant de d4.}
 8.c3 cxd4 {On ouvre la colonne c. Après 9.cxd4, plan : …Cge7–f5, …Db6, …Fe7 et roque.})
4...e6 {Le fou est dehors, on ferme la chaîne derrière lui.}
5.Be2 c5 {La rupture typique contre la chaîne : on attaque la base, le pion d4. [%cal Gc5d4]}
6.O-O {Les Blancs roquent et laissent d4 se défendre plus tard avec c3.}
(6.Be3 {Le fou défend d4 et vise c5.}
 6...cxd4 {On échange pour ouvrir la colonne c : le cavalier qui reprend en d4 sera attaqué par nos pièces. [%cal Gc5d4]}
 7.Nxd4 Ne7 {Le cavalier ira en c6, où il attaquera e5 et d4.}
 8.O-O Nbc6 {Les deux cavaliers attaquent e5 et d4. Plan : …Cxd4, …Cg6 ou …Fe7, …O-O. Les Noirs sont à l’aise.})
6...Nc6 {Deuxième attaquant de d4.}
7.c3 {Soutient d4.}
7...cxd4 {On ouvre la colonne c pour nos tours et on enlève à d4 son soutien de pion.}
(7...Qb6?! {Trop tôt : 8.dxc5! Fxc5 9.b4 gagne de l’espace et chasse le fou avec tempo (+0,8 pour Stockfish).}
 8.dxc5 Bxc5 {On reprend, mais le fou c5 va servir de cible.} 9.b4 {Le fou c5 est chassé ; les Blancs gagnent de l’espace à l’aile dame.})
8.cxd4 Nge7 {Le cavalier va en f5 pour attaquer d4 une troisième fois. [%cal Ge7f5,Gf5d4]}
9.Nc3 Bg4 {Le fou menace …Fxf3 pour éliminer le défenseur de d4. Plan : …Cf5, …Fxf3, …Db6 : d4 est attaqué de partout.}
`,
  traps: [
    {
      title: 'Le fou chassé par g4',
      fen: 'rn1qkbnr/pp3ppp/2p1p3/3pPb2/3P2P1/2N5/PPP2P1P/R1BQKBNR b KQkq - 0 5',
      prompt: 'Variante d’avance : les Blancs jouent 5.g4 et chassent le fou f5. Où le replier ?',
      solution: ['f5g6'],
      explanation:
        '**5…Fg6** : le fou reste sur la diagonale b1–h7, défendu par le pion h7. Le tentant **5…Fe4?** perd un pion : 6.Cxe4 dxe4 7.Fg2 et le pion e4 tombe (+1,4 pour Stockfish). Et 5…Fd7? enferme le fou derrière nos propres pions. Après 5…Fg6, les Noirs jouent …c5 et attaquent la chaîne.',
    },
    {
      title: 'h4 contre le fou g6',
      fen: 'rn1qkbnr/pp3ppp/2p1p1b1/3pP3/3P2PP/2N5/PPP2P2/R1BQKBNR b KQkq - 0 6',
      prompt: 'Les Blancs ont joué g4 puis 6.h4 : ils menacent 7.h5 pour piéger le fou g6. Quelle est la meilleure réponse ?',
      solution: ['h7h5'],
      explanation:
        '**6…h5!** : on bloque le pion h4 et on attaque g4. Le fou garde la case h7, et si 7.g5, 7…c5 ; si 7.gxh5, 7…Fxh5. Stockfish donne déjà l’avantage aux Noirs (−0,6). 6…h6 se joue aussi, mais il laisse 7.h5 Fh7 et les Blancs gardent leur espace (+0,2). Ne joue jamais un coup de développement « normal » ici : 7.h5 piégerait le fou.',
    },
    {
      title: 'La menace h4–h5',
      fen: 'rn1qkbnr/pp2pppp/2p3b1/8/3P3P/6N1/PPP2PP1/R1BQKBNR b KQkq - 0 6',
      prompt: 'Classique après 5.Cg3 Fg6 6.h4. Que veulent les Blancs, et comment y répondre ?',
      solution: ['h7h6'],
      explanation:
        'Les Blancs menacent **7.h5**, et le fou g6 n’aurait plus de bonne case : h7 est bouché par notre pion, f5 est attaqué par le cavalier g3. **6…h6!** prépare la retraite 7.h5 Fh7. (6…h5 se joue aussi, mais il laisse la case g5 aux pièces blanches : Stockfish préfère nettement 6…h6.) Le développement « naturel » 6…Cd7? ou 6…e6? perd : 7.h5! et le fou doit aller en f5 où il est échangé, avec une grosse avance de développement pour les Blancs.',
    },
    {
      title: 'Un pion gratuit',
      fen: 'rn1qkbnr/pp2pppp/2p3b1/8/3P4/3B2N1/PPP2PPP/R1BQK1NR b KQkq - 4 6',
      prompt: 'Classique : au lieu de 6.h4 ou 6.Cf3, les Blancs ont joué 6.Fd3?, pour échanger les fous. Que manquent-ils ?',
      solution: ['d8d4'],
      explanation:
        'Le pion d4 n’est plus défendu : seule la dame d1 le protégeait… et le fou d3 bloque maintenant la colonne d. **6…Dxd4!** gagne un pion. Si 7.Fxg6, 7…Dxd1+! 8.Rxd1 hxg6 : un pion de plus et la colonne h ouverte. Si 7.C1e2 ou 7.Cf3, 7…Dd8 et la dame rentre avec un pion d’avance (−0,8 à −0,9 pour Stockfish). L’échange 6…Fxd3 est jouable, mais on laisse un pion sur la table.',
    },
    {
      title: 'La dame en b3',
      fen: 'r2qkb1r/pp2pppp/2n2n2/3p4/3P1Bb1/1QPB4/PP3PPP/RN2K1NR b KQkq - 4 7',
      prompt: 'Échange : 3.exd5 cxd5 4.Fd3 Cc6 5.c3 Cf6 6.Ff4 Fg4 7.Db3. La dame attaque b7. Comment le défendre ?',
      solution: ['d8d7'],
      acceptAlso: ['c6a5', 'd8c8'],
      explanation:
        '**7…Dd7** défend b7 et garde le fou g4 actif (7…Ca5, qui chasse la dame, et 7…Dc8 sont aussi bons). Le piège : **7…e6?** semble solide, mais 8.Dxb7 gagne un pion et attaque c6 et a8 (+2 pour Stockfish). Le fou sorti en g4 a laissé b7 sans défenseur : contre Db3, il faut toujours vérifier b7.',
    },
  ],
};

export default caroKann;
