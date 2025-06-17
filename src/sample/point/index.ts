import { Box, Point } from '@flatten-js/core';

export interface PointSampler {
  sample(box: Box): Point[];
}

export { PoissonDiskPointSampler } from './poissonDisk';
export { RandomPointSampler } from './random';
