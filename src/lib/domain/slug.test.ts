import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and joins words with dashes', () => {
    expect(slugify('Baja vom Luchberg', 'x')).toBe('baja-vom-luchberg');
  });

  it('transliterates German umlauts and ß', () => {
    expect(slugify('Donna von der staubzer Höhe', 'x')).toBe('donna-von-der-staubzer-hoehe');
    expect(slugify('Ärger über Größe', 'x')).toBe('aerger-ueber-groesse');
  });

  it('collapses other characters and trims dashes', () => {
    expect(slugify('  Welpen sind da! (C-Wurf) ', 'x')).toBe('welpen-sind-da-c-wurf');
  });

  it('uses the fallback when the text is empty', () => {
    expect(slugify('', 'neuer-hund')).toBe('neuer-hund');
    expect(slugify(undefined, 'neuer-beitrag')).toBe('neuer-beitrag');
  });
});
