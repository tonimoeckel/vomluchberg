// The survey map of the training site: a topographic sketch of Karo's home ground, the Luchberg
// (a basalt cone, 576 m, on Glashütte land) above the Müglitz valley in the eastern Ore Mountains.
// Contour lines, the river in its valley, a forest track and forest symbols, generated at build time
// as SVG path data, so the page needs no script and no map tiles. Deterministic for a seed.
// It is a sketch, not to scale: only the cone and the valley east of it are taken from the region.

export interface KarteOptionen {
  /** viewBox width and height */
  breite?: number;
  hoehe?: number;
  /** grid cell size in viewBox units (smaller = smoother, larger output) */
  zelle?: number;
  seed?: number;
  /** number of contour levels */
  stufen?: number;
  /** summit of the cone as fractions of width and height */
  gipfelX?: number;
  gipfelY?: number;
  /** forest threshold: higher = less forest */
  waldSchwelle?: number;
}

export interface Hoehenlinie {
  d: string;
  /** every fifth line is drawn heavier, as on a survey map */
  stark: boolean;
}

export interface Karte {
  breite: number;
  hoehe: number;
  linien: Hoehenlinie[];
  /** the river along the valley floor */
  bach: string;
  /** the summit of the cone, in viewBox units */
  gipfel: { x: number; y: number };
  /** a point on the river, for its label */
  fluss: { x: number; y: number };
  /** the forest track */
  weg: string;
  /** forest symbols: one path of zero-length strokes ("M x y h0"), drawn as dots with round caps */
  wald: string;
}

/** Small seeded PRNG (mulberry32). */
export function zufall(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise on a lattice, a few octaves, normalised to 0..1. */
function rauschen(seed: number) {
  const r = zufall(seed);
  const n = 256;
  const werte = Array.from({ length: n * n }, () => r());
  const gitter = (x: number, y: number) => werte[(((y % n) + n) % n) * n + (((x % n) + n) % n)];
  const glatt = (t: number) => t * t * (3 - 2 * t);
  const oktave = (x: number, y: number) => {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = glatt(x - x0), fy = glatt(y - y0);
    const a = gitter(x0, y0), b = gitter(x0 + 1, y0), c = gitter(x0, y0 + 1), d = gitter(x0 + 1, y0 + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  return (x: number, y: number) => {
    let summe = 0, amp = 1, frq = 1, norm = 0;
    for (let o = 0; o < 4; o++) {
      summe += oktave(x * frq, y * frq) * amp;
      norm += amp;
      amp *= 0.5;
      frq *= 2;
    }
    return summe / norm;
  };
}

const rund = (v: number) => Math.round(v * 10) / 10;

/** Joins marching-squares segments that share end points into polylines. */
function verketten(segmente: [string, string][]): string[][] {
  const nachbarn = new Map<string, string[]>();
  for (const [a, b] of segmente) {
    (nachbarn.get(a) ?? nachbarn.set(a, []).get(a)!).push(b);
    (nachbarn.get(b) ?? nachbarn.set(b, []).get(b)!).push(a);
  }
  const benutzt = new Set<string>();
  const kante = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
  const weiter = (start: string, linie: string[]) => {
    let p = start;
    for (;;) {
      const n = (nachbarn.get(p) ?? []).find((q) => !benutzt.has(kante(p, q)));
      if (!n) return;
      benutzt.add(kante(p, n));
      linie.push(n);
      p = n;
    }
  };
  const linien: string[][] = [];
  // Open lines first (start at an end point), then the closed rings.
  const enden = [...nachbarn.keys()].filter((k) => nachbarn.get(k)!.length === 1);
  for (const start of [...enden, ...nachbarn.keys()]) {
    if ((nachbarn.get(start) ?? []).every((q) => benutzt.has(kante(start, q)))) continue;
    const linie = [start];
    weiter(start, linie);
    if (linie.length > 1) linien.push(linie);
  }
  return linien;
}

const pfad = (punkte: string[]) => 'M' + punkte.map((p) => p.replace(',', ' ')).join('L');

export interface Gelaende {
  breite: number;
  hoehe: number;
  noise: (x: number, y: number) => number;
  gipfel: { x: number; y: number };
  /** x of the valley floor (the Müglitz) at a given y */
  talX: (y: number) => number;
  /** unnormalised height at a map point */
  hoeheBei: (x: number, y: number) => number;
  /** the forest track: start point, then two cubic segments (the second one smooth, as in SVG "S") */
  weg: [number, number][];
}

/**
 * The terrain behind the sketch: height field, valley and track. Shared by `karte()` and the
 * "Rückruf" game (lib/rueckruf/profil.ts), which samples the height along the track.
 */
export function gelaende(optionen: KarteOptionen = {}): Gelaende {
  const { breite = 1200, hoehe = 800, seed = 11, gipfelX = 0.36, gipfelY = 0.42 } = optionen;
  const noise = rauschen(seed);
  // Height field: rolling noise, a steep cone (the Luchberg) and a valley cut east of it (the Müglitz).
  const gipfel = { x: breite * gipfelX, y: hoehe * gipfelY };
  const talX = (y: number) => breite * 0.82 + Math.sin((y / hoehe) * 3.2 + 0.6) * breite * 0.045;
  const hoeheBei = (x: number, y: number) => {
    const n = noise(x / 300, y / 300);
    const d = Math.hypot((x - gipfel.x) / breite, (y - gipfel.y) / breite);
    const kegel = 1 / (1 + (d / 0.11) ** 2);
    const tal = Math.exp(-(((x - talX(y)) / (breite * 0.09)) ** 2));
    return n * 0.5 + kegel * 0.75 - tal * 0.3;
  };
  // Forest track: a gentle curve across the lower slopes.
  const weg: [number, number][] = [
    [-10, hoehe * 0.78],
    [breite * 0.28, hoehe * 0.62], [breite * 0.48, hoehe * 0.92], [breite * 0.72, hoehe * 0.7],
    [breite * 0.95, hoehe * 0.42], [breite + 10, hoehe * 0.38],
  ];
  return { breite, hoehe, noise, gipfel, talX, hoeheBei, weg };
}

export function karte(optionen: KarteOptionen = {}): Karte {
  const { zelle = 10, seed = 11, stufen = 15, waldSchwelle = 0.56 } = optionen;
  const { breite, hoehe, noise, gipfel, talX, hoeheBei, weg: w } = gelaende(optionen);
  const spalten = Math.ceil(breite / zelle), zeilen = Math.ceil(hoehe / zelle);
  const feld: number[][] = [];
  for (let j = 0; j <= zeilen; j++) {
    feld.push([]);
    for (let i = 0; i <= spalten; i++) feld[j].push(hoeheBei(i * zelle, j * zelle));
  }
  let min = Infinity, max = -Infinity;
  for (const zeile of feld) for (const v of zeile) { min = Math.min(min, v); max = Math.max(max, v); }

  const linien: Hoehenlinie[] = [];
  for (let s = 1; s <= stufen; s++) {
    const stufe = min + ((max - min) * s) / (stufen + 1);
    const punkt = (i0: number, j0: number, i1: number, j1: number) => {
      const a = feld[j0][i0], b = feld[j1][i1];
      const t = (stufe - a) / (b - a);
      return `${rund((i0 + (i1 - i0) * t) * zelle)},${rund((j0 + (j1 - j0) * t) * zelle)}`;
    };
    const segmente: [string, string][] = [];
    for (let j = 0; j < zeilen; j++) {
      for (let i = 0; i < spalten; i++) {
        const tl = feld[j][i] > stufe ? 8 : 0, tr = feld[j][i + 1] > stufe ? 4 : 0;
        const br = feld[j + 1][i + 1] > stufe ? 2 : 0, bl = feld[j + 1][i] > stufe ? 1 : 0;
        const fall = tl | tr | br | bl;
        if (fall === 0 || fall === 15) continue;
        const oben = () => punkt(i, j, i + 1, j), rechts = () => punkt(i + 1, j, i + 1, j + 1);
        const unten = () => punkt(i, j + 1, i + 1, j + 1), links = () => punkt(i, j, i, j + 1);
        switch (fall) {
          case 1: case 14: segmente.push([links(), unten()]); break;
          case 2: case 13: segmente.push([unten(), rechts()]); break;
          case 3: case 12: segmente.push([links(), rechts()]); break;
          case 4: case 11: segmente.push([oben(), rechts()]); break;
          case 6: case 9: segmente.push([oben(), unten()]); break;
          case 7: case 8: segmente.push([links(), oben()]); break;
          case 5: segmente.push([links(), oben()], [unten(), rechts()]); break;
          case 10: segmente.push([links(), unten()], [oben(), rechts()]); break;
        }
      }
    }
    const d = verketten(segmente).filter((l) => l.length > 3).map(pfad).join('');
    if (d) linien.push({ d, stark: s % 5 === 0 });
  }

  // River: along the valley floor, wandering a little.
  const flussPunkte: string[] = [];
  for (let fy = -10; fy <= hoehe + 10; fy += 8) flussPunkte.push(`${rund(talX(fy) + (noise(fy / 90, 3.7) - 0.5) * 24)},${fy}`);
  const bach = pfad(flussPunkte);
  const fluss = { x: rund(talX(hoehe * 0.6)), y: rund(hoehe * 0.6) };

  const p = w.map(([x, y]) => `${rund(x)} ${rund(y)}`);
  const weg = `M${p[0]}C${p[1]} ${p[2]} ${p[3]}S${p[4]} ${p[5]}`;

  // Forest: symbols on a jittered grid wherever a second noise field says "wood".
  const waldNoise = rauschen(seed + 101);
  const r = zufall(seed + 7);
  const punkte: string[] = [];
  for (let wy = 14; wy < hoehe; wy += 22) {
    for (let wx = 14; wx < breite; wx += 22) {
      const px = wx + (r() - 0.5) * 12, py = wy + (r() - 0.5) * 12;
      const d = Math.hypot((px - gipfel.x) / breite, (py - gipfel.y) / breite);
      // The summit is densely wooded; the rest of the forest comes and goes with the second field.
      if (waldNoise(px / 200, py / 200) + (d < 0.09 ? 0.3 : 0) > waldSchwelle) punkte.push(`M${Math.round(px)} ${Math.round(py)}h0`);
    }
  }

  return { breite, hoehe, linien, bach, gipfel: { x: rund(gipfel.x), y: rund(gipfel.y) }, fluss, weg, wald: punkte.join('') };
}
