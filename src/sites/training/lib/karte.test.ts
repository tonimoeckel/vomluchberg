import { describe, expect, it } from 'vitest';
import { karte, zufall } from './karte';

describe('survey sketch', () => {
  it('is deterministic for a seed', () => {
    expect(karte({ seed: 3 })).toEqual(karte({ seed: 3 }));
    expect(karte({ seed: 3 }).linien[0].d).not.toEqual(karte({ seed: 4 }).linien[0].d);
  });

  it('draws contour lines, every fifth one heavier, and all layers', () => {
    const k = karte();
    expect(k.linien.length).toBeGreaterThan(8);
    expect(k.linien.some((l) => l.stark)).toBe(true);
    for (const l of k.linien) expect(l.d).toMatch(/^M[\d.]+ [\d.]+L/);
    expect(k.bach).toMatch(/^M/);
    expect(k.weg).toMatch(/^M/);
    expect(k.wald).toMatch(/^M\d+ \d+h0/);
  });

  it('puts the summit and the river inside the map, the river east of the summit', () => {
    const k = karte();
    for (const p of [k.gipfel, k.fluss]) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(k.breite);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(k.hoehe);
    }
    expect(k.fluss.x).toBeGreaterThan(k.gipfel.x);
  });

  it('stays small enough to inline', () => {
    const k = karte();
    const groesse = k.linien.reduce((n, l) => n + l.d.length, 0) + k.bach.length + k.weg.length + k.wald.length;
    expect(groesse).toBeLessThan(60_000);
  });

  it('has a PRNG in 0..1', () => {
    const r = zufall(1);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
