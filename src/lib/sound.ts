// Sons de coup synthétisés avec Web Audio (aucun fichier à charger) : pièce posée sur du bois,
// prise (plus sec, deux impacts), échec (petit tintement de laiton). Respecte la préférence « sons ».
import { getPreferences } from './preferences';

export type SoundKind = 'move' | 'capture' | 'check' | 'end';

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Impact boisé : bruit filtré très court. */
function knock(ac: AudioContext, at: number, freq: number, gain: number) {
  const len = Math.floor(ac.sampleRate * 0.06);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
  const src = ac.createBufferSource();
  src.buffer = buf;
  const bp = ac.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = 1.4;
  const g = ac.createGain();
  g.gain.value = gain;
  src.connect(bp).connect(g).connect(ac.destination);
  src.start(at);
}

function chime(ac: AudioContext, at: number, freq: number, dur: number, gain: number) {
  const o = ac.createOscillator();
  o.type = 'sine';
  o.frequency.value = freq;
  const g = ac.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(ac.destination);
  o.start(at);
  o.stop(at + dur + 0.02);
}

export function playSound(kind: SoundKind) {
  if (!getPreferences().sound) return;
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + 0.005;
  switch (kind) {
    case 'move':
      knock(ac, t, 900, 0.9);
      break;
    case 'capture':
      knock(ac, t, 1300, 0.8);
      knock(ac, t + 0.045, 700, 1);
      break;
    case 'check':
      knock(ac, t, 900, 0.8);
      chime(ac, t + 0.02, 1318, 0.35, 0.08);
      break;
    case 'end':
      chime(ac, t, 659, 0.5, 0.08);
      chime(ac, t + 0.12, 988, 0.6, 0.07);
      break;
  }
}

/** Déduit le son à jouer en comparant deux FEN successives. */
export function soundForTransition(prevFen: string, nextFen: string, inCheck: boolean, gameOver: boolean): SoundKind {
  if (gameOver) return 'end';
  if (inCheck) return 'check';
  const count = (f: string) => f.split(' ')[0].replace(/[^a-zA-Z]/g, '').length;
  return count(nextFen) < count(prevFen) ? 'capture' : 'move';
}
