import { describe, expect, it } from 'vitest';
import {
  angebotArten, angebotFakten, angebotJsonLd, angebotSeo, angebotUrl, angeboteBlockAuswahl, angeboteListeUrl,
  anfrageUrl, artLabel, formatEuro, formatPreis, sichtbareAngebote, sortiereAngebote,
} from './angebot';

const nbsp = ' ';

describe('angebotArten / artLabel', () => {
  it('lists the kinds with their CMS labels', () => {
    expect(angebotArten.map((a) => a.value)).toEqual(['einzel', 'gruppe', 'welpen']);
    expect(artLabel('einzel')).toBe('Einzeltraining');
    expect(artLabel('gruppe')).toBe('Gruppenkurs');
    expect(artLabel('welpen')).toBe('Welpenkurs');
  });

  it('is empty for unknown or missing kinds', () => {
    expect(artLabel('seminar')).toBe('');
    expect(artLabel(null)).toBe('');
  });
});

describe('URLs', () => {
  it('builds list and detail URLs', () => {
    expect(angeboteListeUrl).toBe('/angebote');
    expect(angebotUrl('welpenkurs')).toBe('/angebote/welpenkurs');
  });

  it('links to the inquiry form with an optional preselected offer', () => {
    expect(anfrageUrl()).toBe('/anfrage');
    expect(anfrageUrl(null)).toBe('/anfrage');
    expect(anfrageUrl('basistraining')).toBe('/anfrage?angebot=basistraining');
    expect(anfrageUrl('a b&c')).toBe('/anfrage?angebot=a%20b%26c');
  });
});

describe('sortiereAngebote', () => {
  it('sorts by reihenfolge (missing last), then by title', () => {
    const sortiert = sortiereAngebote([
      { titel: 'Welpenkurs', reihenfolge: 3 },
      { titel: 'Ohne Reihenfolge' },
      { titel: 'Basistraining', reihenfolge: 2 },
      { titel: 'Agility', reihenfolge: 2 },
      { titel: 'Einzeltraining', reihenfolge: 1 },
    ]);
    expect(sortiert.map((a) => a.titel)).toEqual(['Einzeltraining', 'Agility', 'Basistraining', 'Welpenkurs', 'Ohne Reihenfolge']);
  });

  it('does not mutate the input', () => {
    const liste = [{ titel: 'B', reihenfolge: 2 }, { titel: 'A', reihenfolge: 1 }];
    sortiereAngebote(liste);
    expect(liste[0].titel).toBe('B');
  });
});

describe('sichtbareAngebote', () => {
  const angebote = [
    { titel: 'Welpenkurs', art: 'welpen', reihenfolge: 3 },
    { titel: 'Einzeltraining', art: 'einzel', reihenfolge: 1 },
    { titel: 'Basistraining', art: 'gruppe', reihenfolge: 2 },
    { titel: 'Versteckt', art: 'gruppe', reihenfolge: 4, sichtbar: false },
  ];
  const titel = (liste: { titel: string }[]) => liste.map((a) => a.titel);

  it('drops hidden offers and sorts the rest', () => {
    expect(titel(sichtbareAngebote(angebote))).toEqual(['Einzeltraining', 'Basistraining', 'Welpenkurs']);
    expect(titel(sichtbareAngebote(angebote, 'alle'))).toEqual(['Einzeltraining', 'Basistraining', 'Welpenkurs']);
  });

  it('filters group courses (incl. puppy courses) or individual training', () => {
    expect(titel(sichtbareAngebote(angebote, 'gruppe'))).toEqual(['Basistraining', 'Welpenkurs']);
    expect(titel(sichtbareAngebote(angebote, 'einzel'))).toEqual(['Einzeltraining']);
  });

  it('offers a block choice for every filter', () => {
    expect(angeboteBlockAuswahl.map((a) => a.value)).toEqual(['alle', 'gruppe', 'einzel']);
  });
});

describe('formatEuro / formatPreis', () => {
  it('formats whole and fractional euros in German', () => {
    expect(formatEuro(50)).toBe(`50${nbsp}€`);
    expect(formatEuro(12.5)).toBe(`12,50${nbsp}€`);
    expect(formatEuro(1200)).toBe(`1.200${nbsp}€`);
  });

  it('appends the unit, defaulting to Termin', () => {
    expect(formatPreis({ preis: 50, preisEinheit: 'termin' })).toBe(`50${nbsp}€ / Termin`);
    expect(formatPreis({ preis: 100, preisEinheit: 'kurs' })).toBe(`100${nbsp}€ / Kurs`);
    expect(formatPreis({ preis: 25 })).toBe(`25${nbsp}€ / Termin`);
  });

  it('is null without a price or when the price is hidden', () => {
    expect(formatPreis({})).toBeNull();
    expect(formatPreis({ preis: null })).toBeNull();
    expect(formatPreis({ preis: 50, preisAnzeigen: false })).toBeNull();
    expect(formatPreis({ preis: 0 })).toBe(`0${nbsp}€ / Termin`);
  });
});

describe('angebotFakten', () => {
  it('describes individual training', () => {
    expect(angebotFakten({ art: 'einzel', dauerMinuten: 45 })).toEqual(['45 Min.', '1 Mensch-Hund-Team', 'Vor Ort']);
  });

  it('describes a group course with several sessions', () => {
    expect(angebotFakten({ art: 'gruppe', dauerMinuten: 45, anzahlTermine: 4, maxTeilnehmer: 6 }))
      .toEqual(['4 Termine à 45 Min.', 'bis zu 6 Hunde', 'Vor Ort']);
  });

  it('counts puppies in a puppy course', () => {
    expect(angebotFakten({ art: 'welpen', dauerMinuten: 45, maxTeilnehmer: 6 })).toEqual(['45 Min.', 'bis zu 6 Welpen', 'Vor Ort']);
  });

  it('skips what is unknown', () => {
    expect(angebotFakten({ art: 'gruppe', anzahlTermine: 4 })).toEqual(['4 Termine', 'Vor Ort']);
    expect(angebotFakten({ anzahlTermine: 1, dauerMinuten: 60 })).toEqual(['60 Min.', 'Vor Ort']);
    expect(angebotFakten({})).toEqual(['Vor Ort']);
  });
});

describe('angebotSeo', () => {
  it('uses title, short description and image', () => {
    expect(angebotSeo({ titel: 'Welpenkurs', kurzbeschreibung: 'Bindung von Anfang an.', bild: '/uploads/training/w.jpg' }))
      .toEqual({ title: 'Welpenkurs', description: 'Bindung von Anfang an.', image: '/uploads/training/w.jpg' });
  });

  it('falls back to a local description built from the short name', () => {
    const seo = angebotSeo({ titel: 'Basistraining – Hör auf damit, mach was mir gefällt', kurztitel: 'Basistraining' });
    expect(seo.description).toBe('Basistraining: Hundetraining in Glashütte (Osterzgebirge) bei Karolin Riesing – auf Anfrage.');
    expect(seo.image).toBeNull();
  });
});

describe('angebotJsonLd', () => {
  const anbieter = { name: 'Alltag kann Sport', url: 'https://alltag-kann-sport.de' };
  const angebot = {
    slug: 'einzeltraining', titel: 'Einzeltraining', art: 'einzel', kurzbeschreibung: 'Individuelles Training.',
    bild: '/uploads/training/angebote/einzeltraining-1.jpg', preis: 50, preisEinheit: 'termin',
  };

  it('describes the offer as a schema.org Service with absolute URLs and the price', () => {
    expect(angebotJsonLd(angebot, anbieter)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Einzeltraining',
      description: 'Individuelles Training.',
      url: 'https://alltag-kann-sport.de/angebote/einzeltraining',
      serviceType: 'Einzeltraining',
      image: 'https://alltag-kann-sport.de/uploads/training/angebote/einzeltraining-1.jpg',
      provider: { '@type': 'LocalBusiness', name: 'Alltag kann Sport', url: 'https://alltag-kann-sport.de/' },
      areaServed: 'Glashütte, Osterzgebirge, Sachsen',
      offers: { '@type': 'Offer', price: '50.00', priceCurrency: 'EUR', description: `50${nbsp}€ / Termin` },
    });
  });

  it('leaves out a hidden price, a missing image and an unknown kind', () => {
    const ld = angebotJsonLd({ ...angebot, preisAnzeigen: false, bild: null, art: null }, anbieter);
    expect(ld).not.toHaveProperty('offers');
    expect(ld).not.toHaveProperty('image');
    expect(ld).not.toHaveProperty('serviceType');
  });
});
