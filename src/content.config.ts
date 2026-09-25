/**
 * Inhalte kommen über TinaCMS (src/lib/data.ts), nicht über Astros Content Layer.
 * Die Deklaration hier verhindert nur, dass Astro die Ordner als eigene Collections auto-generiert.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const config = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/config' }),
});

export const collections = { config };
