import { describe, expect, it } from 'vitest';
import { localBusinessJsonLd, plzOrt } from './localBusiness';

describe('plzOrt', () => {
  it('splits a German postal code from the town', () => {
    expect(plzOrt('01768 Glashütte')).toEqual({ postalCode: '01768', addressLocality: 'Glashütte' });
    expect(plzOrt(' 01768  Glashütte OT Luchau ')).toEqual({ postalCode: '01768', addressLocality: 'Glashütte OT Luchau' });
  });

  it('keeps a town without postal code, and nothing when empty', () => {
    expect(plzOrt('Glashütte')).toEqual({ addressLocality: 'Glashütte' });
    expect(plzOrt('')).toEqual({});
    expect(plzOrt(null)).toEqual({});
  });
});

describe('localBusinessJsonLd', () => {
  const basis = { name: 'Alltag kann Sport – Hundetraining Karolin Riesing', url: 'https://training.vomluchberg.de' };

  it('builds a full LocalBusiness with absolute URLs and the state from the region', () => {
    expect(
      localBusinessJsonLd({
        ...basis,
        beschreibung: 'Hundetraining in Glashütte.',
        bild: '/uploads/training/start/spaziergang-feldweg.jpg',
        logo: '/uploads/training/logo/logo.png',
        strasse: 'Dorfstr. 2d',
        ort: '01768 Glashütte',
        region: 'Osterzgebirge, Sachsen',
        email: 'karo@example.org',
        sameAs: ['https://www.instagram.com/x', null, 'https://www.vomluchberg.de'],
        areaServed: ['Glashütte', 'Osterzgebirge'],
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: basis.name,
      url: 'https://training.vomluchberg.de/',
      description: 'Hundetraining in Glashütte.',
      image: 'https://training.vomluchberg.de/uploads/training/start/spaziergang-feldweg.jpg',
      logo: 'https://training.vomluchberg.de/uploads/training/logo/logo.png',
      address: {
        '@type': 'PostalAddress',
        postalCode: '01768',
        addressLocality: 'Glashütte',
        streetAddress: 'Dorfstr. 2d',
        addressRegion: 'Sachsen',
        addressCountry: 'DE',
      },
      email: 'karo@example.org',
      areaServed: ['Glashütte', 'Osterzgebirge'],
      sameAs: ['https://www.instagram.com/x', 'https://www.vomluchberg.de'],
    });
  });

  it('leaves out everything that is not set (no phone number without one)', () => {
    expect(localBusinessJsonLd({ ...basis, telefon: '', sameAs: [] })).toEqual({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: basis.name,
      url: 'https://training.vomluchberg.de/',
    });
  });

  it('includes the phone number once it is set', () => {
    expect(localBusinessJsonLd({ ...basis, telefon: '0173 1234567' }).telephone).toBe('0173 1234567');
  });
});
