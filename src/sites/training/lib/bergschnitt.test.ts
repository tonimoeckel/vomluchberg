import { describe, expect, it } from 'vitest';
import { BERG, aufstiegSpur, beschriftung, profil, profilPfad, querschnitt, schraffur } from './bergschnitt';

describe('profil', () => {
  it('runs from the left to the right ground, the summit at the top', () => {
    expect(profil[0]).toEqual({ x: 0, y: BERG.boden });
    expect(profil.at(-1)).toEqual({ x: BERG.breite, y: BERG.boden });
    expect(Math.min(...profil.map((p) => p.y))).toBe(BERG.gipfel);
    for (let i = 1; i < profil.length; i++) expect(profil[i].x).toBeGreaterThan(profil[i - 1].x);
  });

  it('is a closed path', () => {
    expect(profilPfad()).toMatch(/^M0 384L.*Z$/);
  });
});

describe('querschnitt', () => {
  it('is wide at the base and narrow at the top', () => {
    const fuss = querschnitt(330)!, kegel = querschnitt(150)!;
    expect(fuss[1] - fuss[0]).toBeGreaterThan(2 * (kegel[1] - kegel[0]));
  });

  it('is empty above the summit', () => {
    expect(querschnitt(BERG.gipfel - 1)).toBeNull();
  });
});

describe('schraffur', () => {
  it('stays inside the outline and between the heights', () => {
    const linien = schraffur(BERG.schulter, BERG.boden, 14);
    expect(linien.length).toBeGreaterThan(5);
    for (const l of linien) {
      const [a, b] = querschnitt(l.y)!;
      expect(l.y).toBeGreaterThan(BERG.schulter);
      expect(l.y).toBeLessThan(BERG.boden);
      expect(l.x1).toBeGreaterThan(a);
      expect(l.x2).toBeLessThan(b);
    }
  });
});

describe('labels', () => {
  it('leave room for a word at the summit label (about a third of the width)', () => {
    const [a, b] = querschnitt(beschriftung.gipfel.y * BERG.hoehe)!;
    expect((b - a) / BERG.breite).toBeGreaterThan(0.3);
  });
});

describe('aufstiegSpur', () => {
  it('walks uphill inside the box, the same every build', () => {
    const spur = aufstiegSpur();
    expect(spur.length).toBeGreaterThan(8);
    expect(spur.at(-1)!.y).toBeLessThan(spur[0].y);
    for (const p of spur) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(BERG.breite);
      expect(p.y).toBeLessThan(BERG.hoehe);
    }
    expect(aufstiegSpur()).toEqual(spur);
  });
});
