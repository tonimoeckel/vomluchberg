/** Domain rules for training offers ("Angebote", training site). Pure: shared by the site and the Tina admin schema. */
import type { Seo } from './seo';

/** Kinds of offer in display order – single source for the CMS options and labels. */
export const angebotArten = [
  { value: 'einzel', label: 'Einzeltraining' },
  { value: 'gruppe', label: 'Gruppenkurs' },
  { value: 'welpen', label: 'Welpenkurs' },
] as const;

export type AngebotArt = (typeof angebotArten)[number]['value'];

/** Label of a kind; empty when unknown. */
export const artLabel = (art?: string | null) => angebotArten.find((a) => a.value === art)?.label ?? '';

/** What a price applies to. */
export const preisEinheiten = [
  { value: 'termin', label: 'Termin' },
  { value: 'kurs', label: 'Kurs' },
] as const;

export const angeboteListeUrl = '/angebote';
export const angebotUrl = (slug: string) => `${angeboteListeUrl}/${slug}`;

export const anfrageSeiteUrl = '/anfrage';
/** Link to the inquiry form, optionally with the offer preselected. */
export const anfrageUrl = (slug?: string | null) =>
  slug ? `${anfrageSeiteUrl}?angebot=${encodeURIComponent(slug)}` : anfrageSeiteUrl;

type Sortierbar = { reihenfolge?: number | null; titel?: string | null };

/** Ascending by "reihenfolge" (missing = 99), then by title. */
export const sortiereAngebote = <T extends Sortierbar>(angebote: readonly T[]) =>
  [...angebote].sort(
    (a, b) => (a.reihenfolge ?? 99) - (b.reihenfolge ?? 99) || (a.titel ?? '').localeCompare(b.titel ?? '', 'de'),
  );

const alle = 'alle';

/** Choices of the "Angebote" block. "gruppe" covers group courses and puppy courses. */
export const angeboteBlockAuswahl = [
  { value: alle, label: 'Alle Angebote' },
  { value: 'gruppe', label: 'Nur Gruppen- und Welpenkurse' },
  { value: 'einzel', label: 'Nur Einzeltraining' },
] as const;

type Filterbar = Sortierbar & { art?: string | null; sichtbar?: boolean | null };

/** Offers shown on the site, sorted: hidden ones ("sichtbar: false") dropped, then filtered by the block choice. */
export function sichtbareAngebote<T extends Filterbar>(angebote: readonly T[], auswahl?: string | null) {
  const passt = (a: T) =>
    !auswahl || auswahl === alle ? true : auswahl === 'einzel' ? a.art === 'einzel' : a.art !== 'einzel';
  return sortiereAngebote(angebote.filter((a) => a.sichtbar !== false && passt(a)));
}

type Preisangaben = { preis?: number | null; preisEinheit?: string | null; preisAnzeigen?: boolean | null };

const nbsp = ' ';

/** Amount in euros, de-DE: "50 €", "12,50 €" (no decimals for whole euros). */
export const formatEuro = (betrag: number) =>
  betrag.toLocaleString('de-DE', {
    minimumFractionDigits: Number.isInteger(betrag) ? 0 : 2,
    maximumFractionDigits: 2,
  }) + `${nbsp}€`;

/** "50 € / Termin" or "100 € / Kurs"; null when there is no price or it is hidden. */
export function formatPreis({ preis, preisEinheit, preisAnzeigen }: Preisangaben) {
  if (preis == null || preisAnzeigen === false) return null;
  const einheit = preisEinheiten.find((e) => e.value === preisEinheit)?.label ?? 'Termin';
  return `${formatEuro(preis)} / ${einheit}`;
}

type Fakten = { art?: string | null; dauerMinuten?: number | null; anzahlTermine?: number | null; maxTeilnehmer?: number | null };

/** Fact chips of a card: duration (with number of sessions), group size, "Vor Ort". */
export function angebotFakten({ art, dauerMinuten, anzahlTermine, maxTeilnehmer }: Fakten) {
  const fakten: string[] = [];
  const termine = anzahlTermine && anzahlTermine > 1 ? anzahlTermine : null;
  if (termine && dauerMinuten) fakten.push(`${termine} Termine à ${dauerMinuten} Min.`);
  else if (termine) fakten.push(`${termine} Termine`);
  else if (dauerMinuten) fakten.push(`${dauerMinuten} Min.`);
  if (art === 'einzel') fakten.push('1 Mensch-Hund-Team');
  else if (maxTeilnehmer) fakten.push(`bis zu ${maxTeilnehmer} ${art === 'welpen' ? 'Welpen' : 'Hunde'}`);
  fakten.push('Vor Ort');
  return fakten;
}

type SeoAngaben = { titel: string; kurztitel?: string | null; kurzbeschreibung?: string | null; bild?: string | null };

export const angebotSeo = (angebot: SeoAngaben): Seo => ({
  title: angebot.titel,
  description:
    angebot.kurzbeschreibung ||
    `${angebot.kurztitel || angebot.titel}: Hundetraining in Glashütte (Osterzgebirge) bei Karolin Riesing – auf Anfrage.`,
  image: angebot.bild ?? null,
});

type JsonLdAngaben = SeoAngaben & Preisangaben & { slug: string; art?: string | null };
type Anbieter = { name: string; url: string };

/** schema.org "Service" for an offer's detail page; the price only appears when it is shown on the site. */
export function angebotJsonLd(angebot: JsonLdAngaben, anbieter: Anbieter) {
  const absolut = (pfad: string) => new URL(pfad, anbieter.url).href;
  const seo = angebotSeo(angebot);
  const preis = formatPreis(angebot);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: angebot.titel,
    description: seo.description,
    url: absolut(angebotUrl(angebot.slug)),
    ...(artLabel(angebot.art) && { serviceType: artLabel(angebot.art) }),
    ...(seo.image && { image: absolut(seo.image) }),
    provider: { '@type': 'LocalBusiness', name: anbieter.name, url: absolut('/') },
    areaServed: 'Glashütte, Osterzgebirge, Sachsen',
    ...(preis && {
      offers: { '@type': 'Offer', price: angebot.preis!.toFixed(2), priceCurrency: 'EUR', description: preis },
    }),
  };
}
