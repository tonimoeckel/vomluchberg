import { describe, expect, it } from 'vitest';
import { alleKombinationen, beratung, quizAntworten, quizEmpfehlung, quizFragen, type QuizAntworten } from './trainingQuiz';
import { anfrageOptionen, vorauswahl } from './anfrage';

const alle = ['einzeltraining', 'basistraining', 'welpenkurs'];
const slug = (a: QuizAntworten, sichtbar = alle) => quizEmpfehlung(a, sichtbar).slug;

describe('quizEmpfehlung', () => {
  it('recommends the puppy course for puppies in a group', () => {
    expect(slug({ alter: 'welpe', ziel: 'grundlagen', rahmen: 'gruppe' })).toBe('welpenkurs');
    expect(slug({ alter: 'welpe', ziel: 'sport', rahmen: 'egal' })).toBe('welpenkurs');
    expect(slug({ alter: 'welpe', ziel: 'alltag', rahmen: 'gruppe' })).toBe('welpenkurs');
  });

  it('recommends the basic course for basics with older dogs in a group', () => {
    expect(slug({ alter: 'junghund', ziel: 'grundlagen', rahmen: 'gruppe' })).toBe('basistraining');
    expect(slug({ alter: 'erwachsen', ziel: 'grundlagen', rahmen: 'egal' })).toBe('basistraining');
  });

  it('recommends individual training for one-to-one wishes, problems and sport', () => {
    expect(slug({ alter: 'welpe', ziel: 'grundlagen', rahmen: 'allein' })).toBe('einzeltraining');
    expect(slug({ alter: 'welpe', ziel: 'alltag', rahmen: 'egal' })).toBe('einzeltraining');
    expect(slug({ alter: 'erwachsen', ziel: 'alltag', rahmen: 'egal' })).toBe('einzeltraining');
    expect(slug({ alter: 'junghund', ziel: 'sport', rahmen: 'allein' })).toBe('einzeltraining');
  });

  it('asks for advice on ambiguous combinations', () => {
    expect(slug({ alter: 'erwachsen', ziel: 'alltag', rahmen: 'gruppe' })).toBe(beratung);
    expect(slug({ alter: 'junghund', ziel: 'sport', rahmen: 'gruppe' })).toBe(beratung);
  });

  it('never recommends a hidden offer', () => {
    const a: QuizAntworten = { alter: 'welpe', ziel: 'grundlagen', rahmen: 'gruppe' };
    expect(slug(a, ['einzeltraining', 'basistraining'])).toBe(beratung);
    for (const k of alleKombinationen()) expect(slug(k, [])).toBe(beratung);
  });

  it('gives every result a reason without dashes', () => {
    for (const k of alleKombinationen()) {
      const { grund } = quizEmpfehlung(k, alle);
      expect(grund.length).toBeGreaterThan(20);
      expect(grund).not.toMatch(/[–—]/);
    }
  });

  it('yields a valid ?angebot= preselection of the inquiry form for every combination', () => {
    const optionen = anfrageOptionen(alle.map((s) => ({ slug: s, titel: s })));
    const ergebnisse = new Set(alleKombinationen().map((k) => slug(k)));
    expect([...ergebnisse].sort()).toEqual([...alle, beratung].sort());
    for (const s of ergebnisse) expect(vorauswahl(s, optionen)).toBe(s);
  });
});

describe('quizAntworten', () => {
  it('reads complete answers', () => {
    const werte = new URLSearchParams({ alter: 'junghund', ziel: 'sport', rahmen: 'egal' });
    expect(quizAntworten(werte)).toEqual({ alter: 'junghund', ziel: 'sport', rahmen: 'egal' });
  });

  it('is null while a question is open or a value is unknown', () => {
    expect(quizAntworten(new URLSearchParams({ alter: 'welpe', ziel: 'sport' }))).toBeNull();
    expect(quizAntworten(new URLSearchParams({ alter: 'katze', ziel: 'sport', rahmen: 'egal' }))).toBeNull();
  });
});

describe('alleKombinationen', () => {
  it('covers every answer combination once', () => {
    const anzahl = quizFragen.reduce((n, f) => n * f.antworten.length, 1);
    const k = alleKombinationen();
    expect(k).toHaveLength(anzahl);
    expect(new Set(k.map((x) => JSON.stringify(x))).size).toBe(anzahl);
  });
});
