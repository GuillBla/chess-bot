import type { Opening } from './types';

// Système de Londres (Blancs). Lignes et pièges contrôlés avec Stockfish 17.1 (profondeur 14 à 22).
const london: Opening = {
  id: 'london',
  name: 'Système de Londres',
  side: 'white',
  family: 'repertoire',
  against: '1.d4 avec les Blancs',
  eco: 'D02, A46, A48, A80',
  summary:
    'Un système plus qu’une ouverture : d4, Ff4 (avant e3 !), e3, Cf3, c3, Cbd2, Fd3 et le roque, contre presque toutes les défenses. On obtient une position solide, puis on choisit son plan : Ce5 et l’attaque à l’aile roi, ou la rupture e4.',
  why:
    'Peu de théorie à apprendre, car on joue presque toujours les mêmes coups, et une structure qui pardonne les imprécisions : idéal entre 1200 et 1500. Le revers : on peut jouer le Londres « en pilote automatique » sans le comprendre. Cette fiche explique le pourquoi de chaque coup — la pyramide c3-d4-e3, le fou sorti avant e3, le point faible b2, que faire contre …Fd6 ou …Ch5 — pour que tu saches quel plan choisir une fois le développement terminé.',
  keyIdeas: [
    'Le fou c1 sort en f4 AVANT de jouer e3 : sinon il reste enfermé derrière ses propres pions (2.Ff4 tout de suite, jamais 2.e3).',
    'La pyramide c3-d4-e3 tient le centre : si …cxd4, on reprend exd4 (ou cxd4) et d4 reste solide.',
    'Le point faible est b2, abandonné par le fou : contre …Db6, on joue Db3 (ou Dc1), ou on laisse b2 et on joue Cc3 ! avec la tactique Cb5/Cxd5.',
    'Contre …Fd6, on recule Fg3 : si …Fxg3, hxg3 ouvre la colonne h à notre tour ; contre …Ch5, Fg5 (si e7 est vide) ou Fg3 ; h3 prépare la retraite Fh2.',
    'Plan n°1 : Ce5 soutenu par f4, puis Df3, g4-g5 ou Tf3-h3 contre le roi noir ; le fou d3 et la dame visent h7.',
    'Plan n°2 : la rupture e4 (préparée par Cbd2, Fd3, De2 ou Dc2) ouvre le centre quand nos pièces sont mieux placées.',
    'Contre …g6 (Est-indienne, Hollandaise Leningrad) : h3 pour garder le fou, et parfois h4-h5 pour ouvrir la colonne h.',
  ],
  sections: [
    {
      type: 'text',
      title: 'La structure : une pyramide et un fou dehors',
      paragraphs: [
        'Le Londres repose sur une idée simple : **sortir le fou de cases noires en f4 avant de fermer sa diagonale avec e3**. Dans beaucoup d’ouvertures en d4 (Colle, Gambit Dame), le fou c1 reste enfermé derrière e3 et devient la mauvaise pièce des Blancs. Ici il est actif dès le 2e coup : il contrôle **e5** (la case de la rupture noire …e5) et la diagonale b8-h2, vers le roque noir.',
        'Ensuite viennent e3, Cf3, c3, Cbd2 et Fd3 : les pions forment une **pyramide c3-d4-e3**. Le pion d4 est défendu deux fois par des pions : les Noirs peuvent l’attaquer avec …c5 et …Cc6, il ne tombera pas. Le cavalier va en **d2** (et pas en c3) pour garder le pion c3 et pour soutenir la rupture e4. Le fou f1 va en **d3**, d’où il vise h7.',
        '**Pourquoi 2.Ff4 tout de suite plutôt que 2.Cf3 ?** L’ancien ordre (1.d4 2.Cf3 3.Ff4) marche aussi, mais aujourd’hui on préfère 2.Ff4 : le fou est dehors avant que les Noirs ne puissent le gêner, le cavalier g1 reste libre (on garde Cc3 contre …c5/…Db6, voire e3-Ce2), et on évite les clouages …Fg4. Une seule règle à ne jamais oublier : **Ff4 avant e3**.',
        'Le prix à payer : le pion **b2** n’est plus défendu par le fou c1. Presque tous les plans noirs agressifs passent par …c5 et …Db6. Il faut connaître les trois réponses : Db3 (on offre l’échange des dames ; après …Dxb3 axb3, la colonne a s’ouvre), Dc1 (la dame recule et défend b2 quand Db3 est chassée par …c4), et Cc3 ! quand le pion b2 est empoisonné par la tactique Cb5 ou Cxd5.',
      ],
    },
    {
      type: 'position',
      title: 'La position type du Londres',
      fen: 'r1bq1rk1/pp3ppp/2nbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R b KQ - 6 8',
      caption:
        'Après 1.d4 d5 2.Ff4 Cf6 3.e3 e6 4.Cf3 c5 5.c3 Cc6 6.Cbd2 Fd6 7.Fg3 O-O 8.Fd3. Le développement blanc est terminé : pyramide c3-d4-e3, fou g3 sur la diagonale b8-h2, fou d3 vers h7, cavalier f3 prêt à sauter en e5. Le roi blanc peut rester au centre un moment : s’il y a un échange en g3, hxg3 ouvrira la colonne h. Les deux plans : Ce5 + f4 (attaque) ou De2/Dc2 + e4 (rupture centrale).',
      arrows: [
        { from: 'd3', to: 'h7', kind: 'threat' },
        { from: 'f3', to: 'e5', kind: 'good' },
        { from: 'e3', to: 'e4', kind: 'idea' },
      ],
      marks: [
        { square: 'c3', kind: 'strong' },
        { square: 'd4', kind: 'strong' },
        { square: 'e3', kind: 'strong' },
        { square: 'e5', kind: 'strong' },
        { square: 'b2', kind: 'weak' },
      ],
    },
    {
      type: 'text',
      title: 'Les plans de milieu de partie',
      paragraphs: [
        '**1. Ce5 et l’attaque à l’aile roi.** Le cavalier s’installe en e5, où aucun pion noir ne peut le chasser facilement (…f6 affaiblirait e6, et le pion d n’est plus en d7). On le soutient avec **f4** : c’est une structure « Stonewall » inversée, avec le fou de cases noires DEHORS (c’est ce qui la rend bonne). Puis Df3, g4-g5 pour chasser le cavalier f6, ou Tf3-Th3 vers h7. Si les Noirs échangent en e5, fxe5 ouvre la colonne f.',
        '**2. La batterie Fd3-Dc2 et le sacrifice Fxh7+.** Le fou d3 et la dame (en c2, b1 ou h5) visent h7 ensemble. Dès que le cavalier f6 quitte sa case (chassé par g4-g5 ou par e4-e5, ou parce qu’il est allé en d7), h7 n’a plus de défenseur sauf le roi : regarde toujours Fxh7+ suivi de Cg5+ ou Dh5.',
        '**3. La rupture e4.** Quand les Noirs ont joué …b6/…Fb7 et ne contrôlent plus e4 aussi bien, on prépare e4 avec Cbd2, Fd3 et De2 (ou Dc2). Le centre s’ouvre, le fou d3 et le cavalier e5 deviennent très actifs, et si e5 tombe aux Blancs, le cavalier f6 doit partir… et h7 redevient faible.',
        '**4. h4-h5 contre …g6.** Contre les fianchettos (Est-indienne, Hollandaise Leningrad), la colonne h est une arme : le pion h avance pour ouvrir la colonne où la tour h1 attend déjà. Même idée quand les Noirs échangent …Fxg3 : après hxg3, la tour h1 vise h7 sans avoir bougé.',
        '**5. Le jeu à l’aile dame.** Si les Noirs ont fermé le centre avec …c4, on casse la chaîne avec **b3** (soutenu par Dc1 ou Dc2) pour ouvrir la colonne b ou la colonne a. Après un échange des dames en b3 (axb3), la colonne a semi-ouverte et le pion b3 qui contrôle c4 donnent des finales agréables. Après …cxd4 cxd4, la colonne c ouverte appartient à la tour qui y arrive la première.',
      ],
    },
    {
      type: 'position',
      title: 'Plan n°1 : Ce5, f4 et la marche des pions',
      fen: 'r1bq1rk1/p4ppp/1pnbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R w KQ - 0 9',
      caption:
        'Les Noirs viennent de jouer 8…b6 pour sortir leur fou en b7. C’est le bon moment pour Ce5 : le cavalier bloque le pion e6, regarde c6, d7, f7 et g6, et prépare f4 + Df3. Rejoue la ligne : les pions g et h vont ensuite se jeter sur le roque noir.',
      arrows: [
        { from: 'f3', to: 'e5', kind: 'good' },
        { from: 'f2', to: 'f4', kind: 'idea' },
      ],
      marks: [{ square: 'e5', kind: 'strong' }],
      moves: [
        { uci: 'f3e5', comment: '9.Ce5 : le cavalier s’installe sur sa case idéale.' },
        { uci: 'c8b7', comment: '9…Fb7 : le fou noir se développe, mais il regarde un mur (d5, puis notre pion e4 un jour).' },
        { uci: 'f2f4', comment: '10.f4 : le cavalier est soutenu par un pion ; s’il est échangé, fxe5 chasse le cavalier f6 et ouvre la colonne f.' },
        { uci: 'c6e7', comment: '10…Ce7 : le cavalier noir veut aller en f5 pour contrôler e3 et g3.' },
        { uci: 'd1f3', comment: '11.Df3 : la dame rejoint l’aile roi et soutient la future poussée g4.' },
        { uci: 'e7f5', comment: '11…Cf5 : il attaque notre fou g3 et la case e3.' },
        { uci: 'g3f2', comment: '12.Ff2 : on garde la paire de fous ; le fou protège e3 et g3.' },
        { uci: 'd6e7', comment: '12…Fe7 : les Noirs évitent l’échange sur e5.' },
        { uci: 'g2g4', comment: '13.g4 ! : on chasse le cavalier f5. Le roi blanc reste au centre : il n’a pas peur, car le centre est fermé.' },
        { uci: 'f5d6', comment: '13…Cd6 : retraite forcée.' },
        { uci: 'g4g5', comment: '14.g5 : maintenant le cavalier f6 est chassé à son tour… et h7 perd son principal défenseur.' },
        { uci: 'f6e4', comment: '14…Cfe4 : le cavalier saute en e4, mais il est loin de son roi.' },
        { uci: 'h2h4', comment: '15.h4 : h5-h6 ou Dh3 suivront. C’est l’attaque typique du Londres avec Ce5 : tous les pions de l’aile roi en avant, le fou d3 et la dame vers h7.' },
      ],
    },
    {
      type: 'position',
      title: 'Plan n°2 : la rupture e4 et la batterie vers h7',
      fen: 'r1bqr1k1/p3nppp/1p1bpn2/2ppN3/3P4/2PBP1B1/PP1N1PPP/R2Q1RK1 w - - 0 11',
      caption:
        'Les Noirs ont préparé …e5 avec …Te8, nous avons répondu Ce5 (on occupe la case). Ils viennent de jouer 10…b6 : le moment de casser le centre avec e4, car toutes nos pièces sont prêtes (Fd3, Cd2, Ce5, Fg3).',
      arrows: [
        { from: 'e3', to: 'e4', kind: 'good' },
        { from: 'd3', to: 'h7', kind: 'threat' },
      ],
      marks: [{ square: 'e4', kind: 'strong' }],
      moves: [
        { uci: 'e3e4', comment: '11.e4 ! : la rupture. Le pion attaque d5 et ouvre la diagonale du fou d3.' },
        { uci: 'c5d4', comment: '11…cxd4.' },
        { uci: 'c3d4', comment: '12.cxd4 : on garde deux pions centraux ; la colonne c s’ouvre pour nos tours.' },
        { uci: 'd5e4', comment: '12…dxe4.' },
        { uci: 'd2e4', comment: '13.Cxe4 : le cavalier rejoint le centre avec de nouvelles menaces (Cxf6+ puis Fxh7+).' },
        { uci: 'd6e5', comment: '13…Fxe5 : les Noirs éliminent le cavalier e5.' },
        { uci: 'g3e5', comment: '14.Fxe5 : notre fou de cases noires arrive en e5, au cœur de la position noire. Il regarde f6 et g7.' },
        { uci: 'f6e4', comment: '14…Cxe4.' },
        { uci: 'd3e4', comment: '15.Fxe4 : le fou est maintenant sur la diagonale b1-h7, braqué sur h7, et il menace aussi la tour a8.' },
        { uci: 'e7d5', comment: '15…Cd5 : le cavalier bloque la diagonale vers a8 et revient défendre.' },
        { uci: 'd1h5', comment: '16.Dh5 ! : la batterie fou + dame sur h7. La menace est Dxh7+ : les Noirs doivent affaiblir leur roque.' },
        { uci: 'g7g6', comment: '16…g6 : forcé ou presque. Les cases f6 et h6 sont maintenant des trous à côté du roi noir.' },
        { uci: 'h5f3', comment: '17.Df3 : la dame se replace en gardant la pression sur f7 et d5. Les Blancs ont l’initiative et une meilleure structure.' },
      ],
    },
    {
      type: 'position',
      title: 'L’échange …Fxg3 : pourquoi hxg3 est un cadeau',
      fen: 'r1bqk2r/pp3ppp/2nbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R b KQkq - 4 7',
      caption:
        'Contre …Fd6, on recule 7.Fg3 au lieu de prendre. Si les Noirs échangent eux-mêmes, on reprend **hxg3** : on ne crée pas de faiblesse, on gagne une colonne h semi-ouverte, où la tour h1 vise h7 sans même avoir à bouger. Et le pion g3 contrôle f4 et h4.',
      arrows: [{ from: 'h1', to: 'h7', kind: 'idea' }],
      marks: [{ square: 'h7', kind: 'target' }],
      moves: [
        { uci: 'd6g3', comment: '7…Fxg3 : les Noirs échangent notre bon fou.' },
        { uci: 'h2g3', comment: '8.hxg3 ! : on reprend vers le centre et la colonne h s’ouvre.' },
        { uci: 'd8d6', comment: '8…Dd6 : la dame prépare …e5.' },
        { uci: 'f1b5', comment: '9.Fb5 : on cloue le cavalier c6, qui soutient …e5.' },
        { uci: 'e8g8', comment: '9…O-O : le roi noir roque… face à notre tour h1.' },
        { uci: 'b5c6', comment: '10.Fxc6 : on double les pions noirs.' },
        { uci: 'b7c6', comment: '10…bxc6.' },
        { uci: 'd1c2', comment: '11.Dc2 : dame + tour h1 visent h7. Le roi blanc peut rester au centre, ou roquer à l’aile dame.' },
        { uci: 'h7h6', comment: '11…h6 : les Noirs couvrent h7 mais affaiblissent g6.' },
        { uci: 'f3e5', comment: '12.Ce5 : le cavalier central bloque les pions c6/c5 et prépare g4-g5 pour ouvrir la colonne h. Avantage blanc.' },
      ],
    },
    {
      type: 'position',
      title: 'Faiblesse n°1 : b2 et la dame noire en b6',
      fen: 'r1b1kb1r/pp2pppp/1qn2n2/2pp4/3P1B2/2P1P3/PP1N1PPP/R2QKBNR w KQkq - 3 6',
      caption:
        'Le fou est parti en f4 : b2 n’est plus défendu, et …c5 + …Db6 l’attaque. Retiens la séquence : Db3 (on offre l’échange), et si …c4 chasse la dame, Dc2 puis Dc1 quand le fou noir arrive en f5.',
      arrows: [{ from: 'b6', to: 'b2', kind: 'threat' }],
      marks: [{ square: 'b2', kind: 'weak' }],
      moves: [
        { uci: 'd1b3', comment: '6.Db3 : on défend b2 et on propose l’échange. Si …Dxb3, axb3 ouvre la colonne a.' },
        { uci: 'c5c4', comment: '6…c4 : les Noirs chassent la dame avec gain d’espace.' },
        { uci: 'b3c2', comment: '7.Dc2 : la dame garde la diagonale c2-h7. Si …Ff5? tout de suite, Dxf5 ! gagne une pièce (voir les pièges).' },
        { uci: 'g7g6', comment: '7…g6 : les Noirs préparent …Ff5 avec le fou protégé par g6.' },
        { uci: 'h2h3', comment: '8.h3 : case h2 pour notre fou, et g4 possible plus tard contre le fou f5.' },
        { uci: 'c8f5', comment: '8…Ff5 : la dame est attaquée.' },
        { uci: 'c2c1', comment: '9.Dc1 : la dame recule en défendant b2. Plus tard, b3 cassera la chaîne …c4 et ouvrira le jeu à l’aile dame.' },
      ],
    },
    {
      type: 'position',
      title: 'Faiblesse n°2 : le fou f4 harcelé par …Ch5',
      fen: 'r1bqkb1r/pp3ppp/2n1p3/2pp3n/3P1B2/2P1PN2/PP1N1PPP/R2QKB1R w KQkq - 3 7',
      caption:
        'Le cavalier h5 attaque notre fou, qui n’a pas de case h2 (pas de h3 joué). Trois réponses selon la position : **Fg5** quand la case e7 est vide (le fou attaque la dame d8 !), **Fg3** quand on accepte …Cxg3 hxg3 (colonne h), **Fe5** quand f6 peut être chassé. Et pour ne pas se poser la question : h3 à l’avance, pour reculer en h2.',
      arrows: [
        { from: 'h5', to: 'f4', kind: 'threat' },
        { from: 'f4', to: 'g5', kind: 'good' },
      ],
      moves: [
        { uci: 'f4g5', comment: '7.Fg5 ! : le fou attaque la dame d8 par la case e7 vide.' },
        { uci: 'f8e7', comment: '7…Fe7 : les Noirs interposent leur fou.' },
        { uci: 'g5e7', comment: '8.Fxe7 : on échange : le cavalier h5 n’a plus de cible.' },
        { uci: 'd8e7', comment: '8…Dxe7.' },
        { uci: 'f3e5', comment: '9.Ce5 : le cavalier central menace Cxc6 et prépare Fb5.' },
        { uci: 'c6e5', comment: '9…Cxe5.' },
        { uci: 'd4e5', comment: '10.dxe5 : le pion e5 interdit la case f6 au cavalier h5, qui reste perdu au bord de l’échiquier. Petit avantage blanc.' },
      ],
    },
    {
      type: 'position',
      title: 'h4-h5 contre …g6 : la Hollandaise Leningrad',
      fen: 'rnbqkb1r/ppppp2p/5np1/5p2/3P1B2/4P3/PPP2PPP/RN1QKBNR w KQkq - 0 4',
      caption:
        'Après 1.d4 f5 2.Ff4 Cf6 3.e3 g6, les Noirs veulent fianchetter leur fou. Le pion h avance tout de suite, et la tour h1 n’a même pas besoin de roquer pour participer.',
      arrows: [
        { from: 'h2', to: 'h4', kind: 'good' },
        { from: 'h4', to: 'h6', kind: 'idea' },
      ],
      marks: [{ square: 'g6', kind: 'target' }],
      moves: [
        { uci: 'h2h4', comment: '4.h4 ! : direction h5.' },
        { uci: 'f8g7', comment: '4…Fg7 : les Noirs continuent leur plan.' },
        { uci: 'h4h5', comment: '5.h5 : menace hxg6 et l’ouverture de la colonne h.' },
        { uci: 'd7d6', comment: '5…d6.' },
        { uci: 'h5h6', comment: '6.h6 ! : le pion enfonce un coin dans l’aile roi.' },
        { uci: 'g7f8', comment: '6…Ff8 : le fou doit reculer, sinon il serait pris. Les cases g7 et f8 seront affaiblies pour toute la partie, et le fou noir est passif. Avantage blanc net.' },
      ],
    },
  ],
  pgn: `
{Le Système de Londres : un même schéma (d4, Ff4, e3, Cf3, c3, Cbd2, Fd3, roque) contre presque toutes les défenses. L'ordre compte : le fou c1 sort AVANT e3, sinon il reste enfermé derrière ses propres pions.}
1. d4 {Le pion prend le centre et ouvre la diagonale c1-h6 : le fou c1 pourra sortir en f4 dès le coup suivant. [%cal Gc1f4]}
1... d5 {[%name Ligne principale : 1…d5] La réponse la plus classique : les Noirs prennent leur part du centre et bloquent la case d5.}
(1... Nf6 {[%name 1…Cf6] Le cavalier d'abord : les Noirs gardent le choix entre …d5, …g6 (Est-indienne) ou …c5.}
 2. Bf4 {Même coup, même idée : le fou sort tout de suite, avant e3. Contre 1…Cf6, il surveille e5, la case de la poussée libératrice …e5, et il ne sera pas enfermé par e3. [%cal Gf4e5]}
 2... g6 {[%name Système Est-indien] Les Noirs préparent …Fg7, …d6 puis …e5 : le fou g7 vise la grande diagonale et …e5 chassera notre fou.}
 (2... c5 {[%name 1…Cf6 2.Ff4 c5] Attaque immédiate du centre : les Noirs veulent …Db6 pour viser b2, le point faible laissé par le fou parti en f4.}
  3. e3 {On soutient d4 avec un pion (la pyramide commence) et on ouvre la diagonale du fou f1. Si …cxd4, exd4 garde un beau centre.}
  3... Qb6 {La dame attaque b2, que plus aucune pièce ne défend depuis que le fou c1 est sorti. [%cal Rb6b2] [%csl Rb2]}
  4. Nc3 {Le contre-coup moderne : on développe et on laisse b2 « en pâture ». Si …Dxb2, le cavalier saute en b5 avec la menace Cc7+ (fourchette roi-tour) et Tb1 qui enferme la dame. [%cal Gc3b5,Yb5c7]}
  4... Qxb2 {Les Noirs acceptent le pion : c'est risqué, la dame part très loin de son roi.}
  (4... cxd4 {Les Noirs échangent d'abord au centre pour ouvrir la colonne c.}
   5. exd4 {On reprend vers le centre : le pion e4 n'existe plus, mais la colonne e semi-ouverte et le pion d4 solide nous conviennent. Le pion b2 n'est toujours pas vraiment prenable : …Dxb2 Cb5 ou Fd2 et les Noirs perdent du temps.}
   5... e6 {Les Noirs libèrent leur fou f8 et visent d5.}
   6. Nf3 {Développement normal : le cavalier contrôle e5 et prépare le petit roque.}
   6... Be7 {Le fou se met à l'abri, …O-O suit.}
   7. Bd3 {Le fou vise h7 : avec le roi noir qui va roquer, la diagonale b1-h7 deviendra une arme. [%cal Gd3h7]}
   7... Nc6 {Pression sur d4, le pion isolé (seul sur sa colonne) que les Noirs ciblent.}
   8. a3 {Petit coup utile : il interdit …Cb4 (qui viserait d3) et …Fb4, et prépare b4 pour gagner de l'espace. On garde aussi la case a2 pour le fou ou la dame. [%cal Rc6b4]}
   8... d6 {Les Noirs consolident e5 et préparent …O-O.}
   9. O-O {Le roi à l'abri ; la tour f1 ira en e1 sur la colonne semi-ouverte. Le pion d4 isolé nous donne de l'espace et la case e5 pour un cavalier.}
   9... O-O 10. Re1 {La tour sur la colonne e : elle soutient une poussée d4-d5 ou un cavalier en e5, et surveille e6. Position confortable avec plus d'espace.})
  5. Nb5 {Le cavalier menace Cc7+ qui fourchette roi et tour a8. Les Noirs doivent couvrir c7 tout de suite. [%cal Yb5c7,Yc7a8] [%csl Yc7]}
  5... Nd5 {La meilleure défense : le cavalier attaque notre fou f4 ET couvre c7 (de d5, il contrôle c7).}
  (5... Na6? {Défense naturelle de c7… mais la dame b2 n'a plus de case de fuite sûre : a3 puis Tb1 va l'enfermer.}
   6. a3 {Coup fort : la dame b2 est presque prise au piège. On menace Tb1 suivi de Tb3 ou Fc1 pour la capturer. [%cal Ga1b1] [%csl Yb2]}
   6... Nd5 {Le cavalier attaque le fou f4 pour ouvrir une porte de sortie à la dame.}
   7. Rb1 {La tour chasse la dame vers a2, une case de prison ; les Noirs vont devoir rendre beaucoup pour la libérer.}
   7... Qa2 8. Ne2 {On rapatrie le cavalier vers c3 ou c1 pour attaquer la dame enfermée en a2 ; les Blancs ont un gros avantage.})
  6. Rb1 {La tour chasse la dame : elle doit prendre a2 ou reculer, et chaque coup de dame est un coup de développement de gagné pour nous.}
  6... Qxa2 7. Ra1 {Le va-et-vient de la tour (Tb1 / Ta1) repousse la dame. Si on veut la nulle, on répète ; sinon on joue Cf3 et on se développe avec une grosse avance.}
  7... Qb2 8. Nf3 {On refuse la répétition : nos pièces sortent toutes avec gain de temps alors que la dame noire erre sur la 2e rangée. En échange du pion, les Blancs ont une bonne initiative.}
  8... Na6 9. Rb1 {La tour reprend la colonne b et chasse encore la dame : chaque attaque gagne un temps de développement.}
  9... Qa2 10. Ne5 {Le cavalier central gagne du temps et menace Fc4 qui piégerait la dame en a2 (le fou f1 libère ses diagonales). [%cal Gf1c4]})
 3. Nf3 {Le cavalier contrôle e5 : la poussée …e5 sera plus difficile à préparer et devra être soutenue par deux pièces.}
 3... Bg7 4. e3 {Maintenant seulement e3 : le fou f4 est déjà dehors. Le pion soutient d4 et ouvre la diagonale du fou f1.}
 4... d6 {Les Noirs préparent …e5, qui attaquerait le fou f4.}
 5. h3 {Coup clé contre l'Est-indienne : le fou f4 aura la case h2 pour se réfugier quand …e5 ou …Ch5 l'attaquera, et il restera sur sa diagonale b8-h2. h3 empêche aussi …Cg4 et …Fg4. [%cal Gf4h2] [%csl Gh2]}
 5... O-O 6. Be2 {Le fou va en e2 plutôt qu'en d3 : derrière le pion g6 il n'y a rien à viser en h7, et en e2 il ne craint pas une poussée …e5-e4 qui le chasserait.}
 6... Nbd7 {Le cavalier soutient la poussée …e5 : les Noirs suivent leur plan.}
 (6... c5 {Les Noirs attaquent d4 de côté, sans …e5.}
  7. c3 {La pyramide c3-d4-e3 : d4 est solidement tenu, le cavalier b1 ira en d2 et la colonne c n'appartient à personne.}
  7... Qb6 {La dame attaque b2, toujours le même point sensible du Londres.}
  8. Qb3 {On défend b2 en proposant l'échange des dames : si …Dxb3 axb3, la colonne a s'ouvre pour notre tour et b3 contrôle c4. Sans dames, les Noirs n'ont plus d'attaque.}
  8... Nc6 9. Nbd2 {Le cavalier défend la dame b3 et contrôle e4 et c4. Le développement est complet et la structure ne craint rien.}
  9... cxd4 10. exd4 {On reprend de e3 pour garder la pyramide c3-d4 et ouvrir la colonne e à notre tour ; le fou e2 voit à nouveau h5 et la case e5 nous appartient.}
  10... Qc7 11. O-O {Roque : la position est équilibrée mais très solide, et les Noirs n'ont plus de cible.})
 7. O-O {On roque avant d'agir au centre : le roi est en sûreté et la tour f1 pourra rejoindre e1 ou d1.}
 7... e5 {Le coup thématique : il attaque le fou f4 et conteste le centre.}
 8. Bh2 {Le fou recule sur la case préparée par h3. Il garde la pression sur e5 : si …e4, le cavalier va en d2 et on attaque le pion avancé avec c4 et f3. [%cal Gh2e5] [%csl Gh2]}
 8... Qe7 9. c4 {Gain d'espace à l'aile dame : c4 contrôle d5 et prépare Cc3. Contre l'Est-indienne, les Blancs jouent sur l'aile dame pendant que leur roi reste calme.}
 9... e4 10. Nfd2 {Le cavalier recule pour attaquer le pion e4 avec Cc3 et f3, et laisse le fou e2 voir g4. La chaîne …d6-e4 est une cible, pas une force.}
 10... Re8 11. Nc3 {Le pion e4 est attaqué deux fois ; les Blancs sont confortables et vont jouer b4, c5 à l'aile dame.})
(1... f5 {[%name Hollandaise] La Défense hollandaise : les Noirs contrôlent e4 avec un pion et visent l'attaque à l'aile roi.}
 2. Bf4 {Le Londres marche aussi contre la Hollandaise : le fou contrôle e5, la case que la Hollandaise affaiblit en avançant …f5. [%cal Gf4e5] [%csl Ge5]}
 2... Nf6 3. e3 {La pyramide : on soutient d4 et on ouvre le fou f1, qui ira viser l'aile roi noire affaiblie par …f5.}
 3... g6 {[%name Hollandaise Leningrad] Les Noirs veulent fianchetter le fou en g7, comme dans l'Est-indienne.}
 (3... e6 {[%name Hollandaise classique] Les Noirs jouent …Fe7 et …O-O, en gardant un œil sur e4.}
  4. Nf3 {Le cavalier contrôle e5 : avec le fou f4, cette case devient la nôtre pour longtemps. [%csl Ge5]}
  4... Be7 5. Bd3 {Le fou vise f5 et, derrière lui, le roi noir. Il soutient aussi la rupture e4 qui ouvrira le jeu contre un roi affaibli par …f5. [%cal Gd3f5,Ge3e4]}
  5... O-O 6. h3 {Petit coup prophylactique : il donne la case h2 au fou f4 si …Ch5 ou …Fd6 vient le chasser. Contre la Hollandaise, notre fou de cases noires doit rester braqué sur e5. [%csl Gh2]}
  6... b6 7. O-O {Le roi à l'abri : la tour f1 soutiendra plus tard f3 et la rupture e4.}
  7... Bb7 8. c4 {Gain d'espace : c4 contrôle d5 et prépare Cc3, qui ajoutera une pièce sur e4.}
  8... Ne4 {Le cavalier s'installe en e4, la case que la Hollandaise veut tenir.}
  9. Nfd2 {On conteste tout de suite le cavalier e4 : on veut l'échanger ou le chasser avec f3. Un cavalier noir en e4 est le meilleur atout de la Hollandaise.}
  9... Nxd2 10. Qxd2 {La dame reprend et reste centralisée : le cavalier b1 sortira en c3, lui aussi vers e4.}
  10... d6 11. Nc3 {Le cavalier vise e4 et b5 : on prépare f3 puis e4 pour casser le contrôle noir de e4 et ouvrir le jeu contre le roi affaibli par …f5. [%cal Gc3e4,Ge3e4]})
 4. h4 {L'attaque directe contre …g6 : le pion h va en h5 pour ouvrir la colonne h, où notre tour attend déjà en h1 sans avoir besoin de roquer. [%cal Gh4h5,Gh1h8]}
 4... Bg7 5. h5 {On met la pression sur g6 : si …gxh5, la structure noire est ruinée ; si …Cxh5, on gagne du temps sur le cavalier ; sinon hxg6 ouvre la colonne h. [%cal Gh5g6]}
 5... d6 6. h6 {Le pion h6 enferme le fou g7 : il doit reculer en f8 ou rester bloqué. Les cases noires autour du roi (g7, f8) seront faibles pour toujours. [%csl Gh6,Yg7]}
 6... Bf8 7. c4 {On prend de l'espace au centre et à l'aile dame : le fou noir est passif, il faut maintenant ouvrir le jeu au centre.}
 7... e6 8. Nc3 {Développement naturel : le cavalier vise e4 et b5, et soutient d5.}
 8... Be7 9. Nf3 {Le dernier cavalier sort : les Blancs ont un grand avantage d'espace et un pion h6 qui étouffe l'aile roi noire.})
2. Bf4 {[%cal Gc1f4] LE coup du Londres : le fou sort avant e3. Pourquoi 2.Ff4 tout de suite plutôt que 2.Cf3 ? Avec 2.Ff4, on garde le cavalier g1 libre (Cc3 reste possible contre …c5/…Db6), on évite …Fg4 clouant un cavalier f3, et le fou est dehors avant que les Noirs ne puissent jouer …Fd6 ou …Ce4 pour le contester.}
(2. e3?! {L'erreur classique : le fou c1 est maintenant enfermé derrière e3. Pour le sortir, il faudra jouer b3 et Fb2, ou e4 plus tard : on perd l'idée même du Londres. Retiens : TOUJOURS Ff4 avant e3. [%csl Rc1] [%cal Re3c1]})
2... Nf6 {Les Noirs développent leur cavalier : c'est de loin le coup le plus courant.}
(2... c5 {[%name 2…c5 et …Db6] Les Noirs attaquent tout de suite le centre et préparent …Db6 contre b2, le point faible laissé par le fou parti en f4. [%csl Yb2]}
 3. e3 {On soutient d4 et on ouvre la diagonale f1-a6. Si …cxd4 exd4, le fou f4 reste actif et la colonne e s'ouvre.}
 3... Qb6 {La dame attaque b2 tout de suite. [%cal Rb6b2]}
 (3... Nc6 {Les Noirs développent et ajoutent de la pression sur d4.}
  4. c3 {La pyramide c3-d4-e3 : d4 est défendu par deux pions, et c3 ferme la diagonale du cavalier c6 vers b4.}
  4... Qb6 5. Qb3 {Contre …Db6, la réponse la plus simple : on défend b2 et on offre l'échange. Si …Dxb3 axb3, la colonne a s'ouvre pour la tour et le pion b3 contrôle c4. [%cal Gb3b2]}
  5... c4 {Les Noirs chassent la dame en gagnant de l'espace à l'aile dame.}
  6. Qc2 {La dame recule en gardant la diagonale c2-h7 (vers h7 et f5) : un futur …Ff5 serait attaqué. [%cal Gc2h7]}
  6... Nf6 {Le cavalier sort : on rejoint la ligne 2…Cf6 3.e3 c5. (Si …Ff5 tout de suite, Dxf5 Dxb2 Dxd5 mène à des complications très tranchantes : il faut les calculer.)}
  7. Nd2 {Le cavalier sort en d2 : il protège b3, c4 et e4, et si un jour …Ff5?, Dxf5 deviendra possible car Db1 pourra défendre la tour a1.}
  7... g6 8. h3 {On prépare g4 contre le futur …Ff5, et on donne la case h2 au fou f4 pour qu'il échappe à …Ch5.}
  8... Bf5 9. Qc1 {Le fou f5 est défendu par g6 : la dame recule en c1, d'où elle défend b2 et soutiendra b3 pour casser la chaîne …c4. [%csl Gb2]}
  9... Bg7 10. Ngf3 {Développement complet : Fe2, le roque, puis b3. Position équilibrée et solide.})
 4. Nc3 {Le coup moderne : on ne protège pas b2 directement, on le défend par la tactique ! Si …Dxb2, Cxd5 menace Cc7+ et Tb1. [%cal Gc3d5,Yd5c7]}
 4... e6 {Les Noirs refusent le pion empoisonné et protègent d5.}
 (4... Qxb2?? {Le pion b2 est empoisonné : la dame part en promenade et le pion d5 n'est plus protégé contre le cavalier c3.}
  5. Nxd5 {Le cavalier prend un pion central avec deux menaces : Cc7+ (fourchette roi + tour a8) et Tb1 qui chasse la dame. Les Blancs gagnent du matériel. [%cal Yd5c7,Ga1b1]}
  5... Kd8 {Le roi couvre c7, mais il perd le roque : sa position est déjà intenable.}
  6. Rb1 {La tour chasse la dame vers a2 ; puis dxc5 et Fc7+ montrent que le roi noir n'a plus d'abri. Gain décisif pour les Blancs.}
  6... Qxa2 7. dxc5 {On ouvre la colonne d vers le roi noir en d8 et on menace Fc7+ ou Cb6 ; les Blancs ont une attaque gagnante.})
 5. Nb5 {Le cavalier menace Cc7+ et Cd6+ : les Noirs doivent perdre du temps pour couvrir c7. [%cal Yb5c7,Yb5d6]}
 5... Na6 6. c3 {On consolide d4 avec la pyramide : le cavalier b5 est très actif et le cavalier a6 noir mal placé.}
 6... Nf6 7. a4 {Le pion a4 soutient le cavalier b5 : les Noirs ne peuvent plus le chasser avec …a6 sans perdre du temps. [%cal Ga4b5]}
 7... Be7 8. Nf3 {On se développe : Ce5, Fe2 et le roque suivront. Les Blancs ont un petit avantage durable.})
(2... Bf5 {[%name 2…Ff5 symétrique] Les Noirs copient : leur fou sort aussi avant …e6.}
 3. c4 {Contre le fou sorti trop tôt, on attaque tout de suite d5 : la case b7, privée de son fou, deviendra une cible pour Db3. [%cal Gc4d5] [%csl Yb7]}
 3... e6 4. Nc3 {On ajoute de la pression sur d5 ; on garde Db3 en réserve, car ici …Cc6 permettrait aux Noirs de sacrifier b7 pour un fort contre-jeu.}
 4... Nf6 5. e3 {Maintenant que le fou est dehors, e3 soutient d4 et ouvre le fou f1.}
 5... Bb4 6. Nf3 {Le cavalier se développe et protège d4 ; si …Fxc3+ bxc3, le centre blanc est renforcé et la colonne b s'ouvre.}
 6... O-O 7. Be2 {On prépare le roque : position confortable, de type Gambit Dame avec le fou déjà bien placé en f4.}
 7... dxc4 8. Bxc4 {Le fou reprend en développant : les Blancs ont un petit avantage de développement.}
 8... c5 9. O-O {Roque : position équilibrée et saine, tes pièces sont toutes actives.})
3. e3 {La pyramide c3-d4-e3 commence. Le pion soutient d4, ouvre la diagonale du fou f1, et ne gêne plus le fou c1 déjà sorti. [%csl Gd4,Ge3]}
3... e6 {[%name Système avec …e6, …c5, …Cc6] Le plan noir le plus solide : …e6, …c5, …Cc6, …Fd6. Le fou c8 reste derrière la chaîne de pions.}
(3... c5 {[%name …c5 + …Cc6 avant …e6] Les Noirs attaquent d4 avant de bouger leur pion e, pour garder leur fou c8 libre (…Ff5 ou …Fg4).}
 4. c3 {La pyramide c3-d4-e3 : d4 est défendu par deux pions. Si …cxd4, exd4 et la colonne e s'ouvre pour nous.}
 4... Nc6 5. Nd2 {Le cavalier dame sort d'abord : il contrôle e4 et c4, et surtout, de d2 il défend la dame si elle va en b3. Cg1-f3 viendra après.}
 5... Qb6 {La dame attaque b2 : c'est LE thème des Noirs dans le Londres.}
 (5... Bg4 {Le fou sort en g4 pour clouer le futur cavalier f3 et laisse b7 sans défense.}
  6. Ngf3 {On développe le cavalier ; le clouage n'est pas gênant car la dame d1 n'est pas attaquée sur des pièces importantes. Le cavalier d2 pourra reprendre en f3.}
  6... e6 7. Qb3 {Le fou c8 parti en g4, b7 n'est plus défendu : la dame attaque b7 et oblige les Noirs à une réponse passive. [%cal Gb3b7] [%csl Yb7]}
  7... Qc8 {La dame défend b7, mais elle est passive en c8.}
  8. h3 {On pose la question au fou g4 : s'il prend en f3, nous gagnons la paire de fous ; s'il recule en h5, Ch4 viendra le pourchasser.}
  8... Bh5 9. Nh4 {Le cavalier attaque le fou par g6 : s'il va en g6, Cxg6 nous donne la paire de fous. [%cal Gh4g6]}
  9... cxd4 10. exd4 {On reprend vers le centre : la colonne e s'ouvre et la pyramide c3-d4 tient.}
  10... Qd7 11. g4 {Le fou h5 est chassé : il ira en g6 où le cavalier h4 l'échangera. Les Blancs ont l'initiative et la paire de fous en vue.})
 (5... Bf5 {Le fou sort en f5, à l'extérieur de la chaîne de pions, et laisse b7 sans défenseur.}
  6. Ngf3 {D'abord le développement : le cavalier contrôle e5 et h4. On réserve Db3 contre b7 pour le moment où il gagnera du temps.}
  6... e6 7. Qb3 {La dame attaque b7 (le fou c8 est parti en f5) : les Noirs doivent jouer …Dc8 ou …Db6, toujours un peu passifs. [%cal Gb3b7] [%csl Yb7]}
  7... Qc8 8. Nh4 {Le cavalier s'attaque au fou f5 : la paire de fous pour les Blancs, et la diagonale du fou f1 s'ouvrira. [%cal Gh4f5]}
  8... Be4 9. Nxe4 {On élimine le fou : le pion qui reprend en e4 va être attaqué par f3.}
  9... dxe4 10. f3 {On attaque immédiatement le pion e4 isolé en avant : la colonne f s'ouvrira et les Blancs ont la paire de fous.})
 6. Qb3 {La réponse principale : on défend b2 et on propose l'échange. Grâce à Cd2, si …Dxb3, on peut reprendre axb3 et ouvrir la colonne a. [%cal Gb3b2]}
 6... c4 {Les Noirs chassent la dame et gagnent de l'espace à l'aile dame.}
 (6... Qxb3 {Les Noirs échangent les dames.}
  7. axb3 {On reprend VERS le centre (de a2) : la colonne a s'ouvre pour la tour a1 et le pion b3 contrôle c4. Le doublé de pions n'est pas une faiblesse ici. [%cal Ga1a7]}
  7... Nh5 {Le cavalier attaque le fou f4 pour gagner la paire de fous.}
  8. Bc7 {Le fou échappe à l'échange en sautant en c7 : il est actif et gêne les Noirs (il contrôle b8 et d8). [%csl Gc7]}
  8... cxd4 9. exd4 {On reprend vers le centre ; le fou f1 voit b5 et la colonne e s'ouvre.}
  9... Bd7 10. h4 {On gagne de l'espace et on prépare Fh2 si nécessaire ; le cavalier h5 n'a plus de bonne case (g3 et f4 sont contrôlés). Finale agréable pour les Blancs.})
 7. Qc2 {La dame recule en gardant la diagonale c2-h7 : si les Noirs jouent …Ff5 maintenant, Dxf5 ! gagnerait une pièce. [%cal Gc2f5]}
 7... g6 {Les Noirs préparent …Ff5 en le faisant défendre par le pion g6 (le fou ne sera plus « en l'air »).}
 (7... Bf5? {Une erreur fréquente : le fou n'est défendu par rien.}
  8. Qxf5 {On prend le fou ! La seule ressource noire est …Dxb2, mais notre cavalier d2 permet de défendre tout le reste.}
  8... Qxb2 9. Qb1 {Coup clé : on propose l'échange des dames, qui défend la tour a1 et c3 en même temps. Les Blancs ont une pièce contre deux pions.}
  9... Qxc3 10. Ne2 {Le cavalier chasse la dame avec gain de temps. Les Blancs ont une pièce de plus et gagnent.})
 8. h3 {On prépare g4 contre le futur …Ff5, et on donne la case h2 au fou f4 pour qu'il échappe à …Ch5.}
 8... Bf5 9. Qc1 {Maintenant le fou f5 est défendu par g6 : la dame recule en c1, d'où elle défend b2 et reste prête à soutenir b3 pour casser la chaîne …c4. [%csl Gb2]}
 9... Bg7 10. Ngf3 {Le développement continue : Fe2, le roque, puis b3 pour ouvrir le jeu à l'aile dame. Position équilibrée et solide.})
(3... Bf5 {[%name …Ff5 symétrique] Le fou noir sort comme le nôtre : il évite d'être enfermé par …e6.}
 4. c4 {On profite du fou sorti : c4 attaque d5 et, après Db3, la case b7 (abandonnée par le fou) sera visée. [%cal Gc4d5,Gd1b3]}
 4... e6 5. Qb3 {La dame attaque b7 et ajoute de la pression sur d5 : les Noirs doivent choisir comment défendre. [%cal Gb3b7] [%csl Yb7]}
 5... Nc6 {Les Noirs offrent b7 : après Dxb7?, …Cb4 menacerait Cc2+ avec un fort contre-jeu.}
 (5... Qc8 {Les Noirs défendent b7 avec la dame, passivement.}
  6. Nc3 {On développe en ajoutant une pièce sur d5 : la dame c8 est mal placée et les Blancs ont un développement facile.}
  6... c6 7. Nf3 {Le cavalier contrôle e5 ; on prépare Fe2 et le roque. Position agréable pour les Blancs.}
  7... h6 8. h3 {On donne la case h2 au fou f4 contre …Ch5, et on prépare g4 si le fou f5 reste là.}
  8... Be7 9. Be2 {Développement complet, roque au prochain coup : les Blancs ont un peu plus d'espace.})
 6. c5 {On ne prend pas b7 : on gagne de l'espace et on bloque l'aile dame. Le pion c5 enlève les cases b6 et d6 aux pièces noires.}
 (6. Qxb7? {Prendre le pion est dangereux : …Cb4 menace …Cc2+ (fourchette roi-tour) et …Tb8 qui chasse la dame. Les Noirs prennent l'initiative pour un pion. [%cal Rc6b4,Rb4c2]})
 6... Rb8 7. Nf3 {On développe en contrôlant e5. Le fou f1 ira en b5 pour clouer le cavalier c6 et renforcer c5.}
 7... Nh5 8. Bg3 {Contre …Ch5, ici on recule en g3 : si …Cxg3 hxg3, la colonne h s'ouvre pour notre tour et le pion g3 protège f4. [%cal Gh1h7]}
 8... Be7 9. Bb5 {Le fou cloue le cavalier c6 : les Noirs ont du mal à jouer …b6 ou …e5. L'aile dame blanche est solide.}
 9... O-O 10. Nbd2 {Le dernier cavalier sort : on prépare le roque et Bxc6 au bon moment.})
(3... Nh5?? {Le cavalier attaque notre fou… mais il laisse h5 sans défense.}
 4. Qxh5 {La dame prend le cavalier : la diagonale d1-h5 est ouverte depuis e3 ! Toujours vérifier ce qu'attaque la dame d1 quand un cavalier se pose en h5. [%cal Gd1h5]}
 4... Nc6 5. Bg3 {Le fou se met à l'abri ; les Blancs ont une pièce de plus et une position saine.})
4. Nf3 {Le cavalier contrôle e5, case clé de toute l'ouverture : il pourra s'y installer plus tard. [%csl Ge5]}
4... c5 {Les Noirs attaquent le centre, comme dans un Gambit Dame inversé.}
(4... Bd6 {[%name …Fd6 tôt] Les Noirs proposent immédiatement l'échange des fous : notre fou f4 est la pièce clé du Londres, ils veulent le neutraliser.}
 5. Bg3 {On garde notre fou : si …Fxg3 hxg3, notre tour h1 hérite d'une colonne h semi-ouverte et le pion g3 protège f4. Si on prenait en d6 (Fxd6), la dame noire reprendrait avec tempo et …e5 serait facile. [%cal Gh1h7] [%csl Gg3]}
 5... O-O 6. Bd3 {Le fou sort sur la diagonale b1-h7 : face au roque noir, il vise h7, souvent la cible de l'attaque. [%cal Gd3h7]}
 6... c5 7. c3 {La pyramide c3-d4-e3 : d4 est bien défendu, et on prépare Cbd2.}
 7... Nc6 8. Nbd2 {On retrouve la position type, avec Ce5 et la batterie Fd3-Dc2 en réserve. Le cavalier d2 soutient e4.}
 8... b6 9. Ne5 {Le cavalier s'installe sur la case forte e5 : il bloque le pion e et prépare f4 + Df3 vers l'aile roi. [%csl Ge5]}
 9... Bb7 10. f4 {Le pion f4 soutient le cavalier e5 pour qu'il ne puisse plus être chassé ou échangé sans ouvrir la colonne f. Structure « Stonewall » blanche : attaque à l'aile roi en vue.})
5. c3 {La pyramide c3-d4-e3 : si …cxd4, exd4 garde un centre solide. Le pion c3 enlève aussi la case b4 aux pièces noires.}
5... Nc6 6. Nbd2 {Le cavalier soutient e4 (rupture future) et peut aller en e5 via f3. Il ne va pas en c3 : la pyramide c3-d4-e3 a besoin du pion c3.}
6... Bd6 {[%name Variante principale …Fd6] Les Noirs contestent la diagonale b8-h2 et proposent l'échange de notre bon fou.}
(6... Nh5 {[%name …Ch5 contre le fou] Le cavalier attaque le fou f4 pour gagner la paire de fous.}
 7. Bg5 {Ici le fou va en g5 : il attaque la dame d8 (la case e7 est vide) et oblige les Noirs à un choix. Si …Fe7, on échange en e7 et le cavalier h5 se retrouve isolé au bord. [%cal Gg5d8]}
 7... Be7 8. Bxe7 {On échange les fous : le cavalier h5 n'a plus de cible et reste mal placé au bord de l'échiquier.}
 8... Qxe7 9. Ne5 {Le cavalier s'installe en e5 : il menace Cxc6 et prépare Fb5. Avec un cavalier h5 hors-jeu, les Blancs ont l'avantage. [%csl Ge5]}
 9... Nxe5 10. dxe5 {On reprend avec le pion : e5 enferme le cavalier h5 (la case f6 lui est interdite) et gagne de l'espace à l'aile roi. [%csl Gf6]}
 10... g6 11. Bb5+ {Échec intermédiaire : il gêne le roque et oblige …Fd7 ou …Rf8.}
 11... Bd7 12. Qa4 {La dame cloue le fou d7 et prépare la grande roque ou Fxd7+. Les Blancs ont un léger mais clair avantage.})
7. Bg3 {On garde notre fou en recul sur g3 plutôt que de prendre : si …Fxg3 hxg3, la colonne h s'ouvre pour notre tour (sans roquer !) et le pion g3 tient f4. Fxd6 Dxd6 donnerait aux Noirs un développement facile et …e5. [%cal Gh1h7]}
7... O-O {Les Noirs roquent et laissent la tension entre les fous.}
(7... Bxg3 {Les Noirs échangent eux-mêmes en g3.}
 8. hxg3 {On reprend VERS le centre avec le pion h : la colonne h s'ouvre pour la tour h1 (elle vise h7 sans bouger) et g3 contrôle f4. Garde ton roi au centre ou roque même à l'aile dame. [%cal Gh1h7] [%csl Yh7]}
 8... Qd6 9. Bb5 {Le fou cloue le cavalier c6 : le soutien de …e5 disparaît et on peut échanger en c6 pour abîmer les pions noirs. [%cal Gb5c6]}
 9... O-O 10. Bxc6 {On échange pour doubler les pions noirs c6 et c5 : ils deviendront des cibles en finale.}
 10... bxc6 11. Qc2 {La dame vise h7 en batterie avec la tour h1 : la colonne h et la diagonale b1-h7 convergent sur h7. [%cal Gc2h7,Gh1h7] [%csl Yh7]}
 11... h6 12. Ne5 {Le cavalier central bloque les pions et prépare f4 ou g4-g5 pour ouvrir la colonne h. Les Blancs ont une attaque à l'aile roi.})
(7... Qb6?? {La dame attaque b2… mais elle ne défend plus le fou d6 !}
 8. Bxd6 {On prend le fou, qui n'est plus défendu par la dame. Les Noirs perdent une pièce. [%cal Gg3d6]}
 8... Nxd4 9. cxd4 {On reprend le cavalier avec le pion c (le pion e3 continue de protéger d4) ; …Dxd6 ne récupère qu'une pièce, les Blancs ont un cavalier de plus pour un pion.})
8. Bd3 {Le fou se place sur la diagonale b1-h7 : face au petit roque noir, il vise h7. Avec Dc2, il formera la batterie classique Fd3-Dc2. [%cal Gd3h7] [%csl Yh7]}
8... b6 {Les Noirs préparent …Fb7 pour développer leur fou de cases blanches.}
(8... Re8 {Les Noirs préparent …e5 : la tour soutiendra la poussée libératrice.}
 9. Ne5 {On empêche …e5 en occupant la case : le cavalier e5 ne peut être chassé par un pion et bloque le pion e6. [%csl Ge5]}
 9... Ne7 {Le cavalier se replie pour aller en f5 ou g6 contester e5.}
 10. O-O {Roque : on prépare la rupture e4 (avec De2 ou f4 selon la situation). Les Blancs ont un petit avantage.}
 10... b6 11. e4 {La rupture e4 ! Elle ouvre le centre au moment où nos pièces sont mieux placées : le fou d3 et le cavalier e5 deviennent très actifs. [%cal Ge3e4] [%csl Ge4]}
 11... cxd4 12. cxd4 {On reprend en c3 : on garde deux pions centraux forts et la colonne c s'ouvre pour notre tour.})
(8... Qc7 {La dame se place sur la diagonale du fou g3… et sur la même ligne que notre fou ! Attention à la tactique.}
 9. dxc5 {Coup très fort : le fou d6 est attaqué, et s'il reprend …Fxc5, Fxc7 gagne la dame alignée sur la diagonale ! Les Noirs doivent prendre en g3. [%cal Gg3c7] [%csl Yc7]}
 (9. Ne5? {Le coup « automatique » est ici une erreur : …Cxe5 dxe5 Fxe5 Fxe5 Dxe5 et les Noirs ont gagné un pion, car la dame c7 attaque e5 en plus. [%cal Rc7e5]})
 9... Bxg3 10. hxg3 {On reprend vers le centre : la colonne h s'ouvre pour notre tour et le pion c5 nous laisse un pion de plus provisoire.}
 10... Rd8 11. Qb1 {La dame vise h7 par la diagonale b1-h7 en batterie avec le fou d3, sans craindre …e5. [%cal Gb1h7] [%csl Yh7]}
 11... g6 12. b4 {On défend le pion c5 avec un pion : les Blancs gardent un pion de plus et la colonne h. Avantage blanc.})
9. Ne5 {Le cavalier s'installe sur la case forte e5 : il ne peut plus être chassé par un pion, il bloque e6 et prépare f4 + Df3 vers l'aile roi. [%csl Ge5]}
9... Bb7 10. f4 {Structure « Stonewall » blanche : f4 soutient le cavalier e5. Si les Noirs l'échangent, fxe5 ouvre la colonne f à nos tours. Le plan : Df3, g4-g5 ou Tf3-h3. [%cal Gd1f3,Gf3h3]}
10... Ne7 {Le cavalier se replie pour aller en f5 et contrôler e3, g3 et h4.}
11. Qf3 {La dame rejoint l'aile roi : elle soutient e5 depuis f3 et prépare g4 pour chasser le cavalier noir de f5. [%cal Gg2g4]}
11... Nf5 12. Bf2 {Le fou se met à l'abri de …Cxg3 : il garde la paire de fous et protège e3 et g3.}
12... Be7 13. g4 {On chasse le cavalier f5 : les pions g et f avancent vers le roi noir, c'est l'attaque à l'aile roi typique du Londres avec Ce5.}
`,
  traps: [
    {
      title: 'La dame quitte d8… et le fou d6 tombe',
      fen: 'r1b1k2r/pp3ppp/1qnbpn2/2pp4/3P4/2P1PNB1/PP1N1PPP/R2QKB1R w KQkq - 5 8',
      prompt:
        'Ligne principale : 1.d4 d5 2.Ff4 Cf6 3.e3 e6 4.Cf3 c5 5.c3 Cc6 6.Cbd2 Fd6 7.Fg3 Db6. Les Noirs attaquent b2, comme d’habitude. Mais qu’a oublié la dame en quittant d8 ?',
      solution: ['g3d6'],
      explanation:
        '**8.Fxd6 !** : le fou d6 n’était défendu que par la dame d8. En allant en b6, elle l’a abandonné. Après 8…Cxd4 (le meilleur essai) 9.cxd4 Dxd6, les Blancs ont une pièce de plus pour un pion (Stockfish : environ +3,8). Prendre b2 avec la dame ne compensait rien : 8…Dxb2 9.dxc5 et les Noirs perdent encore plus. Réflexe à prendre : quand une pièce adverse quitte sa case, demande-toi ce qu’elle défendait.',
    },
    {
      title: 'Dame et fou sur la même diagonale',
      fen: 'r1b2rk1/ppq2ppp/2nbpn2/2pp4/3P4/2PBPNB1/PP1N1PPP/R2QK2R w KQ - 7 9',
      prompt:
        'Après 1.d4 d5 2.Ff4 Cf6 3.e3 e6 4.Cf3 c5 5.c3 Cc6 6.Cbd2 Fd6 7.Fg3 O-O 8.Fd3 Dc7, la dame noire s’est mise sur la diagonale de notre fou g3. Trouve le coup qui en profite (et pas 9.Ce5?).',
      solution: ['d4c5', 'd6g3', 'h2g3'],
      explanation:
        '**9.dxc5 !** : le fou d6 est attaqué, et s’il reprend 9…Fxc5?, **10.Fxc7** gagne la dame, qui était alignée derrière lui sur la diagonale c7-g3. Les Noirs doivent donc échanger 9…Fxg3, et **10.hxg3** (vers le centre, avec la colonne h ouverte) laisse aux Blancs un pion de plus en c5 et une bonne position (environ +0,6). Le coup « automatique » 9.Ce5? est ici une erreur : 9…Cxe5 10.dxe5 Fxe5 11.Fxe5 Dxe5 et les Noirs ont gagné un pion, car leur dame c7 attaquait aussi e5.',
    },
    {
      title: '…Cd7 ? : le fou d6 n’est plus protégé',
      fen: 'r1bqr1k1/pp1n1ppp/2nbp3/2ppN3/3P4/2PBP1B1/PP1N1PPP/R2QK2R w KQ - 9 10',
      prompt:
        'Après 8…Te8 9.Ce5, les Noirs ont joué 9…Cd7 pour chasser ou échanger notre cavalier. Mais ce cavalier coupe la dame d8 de son fou d6. Punis-le.',
      solution: ['e5c6'],
      acceptAlso: ['d3h7', 'e5f7'],
      explanation:
        '**10.Cxc6 !** : après 10…bxc6, **11.Fxd6** gagne le fou, que la dame ne défend plus à cause du cavalier d7 (environ +4). Si 10…Dc7 pour protéger d6, 11.Ce5 et les Blancs ont gagné une pièce (les Noirs ne récupèrent qu’un pion en e5). Le sacrifice **10.Fxh7+ !** marche aussi : 10…Rxh7 11.Cxf7 fourchette la dame d8 et le fou d6. Et 10.Cxf7 Rxf7 11.Fxd6 gagne également du matériel. Tous ces coups reposent sur la même idée : la ligne d8-d6 est coupée, le fou d6 est en l’air.',
    },
    {
      title: '…Ff5 ? contre la dame c2 : Dxf5 !',
      fen: 'r3kb1r/pp2pppp/1qn2n2/3p1b2/2pP1B2/2P1P3/PPQN1PPP/R3KBNR w KQkq - 2 8',
      prompt:
        'Après 1.d4 d5 2.Ff4 Cf6 3.e3 c5 4.c3 Cc6 5.Cd2 Db6 6.Db3 c4 7.Dc2, les Noirs jouent 7…Ff5 pour chasser notre dame. Le fou f5 est-il vraiment défendu ?',
      solution: ['c2f5', 'b6b2', 'f5b1'],
      explanation:
        '**8.Dxf5 !** : le fou n’est défendu par rien. La seule ressource noire est **8…Dxb2**, qui attaque la tour a1 et le pion c3. Alors **9.Db1 !** propose l’échange des dames et défend la tour : après 9…Dxc3 10.Ce2 la dame noire est chassée et les Blancs ont une pièce contre deux pions (environ +1,8). C’est grâce au cavalier d2 que tout tient : il défend b1 et b3. Voilà pourquoi, dans le Londres, la dame en c2 n’a peur de …Ff5 que lorsque le fou est protégé par …g6 (alors on recule Dc1).',
    },
    {
      title: '2…c5, 3…Db6 et le pion b2 empoisonné',
      fen: 'rnb1kbnr/pp2pppp/8/2pp4/3P1B2/2N1P3/PqP2PPP/R2QKBNR w KQkq - 0 5',
      prompt:
        'Après 1.d4 d5 2.Ff4 c5 3.e3 Db6 4.Cc3, les Noirs ont pris 4…Dxb2. Leur dame est loin et le pion d5 n’est plus défendu par elle. Trouve le coup qui punit la gourmandise.',
      solution: ['c3d5'],
      acceptAlso: ['f1b5'],
      explanation:
        '**5.Cxd5 !** : le cavalier prend un pion central avec deux menaces, **Cc7+** (fourchette du roi et de la tour a8) et **Tb1** qui chasse la dame. Après 5…Rd8 (pour couvrir c7), 6.Tb1 Dxa2 7.Fc7+ ou 7.dxc5 et le roi noir, privé du roque, est perdu au centre (Stockfish : plus de +3). 5.Fb5+ Rd8 gagne aussi (environ +2). Le coup 5.Cb5 est moins fort ici, car le pion d5 était à prendre. C’est l’idée de 4.Cc3 : on ne défend pas b2, on le rend empoisonné.',
    },
  ],
};

export default london;
