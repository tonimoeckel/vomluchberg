// Colour schemes: single source for everything outside CSS.
// Pure TS – also bundled into the Tina admin via tina/collections/config.ts.
// Tokens live in src/styles/global.css; ids and --bg must stay in sync with it.

export interface Farbschema {
  id: string;
  /** Short label in the preview switcher (FarbVorschau). */
  label: string;
  /** Option label in Tina (Einstellungen → Farbschema). */
  tinaLabel: string;
  /** Preview dot, after the scheme's --grad. */
  swatch: string;
  /** <meta name="theme-color"> = the scheme's --bg (light / dark). */
  themeColor: { light: string; dark: string };
}

export const STANDARD_FARBSCHEMA = 'sonnenuntergang';

export const FARBSCHEMATA: readonly Farbschema[] = [
  {
    id: 'sonnenuntergang',
    label: 'Sonnenuntergang',
    tinaLabel: 'Sonnenuntergang (Orange → Pink)',
    swatch: 'linear-gradient(120deg,#f97316,#ef4444,#ec4899)',
    themeColor: { light: '#fffaf5', dark: '#16110e' },
  },
  {
    id: 'neon',
    label: 'Neon',
    tinaLabel: 'Neon (knallige Details)',
    swatch: 'linear-gradient(120deg,#ff7a00,#ff1f8e)',
    themeColor: { light: '#ffffff', dark: '#0e0e10' },
  },
  {
    id: 'pfirsich',
    label: 'Pfirsich',
    tinaLabel: 'Pfirsich (sanft & warm)',
    swatch: 'linear-gradient(120deg,#f4a261,#e76f51,#e8819f)',
    themeColor: { light: '#fffbf8', dark: '#1a1512' },
  },
];

/** Scheme by id; unknown or empty ids fall back to the standard. */
export function farbschema(id?: string | null): Farbschema {
  return FARBSCHEMATA.find((s) => s.id === id) ?? FARBSCHEMATA.find((s) => s.id === STANDARD_FARBSCHEMA)!;
}

/** `options` for the Tina `farbschema` field. */
export const farbschemaOptions = FARBSCHEMATA.map((s) => ({ value: s.id, label: s.tinaLabel }));
