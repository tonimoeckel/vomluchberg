"""Erzeugt die Start-Inhalte (src/content/**) aus der alten Website.

Quelle: migration/old-site-content.json (Texte) + migration/image-map.json (Bilder).
Einmalig ausgeführt beim Projekt-Setup – danach wird alles über TinaCMS gepflegt.
"""
import json, os, re, datetime
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, 'src', 'content')
pages = {p['path']: p for p in json.load(open(os.path.join(ROOT, 'migration', 'old-site-content.json')))}
imgs = json.load(open(os.path.join(ROOT, 'migration', 'image-map.json')))['pages']

# Bilder, die in der alten Galerie falsch gedreht waren
SKIP = {'4200cbf0', 'beab0532'}


def gal(path, limit=16, skip_first=0):
    out = []
    for i in imgs.get(path, [])[skip_first:]:
        if any(s in i for s in SKIP):
            continue
        out.append({'bild': i})
    return out[:limit]


def iso(d):  # "10.03.2024" -> ISO
    dd, mm, yy = d.split('.')
    return datetime.datetime(int(yy), int(mm), int(dd), 12).strftime('%Y-%m-%dT%H:%M:%S.000Z')


class Q(str):
    pass


def write_md(path, front, body=''):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    fm = yaml.safe_dump(front, allow_unicode=True, sort_keys=False, width=1000)
    with open(path, 'w', encoding='utf-8') as f:
        f.write('---\n' + fm + '---\n\n' + body.strip() + '\n')


# ---------------------------------------------------------------- Einstellungen
config = {
    'website': {
        'name': 'Rottweiler vom Luchberg',
        'untertitel': 'ADRK-Zuchtstätte in Glashütte OT Luchau',
        'beschreibung': 'Rottweiler aus Liebe und Leidenschaft: Unsere ADRK-Zuchtstätte "vom Luchberg" in Glashütte OT Luchau (Sachsen) – gesunde, wesensfeste Familien- und Sporthunde.',
        'logo': '/uploads/seiten/logo-kopf-dunkel.png',
        'teilenBild': '/uploads/header/header-0.jpg',
    },
    'farbschema': 'sonnenuntergang',
    'kontakt': {
        'zwinger': 'ADRK Rottweilerzwinger vom Luchberg',
        'zuechterin': 'Karolin Riesing',
        'strasse': 'Dorfstr. 2d',
        'ort': '01768 Glashütte OT Luchau',
        'telefon': '0173 3665494',
        'email': 'luchberg.rottweiler@gmail.com',
    },
    'social': {
        'facebook': 'https://www.facebook.com/LuchbergRottis',
        'instagram': 'https://instagram.com/luchberg_rottis',
        'workingDog': 'https://www.working-dog.com/breed/vom-Luchberg-258275',
        'verband': 'Mitglied im ADRK · Zwingernummer 2461',
        'verbandLink': 'https://www.adrk.de',
    },
    'nav': [
        {'titel': 'Start', 'link': '/'},
        {'titel': 'Über uns', 'link': '/zucht'},
        {'titel': 'Unsere Hunde', 'link': '/hunde'},
        {'titel': 'Würfe', 'link': '/wuerfe'},
        {'titel': 'Aktuelles', 'link': '/aktuelles'},
        {'titel': 'Galerie', 'link': '/galerie'},
        {'titel': 'Kontakt', 'link': '/kontakt'},
    ],
}
os.makedirs(os.path.join(C, 'config'), exist_ok=True)
json.dump(config, open(os.path.join(C, 'config', 'config.json'), 'w'), ensure_ascii=False, indent=2)

# ---------------------------------------------------------------- Hunde
hunde = [
    dict(file='aaron-vom-luchberg', name='Aaron vom Luchberg', rufname='Aaron', geschlecht='ruede', kategorie='zucht', reihenfolge=10,
         geboren=iso('21.11.2022'), eltern='Josch vom Findberg x Donna von der staubzer Höhe',
         gesundheit='HD/ED frei, LÜW o.B., JLPP, DM, LEMP, NAD, XLMTM & Langhaar frei',
         leistungen='AKZ: BH/VT, IGP 1, IGP 2, IGP 3 · Salzlandschau 2026: V2',
         workingDog='https://www.working-dog.com/dogs-details/7536221/Aaron-vom-Luchberg',
         bild='/uploads/hunde/aaron/dsc_0437-1.jpg', src='rottweilerrueden/aaron-vom-luchberg/index.html',
         body='Aaron stammt aus unserem A-Wurf und ist bei uns geblieben. Gemeinsam mit Uli hat er die IGP 3 erfolgreich abgelegt.'),
    dict(file='baja-vom-luchberg', name='Baja vom Luchberg', rufname='Baja', geschlecht='huendin', kategorie='zucht', reihenfolge=20,
         geboren=iso('10.03.2024'), eltern='Luis vom Eisernen Kreuz x Donna von der staubzer Höhe',
         gesundheit='HD/ED frei, LÜW o.B., JLPP, DM, NAD, LEMP, XLMTM & Langhaar frei',
         leistungen='LKZ: FCI-BH/VT, FCI-IGP I · Salzlandschau 2026: SG2',
         workingDog='https://www.working-dog.com/dogs-details/7813928/Baja-vom-Luchberg',
         bild='/uploads/hunde/baja/dsc_1326.jpg', src='rottweilerhuendinnen/baja-vom-luchberg/index.html',
         body='Baja stammt aus unserem B-Wurf und ist unsere Nachwuchshündin. 2026 haben wir gemeinsam die IGP 1 gemeistert.'),
    dict(file='hunter-vom-auersberg', name='Hunter vom Auersberg', rufname='Hunter', geschlecht='ruede', kategorie='zucht', reihenfolge=30,
         geboren=iso('16.03.2022'), eltern='Elgin vom Weiltal x Santana vom Hause Neubrand',
         leistungen='Schaubewertung: SG4 und V4',
         workingDog='https://www.working-dog.com/dogs-details/7410988/Hunter-vom-Auersberg',
         bild='/uploads/hunde/hunter/dsc_0380-2.jpg', src='rottweilerrueden/hunter-vom-auersberg/index.html', body=''),
    dict(file='harley-vom-auersberg', name='Harley vom Auersberg', rufname='Harley', geschlecht='huendin', kategorie='aufzucht', reihenfolge=40,
         geboren=iso('16.03.2022'), eltern='Elgin vom Weiltal x Santana vom Hause Neubrand',
         workingDog='https://www.working-dog.com/dogs-details/7410998/Harley-vom-Auersberg',
         bild='/uploads/hunde/harley/297fd6eb-77e2-37f5-e858-b15e33369228.jpg', src='harley-vom-auersberg/index.html',
         body='Zur Aufzucht von Juli 2022 bis Mai 2023 bei uns. Züchterin: Linda Grzanna, ZG Rottweiler vom Auersberg.'),
    dict(file='rauhaardackel', name='Unsere Rauhaardackel', rufname='Rauhaardackel', geschlecht='huendin', kategorie='rudel', reihenfolge=50,
         bild='/uploads/rudel/dackel/c3b66134-8be9-44da-b2ec-5831581ad930.jpg', src='weitere-rudelmitglieder/rauhaardackel/index.html',
         body=pages['weitere-rudelmitglieder/rauhaardackel/index.html']['text'].split('\n\n', 1)[1].replace('## Bildergalerie', '').strip()),
    dict(file='donna-von-der-staubzer-hoehe', name='Donna von der staubzer Höhe', rufname='Donna', geschlecht='huendin', kategorie='erinnerung', reihenfolge=90,
         geboren=iso('06.06.2018'), verstorben='19.12.2025', eltern='Quadro von der Scherau x Yasmina vom Räuberweg',
         gesundheit='HD+, ED-, JLPP frei',
         leistungen='BH/VT, IGP 1, ZTP, IGP 2, IGP 3, FH 1, UPr 3, IFH 1',
         workingDog='https://www.working-dog.com/dogs-details/6471655/Donna-von-der-Staubzer-H%C3%B6he',
         bild='/uploads/hunde/donna/a8337035-4ff3-0cb0-0f92-5198c8f7d0ae.jpg', src='rottweilerhuendinnen/donna-von-der-staubzer-hoehe/index.html',
         body='Donna war der Grundstein unserer Zucht. Mit ihr hat alles angefangen – und in ihrem Nachwuchs lebt sie weiter.'),
]
import glob
for h in hunde:
    # Donna-Bild: exakten Dateinamen auflösen
    if not os.path.exists(os.path.join(ROOT, 'public', h['bild'].lstrip('/'))):
        cand = glob.glob(os.path.join(ROOT, 'public', os.path.dirname(h['bild']).lstrip('/'), os.path.basename(h['bild'])[:8] + '*'))
        h['bild'] = '/' + os.path.relpath(cand[0], os.path.join(ROOT, 'public'))
    src = h.pop('src'); body = h.pop('body'); f = h.pop('file')
    front = {k: v for k, v in h.items() if v}
    front['galerie'] = [g for g in gal(src, 16) if g['bild'] != h['bild']]
    write_md(os.path.join(C, 'hunde', f + '.md'), front, body)

# ---------------------------------------------------------------- Würfe
def welpen(prefix, names):
    out = []
    for n, g in names:
        p = pages[f'{prefix}/{n}/index.html']
        link = re.search(r'\((https://[^)]+)\)', p['text'])
        w = {'name': f'{n.capitalize()} vom Luchberg', 'geschlecht': g}
        if imgs.get(p['path']):
            w['bild'] = imgs[p['path']][0]
        if link:
            w['link'] = link.group(1).replace('%20image__link', '')
        out.append(w)
    return out

a = welpen('welpen/wurf', [('aaron', 'ruede'), ('alba', 'huendin'), ('alf', 'ruede'), ('amani', 'huendin'), ('aria', 'huendin'), ('ava', 'huendin')])
for w in a:
    if w['name'].startswith('Aaron'):
        w['notiz'] = 'ist bei uns geblieben'
write_md(os.path.join(C, 'wuerfe', 'a-wurf.md'), {
    'titel': 'A-Wurf', 'buchstabe': 'A', 'status': 'vergangen', 'wurfdatum': iso('21.11.2022'),
    'vater': 'Josch vom Findberg', 'vaterLink': 'https://de.working-dog.com/dogs-details/3065881/Josch-vom-Findberg',
    'mutter': 'Donna von der staubzer Höhe', 'mutterLink': 'https://de.working-dog.com/dogs-details/6471655/Donna-von-der-Staubzer-H%C3%B6he',
    'kurztext': 'Unser erster Wurf – alle Welpen sind vermittelt.',
    'bild': '/uploads/wuerfe/a-wurf/picsart_22-06-12_20-05-03-144.jpg',
    'welpen': a, 'galerie': gal('welpen/wurf/index.html', 24, 2),
}, 'Unser erster Wurf: Donna von der staubzer Höhe x Josch vom Findberg. Alle Welpen sind vermittelt!')

b = welpen('welpen/b-w', [('bailey', 'huendin'), ('baja', 'huendin'), ('baloo', 'ruede'), ('bernd', 'ruede'), ('bronco', 'ruede')])
for w in b:
    if w['name'].startswith('Baja'):
        w['notiz'] = 'ist bei uns geblieben'
write_md(os.path.join(C, 'wuerfe', 'b-wurf.md'), {
    'titel': 'B-Wurf', 'buchstabe': 'B', 'status': 'vergangen', 'wurfdatum': iso('10.03.2024'),
    'vater': 'Luis vom Eisernen Kreuz', 'vaterLink': 'https://de.working-dog.com/dogs-details/6744407/Luis-vom-Eisernen-Kreuz',
    'mutter': 'Donna von der staubzer Höhe', 'mutterLink': 'https://de.working-dog.com/dogs-details/6471655/Donna-von-der-Staubzer-H%C3%B6he',
    'kurztext': 'Fünf Welpen – Baja ist bei uns geblieben.',
    'bild': '/uploads/wuerfe/b-wurf/picsart_24-01-09_19-04-13-4391657.jpg',
    'welpen': b, 'galerie': gal('welpen/b-w/index.html', 24, 4),
}, 'Unser zweiter Wurf: Luis vom Eisernen Kreuz x Donna von der staubzer Höhe.')

write_md(os.path.join(C, 'wuerfe', 'c-wurf.md'), {
    'titel': 'C-Wurf', 'buchstabe': 'C', 'status': 'geplant',
    'kurztext': 'Unser C-Wurf ist in Planung. Bei Interesse meldet euch gern – wir informieren euch rechtzeitig.',
    'bild': '/uploads/header/header-1.jpg',
}, 'Unser C-Wurf ist in Planung. Sobald es Neuigkeiten gibt, erfahrt ihr sie hier und unter „Aktuelles“.\n\nBei Interesse an einem Welpen aus unserer Zucht freuen wir uns über eine ausführliche Nachricht zu euch, euren Haltungsbedingungen und euren Vorstellungen.')

# ---------------------------------------------------------------- Aktuelles
FOOT = re.compile(r'^(« voriger Eintrag.*|Weiter »|Zurück|Ganzen Eintrag lesen »)$')
for path, p in pages.items():
    if not path.startswith('aktuelles/') or path == 'aktuelles/index.html':
        continue
    slug = path.split('/')[1]
    if slug == 'sitz-platzund-steh-aber-wie-geht-das':
        slug = 'sitz-platz-und-steh-teil-2-platz'
    paras = p['text'].split('\n\n')
    datum = None; body = []
    for para in paras[1:]:
        m = re.match(r'Veröffentlicht am (\d\d\.\d\d\.\d{4})', para)
        if m:
            datum = m.group(1); continue
        if FOOT.match(para.strip()):
            continue
        para = para.replace('????', '').lstrip('# ').strip() if para.startswith('# ') else para.replace('????', '')
        para = re.sub(r'^- (Am )', r'\1', para)
        body.append(para.strip())
    titel = p['title'].strip()
    if slug == 'sitz-platz-und-steh-teil-2-platz':
        titel = 'Sitz, Platz und Steh – Teil 2: Platz'
    elif slug == 'sitz-platz-und-steh-aber-wie-geht-das':
        titel = 'Sitz, Platz und Steh – Teil 1: Sitz'
    front = {'titel': titel, 'datum': iso(datum), 'kurztext': re.sub(r'\s+', ' ', body[0])[:220] if body else ''}
    if imgs.get(path):
        front['bild'] = imgs[path][0]
    write_md(os.path.join(C, 'aktuelles', slug + '.md'), front, '\n\n'.join(body))

# ---------------------------------------------------------------- Seiten
about = pages['about-me/index.html']['text'].split('\n\n')
about_text = '\n\n'.join(x for x in about[1:] if x not in ('Mein Uli mit Donna',))
zucht = pages['zuchtstaette/index.html']['text'].split('\n\n')
zucht_text = '\n\n'.join(x for x in zucht[1:] if not x.startswith(('Zuchtstätte Rottweiler vom Luchberg –', 'Zwingeranlage', 'Wurfraum')))

seiten = {
    'home': {
        'titel': 'Rottweiler vom Luchberg – ADRK-Zuchtstätte in Sachsen',
        'beschreibung': config['website']['beschreibung'],
        'blocks': [
            {'_template': 'hero', 'variante': 'gross', 'kicker': 'ADRK-Zuchtstätte seit 2021',
             'titel': 'Willkommen bei den Rottweilern vom Luchberg',
             'untertitel': 'Wir züchten Rottweiler aus Liebe und Leidenschaft – gesund, wesensfest und mit Familienanschluss aufgewachsen. Familienhund und Sportpartner in einem.',
             'bild': '/uploads/header/header-0.jpg',
             'buttons': [{'label': 'Unsere Hunde', 'link': '/hunde', 'stil': 'primaer'}, {'label': 'Würfe & Welpen', 'link': '/wuerfe', 'stil': 'sekundaer'}]},
            {'_template': 'highlights', 'ueberschrift': 'Was uns wichtig ist', 'items': [
                {'icon': 'heart-handshake', 'titel': 'Familienanschluss', 'text': 'Unsere Hunde wachsen im Rudel und in der Familie auf – mit Kindern, anderen Tieren und allen Alltagsgeräuschen.'},
                {'icon': 'shield-check', 'titel': 'Gesundheit & Wesen', 'text': 'Jede Verpaarung wird mit Bedacht gewählt. Gesundheitsauswertungen und ein stabiles Wesen stehen an erster Stelle.'},
                {'icon': 'trophy', 'titel': 'Sporthund Rottweiler', 'text': 'IGP, Fährte und Unterordnung: Wer sich für einen Rotti vom Luchberg entscheidet, bekommt einen aktiven Freizeitpartner.'},
            ]},
            {'_template': 'text', 'ueberschrift': 'Schön, dass ihr da seid', 'bildPosition': 'rechts',
             'inhalt': 'Ich bin Karo und lebe mit meiner Familie und unserem Rudel in Luchau, einem Ortsteil von Glashütte in Sachsen. Mit meiner Hündin Donna hat alles angefangen – heute züchten wir unter dem Zwingernamen „vom Luchberg“ im ADRK.\n\n[Mehr über uns und unsere Zucht →](/zucht)',
             'bild': '/uploads/seiten/picsart_22-07-19_10-43-34-5111_1.jpg'},
            {'_template': 'hunde', 'ueberschrift': 'Unsere Rottweiler', 'kategorie': 'zucht'},
            {'_template': 'wuerfe', 'ueberschrift': 'Unsere Würfe'},
            {'_template': 'news', 'ueberschrift': 'Aktuelles', 'anzahl': 3},
            {'_template': 'cta', 'titel': 'Interesse an einem Welpen?', 'text': 'Erzählt uns ein bisschen von euch, euren Haltungsbedingungen und euren Vorstellungen – wir melden uns gern.',
             'buttons': [{'label': 'Kontakt aufnehmen', 'link': '/kontakt', 'stil': 'primaer'}]},
        ],
    },
    'zucht': {
        'titel': 'Über uns & unsere Zuchtstätte',
        'beschreibung': 'Wer wir sind und wie wir züchten: die ADRK-Zuchtstätte „vom Luchberg“ in Glashütte OT Luchau.',
        'blocks': [
            {'_template': 'hero', 'variante': 'schmal', 'kicker': 'Über uns', 'titel': 'Über mich & unsere Zucht'},
            {'_template': 'text', 'ueberschrift': 'Das bin ich', 'bildPosition': 'rechts', 'inhalt': about_text,
             'bild': '/uploads/seiten/picsart_22-07-19_10-29-21-327.jpg', 'bildunterschrift': 'Karo mit Donna'},
            {'_template': 'text', 'ueberschrift': 'Zuchtstätte vom Luchberg', 'bildPosition': 'links', 'hervorheben': True, 'inhalt': zucht_text,
             'bild': '/uploads/seiten/logo-dunkel.png'},
            {'_template': 'highlights', 'ueberschrift': 'Das kann ich euch anbieten', 'items': [
                {'icon': 'message-heart', 'titel': 'Rat und Tat', 'text': 'Auch nach dem Einzug stehen wir euch mit Rat und Tat zur Seite.'},
                {'icon': 'run', 'titel': 'Hundetraining', 'text': 'Training im Rahmen des Hundesportvereins.'},
                {'icon': 'bowl', 'titel': 'Futtermittelberatung', 'text': 'Individuell und kostenfrei.'},
                {'icon': 'target-arrow', 'titel': 'Ausbildung', 'text': 'Im sozialen, alltäglichen Umgang und im IGP-Sport (Fährte, Unterordnung, Schutzdienst).'},
            ]},
            {'_template': 'galerie', 'ueberschrift': 'Zwingeranlage, Übungsplatz & Welpenzimmer', 'bilder': [
                {'bild': '/uploads/seiten/photo_2023-06-06_08-16-00.jpg', 'beschreibung': 'Zwingeranlage und Übungsplatz'},
                {'bild': '/uploads/seiten/20221217_113107.jpg', 'beschreibung': 'Wurfraum / Welpenzimmer'},
            ]},
        ],
    },
    'hunde': {
        'titel': 'Unsere Hunde', 'beschreibung': 'Unsere Rottweiler und weiteren Rudelmitglieder.',
        'blocks': [
            {'_template': 'hero', 'variante': 'schmal', 'kicker': 'Das Rudel', 'titel': 'Unsere Hunde',
             'untertitel': 'Alle unsere Hunde sind in erster Linie Familienmitglieder und in zweiter Linie unsere Sportpartner.'},
            {'_template': 'hunde', 'kategorie': 'alle'},
        ],
    },
    'wuerfe': {
        'titel': 'Würfe & Welpen', 'beschreibung': 'Unsere Würfe und Wurfplanungen.',
        'blocks': [
            {'_template': 'hero', 'variante': 'schmal', 'kicker': 'Welpen', 'titel': 'Würfe & Wurfplanung'},
            {'_template': 'wuerfe'},
            {'_template': 'text', 'ueberschrift': 'Interesse an einem Welpen?', 'hervorheben': True,
             'inhalt': 'Bei Interesse an einem Welpen aus unserer Zucht dürft ihr euch gern melden – wir geben Auskunft über künftige Wurfplanungen.\n\nÜber eine ausführliche Nachricht zu euch und den Haltungsbedingungen, verbunden mit euren Vorstellungen und Erwartungen an uns und den Welpen, freuen wir uns.\n\n[Zur Kontaktseite →](/kontakt)'},
        ],
    },
    'aktuelles': {
        'titel': 'Aktuelles', 'beschreibung': 'Neuigkeiten, Erfolge und Tipps rund um unsere Rottweiler.',
        'blocks': [
            {'_template': 'hero', 'variante': 'schmal', 'kicker': 'Neuigkeiten & Tipps', 'titel': 'Aktuelles'},
            {'_template': 'news'},
        ],
    },
    'galerie': {
        'titel': 'Galerie', 'beschreibung': 'Impressionen unserer Hunde.',
        'blocks': [
            {'_template': 'hero', 'variante': 'schmal', 'kicker': 'Impressionen', 'titel': 'Galerie'},
            {'_template': 'galerie', 'bilder': gal('gallery/index.html', 36)},
        ],
    },
    'kontakt': {
        'titel': 'Kontakt', 'beschreibung': 'So erreicht ihr die Rottweiler vom Luchberg.',
        'blocks': [
            {'_template': 'hero', 'variante': 'schmal', 'kicker': 'Kontakt', 'titel': 'Schreibt uns!'},
            {'_template': 'kontakt', 'formular': True,
             'text': 'Ihr habt Fragen zu unserer Zucht, zu unseren Hunden oder zu kommenden Würfen? Ruft gern an, schreibt eine E-Mail oder nutzt das Formular.'},
        ],
    },
    'impressum': {
        'titel': 'Impressum', 'beschreibung': 'Impressum',
        'blocks': [
            {'_template': 'hero', 'variante': 'schmal', 'titel': 'Impressum'},
            {'_template': 'text', 'inhalt': '**Angaben gemäß § 5 DDG**\n\nKarolin Riesing  \nADRK Rottweilerzwinger vom Luchberg  \nDorfstr. 2d  \n01768 Glashütte OT Luchau\n\n**Kontakt**\n\nTelefon: 0173 3665494  \nE-Mail: luchberg.rottweiler@gmail.com\n\n**Verantwortlich für den Inhalt**\n\nKarolin Riesing, Anschrift wie oben\n\n_Hinweis: Bitte vor dem Livegang prüfen bzw. mit einem Impressum-Generator abgleichen._'},
        ],
    },
    'datenschutz': {
        'titel': 'Datenschutzerklärung', 'beschreibung': 'Datenschutzerklärung',
        'blocks': [
            {'_template': 'hero', 'variante': 'schmal', 'titel': 'Datenschutzerklärung'},
            {'_template': 'text', 'inhalt': '**Platzhalter** – die Datenschutzerklärung wird vor dem Livegang ergänzt (z. B. über einen Datenschutz-Generator). Relevant sind: Hosting (Cloudflare Pages), Kontaktformular, eingebundene Links zu Facebook/Instagram. Die Website verwendet keine Cookies, kein Tracking und lädt keine Schriftarten von Google.'},
        ],
    },
}
for slug, s in seiten.items():
    write_md(os.path.join(C, 'seiten', slug + '.md'), s)

print('ok')
