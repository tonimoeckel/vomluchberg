import { describe, expect, it } from 'vitest';
import { blockName } from './tina-typename';

describe('blockName', () => {
  it.each([
    ['PageBlocksHero', 'Hero'],
    ['PageBlocksText', 'Text'],
    ['DackelPageBlocksText', 'Text'],
    ['TrainingPageBlocksAngebote', 'Angebote'],
  ])('%s → %s', (typename, name) => {
    expect(blockName(typename)).toBe(name);
  });

  it('returns other typenames unchanged', () => {
    expect(blockName('Hund')).toBe('Hund');
    expect(blockName('PageBlocks')).toBe('PageBlocks');
  });
});
