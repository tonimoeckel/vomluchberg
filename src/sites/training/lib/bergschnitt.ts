/**
 * The Luchberg in section (the `ebenen` section of an offer page, Bergschnitt.astro): a wide base
 * (the foundation, "Beziehung") under the basalt cone (the summit, "Signale"), hatched with level
 * lines like a survey section, with a dog's trail walking up the left flank. A sketch, not to scale:
 * only the summit height (576 m) is real. Pure: numbers and path strings, no DOM.
 */
import { pfotenspur, type Pfote, type Punkt } from './pfotenspur';

/** The drawing's box (viewBox 0 0 breite hoehe); `boden` is the ground line, `schulter` the line between the two levels. */
export const BERG = { breite: 600, hoehe: 400, boden: 384, schulter: 236, gipfel: 64 } as const;

/** The outline from the left ground to the right ground: gentle foothills, the shoulder, the steep cone with a flat top. */
export const profil: readonly Punkt[] = [
  { x: 0, y: 384 }, { x: 44, y: 374 }, { x: 108, y: 336 }, { x: 150, y: 268 }, { x: 176, y: 236 },
  { x: 246, y: 100 }, { x: 268, y: 74 }, { x: 312, y: 64 }, { x: 350, y: 70 }, { x: 424, y: 236 },
  { x: 452, y: 270 }, { x: 500, y: 336 }, { x: 558, y: 374 }, { x: 600, y: 384 },
];

const rund = (v: number) => Math.round(v * 10) / 10;

/** The closed outline as an SVG path (along the ground back to the start). */
export const profilPfad = (p: readonly Punkt[] = profil) =>
  `M${p.map((q) => `${rund(q.x)} ${rund(q.y)}`).join('L')}L${BERG.breite} ${BERG.hoehe}L0 ${BERG.hoehe}Z`;

/** Left and right edge of the hill at height y (the outermost crossings), or null above the summit or below the ground. */
export function querschnitt(y: number, p: readonly Punkt[] = profil): [number, number] | null {
  const xs: number[] = [];
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1], b = p[i];
    if ((a.y - y) * (b.y - y) > 0 || a.y === b.y) continue;
    xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
  }
  return xs.length >= 2 ? [Math.min(...xs), Math.max(...xs)] : null;
}

export interface Linie { y: number; x1: number; x2: number }

/** Level lines between two heights (top to bottom), `abstand` apart, kept `rand` inside the outline. */
export function schraffur(oben: number, unten: number, abstand: number, rand = 6): Linie[] {
  const linien: Linie[] = [];
  for (let y = oben + abstand / 2; y < unten; y += abstand) {
    const q = querschnitt(y);
    if (!q || q[1] - q[0] <= 2 * rand) continue;
    linien.push({ y: rund(y), x1: rund(q[0] + rand), x2: rund(q[1] - rand) });
  }
  return linien;
}

/** The trail up the left flank to the summit plateau: the way up leads over the foundation. */
export const aufstieg: readonly Punkt[] = [
  { x: 40, y: 392 }, { x: 104, y: 356 }, { x: 150, y: 296 }, { x: 196, y: 232 }, { x: 248, y: 126 }, { x: 290, y: 84 },
];

export const aufstiegSpur = (): Pfote[] =>
  pfotenspur([...aufstieg], { schritt: 30, versatz: 5, hoechstens: 13, wackeln: 6, seed: 7 });

/** Where a label sits (fractions of the box), centred between the outlines: the summit and the foundation. */
export const beschriftung = {
  gipfel: { x: 0.52, y: (BERG.gipfel + BERG.schulter) / 2 / BERG.hoehe + 0.06 },
  fundament: { x: 0.5, y: (BERG.schulter + BERG.boden) / 2 / BERG.hoehe },
} as const;
