import type { Lesson } from './types';

const defense: Lesson = {
  id: 'defense',
  title: 'Défendre les positions difficiles',
  level: '1500-1800',
  summary:
    'Défense active, contre-attaque, forteresses, échec perpétuel et pat : les ressources qui sauvent des demi-points — à condition de les chercher.',
  sections: [
    {
      type: 'text',
      title: 'L’état d’esprit du défenseur',
      paragraphs: [
        'La défense est l’art le moins enseigné et le plus rentable : à 1500, une position « perdue » sur deux se sauve si l’on continue à chercher. Lasker gagnait autant de parties en défendant qu’en attaquant ; Petrosian et Karpov en ont fait un style. Première règle : **ne jamais décider qu’une position est perdue avant d’avoir cherché toutes les ressources** — échecs, sacrifices de pat, forteresses, contre-attaque.',
        '**La défense active** : une pièce qui contre-attaque défend souvent mieux qu’une pièce qui protège. Une tour qui menace les pions adverses oblige l’attaquant à se défendre lui aussi ; une menace de mat, même lointaine, ralentit l’attaque adverse d’un temps. En finale de tours, la tour active vaut un pion.',
        '**La forteresse** : une position où le camp le plus faible ne peut pas être forcé, même avec du matériel en moins — roi dans le coin face au « mauvais fou » et au pion-tour, défense de Philidor, blocus sur des cases que l’adversaire ne contrôle pas. Connaître les forteresses typiques permet de **viser** une finale « perdue » qui est en fait nulle.',
        '**Échec perpétuel et pat** : quand le roi adverse est exposé, la dame peut donner des échecs sans fin. Quand ton roi n’a plus de coup, chaque pièce qui te reste peut devenir « enragée » : si l’adversaire est forcé de la prendre, c’est pat. Dans les positions désespérées, regarde toujours ces deux idées en premier.',
        '**L’échange des attaquants** : en défense, échange les pièces qui attaquent ton roi, pas tes défenseurs. Et rends du matériel sans hésiter si cela casse l’initiative adverse : une qualité ou un pion rendus au bon moment valent mieux qu’une attaque qui continue.',
      ],
    },
    {
      type: 'position',
      title: 'Forteresse : le mauvais fou et le pion-tour',
      fen: '8/4k3/8/7P/4K3/3B4/8/8 b - - 0 1',
      caption:
        'Fou et pion h contre roi seul : c’est **nul** si le roi noir atteint le coin h8, parce que le fou de cases blanches ne contrôle pas cette case noire. Le roi ne peut jamais en être chassé : au pire, c’est pat. Stockfish donne environ +0,4 : une évaluation de nulle, le moteur sans tables de finales ne « voit » pas la forteresse mais ne trouve aucun progrès.',
      marks: [{ square: 'h8', kind: 'strong' }],
      arrows: [{ from: 'e7', to: 'h8', kind: 'good' }],
      moves: [
        { uci: 'e7f7', comment: '1…Rf7 : direction le coin.' },
        { uci: 'e4f5', comment: '2.Rf5.' },
        { uci: 'f7g7', comment: '2…Rg7.' },
        { uci: 'f5g5', comment: '3.Rg5.' },
        { uci: 'g7h8', comment: '3…Rh8 : le roi est dans le coin.' },
        { uci: 'g5f6', comment: '4.Rf6.' },
        { uci: 'h8g8', comment: '4…Rg8.' },
        { uci: 'f6g6', comment: '5.Rg6 Rh8 : le roi fait la navette g8–h8, et rien ne peut l’en déloger.' },
        { uci: 'g8h8', comment: '5…Rh8 : nulle.' },
      ],
    },
    {
      type: 'position',
      title: 'Défense active en finale de tours : les échecs par derrière',
      fen: '4k3/7R/1r2P3/3K4/8/8/8/8 b - - 0 1',
      caption:
        'Défense de Philidor, deuxième phase : le pion est arrivé en e6. La tour noire n’a plus rien à faire en 6e rangée ; elle file en 1re rangée et donne des échecs verticaux. Le roi blanc ne peut pas se cacher devant son pion. Nulle.',
      moves: [
        { uci: 'b6b1', comment: '1…Tb1 : la tour prend de la distance.' },
        { uci: 'd5d6', comment: '2.Rd6 Td1+.' },
        { uci: 'b1d1', comment: '2…Td1+.' },
        { uci: 'd6e5', comment: '3.Re5 Te1+.' },
        { uci: 'd1e1', comment: '3…Te1+.' },
        { uci: 'e5f6', comment: '4.Rf6 Tf1+.' },
        { uci: 'e1f1', comment: '4…Tf1+ : les échecs continuent, nulle.' },
      ],
    },
  ],
  exercises: [
    {
      title: 'La tour enragée',
      fen: 'k7/p7/P2Q4/8/8/8/5rPP/6K1 b - - 0 1',
      prompt:
        'Les Noirs n’ont plus qu’une tour contre une dame. Ton roi a8 n’a aucune case (b8 est contrôlée par la dame, b7 par le pion a6). Trouve la ressource.',
      solution: ['f2f1', 'g1f1'],
      explanation:
        '**1…Tf1+!** : le roi blanc est obligé de prendre (2.Rxf1), et c’est **pat**. Le piège : 1…Txg2+? qui semble pareil, mais après **2.Rf1!** (le roi refuse la tour) les Noirs n’ont plus de pat forcé : la tour peut encore donner des échecs, mais le roi blanc remonte l’échiquier, finit par y échapper, et la dame gagne. Il faut choisir l’échec qui **oblige** la prise.',
    },
    {
      title: 'L’échec perpétuel',
      fen: '4Q3/R4p1k/6p1/7p/8/7P/2q2PP1/6K1 b - - 0 1',
      prompt:
        'Les Noirs ont une tour de moins et les Blancs menacent Dxf7+ ou Txf7+. Trouve la seule façon de sauver la partie.',
      solution: ['c2c1', 'g1h2', 'c1f4', 'h2g1', 'f4c1'],
      explanation:
        '**1…Dc1+! 2.Rh2 Df4+ 3.Rg1 Dc1+** : échec perpétuel. Si 3.g3, 3…Dxf2+ et les échecs continuent. Le roi blanc ne peut pas s’échapper : la dame noire oscille entre c1 et f4. Tout autre coup (1…Df5? par exemple) perd sur 2.Txf7+ et le mat arrive. En défense, quand le roi adverse est découvert, regarde les échecs **avant** de défendre.',
    },
    {
      title: 'Viser la forteresse',
      fen: '8/3k4/8/7P/4K3/3B4/8/8 b - - 0 1',
      prompt:
        'Fou de cases blanches et pion h : si le roi noir atteint h8, c’est nul. Les Noirs jouent : quel chemin prendre ?',
      solution: ['d7e7', 'h5h6', 'e7f7'],
      acceptAlso: ['d7e6'],
      explanation:
        '**1…Re7!** (ou 1…Re6) : le roi file vers f7–g8–h8. Après 2.h6 Rf7 3.h7 Rg7 le roi atteint le coin à temps. Toute autre direction perd : 1…Rd6? 2.h6 et le pion est trop rapide, 1…Re8? 2.Fc4! empêche le roi d’atteindre f7–g8 par le chemin le plus court. Compter les coups jusqu’à la forteresse avant de jouer : c’est la défense.',
    },
  ],
};

export default defense;
