/**
 * Page blocks of the training site (docs/plan/02-training.md §4.2). The training site has its own
 * templates for hero, text, highlights and galerie (extra fields for its look); `cta` is shared.
 * Sibling-field rule: inside the trainingPage templates a field name has one type everywhere
 * (`kicker`/`ueberschrift`/`text` strings, `stichworte` string list, `buttons` object list).
 */
import type { Template, TinaField } from 'tinacms';
import { angeboteBlockAuswahl } from '../../../src/lib/domain/angebot';

const kicker: TinaField = { type: 'string', name: 'kicker', label: 'Kleine Zeile über der Überschrift' };
const ueberschrift: TinaField = { type: 'string', name: 'ueberschrift', label: 'Überschrift' };
const einleitung: TinaField = { type: 'string', name: 'text', label: 'Einleitung', ui: { component: 'textarea' } };
const stichworte: TinaField = {
  type: 'string', name: 'stichworte', label: 'Stichworte (kleine Kästchen)', list: true,
};
const hintergrund: TinaField = {
  type: 'string', name: 'hintergrund', label: 'Hintergrund',
  options: [
    { value: 'hell', label: 'Hell' },
    { value: 'sand', label: 'Sandfarben' },
    { value: 'dunkel', label: 'Dunkelblau' },
  ],
};

/** Same shape as the buttons of the shared hero/cta templates. */
export const buttonsFeld: TinaField = {
  type: 'object', name: 'buttons', label: 'Buttons', list: true,
  ui: { itemProps: (i: { label?: string }) => ({ label: i?.label || 'Button' }) },
  fields: [
    { type: 'string', name: 'label', label: 'Beschriftung' },
    { type: 'string', name: 'link', label: 'Link', description: 'z. B. /anfrage, /angebote oder https://www.vomluchberg.de' },
    {
      type: 'string', name: 'stil', label: 'Stil',
      options: [{ value: 'primaer', label: 'Farbig' }, { value: 'sekundaer', label: 'Umrandet' }],
    },
  ],
};

export const trainingHeroBlock: Template = {
  name: 'hero',
  label: 'Seitenkopf',
  ui: { defaultItem: { titel: 'Überschrift', variante: 'schmal' } },
  fields: [
    kicker,
    { type: 'string', name: 'titel', label: 'Titel' },
    { type: 'string', name: 'akzent', label: 'Hervorgehobenes Wort am Ende (kupferfarben)', description: 'z. B. „Sport.“ – erscheint nach dem Titel' },
    { type: 'string', name: 'untertitel', label: 'Untertitel', ui: { component: 'textarea' } },
    { type: 'image', name: 'bild', label: 'Bild' },
    { type: 'string', name: 'bildBeschreibung', label: 'Was ist auf dem Bild zu sehen?' },
    {
      type: 'string', name: 'variante', label: 'Aussehen',
      options: [{ value: 'gross', label: 'Groß mit Bild (Startseite)' }, { value: 'schmal', label: 'Schmal (Unterseiten)' }],
    },
    buttonsFeld,
    { type: 'string', name: 'hinweis', label: 'Hinweis unter den Buttons', ui: { component: 'textarea' } },
    { type: 'boolean', name: 'angebotKarte', label: 'Kärtchen mit dem ersten Angebot auf dem Bild zeigen' },
  ],
};

export const trainingTextBlock: Template = {
  name: 'text',
  label: 'Text (mit Bild)',
  fields: [
    kicker,
    ueberschrift,
    { type: 'rich-text', name: 'inhalt', label: 'Text' },
    stichworte,
    { type: 'image', name: 'bild', label: 'Bild (optional)' },
    { type: 'string', name: 'bildunterschrift', label: 'Was ist auf dem Bild zu sehen?' },
    {
      type: 'string', name: 'bildPosition', label: 'Bild-Position',
      options: [{ value: 'rechts', label: 'Rechts' }, { value: 'links', label: 'Links' }],
    },
    hintergrund,
    buttonsFeld,
  ],
};

export const trainingHighlightsBlock: Template = {
  name: 'highlights',
  label: 'Kacheln / Stichpunkte',
  fields: [
    kicker,
    ueberschrift,
    einleitung,
    {
      type: 'string', name: 'darstellung', label: 'Darstellung',
      options: [
        { value: 'kacheln', label: 'Kacheln mit Icon' },
        { value: 'band', label: 'Dunkelblaues Band (kurze Fakten)' },
        { value: 'schritte', label: 'Nummerierte Schritte (01, 02, …)' },
        { value: 'werte', label: 'Kompakte Liste mit Nummern' },
      ],
    },
    {
      type: 'object', name: 'items', label: 'Kacheln', list: true,
      ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Kachel' }) },
      fields: [
        { type: 'string', name: 'icon', label: 'Icon', description: 'Tabler-Icon-Name, z. B. users, shield-check, award, certificate, heart' },
        { type: 'string', name: 'titel', label: 'Titel' },
        { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
      ],
    },
  ],
};

export const trainingGalerieBlock: Template = {
  name: 'galerie',
  label: 'Bildergalerie',
  fields: [
    kicker,
    ueberschrift,
    einleitung,
    stichworte,
    hintergrund,
    {
      type: 'object', name: 'bilder', label: 'Bilder', list: true,
      ui: { itemProps: (i: { beschreibung?: string; bild?: string }) => ({ label: i?.beschreibung || i?.bild?.split('/').pop() || 'Bild' }) },
      fields: [
        { type: 'image', name: 'bild', label: 'Bild' },
        { type: 'string', name: 'beschreibung', label: 'Was ist auf dem Bild zu sehen?' },
        { type: 'string', name: 'titel', label: 'Kurzer Titel auf dem Bild (optional)' },
      ],
    },
  ],
};

export const angeboteBlock: Template = {
  name: 'angebote',
  label: 'Angebote-Übersicht (automatisch)',
  fields: [
    kicker,
    ueberschrift,
    einleitung,
    { type: 'string', name: 'auswahl', label: 'Welche Angebote?', options: [...angeboteBlockAuswahl] },
    { type: 'boolean', name: 'alleLink', label: 'Link „Alle Angebote“ zeigen' },
  ],
};

export const zeitstrahlBlock: Template = {
  name: 'zeitstrahl',
  label: 'Werdegang (Zeitstrahl)',
  fields: [
    kicker,
    ueberschrift,
    einleitung,
    {
      type: 'object', name: 'stationen', label: 'Stationen', list: true,
      ui: { itemProps: (i: { zeit?: string; titel?: string }) => ({ label: [i?.zeit, i?.titel].filter(Boolean).join(' – ') || 'Station' }) },
      fields: [
        { type: 'string', name: 'zeit', label: 'Wann?', description: 'z. B. „Seit 2019“' },
        { type: 'string', name: 'titel', label: 'Was?' },
        { type: 'string', name: 'beschreibung', label: 'Beschreibung (optional)', ui: { component: 'textarea' } },
      ],
    },
  ],
};

export const zitatBlock: Template = {
  name: 'zitat',
  label: 'Zitat',
  fields: [
    { type: 'string', name: 'zitat', label: 'Zitat', ui: { component: 'textarea' } },
    { type: 'string', name: 'autor', label: 'Von wem?' },
    { type: 'image', name: 'bild', label: 'Bild (optional)' },
  ],
};

export const anfrageBlock: Template = {
  name: 'anfrage',
  label: 'Anfrageformular',
  fields: [
    kicker,
    ueberschrift,
    einleitung,
    { type: 'boolean', name: 'kontaktZeigen', label: 'Kontaktdaten neben dem Formular zeigen' },
  ],
};
