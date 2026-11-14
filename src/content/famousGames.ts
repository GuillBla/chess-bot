// Parties célèbres rejouées sur l'échiquier de l'accueil.
// Chaque partie est vérifiée par famousGames.test.ts (coups légaux, mat final, coups annotés,
// affirmations tactiques des commentaires).
import type { BoardArrow } from '../analysis/types';

export interface GameNote {
  /** Numéro du coup (1 = premier coup) et camp qui le joue. */
  move: number;
  side: 'w' | 'b';
  /** SAN attendu (anglais), pour garantir que la note est bien posée sur le bon coup. */
  san: string;
  /** Appréciation affichée après le coup : « !! », « ! »… */
  glyph?: '!!' | '!' | '!?';
  /** Phrase de commentaire (notation française). */
  text: string;
  /** Flèches montrées sur la position après ce coup. */
  arrows?: BoardArrow[];
}

export interface FamousGame {
  id: string;
  /** Nom court pour le sélecteur. */
  label: string;
  title: string;
  white: string;
  black: string;
  place: string;
  year: number;
  result: '1-0' | '0-1' | '1/2-1/2';
  /** Coups en SAN anglais (format chess.js). */
  moves: string[];
  /** Commentaire affiché avant le premier coup annoté. */
  intro: string;
  notes: GameNote[];
}

const split = (pgn: string) => pgn.replace(/\d+\./g, ' ').trim().split(/\s+/);

/** Texte de référence pour 16. Db8+ (réutilisé dans la bande « Ce qui rend ce site différent »). */
export const OPERA_KEY_TEXT =
  'La dame se sacrifie pour dévier le cavalier d7 : c’est la seule pièce qui ferme la colonne d. Après 16…Cxb8, forcé, la tour d1 entre en d8 et fait mat, protégée par le fou g5 qui couvre aussi e7.';

export const FAMOUS_GAMES: FamousGame[] = [
  {
    id: 'opera',
    label: 'Opéra, 1858',
    title: 'La partie de l’Opéra',
    white: 'Paul Morphy',
    black: 'Duc de Brunswick et comte Isouard',
    place: 'Opéra de Paris',
    year: 1858,
    result: '1-0',
    moves: split(
      '1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8#',
    ),
    intro: 'Paris, 1858 : pendant une représentation, Morphy affronte deux amateurs associés dans une loge de l’Opéra. Une leçon de développement en 17 coups.',
    notes: [
      { move: 3, side: 'b', san: 'Bg4', text: '3…Fg4 cloue le cavalier f3 contre la dame d1.', arrows: [{ from: 'g4', to: 'd1', kind: 'threat' }] },
      { move: 4, side: 'b', san: 'Bxf3', text: 'Sinon, 4…dxe5 5. Dxd8+ Rxd8 6. Cxe5 coûte un pion. Mais après l’échange, la dame blanche arrive en f3 sans perte de temps.' },
      {
        move: 6,
        side: 'w',
        san: 'Bc4',
        text: 'Le fou et la dame visent f7, le point faible du camp noir. Les Blancs ont deux pièces actives, les Noirs aucune.',
        arrows: [
          { from: 'c4', to: 'f7', kind: 'threat' },
          { from: 'f3', to: 'f7', kind: 'threat' },
        ],
      },
      { move: 6, side: 'b', san: 'Nf6', text: '6…Cf6 ferme la colonne f devant la dame blanche.' },
      {
        move: 7,
        side: 'w',
        san: 'Qb3',
        glyph: '!',
        text: 'Double menace : Fxf7+, avec la dame derrière le fou, et Dxb7.',
        arrows: [
          { from: 'c4', to: 'f7', kind: 'threat' },
          { from: 'b3', to: 'b7', kind: 'threat' },
        ],
      },
      { move: 7, side: 'b', san: 'Qe7', text: '7…De7 protège f7. Si 8. Dxb7, alors 8…Db4+ obtient l’échange des dames.' },
      { move: 8, side: 'w', san: 'Nc3', text: 'Morphy refuse le pion b7 : il développe, car chaque temps compte contre un roi resté au centre.' },
      { move: 9, side: 'w', san: 'Bg5', text: 'Le fou cloue le cavalier f6 contre la dame e7.', arrows: [{ from: 'g5', to: 'e7', kind: 'idea' }] },
      { move: 10, side: 'w', san: 'Nxb5', glyph: '!', text: 'Sacrifice du cavalier : Morphy ouvre les lignes vers le roi noir, toujours en e8.' },
      {
        move: 12,
        side: 'w',
        san: 'O-O-O',
        text: 'Grand roque avec gain de temps : la tour d1 attaque le cavalier d7, déjà cloué par le fou b5.',
        arrows: [
          { from: 'd1', to: 'd7', kind: 'threat' },
          { from: 'b5', to: 'e8', kind: 'idea' },
        ],
      },
      { move: 13, side: 'w', san: 'Rxd7', glyph: '!', text: 'Morphy rend la qualité pour éliminer un défenseur et garder l’initiative.' },
      { move: 14, side: 'w', san: 'Rd1', text: 'La seconde tour reprend la pression sur d7, toujours cloué par le fou b5.', arrows: [{ from: 'd1', to: 'd7', kind: 'threat' }] },
      { move: 15, side: 'b', san: 'Nxd7', text: 'Le cavalier reprend en d7 : il est désormais la seule pièce qui ferme la colonne d.' },
      {
        move: 16,
        side: 'w',
        san: 'Qb8+',
        glyph: '!!',
        text: OPERA_KEY_TEXT,
        arrows: [
          { from: 'b3', to: 'b8', kind: 'good' },
          { from: 'd1', to: 'd8', kind: 'idea' },
        ],
      },
      { move: 16, side: 'b', san: 'Nxb8', text: 'Forcé : c’est le seul coup légal.' },
      {
        move: 17,
        side: 'w',
        san: 'Rd8#',
        text: 'Mat. La tour est protégée par le fou g5 ; e7 est couverte, f7 et f8 sont occupées par les pièces noires.',
        arrows: [{ from: 'g5', to: 'd8', kind: 'good' }],
      },
    ],
  },
  {
    id: 'immortelle',
    label: 'L’Immortelle, 1851',
    title: 'L’Immortelle',
    white: 'Adolf Anderssen',
    black: 'Lionel Kieseritzky',
    place: 'Londres',
    year: 1851,
    result: '1-0',
    moves: split(
      '1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5 9.Nf5 c6 10.g4 Nf6 11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng8 15.Bxf4 Qf6 16.Nc3 Bc5 17.Nd5 Qxb2 18.Bd6 Bxg1 19.e5 Qxa1+ 20.Ke2 Na6 21.Nxg7+ Kd8 22.Qf6+ Nxf6 23.Be7#',
    ),
    intro: 'Londres, 1851, partie amicale jouée en marge du premier grand tournoi international. Anderssen va sacrifier presque toutes ses pièces.',
    notes: [
      { move: 3, side: 'b', san: 'Qh4+', text: 'Échec : le roi blanc doit bouger et perd le droit de roquer.', arrows: [{ from: 'h4', to: 'e1', kind: 'threat' }] },
      { move: 10, side: 'w', san: 'g4', text: 'Le pion chasse le cavalier h5. Le fou b5, attaqué par le pion c6, est abandonné.' },
      { move: 11, side: 'w', san: 'Rg1', text: 'Anderssen laisse le fou b5 et préfère gagner du temps contre la dame noire : h4 et h5 vont suivre.' },
      { move: 17, side: 'b', san: 'Qxb2', text: 'La dame noire prend b2 et vise la tour a1.', arrows: [{ from: 'b2', to: 'a1', kind: 'threat' }] },
      {
        move: 18,
        side: 'w',
        san: 'Bd6',
        glyph: '!!',
        text: 'Anderssen laisse ses deux tours en prise. Le fou d6 ôte au roi noir les cases e7 et f8.',
        arrows: [
          { from: 'd6', to: 'f8', kind: 'idea' },
          { from: 'c5', to: 'g1', kind: 'threat' },
        ],
      },
      { move: 19, side: 'w', san: 'e5', glyph: '!', text: 'Le pion coupe la grande diagonale : la dame b2 ne défend plus g7, que menace le cavalier f5.', arrows: [{ from: 'f5', to: 'g7', kind: 'threat' }] },
      { move: 19, side: 'b', san: 'Qxa1+', text: 'La seconde tour tombe, avec échec.' },
      {
        move: 22,
        side: 'w',
        san: 'Qf6+',
        glyph: '!!',
        text: 'La dame se sacrifie à son tour pour dévier le cavalier g8, qui gardait la case e7.',
        arrows: [{ from: 'd6', to: 'e7', kind: 'good' }],
      },
      { move: 23, side: 'w', san: 'Be7#', text: 'Mat avec un fou et deux cavaliers : les Blancs ont donné les deux tours, un fou et la dame.' },
    ],
  },
  {
    id: 'siecle',
    label: 'Partie du siècle, 1956',
    title: 'La partie du siècle',
    white: 'Donald Byrne',
    black: 'Robert James Fischer',
    place: 'New York (Rosenwald)',
    year: 1956,
    result: '0-1',
    moves: split(
      '1.Nf3 Nf6 2.c4 g6 3.Nc3 Bg7 4.d4 O-O 5.Bf4 d5 6.Qb3 dxc4 7.Qxc4 c6 8.e4 Nbd7 9.Rd1 Nb6 10.Qc5 Bg4 11.Bg5 Na4 12.Qa3 Nxc3 13.bxc3 Nxe4 14.Bxe7 Qb6 15.Bc4 Nxc3 16.Bc5 Rfe8+ 17.Kf1 Be6 18.Bxb6 Bxc4+ 19.Kg1 Ne2+ 20.Kf1 Nxd4+ 21.Kg1 Ne2+ 22.Kf1 Nc3+ 23.Kg1 axb6 24.Qb4 Ra4 25.Qxb6 Nxd1 26.h3 Rxa2 27.Kh2 Nxf2 28.Re1 Rxe1 29.Qd8+ Bf8 30.Nxe1 Bd5 31.Nf3 Ne4 32.Qb8 b5 33.h4 h5 34.Ne5 Kg7 35.Kg1 Bc5+ 36.Kf1 Ng3+ 37.Ke1 Bb4+ 38.Kd1 Bb3+ 39.Kc1 Ne2+ 40.Kb1 Nc3+ 41.Kc1 Rc2#',
    ),
    intro: 'New York, 1956 : Bobby Fischer a 13 ans. Sa victoire sur Donald Byrne sera surnommée « la partie du siècle ».',
    notes: [
      { move: 11, side: 'b', san: 'Na4', glyph: '!!', text: 'Le cavalier s’offre en a4 pour éliminer le cavalier c3, qui protège e4.', arrows: [{ from: 'a4', to: 'c3', kind: 'threat' }] },
      { move: 14, side: 'w', san: 'Bxe7', text: 'Byrne prend e7 et attaque à la fois la dame d8 et la tour f8.' },
      {
        move: 17,
        side: 'b',
        san: 'Be6',
        glyph: '!!',
        text: 'Fischer laisse sa dame en prise : après 18. Fxb6, fou et cavalier vont donner une série d’échecs à la découverte.',
        arrows: [{ from: 'e6', to: 'c4', kind: 'good' }],
      },
      { move: 18, side: 'b', san: 'Bxc4+', text: 'Début du « moulin » : le fou et le cavalier alternent les échecs et ramassent du matériel.' },
      { move: 20, side: 'b', san: 'Nxd4+', text: 'Échec à la découverte : le cavalier prend d4 et le fou c4 donne échec au roi f1.', arrows: [{ from: 'c4', to: 'f1', kind: 'threat' }] },
      { move: 23, side: 'b', san: 'axb6', text: 'Fin du moulin. Pour sa dame, Fischer a pris deux fous et un pion ; la tour d1 tombera deux coups plus tard.' },
      { move: 41, side: 'b', san: 'Rc2#', text: 'Mat : la tour est protégée par le fou b3 et le cavalier c3 tient b1 et d1.' },
    ],
  },
];

/** Indice de demi-coup (0 = premier coup des Blancs) d'une note. */
export const notePly = (n: Pick<GameNote, 'move' | 'side'>) => (n.move - 1) * 2 + (n.side === 'b' ? 1 : 0);

const FR_PIECES: Record<string, string> = { K: 'R', Q: 'D', R: 'T', B: 'F', N: 'C' };

/** Convertit un coup SAN anglais en notation française : « Qb8+ » → « Db8+ », « e8=Q » → « e8=D ». */
export function sanToFr(san: string): string {
  return san.replace(/[KQRBN]/g, (p) => FR_PIECES[p]);
}

/** Libellé numéroté d'un demi-coup : « 16. Db8+ » ou « 16… Cxb8 ». */
export function plyLabel(ply: number, san: string, glyph = ''): string {
  const num = Math.floor(ply / 2) + 1;
  return `${num}${ply % 2 === 0 ? '.' : '…'} ${sanToFr(san)}${glyph}`;
}
