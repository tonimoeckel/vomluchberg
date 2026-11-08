#!/usr/bin/env node
// `npm run build`: runs `tinacms build … -c "astro build"` with the arguments from
// tina-build-args.mjs (production against TinaCloud, previews of other branches locally).
import { spawnSync } from 'node:child_process';
import { tinaBuildArgs } from './tina-build-args.mjs';

const { args, reason } = tinaBuildArgs(process.env);
console.log(`[build] ${reason}\n[build] tinacms ${args.join(' ')}`);

// npm puts node_modules/.bin on PATH, so `tinacms` resolves to the project's CLI.
const result = spawnSync('tinacms', args, { stdio: 'inherit' });
if (result.error) {
  console.error(`[build] could not start tinacms: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
