import { describe, expect, it } from 'vitest';
import {
  dackelFarben, dackelGroessen, dackelHaar, dackelHunde, dackelKategorien, dackelKurzinfo, dackelSteckbrief, dackelWuerfe,
  anfrageBetreff, betonteTeile, dackelBezeichnung, farbeLabel, welpenStatus,
} from './dackel';

describe('dackelKategorien', () => {
  it('lists the categories of the dachshund site in display order', () => {
    expect(dackelKategorien).toEqual([
      { value: 'zucht', label: 'Unsere Hündinnen' },
      { value: 'deckrude', label: 'Die Väter unserer Würfe' },
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
    for (const list of [dackelFarben, dackelGroessen, dackelHaar]) {
      expect(new Set(list.map((o) => o.value)).size).toBe(list.length);
    }
  });
});

describe('farbeLabel', () => {
  it('returns the label', () => {
    expect(farbeLabel('duerrlaubfarben')).toBe('dürrlaubfarben');
    expect(farbeLabel('saufarben')).toBe('saufarben');
  });

  it('says nothing for unknown colours and "sonstige"', () => {
    expect(farbeLabel(null)).toBe('');
    expect(farbeLabel('lila')).toBe('');
    expect(farbeLabel('sonstige')).toBe('');
  });
});

describe('dackelBezeichnung', () => {
  it('combines size class and coat', () => {
    expect(dackelBezeichnung({ groesse: 'standard' })).toBe('Standard-Rauhaardackel');
    expect(dackelBezeichnung({ groesse: 'zwerg', haar: 'kurzhaar' })).toBe('Zwerg-Kurzhaardackel');
  });

  it('names no size class when none is set and defaults to wire-haired', () => {
    expect(dackelBezeichnung({})).toBe('Rauhaardackel');
    expect(dackelBezeichnung({ groesse: '', haar: 'langhaar' })).toBe('Langhaardackel');
  });
});

describe('dackelSteckbrief', () => {
  it('lists only filled rows, in display order', () => {
    expect(dackelSteckbrief({ groesse: 'standard', farbe: 'saufarben', geboren: '2020-09-30T00:00:00.000Z', brustumfang: '34 cm' })).toEqual([
      { feld: 'groesse', label: 'Rasse', wert: 'Standard-Rauhaardackel' },
      { feld: 'farbe', label: 'Farbe', wert: 'saufarben' },
      { feld: 'geboren', label: 'Wurftag', wert: '30.09.2020' },
      { feld: 'brustumfang', label: 'Brustumfang', wert: '34 cm' },
    ]);
  });

  it('skips blank strings but always names the breed', () => {
    expect(dackelSteckbrief({ eltern: '  ', abstammung: '' })).toEqual([{ feld: 'groesse', label: 'Rasse', wert: 'Rauhaardackel' }]);
  });

  it('shows the owner only for dogs that are not ours', () => {
    expect(dackelSteckbrief({ besitzer: 'Familie X' }).some((z) => z.feld === 'besitzer')).toBe(false);
    expect(dackelSteckbrief({ auswaertig: true, besitzer: 'Familie X' }).at(-1)).toEqual({
      feld: 'besitzer', label: 'Besitzer', wert: 'Familie X',
    });
  });
});

describe('dackelKurzinfo', () => {
  it('joins breed and colour', () => {
    expect(dackelKurzinfo({ farbe: 'rot' })).toBe('Rauhaardackel · rot');
    expect(dackelKurzinfo({ groesse: 'zwerg', haar: 'kurzhaar', farbe: 'black-tan' })).toBe('Zwerg-Kurzhaardackel · black-tan');
    expect(dackelKurzinfo({})).toBe('Rauhaardackel');
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

describe('betonteTeile', () => {
  it('marks the starred parts', () => {
    expect(betonteTeile('Rauhaardackel, *groß geworden* mitten im Rudel.')).toEqual([
      { text: 'Rauhaardackel, ', betont: false },
      { text: 'groß geworden', betont: true },
      { text: ' mitten im Rudel.', betont: false },
    ]);
  });

  it('keeps text without or with an unmatched asterisk as it is', () => {
    expect(betonteTeile('Welpen')).toEqual([{ text: 'Welpen', betont: false }]);
    expect(betonteTeile('5* Hotel')).toEqual([{ text: '5* Hotel', betont: false }]);
  });
});

describe('anfrageBetreff', () => {
  it('names the breed and the topic', () => {
    expect(anfrageBetreff('Anfrage zu einem Welpen')).toBe('Anfrage Rauhaardackel: Anfrage zu einem Welpen');
    expect(anfrageBetreff(' ')).toBe('Anfrage Rauhaardackel');
  });
});
