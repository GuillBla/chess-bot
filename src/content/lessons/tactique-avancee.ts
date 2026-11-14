import type { Lesson } from './types';

const tactiqueAvancee: Lesson = {
  id: 'tactique-avancee',
  title: 'Tactique avancée : déviation, surcharge, coup intermédiaire…',
  level: '1200-1500',
  summary:
    'Au-delà de la fourchette et du clouage : les motifs qui créent les combinaisons — déviation, attraction, surcharge, interception, désespérado, coup intermédiaire, rayons X.',
  sections: [
    {
      type: 'text',
      title: 'Les motifs de « deuxième niveau »',
      paragraphs: [
        'Fourchettes, clouages et enfilades sont les **armes** ; les motifs de cette leçon sont les **moyens de les rendre possibles**. Une combinaison typique : une pièce adverse a une fonction défensive (garder une case, une pièce, une rangée) ; on la **dévie** de cette fonction, ou on l’**attire** sur une case fatale, et la fourchette ou le mat apparaissent.',
        '**Déviation** : forcer une pièce à quitter une case ou une ligne qu’elle défend (souvent par un sacrifice qu’elle « doit » prendre). **Attraction** : forcer une pièce — très souvent le roi — à venir sur une case où elle subit un échec double, une fourchette ou un mat. **Surcharge** : une pièce défend deux choses à la fois ; on attaque l’une, elle ne peut plus défendre l’autre. Question à te poser dans chaque position : *quelles pièces adverses ont un travail, et combien de travaux font-elles ?*',
        '**Interception (interférence)** : placer une pièce sur la ligne entre une pièce défensive et ce qu’elle protège, coupant la liaison. **Rayons X** : une pièce agit « à travers » une autre — une tour derrière sa dame sur une colonne contrôle aussi la case derrière la pièce adverse, ou défend une case malgré l’intrusion d’une pièce ennemie. **Désespérado** : une pièce perdue de toute façon se vend le plus cher possible (elle prend quelque chose ou donne échec avant de mourir).',
        '**Coup intermédiaire (Zwischenzug)** : au lieu de la reprise « obligatoire », on insère un échec ou une menace plus forte, puis on reprend. C’est la cause n° 1 des calculs ratés : quand tu calcules un échange, vérifie toujours si l’adversaire — ou toi — dispose d’un échec ou d’une menace avant de reprendre.',
      ],
    },
    {
      type: 'position',
      title: 'Le « truc de la fourchette » et l’idée de désespérado',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R b KQkq - 5 4',
      caption:
        'Partie italienne, les Noirs jouent. 4…Cxe4 a l’air de laisser une pièce, mais c’est un pseudo-sacrifice : la fourchette de pion …d5 rendra la pièce. Observe aussi le fou c4 : il sera attaqué par …d5 de toute façon.',
      arrows: [
        { from: 'f6', to: 'e4', kind: 'idea' },
        { from: 'd7', to: 'd5', kind: 'idea' },
      ],
      moves: [
        { uci: 'f6e4', comment: '4…Cxe4! : la pièce semble perdue.' },
        {
          uci: 'c3e4',
          comment:
            '5.Cxe4. (Les Blancs peuvent aussi jouer 5.Fxf7+!? Rxf7 6.Cxe4 : c’est l’idée du désespérado — le fou, qui va être attaqué par …d5, prend un pion avec échec avant de disparaître.)',
        },
        { uci: 'd7d5', comment: '5…d5! : fourchette du fou c4 et du cavalier e4. Les Noirs récupèrent leur pièce.' },
        { uci: 'c4d3', comment: '6.Fd3 : le fou se met à l’abri et défend le cavalier…' },
        { uci: 'd5e4', comment: '6…dxe4 : …mais le cavalier tombe quand même.' },
        { uci: 'd3e4', comment: '7.Fxe4 : matériel égal, et les Noirs ont un bon centre. Le « sacrifice » n’en était pas un.' },
      ],
    },
    {
      type: 'position',
      title: 'Morphy – duc de Brunswick et comte Isouard, Paris 1858',
      fen: '3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 3 13',
      caption:
        'Le cavalier d7 est cloué par le fou b5 sur le roi e8, et il n’est défendu que par la tour d8 et le cavalier f6. Morphy va éliminer les défenseurs un par un : chaque échange **dévie** une pièce noire de sa fonction.',
      arrows: [
        { from: 'b5', to: 'e8', kind: 'threat' },
        { from: 'd1', to: 'd7', kind: 'idea' },
      ],
      marks: [{ square: 'd7', kind: 'weak' }],
      moves: [
        { uci: 'd1d7', comment: '13.Txd7! : sacrifice de qualité ; la tour d8 doit reprendre.' },
        { uci: 'd8d7', comment: '13…Txd7 : la tour d7 est à son tour clouée.' },
        { uci: 'h1d1', comment: '14.Td1 : on attaque la pièce clouée avec une pièce de plus.' },
        { uci: 'e7e6', comment: '14…De6 : la dame débloque le fou f8 et défend d7.' },
        { uci: 'b5d7', comment: '15.Fxd7+ : on élimine la tour…' },
        { uci: 'f6d7', comment: '15…Cxd7 : …et le cavalier f6 est dévié en d7. Le dernier défenseur de d8 est ce cavalier. Exercice 1 : comment finir ?' },
      ],
    },
  ],
  exercises: [
    {
      title: 'Morphy, 16e coup',
      fen: '4kb1r/p2n1ppp/4q3/4p1B1/4P3/1Q6/PPP2PPP/2KR4 w k - 0 16',
      prompt: 'Seul le cavalier d7 empêche Td8#. Dévie-le.',
      solution: ['b3b8', 'd7b8', 'd1d8'],
      explanation:
        '**16.Db8+!!** : la dame s’offre sur la seule case d’où elle attaque le roi et que le cavalier d7 est obligé de couvrir. **16…Cxb8** (forcé) et **17.Td8#** : la tour, protégée par le fou g5, mate parce que le cavalier a été dévié. C’est le schéma type de la déviation : identifier *la* pièce qui défend la case critique, puis lui donner un travail plus urgent.',
    },
    {
      title: 'Le piège de l’éléphant (Gambit dame)',
      fen: 'r1bBkb1r/pppn1ppp/8/3n4/3P4/8/PP2PPPP/R2QKBNR b KQkq - 0 7',
      prompt:
        'Les Blancs ont cru gagner un pion par 6.Cxd5? Cxd5 7.Fxd8 : ils viennent de prendre ta dame. Reprendre en d8 serait le réflexe… Cherche mieux.',
      solution: ['f8b4', 'd1d2', 'b4d2', 'e1d2', 'e8d8'],
      explanation:
        '**7…Fb4+!** : le coup intermédiaire. Avant de reprendre le fou d8, les Noirs donnent échec ; la seule parade raisonnable est **8.Dd2**, et **8…Fxd2+ 9.Rxd2 Rxd8** : les Noirs ont gagné une pièce. Le réflexe 7…Rxd8? laisserait les Blancs avec dame et pion contre deux pièces mineures. Morale : avant toute reprise, cherche un échec ou une menace qui améliore l’échange.',
    },
    {
      title: 'Steinitz – von Bardeleben, Hastings 1895',
      fen: 'r1r1k3/pp1qn2p/5pp1/3p2N1/6Q1/8/PP3PPP/2R1R1K1 w - - 2 22',
      prompt:
        'Tes deux tours et ta dame sont en prise ou presque, le roi noir est au centre. Trouve le coup qui exploite la surcharge de la défense noire.',
      solution: ['e1e7', 'd7e7', 'c1c8', 'a8c8', 'g4c8'],
      explanation:
        '**22.Txe7+!** : la tour n’a pas le droit d’être prise. La dame d7 défend à la fois e7 et c8 — elle est **surchargée** : 22…Dxe7 23.Txc8+ Txc8 24.Dxc8+ et les Blancs gagnent une tour. Et 22…Rxe7 ne sauve rien : 23.Te1+ et l’attaque continue contre le roi exposé. Dans la partie, von Bardeleben joua 22…Rf8 et quitta la salle après **23.Tf7+! Rg8 24.Tg7+! Rh8 25.Txh7+** : la tour « enragée » donne échec sur échec, et la prendre perdrait la dame d7 ou mènerait au mat. Le coup tentant 22.Txc8+? échange une paire de tours et laisse le roi noir respirer.',
    },
  ],
};

export default tactiqueAvancee;
