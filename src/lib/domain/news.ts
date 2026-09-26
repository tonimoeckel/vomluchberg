/** Domain rules for posts ("Aktuelles"). Pure: shared by the site and the Tina admin schema. */
import type { Seo } from './seo';

export const newsListeUrl = '/aktuelles';
export const newsUrl = (slug: string) => `${newsListeUrl}/${slug}`;

const zeit = (datum?: string | null) => new Date(datum ?? 0).valueOf();

/** Newest first; posts without date go last. */
export const sortiereNews = <T extends { datum?: string | null }>(news: readonly T[]) =>
  [...news].sort((a, b) => zeit(b.datum) - zeit(a.datum));

/** The first `anzahl` posts (all when empty) and whether to link to the full list. */
export function neuesteNews<T>(news: readonly T[], anzahl?: number | null) {
  const beitraege = anzahl ? news.slice(0, anzahl) : [...news];
  return { beitraege, zeigeAlleLink: news.length > beitraege.length };
}

export const newsSeo = (news: { titel: string; kurztext?: string | null; bild?: string | null }): Seo => ({
  title: news.titel,
  description: news.kurztext ?? null,
  image: news.bild ?? null,
});
