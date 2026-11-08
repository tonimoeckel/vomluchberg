// Colour schemes of the training site and its secret preview switch.
// Pure TS – also bundled into the Tina admin via tina/sites/training/config.ts.
// Tokens live in ../styles/global.css ([data-farbe='<id>'], light + dark); ids and --bg must stay
// in sync with it (checked by farbschema.test.ts, which also checks the WCAG contrasts).

export interface Farbschema {
  id: string;
  /** Name in the preview switcher. */
  label: string;
  /** Option label in Tina (Training · Einstellungen → Farbschema). */
  tinaLabel: string;
  /** Preview dot: background, band and button colour of the light variant. */
  swatch: string;
  /** <meta name="theme-color"> = the scheme's --bg (light / dark). */
  themeColor: { light: string; dark: string };
}

export const STANDARD_FARBSCHEMA = 'trainingsplatz';

/** Three-colour dot: page background, dark band, button. */
const punkt = (bg: string, band: string, button: string) =>
  `conic-gradient(${button} 0 120deg,${band} 120deg 240deg,${bg} 240deg 360deg)`;

export const FARBSCHEMATA: readonly Farbschema[] = [
  {
    id: 'trainingsplatz',
    label: 'Trainingsplatz',
    tinaLabel: 'Trainingsplatz (Navy & Kupfer auf Papier, wie das Logo)',
    swatch: punkt('#f6f2ea', '#193450', '#a85a2f'),
    themeColor: { light: '#f6f2ea', dark: '#0f1f33' },
  },
  {
    id: 'bergnebel',
    label: 'Bergnebel',
    tinaLabel: 'Bergnebel (kühles Hellblau, Navy-Buttons)',
    swatch: punkt('#f2f6fa', '#193450', '#22466e'),
    themeColor: { light: '#f2f6fa', dark: '#0c1826' },
  },
  {
    id: 'waldweg',
    label: 'Waldweg',
    tinaLabel: 'Waldweg (Tannengrün & Kupfer)',
    swatch: punkt('#f4f3ec', '#1f3d30', '#a85a2f'),
    themeColor: { light: '#f4f3ec', dark: '#0f1a15' },
  },
  {
    id: 'erde',
    label: 'Erde',
    tinaLabel: 'Erde (Sand & Erdbraun, Logo-Blau und Logo-Kupfer)',
    swatch: punkt('#f3ede3', '#3b2a1e', '#193450'),
    themeColor: { light: '#f3ede3', dark: '#1a1410' },
  },
  {
    id: 'kreide',
    label: 'Kreide',
    tinaLabel: 'Kreide (Weiß & Grafit, Kupfer-Akzente)',
    swatch: punkt('#ffffff', '#24272b', '#a85a2f'),
    themeColor: { light: '#ffffff', dark: '#141517' },
  },
];

/** Scheme by id; unknown or empty ids fall back to the standard. */
export function farbschema(id?: string | null): Farbschema {
  return FARBSCHEMATA.find((s) => s.id === id) ?? FARBSCHEMATA.find((s) => s.id === STANDARD_FARBSCHEMA)!;
}

/** `options` for the Tina `farbschema` field. */
export const farbschemaOptions = FARBSCHEMATA.map((s) => ({ value: s.id, label: s.tinaLabel }));

// ---------------------------------------------------------------------------------------------
// Secret preview switch: only `?themes=active` shows it (change the name/value here). The choice
// is kept in sessionStorage for the tab; nothing is stored without the parameter. No cookies.

export const VORSCHAU = {
  /** GET parameter that turns the preview on; any other value turns it off again. */
  parameter: 'themes',
  wert: 'active',
  /** GET parameter carrying the previewed scheme (added to links while the preview is on). */
  themaParameter: 'thema',
  /** sessionStorage key (the scheme is stored under `<key>-thema`). */
  speicher: 'themes',
} as const;

export type VorschauConfig = typeof VORSCHAU & { ids: readonly string[] };

export const vorschauConfig: VorschauConfig = { ...VORSCHAU, ids: FARBSCHEMATA.map((s) => s.id) };

/** The minimal Storage interface used (sessionStorage in the browser). */
export interface Speicher {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Runs in <head> before first paint (serialised with toString() into an inline script, so it must
 * stay self-contained: no imports, no outer variables). Turns the preview on/off from the URL,
 * remembers it for the session and applies the previewed scheme. Returns whether the preview is on;
 * when it is, <html data-themes> tells the switcher to load.
 */
export function vorschauStarten(
  cfg: VorschauConfig,
  search: string,
  speicher: Speicher | null,
  html: { dataset: Record<string, string | undefined> },
): boolean {
  const p = new URLSearchParams(search);
  const wert = p.get(cfg.parameter);
  const themaKey = cfg.speicher + '-thema';
  const gueltig = (id: string | null) => (id && cfg.ids.indexOf(id) >= 0 ? id : null);
  let aktiv = wert === cfg.wert;
  let thema = aktiv ? gueltig(p.get(cfg.themaParameter)) : null;
  try {
    if (speicher) {
      if (aktiv) {
        speicher.setItem(cfg.speicher, cfg.wert);
        if (thema) speicher.setItem(themaKey, thema);
      } else if (wert !== null) {
        speicher.removeItem(cfg.speicher);
        speicher.removeItem(themaKey);
      } else if (speicher.getItem(cfg.speicher) === cfg.wert) {
        aktiv = true;
      }
      if (aktiv && !thema) thema = gueltig(speicher.getItem(themaKey));
    }
  } catch (e) {
    // Storage blocked (private mode, settings): the URL alone still works, links carry it on.
  }
  if (!aktiv) return false;
  if (thema) html.dataset.farbe = thema;
  html.dataset.themes = '';
  return true;
}

/**
 * Link target that keeps the preview: internal http(s) links get `?themes=active&thema=<id>`.
 * Returns null for links that must stay untouched (other origins, mailto:, tel:, pure #anchors).
 */
export function mitVorschau(href: string, basis: string, thema: string, cfg: VorschauConfig = vorschauConfig): string | null {
  if (!href || href.startsWith('#')) return null;
  let url: URL;
  try {
    url = new URL(href, basis);
  } catch {
    return null;
  }
  const base = new URL(basis);
  if (url.origin !== base.origin || !/^https?:$/.test(url.protocol)) return null;
  if (url.pathname.startsWith('/admin')) return null;
  url.searchParams.set(cfg.parameter, cfg.wert);
  if (cfg.ids.includes(thema)) url.searchParams.set(cfg.themaParameter, thema);
  return url.pathname + url.search + url.hash;
}

/** Current URL without the preview parameters ("Vorschau beenden", after clearing the storage). */
export function ohneVorschau(href: string, cfg: VorschauConfig = vorschauConfig): string {
  const url = new URL(href);
  url.searchParams.delete(cfg.parameter);
  url.searchParams.delete(cfg.themaParameter);
  return url.pathname + url.search + url.hash;
}
