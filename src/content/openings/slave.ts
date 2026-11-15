import type { Opening } from './types';

// Défense Slave : 1.d4 d5 2.c4 c6, le fou de cases blanches sort en f5 (ou g4) AVANT …e6.
// Lignes contrôlées avec Stockfish 17.1 (profondeur 18) : aucun coup du répertoire ne perd plus de ~0,5 pion.
const slave: Opening = {
  id: 'slave',
  name: 'Défense Slave',
  side: 'black',
  family: 'repertoire',
  against: 'contre 1.d4 d5 2.c4',
  eco: 'D10–D17',
  summary:
    'Contre le Gambit Dame, les Noirs soutiennent d5 avec le pion c6 au lieu de …e6 : le fou c8 reste libre de sortir en f5 avant que la chaîne …e6 ne se ferme. Une structure solide, la même que la Caro-Kann.',
  why:
    'C’est la jumelle de la Caro-Kann et la « Londres à l’envers » : on sort le fou en f5, puis on joue …e6, …Cbd7, …Fd6 ou …Fb4 et on roque. Peu de théorie forcée, des plans qui se répètent d’une variante à l’autre, et les deux seuls dangers concrets (le pion b7 face à Db3, et le pion c4 qu’on ne doit pas garder à tout prix) s’apprennent une fois pour toutes.',
  keyIdeas: [
    'Le pion c6 soutient d5 sans enfermer le fou c8 : il sort en f5 (ou g4) AVANT …e6, exactement comme le fou f4 de ton Londres sort avant e3.',
    'Dès que le fou a quitté c8, b7 n’est plus défendu : si les Blancs jouent Db3, réponds …Db6 (ou …Dc7) tout de suite.',
    'Après …dxc4 et a4, ne t’accroche pas au pion par …b5 : on le rend, et on gagne du temps (…Ff5, …e6, …Fb4) pendant que le fou blanc le récupère.',
    'Contre e3 (le fou c1 enfermé), …dxc4 puis …b5 est au contraire bon : a4 se heurte à …b4.',
    'Si un cavalier blanc vient en h4 chasser le fou f5, recule en g6 et reprends toujours de h7 (…hxg6) : la colonne h s’ouvre pour ta tour.',
    'Dans l’échange (cxd5 cxd5), la structure est symétrique : développe tout (…Cc6, …Ff5, …e6, …Fb4 ou …Fd6, roque) et occupe la colonne c ouverte avec une tour.',
  ],
  sections: [
    {
      type: 'text',
      title: 'L’idée de la Slave : c6 plutôt que e6',
      paragraphs: [
        'Après 1.d4 d5 2.c4, les Blancs attaquent d5. La réponse classique 2…e6 (Gambit Dame refusé) tient d5 solidement, mais elle **enferme le fou c8** derrière ses propres pions : il restera longtemps la mauvaise pièce des Noirs.',
        'Avec **2…c6**, d5 est soutenu par un pion qui ne gêne personne. Le fou c8 garde sa diagonale : il sort en **f5** (parfois en g4), et c’est seulement ensuite que les Noirs jouent …e6. C’est exactement le principe de ton Système de Londres avec les Blancs — « sortir le fou avant de fermer la chaîne de pions » — et celui de la Caro-Kann contre 1.e4. Un seul schéma pour tout ton répertoire.',
        'Le prix à payer : quand le fou quitte c8, **le pion b7 n’est plus défendu**. La dame blanche en b3 le vise souvent (associée au pion c4 qui attaque d5). Il faut connaître la parade (…Db6 ou …Dc7) et ne pas sortir le fou quand b7 est déjà attaqué.',
        'Deuxième idée à retenir : la Slave peut prendre en c4 (…dxc4). Ce n’est pas pour garder le pion : c’est pour gagner un temps pendant que le fou blanc le récupère, et pour libérer la case d5. Les joueurs de club perdent souvent la partie en voulant garder ce pion par …b5 au mauvais moment.',
      ],
    },
    {
      type: 'position',
      title: 'Le fou d’abord, la chaîne ensuite',
      fen: 'rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/4PN2/PP3PPP/RNBQKB1R b KQkq - 0 4',
      orientation: 'black',
      caption:
        'Les Blancs ont joué 4.e3 : leur propre fou c1 est enfermé. Les Noirs ont le choix de l’ordre des coups, et c’est là toute la Slave : si tu joues …e6 maintenant, le fou c8 est emmuré comme celui des Blancs.',
      arrows: [{ from: 'c8', to: 'f5', kind: 'good' }],
      marks: [{ square: 'c1', kind: 'weak' }],
      moves: [
        { uci: 'c8f5', comment: '4…Ff5 : le fou sort AVANT …e6. Il surveille e4 (la case de rupture des Blancs), b1 et d3.' },
        { uci: 'b1c3', comment: '5.Cc3 : développement normal ; les Blancs préparent souvent Ch4 pour chasser le fou.' },
        { uci: 'e7e6', comment: '5…e6 : maintenant seulement on ferme la chaîne. Le fou f5 est dehors, le fou f8 peut sortir en d6, e7 ou b4. Les Noirs ont un « bon » fou de plus que les Blancs (le fou c1 reste derrière e3).' },
      ],
    },
    {
      type: 'position',
      title: 'Le talon d’Achille : b7 et la dame en b3',
      fen: 'rn1qkb1r/pp2pppp/2p2n2/3p1b2/2PP4/1Q2PN2/PP3PPP/RNB1KB1R b KQkq - 2 5',
      orientation: 'black',
      caption:
        'Le fou est parti en f5 : plus personne ne défend b7. La dame blanche b3 l’attaque (et met aussi la pression sur d5 avec le pion c4). Si les Noirs l’ignorent, 6.Dxb7 gagne un pion et la dame s’installe au cœur du camp noir.',
      arrows: [{ from: 'b3', to: 'b7', kind: 'threat' }],
      marks: [{ square: 'b7', kind: 'target' }],
      moves: [
        { uci: 'd8b6', comment: '5…Db6 ! : la dame défend b7 et propose l’échange. Si 6.Dxb6 axb6, la colonne a s’ouvre pour la tour a8 et le pion b6 contrôle c5 : rien à craindre. Si 6.c5, la dame recule en c7 (elle vise h2 avec le fou f5).' },
      ],
    },
    {
      type: 'position',
      title: 'La Slave principale : pourquoi 5.a4 et 7…Fb4',
      fen: 'rn1q1rk1/pp3ppp/2p1pn2/5b2/PbBP4/2N1PN2/1P3PPP/R1BQ1RK1 w - - 3 9',
      orientation: 'black',
      caption:
        'Après 4.Cc3 dxc4 5.a4 Ff5 6.e3 e6 7.Fxc4 Fb4 8.O-O O-O. Les Blancs ont récupéré le pion, mais le coup a4 a laissé un trou en b4 : le fou noir s’y installe et cloue le cavalier c3, qui ne peut plus soutenir la poussée e4. Le fou f5 surveille lui aussi e4.',
      arrows: [
        { from: 'b4', to: 'c3', kind: 'good' },
        { from: 'f5', to: 'e4', kind: 'good' },
      ],
      marks: [
        { square: 'b4', kind: 'strong' },
        { square: 'e4', kind: 'target' },
      ],
      moves: [
        { uci: 'd1e2', comment: '9.De2 : les Blancs préparent e4 en ajoutant une pièce (la tour f1 viendra en d1).' },
        { uci: 'b8d7', comment: '9…Cbd7 : le dernier cavalier sort, il soutient …e5 ou …c5 et peut venir en b6.' },
        { uci: 'e3e4', comment: '10.e4 : la poussée réalisée, le fou f5 doit reculer.' },
        { uci: 'f5g6', comment: '10…Fg6 : le fou reste sur la diagonale h7–b1 et surveille d3. Plan : …Fh5 pour clouer le cavalier f3, …Te8 et …e5 pour casser le centre blanc. Position solide, à peine meilleure pour les Blancs selon Stockfish.' },
      ],
    },
    {
      type: 'position',
      title: 'L’échange : symétrie et colonne c',
      fen: 'r2qkb1r/pp3ppp/2n1pn2/3p1b2/3P1B2/2N1PN2/PP3PPP/R2QKB1R w KQkq - 0 8',
      orientation: 'black',
      caption:
        'Après 3.cxd5 cxd5 4.Cc3 Cf6 5.Ff4 Cc6 6.e3 Ff5 7.Cf3 e6 : la structure est parfaitement symétrique. Personne n’a de faiblesse ; ce sont le développement et la colonne c ouverte qui décident. Attention : copier les coups adverses n’est pas un plan — il faut surtout parer Db3 (b7) et Fb5 (clouage du cavalier c6).',
      arrows: [{ from: 'c8', to: 'c1', kind: 'idea' }],
      marks: [{ square: 'b7', kind: 'target' }],
      moves: [
        { uci: 'd1b3', comment: '8.Db3 : l’attaque habituelle contre b7.' },
        { uci: 'f8b4', comment: '8…Fb4 ! : au lieu de défendre b7 passivement, le fou cloue le cavalier c3. Astuce : le fou b4 coupe aussi la colonne b, la dame b3 ne voit plus b7 ! Les Noirs vont roquer avec une position confortable.' },
        { uci: 'f1b5', comment: '9.Fb5 : les Blancs clouent à leur tour le cavalier c6.' },
        { uci: 'e8g8', comment: '9…O-O : le roi est à l’abri, et c6 n’est plus cloué contre le roi. Plan : …Tc8, …Ca5 ou …Db6, et l’égalité est atteinte.' },
      ],
    },
    {
      type: 'position',
      title: 'Ch4 contre le fou f5 : reprends vers le centre… par h7',
      fen: 'rn1qkb1r/pp3ppp/2p1pn2/3p1b2/2PP3N/2N1P3/PP3PPP/R1BQKB1R b KQkq - 1 6',
      orientation: 'black',
      caption:
        'Les Blancs lancent le cavalier en h4 pour échanger le fou f5 (la meilleure pièce noire). On ne peut pas l’empêcher, mais on peut obtenir quelque chose en échange.',
      arrows: [{ from: 'h4', to: 'f5', kind: 'threat' }],
      moves: [
        { uci: 'f5g6', comment: '6…Fg6 : le fou recule en restant sur sa diagonale. Si les Blancs l’échangent, ils dépensent deux temps de cavalier.' },
        { uci: 'h4g6', comment: '7.Cxg6 : les Blancs gagnent la paire de fous.' },
        { uci: 'h7g6', comment: '7…hxg6 ! : la colonne h s’ouvre pour la tour h8 (h2 devient une cible si les Blancs roquent), et les pions g6/f7 restent soudés. 7…fxg6? affaiblirait e6 et le roi noir.' },
      ],
    },
  ],
  pgn: `
1. d4 d5 {Le pion d5 occupe le centre et empêche e4 : c’est la base de toutes les structures …c6/…d5 de ton répertoire.}
2. c4 c6 {[%name Défense Slave] Le pion c6 soutient d5 sans enfermer le fou c8 (contrairement à 2…e6). Ce fou sortira en f5 avant …e6, comme le fou f4 de ton Londres sort avant e3. [%cal Gc8f5,Gc6d5]}
3. Nf3 {[%name Slave, 3.Cf3] Le coup le plus fréquent : les Blancs développent et gardent toutes les options (Cc3, e3, Dc2, Db3).}
(3. Nc3 {[%name Slave, 3.Cc3] Le cavalier pèse sur d5 ; e4 est parfois préparé.}
3... Nf6 {Même réponse : le cavalier défend d5 et contrôle e4.}
4. e3 {Les Blancs enferment leur fou c1 ; c’est le moment de sortir le nôtre.}
(4. Nf3 {On revient à la Slave principale par un autre ordre de coups.}
4... dxc4 {Même position qu’après 3.Cf3 Cf6 4.Cc3 : prends en c4, puis 5…Ff5 contre 5.a4.})
4... Bf5 {Le fou sort avant …e6. Attention, après cxd5 et Db3, b7 sera attaqué : il faut connaître la réponse.}
5. Nf3 {On rejoint le système avec e3.}
(5. cxd5 {Les Blancs ouvrent la colonne c pour préparer Db3.}
5... cxd5 {On reprend avec le pion pour garder la structure symétrique.}
6. Qb3 Nc6 {On ne défend pas b7 : on l’offre contre du développement. Si 7.Dxb7, 7…Fd7 et la dame blanche est en danger.}
7. Qxb7 Bd7 {Le fou libère c8 et b8 et menace …Tb8 qui chasse la dame ; les Noirs ont plusieurs temps d’avance.}
8. Qb3 Rb8 {La tour occupe la colonne b ouverte avec gain de temps.}
9. Qd1 e5 {La rupture centrale : toutes les pièces noires jouent, le roi blanc est encore au centre. Compensation complète pour le pion selon Stockfish. [%cal Ge7e5]})
(5. Qb3 {La dame attaque b7, que le fou f5 ne défend plus.}
5... Qb6 {Même réponse que d’habitude : défendre b7 et proposer l’échange des dames.})
5... e6 {Même structure que dans le système 4.e3 : …Fg6 contre Ch4, …Fxd3 contre Fd3, …Db6 contre Db3.})
(3. cxd5 {[%name Variante d’échange] Les Blancs simplifient : structure symétrique, colonne c ouverte.}
3... cxd5 {On reprend avec le pion : d5 reste au centre et la colonne c s’ouvre.}
4. Nc3 {Le cavalier attaque d5.}
(4. Nf3 {Ordre de coups différent.}
4... Nf6 {Même schéma : …Cf6, …Cc6, …Ff5, …e6.}
5. Nc3 Nc6 {Le cavalier contrôle e5 et d4 ; on rejoint la ligne principale de l’échange.})
4... Nf6 {Le cavalier défend d5 et contrôle e4.}
5. Bf4 Nc6 {Le cavalier contrôle e5 (la case visée par le fou f4) et d4.}
6. e3 Bf5 {Le fou sort avant …e6, comme toujours. [%cal Gc8f5]}
7. Nf3 {Développement naturel.}
(7. Qb3 {La dame attaque b7 avant que les Noirs aient roqué.}
7... Na5 {Le cavalier chasse la dame avec gain de temps.}
8. Qa4+ Bd7 {Le fou pare l’échec en attaquant la dame ; …e6 et …Fb4 suivront.})
7... e6 {La chaîne se ferme après la sortie du fou.}
8. Qb3 Bb4 {Plutôt que de défendre b7 passivement, le fou cloue le cavalier c3 et prépare le roque. [%cal Gb4c3]}
9. Bb5 O-O {Le roi s’abrite et le cavalier c6 n’est plus cloué contre lui. Plan : …Tc8, …Ca5 ou …Db6 : égalité confortable. [%cal Gf8c8]})
(3. e3 {[%name Slave, 3.e3] Les Blancs enferment leur fou c1 dès le troisième coup.}
3... Bf5 {Le fou sort immédiatement, avant même …Cf6, puisque e3 a fermé le fou c1 blanc.}
4. Nc3 {Développement ; Cf3 suivra.}
(4. cxd5 {Les Blancs ouvrent la colonne c pour Db3.}
4... cxd5 {Reprise avec le pion, structure symétrique.}
5. Qb3 Qc7 {La dame défend b7 et occupe la colonne c ; plan …e6, …Cc6, …Cf6, …Fd6.})
4... e6 {La chaîne se ferme derrière le fou ; …Cf6 rejoindra le système 4.e3.}
5. Nf3 Nf6 {On retrouve la structure du système 4.e3 : …Fg6 contre Ch4, …Fxd3 contre Fd3, …Db6 contre Db3.})
3... Nf6 {Le cavalier défend d5 une seconde fois et contrôle e4. On attend que les Blancs se dévoilent avant de choisir entre …Ff5 et …dxc4.}
4. Nc3 {[%name Slave principale (4.Cc3)] Les Blancs mettent une troisième pièce sur d5 ; e4 est dans l’air.}
(4. e3 {[%name Système avec 4.e3] Les Blancs consolident d4 et c4, mais enferment leur fou c1.}
4... Bf5 {C’est le moment rêvé : le fou sort avant …e6. Avec c4/d4/e3, c’est le fou c1 blanc qui devient la « mauvaise pièce ». [%cal Gc8f5] [%csl Rc1]}
5. Nc3 {Développement naturel ; Ch4 ou Fd3 suivront pour s’occuper du fou f5.}
(5. Qb3 {La dame attaque b7, que le fou f5 ne défend plus.}
5... Qb6 {On défend b7 en proposant l’échange de dames : sans dames, la Slave n’a plus aucun souci. [%cal Gd8b6]}
6. Nc3 {Les Blancs refusent l’échange.}
(6. Qxb6 {Les Blancs échangent les dames.}
6... axb6 {On reprend vers le centre et la tour a8 hérite de la colonne a. Le pion b6 contrôle c5 : finale très confortable pour les Noirs.})
(6. c5 {Les Blancs gagnent de l’espace et chassent la dame.}
6... Qc7 {La dame recule en gardant b7 et vise h2 avec le fou f5 ; …e6, …Cbd7 puis …e5 ou …b6 pour attaquer la chaîne.})
6... e6 {La structure Slave habituelle ; si 7.c5, …Dc7. Plan : …Cbd7, …Fe7 et roque.})
(5. cxd5 {Les Blancs échangent pour ouvrir la colonne c et viser b7 avec Db3.}
5... cxd5 {On reprend avec le pion : la structure reste symétrique.}
6. Qb3 Qc7 {La dame défend b7 et occupe la colonne c ouverte. Plan : …e6, …Cc6, …Fd6 et roque.})
5... e6 {La chaîne se ferme maintenant que le fou est dehors. Le fou f8 peut sortir en d6, e7 ou b4.}
6. Nh4 {Le cavalier vise le fou f5 pour gagner la paire de fous.}
(6. Bd3 {Les Blancs proposent l’échange des fous de cases blanches.}
6... Bxd3 {On accepte l’échange : la dame reprend, et les Blancs n’ont plus de fou pour viser h7.}
7. Qxd3 Nbd7 {Le cavalier va soutenir …e5, la rupture qui libère les Noirs.}
8. O-O Bd6 {Le fou se place face au roque blanc et contrôle e5.}
9. e4 dxe4 {On ouvre avant que e5 ne chasse le fou. Après 10.Cxe4 Cxe4 11.Dxe4, …O-O puis …e5 (ou …Df6) : les Noirs ont égalisé, plus aucune pièce mal placée.})
6... Bg6 {Le fou recule en restant actif : si les Blancs le prennent, ils auront dépensé deux coups de cavalier.}
7. Nxg6 hxg6 {On reprend toujours de h7 : la colonne h s’ouvre pour la tour h8 et la structure g6/f7 reste solide. [%cal Gh8h2]}
(7... fxg6? {Reprendre « vers le centre » est ici une erreur : le pion e6 devient faible et la diagonale a2–g8 s’ouvre vers le roi noir. Stockfish donne environ +1 aux Blancs après 8.Db3.} 8. Qb3 {La dame vise e6 et b7 en même temps.})
8. Bd3 Nbd7 {Le cavalier soutient …e5 ou …c5 et protège f6.}
9. O-O Bd6 {Le fou vise h2, avec la tour h8 derrière le pion g6. Plan : …Dc7 et roque (ou même …O-O-O), puis …e5, ou …dxc4 suivi de …e5. [%cal Gd6h2]})
(4. Qc2 {Les Blancs défendent c4 et contrôlent e4.}
4... dxc4 {On prend quand même : la dame doit reprendre et elle sera chassée.}
5. Qxc4 Bf5 {Le fou sort avec gain de temps : il contrôle e4 et vise c2. Plan : …e6, …Cbd7, …Fe7 ou …Fd6, roque.})
(4. Qb3 {La dame attaque d5 et vise b7.}
4... dxc4 {On élimine le pion qui attaque d5 : la dame doit reprendre en c4 et se retrouve exposée.}
(4... Bf5? {Sortir le fou quand la dame vise déjà b7 : 5.Dxb7 gagne un pion, la dame menace c6, et les Noirs doivent jouer …Cbd7 avec une position très inconfortable (+1,3 selon Stockfish).} 5. Qxb7 Nbd7 {Forcé pour garder la tour a8, défendue par la dame d8 le long de la 8e rangée.})
5. Qxc4 Bf5 {Maintenant le fou sort sans danger : b7 n’est plus attaqué. Plan : …e6, …Cbd7, …Fe7 et roque.})
(4. cxd5 {Les Blancs passent dans la structure de l’échange.}
4... cxd5 {Toujours reprendre avec le pion c6 : la structure reste symétrique et solide.}
5. Nc3 Nc6 {Même plan que dans l’échange : …Ff5, …e6, …Fb4 ou …Fd6 et roque. Voir 3.cxd5.})
4... dxc4 {Maintenant que les Blancs n’ont pas joué e3, on prend en c4 : le fou f1 devra perdre du temps pour récupérer le pion, et le fou c8 sortira avec gain de temps. [%cal Gd5c4]}
5. a4 {Le coup le plus fort : a4 empêche …b5, qui garderait le pion. En contrepartie, la case b4 devient un trou pour les Noirs. [%csl Gb4]}
(5. e3 {Les Blancs veulent récupérer le pion avec le fou, mais e3 enferme leur fou c1 et ne contrôle pas b5.}
5... b5 {Ici, garder le pion est bon : si 6.a4, …b4 chasse le cavalier c3. [%cal Gb7b5]}
6. a4 b4 {Le cavalier c3 est chassé et doit aller sur une mauvaise case (a2 ou b1 ; e4 perd une pièce).}
7. Na2 {Le cavalier va en a2 pour attaquer b4 (et revenir plus tard par c1).}
(7. Ne4? {Une erreur naturelle : le cavalier n’est défendu par rien.} 7... Nxe4 {Le cavalier e4 tombe pour un simple pion (8.Fxc4) : une pièce d’avance pour les Noirs.})
7... e6 {On ouvre la diagonale du fou f8, qui défend b4, et on prépare …c5. Le pion c4 tombera, mais le pion b4 gêne durablement les Blancs.}
8. Bxc4 Bb7 {Le fou va sur la grande diagonale (cases d5 et e4), puisque f5 n’a plus de sens ici.}
9. O-O Nbd7 {Développement, puis …c5 pour casser le centre blanc : le cavalier a2 est hors jeu, les Noirs vont très bien. [%cal Gc6c5]})
(5. e4 {Les Blancs construisent un grand centre et sacrifient le pion c4 pour un temps.}
5... b5 {Avec e4 joué, on peut garder le pion : …b5 soutient c4 et menace …b4, qui chasse le défenseur de e4.}
6. e5 {Les Blancs chassent le cavalier f6.}
(6. a4 {Les Blancs attaquent b5 pour récupérer c4.}
6... b4 {…b4 chasse le cavalier c3, qui défendait e4.}
7. Na2 Nxe4 {Le pion e4 n’a plus de défenseur : les Noirs ont un pion de plus et une position libre.}
8. Bxc4 e6 {On ouvre le fou f8 et on roque vite : …Fe7, …O-O, …Fb7. Pion de plus, position saine.})
6... Nd5 {Le cavalier s’installe en d5, la case que le pion e5 a abandonnée : aucun pion ne peut plus l’en chasser.}
7. a4 e6 {On ouvre le fou f8 (qui pourra venir en b4) et on solidifie d5.}
8. axb5 Nxc3 {Le cavalier échange le cavalier c3, qui attaquait d5 et b5.}
9. bxc3 cxb5 {Les Noirs ont un pion de plus (c4 et b5 soudés). Plan : …Fb7, …Cc6 ou …Cd7, …Fe7 et roque ; Stockfish préfère les Noirs.})
5... Bf5 {Le fou sort enfin, avant …e6 : il contrôle e4 et empêche la poussée e2–e4. [%cal Gc8f5,Gf5e4]}
(5... b5? {Erreur classique : on veut garder le pion c4, mais avec le pion blanc déjà en a4, b5 tombe tout de suite. 6.axb5 cxb5 7.Cxb5 et les Blancs ont récupéré le pion avec une très bonne position (le pion c4 est faible et isolé).} 6. axb5 cxb5 {Reprise forcée, mais le pion b5 n’a plus de soutien.} 7. Nxb5 {Le cavalier attaque a7 et la case d6 ; Stockfish donne plus d’un pion d’avance aux Blancs.})
6. e3 {[%name Ligne principale 6.e3] La suite tranquille : le fou f1 va récupérer le pion c4.}
(6. Ne5 {Les Blancs veulent reprendre en c4 avec le cavalier et jouer f3 + e4.}
6... Nbd7 {On défie tout de suite le cavalier e5 : il doit s’échanger ou prendre en c4.}
7. Nxc4 Qc7 {La dame contrôle e5 et prépare …e5 : ce coup libère tout le jeu noir.}
8. g3 e5 {La rupture libératrice : le centre s’ouvre, le fou f5 et la dame c7 deviennent actifs. Plan : …Fe7 ou …Fb4, roque, …Td8 face à la dame. [%cal Ge7e5]})
6... e6 {La chaîne se ferme maintenant que le fou est dehors. La case b4 attend le fou f8.}
7. Bxc4 Bb4 {Le fou s’installe sur le trou créé par a4 et cloue le cavalier c3, qui ne peut plus soutenir e4. [%cal Gb4c3] [%csl Gb4]}
8. O-O O-O {Le roi se met à l’abri ; les pièces mineures sont toutes sorties sauf le cavalier b8.}
9. Qe2 {[%name Avec 9.De2] Les Blancs préparent e4 : la dame soutient le pion et la tour viendra en d1.}
(9. Nh4 {Les Blancs chassent le fou f5 pour gagner la paire de fous.}
9... Bg6 {Le fou recule en restant sur sa diagonale ; le cavalier h4 est mal placé s’il ne prend pas.}
10. Nxg6 hxg6 {On reprend vers le centre et la colonne h s’ouvre pour la tour h8. Plan : …Cbd7, …Dc7 (qui vise h2) et …e5. [%cal Gh8h2]})
9... Nbd7 {Le dernier cavalier sort : il soutient …e5 ou …c5 et peut aller en b6 ou e4.}
10. e4 Bg6 {Le fou recule sur la diagonale h7–b1 en surveillant d3 et e4. Plan : …Fh5 pour clouer le cavalier f3, …Te8 puis …e5 pour contester le centre. [%cal Ge6e5]}
`,
  traps: [
    {
      title: 'Le pion b7 sans défenseur',
      fen: 'rn1qkb1r/pp2pppp/2p2n2/3p1b2/2PP4/1Q3N2/PP2PPPP/RNB1KB1R w KQkq - 4 5',
      prompt:
        'Après 1.d4 d5 2.c4 c6 3.Cf3 Cf6 4.Db3, les Noirs ont sorti le fou : 4…Ff5 ?. Tu as les Blancs : punis cette sortie trop rapide.',
      solution: ['b3b7', 'b8d7'],
      explanation:
        '**5.Dxb7 !** : le fou c8 est parti, plus rien ne défend b7. Les Noirs doivent jouer **5…Cbd7** pour garder la tour a8 (la dame d8 la défend par la 8e rangée), et la dame blanche menace déjà c6. Stockfish donne plus d’un pion aux Blancs. La leçon pour les Noirs : quand la dame est en b3, on prend d’abord en c4 (4…dxc4 5.Dxc4) ou on défend b7 (…Db6), et seulement ensuite on sort le fou.',
    },
    {
      title: 'Garder le pion c4 ? Pas avec a4',
      fen: 'rnbqkb1r/p3pppp/2p2n2/1p6/P1pP4/2N2N2/1P2PPPP/R1BQKB1R w KQkq - 0 6',
      prompt:
        'Slave principale : 4.Cc3 dxc4 5.a4 b5 ?. Les Noirs veulent garder leur pion. Tu as les Blancs : comment récupères-tu le pion avec avantage ?',
      solution: ['a4b5', 'c6b5', 'c3b5'],
      explanation:
        '**6.axb5 cxb5 7.Cxb5** : le pion b5 n’est soutenu que par c6, qui disparaît dans l’échange. Le cavalier b5 attaque a7 et la case d6, le pion c4 est isolé et tombera aussi, et la tour a1 a une colonne ouverte. Stockfish : environ +1,4 pour les Blancs. C’est pourquoi, après 5.a4, les Noirs jouent **5…Ff5** et laissent le pion : on le rend contre du développement.',
    },
    {
      title: 'Le cavalier en l’air',
      fen: 'rnbqkb1r/p3pppp/2p2n2/8/PppPN3/4PN2/1P3PPP/R1BQKB1R b KQkq - 1 7',
      prompt:
        'Après 4.Cc3 dxc4 5.e3 b5 6.a4 b4, les Blancs ont évité la case a2 avec 7.Ce4 ?. Que jouent les Noirs ?',
      solution: ['f6e4'],
      explanation:
        '**7…Cxe4 !** : le cavalier e4 n’était défendu par aucune pièce blanche (le pion d3 n’existe pas, la dame d1 ne voit pas e4). Les Blancs peuvent seulement reprendre un pion par 8.Fxc4 : les Noirs ont une pièce de plus (+3 selon Stockfish). Quand …b4 chasse le cavalier c3, ses seules cases sûres sont a2 et b1 — c’est justement pour ça que 5…b5 est bon contre 5.e3.',
    },
    {
      title: 'Le sacrifice de b7 bien préparé',
      fen: 'r2qkb1r/pQ2pppp/2n2n2/3p1b2/3P4/2N1P3/PP3PPP/R1B1KBNR b KQkq - 0 7',
      prompt:
        '3.Cc3 Cf6 4.e3 Ff5 5.cxd5 cxd5 6.Db3 Cc6 7.Dxb7. Les Blancs ont pris le pion. Quel est le coup qui transforme ce pion en avance de développement ?',
      solution: ['f5d7', 'b7b3', 'a8b8'],
      explanation:
        '**7…Fd7 !** : le fou dégage c8 et b8 et menace **…Tb8**, qui chasserait la dame (et après …Tb8, la dame n’a presque plus de cases). Les Blancs doivent reculer tout de suite (8.Db3 Tb8 9.Dd1 e5 !) : les Noirs ont trois pièces actives, la colonne b et la rupture …e5, contre un roi blanc encore au centre — compensation complète selon Stockfish. Les autres coups (7…Dc8, 7…Tc8) perdent simplement le pion : environ −1,3.',
    },
    {
      title: 'Reprendre du bon côté',
      fen: 'rn1qkb1r/pp3ppp/2p1pnN1/3p4/2PP4/2N1P3/PP3PPP/R1BQKB1R b KQkq - 0 7',
      prompt:
        'Système 4.e3 : 5.Cc3 e6 6.Ch4 Fg6 7.Cxg6. Comment les Noirs reprennent-ils ?',
      solution: ['h7g6'],
      explanation:
        '**7…hxg6 !** : la tour h8 obtient la colonne h semi-ouverte (h2 deviendra une cible si les Blancs roquent), et la structure g6–f7–e6 reste compacte. **7…fxg6 ?**, la reprise « vers le centre », affaiblit le pion e6 et ouvre la diagonale a2–g8 vers le roi : après 8.Db3 les Blancs ont un avantage net (environ +1 selon Stockfish).',
    },
  ],
};

export default slave;
