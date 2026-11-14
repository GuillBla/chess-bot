import type { Lesson } from './types';

const finalesTours: Lesson = {
  id: 'finales-tours',
  title: 'Finales de tours : Lucena, Philidor, activité',
  level: '1500-1800',
  summary:
    'Les deux positions à connaître par cœur (Lucena et Philidor), la tour derrière le pion passé, le roi coupé et la règle d’or : une tour active vaut souvent un pion.',
  sections: [
    {
      type: 'text',
      title: 'Les principes (Tarrasch, Capablanca, Dvoretsky)',
      paragraphs: [
        '« Toutes les finales de tours sont nulles » : la boutade cache une réalité — le camp qui défend tient souvent s’il connaît deux ou trois positions de référence. Celui qui attaque gagne s’il sait **construire le pont** (Lucena). Celui qui défend annule s’il connaît **la défense de la troisième rangée** (Philidor).',
        '**Règle de Tarrasch** : la tour se place **derrière les pions passés** — derrière le sien pour le pousser (la tour gagne de l’activité à chaque avance), derrière celui de l’adversaire pour le freiner (la tour devant le pion devient passive à mesure qu’il avance).',
        '**Le roi coupé** : une tour qui coupe le roi adverse d’une ou plusieurs colonnes du pion vaut souvent un pion entier. En finale tour + pion contre tour, si le roi défenseur est coupé de deux colonnes, le gain est généralement simple.',
        '**L’activité avant tout** : une tour qui attaque des pions, coupe le roi ou donne des échecs de loin vaut bien plus qu’une tour qui défend passivement. Dans le doute, sacrifie un pion pour activer ta tour plutôt que de garder un pion avec une tour passive.',
      ],
    },
    {
      type: 'position',
      title: 'Position de Lucena : construire le pont',
      fen: '3K4/3P2k1/8/8/8/8/2r5/5R2 w - - 0 1',
      caption:
        'Le roi blanc est devant son pion en 7e, le roi noir est coupé sur l’aile roi par la tour f1, la tour noire empêche le roi blanc de sortir par la colonne c. Gain blanc, à condition de savoir « construire le pont » : la tour vient en 4e rangée pour bloquer les échecs.',
      arrows: [{ from: 'f1', to: 'f4', kind: 'good' }],
      marks: [{ square: 'd7', kind: 'strong' }],
      moves: [
        { uci: 'f1f4', comment: '1.Tf4! : la tour se place sur la 4e rangée. Elle servira de bouclier.' },
        { uci: 'c2c1', comment: '1…Tc1 : les Noirs attendent.' },
        { uci: 'd8e7', comment: '2.Re7 : le roi sort du côté de la tour.' },
        { uci: 'c1e1', comment: '2…Te1+ : les échecs commencent.' },
        { uci: 'e7d6', comment: '3.Rd6 Td1+.' },
        { uci: 'e1d1', comment: '3…Td1+.' },
        { uci: 'd6e6', comment: '4.Re6 Te1+.' },
        { uci: 'd1e1', comment: '4…Te1+.' },
        { uci: 'e6d5', comment: '5.Rd5 : le roi s’approche de sa tour…' },
        { uci: 'e1d1', comment: '5…Td1+.' },
        { uci: 'f4d4', comment: '6.Td4 : le pont est construit. Plus d’échec, le pion va à dame.' },
      ],
    },
    {
      type: 'position',
      title: 'Position de Philidor : la défense de la 3e rangée',
      fen: '4k3/R7/1r6/3KP3/8/8/8/8 w - - 0 1',
      caption:
        'Le roi noir est devant le pion, la tour noire tient la 6e rangée (la 3e rangée vue des Noirs) : le roi blanc ne peut pas avancer en d6 ou f6 sans échec. Nulle théorique. Quand le pion avance en e6, il prive son propre roi d’abri : la tour noire file alors en 1re rangée et donne des échecs par derrière.',
      arrows: [{ from: 'b6', to: 'h6', kind: 'good' }],
      moves: [
        { uci: 'e5e6', comment: '1.e6 : seul moyen de progresser, mais le roi blanc perd l’abri de la case e6.' },
        { uci: 'b6b1', comment: '1…Tb1! : la tour part au loin, pour donner des échecs verticaux.' },
        { uci: 'd5d6', comment: '2.Rd6 Td1+.' },
        { uci: 'b1d1', comment: '2…Td1+ : le roi blanc n’a aucun abri.' },
        { uci: 'd6e5', comment: '3.Re5 Te1+.' },
        { uci: 'd1e1', comment: '3…Te1+ : les échecs ne s’arrêtent pas, nulle.' },
      ],
    },
  ],
  exercises: [
    {
      title: 'Le truc de l’enfilade',
      fen: 'R7/P4k2/8/8/8/6K1/r7/8 w - - 0 1',
      prompt:
        'Tour et pion a contre tour : en général c’est nul si la tour noire reste derrière le pion. Mais ici le roi noir est mal placé. Les Blancs jouent et gagnent.',
      solution: ['a8h8'],
      explanation:
        '**1.Th8!** : la tour libère la case a8 avec une menace d’enfilade. Si 1…Txa7, **2.Th7+** gagne la tour a7 par enfilade (le roi est sur la 7e rangée). Si 1…Rf6 ou 1…Rg7, le pion va à dame : 2.a8=D Txa8 3.Txa8 (ou d’abord un échec de la tour h8) et les Blancs restent avec une tour de plus. Le défenseur doit garder son roi en g7 ou h7, cases d’où il contrôle h7/h8 : avec le roi en f7, la position est perdue. Les coups de roi (1.Rf3?) laissent le roi noir revenir en g7 : nulle.',
    },
    {
      title: 'Lucena : la dernière étape',
      fen: '8/3P2k1/8/3K4/5R2/8/8/3r4 w - - 0 1',
      prompt: 'Les Noirs viennent de donner échec en d1. Termine la construction du pont.',
      solution: ['f4d4', 'd1d4', 'd5d4'],
      explanation:
        '**1.Td4!** : la tour de la 4e rangée s’interpose et met fin aux échecs. Après 1…Txd4+ 2.Rxd4, le pion va à dame ; sinon d8=D tout de suite. Fuir les échecs avec le roi (1.Re6 ou 1.Rc6) ne perd pas forcément, mais laisse les Noirs continuer leurs échecs : le pont sert précisément à s’en débarrasser.',
    },
    {
      title: 'Punir la défense passive',
      fen: '1r2k3/7R/4P3/4K3/8/8/8/8 w - - 0 1',
      prompt:
        'Les Noirs ont mis leur tour en 8e rangée au lieu de la 3e (6e) rangée de Philidor. Les Blancs jouent et gagnent.',
      solution: ['e5f6', 'e8d8', 'h7h8', 'd8c7', 'h8b8'],
      explanation:
        '**1.Rf6!** : le roi entre en f6, ce que la tour noire aurait interdit depuis la 6e rangée. Le roi blanc contrôle e7, f7 et g7, et menace Th8+. Après **1…Rd8 2.Th8+ Rc7 3.Txb8 Rxb8 4.e7** le pion va à dame. C’est exactement pour cela que la tour du défenseur doit tenir la 3e rangée tant que le pion n’a pas avancé. 1.Th8+ Re7 garde un avantage, mais le roi noir sort de sa prison et le gain devient bien plus difficile.',
    },
  ],
};

export default finalesTours;
