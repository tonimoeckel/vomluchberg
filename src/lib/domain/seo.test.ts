import { describe, expect, it } from 'vitest';
import { metaDaten, seiteSeo } from './seo';

const website = { name: 'Rottweiler vom Luchberg', beschreibung: 'ADRK-Zucht in Sachsen.', teilenBild: '/uploads/teilen.jpg' };

describe('metaDaten title', () => {
  it('appends the site name', () => {
    expect(metaDaten({ title: 'Aaron' }, website).title).toBe('Aaron | Rottweiler vom Luchberg');
  });

  it('is the site name alone without a title', () => {
    expect(metaDaten({}, website).title).toBe('Rottweiler vom Luchberg');
    expect(metaDaten({ title: '' }, website).title).toBe('Rottweiler vom Luchberg');
  });

  it('keeps a title that already contains the site name', () => {
    expect(metaDaten({ title: 'Rottweiler vom Luchberg' }, website).title).toBe('Rottweiler vom Luchberg');
    expect(metaDaten({ title: 'Willkommen bei den Rottweiler vom Luchberg' }, website).title).toBe(
      'Willkommen bei den Rottweiler vom Luchberg',
    );
  });

  it('uses the default site name when the config has none', () => {
    expect(metaDaten({ title: 'Aaron' }, null).title).toBe('Aaron | Rottweiler vom Luchberg');
    expect(metaDaten({ title: 'Aaron' }, { name: null }).title).toBe('Aaron | Rottweiler vom Luchberg');
    expect(metaDaten({}, undefined).title).toBe('Rottweiler vom Luchberg');
  });
});

describe('metaDaten description', () => {
  it('prefers the page description', () => {
    expect(metaDaten({ description: 'Unser Rüde.' }, website).description).toBe('Unser Rüde.');
  });

  it('falls back to the site description, then to empty', () => {
    expect(metaDaten({ description: null }, website).description).toBe('ADRK-Zucht in Sachsen.');
    expect(metaDaten({ description: '' }, website).description).toBe('ADRK-Zucht in Sachsen.');
    expect(metaDaten({}, { beschreibung: null }).description).toBe('');
    expect(metaDaten({}, null).description).toBe('');
  });
});

describe('metaDaten image', () => {
  it('prefers the page image, then the site share image, else none', () => {
    expect(metaDaten({ image: '/uploads/aaron.jpg' }, website).image).toBe('/uploads/aaron.jpg');
    expect(metaDaten({ image: null }, website).image).toBe('/uploads/teilen.jpg');
    expect(metaDaten({}, { teilenBild: null }).image).toBe(null);
    expect(metaDaten({}, null).image).toBe(null);
  });
});

describe('seiteSeo', () => {
  it('takes title and description from the page, no image', () => {
    expect(seiteSeo({ titel: 'Unsere Zucht', beschreibung: 'Wie wir züchten.' })).toEqual({
      title: 'Unsere Zucht',
      description: 'Wie wir züchten.',
      image: null,
    });
  });

  it('has no description when the page has none', () => {
    expect(seiteSeo({ titel: 'Kontakt' })).toEqual({ title: 'Kontakt', description: null, image: null });
    expect(seiteSeo({ titel: 'Kontakt', beschreibung: null })).toEqual({ title: 'Kontakt', description: null, image: null });
  });
});
