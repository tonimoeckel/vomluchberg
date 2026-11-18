/**
 * "Welches Training passt?" quiz of the training site: three questions, one recommended offer.
 * Pure: no DOM, no Astro, no Tina. The block component renders the questions from `quizFragen`,
 * pre-renders one result card per slug in `quizGruende`, and its script shows the card of
 * `quizEmpfehlung()` (called with the visible offer slugs).
 */
import { beratungOption } from './anfrage';

/** Question ids double as the radio group names in the form. */
export const quizFragen = [
  {
    id: 'alter',
    frage: 'Wie alt ist euer Hund?',
    antworten: [
      { value: 'welpe', label: 'Welpe' },
      { value: 'junghund', label: 'Junghund' },
      { value: 'erwachsen', label: 'Erwachsener Hund' },
    ],
  },
  {
    id: 'ziel',
    frage: 'Was wünscht ihr euch?',
    antworten: [
      { value: 'grundlagen', label: 'Grundlagen: Sitz, Platz, Leine, Orientierung an euch' },
      { value: 'alltag', label: 'Hilfe bei einem konkreten Problem im Alltag' },
      { value: 'sport', label: 'Sportliche Übungen für Fokus und Bindung' },
    ],
  },
  {
    id: 'rahmen',
    frage: 'Wie trainiert ihr am liebsten?',
    antworten: [
      { value: 'allein', label: 'Allein mit mir, ganz auf euch abgestimmt' },
      { value: 'gruppe', label: 'In einer kleinen Gruppe mit bis zu 6 Hunden' },
      { value: 'egal', label: 'Ist uns egal' },
    ],
  },
] as const;

type Frage = (typeof quizFragen)[number];
export type QuizFrageId = Frage['id'];
export type QuizAntworten = { [F in Frage as F['id']]: F['antworten'][number]['value'] };

/** Slug of the "please advise me" choice of the inquiry form. */
export const beratung = beratungOption.value;

export interface QuizErgebnis {
  /** Offer slug, or `beratung`. */
  slug: string;
  /** One sentence why it fits (shown under the offer name). */
  grund: string;
}

/** One sentence per possible result, why it fits (pre-rendered on the result cards). */
export const quizGruende = {
  welpenkurs: 'Im Welpenkurs lernt euer junger Hund in einer kleinen Gruppe Bindung, andere Hunde und erste sportliche Übungen kennen.',
  basistraining: 'Im Basistraining übt ihr in einer kleinen Gruppe Orientierung, Leinenführigkeit und Impulskontrolle für den Alltag.',
  einzeltraining: 'Im Einzeltraining nehmen wir uns genau eure Fragen vor, ob Alltag, Verhalten oder der nächste Schritt im Sport.',
  beratung: 'Das klären wir am besten kurz persönlich: Schreibt mir, was ihr euch wünscht, und ich sage euch, was passt.',
} as const;

export type QuizSlug = keyof typeof quizGruende;

/** Offer for a complete set of answers, before checking which offers are visible. */
function passendesAngebot({ alter, ziel, rahmen }: QuizAntworten): QuizSlug {
  // One-to-one wished: individual work, whatever the age or goal.
  if (rahmen === 'allein') return 'einzeltraining';
  // Young dogs go to the puppy group, unless a concrete problem is better solved one to one.
  if (alter === 'welpe') return ziel === 'alltag' && rahmen === 'egal' ? 'einzeltraining' : 'welpenkurs';
  if (ziel === 'grundlagen') return 'basistraining';
  // A concrete problem or sport goals with an older dog are individual work.
  if (rahmen === 'egal') return 'einzeltraining';
  // Group wished, but a concrete problem or sport goals with an older dog: no course fits for sure.
  return 'beratung';
}

const istAntwort = (frage: Frage, wert: unknown) => frage.antworten.some((a) => a.value === wert);

/** Reads the answers (e.g. from FormData); null while a question is unanswered or a value is unknown. */
export function quizAntworten(werte: { get(name: string): unknown }): QuizAntworten | null {
  const antworten: Record<string, unknown> = {};
  for (const frage of quizFragen) {
    const wert = werte.get(frage.id);
    if (!istAntwort(frage, wert)) return null;
    antworten[frage.id] = wert;
  }
  return antworten as QuizAntworten;
}

/**
 * Recommended offer for the answers. Only a visible offer (slug in `sichtbar`) may be recommended;
 * otherwise, and for ambiguous combinations, the result is `beratung`.
 */
export function quizEmpfehlung(antworten: QuizAntworten, sichtbar: readonly string[]): QuizErgebnis {
  const slug = passendesAngebot(antworten);
  return slug !== 'beratung' && sichtbar.includes(slug)
    ? { slug, grund: quizGruende[slug] }
    : { slug: beratung, grund: quizGruende.beratung };
}

/** All answer combinations (for tests and the build-time check of the result cards). */
export const alleKombinationen = (): QuizAntworten[] =>
  quizFragen.reduce<Record<string, string>[]>(
    (bisher, frage) => bisher.flatMap((k) => frage.antworten.map((a) => ({ ...k, [frage.id]: a.value }))),
    [{}],
  ) as QuizAntworten[];
