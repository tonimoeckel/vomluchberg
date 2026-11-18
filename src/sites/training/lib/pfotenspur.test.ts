import { describe, expect, it } from 'vitest';
import { karte, pfotenwege } from './karte';
import { laenge, pfotenspur, punktBei } from './pfotenspur';

const gerade = [{ x: 0, y: 100 }, { x: 400, y: 100 }];

describe('paw trail', () => {
  it('is deterministic for a seed', () => {
    expect(pfotenspur(gerade, { seed: 2 })).toEqual(pfotenspur(gerade, { seed: 2 }));
    expect(pfotenspur(gerade, { seed: 2 })).not.toEqual(pfotenspur(gerade, { seed: 3 }));
  });

  it('measures and walks a polyline', () => {
    expect(laenge([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 10 }])).toBe(11);
    expect(punktBei(gerade, 100).p).toEqual({ x: 100, y: 100 });
    expect(punktBei(gerade, 999).p).toEqual({ x: 400, y: 100 });
  });

  it('alternates left and right of the route, at about the offset', () => {
    const spur = pfotenspur(gerade, { versatz: 6, hoechstens: 10 });
    expect(spur).toHaveLength(10);
    spur.forEach((p, i) => {
      if (i > 0) expect(p.seite).not.toBe(spur[i - 1].seite);
      // Walking east with y down: left is north (smaller y).
      const abstand = p.y - 100;
      expect(Math.abs(abstand)).toBeGreaterThan(4);
      expect(Math.abs(abstand)).toBeLessThan(8);
      expect(Math.sign(abstand)).toBe(p.seite === 'links' ? -1 : 1);
    });
  });

  it('turns each print to the walking direction', () => {
    for (const p of pfotenspur(gerade)) expect(Math.abs(p.winkel)).toBeLessThanOrEqual(9);
    const hoch = pfotenspur([{ x: 0, y: 400 }, { x: 0, y: 0 }]);
    for (const p of hoch) expect(Math.abs(p.winkel + 90)).toBeLessThanOrEqual(9);
  });

  it('moves forward at an uneven trot, not a march', () => {
    const spur = pfotenspur(gerade, { hoechstens: 9 });
    const xs = spur.map((p) => p.x), zeiten = spur.map((p) => p.zeit);
    for (let i = 1; i < spur.length; i++) {
      expect(xs[i]).toBeGreaterThan(xs[i - 1]);
      expect(zeiten[i]).toBeGreaterThan(zeiten[i - 1]);
    }
    const takte = zeiten.slice(1).map((z, i) => z - zeiten[i]);
    // short, long, short, long …
    for (let i = 1; i < takte.length; i++) expect(Math.sign(takte[i] - takte[i - 1])).toBe(i % 2 === 1 ? 1 : -1);
  });

  it('stops at the end of a short route and at the cap', () => {
    expect(pfotenspur([{ x: 0, y: 0 }, { x: 60, y: 0 }]).length).toBeLessThanOrEqual(2);
    expect(pfotenspur([{ x: 0, y: 0 }, { x: 5000, y: 0 }], { hoechstens: 7 })).toHaveLength(7);
  });

  it('finds three routes on the hero map, all inside it, a handful of prints each', () => {
    const k = karte({ gipfelX: 0.27, gipfelY: 0.19, waldSchwelle: 0.63 });
    const wege = pfotenwege(k);
    expect(wege).toHaveLength(3);
    for (const weg of wege) {
      const spur = pfotenspur(weg);
      expect(spur.length).toBeGreaterThanOrEqual(6);
      expect(spur.length).toBeLessThanOrEqual(12);
      for (const p of spur) {
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(k.breite);
        expect(p.y).toBeGreaterThan(0);
        expect(p.y).toBeLessThan(k.hoehe);
      }
    }
    // The contour route ends next to the summit.
    const ende = wege[1].at(-1)!;
    expect(Math.hypot(ende.x - k.gipfel.x, ende.y - k.gipfel.y)).toBeLessThan(k.breite * 0.03);
  });

  it('follows the forest track', () => {
    const k = karte();
    expect(k.wegLinie[0]).toEqual({ x: -10, y: k.hoehe * 0.78 });
    expect(k.wegLinie.at(-1)).toEqual({ x: k.breite + 10, y: k.hoehe * 0.38 });
    expect(k.weg).toBe('M-10 624C336 496 576 736 864 560S1140 336 1210 304');
  });
});
