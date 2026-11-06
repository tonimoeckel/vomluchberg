/**
 * Tina prefixes block typenames with the collection name (`PageBlocksHero`, `DackelPageBlocksHero`).
 * blockName() strips that prefix, so a site's block dispatcher can reuse shared block templates
 * and components regardless of which page collection they belong to.
 */
export function blockName(typename: string): string {
  const i = typename.lastIndexOf('Blocks');
  return i >= 0 && i + 'Blocks'.length < typename.length ? typename.slice(i + 'Blocks'.length) : typename;
}
