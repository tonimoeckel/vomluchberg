/** Section background of the "hintergrund" option (hell | sand | dunkel). */
export const hintergrundKlasse = (hintergrund?: string | null) =>
  hintergrund === 'dunkel' ? 'bg-dark text-on-dark' : hintergrund === 'sand' ? 'bg-surface' : '';
