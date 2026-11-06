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
