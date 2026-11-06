import { ctaBlock, heroBlock, textBlock } from '../../blocks';
import { seitenCollection } from '../collections';

/** Starter block set of the dackel site (skeleton, slice 1 adds its own blocks). */
export const DackelPageCollection = seitenCollection('dackel', [heroBlock, textBlock, ctaBlock]);
