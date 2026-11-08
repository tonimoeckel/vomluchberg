import { describe, expect, it } from 'vitest';
import {
  dackelFarben, dackelGroessen, dackelHunde, dackelKategorien, dackelKurzinfo, dackelSteckbrief, dackelWuerfe,
  farbeLabel, groesseLabel, welpenStatus,
} from './dackel';

describe('dackelKategorien', () => {
  it('lists the categories of the dachshund site in display order', () => {
    expect(dackelKategorien).toEqual([
      { value: 'zucht', label: 'Unsere Hündinnen' },
      { value: 'deckrude', label: 'Der Vater unserer Dackel' },
      { value: 'erinnerung', label: 'In Erinnerung' },
    ]);
  });
});

describe('dackelHunde', () => {
  it('serves dogs below /unsere-dackel', () => {
    expect(dackelHunde.hundUrl('bonnie')).toBe('/unsere-dackel/bonnie');
  });

  it('names the site in the meta description', () => {
    expect(dackelHunde.hundSeo({ name: 'Bonnie', bild: '/b.jpg' })).toEqual({
      title: 'Bonnie',
      description: 'Bonnie. Rauhaardackel vom Luchberg.',
      image: '/b.jpg',
    });
  });
});

describe('dackelWuerfe', () => {
  it('serves litters below /welpen', () => {
    expect(dackelWuerfe.wuerfeListeUrl).toBe('/welpen');
    expect(dackelWuerfe.wurfUrl('a-wurf')).toBe('/welpen/a-wurf');
  });
});

describe('options', () => {
  it('has unique values', () => {
    for (const list of [dackelFarben, dackelGroessen]) {
      expect(new Set(list.map((o) => o.value)).size).toBe(list.length);
    }
  });
});

describe('farbeLabel / groesseLabel', () => {
  it('returns the labels', () => {
    expect(farbeLabel('duerrlaubfarben')).toBe('dürrlaubfarben');
    expect(groesseLabel('zwerg')).toBe('Zwerg-Rauhaardackel');
  });

  it('says nothing for unknown colours and "sonstige"', () => {
    expect(farbeLabel(null)).toBe('');
    expect(farbeLabel('lila')).toBe('');
    expect(farbeLabel('sonstige')).toBe('');
  });

  it('treats a missing size as standard', () => {
    expect(groesseLabel(undefined)).toBe('Standard-Rauhaardackel');
    expect(groesseLabel('')).toBe('Standard-Rauhaardackel');
  });
});

describe('dackelSteckbrief', () => {
  it('lists only filled rows, in display order', () => {
    expect(dackelSteckbrief({ farbe: 'wildschweinfarben', geboren: '2020-04-03T00:00:00.000Z', brustumfang: '34 cm' })).toEqual([
      { feld: 'groesse', label: 'Größe', wert: 'Standard-Rauhaardackel' },
      { feld: 'farbe', label: 'Farbe', wert: 'wildschweinfarben' },
      { feld: 'geboren', label: 'Wurftag', wert: '03.04.2020' },
      { feld: 'brustumfang', label: 'Brustumfang', wert: '34 cm' },
    ]);
  });

  it('skips blank strings', () => {
    expect(dackelSteckbrief({ eltern: '  ', abstammung: '' }).map((z) => z.feld)).toEqual(['groesse']);
  });

  it('shows the owner only for dogs that are not ours', () => {
    expect(dackelSteckbrief({ besitzer: 'Familie X' }).some((z) => z.feld === 'besitzer')).toBe(false);
    expect(dackelSteckbrief({ auswaertig: true, besitzer: 'Familie X' }).at(-1)).toEqual({
      feld: 'besitzer', label: 'Besitzer', wert: 'Familie X',
    });
  });
});

describe('dackelKurzinfo', () => {
  it('joins size and colour', () => {
    expect(dackelKurzinfo({ farbe: 'rot' })).toBe('Standard-Rauhaardackel · rot');
    expect(dackelKurzinfo({})).toBe('Standard-Rauhaardackel');
  });
});

describe('welpenStatus', () => {
  it('prefers a current litter over a planned one', () => {
    expect(welpenStatus([{ titel: 'B-Wurf', status: 'geplant' }, { titel: 'A-Wurf', status: 'aktuell' }])).toBe('Welpen sind da: A-Wurf');
    expect(welpenStatus([{ titel: 'B-Wurf', status: 'geplant' }], 'Derzeit keine Welpen')).toBe('In Planung: B-Wurf');
  });

  it('falls back to the hint, then to nothing', () => {
    expect(welpenStatus([{ titel: 'A-Wurf', status: 'vergangen' }], ' Derzeit keine Welpen ')).toBe('Derzeit keine Welpen');
    expect(welpenStatus([], '')).toBeNull();
    expect(welpenStatus([])).toBeNull();
  });
});
