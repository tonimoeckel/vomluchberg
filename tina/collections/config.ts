import type { Collection } from 'tinacms';

export const ConfigCollection: Collection = {
  name: 'config',
  label: 'Einstellungen',
  path: 'src/content/config',
  format: 'json',
  ui: { global: true, allowedActions: { create: false, delete: false } },
  fields: [
    {
      type: 'object', name: 'website', label: 'Website',
      fields: [
        { type: 'string', name: 'name', label: 'Name der Website', required: true },
        { type: 'string', name: 'untertitel', label: 'Untertitel (unter dem Namen)' },
        { type: 'string', name: 'beschreibung', label: 'Standard-Beschreibung für Google', ui: { component: 'textarea' } },
        { type: 'image', name: 'logo', label: 'Logo' },
        { type: 'image', name: 'logoDunkel', label: 'Logo für die dunkle Ansicht', description: 'Helle Version des Logos. Wird gezeigt, wenn das Handy oder der Computer auf „Dunkel“ steht.' },
        { type: 'image', name: 'teilenBild', label: 'Bild für geteilte Links (Facebook, WhatsApp)' },
      ],
    },
    {
      type: 'string', name: 'farbschema', label: 'Farbschema',
      options: [
        { value: 'sonnenuntergang', label: 'Sonnenuntergang (Orange → Pink)' },
        { value: 'neon', label: 'Neon (knallige Details)' },
        { value: 'pfirsich', label: 'Pfirsich (sanft & warm)' },
      ],
    },
    {
      type: 'object', name: 'kontakt', label: 'Kontaktdaten',
      fields: [
        { type: 'string', name: 'zwinger', label: 'Zwinger' },
        { type: 'string', name: 'zuechterin', label: 'Züchterin' },
        { type: 'string', name: 'strasse', label: 'Straße' },
        { type: 'string', name: 'ort', label: 'PLZ & Ort' },
        { type: 'string', name: 'telefon', label: 'Telefon' },
        { type: 'string', name: 'email', label: 'E-Mail' },
      ],
    },
    {
      type: 'object', name: 'social', label: 'Social Media & Verband',
      fields: [
        { type: 'string', name: 'facebook', label: 'Facebook-Link' },
        { type: 'string', name: 'instagram', label: 'Instagram-Link' },
        { type: 'string', name: 'workingDog', label: 'Zuchtstätte auf working-dog.com' },
        { type: 'string', name: 'verband', label: 'Verband (Text)', description: 'z. B. „Mitglied im ADRK – Zwingernummer 2461“' },
        { type: 'string', name: 'verbandLink', label: 'Verband (Link)' },
      ],
    },
    {
      type: 'object', name: 'nav', label: 'Menü', list: true,
      ui: { itemProps: (i: { titel?: string }) => ({ label: i?.titel || 'Link' }) },
      fields: [
        { type: 'string', name: 'titel', label: 'Beschriftung', required: true },
        { type: 'string', name: 'link', label: 'Link', required: true },
      ],
    },
  ],
};
