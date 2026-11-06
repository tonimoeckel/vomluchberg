import type { SiteDefinition } from '../types';

/** Rottweiler vom Luchberg – vomluchberg.de (the original site). */
export const luchberg = {
  id: 'luchberg',
  name: 'Rottweiler vom Luchberg',
  adminLabel: 'Rottweiler',
  // Legacy names without site prefix: renaming would change document ids and GraphQL types.
  collections: ['page', 'hund', 'wurf', 'news', 'config'],
  // Old URLs of the previous website → new pages (for Google & old links)
  redirects: {
    '/home': '/',
    '/zuchtstaette': '/zucht',
    '/about-me': '/zucht',
    '/about-me/leistungen': '/zucht',
    '/contacts': '/kontakt',
    '/contacts/index.php': '/kontakt',
    '/gallery': '/galerie',
    '/links': '/',
    '/page/2': '/aktuelles',
    '/page/3': '/aktuelles',
    '/welpen': '/wuerfe',
    '/welpen/wurf': '/wuerfe/a-wurf',
    '/welpen/b-w': '/wuerfe/b-wurf',
    '/rottweilerhuendinnen': '/hunde',
    '/rottweilerrueden': '/hunde',
    '/weitere-rudelmitglieder': '/hunde',
    '/weitere-rudelmitglieder/rauhaardackel': '/hunde/rauhaardackel',
    '/rottweilerhuendinnen/baja-vom-luchberg': '/hunde/baja-vom-luchberg',
    '/rottweilerhuendinnen/donna-von-der-staubzer-hoehe': '/hunde/donna-von-der-staubzer-hoehe',
    '/rottweilerrueden/aaron-vom-luchberg': '/hunde/aaron-vom-luchberg',
    '/rottweilerrueden/hunter-vom-auersberg': '/hunde/hunter-vom-auersberg',
    '/harley-vom-auersberg': '/hunde/harley-vom-auersberg',
    '/aktuelles/sitz-platzund-steh-aber-wie-geht-das': '/aktuelles/sitz-platz-und-steh-teil-2-platz',
  },
} as const satisfies SiteDefinition;
