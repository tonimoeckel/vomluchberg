/** Meta data of a detail page (title, description, share image). */
export interface Seo { title: string; description: string | null; image: string | null }

type Website = { name?: string | null; beschreibung?: string | null; teilenBild?: string | null } | null | undefined;

/** Head meta of a page: the title gets the site name appended, missing description and image come from the site. */
export function metaDaten(seo: Partial<Seo>, website: Website): Seo & { description: string } {
  const name = website?.name ?? 'Rottweiler vom Luchberg';
  return {
    title: seo.title && !seo.title.includes(name) ? `${seo.title} | ${name}` : seo.title || name,
    description: seo.description || website?.beschreibung || '',
    image: seo.image || website?.teilenBild || null,
  };
}

/** CMS page ("Seite"): its own title and description, the site's share image. */
export const seiteSeo = (seite: { titel: string; beschreibung?: string | null }): Seo => ({
  title: seite.titel,
  description: seite.beschreibung ?? null,
  image: null,
});
