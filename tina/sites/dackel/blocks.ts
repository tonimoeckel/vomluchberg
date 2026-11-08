/**
 * Page blocks of the dackel site. Built from the shared templates (tina/blocks) plus a few fields of
 * its own (eyebrow "kicker", "variante"); the template names stay the same, so blockName() dispatch
 * works. Sibling-field rule (CLAUDE.md): equal names keep equal types within dackelPage.
 */
import type { Template, TinaField } from 'tinacms';
import { ctaBlock, galerieBlock, heroBlock, kontaktBlock, textBlock } from '../../blocks';
import { dackelHunde } from '../../../src/lib/domain/dackel';

const kicker: TinaField = { type: 'string', name: 'kicker', label: 'Kleine Zeile über der Überschrift' };
const ueberschrift: TinaField = { type: 'string', name: 'ueberschrift', label: 'Überschrift' };
const einleitung: TinaField = { type: 'string', name: 'text', label: 'Einleitung', ui: { component: 'textarea' } };
const bilder = galerieBlock.fields.find((f) => f.name === 'bilder')!;
const buttons = heroBlock.fields.find((f) => f.name === 'buttons')!;

/** Hero: adds a small note on the photo (e.g. the dogs' names) and short key points. */
export const dackelHeroBlock: Template = {
  ...heroBlock,
  fields: heroBlock.fields.flatMap((f): TinaField[] => {
    if (f.name === 'untertitel') return [f, { type: 'string', name: 'stichpunkte', label: 'Stichpunkte unter den Buttons', list: true }];
    if (f.name === 'bild') return [f, { type: 'string', name: 'bildnotiz', label: 'Notiz auf dem Bild', description: 'z. B. „Hanni & Bonnie“' }];
    return [f];
  }),
};

export const dackelTextBlock: Template = { ...textBlock, fields: [kicker, ...textBlock.fields] };

/** Values as ruled columns (no icons). */
export const dackelHighlightsBlock: Template = {
  name: 'highlights',
  label: 'Stichpunkte in Spalten',
  fields: [
    kicker,
    ueberschrift,
    {
      type: 'object', name: 'items', label: 'Stichpunkte', list: true,
      ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Stichpunkt' }) },
      fields: [
        { type: 'string', name: 'titel', label: 'Titel' },
        { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
      ],
    },
  ],
};

export const dackelGalerieBlock: Template = {
  ...galerieBlock,
  fields: [
    kicker,
    ueberschrift,
    {
      type: 'string', name: 'variante', label: 'Aussehen',
      options: [{ value: 'raster', label: 'Raster' }, { value: 'band', label: 'Fotoband (seitlich scrollen)' }],
    },
    bilder,
  ],
};

export const dackelHundeBlock: Template = {
  name: 'hunde',
  label: 'Dackel-Übersicht (automatisch)',
  fields: [
    kicker,
    ueberschrift,
    einleitung,
    { type: 'string', name: 'kategorie', label: 'Welche Dackel?', options: [...dackelHunde.hundeBlockAuswahl] },
    {
      type: 'string', name: 'variante', label: 'Aussehen',
      options: [{ value: 'gruppiert', label: 'Mit Gruppen-Überschriften' }, { value: 'karten', label: 'Nur Karten (Startseite)' }],
    },
  ],
};

export const dackelWuerfeBlock: Template = {
  name: 'wuerfe',
  label: 'Würfe-Übersicht (automatisch)',
  fields: [
    kicker,
    ueberschrift,
    einleitung,
    { type: 'string', name: 'leer', label: 'Text, wenn kein Wurf eingetragen ist', ui: { component: 'textarea' } },
  ],
};

/** Dark-green panel about puppies; the status line comes from the litters or the settings' "Hinweis". */
export const dackelWelpenBlock: Template = {
  name: 'welpen',
  label: 'Welpen-Hinweis (dunkles Feld)',
  fields: [
    kicker,
    { type: 'string', name: 'titel', label: 'Titel' },
    { type: 'string', name: 'text', label: 'Text', ui: { component: 'textarea' } },
    bilder,
    buttons,
  ],
};

export const dackelCtaBlock: Template = { ...ctaBlock, fields: [kicker, ...ctaBlock.fields] };
export const dackelKontaktBlock: Template = { ...kontaktBlock, fields: [kicker, ...kontaktBlock.fields] };

export const dackelBlocks = [
  dackelHeroBlock, dackelTextBlock, dackelHighlightsBlock, dackelGalerieBlock, dackelHundeBlock,
  dackelWuerfeBlock, dackelWelpenBlock, dackelCtaBlock, dackelKontaktBlock,
];
