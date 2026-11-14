import type { Lesson } from './types';

const finalesPions: Lesson = {
  id: 'finales-pions',
  title: 'Finales de pions : opposition, triangulation, percée',
  level: '1200-1500',
  summary:
    'Les finales de pions se calculent : cases clés, opposition directe et à distance, triangulation, règle du carré, pion passé éloigné et percée.',
  sections: [
    {
      type: 'text',
      title: 'Cases clés et opposition',
      paragraphs: [
        'Dans une finale roi + pion contre roi, ce n’est pas le pion qui compte mais **le roi qui l’escorte**. Chaque pion a des **cases clés** : si le roi attaquant les occupe, il gagne quel que soit le trait. Pour un pion qui n’a pas dépassé sa 4e rangée, ce sont les trois cases situées **deux rangées devant lui** (pion e4 → d6, e6, f6) ; une fois le pion en 5e rangée, s’ajoutent les cases juste devant (pion e5 → d6, e6, f6 et d7, e7, f7). Exception : le pion-tour, presque toujours nul si le roi défenseur atteint le coin.',
        'L’**opposition** est l’arme du défenseur pour interdire ces cases : les rois face à face, une case entre eux, **celui qui n’a pas le trait a l’opposition**. Le roi qui doit bouger cède du terrain. L’**opposition à distance** (trois ou cinq cases entre les rois, sur la même colonne ou rangée) obéit à la même règle et permet de « préparer » l’opposition de loin.',
        'Quand on ne peut pas prendre l’opposition directement, on **perd un temps** : c’est la **triangulation**. Le roi qui dispose de plus d’espace décrit un triangle de trois cases pendant que l’adversaire, coincé, ne peut faire qu’un aller-retour ; on revient à la même position… avec l’adversaire au trait.',
      ],
    },
    {
      type: 'position',
      title: 'Opposition : le trait décide',
      fen: '8/3k4/8/3K4/3P4/8/8/8 w - - 0 1',
      caption:
        'Avec les Blancs au trait, c’est **nul** : les Noirs ont l’opposition (rois face à face, Blancs obligés de bouger). Avec les Noirs au trait, les Blancs gagneraient (1…Rc7 2.Re6 ou 1…Re7 2.Rc6 occupe une case clé). Voici comment les Noirs annulent si les Blancs jouent.',
      marks: [
        { square: 'c6', kind: 'target' },
        { square: 'd6', kind: 'target' },
        { square: 'e6', kind: 'target' },
      ],
      moves: [
        { uci: 'd5c5', comment: '1.Rc5 : les Blancs essaient de contourner.' },
        { uci: 'd7c7', comment: '1…Rc7! : le roi noir reprend l’opposition (face à face, Blancs au trait).' },
        { uci: 'd4d5', comment: '2.d5 : le pion avance, ses cases clés aussi.' },
        { uci: 'c7d7', comment: '2…Rd7 : le roi se place devant le pion.' },
        { uci: 'd5d6', comment: '3.d6 Rd8! — le bon retrait, droit vers l’arrière.' },
        { uci: 'd7d8', comment: '3…Rd8.' },
        { uci: 'c5c6', comment: '4.Rc6.' },
        { uci: 'd8c8', comment: '4…Rc8! : de nouveau l’opposition.' },
        { uci: 'd6d7', comment: '5.d7+ Rd8.' },
        { uci: 'c8d8', comment: '5…Rd8.' },
        { uci: 'c6d6', comment: '6.Rd6 : pat. Le défenseur qui connaît l’opposition annule sans effort.' },
      ],
    },
    {
      type: 'position',
      title: 'La règle du carré',
      fen: '7k/8/8/p7/5K2/8/8/8 w - - 0 1',
      caption:
        'Trace le carré du pion a5 : a5–e5–e1–a1. Si le roi peut entrer dans ce carré au coup suivant, il rattrape le pion. Ici Re4, Re5 ou Re3 y entrent : c’est nul. Avec le roi en g4, il serait trop tard.',
      marks: [
        { square: 'a5', kind: 'weak' },
        { square: 'e5', kind: 'target' },
        { square: 'e1', kind: 'target' },
        { square: 'a1', kind: 'target' },
      ],
      moves: [
        { uci: 'f4e4', comment: '1.Re4 : le roi entre dans le carré.' },
        { uci: 'a5a4', comment: '1…a4 : le carré se réduit (a4–d4–d1–a1)…' },
        { uci: 'e4d3', comment: '2.Rd3 : …et le roi y reste.' },
        { uci: 'a4a3', comment: '2…a3.' },
        { uci: 'd3c2', comment: '3.Rc2.' },
        { uci: 'a3a2', comment: '3…a2.' },
        { uci: 'c2b2', comment: '4.Rb2 : le pion tombe.' },
      ],
    },
    {
      type: 'position',
      title: 'Le pion passé éloigné',
      fen: '8/8/3k2p1/P6p/3K3P/6P1/8/8 w - - 0 1',
      caption:
        'Matériel égal, mais le pion a5 est un **pion passé éloigné** : il va détourner le roi noir vers l’aile dame pendant que le roi blanc dévore l’aile roi. C’est la raison n° 1 pour laquelle on échange les pièces quand on a un pion passé éloigné.',
      arrows: [
        { from: 'a5', to: 'a8', kind: 'idea' },
        { from: 'd4', to: 'g6', kind: 'good' },
      ],
      moves: [
        { uci: 'a5a6', comment: '1.a6 : le pion avance, le roi noir doit le suivre.' },
        { uci: 'd6c7', comment: '1…Rc7.' },
        { uci: 'd4e5', comment: '2.Re5 : le roi blanc part dans l’autre sens.' },
        { uci: 'c7b6', comment: '2…Rb6.' },
        { uci: 'e5f6', comment: '3.Rf6 Rxa6 : le pion a rempli sa mission.' },
        { uci: 'b6a6', comment: '3…Rxa6.' },
        { uci: 'f6g6', comment: '4.Rxg6.' },
        { uci: 'a6b5', comment: '4…Rb5.' },
        { uci: 'g6h5', comment: '5.Rxh5 : les deux pions blancs restants gagnent facilement.' },
      ],
    },
  ],
  exercises: [
    {
      title: 'Prendre l’opposition',
      fen: '4k3/8/8/4K3/4P3/8/8/8 b - - 0 1',
      prompt: 'Les Noirs jouent et font nulle. Un seul coup du roi tient.',
      solution: ['e8e7', 'e5d5', 'e7d7'],
      explanation:
        '**1…Re7!** prend l’opposition : les rois se font face, une case entre eux, et ce sont les Blancs qui doivent céder. Après **2.Rd5 Rd7!** les Noirs gardent l’opposition à chaque coup. Les autres coups perdent : 1…Rd7? 2.Rf6 et 1…Rf7? 2.Rd6 occupent une case clé du pion e4 (d6, e6, f6) ; le pion passe ensuite.',
    },
    {
      title: 'L’étude de Réti (1921)',
      fen: '7K/8/k1P5/7p/8/8/8/8 w - - 0 1',
      prompt:
        'Le roi blanc est hors du carré du pion h5, et le pion c6 semble perdu. Les Blancs jouent et font nulle !',
      solution: ['h8g7', 'h5h4', 'g7f6'],
      explanation:
        '**1.Rg7!** et **2.Rf6!** : le roi avance en diagonale, ce qui le rapproche **à la fois** du pion h et de son propre pion c6 (une diagonale est aussi longue qu’une colonne). Après 1…h4 2.Rf6 h3 3.Re7 (ou Re6) h2 4.c7, le pion blanc va à dame en même temps : nulle. Et si 1…Rb6, 2.Rf6 h4 3.Re5! et le roi rentre dans le carré. Le coup tentant 1.c7? Rb7 perd le pion, et 1.Rh7? est simplement trop lent.',
    },
    {
      title: 'La percée',
      fen: '6k1/ppp5/8/PPP5/8/8/8/6K1 w - - 0 1',
      prompt: 'Trois pions contre trois, les rois sont loin. Les Blancs jouent et gagnent.',
      solution: ['b5b6', 'a7b6', 'c5c6', 'b7c6', 'a5a6'],
      explanation:
        '**1.b6!** : la percée classique. Si 1…axb6 2.c6! bxc6 3.a6 et le pion a va à dame ; si 1…cxb6 2.a6! bxa6 3.c6. Dans les deux cas le roi noir, en g8, est hors du carré. Le schéma fonctionne parce que le pion central (b) se sacrifie pour **dévier** un pion, et l’autre pion latéral se faufile. Les coups de roi (1.Rf2?) laissent les Noirs jouer …b6 et bloquer l’aile.',
    },
  ],
};

export default finalesPions;
