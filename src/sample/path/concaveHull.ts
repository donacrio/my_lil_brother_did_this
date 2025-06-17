import concaveman from 'concaveman';
import { Box, Point } from '@flatten-js/core';
import type { PathSampler } from '.';
import type { PointSampler } from '../point';

type ConcaveHullPathSamplerOptions = {
  concavity: number;
  lengthThreshold: number;
};

export class ConcaveHullPathSampler implements PathSampler {
  constructor(
    private pointSampler: PointSampler,
    private options: ConcaveHullPathSamplerOptions
  ) {}

  public sample(box: Box): Point[] {
    const { concavity, lengthThreshold } = this.options;

    const points = this.pointSampler.sample(box);
    const hull = concaveman(
      points.map((p) => [p.x, p.y]),
      concavity,
      lengthThreshold
    );
    return hull.map((p) => new Point(p[0], p[1]));
  }
}
