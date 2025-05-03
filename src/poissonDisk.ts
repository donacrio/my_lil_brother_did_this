import { Point } from '@flatten-js/core';
import PoissonDiskSampling from 'poisson-disk-sampling';

export const samplePoissonDisk = ({
  width,
  height,
  minDistanceBetweenPoints,
  maxDistanceBetweenPoints,
  numberOfTries,
}: {
  width: number;
  height: number;
  minDistanceBetweenPoints: number;
  maxDistanceBetweenPoints: number;
  numberOfTries: number;
}): Point[] => {
  const sampler = new PoissonDiskSampling({
    shape: [width, height],
    minDistance: minDistanceBetweenPoints,
    maxDistance: maxDistanceBetweenPoints,
    tries: numberOfTries,
  });

  const points = sampler.fill();
  return points.map((p) => new Point(p[0], p[1]));
};
