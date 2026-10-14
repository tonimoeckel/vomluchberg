import { describe, expect, it } from 'vitest';
import { farbschema, farbschemaOptions, STANDARD_FARBSCHEMA } from './farbschema';

describe('farbschema', () => {
  it('falls back to the standard scheme for unknown or empty ids', () => {
    expect(STANDARD_FARBSCHEMA).toBe('neon');
    for (const id of [undefined, null, '', 'gibtsnicht']) {
      expect(farbschema(id).id).toBe('neon');
    }
  });

  // Literals = each scheme's --bg in src/styles/global.css (light / dark).
  it.each([
    ['sonnenuntergang', '#fffaf5', '#16110e'],
    ['neon', '#ffffff', '#0e0e10'],
    ['pfirsich', '#fffbf8', '#1a1512'],
  ])('theme-color of %s matches its --bg', (id, light, dark) => {
    expect(farbschema(id).themeColor).toEqual({ light, dark });
  });

  it('lists the Tina options in order with the editor labels', () => {
    expect(farbschemaOptions).toEqual([
      { value: 'sonnenuntergang', label: 'Sonnenuntergang (Orange → Pink)' },
      { value: 'neon', label: 'Neon (knallige Details)' },
      { value: 'pfirsich', label: 'Pfirsich (sanft & warm)' },
    ]);
  });
});
