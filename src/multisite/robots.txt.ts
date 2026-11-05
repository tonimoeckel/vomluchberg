/** /robots.txt of every site (injected by the multisite integration unless a site has its own). */
import type { APIRoute } from 'astro';
import { noindex } from 'virtual:multisite';
import { robotsTxt } from './robots';

export const GET: APIRoute = ({ site }) =>
  new Response(robotsTxt({ site, noindex }), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
