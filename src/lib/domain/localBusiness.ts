/** schema.org "LocalBusiness" of a site's start page (training site, docs/plan/02-training.md §3 "Local SEO"). Pure. */

export interface BetriebAngaben {
  name: string;
  /** Absolute site URL (https://…/). */
  url: string;
  beschreibung?: string | null;
  bild?: string | null;
  logo?: string | null;
  strasse?: string | null;
  /** "01768 Glashütte" – postal code and town in one field, as in the CMS. */
  ort?: string | null;
  region?: string | null;
  email?: string | null;
  telefon?: string | null;
  /** Profiles and related sites (Instagram, vomluchberg.de). */
  sameAs?: readonly (string | null | undefined)[];
  areaServed?: readonly string[];
}

/** Splits "01768 Glashütte" into postal code and town; anything without a leading postal code is the town. */
export function plzOrt(ort?: string | null): { postalCode?: string; addressLocality?: string } {
  const text = (ort ?? '').trim();
  const m = /^(\d{5})\s+(.+)$/.exec(text);
  if (m) return { postalCode: m[1], addressLocality: m[2] };
  return text ? { addressLocality: text } : {};
}

/** The region field ("Osterzgebirge, Sachsen") names the state last. */
const bundesland = (region?: string | null) => region?.split(',').pop()?.trim() || undefined;

export function localBusinessJsonLd(b: BetriebAngaben) {
  const absolut = (pfad: string) => new URL(pfad, b.url).href;
  const sameAs = (b.sameAs ?? []).filter((s): s is string => !!s);
  const adresse = { ...plzOrt(b.ort), ...(b.strasse && { streetAddress: b.strasse }) };
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: b.name,
    url: absolut('/'),
    ...(b.beschreibung && { description: b.beschreibung }),
    ...(b.bild && { image: absolut(b.bild) }),
    ...(b.logo && { logo: absolut(b.logo) }),
    ...(Object.keys(adresse).length > 0 && {
      address: {
        '@type': 'PostalAddress',
        ...adresse,
        ...(bundesland(b.region) && { addressRegion: bundesland(b.region) }),
        addressCountry: 'DE',
      },
    }),
    ...(b.email && { email: b.email }),
    ...(b.telefon && { telephone: b.telefon }),
    ...(b.areaServed?.length && { areaServed: [...b.areaServed] }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}
