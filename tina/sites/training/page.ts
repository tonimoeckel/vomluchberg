import { ctaBlock } from '../../blocks';
import { seitenCollection } from '../collections';
import {
  anfrageBlock,
  angeboteBlock,
  trainingGalerieBlock,
  trainingHeroBlock,
  trainingHighlightsBlock,
  trainingTextBlock,
  zeitstrahlBlock,
  quizBlock,
  zitatBlock,
} from './blocks';

/** Pages of the training site with its own block set (docs/plan/02-training.md §4.2). */
export const TrainingPageCollection = seitenCollection('training', [
  trainingHeroBlock,
  trainingTextBlock,
  trainingHighlightsBlock,
  angeboteBlock,
  zeitstrahlBlock,
  zitatBlock,
  trainingGalerieBlock,
  ctaBlock,
  anfrageBlock,
  quizBlock,
]);
