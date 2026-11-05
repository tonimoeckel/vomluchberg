import { describe, expect, it } from 'vitest';
import {
  anfrageAusFormular, anfrageBetreff, anfrageFelder, anfrageMailText, anfrageMailto, anfrageOptionen, angebotLabel,
  beratungOption, vorauswahl, wunschzeiten, wunschzeitenText, type AnfrageDaten,
} from './anfrage';

const angebote = [
  { slug: 'welpenkurs', titel: 'Welpenkurs', reihenfolge: 3 },
  { slug: 'einzeltraining', titel: 'Einzeltraining', reihenfolge: 1 },
  { slug: 'basistraining', titel: 'Basistraining – Hör auf damit, mach was mir gefällt', kurztitel: 'Basistraining', reihenfolge: 2 },
  { slug: 'alt', titel: 'Alter Kurs', reihenfolge: 4, sichtbar: false },
];
const optionen = anfrageOptionen(angebote);

const leer: AnfrageDaten = {
  angebot: '', name: '', email: '', telefon: '', hundName: '', hundRasse: '', hundAlter: '', nachricht: '', zeiten: [], zeitenText: '',
};

describe('anfrageOptionen', () => {
  it('lists visible offers in order with their short name, then the advice option', () => {
    expect(optionen).toEqual([
      { value: 'einzeltraining', label: 'Einzeltraining' },
      { value: 'basistraining', label: 'Basistraining' },
      { value: 'welpenkurs', label: 'Welpenkurs' },
      { value: 'beratung', label: 'Ich bin noch unsicher – bitte beraten' },
    ]);
  });

  it('still offers advice without any offers', () => {
    expect(anfrageOptionen([])).toEqual([beratungOption]);
  });
});

describe('vorauswahl', () => {
  it('accepts known option values', () => {
    expect(vorauswahl('basistraining', optionen)).toBe('basistraining');
    expect(vorauswahl(' welpenkurs ', optionen)).toBe('welpenkurs');
    expect(vorauswahl('beratung', optionen)).toBe('beratung');
  });

  it('ignores unknown, hidden, missing or malicious values', () => {
    expect(vorauswahl('alt', optionen)).toBe('');
    expect(vorauswahl('Basistraining', optionen)).toBe('');
    expect(vorauswahl('<script>', optionen)).toBe('');
    expect(vorauswahl('', optionen)).toBe('');
    expect(vorauswahl(null, optionen)).toBe('');
    expect(vorauswahl(undefined, optionen)).toBe('');
  });
});

describe('wunschzeiten', () => {
  it('lists the time slots', () => {
    expect(wunschzeiten).toEqual(['Wochentags vormittags', 'Wochentags nachmittags', 'Wochentags abends', 'Wochenende']);
  });
});

describe('anfrageAusFormular', () => {
  it('reads all fields from FormData, trimmed, with multiple time slots', () => {
    const fd = new FormData();
    fd.set(anfrageFelder.angebot, 'welpenkurs');
    fd.set(anfrageFelder.name, '  Anna Muster ');
    fd.set(anfrageFelder.email, 'anna@example.org');
    fd.set(anfrageFelder.telefon, '0170 123456');
    fd.set(anfrageFelder.hundName, 'Bonnie');
    fd.set(anfrageFelder.hundRasse, 'Rauhaardackel');
    fd.set(anfrageFelder.hundAlter, '4 Monate');
    fd.set(anfrageFelder.nachricht, 'Sie zieht an der Leine.\n');
    fd.append(anfrageFelder.zeiten, 'Wochenende');
    fd.append(anfrageFelder.zeiten, 'Wochentags abends');
    fd.set(anfrageFelder.zeitenText, 'ab Mai');
    expect(anfrageAusFormular(fd)).toEqual({
      angebot: 'welpenkurs', name: 'Anna Muster', email: 'anna@example.org', telefon: '0170 123456',
      hundName: 'Bonnie', hundRasse: 'Rauhaardackel', hundAlter: '4 Monate', nachricht: 'Sie zieht an der Leine.',
      zeiten: ['Wochenende', 'Wochentags abends'], zeitenText: 'ab Mai',
    });
  });

  it('turns missing fields into empty values and drops blank time slots', () => {
    const fd = new URLSearchParams([['name', 'Anna'], ['zeiten', ' ']]);
    expect(anfrageAusFormular(fd)).toEqual({ ...leer, name: 'Anna' });
  });

  it('uses the field names of the mockup form', () => {
    expect(Object.values(anfrageFelder)).toEqual([
      'angebot', 'name', 'email', 'telefon', 'hund_name', 'hund_rasse', 'hund_alter', 'nachricht', 'zeiten', 'zeiten_text',
    ]);
  });
});

describe('angebotLabel / anfrageBetreff', () => {
  it('resolves the offer label', () => {
    expect(angebotLabel('basistraining', optionen)).toBe('Basistraining');
    expect(angebotLabel('unbekannt', optionen)).toBe('unbekannt');
    expect(angebotLabel('', optionen)).toBe('');
  });

  it('builds the subject from offer and name', () => {
    expect(anfrageBetreff({ angebot: 'basistraining', name: 'Anna Muster' }, optionen)).toBe('Trainingsanfrage: Basistraining – Anna Muster');
    expect(anfrageBetreff({ angebot: '', name: 'Anna Muster' }, optionen)).toBe('Trainingsanfrage – Anna Muster');
    expect(anfrageBetreff({ angebot: 'welpenkurs', name: '' }, optionen)).toBe('Trainingsanfrage: Welpenkurs');
    expect(anfrageBetreff({ angebot: '', name: '' }, optionen)).toBe('Trainingsanfrage');
  });
});

describe('wunschzeitenText', () => {
  it('joins the slots and appends the free text', () => {
    expect(wunschzeitenText({ zeiten: ['Wochenende', 'Wochentags abends'], zeitenText: 'ab Mai' })).toBe('Wochenende, Wochentags abends; ab Mai');
    expect(wunschzeitenText({ zeiten: [], zeitenText: 'ab Mai' })).toBe('ab Mai');
    expect(wunschzeitenText({ zeiten: ['Wochenende'], zeitenText: '' })).toBe('Wochenende');
    expect(wunschzeitenText({ zeiten: [], zeitenText: '' })).toBe('');
  });
});

describe('anfrageMailText / anfrageMailto', () => {
  const daten: AnfrageDaten = {
    angebot: 'welpenkurs', name: 'Anna Muster', email: 'anna@example.org', telefon: '', hundName: 'Bonnie',
    hundRasse: '', hundAlter: '4 Monate', nachricht: 'Sie zieht an der Leine.', zeiten: ['Wochenende'], zeitenText: '',
  };

  it('lists the filled fields with labels and puts the message last', () => {
    expect(anfrageMailText(daten, optionen)).toBe(
      'Angebot: Welpenkurs\nName: Anna Muster\nE-Mail: anna@example.org\nHund: Bonnie\nAlter: 4 Monate\nWunschzeiten: Wochenende' +
      '\n\nNachricht:\nSie zieht an der Leine.',
    );
  });

  it('works without a message and without any fields', () => {
    expect(anfrageMailText({ ...leer, name: 'Anna' }, optionen)).toBe('Name: Anna');
    expect(anfrageMailText(leer, optionen)).toBe('');
  });

  it('encodes subject and body into a mailto link', () => {
    const link = anfrageMailto('karo@example.org', daten, optionen);
    expect(link.startsWith('mailto:karo@example.org?subject=Trainingsanfrage%3A%20Welpenkurs%20%E2%80%93%20Anna%20Muster&body=')).toBe(true);
    const body = new URL(link).searchParams.get('body');
    expect(body).toBe(anfrageMailText(daten, optionen));
  });
});
