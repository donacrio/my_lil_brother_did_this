import { Box, Point } from '@flatten-js/core';
import type { PointSampler } from '.';

interface RandomPointSamplerOptions {
  numberOfPoints: number;
}

export class RandomPointSampler implements PointSampler {
  constructor(private options: RandomPointSamplerOptions) {}

  public sample(box: Box): Point[] {
    const { numberOfPoints } = this.options;

    return Array.from(
      { length: numberOfPoints },
      () =>
        new Point(
          box.xmin + Math.random() * (box.xmax - box.xmin),
          box.ymin + Math.random() * (box.ymax - box.ymin)
        )
    );
  }
}
