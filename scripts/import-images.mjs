#!/usr/bin/env node
// Import original photos into public/uploads: apply EXIF orientation, optional
// extra rotation and crop, resize to max. 1600 px, strip all metadata (incl. GPS).
//
// Usage: node scripts/import-images.mjs <manifest.json>
//
// Manifest: an array of jobs. Paths in "src" are relative to the manifest file,
// "out" is relative to public/uploads. "crop" uses fractions of the (rotated) image.
// [
//   { "src": "Aaron 3.jpg", "out": "hunde/aaron/aaron-stand.jpg", "rotate": 90 },
//   { "src": "SMP_5493.jpg", "out": "rudel/dackel/dackel.jpg", "crop": { "x": 0.25, "y": 0, "w": 0.53, "h": 1 } }
// ]
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const MAX_SIZE = 1600;
const UPLOADS = path.resolve(import.meta.dirname, '../public/uploads');

const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error('Usage: node scripts/import-images.mjs <manifest.json>');
  process.exit(1);
}

const jobs = JSON.parse(await readFile(manifestPath, 'utf8'));
const baseDir = path.dirname(path.resolve(manifestPath));

for (const job of jobs) {
  const src = path.resolve(baseDir, job.src);
  const out = path.join(UPLOADS, job.out);

  // Orient (and rotate) first, so crop fractions refer to the upright image.
  let image = sharp(src).autoOrient();
  if (job.rotate) image = image.rotate(job.rotate);
  const { data, info } = await image.toBuffer({ resolveWithObject: true });

  let pipeline = sharp(data);
  if (job.crop) {
    const { x = 0, y = 0, w = 1, h = 1 } = job.crop;
    pipeline = pipeline.extract({
      left: Math.round(x * info.width),
      top: Math.round(y * info.height),
      width: Math.round(w * info.width),
      height: Math.round(h * info.height),
    });
  }

  await mkdir(path.dirname(out), { recursive: true });
  const result = await pipeline
    .resize(MAX_SIZE, MAX_SIZE, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);

  console.log(`${job.out}  ${result.width}×${result.height}  ${Math.round(result.size / 1024)} KB`);
}
