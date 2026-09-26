/** Filename slug for new CMS documents, e.g. "Donna von der staubzer Höhe" → "donna-von-der-staubzer-hoehe". */
export const slugify = (text: string | null | undefined, fallback: string) =>
  (text || fallback)
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
