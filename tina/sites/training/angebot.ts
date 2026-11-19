import type { Collection } from 'tinacms';
import { angebotArten, angebotUrl, preisEinheiten } from '../../../src/lib/domain/angebot';
import { slugify } from '../../../src/lib/domain/slug';
import { bildFeld, galerieFeld } from '../../collections/fields';
import { siteRouter } from '../router';
import { angebotAbschnitte } from './abschnitte';

/** Offers of the training site ("Angebote"), one detail page each at /angebote/<slug> (docs/plan/02-training.md §4.1). */
export const TrainingAngebotCollection: Collection = {
  name: 'trainingAngebot',
  label: 'Training · Angebote',
  path: 'src/content/training/angebote',
  format: 'md',
  ui: {
    router: siteRouter('training', (document) => angebotUrl(document._sys.filename)),
    filename: {
      slugify: (values: { kurztitel?: string; titel?: string }) => slugify(values?.kurztitel || values?.titel, 'neues-angebot'),
    },
  },
  defaultItem: () => ({ art: 'gruppe', reihenfolge: 10, sichtbar: true, preisAnzeigen: true, preisEinheit: 'termin', dauerMinuten: 45 }),
  fields: [
    { type: 'string', name: 'titel', label: 'Titel', isTitle: true, required: true },
    { type: 'string', name: 'kurztitel', label: 'Kurzname (Formular, Karten)', required: true, description: 'z. B. „Basistraining“ – steht im Anfrageformular und im Betreff der E-Mail' },
    { type: 'string', name: 'untertitel', label: 'Unterzeile', description: 'z. B. „Für Alltag, Verhalten oder Sport“' },
    { type: 'string', name: 'art', label: 'Art', options: [...angebotArten] },
    { type: 'number', name: 'reihenfolge', label: 'Reihenfolge', description: 'Kleinere Zahl = weiter vorne' },
    { type: 'boolean', name: 'sichtbar', label: 'Auf der Website zeigen', description: 'Aus = das Angebot verschwindet von der Website und aus dem Anfrageformular' },
    { type: 'string', name: 'kurzbeschreibung', label: 'Kurzbeschreibung (Karte, Google)', ui: { component: 'textarea' } },
    { type: 'rich-text', name: 'body', label: 'Beschreibung', isBody: true },
    {
      type: 'object', name: 'blocks', label: 'Abschnitte (Aufbau der Seite)', list: true, templates: angebotAbschnitte,
      description: 'Stehen zwischen der Beschreibung und dem Anfrageformular. So bekommt jedes Angebot seinen eigenen Aufbau.',
    },
    { type: 'number', name: 'dauerMinuten', label: 'Dauer pro Termin (Minuten)' },
    { type: 'number', name: 'anzahlTermine', label: 'Anzahl Termine', description: 'Leer lassen bei einzelnen Terminen' },
    { type: 'number', name: 'maxTeilnehmer', label: 'Höchstens so viele Hunde pro Gruppe', description: 'Leer lassen beim Einzeltraining' },
    { type: 'number', name: 'preis', label: 'Preis in €' },
    { type: 'string', name: 'preisEinheit', label: 'Preis gilt pro', options: [...preisEinheiten] },
    { type: 'boolean', name: 'preisAnzeigen', label: 'Preis auf der Website zeigen' },
    { type: 'boolean', name: 'aufAnfrage', label: 'Nur nach Absprache', description: 'Zeigt das Schild „Auf Anfrage“' },
    { type: 'string', name: 'terminHinweis', label: 'Nächste Termine (Text)', description: 'z. B. „Termine auf Anfrage“ oder „Start am 12.04., samstags 10 Uhr“' },
    { type: 'string', name: 'ziel', label: 'Unser Ziel (großer Satz unter der Beschreibung)', ui: { component: 'textarea' } },
    { type: 'string', name: 'rahmen', label: 'Rahmenbedingungen', list: true, description: 'z. B. „Dauer: 45 Minuten“, „Trainingsort: nach Absprache“' },
    { type: 'string', name: 'mitbringen', label: 'Das solltet ihr mitbringen', list: true },
    { type: 'string', name: 'voraussetzungen', label: 'Für wen passt das Angebot? (Voraussetzungen)', ui: { component: 'textarea' } },
    bildFeld('bild', 'Hauptbild'),
    { type: 'string', name: 'bildBeschreibung', label: 'Was ist auf dem Hauptbild zu sehen?', description: 'Für blinde Menschen und Google' },
    galerieFeld,
  ],
};
