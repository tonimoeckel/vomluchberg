// Arguments for `tinacms build` in `npm run build` (pure, tested in tina-build-args.test.mjs).
//
// Production (a Workers Builds build of `main`, or a manual `npm run build`) builds against
// TinaCloud. A Workers Builds build of any other branch is a preview: TinaCloud only knows
// the branches it indexes, so its cloud checks fail for feature branches. Previews therefore
// build like `npm run build:local` (content from the checkout, no TinaCloud). Their /admin
// runs in local mode, which is fine for reviewing layout and content (docs/plan/03-betrieb.md O4).

/** Branch Workers Builds deploys to production (same rule as noindexFromEnv in src/multisite/robots.ts). */
export const PRODUCTION_BRANCH = 'main';

const ASTRO = ['-c', 'astro build'];

/**
 * @param {{ WORKERS_CI_BRANCH?: string }} env
 * @returns {{ preview: boolean, args: string[], reason: string }}
 */
export function tinaBuildArgs(env) {
  const branch = (env.WORKERS_CI_BRANCH ?? '').trim();
  if (branch && branch !== PRODUCTION_BRANCH) {
    return {
      preview: true,
      args: ['build', '--local', '--skip-cloud-checks', ...ASTRO],
      reason: `preview build of branch "${branch}": local content, no TinaCloud checks`,
    };
  }
  return {
    preview: false,
    args: ['build', '--content=local', ...ASTRO],
    reason: branch ? `production build of "${branch}" against TinaCloud` : 'production build against TinaCloud',
  };
}
