import { describe, expect, it } from 'vitest';
import { kontrast, luminanz } from './kontrast';

describe('kontrast', () => {
  it('spans 1 … 21', () => {
    expect(kontrast('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(kontrast('#193450', '#193450')).toBe(1);
  });

  it('is symmetric and accepts short hex', () => {
    expect(kontrast('#fff', '#a85a2f')).toBeCloseTo(kontrast('#a85a2f', '#ffffff'), 10);
    expect(kontrast('#ffffff', '#a85a2f')).toBeCloseTo(5.04, 2);
  });

  it('rejects other colour formats', () => {
    expect(() => luminanz('rgb(0 0 0)')).toThrow();
  });
});
