import type { TinaField } from 'tinacms';

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
