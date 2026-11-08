import { describe, expect, it } from 'vitest';
import {
  geschlechtBadge, geschlechter, geschlechtLabel, hundeListeUrl, hundKategorien, hundUrl, istErinnerung, kategorieLabel,
  hundeBlockAuswahl, hundeUebersicht, hundRegeln, hundSeo, lebensdatenKarte, lebensspanne, sortiereHunde,
} from './hund';

describe('hundKategorien', () => {
  it('lists the categories in display order with their CMS labels', () => {
    expect(hundKategorien).toEqual([
      { value: 'zucht', label: 'Unsere Rottweiler' },
      { value: 'aufzucht', label: 'Zur Aufzucht bei uns' },
      { value: 'rudel', label: 'Weitere Rudelmitglieder' },
      { value: 'erinnerung', label: 'In Erinnerung' },
    ]);
  });
});

describe('kategorieLabel', () => {
  it('returns the label of a category', () => {
    expect(kategorieLabel('aufzucht')).toBe('Zur Aufzucht bei uns');
    expect(kategorieLabel('erinnerung')).toBe('In Erinnerung');
  });

  it('treats a missing category as zucht', () => {
    expect(kategorieLabel(null)).toBe('Unsere Rottweiler');
  });
});

describe('geschlechter', () => {
  it('lists the sex options with their CMS labels', () => {
    expect(geschlechter).toEqual([
      { value: 'huendin', label: 'Hündin' },
      { value: 'ruede', label: 'Rüde' },
    ]);
  });
});

describe('geschlechtLabel', () => {
  it('returns Rüde or Hündin', () => {
    expect(geschlechtLabel('ruede')).toBe('Rüde');
    expect(geschlechtLabel('huendin')).toBe('Hündin');
  });

  it('returns an empty string when the sex is unknown', () => {
    expect(geschlechtLabel(null)).toBe('');
    expect(geschlechtLabel('')).toBe('');
  });
});

describe('geschlechtBadge', () => {
  it('returns the sex option to show on the dog', () => {
    expect(geschlechtBadge({ geschlecht: 'ruede', kategorie: 'zucht' })).toEqual({ value: 'ruede', label: 'Rüde' });
    expect(geschlechtBadge({ geschlecht: 'huendin', kategorie: 'erinnerung' })).toEqual({ value: 'huendin', label: 'Hündin' });
  });

  it('shows no badge for the other pack members', () => {
    expect(geschlechtBadge({ geschlecht: 'huendin', kategorie: 'rudel' })).toBeNull();
  });

  it('shows no badge when the sex is missing', () => {
    expect(geschlechtBadge({ geschlecht: null, kategorie: 'zucht' })).toBeNull();
    expect(geschlechtBadge({ kategorie: 'zucht' })).toBeNull();
  });
});

describe('istErinnerung', () => {
  it('is true only for dogs in memoriam', () => {
    expect(istErinnerung({ kategorie: 'erinnerung' })).toBe(true);
    expect(istErinnerung({ kategorie: 'zucht' })).toBe(false);
    expect(istErinnerung({ kategorie: null })).toBe(false);
  });
});

describe('URLs', () => {
  it('points to the list and the detail pages', () => {
    expect(hundeListeUrl).toBe('/hunde');
    expect(hundUrl('baja-vom-luchberg')).toBe('/hunde/baja-vom-luchberg');
  });
});

describe('sortiereHunde', () => {
  it('orders by reihenfolge, missing values last (as 99)', () => {
    const hunde = [
      { name: 'ohne', reihenfolge: null },
      { name: 'zwanzig', reihenfolge: 20 },
      { name: 'hundert', reihenfolge: 100 },
      { name: 'zehn', reihenfolge: 10 },
      { name: 'auch-ohne' },
    ];
    expect(sortiereHunde(hunde).map((h) => h.name)).toEqual(['zehn', 'zwanzig', 'ohne', 'auch-ohne', 'hundert']);
  });

  it('does not mutate the input', () => {
    const hunde = [{ reihenfolge: 2 }, { reihenfolge: 1 }];
    sortiereHunde(hunde);
    expect(hunde).toEqual([{ reihenfolge: 2 }, { reihenfolge: 1 }]);
  });
});

describe('hundeBlockAuswahl', () => {
  it('offers all dogs grouped, or only the Rottweiler or the other pack members (CMS options)', () => {
    expect(hundeBlockAuswahl).toEqual([
      { value: 'alle', label: 'Alle (gruppiert)' },
      { value: 'zucht', label: 'Unsere Rottweiler' },
      { value: 'rudel', label: 'Weitere Rudelmitglieder' },
    ]);
  });
});

describe('hundeUebersicht', () => {
  const hunde = [
    { name: 'Dackel', kategorie: 'rudel' },
    { name: 'Baja', kategorie: 'zucht' },
    { name: 'Donna', kategorie: 'erinnerung' },
    { name: 'Aaron', kategorie: 'zucht' },
  ];
  const namen = (u: ReturnType<typeof hundeUebersicht<(typeof hunde)[number]>>) =>
    u.gruppen.map((g) => [g.titel, g.hunde.map((h) => h.name)]);

  it('groups all dogs by category in display order, skipping empty groups', () => {
    const u = hundeUebersicht(hunde, 'alle');
    expect(namen(u)).toEqual([
      ['Unsere Rottweiler', ['Baja', 'Aaron']],
      ['Weitere Rudelmitglieder', ['Dackel']],
      ['In Erinnerung', ['Donna']],
    ]);
    expect(u.gruppen.map((g) => g.kategorie)).toEqual(['zucht', 'rudel', 'erinnerung']);
    expect(u.zeigeAlleLink).toBe(false);
  });

  it('defaults to all dogs', () => {
    expect(namen(hundeUebersicht(hunde, null))).toEqual(namen(hundeUebersicht(hunde, 'alle')));
  });

  it('shows a single untitled group for one category, with a link to all dogs', () => {
    const u = hundeUebersicht(hunde, 'zucht');
    expect(namen(u)).toEqual([[null, ['Baja', 'Aaron']]]);
    expect(u.zeigeAlleLink).toBe(true);
  });

  it('keeps a single category group even when it is empty', () => {
    expect(namen(hundeUebersicht(hunde, 'aufzucht'))).toEqual([[null, []]]);
  });
});

describe('lebensspanne', () => {
  it('shows the birth date, plus the date of death when set', () => {
    expect(lebensspanne({ geboren: '2022-11-21T12:00:00.000Z' })).toBe('21.11.2022');
    expect(lebensspanne({ geboren: '2018-06-06T12:00:00.000Z', verstorben: '19.12.2025' })).toBe('06.06.2018 – 19.12.2025');
  });

  it('is null without a birth date', () => {
    expect(lebensspanne({ verstorben: '19.12.2025' })).toBeNull();
    expect(lebensspanne({ geboren: null })).toBeNull();
  });
});

describe('lebensdatenKarte', () => {
  it('prefixes the birth date with WT and the date of death with a dash', () => {
    expect(lebensdatenKarte({ geboren: '2018-06-06T12:00:00.000Z', verstorben: '19.12.2025' }))
      .toEqual({ wurftag: 'WT 06.06.2018', verstorben: '– 19.12.2025' });
  });

  it('leaves out missing parts independently', () => {
    expect(lebensdatenKarte({ geboren: '2024-03-10T12:00:00.000Z' })).toEqual({ wurftag: 'WT 10.03.2024', verstorben: null });
    expect(lebensdatenKarte({ verstorben: '19.12.2025' })).toEqual({ wurftag: null, verstorben: '– 19.12.2025' });
    expect(lebensdatenKarte({})).toEqual({ wurftag: null, verstorben: null });
  });
});

describe('hundSeo', () => {
  it('uses the name, the parents and the main image', () => {
    expect(hundSeo({
      name: 'Donna von der staubzer Höhe',
      eltern: 'Quadro von der Scherau x Yasmina vom Räuberweg',
      bild: '/uploads/hunde/donna/a.jpg',
    })).toEqual({
      title: 'Donna von der staubzer Höhe',
      description: 'Donna von der staubzer Höhe – Quadro von der Scherau x Yasmina vom Räuberweg. Rottweiler vom Luchberg.',
      image: '/uploads/hunde/donna/a.jpg',
    });
  });

  it('leaves out missing parents', () => {
    expect(hundSeo({ name: 'Unsere Rauhaardackel', eltern: null, bild: null })).toEqual({
      title: 'Unsere Rauhaardackel',
      description: 'Unsere Rauhaardackel. Rottweiler vom Luchberg.',
      image: null,
    });
  });
});

describe('hundRegeln (another site)', () => {
  const regeln = hundRegeln({
    kategorien: [
      { value: 'zucht', label: 'Unsere Hündinnen' },
      { value: 'deckrude', label: 'Der Vater unserer Dackel' },
      { value: 'erinnerung', label: 'In Erinnerung' },
    ],
    standardKategorie: 'zucht',
    blockKategorien: ['zucht', 'deckrude'],
    ohneGeschlecht: [],
    listeUrl: '/unsere-dackel',
    seoSuffix: 'Rauhaardackel vom Luchberg.',
  });

  it('uses its own categories and labels', () => {
    expect(regeln.kategorien.map((k) => k.value)).toEqual(['zucht', 'deckrude', 'erinnerung']);
    expect(regeln.kategorieLabel('deckrude')).toBe('Der Vater unserer Dackel');
    expect(regeln.kategorieLabel(null)).toBe('Unsere Hündinnen');
    expect(regeln.kategorieLabel('rudel')).toBe('');
  });

  it('builds URLs below its own list page', () => {
    expect(regeln.hundeListeUrl).toBe('/unsere-dackel');
    expect(regeln.hundUrl('hanni')).toBe('/unsere-dackel/hanni');
  });

  it('offers "alle" plus its block categories', () => {
    expect(regeln.hundeBlockAuswahl.map((k) => k.value)).toEqual(['alle', 'zucht', 'deckrude']);
  });

  it('shows the sex badge for every category when ohneGeschlecht is empty', () => {
    expect(regeln.geschlechtBadge({ geschlecht: 'huendin', kategorie: 'rudel' })).toEqual({ value: 'huendin', label: 'Hündin' });
    expect(regeln.geschlechtBadge({ geschlecht: 'ruede', kategorie: 'deckrude' })?.label).toBe('Rüde');
  });

  it('groups by its own categories', () => {
    const hunde = [{ n: 'vater', kategorie: 'deckrude' }, { n: 'hanni', kategorie: 'zucht' }];
    const { gruppen } = regeln.hundeUebersicht(hunde);
    expect(gruppen.map((g) => [g.titel, g.hunde.map((h) => h.n)])).toEqual([
      ['Unsere Hündinnen', ['hanni']],
      ['Der Vater unserer Dackel', ['vater']],
    ]);
  });

  it('ends the SEO description with its own suffix', () => {
    expect(regeln.hundSeo({ name: 'Hanni', eltern: 'A x B' }).description).toBe('Hanni – A x B. Rauhaardackel vom Luchberg.');
    expect(regeln.hundSeo({ name: 'Hanni' }).description).toBe('Hanni. Rauhaardackel vom Luchberg.');
  });

  it('leaves the Rottweiler rules untouched', () => {
    expect(hundUrl('baja')).toBe('/hunde/baja');
    expect(hundSeo({ name: 'Baja' }).description).toBe('Baja. Rottweiler vom Luchberg.');
  });
});
