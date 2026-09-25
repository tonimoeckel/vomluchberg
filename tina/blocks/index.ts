import type { Template } from 'tinacms';

const buttons = {
  type: 'object', name: 'buttons', label: 'Buttons', list: true,
  ui: { itemProps: (i: { label?: string }) => ({ label: i?.label || 'Button' }) },
  fields: [
    { type: 'string', name: 'label', label: 'Beschriftung' },
    { type: 'string', name: 'link', label: 'Link', description: 'z. B. /kontakt oder /hunde' },
    {
      type: 'string', name: 'stil', label: 'Stil',
      options: [{ value: 'primaer', label: 'Farbig' }, { value: 'sekundaer', label: 'Umrandet' }],
    },
  ],
} as const;

export const heroBlock: Template = {
  name: 'hero',
  label: 'Großer Seitenkopf',
  ui: { defaultItem: { titel: 'Willkommen', untertitel: '' } },
  fields: [
    { type: 'string', name: 'kicker', label: 'Kleine Zeile über dem Titel' },
    { type: 'string', name: 'titel', label: 'Titel' },
    { type: 'string', name: 'untertitel', label: 'Untertitel', ui: { component: 'textarea' } },
    { type: 'image', name: 'bild', label: 'Bild' },
    {
      type: 'string', name: 'variante', label: 'Aussehen',
      options: [{ value: 'gross', label: 'Groß mit Bild (Startseite)' }, { value: 'schmal', label: 'Schmal (Unterseiten)' }],
    },
    buttons as any,
  ],
};

export const textBlock: Template = {
  name: 'text',
  label: 'Text (mit Bild)',
  fields: [
    { type: 'string', name: 'ueberschrift', label: 'Überschrift' },
    { type: 'rich-text', name: 'inhalt', label: 'Text' },
    { type: 'image', name: 'bild', label: 'Bild (optional)' },
    { type: 'string', name: 'bildunterschrift', label: 'Bildunterschrift' },
    {
      type: 'string', name: 'bildPosition', label: 'Bild-Position',
      options: [{ value: 'rechts', label: 'Rechts' }, { value: 'links', label: 'Links' }],
    },
    { type: 'boolean', name: 'hervorheben', label: 'Farbig hinterlegen' },
  ],
};

export const highlightsBlock: Template = {
  name: 'highlights',
  label: 'Kacheln / Stichpunkte',
  fields: [
    { type: 'string', name: 'ueberschrift', label: 'Überschrift' },
    {
      type: 'object', name: 'items', label: 'Kacheln', list: true,
      ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Kachel' }) },
      fields: [
        { type: 'string', name: 'icon', label: 'Icon', description: 'Tabler-Icon-Name, z. B. heart, paw, shield-check, home, certificate' },
        { type: 'string', name: 'titel', label: 'Titel' },
        { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
      ],
    },
  ],
};

export const galerieBlock: Template = {
  name: 'galerie',
  label: 'Bildergalerie',
  fields: [
    { type: 'string', name: 'ueberschrift', label: 'Überschrift' },
    {
      type: 'object', name: 'bilder', label: 'Bilder', list: true,
      ui: { itemProps: (i: { beschreibung?: string; bild?: string }) => ({ label: i?.beschreibung || i?.bild?.split('/').pop() || 'Bild' }) },
      fields: [
        { type: 'image', name: 'bild', label: 'Bild' },
        { type: 'string', name: 'beschreibung', label: 'Beschreibung' },
      ],
    },
  ],
};

export const hundeBlock: Template = {
  name: 'hunde',
  label: 'Hunde-Übersicht (automatisch)',
  fields: [
    { type: 'string', name: 'ueberschrift', label: 'Überschrift' },
    { type: 'string', name: 'text', label: 'Einleitung', ui: { component: 'textarea' } },
    {
      type: 'string', name: 'kategorie', label: 'Welche Hunde?',
      options: [
        { value: 'alle', label: 'Alle (gruppiert)' },
        { value: 'zucht', label: 'Unsere Rottweiler' },
        { value: 'rudel', label: 'Weitere Rudelmitglieder' },
      ],
    },
  ],
};

export const wuerfeBlock: Template = {
  name: 'wuerfe',
  label: 'Würfe-Übersicht (automatisch)',
  fields: [
    { type: 'string', name: 'ueberschrift', label: 'Überschrift' },
    { type: 'string', name: 'text', label: 'Einleitung', ui: { component: 'textarea' } },
  ],
};

export const newsBlock: Template = {
  name: 'news',
  label: 'Aktuelles (automatisch)',
  fields: [
    { type: 'string', name: 'ueberschrift', label: 'Überschrift' },
    { type: 'number', name: 'anzahl', label: 'Anzahl Beiträge', description: 'Leer = alle' },
  ],
};

export const ctaBlock: Template = {
  name: 'cta',
  label: 'Aufruf mit Button',
  fields: [
    { type: 'string', name: 'titel', label: 'Titel' },
    { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
    buttons as any,
  ],
};

export const kontaktBlock: Template = {
  name: 'kontakt',
  label: 'Kontaktdaten + Formular',
  fields: [
    { type: 'string', name: 'ueberschrift', label: 'Überschrift' },
    { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
    { type: 'boolean', name: 'formular', label: 'Kontaktformular anzeigen' },
  ],
};

export const allBlocks = [
  heroBlock, textBlock, highlightsBlock, galerieBlock, hundeBlock, wuerfeBlock, newsBlock, ctaBlock, kontaktBlock,
];
