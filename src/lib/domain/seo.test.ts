import { describe, expect, it } from 'vitest';
import { headMeta, seiteSeo } from './seo';

const website = { name: 'Rottweiler vom Luchberg', beschreibung: 'ADRK-Zucht in Sachsen.', teilenBild: '/uploads/teilen.jpg' };

describe('headMeta title', () => {
  it('appends the site name', () => {
    expect(headMeta({ title: 'Aaron' }, website).title).toBe('Aaron | Rottweiler vom Luchberg');
  });

  it('is the site name alone without a title', () => {
    expect(headMeta({}, website).title).toBe('Rottweiler vom Luchberg');
    expect(headMeta({ title: '' }, website).title).toBe('Rottweiler vom Luchberg');
  });

  it('keeps a title that already contains the site name', () => {
    expect(headMeta({ title: 'Rottweiler vom Luchberg' }, website).title).toBe('Rottweiler vom Luchberg');
    expect(headMeta({ title: 'Willkommen bei den Rottweiler vom Luchberg' }, website).title).toBe(
      'Willkommen bei den Rottweiler vom Luchberg',
    );
  });

  it('uses the default site name when the config has none', () => {
    expect(headMeta({ title: 'Aaron' }, null).title).toBe('Aaron | Rottweiler vom Luchberg');
    expect(headMeta({ title: 'Aaron' }, { name: null }).title).toBe('Aaron | Rottweiler vom Luchberg');
    expect(headMeta({}, undefined).title).toBe('Rottweiler vom Luchberg');
  });
});

describe('headMeta description', () => {
  it('prefers the page description', () => {
    expect(headMeta({ description: 'Unser Rüde.' }, website).description).toBe('Unser Rüde.');
  });

  it('falls back to the site description, then to empty', () => {
    expect(headMeta({ description: null }, website).description).toBe('ADRK-Zucht in Sachsen.');
    expect(headMeta({ description: '' }, website).description).toBe('ADRK-Zucht in Sachsen.');
    expect(headMeta({}, { beschreibung: null }).description).toBe('');
    expect(headMeta({}, null).description).toBe('');
  });
});

describe('headMeta image', () => {
  it('prefers the page image, then the site share image, else none', () => {
    expect(headMeta({ image: '/uploads/aaron.jpg' }, website).image).toBe('/uploads/aaron.jpg');
    expect(headMeta({ image: null }, website).image).toBe('/uploads/teilen.jpg');
    expect(headMeta({}, { teilenBild: null }).image).toBe(null);
    expect(headMeta({}, null).image).toBe(null);
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
