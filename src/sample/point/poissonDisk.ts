import { Box, Point } from '@flatten-js/core';
import PoissonDiskSampling from 'poisson-disk-sampling';
import type { PointSampler } from '.';

interface PoissonDiskPointSamplerOptions {
  minDistanceBetweenPoints: number;
  maxDistanceBetweenPoints: number;
  numberOfTries: number;
}

export class PoissonDiskPointSampler implements PointSampler {
  constructor(private options: PoissonDiskPointSamplerOptions) {}

  public sample(box: Box): Point[] {
    const { minDistanceBetweenPoints, maxDistanceBetweenPoints, numberOfTries } = this.options;

    const sampler = new PoissonDiskSampling({
      shape: [box.width, box.height],
      minDistance: minDistanceBetweenPoints,
      maxDistance: maxDistanceBetweenPoints,
      tries: numberOfTries,
    });

    const points = sampler.fill();
    return points.map((p) => new Point(p[0]! + box.xmin, p[1]! + box.ymin));
  }
}
