import type { Lesson } from './types';

const structuresDePions: Lesson = {
  id: 'structures-de-pions',
  title: 'Structures de pions et plans associés',
  level: '1500-1800',
  summary:
    'Le pion isolé dame, les pions pendants, la structure Carlsbad et l’attaque de minorité, les chaînes de pions : la structure te dit où jouer.',
  sections: [
    {
      type: 'text',
      title: 'La structure dicte le plan',
      paragraphs: [
        'Philidor disait que « les pions sont l’âme des échecs ». Concrètement : les pions bougent peu et ne reculent jamais, donc **la structure est l’élément le plus durable de la position**. Reconnaître une structure, c’est hériter de plans déjà testés par des milliers de parties de maîtres.',
        '**Le pion isolé dame (PID)** — un pion d4 sans pion c ni e à côté. *Dynamiquement*, il donne de l’espace, deux colonnes semi-ouvertes (c et e), un avant-poste en e5 (et c5) pour un cavalier, et la poussée de rupture d4–d5. Le camp qui a le PID attaque souvent le roi (dame + fou sur la diagonale b1–h7, tour en e3–h3). *Statiquement*, c’est une faiblesse : il ne peut être défendu par un pion, et la case devant lui (d5) est un poste idéal pour un cavalier adverse. D’où les deux règles symétriques : **avec le PID, garde les pièces et attaque ; contre le PID, bloque (Nimzowitsch : « d’abord bloquer, puis détruire ») et échange les pièces**, surtout les pièces mineures — la finale est favorable au défenseur.',
        '**Les pions pendants** (c4 et d4 côte à côte, sans pions voisins) contrôlent beaucoup de cases et préparent une poussée (d5 ou c5) qui ouvre le jeu. Leur faiblesse : dès qu’on les force à avancer, l’un devient arriéré ou isolé et une case devant eux tombe aux mains de l’adversaire. Le plan contre eux : pression frontale (tours sur les colonnes c et d), puis provoquer leur avance au bon moment.',
        '**La structure Carlsbad** (Blancs : d4, e3 ; Noirs : c6, d5 ; colonne c semi-ouverte pour les Blancs, e semi-ouverte pour les Noirs) appelle l’**attaque de minorité** : deux pions blancs (a et b) avancent contre trois noirs (a, b, c). Le but n’est pas de percer mais de **créer une faiblesse** : après b4–b5 et bxc6, les Noirs gardent un pion c6 arriéré sur colonne ouverte, ou un pion d5 isolé. Les Noirs, eux, jouent sur l’aile roi (…Ce4, …f5, cavaliers vers g6/e4).',
        '**Les chaînes de pions** (par exemple d4–e5 contre e6–d5 dans la Française) : la règle de Nimzowitsch est d’**attaquer la base** de la chaîne (d4, par …c5, …Cc6, …Db6) plutôt que sa tête. Et la chaîne indique le côté où chaque camp attaque : on joue du côté vers lequel « pointent » ses pions — ici les Blancs à l’aile roi (f4–f5), les Noirs à l’aile dame.',
      ],
    },
    {
      type: 'position',
      title: 'Le pion isolé dame : le plan des deux camps',
      fen: 'r1bq1rk1/pp2bppp/2n1p3/3n4/3P4/2NB1N2/PP3PPP/R1BQR1K1 b - - 5 10',
      caption:
        'Une position typique (Caro-Kann, attaque Panov). Les Blancs ont le PID d4. Leurs atouts : la case e5 pour un cavalier, la diagonale b1–h7 vers h7, la rupture d4–d5. Les Noirs, eux, contrôlent d5 (cavalier bloqueur) et visent un pion d4 qui ne pourra jamais être protégé par un pion. Stockfish donne un léger avantage aux Blancs : la position est riche pour les deux camps.',
      arrows: [
        { from: 'd4', to: 'd5', kind: 'idea' },
        { from: 'f3', to: 'e5', kind: 'good' },
        { from: 'd3', to: 'h7', kind: 'threat' },
      ],
      marks: [
        { square: 'd4', kind: 'weak' },
        { square: 'e5', kind: 'strong' },
        { square: 'd5', kind: 'strong' },
      ],
    },
    {
      type: 'position',
      title: 'Fischer – Spassky, Reykjavik 1972 (6e partie) : les pions pendants',
      fen: 'rnr3k1/4qpp1/p3b2p/1Bpp4/8/Q3PN2/PP3PPP/2R1K2R w K - 0 16',
      caption:
        'Après 15…bxc5, Spassky a les pions pendants c5 et d5. Ils sont actifs mais deviennent des cibles : la dame a3 presse déjà c5 et la tour c1 est prête à rejoindre l’attaque frontale. Fischer va échanger le défenseur e6 puis forcer les pions à avancer.',
      marks: [
        { square: 'c5', kind: 'target' },
        { square: 'd5', kind: 'target' },
      ],
      moves: [
        { uci: 'e1g1', comment: '16.O-O : le roi à l’abri, les Blancs peuvent jouer sur les pions.' },
        { uci: 'a8a7', comment: '16…Ta7 : la tour noire défend latéralement.' },
        { uci: 'b5e2', comment: '17.Fe2 : le fou se replace, la pression sur c5 reste.' },
        { uci: 'b8d7', comment: '17…Cd7.' },
        { uci: 'f3d4', comment: '18.Cd4! : le cavalier vise le fou e6, défenseur clé de d5.' },
        { uci: 'e7f8', comment: '18…Df8.' },
        { uci: 'd4e6', comment: '19.Cxe6 fxe6 : l’échange crée un pion e6 faible et fige la structure.' },
        { uci: 'f7e6', comment: '19…fxe6.' },
        { uci: 'e3e4', comment: '20.e4! : on attaque d5 pour forcer une décision.' },
        { uci: 'd5d4', comment: '20…d4 : les pions avancent… et deviennent fixes. La case c4 et la diagonale vers e6 appartiennent maintenant au fou blanc.' },
        { uci: 'f2f4', comment: '21.f4 : les Blancs préparent e5 et f5. Fischer a obtenu une position clairement supérieure, qu’il gagnera magnifiquement.' },
      ],
    },
    {
      type: 'position',
      title: 'Structure Carlsbad : l’attaque de minorité',
      fen: 'r1bqrnk1/pp2bppp/2p2n2/3p2B1/3P4/2NBPN2/PPQ2PPP/1R3RK1 b - - 10 11',
      caption:
        'Gambit dame, variante d’échange, après 11.Tab1 : la tour soutient b2–b4–b5. Cible : le pion c6. Les Noirs jouent typiquement …a5 pour freiner, et cherchent du jeu à l’aile roi.',
      arrows: [
        { from: 'b2', to: 'b4', kind: 'idea' },
        { from: 'b4', to: 'b5', kind: 'idea' },
      ],
      marks: [{ square: 'c6', kind: 'target' }],
      moves: [
        { uci: 'a7a5', comment: '11…a5 : les Noirs freinent l’avance du pion b.' },
        { uci: 'a2a3', comment: '12.a3 : on prépare b4 malgré tout.' },
        { uci: 'f8g6', comment: '12…Cg6 : le cavalier rejoint l’aile roi.' },
        { uci: 'b2b4', comment: '13.b4.' },
        { uci: 'a5b4', comment: '13…axb4.' },
        { uci: 'a3b4', comment: '14.axb4 : la colonne a s’ouvre, et b5 approche.' },
        { uci: 'e7d6', comment: '14…Fd6.' },
        { uci: 'b4b5', comment: '15.b5 : après bxc6 (ou …cxb5), les Noirs auront un pion faible en c6 ou en d5. C’est tout l’objectif de l’attaque de minorité.' },
      ],
    },
    {
      type: 'position',
      title: 'Chaîne de pions : attaquer la base (Française, variante d’avance)',
      fen: 'r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6',
      caption:
        'La chaîne blanche c3–d4–e5 contre la chaîne noire e6–d5. Les Noirs attaquent la **base** d4 : pion c5, cavalier c6, dame b6 (et bientôt …Cf5 ou …Cge7–f5). Les Blancs défendent d4 et cherchent l’attaque à l’aile roi, du côté où pointe leur chaîne. Le fou c8, enfermé derrière e6 et d5, est le « mauvais fou » typique de cette structure.',
      arrows: [
        { from: 'c5', to: 'd4', kind: 'threat' },
        { from: 'c6', to: 'd4', kind: 'threat' },
        { from: 'b6', to: 'd4', kind: 'threat' },
      ],
      marks: [
        { square: 'd4', kind: 'target' },
        { square: 'c8', kind: 'weak' },
      ],
    },
  ],
  exercises: [
    {
      title: 'La rupture d4–d5',
      fen: '2rqr1k1/pb2bppp/1pn1pn2/6B1/3P4/P1NQ1N2/1PB2PPP/R3R1K1 w - - 6 15',
      prompt:
        'Position typique du pion isolé : batterie dame-fou vers h7, fou g5 contre le cavalier f6. Les Noirs viennent de jouer …Te8. Trouve la rupture thématique.',
      solution: ['d4d5', 'g7g6', 'd5c6'],
      explanation:
        '**15.d5!** : la poussée libère le pion isolé et ouvre les lignes au moment où les pièces blanches sont prêtes. Le cavalier c6 est attaqué ; si **15…exd5?**, **16.Fxf6!** : la reprise …Fxf6 laisserait h7 sans défenseur face à la batterie Dd3–Fc2, et Stockfish donne près de cinq pions d’avantage aux Blancs. Le mieux est **15…g6**, mais **16.dxc6** gagne une pièce contre un pion. Le coup tentant 15.Fxf6 Fxf6 16.d5 gagne aussi du matériel mais moins proprement ; les coups lents (15.h4) laissent les Noirs bloquer en d5.',
    },
    {
      title: 'L’attaque du pion isolé',
      fen: '2rq1rk1/pb2bppp/1p2pn2/n5B1/3P4/P1NQ1N2/1PB2PPP/R3R1K1 w - - 6 15',
      prompt:
        'Même structure, mais les Noirs ont joué …Ca5 : le cavalier a quitté c6 et l’aile roi. Que permet le départ de cette pièce ?',
      solution: ['g5f6', 'g7g6', 'f6e7', 'd8e7'],
      explanation:
        '**15.Fxf6!** élimine le seul défenseur de h7. La reprise naturelle 15…Fxf6?? perd sur **16.Dxh7#** (la dame est soutenue par le fou c2). Les Noirs doivent jouer **15…g6**, et **16.Fxe7 Dxe7** laisse les Blancs avec une pièce de plus. Voilà pourquoi la batterie Dd3 + Fc2 est l’arme principale du PID : chaque pièce noire qui quitte la défense de l’aile roi peut coûter cher.',
    },
    {
      title: 'La base de la chaîne… et le piège',
      fen: 'r1b1kbnr/pp3ppp/1q2p3/3pP3/3n4/3B1N2/PP3PPP/RNBQK2R w KQkq - 0 8',
      prompt:
        'Française d’avance : les Noirs ont attaqué la base d4 et viennent de prendre le pion par 7…Cxd4. Le pion est-il vraiment perdu ?',
      solution: ['f3d4', 'f8c5', 'd4b5'],
      explanation:
        '**8.Cxd4!** : si **8…Dxd4??**, **9.Fb5+** découvre l’attaque de la dame d1 sur la dame d4 — les Noirs perdent leur dame. Le mieux pour les Noirs est 8…Fc5, mais après **9.Cb5** (ou 9.Cf3), les Blancs ont simplement une pièce de plus. Morale : attaquer la base d4 est le bon plan, mais il faut l’attaquer avec plus de pièces qu’elle n’a de défenseurs — et regarder les clouages et découvertes sur la colonne d.',
    },
  ],
};

export default structuresDePions;
