import type { Lesson } from './types';

const bonnesMauvaisesPieces: Lesson = {
  id: 'bonnes-mauvaises-pieces',
  title: 'Bonnes et mauvaises pièces, avant-postes',
  level: '1200-1500',
  summary:
    'Bon et mauvais fou, avant-postes, cavalier contre fou, pièces sans avenir : une pièce vaut ce qu’elle fait, pas ce que dit la table des valeurs.',
  sections: [
    {
      type: 'text',
      title: 'Une pièce vaut ce qu’elle fait',
      paragraphs: [
        'La table « cavalier = fou = 3 » est une moyenne. Silman le résume : **un fou est bon ou mauvais selon ses propres pions**. Un fou dont les pions centraux fixes sont sur des cases de sa couleur est **mauvais** : il bute contre eux et ne peut attaquer les pions adverses, placés sur l’autre couleur. Le fou c8 de la Française (pions e6–d5) en est l’exemple type. Un mauvais fou peut être *actif* (s’il est sorti devant sa chaîne) — mais en finale, il est souvent une condamnation.',
        'Un **avant-poste** est une case dans le camp adverse qu’**aucun pion adverse ne peut plus attaquer**, idéalement soutenue par un de tes pions. Un cavalier y vaut souvent une tour : il frappe huit cases au cœur de la position. Repérer un avant-poste, c’est regarder les **trous** (cases que les pions adverses ont cessé de contrôler en avançant) : la case d5 dans la Sicilienne après …e5, la case e6 quand les pions noirs d et f ont disparu.',
        '**Cavalier contre fou** : le cavalier aime les positions fermées, les pions des deux côtés de la même aile et les avant-postes ; le fou aime les positions ouvertes et les pions sur les deux ailes (il agit à distance). Avec un mauvais fou en face, un bon cavalier est presque toujours supérieur.',
        '**Échanger la bonne pièce** : avant chaque échange, demande-toi *quelle pièce reste sur l’échiquier*. Échange ton mauvais fou contre le bon fou adverse, échange le défenseur clé de l’adversaire, garde la pièce qui contrôle l’avant-poste. Inversement, une pièce sans case (au bord, enfermée derrière ses pions) peut même être capturée : c’est l’ultime stade de la « mauvaise pièce ».',
      ],
    },
    {
      type: 'position',
      title: 'Le mauvais fou de la Française',
      fen: 'r1b1kbnr/pp3ppp/1qn1p3/2ppP3/3P4/2P2N2/PP3PPP/RNBQKB1R w KQkq - 3 6',
      caption:
        'Les pions noirs e6 et d5 sont sur cases blanches : le fou c8 n’a aucune diagonale. Les Noirs essaieront de l’échanger (…Fd7–b5 contre le fou f1) ou de l’activer après …f6. Les Blancs, eux, gardent volontiers leur fou f1 : c’est leur « bon » fou, face au mauvais fou noir.',
      marks: [
        { square: 'c8', kind: 'weak' },
        { square: 'e6', kind: 'weak' },
        { square: 'd5', kind: 'weak' },
      ],
      arrows: [{ from: 'c8', to: 'b5', kind: 'idea' }],
    },
    {
      type: 'position',
      title: 'La case d5 dans la Najdorf',
      fen: 'rn1q1rk1/1p3ppp/p2pbb2/4p3/4P3/1NN5/PPP1BPPP/R2Q1RK1 w - - 0 11',
      caption:
        'Après 10.Fxf6 Fxf6, les Blancs ont échangé leur fou de cases noires contre le cavalier qui défendait d5. La case d5 est un trou (plus aucun pion noir ne peut l’attaquer) et le fou f6 noir est gêné par son propre pion e5. En échange, les Noirs ont la paire de fous : Stockfish juge la position équilibrée. La lutte tourne autour de d5.',
      arrows: [{ from: 'c3', to: 'd5', kind: 'good' }],
      marks: [
        { square: 'd5', kind: 'strong' },
        { square: 'd6', kind: 'weak' },
      ],
      moves: [
        { uci: 'c3d5', comment: '11.Cd5 : le cavalier occupe l’avant-poste.' },
        { uci: 'e6d5', comment: '11…Fxd5 : les Noirs doivent souvent céder leur bon fou pour l’éliminer…' },
        { uci: 'd1d5', comment: '12.Dxd5 : …et il reste aux Noirs le fou f6, gêné par ses pions, contre le fou e2 qui pourra aller en c4.' },
      ],
    },
  ],
  exercises: [
    {
      title: 'L’avant-poste e6',
      fen: 'r2q1rk1/pb4pp/1p1p4/3P1pN1/8/8/PPP2PPP/R2QR1K1 w - - 0 1',
      prompt:
        'Les pions noirs d et f ont avancé ou disparu : la case e6 est un trou, soutenu par le pion d5. Occupe-le au bon moment.',
      solution: ['g5e6', 'd8f6', 'e6f8', 'a8f8'],
      acceptAlso: ['d1h5'],
      explanation:
        '**1.Ce6!** : le cavalier s’installe sur l’avant-poste avec gain de temps — il attaque la dame d8 et la tour f8. Aucun pion noir ne peut le chasser, et le fou b7 est bloqué par d5. Après 1…Df6 2.Cxf8 Txf8, les Blancs ont gagné la qualité. **1.Dh5** (menace sur h7) est aussi très fort : après 1…h6 2.Ce6, le cavalier arrive quand même sur e6.',
    },
    {
      title: 'Cavalier contre mauvais fou',
      fen: '2b5/4kp2/p3p3/1p1pP1p1/1P1P1P2/P1N1K3/8/8 w - - 0 1',
      prompt:
        'Les pions noirs a6, b5, d5, e6 sont sur cases blanches : le fou c8 est mauvais. Comment les Blancs ouvrent-ils la porte à leur roi et leur cavalier ?',
      solution: ['f4g5'],
      explanation:
        '**1.fxg5!** : les Blancs obtiennent les cases f4 et g4 pour leurs pièces, et le pion g5 fixe l’aile roi noire. Le cavalier va en f4 (via e2) viser e6 et d5, le roi suit par f3–g4–h5, et le fou c8 ne peut défendre aucun pion noir : tous sont sur sa couleur… et c’est lui qui doit les protéger. Le coup tentant 1.Rf3? gxf4 2.Rxf4 f6! permet aux Noirs d’échanger le pion e5 et de libérer leur position : l’évaluation tombe presque à l’égalité.',
    },
    {
      title: 'L’Arche de Noé (partie espagnole)',
      fen: 'r1bqkbnr/2p2ppp/p2p4/1p6/3QP3/1B6/PPP2PPP/RNB1K2R b KQkq - 0 8',
      prompt:
        'Les Blancs viennent de reprendre en d4 avec la dame. Le fou b3 a l’air actif sur la diagonale a2–g8… mais combien de cases de retraite a-t-il ?',
      solution: ['c7c5', 'd4c3', 'c5c4'],
      explanation:
        '**8…c5!** chasse la dame (9.Dd5 Fe6 10.Dc6+ Fd7 ne sauve rien), puis **…c4** enferme le fou b3 derrière les pions a6–b5–c4 : il n’a plus aucune case et tombe. C’est le piège de « l’Arche de Noé ». Une pièce sans case de retraite est l’exemple extrême de la mauvaise pièce. Les Blancs auraient dû préparer une sortie au fou (c3 ou a4) avant de prendre en d4.',
    },
  ],
};

export default bonnesMauvaisesPieces;
