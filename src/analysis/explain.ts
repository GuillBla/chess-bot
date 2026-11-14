// Génération d'explications en français pour un coup (100 % par règles).
//
// Entrées : la position, le coup, l'analyse MultiPV du moteur (avant le coup).
// On combine : motifs tactiques (tactics.ts), différences de traits positionnels
// avant/après le coup (features.ts), menaces (coup nul), variation principale
// traduite en phrases, et comparaison avec les autres lignes du moteur.

import { Chess, type Move } from 'chess.js';
import type { AnalysisResult, EngineLine, StockfishEngine } from '../engine/stockfish';
import type { AlternativeExplanation, BoardArrow, ExplanationPoint, MoveExplanation, SquareMark } from './types';
import { formatLine, formatScore, parseUci, playUci, pvToSan } from '../lib/chessUtils';
import { extractFeatures, opp, type PositionFeatures, type SideFeatures } from './features';
import {
  capital,
  detectMotifs,
  findThreats,
  gainText,
  nullMoveFen,
  pieceAt,
  pieceName,
  pluralP,
  sideName,
  theP,
  type Motif,
  type Threat,
} from './tactics';

// --------------------------------------------------------------------------
// Scores

const MATE = 10000;

/** Score d'une ligne du point de vue du camp au trait (mat encodé ±10000). */
export function lineScore(l: Pick<EngineLine, 'cp' | 'mate'>): number {
  if (l.mate !== null) return l.mate > 0 ? MATE - l.mate * 10 : -MATE - l.mate * 10;
  return l.cp ?? 0;
}

function pawnsText(cp: number): string {
  const v = Math.abs(cp) / 100;
  const s = v.toFixed(1).replace('.', ',');
  return `${s} pion${v >= 2 ? 's' : ''}`;
}

/** Description d'une évaluation (point de vue des Blancs). */
export function describeEval(whiteCp: number, mate: number | null = null): string {
  if (mate !== null) return mate === 0 ? 'mat sur l’échiquier' : `mat forcé en ${Math.abs(mate)} pour ${mate > 0 ? 'les Blancs' : 'les Noirs'}`;
  const a = Math.abs(whiteCp);
  const who = whiteCp > 0 ? 'aux Blancs' : 'aux Noirs';
  if (a < 35) return 'position équilibrée';
  if (a < 90) return `léger avantage ${who}`;
  if (a < 200) return `net avantage ${who}`;
  if (a < 450) return `gros avantage ${who}`;
  return `position gagnante pour ${whiteCp > 0 ? 'les Blancs' : 'les Noirs'}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}
function listFr(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + ' et ' + items[items.length - 1];
}

// --------------------------------------------------------------------------
// Description d'un coup « en mots »

type Form = 'sing' | 'plur' | 'inf';
const V = (sing: string, plur: string, inf: string) => ({ sing, plur, inf });
const VERBS = {
  roquer: V('roque', 'roquent', 'roquer'),
  prendre: V('prend', 'prennent', 'prendre'),
  avancer: V('avance', 'avancent', 'avancer'),
  occuper: V('occupe', 'occupent', 'occuper'),
  pousser: V('pousse', 'poussent', 'pousser'),
  developper: V('développe', 'développent', 'développer'),
  installer: V('installe', 'installent', 'installer'),
  placer: V('place', 'placent', 'placer'),
  infiltrer: V('infiltre', 'infiltrent', 'infiltrer'),
  amener: V('amène', 'amènent', 'amener'),
  activer: V('active', 'activent', 'activer'),
  deplacer: V('déplace', 'déplacent', 'déplacer'),
  replacer: V('replace', 'replacent', 'replacer'),
  promouvoir: V('promeut', 'promeuvent', 'promouvoir'),
  echanger: V('échange', 'échangent', 'échanger'),
  mettre: V('met', 'mettent', 'mettre'),
  parer: V('pare', 'parent', 'parer'),
};

/** Décrit un coup par un groupe verbal : « développent le cavalier en f3 ». */
export function describeMove(fenBefore: string, move: Move, form: Form = 'plur', brief = false): string {
  const v = (k: keyof typeof VERBS) => VERBS[k][form];
  const chk = move.san.includes('#') ? ' avec échec et mat' : move.san.includes('+') ? ' avec échec' : '';
  if (move.isKingsideCastle()) return `${v('roquer')} côté roi${brief ? '' : ' (petit roque) pour abriter le roi'}${chk}`;
  if (move.isQueensideCastle()) return `${v('roquer')} côté dame${brief ? '' : ' (grand roque)'}${chk}`;
  let inCheck = false;
  try {
    inCheck = new Chess(fenBefore).inCheck();
  } catch {
    /* ignore */
  }
  if (inCheck && move.piece === 'k' && !move.captured) return `${v('mettre')} le roi à l’abri en ${move.to}${chk}`;
  if (inCheck && !move.captured) return `${v('parer')} l’échec en interposant ${theP(move.piece)} en ${move.to}${chk}`;
  if (move.promotion) return `${v('promouvoir')} le pion en ${pieceName(move.promotion)} en ${move.to}${chk}`;
  if (move.captured) {
    if (move.captured === move.piece) return `${v('echanger')} les ${pluralP(move.piece)} en ${move.to}${chk}`;
    return `${v('prendre')} ${pieceAt(move.captured, move.to)}${move.piece === 'p' ? ' avec un pion' : ` avec ${theP(move.piece)}`}${chk}`;
  }
  const after = extractFeatures(move.after);
  const side = after[move.color];
  const phase = after.phase;
  if (move.piece === 'p') {
    if (side.passedPawns.includes(move.to)) return `${v('avancer')} le pion passé en ${move.to}${chk}`;
    if (['d4', 'e4', 'd5', 'e5'].includes(move.to)) return `${v('occuper')} le centre avec le pion ${move.to}${chk}`;
    return `${v('pousser')} le pion en ${move.to}${chk}`;
  }
  const before = extractFeatures(fenBefore)[move.color];
  if ((move.piece === 'n' || move.piece === 'b') && before.undeveloped.includes(move.from)) return `${v('developper')} ${theP(move.piece)} en ${move.to}${chk}`;
  if (move.piece === 'n' && side.outposts.includes(move.to)) return `${v('installer')} le cavalier sur l’avant-poste ${move.to}${chk}`;
  if (move.piece === 'r') {
    if (side.rooksOnSeventh.includes(move.to)) return `${v('infiltrer')} la tour sur la ${move.color === 'w' ? '7e' : '2e'} rangée (${move.to})${chk}`;
    if (side.rooksOpenFile.includes(move.to) && !before.rooksOpenFile.includes(move.from)) return `${v('placer')} la tour sur la colonne ${move.to[0]} ouverte${chk}`;
    if (side.rooksSemiOpenFile.includes(move.to) && move.from[0] !== move.to[0]) return `${v('placer')} la tour sur la colonne ${move.to[0]} semi-ouverte${chk}`;
  }
  if (move.piece === 'q') return `${v('amener')} la dame en ${move.to}${chk}`;
  if (move.piece === 'k') return phase === 'finale' ? `${v('activer')} le roi en ${move.to}${chk}` : `${v('deplacer')} le roi en ${move.to}${chk}`;
  return `${v('replacer')} ${theP(move.piece)} en ${move.to}${chk}`;
}

// --------------------------------------------------------------------------
// Raisons positionnelles (comparaison des traits avant / après)

interface Reason extends ExplanationPoint {
  weight: number;
  short: string;
  good: boolean;
}

function newItems<T extends string>(a: T[], b: T[]): T[] {
  return b.filter((x) => !a.includes(x));
}

function positionalReasons(move: Move, fb: PositionFeatures, fa: PositionFeatures): Reason[] {
  const c = move.color;
  const e = opp(c);
  const B: SideFeatures = fb[c];
  const A: SideFeatures = fa[c];
  const EB: SideFeatures = fb[e];
  const EA: SideFeatures = fa[e];
  const out: Reason[] = [];
  const phase = fb.phase;
  const push = (r: Omit<Reason, 'arrows' | 'marks'> & { arrows?: BoardArrow[]; marks?: SquareMark[] }) => out.push({ arrows: [], marks: [], ...r });

  // Roque / sécurité du roi
  if (move.isKingsideCastle() || move.isQueensideCastle()) {
    push({ category: 'roi', weight: 30, good: true, short: 'met le roi à l’abri en roquant', text: `Le roque met le roi en sécurité derrière ses pions${move.isKingsideCastle() ? '' : ' (côté dame, ce qui active aussi la tour en d' + (c === 'w' ? '1' : '8') + ')'} et relie les tours, qui pourront venir au centre.`, marks: [{ square: move.to, kind: 'strong' }] });
  } else if (move.piece === 'k' && B.canCastle && phase !== 'finale') {
    push({ category: 'roi', weight: 22, good: false, short: 'perd le droit de roquer', text: `En bougeant le roi, ${sideName(c)} perdent le droit de roquer : le roi risque de rester exposé au centre.`, marks: [{ square: move.to, kind: 'weak' }] });
  }
  if (move.piece === 'p' && phase !== 'finale' && A.kingShield < B.kingShield && A.castled) {
    push({ category: 'roi', weight: 14, good: false, short: 'affaiblit l’abri du roi', text: `Ce pion faisait partie du bouclier du roi en ${A.kingSquare} ; l’avancer crée des cases faibles et des lignes qui pourront servir à l’adversaire pour attaquer.`, marks: A.kingSquare ? [{ square: A.kingSquare, kind: 'weak' }] : [] });
  }
  const opened = newItems(EB.openFilesNearKing, EA.openFilesNearKing);
  if (opened.length && phase !== 'finale' && EA.kingSquare) {
    push({ category: 'roi', weight: 20, good: true, short: `ouvre des lignes vers le roi adverse`, text: `La colonne ${listFr(opened)} n’a plus de pion ${e === 'w' ? 'blanc' : 'noir'} devant le roi adverse : les tours et la dame pourront s’en servir pour attaquer.`, marks: [{ square: EA.kingSquare, kind: 'target' }] });
  }
  if (EA.kingZoneAttacks - EB.kingZoneAttacks >= 2 && phase !== 'finale' && EA.kingSquare) {
    push({ category: 'roi', weight: 12, good: true, short: 'augmente la pression sur le roi adverse', text: `Une pièce de plus vise les cases autour du roi en ${EA.kingSquare} : la pression monte (${EA.kingZoneAttacks} attaques sur la zone du roi contre ${EB.kingZoneAttacks} avant).`, marks: [{ square: EA.kingSquare, kind: 'target' }] });
  }
  if (!EB.kingStuckInCenter && EA.kingStuckInCenter && EA.kingSquare) {
    push({ category: 'roi', weight: 16, good: true, short: 'bloque le roi adverse au centre', text: `Le roi adverse ne peut plus roquer : coincé au centre, il sera une cible si le jeu s’ouvre.`, marks: [{ square: EA.kingSquare, kind: 'target' }] });
  }

  // Développement
  if ((move.piece === 'n' || move.piece === 'b') && B.undeveloped.includes(move.from)) {
    push({ category: 'positionnel', weight: phase === 'ouverture' ? 18 : 10, good: true, short: `développe ${theP(move.piece)}`, text: `${capital(theP(move.piece))} quitte sa case de départ et entre en jeu en ${move.to}. En ouverture, chaque pièce développée compte : ${A.undeveloped.length ? `il reste ${A.undeveloped.length} pièce${A.undeveloped.length > 1 ? 's' : ''} mineure${A.undeveloped.length > 1 ? 's' : ''} à sortir` : 'toutes les pièces mineures sont maintenant sorties'}.` });
  } else if (phase === 'ouverture' && B.undeveloped.length >= 2 && (move.piece === 'q' || (move.piece !== 'p' && move.piece !== 'k' && !B.undeveloped.includes(move.from))) && !move.captured) {
    push({ category: 'positionnel', weight: 8, good: false, short: 'rejoue une pièce déjà sortie', text: `On rejoue une pièce déjà sortie alors que ${B.undeveloped.length} pièces mineures dorment encore (${B.undeveloped.join(', ')}) : attention au retard de développement.` });
  }

  // Centre
  const dc = A.centerControl - B.centerControl;
  if (dc >= 2 && phase !== 'finale') {
    push({ category: 'positionnel', weight: 9 + dc, good: true, short: 'renforce le contrôle du centre', text: `Le coup renforce l’emprise sur le centre (cases d4, e4, d5, e5) : ${sideName(c)} y exercent désormais ${A.centerControl} « points de contrôle » contre ${EA.centerControl} pour l’adversaire. Contrôler le centre donne plus d’espace et de mobilité aux pièces.` });
  }

  // Avant-postes, tours, mobilité
  for (const sq of newItems(B.outposts, A.outposts)) {
    push({ category: 'positionnel', weight: 22, good: true, short: `installe un cavalier sur l’avant-poste ${sq}`, text: `Le cavalier en ${sq} est sur un avant-poste : soutenu par un pion et aucun pion adverse ne pourra jamais le chasser. Un cavalier ainsi ancré dans le camp adverse vaut souvent plus qu’un fou.`, marks: [{ square: sq, kind: 'strong' }] });
  }
  for (const sq of newItems(B.rooksOnSeventh, A.rooksOnSeventh)) {
    push({ category: 'positionnel', weight: 20, good: true, short: `infiltre la tour sur la ${c === 'w' ? '7e' : '2e'} rangée`, text: `La tour en ${sq} s’installe sur la ${c === 'w' ? '7e' : '2e'} rangée : elle attaque les pions adverses par le côté et peut enfermer le roi sur sa dernière rangée.`, marks: [{ square: sq, kind: 'strong' }] });
  }
  for (const sq of newItems(B.rooksOpenFile, A.rooksOpenFile)) {
    if (A.rooksOnSeventh.includes(sq)) continue;
    push({ category: 'positionnel', weight: 15, good: true, short: `prend la colonne ${sq[0]} ouverte`, text: `La tour en ${sq} contrôle la colonne ${sq[0]}, ouverte (sans aucun pion) : elle pourra s’en servir pour pénétrer dans le camp adverse.`, marks: [{ square: sq, kind: 'strong' }] });
  }
  for (const sq of newItems(B.rooksSemiOpenFile, A.rooksSemiOpenFile)) {
    if (move.to !== sq) continue;
    push({ category: 'positionnel', weight: 10, good: true, short: `met la tour sur la colonne ${sq[0]} semi-ouverte`, text: `La tour en ${sq} se place sur la colonne ${sq[0]}, semi-ouverte (sans pion ${c === 'w' ? 'blanc' : 'noir'}) : elle met la pression sur ce qui se trouve au bout de la colonne.`, marks: [{ square: sq, kind: 'strong' }] });
  }
  const dm = A.mobility - B.mobility;
  if (dm >= 5 && !move.captured && move.piece !== 'p') {
    push({ category: 'positionnel', weight: 6 + Math.min(dm, 10) / 2, good: true, short: `active ${theP(move.piece)}`, text: `${capital(theP(move.piece))} est bien plus ${move.piece === 'r' || move.piece === 'q' ? 'active' : 'actif'} en ${move.to} : les pièces ${c === 'w' ? 'blanches' : 'noires'} contrôlent ${dm} cases de plus qu’avant.` });
  }

  // Paire de fous / mauvais fou
  if (EB.bishopPair && !EA.bishopPair && move.captured === 'b') {
    push({ category: 'positionnel', weight: 9, good: true, short: 'prend la paire de fous à l’adversaire', text: `En prenant ce fou, ${sideName(c)} privent l’adversaire de sa paire de fous, un atout précieux dans les positions ouvertes.` });
  }
  if (B.badBishop && !A.badBishop && move.piece === 'b' && move.captured) {
    push({ category: 'positionnel', weight: 9, good: true, short: 'se débarrasse du mauvais fou', text: `Le fou échangé était un « mauvais fou » (gêné par ses propres pions placés sur des cases de sa couleur) : l’échanger est une bonne affaire.` });
  }

  // Structure de pions
  for (const sq of newItems(B.passedPawns, A.passedPawns)) {
    push({ category: phase === 'finale' ? 'finale' : 'structure', weight: phase === 'finale' ? 22 : 14, good: true, short: `crée un pion passé en ${sq}`, text: `Le pion en ${sq} devient passé : plus aucun pion adverse ne peut l’arrêter sur sa route. Ce sera un atout de plus en plus fort à mesure que les pièces s’échangent.`, marks: [{ square: sq, kind: 'strong' }] });
  }
  if (move.piece === 'p' && B.passedPawns.includes(move.from) && A.passedPawns.includes(move.to)) {
    push({ category: phase === 'finale' ? 'finale' : 'structure', weight: phase === 'finale' ? 18 : 10, good: true, short: 'pousse le pion passé', text: `Le pion passé avance en ${move.to} : chaque pas rapproche la promotion et oblige l’adversaire à mobiliser une pièce pour le surveiller.`, arrows: [{ from: move.from, to: move.to, kind: 'good' }] });
  }
  const eIso = newItems(EB.isolatedPawns, EA.isolatedPawns);
  const eDbl = newItems(EB.doubledPawns, EA.doubledPawns);
  if (eDbl.length && move.captured) {
    push({ category: 'structure', weight: 10, good: true, short: 'abîme la structure de pions adverse', text: `Après la reprise, l’adversaire se retrouve avec des pions doublés (${eDbl.join(', ')}) : ils se protègent mal et sont souvent des faiblesses en finale.`, marks: eDbl.map((s) => ({ square: s, kind: 'weak' as const })) });
  } else if (eIso.length) {
    push({ category: 'structure', weight: 8, good: true, short: 'isole un pion adverse', text: `Le pion adverse en ${listFr(eIso)} devient isolé (plus de pion voisin pour le protéger) : c’est une cible à long terme.`, marks: eIso.map((s) => ({ square: s, kind: 'weak' as const })) });
  }
  const myIso = newItems(B.isolatedPawns, A.isolatedPawns).filter((s) => s !== move.to || move.piece === 'p');
  if (myIso.length && phase !== 'finale') {
    push({ category: 'structure', weight: 6, good: false, short: 'crée un pion isolé', text: `Contrepartie : le pion en ${listFr(myIso)} devient isolé, il faudra le surveiller.`, marks: myIso.map((s) => ({ square: s, kind: 'weak' as const })) });
  }
  const eBack = newItems(EB.backwardPawns, EA.backwardPawns);
  if (eBack.length) {
    push({ category: 'structure', weight: 7, good: true, short: 'fixe un pion arriéré', text: `Le pion adverse en ${listFr(eBack)} est maintenant arriéré : il ne peut plus avancer sans être pris et la case devant lui devient un point fort pour nos pièces.`, marks: eBack.map((s) => ({ square: s, kind: 'weak' as const })) });
  }

  // Finale : activité du roi
  if (phase === 'finale' && move.piece === 'k' && A.kingActivity > B.kingActivity) {
    push({ category: 'finale', weight: 14, good: true, short: 'active le roi', text: `En finale, le roi devient une pièce d’attaque : en se rapprochant du centre (${move.to}), il soutient ses pions et va chercher ceux de l’adversaire.`, arrows: [{ from: move.from, to: move.to, kind: 'good' }] });
  }
  return out;
}

// --------------------------------------------------------------------------
// Menaces

function threatText(t: Threat): string {
  if (t.kind === 'mat') return `${t.san} et mat`;
  if (t.kind === 'promotion') return `${t.san} (promotion)`;
  return `${t.san}, qui gagnerait ${t.target ? pieceAt(t.target, t.to) : 'du matériel'}`;
}

/** Ce que le coup menace : si l'adversaire passait son tour, que pourrions-nous faire de nouveau ? */
function newThreats(fen: string, fenAfter: string): Threat[] {
  const nf = nullMoveFen(fenAfter);
  if (!nf) return [];
  const old = findThreats(fen);
  const oldKeys = new Set(old.map((t) => (t.kind === 'mat' ? 'mat' : t.to)));
  return findThreats(nf).filter((t) => !oldKeys.has(t.kind === 'mat' ? 'mat' : t.to));
}

// --------------------------------------------------------------------------
// Plan : variation principale en phrases

interface PlanResult {
  line: string;
  text: string;
}

function walk(fen: string, pv: string[]): Move[] {
  const chess = new Chess(fen);
  const out: Move[] = [];
  for (const u of pv) {
    try {
      out.push(chess.move(parseUci(u)));
    } catch {
      break;
    }
  }
  return out;
}

function planFor(fen: string, pv: string[], evalLine: Pick<EngineLine, 'cp' | 'mate'> | null, seed: number): PlanResult | undefined {
  const all = walk(fen, pv);
  if (all.length < 2) return undefined;
  let n = Math.min(all.length, 6);
  // ne pas couper au milieu d'un échange
  while (n < all.length && n < 9 && all[n].captured) n++;
  const moves = all.slice(0, n);
  const segs: string[] = [];
  let i = 0;
  while (i < moves.length) {
    const m = moves[i];
    const nx = moves[i + 1];
    if (m.captured && nx && nx.captured && nx.to === m.to) {
      if (m.captured === m.piece && nx.captured === m.piece) segs.push(`les ${pluralP(m.piece)} s’échangent en ${m.to}`);
      else segs.push(`${sideName(m.color)} prennent ${pieceAt(m.captured, m.to)} et ${sideName(nx.color)} reprennent ${nx.piece === 'p' ? 'avec un pion' : `avec ${theP(nx.piece)}`}`);
      i += 2;
    } else {
      const uci = m.from + m.to + (m.promotion ?? '');
      const top = detectMotifs(m.before, uci).find((x) => x.good && !['echec', 'echange', 'capture'].includes(x.kind));
      segs.push(top ? `${sideName(m.color)} jouent ${m.san}, qui ${top.short}` : `${sideName(m.color)} ${describeMove(m.before, m, 'plur', true)}`);
      i++;
    }
  }
  const middles = pick([[', puis ', ', ensuite ', ', puis '], [' ; ', ', puis ', ', après quoi '], [', puis ', ' ; ensuite ', ', puis ']], seed);
  const last = pick([' ; enfin ', ', et pour finir ', ', et enfin '], seed >> 3);
  let text = '';
  segs.forEach((s, k) => {
    if (k === 0) text = capital(s);
    else if (k === segs.length - 1 && segs.length >= 3) text += last + s;
    else text += middles[(k - 1) % middles.length] + s;
  });
  text += '.';

  // Bilan au bout de la ligne
  const c = moves[0].color;
  const f0 = extractFeatures(fen);
  const f1 = extractFeatures(moves[moves.length - 1].after);
  const mat = (f: PositionFeatures) => f[c].material - f[opp(c)].material;
  const dMat = mat(f1) - mat(f0);
  const extras: string[] = [];
  if (dMat >= 1) extras.push(`${sideName(c)} ont gagné ${gainText(dMat)}`);
  else if (dMat <= -1) extras.push(`${sideName(c)} ont rendu ${gainText(-dMat)}, en échange d’autres avantages`);
  const newPassed = newItems(f0[c].passedPawns, f1[c].passedPawns);
  if (newPassed.length) extras.push(`un pion passé est apparu en ${newPassed[0]}`);
  if (newItems(f0[c].rooksOnSeventh, f1[c].rooksOnSeventh).length) extras.push(`une tour est installée sur la ${c === 'w' ? '7e' : '2e'} rangée`);
  if (newItems(f0[c].outposts, f1[c].outposts).length) extras.push(`un cavalier occupe un avant-poste`);
  if (!f0[opp(c)].kingStuckInCenter && f1[opp(c)].kingStuckInCenter) extras.push('le roi adverse est resté coincé au centre');
  const lastCheck = moves[moves.length - 1].san.includes('#');
  if (lastCheck) extras.push('la ligne se termine par un mat');
  if (extras.length) text += ` Au bout de la ligne : ${listFr(extras)}.`;
  if (evalLine) {
    const turn = fen.split(' ')[1] === 'b' ? 'b' : 'w';
    const sign = turn === 'w' ? 1 : -1;
    text += ` Évaluation : ${formatScore(evalLine, turn)} (${describeEval(sign * (evalLine.cp ?? 0), evalLine.mate === null ? null : sign * evalLine.mate)}).`;
  }
  return { line: formatLine(fen, pv.slice(0, n), n), text };
}

// --------------------------------------------------------------------------
// Explication principale

function motifToReason(m: Motif): Reason {
  const cat: ExplanationPoint['category'] = m.kind === 'menace_mat' ? 'menace' : m.kind === 'promotion' || m.kind === 'menace_promotion' ? 'finale' : 'tactique';
  return { category: cat, text: m.text, arrows: m.arrows, marks: m.marks, weight: 40 + m.gain * 3 + (m.kind === 'mat' ? 500 : 0) + (m.kind === 'echec' ? -35 : 0) + (m.kind === 'echange' ? -25 : 0), short: m.short, good: m.good };
}

/** Raisons « courtes » d'un coup, sans moteur (motifs + positionnel), triées. */
function quickReasons(fen: string, uci: string): { reasons: Reason[]; move: Move | null } {
  const played = playUci(fen, uci);
  if (!played) return { reasons: [], move: null };
  const motifs = detectMotifs(fen, uci);
  const reasons = [...motifs.map(motifToReason), ...positionalReasons(played.move, extractFeatures(fen), extractFeatures(played.fen))];
  return { reasons: reasons.sort((a, b) => b.weight - a.weight), move: played.move };
}

function shortIdea(fen: string, uci: string): string {
  const { reasons, move } = quickReasons(fen, uci);
  const good = reasons.find((r) => r.good);
  if (good) return good.short;
  if (!move) return '';
  return describeMove(fen, move, 'sing');
}

function severity(loss: number): string {
  if (loss >= 300) return 'Gaffe';
  if (loss >= 120) return 'Erreur';
  if (loss >= 50) return 'Imprécision';
  return '';
}

/**
 * Explique un coup.
 * @param fen position AVANT le coup
 * @param uci le coup à expliquer (meilleur ou non)
 * @param analysis analyse MultiPV de `fen`
 * @param opts.afterLine meilleure ligne du moteur pour la position APRÈS le coup (score du point de vue du camp au trait après le coup)
 */
export function explainMove(
  fen: string,
  uci: string,
  analysis: AnalysisResult,
  opts: { afterLine?: EngineLine; /** Libellé imposé (ex. classification de la revue de partie). */ severityLabel?: string } = {},
): MoveExplanation {
  const played = playUci(fen, uci);
  if (!played) return { uci, san: uci, evalText: '?', headline: 'Ce coup n’est pas légal dans cette position.', points: [], alternatives: [] };
  const { move, fen: fenAfter } = played;
  const c = move.color;
  const e = opp(c);
  const seed = hash(fen + uci);
  const lines = analysis.lines.filter((l) => l.pv.length);
  const best = lines[0] ?? null;
  const own = lines.find((l) => l.pv[0] === uci) ?? null;
  const afterChess = new Chess(fenAfter);

  // Évaluation du coup
  let score: number | null = null;
  let pv: string[] = [uci];
  let evalText = '?';
  let evalLine: Pick<EngineLine, 'cp' | 'mate'> | null = null; // point de vue du camp qui joue `uci`
  if (afterChess.isCheckmate()) {
    score = MATE;
    evalText = c === 'w' ? '1-0' : '0-1';
  } else if (afterChess.isStalemate() || afterChess.isInsufficientMaterial()) {
    score = 0;
    evalText = '½-½';
  } else if (own) {
    score = lineScore(own);
    pv = own.pv;
    evalText = formatScore(own, c);
    evalLine = own;
  } else if (opts.afterLine) {
    const a = opts.afterLine;
    score = -lineScore(a);
    pv = [uci, ...a.pv];
    evalText = formatScore(a, e);
    evalLine = { cp: a.cp === null ? null : -a.cp, mate: a.mate === null ? null : -a.mate };
  }
  const bestScore = best ? lineScore(best) : null;
  const isBest = !best || best.pv[0] === uci;
  const loss = !isBest && score !== null && bestScore !== null ? Math.max(0, Math.min(3000, bestScore - score)) : 0;
  const bestSan = best ? pvToSan(fen, [best.pv[0]])[0] ?? best.pv[0] : '';

  // Analyse par règles
  const fb = extractFeatures(fen);
  const fa = extractFeatures(fenAfter);
  const motifs = detectMotifs(fen, uci);
  const reasons: Reason[] = [...motifs.map(motifToReason), ...positionalReasons(move, fb, fa)];

  // Menaces créées
  if (!afterChess.isGameOver()) {
    const marked = new Set(motifs.flatMap((m) => m.marks.map((k) => k.square as string)));
    const hasMateThreat = motifs.some((m) => m.kind === 'menace_mat');
    const threats = newThreats(fen, fenAfter).filter((t) => !marked.has(t.to) && !(t.kind === 'mat' && hasMateThreat)).slice(0, 2);
    if (threats.length) {
      const t0 = threats[0];
      reasons.push({
        category: 'menace',
        weight: t0.kind === 'mat' ? 70 : 25 + t0.gain * 4,
        good: true,
        short: t0.kind === 'mat' ? `menace ${t0.san} mat` : `menace ${t0.san}`,
        text: `Ce que le coup menace : si ${sideName(e)} ne réagissaient pas, ${sideName(c)} joueraient ${listFr(threats.map(threatText))}.`,
        arrows: threats.map((t) => ({ from: t.from, to: t.to, kind: 'threat' as const })),
        marks: threats.filter((t) => t.kind === 'capture').map((t) => ({ square: t.to, kind: 'target' as const })),
      });
    }

    // Menaces adverses parées / ignorées
    const nb = nullMoveFen(fen);
    const oppBefore = nb ? findThreats(nb) : [];
    const oppAfter = findThreats(fenAfter);
    const afterKeys = new Set(oppAfter.map((t) => (t.kind === 'mat' ? 'mat' : t.to)));
    const parried = oppBefore.filter((t) => !afterKeys.has(t.kind === 'mat' ? 'mat' : t.to) && !(t.to === move.from && t.kind === 'capture' && afterKeys.has(move.to)));
    const oppMate = oppAfter.find((t) => t.kind === 'mat');
    if (oppMate) {
      reasons.push({ category: 'défense', weight: 90, good: false, short: `permet ${oppMate.san} mat`, text: `Grave problème : après ce coup, ${sideName(e)} ont un mat immédiat avec ${oppMate.san} !`, arrows: [{ from: oppMate.from, to: oppMate.to, kind: 'bad' }], marks: [] });
    }
    if (parried.length) {
      const p0 = parried[0];
      const what = p0.kind === 'mat' ? `la menace de mat ${p0.san}` : p0.kind === 'promotion' ? `la promotion ${p0.san}` : `la menace sur ${p0.target ? pieceAt(p0.target, p0.to) : p0.to} (${p0.san})`;
      const how = p0.to === move.from ? 'en mettant la pièce attaquée à l’abri' : move.captured && p0.from === move.to ? 'en éliminant la pièce qui attaquait' : 'en défendant ou en couvrant la cible';
      reasons.push({ category: 'défense', weight: p0.kind === 'mat' ? 60 : 20 + p0.gain * 5, good: true, short: p0.kind === 'mat' ? 'pare la menace de mat' : `pare la menace sur ${p0.to}`, text: `Le coup neutralise ${what} ${how}.`, arrows: [{ from: p0.from, to: p0.to, kind: 'bad' }], marks: [{ square: p0.to, kind: 'strong' }] });
    }
    const hangingIgnored = oppAfter.filter((t) => t.kind === 'capture' && oppBefore.some((o) => o.to === t.to) && !motifs.some((m) => m.kind === 'enprise' && m.marks.some((k) => k.square === t.to)));
    if (hangingIgnored.length && !isBest && loss >= 50) {
      const h = hangingIgnored[0];
      reasons.push({ category: 'défense', weight: 30 + h.gain * 5, good: false, short: `laisse ${h.target ? pieceAt(h.target, h.to) : 'une pièce'} en prise`, text: `Le coup ne règle pas le problème : ${h.target ? pieceAt(h.target, h.to) : 'la pièce en ' + h.to} reste en prise et ${sideName(e)} peuvent jouer ${h.san} pour gagner ${gainText(h.gain)}.`, arrows: [{ from: h.from, to: h.to, kind: 'bad' }], marks: [{ square: h.to, kind: 'hanging' }] });
    }
  }

  // Réfutation (coup non optimal)
  const sev = loss > 0 && opts.severityLabel ? opts.severityLabel : severity(loss);
  if (sev && pv.length >= 2) {
    const replyUci = pv[1];
    const replySan = pvToSan(fenAfter, [replyUci])[0];
    if (replySan) {
      const { reasons: rr } = quickReasons(fenAfter, replyUci);
      const r0 = rr.find((r) => r.good && r.weight >= 30);
      const line = formatLine(fenAfter, pv.slice(1), 5);
      reasons.push({
        category: 'défense',
        weight: 35 + loss / 20,
        good: false,
        short: r0 ? `permet ${replySan}, qui ${r0.short}` : '',
        text: r0
          ? `La réfutation : ${sideName(e)} répondent ${replySan}, qui ${r0.short}. Suite probable : ${line}.`
          : `La meilleure réponse est ${replySan} (${line}) ; après elle, l’évaluation passe à ${evalText}${best ? `, alors qu’elle était de ${formatScore(best, c)} avec ${bestSan}` : ''}.`,
        arrows: [{ from: replyUci.slice(0, 2) as never, to: replyUci.slice(2, 4) as never, kind: 'bad' }],
        marks: [],
      });
    }
  }

  // Seul bon coup ?
  if (isBest && lines.length >= 2 && bestScore !== null) {
    const gap = bestScore - lineScore(lines[1]);
    if (gap >= 150 && bestScore > -300) {
      reasons.push({ category: 'plan', weight: 5, good: true, short: 'est le seul bon coup', text: `C’est pratiquement le seul bon coup : la meilleure alternative, ${pvToSan(fen, [lines[1].pv[0]])[0]}, coûte environ ${pawnsText(gap)}.` });
    }
  }

  reasons.sort((a, b) => b.weight - a.weight);
  // On retire les doublons de texte.
  const seen = new Set<string>();
  const kept = reasons.filter((r) => {
    if (seen.has(r.text)) return false;
    seen.add(r.text);
    return true;
  });

  // Titre
  const ownMate = evalLine?.mate ?? null;
  const topGood = kept.find((r) => r.good);
  const topBad = kept.find((r) => !r.good && r.short);
  let headline: string;
  if (afterChess.isCheckmate()) headline = `${move.san} : échec et mat !`;
  else if (afterChess.isStalemate()) headline = `${move.san} provoque un pat : la partie est nulle.`;
  else if (sev) {
    const missedMate = best?.mate !== null && (best?.mate ?? 0) > 0 && !(ownMate !== null && ownMate > 0);
    const bestIdea = best ? shortIdea(fen, best.pv[0]) : '';
    const lost = `environ ${pawnsText(loss)} de perdu`;
    if (missedMate) headline = `${sev} : ${move.san} laisse passer un mat en ${best!.mate} avec ${bestSan}.`;
    else if (topBad) headline = `${sev} : ${move.san} ${topBad.short} (${lost}). Mieux : ${bestSan}${bestIdea ? `, qui ${bestIdea}` : ''}.`;
    else headline = `${sev} : ${move.san} passe à côté de ${bestSan}${bestIdea ? `, qui ${bestIdea}` : ''} (${lost}).`;
  } else if (ownMate !== null && ownMate > 0) {
    headline = `${move.san} force le mat en ${ownMate}${topGood ? ` : le coup ${topGood.short}` : ''}.`;
  } else if (topGood) {
    const intro = pick(['', 'L’idée : ', ''], seed);
    headline = intro ? `${intro}${move.san} ${topGood.short}.` : `${move.san} ${topGood.short}.`;
    const second = kept.find((r) => r.good && r !== topGood && r.category !== topGood.category && r.weight >= 12);
    if (second) headline = headline.slice(0, -1) + ` et ${second.short}.`;
  } else {
    const nextOwn = pv.length >= 3 ? walk(fen, pv.slice(0, 3))[2] : undefined;
    const desc = describeMove(fen, move, 'sing');
    headline = nextOwn ? `${move.san} ${desc} et prépare ${nextOwn.san}.` : `${move.san} ${desc} : un coup ${pick(['solide', 'utile', 'sain'], seed)} qui garde la position en ordre.`;
  }

  // Points (on garde les plus significatifs)
  const points: ExplanationPoint[] = kept.slice(0, 7).map(({ category, text, arrows, marks }) => ({ category, text, arrows, marks }));
  if (!points.length) {
    points.push({ category: 'plan', text: `${capital(sideName(c))} ${describeMove(fen, move, 'plur')}. Aucun motif tactique immédiat : c’est un coup de placement, dont l’intérêt apparaît dans la suite (voir le plan).`, arrows: [{ from: move.from, to: move.to, kind: 'idea' }] });
  }

  const plan = planFor(fen, pv, evalLine, seed);

  // Alternatives
  const alternatives: AlternativeExplanation[] = [];
  if (best && !isBest) {
    const bestReply = best.pv[1] ? pvToSan(playUci(fen, best.pv[0])?.fen ?? fen, [best.pv[1]])[0] : undefined;
    const idea = shortIdea(fen, best.pv[0]);
    alternatives.push({
      uci: best.pv[0],
      san: bestSan,
      lossCp: 0,
      line: formatLine(fen, best.pv, 8),
      text: `Le meilleur coup était ${bestSan}${idea ? `, qui ${idea}` : ''}.${bestReply ? ` Après ${bestReply}, la suite donne ${formatScore(best, c)}` : ` Évaluation : ${formatScore(best, c)}`} contre ${evalText} pour ${move.san}.`,
    });
  }
  for (const l of lines) {
    if (l === best && !isBest) continue;
    if (l.pv[0] === uci) continue;
    const altSan = pvToSan(fen, [l.pv[0]])[0];
    if (!altSan) continue;
    const altLoss = bestScore !== null ? Math.max(0, Math.min(3000, bestScore - lineScore(l))) : 0;
    const { reasons: ar, move: am } = quickReasons(fen, l.pv[0]);
    const goodR = ar.find((r) => r.good);
    const badR = ar.find((r) => !r.good);
    const idea = goodR ? goodR.short : am ? `cherche à ${describeMove(fen, am, 'inf')}` : '';
    let text: string;
    if (altLoss < 30) {
      text = `${altSan} ${idea} : ${pick(['c’est presque aussi bon', 'une alternative tout à fait jouable', 'quasiment équivalent'], seed + altSan.length)} (${formatScore(l, c)}). Le choix est surtout une question de style.`;
    } else {
      let why = '';
      if (badR) why = `mais il ${badR.short}`;
      else if (l.pv[1]) {
        const afterAlt = playUci(fen, l.pv[0])?.fen;
        const rSan = afterAlt ? pvToSan(afterAlt, [l.pv[1]])[0] : undefined;
        const rIdea = afterAlt ? quickReasons(afterAlt, l.pv[1]).reasons.find((r) => r.good && r.weight >= 30) : undefined;
        if (rSan && rIdea) why = `mais ${sideName(e)} répondent ${rSan}, qui ${rIdea.short}`;
        else if (rSan) why = `mais après ${rSan}, ${sideName(e)} s’en sortent mieux qu’après ${isBest ? move.san : bestSan}`;
      }
      text = `${altSan} ${idea}${why ? `, ${why}` : ''}. C’est moins précis : environ ${pawnsText(altLoss)} de moins que ${isBest ? move.san : bestSan} (${formatScore(l, c)}).`;
    }
    alternatives.push({ uci: l.pv[0], san: altSan, lossCp: altLoss, line: formatLine(fen, l.pv, 8), text });
  }

  return { uci, san: move.san, evalText, headline: capital(headline.replace(/\s+/g, ' ').trim()), points, plan, alternatives };
}

/** Analyse une position avec le moteur puis explique le meilleur coup. */
export async function explainPosition(
  fen: string,
  engine: StockfishEngine,
  opts: { depth?: number; multipv?: number } = {},
): Promise<{ analysis: AnalysisResult; best: MoveExplanation | null }> {
  const analysis = await engine.analyse(fen, { depth: opts.depth ?? 14, multipv: opts.multipv ?? 3 });
  const bestUci = analysis.lines[0]?.pv[0] ?? analysis.bestMove;
  const best = bestUci ? explainMove(fen, bestUci, analysis) : null;
  return { analysis, best };
}
