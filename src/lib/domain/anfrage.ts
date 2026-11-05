/** Domain rules for the training inquiry form ("Anfrage"). Pure: no DOM, no Astro. */
import { sortiereAngebote } from './angebot';

export interface AnfrageOption { value: string; label: string }

/** Extra choice for people who don't know which offer fits. */
export const beratungOption: AnfrageOption = { value: 'beratung', label: 'Ich bin noch unsicher – bitte beraten' };

type Angebot = { slug: string; titel: string; kurztitel?: string | null; reihenfolge?: number | null; sichtbar?: boolean | null };

/** Options of the offer select: visible offers in display order (short name as label), then "beratung". */
export const anfrageOptionen = (angebote: readonly Angebot[]): AnfrageOption[] => [
  ...sortiereAngebote(angebote.filter((a) => a.sichtbar !== false)).map((a) => ({
    value: a.slug,
    label: a.kurztitel || a.titel,
  })),
  beratungOption,
];

/** Preselected offer from the "?angebot=" query value: a known option value, otherwise "" (nothing selected). */
export const vorauswahl = (param: string | null | undefined, optionen: readonly AnfrageOption[]) =>
  optionen.find((o) => o.value === param?.trim())?.value ?? '';

/** Preferred time slots (checkboxes). */
export const wunschzeiten = ['Wochentags vormittags', 'Wochentags nachmittags', 'Wochentags abends', 'Wochenende'] as const;

/** Form field names – the form component and the parsing below must use the same names. */
export const anfrageFelder = {
  angebot: 'angebot',
  name: 'name',
  email: 'email',
  telefon: 'telefon',
  hundName: 'hund_name',
  hundRasse: 'hund_rasse',
  hundAlter: 'hund_alter',
  nachricht: 'nachricht',
  zeiten: 'zeiten',
  zeitenText: 'zeiten_text',
} as const;

export interface AnfrageDaten {
  angebot: string;
  name: string;
  email: string;
  telefon: string;
  hundName: string;
  hundRasse: string;
  hundAlter: string;
  nachricht: string;
  zeiten: string[];
  zeitenText: string;
}

/** Anything FormData-like (FormData, URLSearchParams). */
interface FormularWerte { get(name: string): unknown; getAll(name: string): unknown[] }

const text = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** Reads the submitted form into trimmed strings; empty checkboxes and blank values are dropped from "zeiten". */
export function anfrageAusFormular(werte: FormularWerte): AnfrageDaten {
  const f = anfrageFelder;
  return {
    angebot: text(werte.get(f.angebot)),
    name: text(werte.get(f.name)),
    email: text(werte.get(f.email)),
    telefon: text(werte.get(f.telefon)),
    hundName: text(werte.get(f.hundName)),
    hundRasse: text(werte.get(f.hundRasse)),
    hundAlter: text(werte.get(f.hundAlter)),
    nachricht: text(werte.get(f.nachricht)),
    zeiten: werte.getAll(f.zeiten).map(text).filter(Boolean),
    zeitenText: text(werte.get(f.zeitenText)),
  };
}

/** Label of the chosen offer; falls back to the raw value, empty when nothing is chosen. */
export const angebotLabel = (angebot: string, optionen: readonly AnfrageOption[]) =>
  optionen.find((o) => o.value === angebot)?.label ?? angebot;

/** Mail subject: "Trainingsanfrage: Basistraining – Anna Muster". */
export function anfrageBetreff(daten: Pick<AnfrageDaten, 'angebot' | 'name'>, optionen: readonly AnfrageOption[]) {
  const label = angebotLabel(daten.angebot, optionen);
  return ['Trainingsanfrage' + (label ? `: ${label}` : ''), daten.name].filter(Boolean).join(' – ');
}

/** Preferred times as one line: checked slots, then the free text. */
export const wunschzeitenText = (daten: Pick<AnfrageDaten, 'zeiten' | 'zeitenText'>) =>
  [daten.zeiten.join(', '), daten.zeitenText].filter(Boolean).join('; ');

/** Plain-text mail body (mailto: fallback): labelled lines, empty fields skipped, the message last. */
export function anfrageMailText(daten: AnfrageDaten, optionen: readonly AnfrageOption[]) {
  const zeilen: [string, string][] = [
    ['Angebot', angebotLabel(daten.angebot, optionen)],
    ['Name', daten.name],
    ['E-Mail', daten.email],
    ['Telefon', daten.telefon],
    ['Hund', daten.hundName],
    ['Rasse / Mix', daten.hundRasse],
    ['Alter', daten.hundAlter],
    ['Wunschzeiten', wunschzeitenText(daten)],
  ];
  const kopf = zeilen.filter(([, wert]) => wert).map(([label, wert]) => `${label}: ${wert}`);
  return [kopf.join('\n'), daten.nachricht && `Nachricht:\n${daten.nachricht}`].filter(Boolean).join('\n\n');
}

/** mailto: link with subject and body, for when no form service is configured. */
export const anfrageMailto = (an: string, daten: AnfrageDaten, optionen: readonly AnfrageOption[]) =>
  `mailto:${an}?subject=${encodeURIComponent(anfrageBetreff(daten, optionen))}` +
  `&body=${encodeURIComponent(anfrageMailText(daten, optionen))}`;
