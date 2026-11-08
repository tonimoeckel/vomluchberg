import type { TinaField } from 'tinacms';
import { geschlechter, type Kategorie } from '../../src/lib/domain/hund';
import { wurfStatus } from '../../src/lib/domain/wurf';

/** Bild + Alternativtext (für Barrierefreiheit & Google). */
export const bildFeld = (name = 'bild', label = 'Bild'): TinaField => ({
  type: 'image',
  name,
  label,
});

export const galerieFeld: TinaField = {
  type: 'object',
  name: 'galerie',
  label: 'Bildergalerie',
  list: true,
  ui: {
    itemProps: (item: { beschreibung?: string; bild?: string }) => ({
      label: item?.beschreibung || item?.bild?.split('/').pop() || 'Bild',
    }),
  },
  fields: [
    { type: 'image', name: 'bild', label: 'Bild' },
    { type: 'string', name: 'beschreibung', label: 'Bildbeschreibung (optional)' },
  ],
};

/** Settings group "Website" (name, description, logos, share image) – shared by every site's config. */
export const websiteFeld: TinaField = {
  type: 'object', name: 'website', label: 'Website',
  fields: [
    { type: 'string', name: 'name', label: 'Name der Website', required: true },
    { type: 'string', name: 'untertitel', label: 'Untertitel (unter dem Namen)' },
    { type: 'string', name: 'beschreibung', label: 'Standard-Beschreibung für Google', ui: { component: 'textarea' } },
    { type: 'image', name: 'logo', label: 'Logo' },
    { type: 'image', name: 'logoDunkel', label: 'Logo für die dunkle Ansicht', description: 'Helle Version des Logos. Wird gezeigt, wenn das Handy oder der Computer auf „Dunkel“ steht.' },
    { type: 'image', name: 'teilenBild', label: 'Bild für geteilte Links (Facebook, WhatsApp)' },
  ],
};

/** Settings group "Menü" (main navigation) – shared by every site's config. */
export const navFeld: TinaField = {
  type: 'object', name: 'nav', label: 'Menü', list: true,
  ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Link' }) },
  fields: [
    { type: 'string', name: 'titel', label: 'Beschriftung', required: true },
    { type: 'string', name: 'link', label: 'Link', required: true },
  ],
};

/**
 * Fields every dog collection shares (luchberg `hund`, `dackelHund`). Each collection picks and
 * orders them and adds its own; equal names keep equal types across collections.
 */
export const hundFelder = {
  name: (label = 'Name (mit Zwingername)'): TinaField =>
    ({ type: 'string', name: 'name', label, isTitle: true, required: true }),
  rufname: { type: 'string', name: 'rufname', label: 'Rufname', description: 'z. B. „Baja“ – wird groß angezeigt' } as TinaField,
  geschlecht: { type: 'string', name: 'geschlecht', label: 'Geschlecht', options: [...geschlechter] } as TinaField,
  kategorie: (kategorien: readonly Kategorie[]): TinaField =>
    ({ type: 'string', name: 'kategorie', label: 'Wo soll der Hund erscheinen?', options: [...kategorien] }),
  reihenfolge: { type: 'number', name: 'reihenfolge', label: 'Reihenfolge', description: 'Kleinere Zahl = weiter vorne' } as TinaField,
  geboren: { type: 'datetime', name: 'geboren', label: 'Wurftag', ui: { dateFormat: 'DD.MM.YYYY' } } as TinaField,
  verstorben: { type: 'string', name: 'verstorben', label: 'Verstorben am (optional)', description: 'Nur ausfüllen, wenn der Hund verstorben ist – z. B. 19.12.2025' } as TinaField,
  eltern: (description: string): TinaField => ({ type: 'string', name: 'eltern', label: 'Eltern', description }),
  gesundheit: { type: 'string', name: 'gesundheit', label: 'Gesundheit', ui: { component: 'textarea' } } as TinaField,
  bild: bildFeld('bild', 'Hauptbild'),
  body: { type: 'rich-text', name: 'body', label: 'Text über den Hund', isBody: true } as TinaField,
};

interface WurfFelderOptionen {
  /** Hint after "Vater – Link" / "Mutter – Link", e.g. " (working-dog.com)". */
  linkHinweis: string;
  /** Extra puppy fields, inserted after "Geschlecht". */
  welpenFelder?: TinaField[];
}

/** The field list of a litter collection (luchberg `wurf`, `dackelWurf`). */
export const wurfFelder = ({ linkHinweis, welpenFelder = [] }: WurfFelderOptionen): TinaField[] => [
  { type: 'string', name: 'titel', label: 'Titel', isTitle: true, required: true, description: 'z. B. „C-Wurf“' },
  { type: 'string', name: 'buchstabe', label: 'Buchstabe', required: true },
  {
    type: 'string', name: 'status', label: 'Status',
    options: [...wurfStatus],
  },
  { type: 'datetime', name: 'wurfdatum', label: 'Wurftag (oder erwartet)', ui: { dateFormat: 'DD.MM.YYYY' } },
  { type: 'string', name: 'vater', label: 'Vater' },
  { type: 'string', name: 'vaterLink', label: `Vater – Link${linkHinweis}` },
  { type: 'string', name: 'mutter', label: 'Mutter' },
  { type: 'string', name: 'mutterLink', label: `Mutter – Link${linkHinweis}` },
  { type: 'string', name: 'kurztext', label: 'Kurztext (für die Übersicht)', ui: { component: 'textarea' } },
  bildFeld('bild', 'Titelbild'),
  { type: 'rich-text', name: 'body', label: 'Text', isBody: true },
  {
    type: 'object', name: 'welpen', label: 'Welpen', list: true,
    ui: { itemProps: (item: { name?: string }) => ({ label: item?.name || 'Welpe' }) },
    fields: [
      { type: 'string', name: 'name', label: 'Name' },
      {
        type: 'string', name: 'geschlecht', label: 'Geschlecht',
        options: [...geschlechter],
      },
      ...welpenFelder,
      { type: 'image', name: 'bild', label: 'Bild' },
      { type: 'string', name: 'link', label: `Link${linkHinweis}` },
      { type: 'string', name: 'notiz', label: 'Notiz', description: 'z. B. „vermittelt“ oder „bleibt bei uns“' },
    ],
  },
  galerieFeld,
];

/**
 * Settings group "Hinweis auf unsere andere Website" (footer cross-link, docs/plan/03-betrieb.md O9).
 * Only the text and picture are editable; the target URL comes from the site registry and the hint
 * is shown only once the target site is live.
 */
export const querverweisFeld: TinaField = {
  type: 'object', name: 'querverweis', label: 'Hinweis auf unsere andere Website',
  description: 'Kleiner Hinweis im Seitenfuß. Der Link wird automatisch gesetzt und erscheint erst, wenn die andere Website online ist.',
  fields: [
    { type: 'string', name: 'text', label: 'Text', description: 'z. B. „Wir züchten auch Rauhaardackel:“' },
    { type: 'image', name: 'bild', label: 'Kleines Rundbild (optional)' },
  ],
};
