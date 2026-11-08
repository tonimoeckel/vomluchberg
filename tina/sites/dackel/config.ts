import type { TinaField } from 'tinacms';
import { querverweisFeld } from '../../collections/fields';
import { basisEinstellungen, einstellungenCollection } from '../collections';

/** Short status line of the puppy panel when no litter is current or planned. */
const hinweisFeld: TinaField = {
  type: 'string', name: 'hinweis', label: 'Hinweis zu Welpen',
  description: 'Erscheint im Welpen-Feld, solange kein Wurf „aktuell“ oder „in Planung“ ist – z. B. „Derzeit keine Welpen, Anfragen gern jederzeit.“',
};

/** Club line in the footer. Leave empty until it is settled (docs/plan/01-dackel.md, K5). */
const verbandFeld: TinaField = {
  type: 'object', name: 'verband', label: 'Verband',
  description: 'Bitte erst ausfüllen, wenn mit Toni geklärt ist, was hier stehen darf.',
  fields: [
    { type: 'string', name: 'text', label: 'Text' },
    { type: 'string', name: 'link', label: 'Link' },
  ],
};

/** Settings of the dackel site ("Dackel · Einstellungen"). */
export const DackelConfigCollection = einstellungenCollection('dackel', [
  ...basisEinstellungen,
  hinweisFeld,
  querverweisFeld,
  verbandFeld,
]);
