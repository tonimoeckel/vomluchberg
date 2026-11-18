// Copy of the "Ansprache" game ("ihr/euch", no dashes, Karo's training voice). Proposals until Karo
// has read them (docs/plan/fragen-an-karo.md K-R5).

import type { AblenkungArt } from './strecke';
import type { Rueckmeldung, Wertung } from './physik';

export const STANDARDNAME = 'Bruno';

export const ablenkungNamen: Record<AblenkungArt, string> = {
  reh: 'das Reh',
  eichhoernchen: 'das Eichhörnchen',
  jogger: 'der Jogger',
  hund: 'der andere Hund',
  wurst: 'die Wurst',
};

/** A dog's name as typed: trimmed, one line, at most 20 characters, a default when empty. */
export function hundename(eingabe: string | null | undefined): string {
  const name = (eingabe ?? '').replace(/\s+/g, ' ').trim().slice(0, 20);
  return name || STANDARDNAME;
}

export const meldungen: Record<Rueckmeldung, string> = {
  fein: 'Fein!',
  ja: 'Ja?',
  stolperer: 'Hoppla',
  nass: 'Platsch',
};

export const hinweise = {
  sprung: 'Springen: Leertaste oder tippen',
  ansprache: (name: string) => `${name} ist abgelenkt! Auf ${name} tippen`,
};

export function wegZeile(name: string, wegen?: AblenkungArt): string {
  const was = wegen ? ablenkungNamen[wegen] : 'die Ablenkung';
  return `Weg ist ${name}: ${was} war spannender.`;
}

export function statistik(w: Wertung): string {
  const ablenkungen = w.gemeistert === 1 ? '1 Ablenkung gemeistert' : `${w.gemeistert} Ablenkungen gemeistert`;
  return `${ablenkungen}, ${w.meter} Meter in ${w.sekunden} Sekunden`;
}
