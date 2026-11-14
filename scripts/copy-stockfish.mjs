// Copie le moteur Stockfish 17.1 « lite single-thread » (WASM) dans public/stockfish.
// Version single-thread : GitHub Pages ne fournit pas les en-têtes COOP/COEP requis par la version multi-thread.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const src = join('node_modules', 'stockfish', 'src');
const dest = join('public', 'stockfish');
mkdirSync(dest, { recursive: true });
const files = readdirSync(src);
const js = files.find((f) => /^stockfish-.*-lite-single-[0-9a-f]+\.js$/.test(f));
const wasm = files.find((f) => /^stockfish-.*-lite-single-[0-9a-f]+\.wasm$/.test(f));
if (!js || !wasm) throw new Error('Stockfish lite-single introuvable dans node_modules/stockfish/src');
// Le JS charge le .wasm portant le même nom que lui : on renomme les deux de façon cohérente.
copyFileSync(join(src, js), join(dest, 'stockfish.js'));
copyFileSync(join(src, wasm), join(dest, 'stockfish.wasm'));
console.log(`Stockfish copié : ${js} -> public/stockfish/stockfish.js`);
