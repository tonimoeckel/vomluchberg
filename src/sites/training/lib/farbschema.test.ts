import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { kontrast } from '../../../lib/kontrast';
import {
  FARBSCHEMATA,
  STANDARD_FARBSCHEMA,
  VORSCHAU,
  farbschema,
  farbschemaOptions,
  mitVorschau,
  ohneVorschau,
  vorschauConfig,
  vorschauStarten,
  type Speicher,
} from './farbschema';

// --- Tokens from ../styles/global.css ------------------------------------------------------------

type Tokens = Record<string, string>;
const css = readFileSync(new URL('../styles/global.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const dunkelStart = css.indexOf('@media (prefers-color-scheme: dark)');

/** Tokens per scheme id ("" = :root only) in one part of the stylesheet. */
function schemata(teil: string): Record<string, Tokens> {
  const out: Record<string, Tokens> = {};
  for (const [, selektor, rumpf] of teil.matchAll(/([^{}]*\[data-scheme='[a-z-]+'\][^{}]*)\{([^{}]*)\}/g)) {
    const tokens = Object.fromEntries([...rumpf.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
    for (const [, id] of selektor.matchAll(/\[data-scheme='([a-z-]+)'\]/g)) out[id] = { ...out[id], ...tokens };
  }
  return out;
}
const modi = { hell: schemata(css.slice(0, dunkelStart)), dunkel: schemata(css.slice(dunkelStart)) };

const FARBTOKENS = [
  'bg', 'surface', 'surface-2', 'card', 'fg', 'heading', 'muted', 'border', 'primary', 'primary-hover',
  'primary-ink', 'copper', 'accent', 'accent-ink', 'lane', 'dark', 'dark-2', 'on-dark', 'on-dark-muted',
];

/** [text, background, minimum] – text pairs need 4.5:1, copper lines and button areas 3:1. */
const PAARE: [string, string, number][] = [
  ...['bg', 'surface', 'card', 'surface-2'].flatMap((h): [string, string, number][] => [['fg', h, 4.5], ['heading', h, 4.5]]),
  ...['bg', 'surface', 'card'].flatMap((h): [string, string, number][] => [['muted', h, 4.5], ['primary-ink', h, 4.5]]),
  ['accent-ink', 'bg', 4.5],
  ['accent-ink', 'surface', 4.5],
  ['#ffffff', 'primary', 4.5], // btn-primary (text-white)
  ['#ffffff', 'primary-hover', 4.5],
  ['bg', 'heading', 4.5], // btn-navy, btn-secondary on hover
  ['on-dark', 'dark', 4.5],
  ['on-dark', 'dark-2', 4.5],
  ['on-dark-muted', 'dark', 4.5],
  ['on-dark-muted', 'dark-2', 4.5], // footer
  ['copper', 'bg', 3], // lines, numbers, large accent words, focus ring
  ['copper', 'surface', 3],
  ['copper', 'card', 3],
  ['primary', 'bg', 3],
];

describe('training colour schemes', () => {
  it('has 3–6 unique schemes with the standard first', () => {
    expect(FARBSCHEMATA.length).toBeGreaterThanOrEqual(3);
    expect(FARBSCHEMATA.length).toBeLessThanOrEqual(6);
    expect(new Set(FARBSCHEMATA.map((s) => s.id)).size).toBe(FARBSCHEMATA.length);
    expect(FARBSCHEMATA[0].id).toBe(STANDARD_FARBSCHEMA);
  });

  it('falls back to the standard for unknown ids', () => {
    for (const id of [undefined, null, '', 'neon', 'sonnenuntergang']) expect(farbschema(id).id).toBe('trainingsplatz');
    expect(farbschema('waldweg').label).toBe('Waldweg');
  });

  it('builds the Tina options', () => {
    expect(farbschemaOptions.map((o) => o.value)).toEqual(FARBSCHEMATA.map((s) => s.id));
    expect(farbschemaOptions.every((o) => o.label.length > 0)).toBe(true);
  });

  it('defines exactly the schemes of the list in CSS, light and dark', () => {
    const ids = FARBSCHEMATA.map((s) => s.id).sort();
    expect(Object.keys(modi.hell).sort()).toEqual(ids);
    expect(Object.keys(modi.dunkel).sort()).toEqual(ids);
  });

  for (const s of FARBSCHEMATA) {
    for (const [modus, alle] of Object.entries(modi) as [keyof typeof modi, Record<string, Tokens>][]) {
      describe(`${s.id} (${modus})`, () => {
        const t = alle[s.id] ?? {};
        const farbe = (name: string) => (name.startsWith('#') ? name : t[name]);

        it('defines every colour token as hex', () => {
          for (const name of FARBTOKENS) expect(t[name], `--${name}`).toMatch(/^#[0-9a-f]{6}$/i);
        });

        it('keeps --bg in sync with themeColor', () => {
          expect(t.bg).toBe(modus === 'hell' ? s.themeColor.light : s.themeColor.dark);
        });

        // Kickers on dark bands use --lane in light mode, --on-dark-muted in dark mode (SectionHead).
        const paare: [string, string, number][] = modus === 'hell' ? [...PAARE, ['lane', 'dark', 4.5]] : PAARE;
        it.each(paare)('%s on %s ≥ %s:1', (vorne, hinten, minimum) => {
          expect(kontrast(farbe(vorne), farbe(hinten))).toBeGreaterThanOrEqual(minimum);
        });
      });
    }
  }

  it('keeps the original Navy/Kupfer tokens for the standard (light)', () => {
    expect(modi.hell.trainingsplatz).toMatchObject({ bg: '#f6f2ea', heading: '#193450', primary: '#a85a2f', copper: '#b96637' });
  });
});

// --- Secret preview switch ------------------------------------------------------------------------

function speicher(start: Record<string, string> = {}): Speicher & { daten: Record<string, string> } {
  const daten = { ...start };
  return {
    daten,
    getItem: (k) => daten[k] ?? null,
    setItem: (k, v) => void (daten[k] = v),
    removeItem: (k) => void delete daten[k],
  };
}
const html = () => ({ dataset: { scheme: 'trainingsplatz' } as Record<string, string | undefined> });

describe('vorschauStarten', () => {
  it('uses the central parameter ?themes=active', () => {
    expect(VORSCHAU.parameter).toBe('themes');
    expect(VORSCHAU.wert).toBe('active');
  });

  it('does nothing without the parameter', () => {
    const s = speicher();
    const h = html();
    expect(vorschauStarten(vorschauConfig, '', s, h)).toBe(false);
    expect(vorschauStarten(vorschauConfig, '?thema=kreide', s, h)).toBe(false);
    expect(vorschauStarten(vorschauConfig, '?themes=yes', s, h)).toBe(false);
    expect(s.daten).toEqual({});
    expect(h.dataset).toEqual({ scheme: 'trainingsplatz' });
  });

  it('turns on with ?themes=active and remembers it for the session', () => {
    const s = speicher();
    const h = html();
    expect(vorschauStarten(vorschauConfig, '?themes=active&thema=waldweg', s, h)).toBe(true);
    expect(h.dataset).toEqual({ scheme: 'waldweg', themes: '' });
    const h2 = html();
    expect(vorschauStarten(vorschauConfig, '?seite=2', s, h2)).toBe(true);
    expect(h2.dataset.scheme).toBe('waldweg');
  });

  it('ignores unknown schemes', () => {
    const s = speicher({ themes: 'active', 'themes-thema': 'neon' });
    const h = html();
    expect(vorschauStarten(vorschauConfig, '?thema=<script>', s, h)).toBe(true);
    expect(h.dataset.scheme).toBe('trainingsplatz');
  });

  it('turns off with any other value of the parameter', () => {
    const s = speicher({ themes: 'active', 'themes-thema': 'kreide' });
    expect(vorschauStarten(vorschauConfig, '?themes=off', s, html())).toBe(false);
    expect(s.daten).toEqual({});
  });

  it('works from the URL alone when storage is blocked', () => {
    const kaputt: Speicher = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    };
    const h = html();
    expect(vorschauStarten(vorschauConfig, '?themes=active&thema=bergnebel', kaputt, h)).toBe(true);
    expect(h.dataset.scheme).toBe('bergnebel');
    expect(vorschauStarten(vorschauConfig, '', kaputt, html())).toBe(false);
    expect(vorschauStarten(vorschauConfig, '?themes=active', null, html())).toBe(true);
  });

  it('is self-contained, so it can be inlined with toString()', () => {
    const fn = new Function(`return (${vorschauStarten.toString()})`)() as typeof vorschauStarten;
    const h = html();
    expect(fn(vorschauConfig, '?themes=active&thema=kreide', speicher(), h)).toBe(true);
    expect(h.dataset.scheme).toBe('kreide');
  });
});

describe('mitVorschau / ohneVorschau', () => {
  const basis = 'https://www.alltag-kann-sport.de/angebote?themes=active';

  it('adds the parameters to internal links', () => {
    expect(mitVorschau('/anfrage?angebot=welpenkurs', basis, 'waldweg')).toBe('/anfrage?angebot=welpenkurs&themes=active&thema=waldweg');
    expect(mitVorschau('einzeltraining#preise', 'https://www.alltag-kann-sport.de/angebote/', 'kreide')).toBe(
      '/angebote/einzeltraining?themes=active&thema=kreide#preise',
    );
    expect(mitVorschau('/?thema=kreide', basis, 'nix')).toBe('/?thema=kreide&themes=active');
  });

  it('leaves other links alone', () => {
    for (const href of ['#inhalt', '', 'mailto:a@b.de', 'tel:+49', 'https://www.vomluchberg.de/', '/admin/index.html']) {
      expect(mitVorschau(href, basis, 'kreide'), href).toBeNull();
    }
  });

  it('removes the parameters again', () => {
    expect(ohneVorschau('https://x.de/anfrage?angebot=a&themes=active&thema=kreide#f')).toBe('/anfrage?angebot=a#f');
  });
});
