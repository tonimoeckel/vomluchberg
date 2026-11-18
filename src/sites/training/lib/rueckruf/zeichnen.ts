// Canvas drawing of the "Rückruf" game: line art like the survey map, in the site's colour tokens
// (every scheme, light and dark). No image assets. World y points up from the stage floor; the
// stage is H units high and scaled to the canvas by spiel.ts.

import type { AblenkungArt, Level } from './level';
import type { Zustand } from './physik';
import { hinweise, meldungen } from './texte';

export const H = 300;
/** Where the dog runs on screen, as a fraction of the stage width. */
export const HUND_X = 0.22;
/** Screen height of the ground under the dog. */
export const BODEN_Y = 222;

export interface Farben {
  bg: string; surface: string; card: string; fg: string; heading: string; muted: string; border: string;
  primary: string; onPrimary: string; copper: string; contour: string; contourStark: string; forest: string; water: string; lane: string;
}

export const farbTokens: Record<keyof Farben, [string, string]> = {
  bg: ['--bg', '#f4efe0'], surface: ['--surface', '#ebe5d1'], card: ['--card', '#fbf9f1'], fg: ['--fg', '#1a2a1f'],
  heading: ['--heading', '#16291d'], muted: ['--muted', '#4a5848'], border: ['--border', '#d4cdb5'],
  primary: ['--primary', '#3a6b2a'], onPrimary: ['--on-primary', '#fdfcf6'], copper: ['--copper', '#a86a3c'],
  contour: ['--contour', '#cfa98a'], contourStark: ['--contour-strong', '#b98a66'], forest: ['--forest', '#a9b79a'],
  water: ['--water', '#6f8ea3'], lane: ['--lane', '#dfe2c8'],
};

const SCHRIFT = "'Red Hat Text', system-ui, sans-serif";
const DISPLAY = "'Red Hat Display', 'Red Hat Text', system-ui, sans-serif";
const MONO = "'Red Hat Mono', ui-monospace, monospace";

/** Small hash for stable pseudo-random decoration (forest dots). */
const hash = (n: number) => {
  let t = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  t ^= t >>> 13;
  t = Math.imul(t, 0xc2b2ae35);
  return ((t ^ (t >>> 16)) >>> 0) / 4294967296;
};

export interface Bild {
  ctx: CanvasRenderingContext2D;
  /** stage width in world units */
  breite: number;
  f: Farben;
  reduziert: boolean;
}

/** Camera: the dog at HUND_X of the width, stopping at the end of the track. */
export const kamera = (z: Zustand, level: Level, breite: number) =>
  Math.min(Math.max(z.x - breite * HUND_X, 0), level.laenge - breite);

export function zeichne(b: Bild, z: Zustand, level: Level): void {
  const { ctx, breite, f } = b;
  const kx = kamera(z, level, breite);
  // Vertical camera: the ground under the dog stays at the same height on screen.
  const hub = H - BODEN_Y - level.boden(z.x);
  const sy = (y: number) => H - y - hub;
  const boden = (sx: number) => sy(level.boden(sx + kx));
  ctx.fillStyle = f.bg;
  ctx.fillRect(0, 0, breite, H);

  // The Luchberg in the far background (cut through the summit), drawn as nested contours.
  const spanne = Math.max(breite * 2.6, 1500);
  const bx0 = breite * 0.58 - 0.36 * spanne - kx * (b.reduziert ? 0 : 0.18);
  ctx.lineWidth = 1.1;
  for (let k = 0; k < 4; k++) {
    ctx.strokeStyle = k === 0 ? f.contourStark : f.contour;
    ctx.beginPath();
    level.berg.forEach((v, i) => {
      const x = bx0 + (i / (level.berg.length - 1)) * spanne;
      const y = 214 - v * (150 - k * 30) + k * 8;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  const gipfelX = bx0 + (level.berg.indexOf(Math.max(...level.berg)) / (level.berg.length - 1)) * spanne;
  if (gipfelX > -60 && gipfelX < breite + 60) {
    ctx.fillStyle = f.muted;
    ctx.font = `500 11px ${SCHRIFT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Luchberg', gipfelX, 54);
    ctx.font = `500 10px ${MONO}`;
    ctx.fillText('576 m', gipfelX, 67);
  }

  // Forest dots, like the map's forest symbols, on a slower layer above the track.
  const tiefe = b.reduziert ? 1 : 0.6;
  const fx = kx * tiefe;
  ctx.fillStyle = f.forest;
  for (let gx = Math.floor(fx / 18) * 18; gx < fx + breite + 18; gx += 18) {
    const zelle = gx / 18;
    const dicht = Math.sin(zelle * 0.07) + Math.sin(zelle * 0.023 + 1.3);
    if (dicht < 0.15) continue;
    for (let r = 0; r < 3; r++) {
      const h = hash(zelle * 7 + r);
      if (h > 0.25 + dicht * 0.3) continue;
      const sx = gx - fx + hash(zelle * 13 + r) * 14;
      ctx.beginPath();
      ctx.arc(sx, boden(sx) - 22 - r * 16 - h * 14, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Ground and the forest track (dashed, as on the map).
  ctx.beginPath();
  ctx.moveTo(0, H);
  for (let sx = 0; sx <= breite + 4; sx += 4) ctx.lineTo(sx, boden(sx));
  ctx.lineTo(breite + 4, H);
  ctx.closePath();
  ctx.fillStyle = f.surface;
  ctx.fill();
  ctx.beginPath();
  for (let sx = 0; sx <= breite + 4; sx += 4) (sx === 0 ? ctx.moveTo(sx, boden(sx)) : ctx.lineTo(sx, boden(sx)));
  ctx.strokeStyle = f.heading;
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.beginPath();
  for (let sx = 0; sx <= breite + 4; sx += 4) (sx === 0 ? ctx.moveTo(sx, boden(sx) + 9) : ctx.lineTo(sx, boden(sx) + 9));
  ctx.setLineDash([8, 6]);
  ctx.lineDashOffset = kx % 14;
  ctx.strokeStyle = f.muted;
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.setLineDash([]);

  // Obstacles.
  level.hindernisse.forEach((o) => {
    const x = o.x - kx;
    if (x > breite + 20 || x + o.breite < -20) return;
    const g = boden(x + o.breite / 2);
    hindernis(ctx, f, o.art, x, g, o.breite, z.zeit);
  });

  // You, on the far bank, calling.
  const ichX = level.laenge - 150 - kx;
  if (ichX < breite + 30) mensch(ctx, f, ichX, boden(ichX), z.phase !== 'ziel' && !z.ende);

  // Distractions.
  level.ablenkungen.forEach((a, i) => {
    const x = a.x - kx;
    if (x > breite + 60 || x < -80) return;
    // They start moving once the dog has noticed them.
    const seit = z.bemerktUm[i] >= 0 ? Math.min(z.zeit - z.bemerktUm[i], 3) : 0;
    ablenkung(ctx, f, a.art, x, boden(x), seit, z.zeit, b.reduziert);
  });

  // The dog.
  const dx = z.x - kx;
  const dy = sy(z.y);
  const pose = z.phase === 'ziel' || z.ende?.art === 'ziel' ? 'sitz' : !z.amBoden ? 'luft' : z.phase === 'bemerkt' || z.phase === 'abgelenkt' ? 'schaut' : 'lauf';
  const weg = z.phase === 'weg' ? Math.min((z.zeit - z.phaseSeit) / 1.4, 1) : 0;
  ctx.globalAlpha = 1 - weg;
  hund(ctx, f, dx, dy, z.weg, pose, z.phase === 'ziel' ? Math.min((z.zeit - z.phaseSeit) / 0.6, 1) : 1, z.zeit < z.stolperBis);
  ctx.globalAlpha = 1;

  // Cue: the dog has noticed something; the ring shows the recall window running out.
  if (z.phase === 'bemerkt') {
    const rest = 1 - (z.zeit - z.phaseSeit) / level.stufe.fenster;
    const cx = dx + 26, cy = dy - 66;
    ctx.fillStyle = f.primary;
    ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = f.primary;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(cx, cy, 16, -Math.PI / 2, -Math.PI / 2 + Math.max(rest, 0) * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = f.onPrimary;
    ctx.font = `600 15px ${DISPLAY}`;
    ctx.textAlign = 'center';
    ctx.fillText('!', cx, cy + 5);
  }

  // Floating feedback word.
  if (z.meldung && z.zeit - z.meldung.zeit < 0.9) {
    const t = (z.zeit - z.meldung.zeit) / 0.9;
    ctx.globalAlpha = 1 - t * t;
    ctx.fillStyle = z.meldung.art === 'hier' ? f.primary : f.heading;
    ctx.font = `600 16px ${DISPLAY}`;
    ctx.textAlign = 'center';
    ctx.fillText(meldungen[z.meldung.art], dx + 6, dy - 74 - (b.reduziert ? 0 : t * 18));
    ctx.globalAlpha = 1;
  }

  hud(b, z, level);
}

function hud(b: Bild, z: Zustand, level: Level) {
  const { ctx, breite, f } = b;
  ctx.textAlign = 'left';
  ctx.fillStyle = f.muted;
  ctx.font = `500 12px ${SCHRIFT}`;
  ctx.fillText('Ablenkung', 14, 22);
  for (let i = 0; i < level.stufe.geduld; i++) {
    ctx.beginPath();
    ctx.arc(84 + i * 15, 18, 5, 0, Math.PI * 2);
    ctx.fillStyle = i < z.meter ? f.copper : f.bg;
    ctx.fill();
    ctx.strokeStyle = f.copper;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }
  // Progress: a hairline from the dog to you.
  const a = breite - 150, e = breite - 16;
  ctx.strokeStyle = f.border;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(a, 18); ctx.lineTo(e, 18); ctx.stroke();
  const t = Math.min(z.x / level.ziel, 1);
  ctx.strokeStyle = f.heading;
  ctx.beginPath(); ctx.moveTo(a, 18); ctx.lineTo(a + (e - a) * t, 18); ctx.stroke();
  ctx.fillStyle = f.heading;
  ctx.beginPath(); ctx.arc(a + (e - a) * t, 18, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(e - 1, 12, 2, 12);

  // One-off help lines.
  let hilfe = '';
  const naechstes = level.hindernisse.find((o, k) => !z.getroffen[k] && o.x > z.x);
  if (!z.hinweis.sprung && naechstes && naechstes.x - z.x < 420) hilfe = hinweise.sprung;
  if (z.phase === 'bemerkt' && z.ablenkung.filter((s) => s !== 'offen').length < 2) hilfe = hinweise.ruf;
  if (hilfe) {
    ctx.font = `600 15px ${DISPLAY}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = f.heading;
    ctx.fillText(hilfe, breite / 2, 52);
  }
}

function hindernis(ctx: CanvasRenderingContext2D, f: Farben, art: string, x: number, g: number, w: number, zeit: number) {
  ctx.lineCap = 'round';
  if (art === 'wurzel') {
    ctx.strokeStyle = f.heading;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, g + 2);
    ctx.quadraticCurveTo(x + w * 0.3, g - 22, x + w * 0.55, g);
    ctx.moveTo(x + w * 0.4, g + 1);
    ctx.quadraticCurveTo(x + w * 0.75, g - 14, x + w, g + 2);
    ctx.stroke();
  } else if (art === 'stamm') {
    ctx.fillStyle = f.card;
    ctx.strokeStyle = f.heading;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(x, g - 24, w, 24, 12);
    ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + w - 9, g - 12, 7, 11, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + w - 9, g - 12, 3, 5, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 10, g - 16); ctx.lineTo(x + 24, g - 16); ctx.moveTo(x + 16, g - 8); ctx.lineTo(x + 30, g - 8); ctx.stroke();
  } else if (art === 'pfuetze') {
    ctx.fillStyle = f.water;
    ctx.beginPath(); ctx.ellipse(x + w / 2, g + 1, w / 2, 4, 0, 0, Math.PI * 2); ctx.fill();
  } else if (art === 'bach') {
    ctx.fillStyle = f.bg;
    ctx.fillRect(x, g - 1, w, 30);
    ctx.fillStyle = f.water;
    ctx.beginPath();
    ctx.moveTo(x - 4, g);
    ctx.quadraticCurveTo(x + 4, g + 26, x + w / 2, g + 26);
    ctx.quadraticCurveTo(x + w - 4, g + 26, x + w + 4, g);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = f.bg;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = 0; i <= 12; i++) {
      const px = x + 10 + (i / 12) * (w - 20);
      const py = g + 9 + Math.sin(i * 1.4 + zeit * 4) * 1.6;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = f.muted;
    ctx.font = `italic 500 11px ${SCHRIFT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Müglitz', x + w / 2, g + 46);
  }
}

function mensch(ctx: CanvasRenderingContext2D, f: Farben, x: number, g: number, ruft: boolean) {
  ctx.strokeStyle = f.heading;
  ctx.fillStyle = f.heading;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 7, g); ctx.lineTo(x, g - 30); ctx.lineTo(x + 7, g); // legs
  ctx.moveTo(x, g - 30); ctx.lineTo(x, g - 58); // body
  ctx.moveTo(x, g - 50); ctx.lineTo(x + 9, g - 34); // arm down
  if (ruft) { ctx.moveTo(x, g - 50); ctx.lineTo(x - 12, g - 68); } else { ctx.moveTo(x, g - 50); ctx.lineTo(x - 10, g - 34); }
  ctx.stroke();
  ctx.beginPath(); ctx.arc(x, g - 67, 7, 0, Math.PI * 2); ctx.fill();
  if (ruft) {
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = f.copper;
    for (let i = 1; i <= 2; i++) { ctx.beginPath(); ctx.arc(x - 10, g - 67, 6 + i * 6, Math.PI * 0.8, Math.PI * 1.2); ctx.stroke(); }
  }
}

function ablenkung(ctx: CanvasRenderingContext2D, f: Farben, art: AblenkungArt, x: number, g: number, seit: number, zeit: number, reduziert: boolean) {
  const bewegt = reduziert ? 0 : 1;
  ctx.fillStyle = f.copper;
  ctx.strokeStyle = f.heading;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  if (art === 'reh') {
    // Grazes, then lifts its head and bounds away uphill once noticed.
    const vx = x + seit * 70 * bewegt, vy = g - 6 - Math.abs(Math.sin(seit * 6)) * 10 * Math.min(seit * 3, 1) * bewegt;
    const kopfHoch = seit > 0;
    ctx.beginPath(); ctx.ellipse(vx, vy - 24, 17, 9, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = f.copper;
    ctx.beginPath();
    for (const [lx, w] of [[-11, 0.3], [-6, -0.3], [8, 0.3], [13, -0.3]] as const) {
      const s = Math.sin(seit * 12) * w * Math.min(seit * 3, 1) * bewegt;
      ctx.moveTo(vx + lx, vy - 18); ctx.lineTo(vx + lx + s * 14, vy);
    }
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(vx + 13, vy - 28); ctx.lineTo(vx + 20, kopfHoch ? vy - 46 : vy - 16); ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = f.heading;
    const kx = vx + 23, ky = kopfHoch ? vy - 48 : vy - 12;
    ctx.beginPath(); ctx.ellipse(kx, ky, 7, 5, kopfHoch ? -0.3 : 0.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(kx - 4, ky - 6, 2, 5, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = f.bg;
    ctx.beginPath(); ctx.arc(vx - 15, vy - 26, 3.5, 0, Math.PI * 2); ctx.fill();
  } else if (art === 'eichhoernchen') {
    // A small tree beside the track; the squirrel runs up and down the trunk.
    ctx.strokeStyle = f.heading;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, g); ctx.lineTo(x, g - 78); ctx.stroke();
    ctx.fillStyle = f.forest;
    for (const [ox, oy, r] of [[0, -88, 16], [-12, -78, 11], [12, -76, 12]] as const) { ctx.beginPath(); ctx.arc(x + ox, g + oy, r, 0, Math.PI * 2); ctx.fill(); }
    const hoch = g - 12 - (seit ? (Math.sin(zeit * 3) * 0.5 + 0.5) * 40 * bewegt : 0);
    ctx.fillStyle = f.copper;
    ctx.strokeStyle = f.heading;
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(x + 7, hoch, 4, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 8, hoch - 9, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x + 14, hoch - 4, 4.5, 9, 0.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (art === 'jogger') {
    // Comes towards the dog along the track.
    const jx = x - seit * 60 * bewegt, s = Math.sin(zeit * 10) * bewegt;
    ctx.strokeStyle = f.copper;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(jx, g - 30); ctx.lineTo(jx - 8 * s, g - 14); ctx.lineTo(jx - 10 * s, g);
    ctx.moveTo(jx, g - 30); ctx.lineTo(jx + 8 * s, g - 14); ctx.lineTo(jx + 6 * s - 2, g);
    ctx.moveTo(jx, g - 30); ctx.lineTo(jx - 2, g - 54);
    ctx.moveTo(jx - 1, g - 48); ctx.lineTo(jx - 9 * s, g - 38);
    ctx.moveTo(jx - 1, g - 48); ctx.lineTo(jx + 9 * s, g - 40);
    ctx.stroke();
    ctx.fillStyle = f.copper;
    ctx.beginPath(); ctx.arc(jx - 3, g - 62, 6.5, 0, Math.PI * 2); ctx.fill();
  } else if (art === 'hund') {
    // Another dog on a lead, with its person; it wags and barks.
    ctx.strokeStyle = f.heading;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x + 30, g); ctx.lineTo(x + 34, g - 26); ctx.lineTo(x + 38, g);
    ctx.moveTo(x + 34, g - 26); ctx.lineTo(x + 34, g - 50);
    ctx.moveTo(x + 34, g - 44); ctx.lineTo(x + 20, g - 30);
    ctx.stroke();
    ctx.fillStyle = f.heading;
    ctx.beginPath(); ctx.arc(x + 34, g - 57, 6, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 20, g - 30); ctx.quadraticCurveTo(x + 10, g - 18, x + 2, g - 20); ctx.stroke();
    ctx.fillStyle = f.copper;
    ctx.beginPath(); ctx.ellipse(x - 4, g - 13, 11, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - 15, g - 20, 5.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = f.copper;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x - 10, g - 9); ctx.lineTo(x - 11, g); ctx.moveTo(x + 3, g - 9); ctx.lineTo(x + 4, g);
    const wedel = seit ? Math.sin(zeit * 18) * 5 * bewegt : 0;
    ctx.moveTo(x + 6, g - 15); ctx.lineTo(x + 13, g - 22 + wedel);
    ctx.stroke();
    if (seit && Math.sin(zeit * 6) > 0) {
      ctx.strokeStyle = f.heading;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x - 24, g - 24); ctx.lineTo(x - 30, g - 28); ctx.moveTo(x - 24, g - 20); ctx.lineTo(x - 31, g - 20); ctx.stroke();
    }
  } else {
    // A sausage on the track, with its string ends.
    ctx.beginPath(); ctx.roundRect(x - 13, g - 8, 26, 8, 4); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 13, g - 4); ctx.lineTo(x - 17, g - 7); ctx.moveTo(x + 13, g - 4); ctx.lineTo(x + 17, g - 7); ctx.stroke();
    if (seit && !reduziert) {
      ctx.strokeStyle = f.muted;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const y0 = g - 14 - ((zeit * 20 + i * 8) % 22);
        ctx.moveTo(x - 6 + i * 6, y0); ctx.quadraticCurveTo(x - 3 + i * 6, y0 - 4, x - 6 + i * 6, y0 - 8); ctx.stroke();
      }
    }
  }
}

/** The Rottweiler: black with tan points, facing right. `x` is the middle of the body, `y` the paws. */
function hund(ctx: CanvasRenderingContext2D, f: Farben, x: number, y: number, weg: number, pose: 'lauf' | 'luft' | 'sitz' | 'schaut', sitzen: number, stolpert: boolean) {
  const schwarz = f.heading, braun = f.copper;
  const phase = weg / 9;
  ctx.save();
  ctx.translate(x, y);
  if (stolpert) ctx.rotate(0.12);
  ctx.lineCap = 'round';
  // Body tilt when sitting: the rear goes down.
  const kipp = pose === 'sitz' ? -0.45 * sitzen : pose === 'luft' ? -0.08 : 0;
  const rumpfY = -26 + (pose === 'sitz' ? 8 * sitzen : 0);
  const bein = (hx: number, hy: number, winkel: number, laenge: number, knick = 0) => {
    const kx = hx + Math.sin(winkel) * laenge * 0.55, ky = hy + Math.cos(winkel) * laenge * 0.55;
    const ex = kx + Math.sin(winkel + knick) * laenge * 0.5, ey = ky + Math.cos(winkel + knick) * laenge * 0.5;
    ctx.strokeStyle = schwarz; ctx.lineWidth = 5.5;
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(kx, ky); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = braun; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(ex - Math.sin(winkel + knick) * 4, ey - Math.cos(winkel + knick) * 4); ctx.lineTo(ex + 1.5, ey); ctx.stroke();
  };
  // Legs: diagonal pairs while running, stretched in the air, folded when sitting.
  const s = pose === 'lauf' ? Math.sin(phase) * 0.65 : pose === 'schaut' ? Math.sin(phase) * 0.2 : 0;
  if (pose === 'sitz') {
    bein(16, rumpfY + 6, -0.05 * sitzen, 22);
    bein(-15, rumpfY + 10, 1.2 * sitzen, 16, -1.8 * sitzen);
  } else if (pose === 'luft') {
    bein(-15, rumpfY + 6, -0.9, 20, 0.5); bein(16, rumpfY + 6, 0.9, 20, -0.4);
    bein(-12, rumpfY + 6, -0.7, 20, 0.5); bein(19, rumpfY + 6, 1.1, 20, -0.4);
  } else {
    bein(-12, rumpfY + 6, -s, 21, Math.max(0, s) * 0.6); bein(19, rumpfY + 6, s, 21, -Math.max(0, -s) * 0.6);
    bein(-15, rumpfY + 6, s, 21, Math.max(0, -s) * 0.6); bein(16, rumpfY + 6, -s, 21, -Math.max(0, s) * 0.6);
  }
  ctx.save();
  ctx.translate(14, rumpfY);
  ctx.rotate(kipp);
  ctx.translate(-14, -rumpfY);
  // Tail stub.
  ctx.strokeStyle = schwarz; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-24, rumpfY - 4); ctx.lineTo(-30, rumpfY - 10 + (pose === 'lauf' ? Math.sin(phase * 2) * 2 : 0)); ctx.stroke();
  // Body and chest.
  ctx.fillStyle = schwarz;
  ctx.beginPath(); ctx.ellipse(0, rumpfY, 26, 11, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = braun;
  ctx.beginPath(); ctx.ellipse(19, rumpfY + 5, 6, 4.5, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Head: up and alert when it has noticed something.
  const auf = pose === 'schaut' ? -6 : pose === 'sitz' ? -8 * sitzen : 0;
  const hx = 29, hy = rumpfY - 11 + auf + (pose === 'lauf' ? Math.sin(phase * 2) * 1.2 : 0);
  ctx.fillStyle = schwarz;
  ctx.lineWidth = 9; ctx.strokeStyle = schwarz;
  ctx.beginPath(); ctx.moveTo(18, rumpfY - 4); ctx.lineTo(hx - 2, hy + 3); ctx.stroke();
  ctx.beginPath(); ctx.arc(hx, hy, 9.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = braun;
  ctx.beginPath(); ctx.roundRect(hx + 4, hy - 1, 12, 8, 3.5); ctx.fill();
  ctx.fillStyle = schwarz;
  ctx.beginPath(); ctx.arc(hx + 15, hy + 1, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = braun;
  ctx.beginPath(); ctx.arc(hx + 3, hy - 6, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = f.bg;
  ctx.beginPath(); ctx.arc(hx + 3, hy - 3, 1.5, 0, Math.PI * 2); ctx.fill();
  // Ear: folded, perked up when alert.
  ctx.fillStyle = schwarz;
  ctx.beginPath();
  if (pose === 'schaut') { ctx.moveTo(hx - 7, hy - 4); ctx.lineTo(hx - 6, hy - 16); ctx.lineTo(hx + 1, hy - 8); }
  else { ctx.moveTo(hx - 6, hy - 6); ctx.lineTo(hx - 12, hy + 2); ctx.lineTo(hx - 2, hy - 1); }
  ctx.fill();
  ctx.restore();
}
