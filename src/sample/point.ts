import { Point } from '@flatten-js/core';
import PoissonDiskSampling from 'poisson-disk-sampling';

export interface PointSampler<O> {
  (width: number, height: number, options: O): Point[];
}

export const poissonDiskSampler: PointSampler<{
  minDistanceBetweenPoints: number;
  maxDistanceBetweenPoints: number;
  numberOfTries: number;
}> = (width, height, options) => {
  const { minDistanceBetweenPoints, maxDistanceBetweenPoints, numberOfTries } = options;
  const sampler = new PoissonDiskSampling({
    shape: [width, height],
    minDistance: minDistanceBetweenPoints,
    maxDistance: maxDistanceBetweenPoints,
    tries: numberOfTries,
  });

  const points = sampler.fill();
  return points.map((p) => new Point(p[0], p[1]));
};
