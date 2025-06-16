import { Point } from '@flatten-js/core';
import PoissonDiskSampling from 'poisson-disk-sampling';

export interface PointSampler<O> {
  (width: number, height: number, options: O): Point[];
}

type PoissonDiskOptions = {
  minDistanceBetweenPoints: number;
  maxDistanceBetweenPoints: number;
  numberOfTries: number;
};

export const poissonDiskSampler: PointSampler<PoissonDiskOptions> = (width, height, options) => {
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

type RandomPointsOptions = {
  numberOfPoints: number;
};

export const randomPoints: PointSampler<RandomPointsOptions> = (width, height, options) => {
  const { numberOfPoints } = options;
  return Array.from(
    { length: numberOfPoints },
    () => new Point(Math.random() * width, Math.random() * height)
  );
};
