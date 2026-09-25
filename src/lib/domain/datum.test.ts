import { describe, expect, it } from 'vitest';
import { formatDatum, formatDatumLang } from './datum';

describe('formatDatum', () => {
  it('formats an ISO date as dd.mm.yyyy', () => {
    expect(formatDatum('2018-06-06T12:00:00.000Z')).toBe('06.06.2018');
  });

  it('returns an empty string when there is no date', () => {
    expect(formatDatum(null)).toBe('');
    expect(formatDatum(undefined)).toBe('');
    expect(formatDatum('')).toBe('');
  });

  it('uses the Berlin calendar day, not UTC', () => {
    expect(formatDatum('2024-03-09T23:30:00.000Z')).toBe('10.03.2024');
  });
});

describe('formatDatumLang', () => {
  it('spells out the month', () => {
    expect(formatDatumLang('2024-03-10T12:00:00.000Z')).toBe('10. März 2024');
    expect(formatDatumLang('2026-05-04T12:00:00.000Z')).toBe('4. Mai 2026');
  });

  it('returns an empty string when there is no date', () => {
    expect(formatDatumLang(null)).toBe('');
  });
});
