// Jeu de pièces « cburnett » (Colin M.L. Burnett, GPLv2+, utilisé par Lichess).
// Chaque pièce est un SVG carré 45×45 : centrage parfait dans la case, quel que soit l'appareil.
import wK from '../assets/pieces/wK.svg';
import wQ from '../assets/pieces/wQ.svg';
import wR from '../assets/pieces/wR.svg';
import wB from '../assets/pieces/wB.svg';
import wN from '../assets/pieces/wN.svg';
import wP from '../assets/pieces/wP.svg';
import bK from '../assets/pieces/bK.svg';
import bQ from '../assets/pieces/bQ.svg';
import bR from '../assets/pieces/bR.svg';
import bB from '../assets/pieces/bB.svg';
import bN from '../assets/pieces/bN.svg';
import bP from '../assets/pieces/bP.svg';

export const PIECE_IMAGES = { wK, wQ, wR, wB, wN, wP, bK, bQ, bR, bB, bN, bP } as const;
export type PieceCode = keyof typeof PIECE_IMAGES;

/** Format attendu par la prop `customPieces` de react-chessboard. */
export const customPieces = Object.fromEntries(
  (Object.keys(PIECE_IMAGES) as PieceCode[]).map((code) => [
    code,
    ({ squareWidth }: { squareWidth: number }) => (
      <img src={PIECE_IMAGES[code]} alt="" draggable={false} style={{ width: squareWidth, height: squareWidth, display: 'block' }} />
    ),
  ]),
);

/** Petite icône de pièce (navigation, titres, légendes). */
export function PieceIcon({ piece, size = 20, title }: { piece: PieceCode; size?: number; title?: string }) {
  return <img src={PIECE_IMAGES[piece]} width={size} height={size} alt={title ?? ''} aria-hidden={title ? undefined : true} style={{ display: 'block' }} />;
}
