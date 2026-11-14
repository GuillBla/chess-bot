import type { Lesson } from './types';

const calcul: Lesson = {
  id: 'calcul',
  title: 'Calcul : coups candidats, coups forcés, visualisation',
  level: '1200-1500',
  summary:
    'Une méthode pour calculer juste : lister les candidats, commencer par les échecs, prises et menaces, suivre les lignes forcées jusqu’au bout — sans oublier le coup tranquille.',
  sections: [
    {
      type: 'text',
      title: 'Pourquoi on calcule mal',
      paragraphs: [
        'À 1200–1500, la plupart des erreurs de calcul ne viennent pas d’un manque de profondeur mais d’un **manque de largeur** : on tombe amoureux du premier coup qui vient à l’esprit, on le calcule sur cinq coups… et on n’a jamais regardé la réponse adverse qui le réfute. Kotov l’a formalisé dans *Pensez comme un grand maître* : avant de calculer quoi que ce soit, **dresse la liste des coups candidats**, puis examine chacun une seule fois, méthodiquement, au lieu de sauter d’une branche à l’autre.',
        'Pour trouver les candidats, utilise le filtre **échecs – prises – menaces** (en anglais *checks, captures, threats*), dans cet ordre, pour **les deux camps**. Les coups forcés réduisent l’arbre : après un échec, l’adversaire n’a souvent que deux ou trois réponses ; après une prise, il doit généralement reprendre. C’est pour cela que les combinaisons sont calculables même à six ou huit demi-coups de profondeur alors qu’une manœuvre lente ne l’est pas.',
        'Deuxième règle : **va jusqu’au bout de la ligne et évalue la position finale**, pas un coup avant. « Je gagne la dame » ne suffit pas si, au coup suivant, l’adversaire fait mat ou reprend tout. Arrête-toi seulement sur une position *calme* (plus de prise ni d’échec intéressant) et pose-toi la question : qui est mieux, et pourquoi ?',
      ],
    },
    {
      type: 'text',
      title: 'Le coup tranquille et la ressource cachée',
      paragraphs: [
        'Le piège le plus fréquent du calcul est le **coup tranquille oublié** : dans une suite de coups forcés, un coup qui ne donne pas échec et ne prend rien — mais qui crée une menace imparable, ou qui pare tout. On l’oublie parce que notre filtre « échecs-prises » ne le voit pas. Après avoir calculé la ligne forcée, demande-toi toujours : *et si l’adversaire ne reprend pas, mais joue un coup calme ?* — et symétriquement : *ai-je un coup calme qui menace mat ?*',
        'La **visualisation** se travaille : calcule les lignes en gardant la position finale en tête sans bouger les pièces, puis vérifie sur l’échiquier. Les exercices de cette leçon sont choisis pour cela : rejoue-les plusieurs fois les yeux fermés.',
      ],
    },
    {
      type: 'position',
      title: 'Étude de Saavedra (1895) : le défenseur a aussi des ressources',
      fen: '8/8/1KP5/3r4/8/8/8/k7 w - - 0 1',
      caption:
        'Les Blancs jouent et gagnent. 1.c7 semble décisif, mais la tour noire a deux ressources : des échecs en série, puis un piège de pat. Suis la ligne coup par coup et cherche, à chaque étape, ce que veut la défense.',
      arrows: [{ from: 'c6', to: 'c7', kind: 'good' }],
      moves: [
        { uci: 'c6c7', comment: '1.c7 : le pion menace de promouvoir. Les Noirs n’ont qu’une idée : harceler le roi blanc.' },
        { uci: 'd5d6', comment: '1…Td6+ : coup forcé, sinon c8=D gagne.' },
        { uci: 'b6b5', comment: '2.Rb5 : le roi s’approche de la tour pour épuiser les échecs, tout en restant près du pion.' },
        { uci: 'd6d5', comment: '2…Td5+ : les échecs continuent.' },
        { uci: 'b5b4', comment: '3.Rb4 : le roi descend vers la tour pour mettre fin aux échecs.' },
        { uci: 'd5d4', comment: '3…Td4+.' },
        { uci: 'b4b3', comment: '4.Rb3 Td3+…' },
        { uci: 'd4d3', comment: '4…Td3+.' },
        { uci: 'b3c2', comment: '5.Rc2 : maintenant que la tour n’a plus d’échec, on pense que c’est fini…' },
        {
          uci: 'd3d4',
          comment:
            '5…Td4 ! Le coup tranquille de la défense : si 6.c8=D?, 6…Tc4+! 7.Dxc4 et c’est pat (le roi noir en a1 n’a plus de case). À toi de trouver la réfutation dans l’exercice 1.',
        },
      ],
    },
    {
      type: 'position',
      title: 'Rotlewi – Rubinstein, Łódź 1907 : une ligne forcée de bout en bout',
      fen: '2rr2k1/1b3ppp/pb2p3/1p2P3/1P2BPnq/P1N3P1/1B2Q2P/R4R1K b - - 0 22',
      caption:
        'Les Blancs viennent de jouer 22.g3 en attaquant la dame noire. Rubinstein ne la déplace pas : il a calculé une suite où presque chaque coup est un échec, une prise ou une menace de mat. Repère les lignes : la grande diagonale a8–h1 (fou b7, roi h1), la diagonale b6–g1 et la case h2.',
      arrows: [
        { from: 'b7', to: 'h1', kind: 'threat' },
        { from: 'b6', to: 'g1', kind: 'threat' },
      ],
      marks: [{ square: 'h2', kind: 'target' }],
      moves: [
        { uci: 'c8c3', comment: '22…Txc3!! : la tour élimine le cavalier qui couvrait e4 et d5, et dévie le fou b2.' },
        { uci: 'g3h4', comment: '23.gxh4 : les Blancs prennent la dame (23.Fxb7 Txg3! est aussi désespéré).' },
        { uci: 'd8d2', comment: '23…Td2!! : la tour s’offre à la dame et coupe la défense de la deuxième rangée. La menace est 24…Fxe4+.' },
        { uci: 'e2d2', comment: '24.Dxd2 : la dame blanche est déviée de la deuxième rangée et de la diagonale h1–a8.' },
        { uci: 'b7e4', comment: '24…Fxe4+ : la grande diagonale s’ouvre avec échec.' },
        { uci: 'd2g2', comment: '25.Dg2 : seule interposition.' },
        { uci: 'c3h3', comment: '25…Th3 ! Le coup tranquille final : la menace Txh2# est imparable. Les Blancs abandonnent.' },
      ],
    },
  ],
  exercises: [
    {
      title: 'Saavedra : la fin de l’étude',
      fen: '8/2P5/8/8/3r4/8/2K5/k7 w - - 0 6',
      prompt:
        'La position de l’étude de Saavedra après 5…Td4!. 6.c8=D? Tc4+! 7.Dxc4 est pat. Comment les Blancs gagnent-ils ?',
      solution: ['c7c8r'],
      explanation:
        '**6.c8=T!** (sous-promotion en tour) : il n’y a plus de pat possible, et la tour menace Ta8#. La défense historique est 6…Ta4, mais **7.Rb3!** crée une double menace : Tc1# et Rxa4 (6…Td2+ 7.Rxd2 retarde seulement l’inévitable). La morale du calcul : quand la ligne « évidente » (c8=D) se heurte à une ressource adverse, ne t’arrête pas — cherche un autre coup dans la même idée. La dame était « trop forte » ; la tour suffit et ne pate pas.',
    },
    {
      title: 'Le coup tranquille',
      fen: 'q4rk1/p4p1p/5Bp1/8/8/8/PP1Q1PPP/6K1 w - - 0 1',
      prompt:
        'Les Noirs ont une qualité de plus. Aucun échec ni aucune prise ne donne rien… Trouve le coup calme qui décide.',
      solution: ['d2h6', 'a8g2', 'g1g2', 'g6g5', 'h6g7'],
      explanation:
        '**1.Dh6!** : la dame ne donne pas échec et ne prend rien, mais menace **Dg7#** (la case g7 est soutenue par le fou f6). Rien ne pare : la dame noire en a8 ne contrôle ni g7 ni f6, et la tour f8 ne peut pas quitter la case qui bloque son roi. Les Noirs ne peuvent que retarder (1…Dxg2+ 2.Rxg2) avant 3.Dg7#. Le piège : chercher un échec (Dd8? ou Dd4 sans menace directe) au lieu du coup calme qui crée une menace imparable.',
    },
    {
      title: 'Réti – Tartakower, Vienne 1910',
      fen: 'rnb1kb1r/pp3ppp/2p5/4q3/4n3/3Q4/PPPB1PPP/2KR1BNR w kq - 0 9',
      prompt:
        'Les Noirs viennent de prendre le cavalier e4. Leur roi est resté au centre, sur la colonne d ouverte. Applique échecs – prises – menaces.',
      solution: ['d3d8', 'e8d8', 'd2g5', 'd8c7', 'g5d8'],
      explanation:
        '**9.Dd8+!!** : le premier candidat de la liste des échecs, et le seul qui fonctionne. Le roi est **attiré** en d8 (9…Rxd8 est forcé). Puis **10.Fg5+**, échec **double** (fou g5 et tour d1) : le roi doit bouger. 10…Rc7 11.Fd8# ; et 10…Re8 11.Td8# . Le calcul est court parce que chaque coup est forcé. La prise « naturelle » 9.Dxe4?? perd la dame (le cavalier est défendu par la dame e5) : on a regardé les prises avant les échecs.',
    },
    {
      title: 'Rotlewi – Rubinstein, Łódź 1907',
      fen: '2rr2k1/1b3ppp/pb2p3/1p2P3/1P2BPnq/P1N3P1/1B2Q2P/R4R1K b - - 0 22',
      prompt: 'La dame noire est attaquée par le pion g3. Ne la déplace pas : calcule.',
      solution: ['c8c3'],
      explanation:
        '**22…Txc3!!** : la tour supprime le cavalier qui défendait e4, ouvre la colonne c et dévie le fou b2. Après **23.gxh4 Td2!!** (menace Fxe4+) **24.Dxd2 Fxe4+ 25.Dg2 Th3!** le mat en h2 est imparable. Si les Blancs refusent la dame par 23.Fxb7, 23…Txg3! et l’attaque continue avec un matériel écrasant. Le repli de la dame (22…De7) garde un avantage, mais n’a rien de forcé : Txc3 décide immédiatement parce que chaque coup suivant est un échec, une prise ou une menace de mat.',
    },
  ],
};

export default calcul;
