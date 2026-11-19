/**
 * Sections of an offer's detail page ("Abschnitte", the `blocks` field of trainingAngebot): each
 * offer page gets its own build-up from these templates, between the description and the form.
 * Rendered by src/sites/training/components/AngebotAbschnitte.astro (dispatch on blockName()).
 * Sibling-field rule (per collection): `ueberschrift` and `text` are strings in every template; the
 * lists have their own names (`etappen`, `vorteile`, `schritte`, `wege`).
 */
import type { Template, TinaField } from 'tinacms';

const ueberschrift: TinaField = { type: 'string', name: 'ueberschrift', label: 'Überschrift' };
const einleitung: TinaField = { type: 'string', name: 'text', label: 'Einleitung', ui: { component: 'textarea' } };
const textarea = { component: 'textarea' } as const;

const ebene = (name: string, label: string): TinaField => ({
  type: 'object', name, label,
  fields: [
    { type: 'string', name: 'titel', label: 'Titel', description: 'z. B. „Signale“' },
    { type: 'string', name: 'zusatz', label: 'Zusatz', description: 'z. B. „Konditionierung“' },
    { type: 'string', name: 'beschreibung', label: 'Beschreibung', ui: textarea },
  ],
});

/** The two levels of a course as a section through the Luchberg: the wide base and the summit. */
export const ebenenAbschnitt: Template = {
  name: 'ebenen',
  label: 'Zwei Ebenen (Berg im Schnitt)',
  ui: { defaultItem: { ueberschrift: 'Erst das Fundament, dann der Gipfel' } },
  fields: [
    ueberschrift,
    einleitung,
    ebene('fundament', 'Unten: das Fundament'),
    ebene('gipfel', 'Oben: der Gipfel'),
    { type: 'string', name: 'hinweis', label: 'Hinweis im Kärtchen', description: 'z. B. für wen der Kurs geeignet ist', ui: textarea },
  ],
};

/** Stages of a course, numbered and joined by a puppy's (or a dog's) paw trail. */
export const etappenAbschnitt: Template = {
  name: 'etappen',
  label: 'Etappen (nummeriert, mit Pfotenspur)',
  ui: { defaultItem: { ueberschrift: 'In drei Etappen' } },
  fields: [
    ueberschrift,
    einleitung,
    {
      type: 'object', name: 'etappen', label: 'Etappen', list: true,
      ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Etappe' }) },
      fields: [
        { type: 'string', name: 'titel', label: 'Titel' },
        { type: 'string', name: 'beschreibung', label: 'Beschreibung', ui: textarea },
        { type: 'image', name: 'bild', label: 'Bild (optional)' },
        { type: 'string', name: 'bildBeschreibung', label: 'Was ist auf dem Bild zu sehen?' },
      ],
    },
    {
      type: 'string', name: 'spur', label: 'Pfotenspur',
      options: [{ value: 'welpe', label: 'Kleine Welpenpfoten' }, { value: 'hund', label: 'Hundepfoten' }],
    },
  ],
};

/** What the training brings you: a ruled grid of outcomes, an icon each. */
export const vorteileAbschnitt: Template = {
  name: 'vorteile',
  label: 'Was ihr davon habt (mit Symbolen)',
  ui: { defaultItem: { ueberschrift: 'Was ihr davon habt' } },
  fields: [
    ueberschrift,
    einleitung,
    {
      type: 'object', name: 'vorteile', label: 'Punkte', list: true,
      ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Punkt' }) },
      fields: [
        { type: 'string', name: 'icon', label: 'Symbol', description: 'Name eines Tabler-Icons, z. B. heart-handshake, message-circle, leash, mood-happy, scale, home-heart' },
        { type: 'string', name: 'titel', label: 'Titel' },
        { type: 'string', name: 'beschreibung', label: 'Beschreibung', ui: textarea },
      ],
    },
  ],
};

/** The way in: numbered steps from the first message, then a fork into the ways that follow. */
export const einstiegAbschnitt: Template = {
  name: 'einstieg',
  label: 'So fangen wir an (Schritte mit Abzweig)',
  ui: { defaultItem: { ueberschrift: 'So fangen wir an' } },
  fields: [
    ueberschrift,
    einleitung,
    {
      type: 'object', name: 'schritte', label: 'Schritte', list: true,
      ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Schritt' }) },
      fields: [
        { type: 'string', name: 'titel', label: 'Titel' },
        { type: 'string', name: 'beschreibung', label: 'Beschreibung', ui: textarea },
      ],
    },
    {
      type: 'object', name: 'wege', label: 'Danach geht es weiter mit … (Abzweig)', list: true,
      ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Weg' }) },
      fields: [
        { type: 'string', name: 'titel', label: 'Titel' },
        { type: 'string', name: 'beschreibung', label: 'Beschreibung', ui: textarea },
        { type: 'string', name: 'linkText', label: 'Linktext' },
        { type: 'string', name: 'link', label: 'Link', description: 'z. B. /angebote/basistraining' },
      ],
    },
  ],
};

export const angebotAbschnitte = [ebenenAbschnitt, etappenAbschnitt, vorteileAbschnitt, einstiegAbschnitt];
