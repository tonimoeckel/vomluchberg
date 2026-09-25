/** Date display in German, always in Europe/Berlin (content stores ISO strings). */

const format = (d: string | null | undefined, opts: Intl.DateTimeFormatOptions) =>
  d ? new Date(d).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin', ...opts }) : '';

/** e.g. 10.03.2024 */
export const formatDatum = (d?: string | null) =>
  format(d, { day: '2-digit', month: '2-digit', year: 'numeric' });

/** e.g. 10. März 2024 */
export const formatDatumLang = (d?: string | null) =>
  format(d, { day: 'numeric', month: 'long', year: 'numeric' });
