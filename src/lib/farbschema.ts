// Colour schemes: single source for everything outside CSS.
// Pure TS – also bundled into the Tina admin via tina/collections/config.ts.
// Tokens live in src/styles/global.css; ids and --bg must stay in sync with it.

export interface Farbschema {
  id: string;
  /** Option label in Tina (Einstellungen → Farbschema). */
  tinaLabel: string;
  /** <meta name="theme-color"> = the scheme's --bg (light / dark). */
  themeColor: { light: string; dark: string };
}

export const STANDARD_FARBSCHEMA = 'neon';

export const FARBSCHEMATA: readonly Farbschema[] = [
  {
    id: 'sonnenuntergang',
    tinaLabel: 'Sonnenuntergang (Orange → Pink)',
    themeColor: { light: '#fffaf5', dark: '#16110e' },
  },
  {
    id: 'neon',
    tinaLabel: 'Neon (knallige Details)',
    themeColor: { light: '#ffffff', dark: '#0e0e10' },
  },
  {
    id: 'pfirsich',
    tinaLabel: 'Pfirsich (sanft & warm)',
    themeColor: { light: '#fffbf8', dark: '#1a1512' },
  },
];

/** Scheme by id; unknown or empty ids fall back to the standard. */
export function farbschema(id?: string | null): Farbschema {
  return FARBSCHEMATA.find((s) => s.id === id) ?? FARBSCHEMATA.find((s) => s.id === STANDARD_FARBSCHEMA)!;
}

/** `options` for the Tina `farbschema` field. */
export const farbschemaOptions = FARBSCHEMATA.map((s) => ({ value: s.id, label: s.tinaLabel }));
