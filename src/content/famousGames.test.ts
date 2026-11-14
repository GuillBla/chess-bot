import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import { FAMOUS_GAMES, notePly, plyLabel, sanToFr, type FamousGame } from './famousGames';

const game = (id: string) => FAMOUS_GAMES.find((g) => g.id === id)!;

/** Position après les `n` premiers demi-coups. */
function after(g: FamousGame, n: number): Chess {
  const c = new Chess();
  for (const san of g.moves.slice(0, n)) c.move(san);
  return c;
}

/** Position après le coup numéro `move` du camp `side`. */
const afterMove = (g: FamousGame, move: number, side: 'w' | 'b') => after(g, notePly({ move, side }) + 1);

const material = (c: Chess) => {
  const m: Record<string, number> = {};
  for (const row of c.board()) for (const p of row) if (p) m[p.color + p.type] = (m[p.color + p.type] ?? 0) + 1;
  return m;
};

describe('parties célèbres', () => {
  for (const g of FAMOUS_GAMES) {
    describe(g.title, () => {
      it('tous les coups sont légaux et la partie finit par le mat annoncé', () => {
        const c = new Chess();
        for (const san of g.moves) expect(() => c.move(san), san).not.toThrow();
        expect(c.isCheckmate()).toBe(true);
        // Le camp mat est celui qui perd
        expect(c.turn()).toBe(g.result === '1-0' ? 'b' : 'w');
        expect(g.moves[g.moves.length - 1].endsWith('#')).toBe(true);
      });

      it('chaque note est posée sur le bon coup', () => {
        for (const n of g.notes) {
          expect(g.moves[notePly(n)], `${n.move}${n.side}`).toBe(n.san);
          for (const a of n.arrows ?? []) expect(a.from).not.toBe(a.to);
        }
      });
    });
  }

  it('Opéra 1858 : la durée et les affirmations des commentaires', () => {
    const g = game('opera');
    expect(g.moves.length).toBe(33);
    // 3…Fg4 cloue f3 contre d1
    const p3 = afterMove(g, 3, 'b');
    expect(p3.get('e2')).toBeFalsy();
    expect(p3.get('d1')).toMatchObject({ type: 'q', color: 'w' });
    // 4…dxe5 5. Dxd8+ Rxd8 6. Cxe5 : pion gagné, et le cavalier attaque g4
    const alt = after(g, 7); // après 4. dxe5
    for (const san of ['dxe5', 'Qxd8+', 'Kxd8', 'Nxe5']) alt.move(san);
    expect(alt.attackers('g4', 'w')).toContain('e5');
    // 6. Fc4 : deux pièces blanches visent f7, aucune pièce noire développée
    const p6 = afterMove(g, 6, 'w');
    expect(p6.attackers('f7', 'w').sort()).toEqual(['c4', 'f3']);
    for (const sq of ['b8', 'g8', 'f8', 'd8'] as const) expect(p6.get(sq)).toBeTruthy();
    // 7. Db3 : menaces Fxf7+ et Dxb7
    const p7 = afterMove(g, 7, 'w');
    expect(p7.attackers('b7', 'w')).toContain('b3');
    expect(p7.attackers('f7', 'w')).toContain('c4');
    // 7…De7 : si 8. Dxb7 Db4+ (échec, et la dame b4 voit b7)
    const p7b = afterMove(g, 7, 'b');
    p7b.move('Qxb7');
    p7b.move('Qb4+');
    expect(p7b.inCheck()).toBe(true);
    // 12. O-O-O : la tour d1 attaque d7, cloué par le fou b5
    const p12 = afterMove(g, 12, 'w');
    expect(p12.attackers('d7', 'w').sort()).toEqual(['b5', 'd1']);
    // 16. Db8+ : un seul coup légal, Cxb8
    const p16 = afterMove(g, 16, 'w');
    expect(p16.moves()).toEqual(['Nxb8']);
    // Avant Db8+, le cavalier d7 ferme la colonne d (Td8 impossible)
    const p15 = afterMove(g, 15, 'b');
    expect(p15.moves().includes('Rd8') || p15.moves().includes('Rd8#')).toBe(false);
    // 17. Td8# : tour protégée par g5, qui couvre aussi e7
    const end = after(g, g.moves.length);
    expect(end.attackers('d8', 'w')).toContain('g5');
    expect(end.attackers('e7', 'w')).toContain('g5');
  });

  it('Immortelle : les affirmations des commentaires', () => {
    const g = game('immortelle');
    // 3…Dh4+ : le roi doit bouger, plus de roque
    expect(afterMove(g, 4, 'w').getCastlingRights('w')).toEqual({ k: false, q: false });
    // 18. Fd6 : les deux tours en prise, e7 et f8 contrôlées
    const p18 = afterMove(g, 18, 'w');
    expect(p18.attackers('g1', 'b')).toContain('c5');
    expect(p18.attackers('a1', 'b')).toContain('b2');
    expect(p18.attackers('e7', 'w')).toContain('d6');
    expect(p18.attackers('f8', 'w')).toContain('d6');
    // 19. e5 : avant, la dame b2 défend g7 ; après, plus
    expect(afterMove(g, 18, 'b').attackers('g7', 'b')).toContain('b2');
    const p19 = afterMove(g, 19, 'w');
    expect(p19.attackers('g7', 'b')).not.toContain('b2');
    expect(p19.attackers('g7', 'w')).toContain('f5');
    // 22. Df6+ : le cavalier g8 gardait e7
    expect(afterMove(g, 21, 'b').attackers('e7', 'b')).toContain('g8');
    // Mat final : il reste aux Blancs un fou et deux cavaliers (plus roi et pions)
    const m = material(after(g, g.moves.length));
    expect(m.wq ?? 0).toBe(0);
    expect(m.wr ?? 0).toBe(0);
    expect(m.wb).toBe(1);
    expect(m.wn).toBe(2);
  });

  it('Partie du siècle : les affirmations des commentaires', () => {
    const g = game('siecle');
    // 11…Ca4 attaque le cavalier c3, qui protège e4
    const p11 = afterMove(g, 11, 'b');
    expect(p11.attackers('c3', 'b')).toContain('a4');
    expect(p11.attackers('e4', 'w')).toContain('c3');
    // 14. Fxe7 attaque d8 et f8
    const p14 = afterMove(g, 14, 'w');
    expect(p14.get('d8')).toMatchObject({ type: 'q', color: 'b' });
    expect(p14.attackers('d8', 'w')).toContain('e7');
    expect(p14.attackers('f8', 'w')).toContain('e7');
    // 17…Fe6 laisse la dame b6 en prise
    expect(afterMove(g, 17, 'b').attackers('b6', 'w')).toContain('c5');
    // 20…Cxd4+ : échec à la découverte du fou c4
    const p20 = afterMove(g, 20, 'b');
    expect(p20.inCheck()).toBe(true);
    expect(p20.attackers('f1', 'b')).toEqual(['c4']);
    // 23…axb6 : bilan du moulin = dame contre deux fous et un pion
    const before = material(afterMove(g, 17, 'w'));
    const now = material(afterMove(g, 23, 'b'));
    expect((before.bq ?? 0) - (now.bq ?? 0)).toBe(1);
    expect((before.wb ?? 0) - (now.wb ?? 0)).toBe(2);
    expect((before.wp ?? 0) - (now.wp ?? 0)).toBe(1);
    expect(before.wr - now.wr).toBe(0);
    expect(after(g, notePly({ move: 25, side: 'b' }) + 1).get('d1')).toMatchObject({ type: 'n', color: 'b' });
    // 41…Tc2# : tour protégée par le fou b3, cavalier c3 sur b1 et d1
    const end = after(g, g.moves.length);
    expect(end.attackers('c2', 'b')).toContain('b3');
    expect(end.attackers('b1', 'b')).toContain('c3');
    expect(end.attackers('d1', 'b')).toContain('c3');
  });
});

describe('notation française', () => {
  it('convertit les pièces', () => {
    expect(sanToFr('Qb8+')).toBe('Db8+');
    expect(sanToFr('Nxb8')).toBe('Cxb8');
    expect(sanToFr('Rd8#')).toBe('Td8#');
    expect(sanToFr('Bxd7+')).toBe('Fxd7+');
    expect(sanToFr('Kf1')).toBe('Rf1');
    expect(sanToFr('O-O-O')).toBe('O-O-O');
    expect(sanToFr('exd8=Q+')).toBe('exd8=D+');
    expect(sanToFr('e4')).toBe('e4');
  });
  it('numérote les demi-coups', () => {
    expect(plyLabel(30, 'Qb8+', '!!')).toBe('16. Db8+!!');
    expect(plyLabel(31, 'Nxb8')).toBe('16… Cxb8');
  });
});
