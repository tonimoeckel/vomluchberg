import { ctaBlock, heroBlock, textBlock } from '../../blocks';
import { seitenCollection } from '../collections';

/** Starter block set of the training site (skeleton, slice 2 adds its own blocks). */
export const TrainingPageCollection = seitenCollection('training', [heroBlock, textBlock, ctaBlock]);
