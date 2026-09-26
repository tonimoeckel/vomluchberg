import { describe, expect, it } from 'vitest';
import { sortiereWuerfe, statusLabel, wuerfeListeUrl, wurfSeo, wurfSlug, wurfStatus, wurfUrl } from './wurf';

describe('wurfStatus', () => {
  it('lists the status options in CMS order with their labels', () => {
    expect(wurfStatus).toEqual([
      { value: 'geplant', label: 'In Planung' },
      { value: 'aktuell', label: 'Welpen sind da' },
      { value: 'vergangen', label: 'Abgeschlossen' },
    ]);
  });
});

describe('statusLabel', () => {
  it('returns the label of a status', () => {
    expect(statusLabel('aktuell')).toBe('Welpen sind da');
    expect(statusLabel('geplant')).toBe('In Planung');
  });

  it('treats a missing status as vergangen', () => {
    expect(statusLabel(null)).toBe('Abgeschlossen');
  });
});

describe('sortiereWuerfe', () => {
  const buchstaben = (w: { buchstabe?: string | null }[]) => w.map((x) => x.buchstabe);

  it('shows current litters first, then planned, then past ones', () => {
    const wuerfe = [
      { buchstabe: 'A', status: 'vergangen' },
      { buchstabe: 'C', status: 'geplant' },
      { buchstabe: 'B', status: 'aktuell' },
    ];
    expect(buchstaben(sortiereWuerfe(wuerfe))).toEqual(['B', 'C', 'A']);
  });

  it('orders by letter descending within a status', () => {
    const wuerfe = [
      { buchstabe: 'A', status: 'vergangen' },
      { buchstabe: 'C', status: 'vergangen' },
      { buchstabe: 'B', status: 'vergangen' },
    ];
    expect(buchstaben(sortiereWuerfe(wuerfe))).toEqual(['C', 'B', 'A']);
  });

  it('treats a missing status as past and an unknown one as after past', () => {
    const wuerfe = [
      { buchstabe: 'D', status: 'unbekannt' },
      { buchstabe: 'A', status: 'vergangen' },
      { buchstabe: 'B', status: null },
      { buchstabe: 'C', status: 'geplant' },
    ];
    expect(buchstaben(sortiereWuerfe(wuerfe))).toEqual(['C', 'B', 'A', 'D']);
  });

  it('does not mutate the input', () => {
    const wuerfe = [{ buchstabe: 'A' }, { buchstabe: 'B' }];
    sortiereWuerfe(wuerfe);
    expect(buchstaben(wuerfe)).toEqual(['A', 'B']);
  });
});

describe('wurfSlug', () => {
  it('derives the filename from the letter', () => {
    expect(wurfSlug('C')).toBe('c-wurf');
    expect(wurfSlug('d')).toBe('d-wurf');
  });

  it('falls back to x without a letter', () => {
    expect(wurfSlug('')).toBe('x-wurf');
    expect(wurfSlug(undefined)).toBe('x-wurf');
  });
});

describe('URLs', () => {
  it('points to the list and the detail pages', () => {
    expect(wuerfeListeUrl).toBe('/wuerfe');
    expect(wurfUrl('c-wurf')).toBe('/wuerfe/c-wurf');
  });
});

describe('wurfSeo', () => {
  it('uses the title with kennel name, the short text and the image', () => {
    expect(wurfSeo({ titel: 'C-Wurf', kurztext: 'Unser C-Wurf ist in Planung.', bild: '/uploads/header/header-1.jpg' })).toEqual({
      title: 'C-Wurf vom Luchberg',
      description: 'Unser C-Wurf ist in Planung.',
      image: '/uploads/header/header-1.jpg',
    });
  });

  it('keeps missing text and image empty', () => {
    expect(wurfSeo({ titel: 'A-Wurf' })).toEqual({ title: 'A-Wurf vom Luchberg', description: null, image: null });
  });
});
