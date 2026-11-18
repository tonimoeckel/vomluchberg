// Copy of the "Rückruf" game ("ihr/euch", no dashes, Karo's training voice). Proposals until Karo
// has read them (docs/plan/fragen-an-karo.md K-R5).

import type { AblenkungArt } from './level';
import type { Rueckmeldung, Wertung } from './physik';

export const ablenkungNamen: Record<AblenkungArt, string> = {
  reh: 'das Reh',
  eichhoernchen: 'das Eichhörnchen',
  jogger: 'der Jogger',
  hund: 'der andere Hund',
  wurst: 'die Wurst',
};

export const meldungen: Record<Rueckmeldung, string> = {
  hier: 'Hier!',
  stolperer: 'Hoppla',
  nass: 'Platsch',
  abgelenkt: 'Abgelenkt',
};

export const hinweise = {
  sprung: 'Springen: Leertaste, Enter oder tippen',
  ruf: 'Abgelenkt! Jetzt rufen',
};

const ziel: Record<number, string> = {
  5: 'Sitz. Vorbildlicher Rückruf!',
  4: 'Fast perfekt. Da sitzt einer stolz vor euch.',
  3: 'Gut gemacht, auch wenn nicht jede Ablenkung kalt ließ.',
  2: 'Angekommen ist er. Beim nächsten Mal ruft ihr etwas früher.',
  1: 'Der kam eher zufällig. Genau das üben wir im Training.',
};

export function zielZeile(w: Wertung): string {
  return ziel[w.pfoten] ?? ziel[1];
}

export function wegZeile(wegen?: AblenkungArt): string {
  const was = wegen ? ablenkungNamen[wegen] : 'die Ablenkung';
  return `Weg ist er: ${was} war spannender. Genau das üben wir im Training.`;
}

export function statistik(w: Wertung): string {
  const stolperer = w.stolperer === 1 ? '1 Stolperer' : `${w.stolperer} Stolperer`;
  return `${w.geschafft} von ${w.ablenkungen} Ablenkungen gemeistert, ${stolperer}, ${w.sekunden} Sekunden`;
}
