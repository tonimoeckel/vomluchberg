import { describe, expect, it } from 'vitest';
import { tinaBuildArgs } from './tina-build-args.mjs';

const PRODUCTION = ['build', '--content=local', '-c', 'astro build'];
const PREVIEW = ['build', '--local', '--skip-cloud-checks', '-c', 'astro build'];

describe('tinaBuildArgs', () => {
  it('builds against TinaCloud outside Workers Builds (manual npm run build)', () => {
    expect(tinaBuildArgs({})).toMatchObject({ preview: false, args: PRODUCTION });
    expect(tinaBuildArgs({ WORKERS_CI_BRANCH: ' ' })).toMatchObject({ preview: false, args: PRODUCTION });
  });

  it('builds main against TinaCloud', () => {
    expect(tinaBuildArgs({ WORKERS_CI_BRANCH: 'main' })).toMatchObject({ preview: false, args: PRODUCTION });
  });

  it('builds other branches locally, without TinaCloud checks', () => {
    const result = tinaBuildArgs({ WORKERS_CI_BRANCH: 'claude/great-gauss-wnsstp' });
    expect(result).toMatchObject({ preview: true, args: PREVIEW });
    expect(result.reason).toContain('claude/great-gauss-wnsstp');
  });
});
