import { Box, Point } from '@flatten-js/core';
import { randomTraverse } from '../../utils/graph';
import { DelaunayTriangulation } from '../../utils/graph/delaunay';
import type { PathSampler } from '.';
import type { PointSampler } from '../point';

type DelaunayPathSamplerOptions = {
  maxLength: number;
};

export class DelaunayPathSampler implements PathSampler {
  constructor(
    private pointSampler: PointSampler,
    private options: DelaunayPathSamplerOptions
  ) {}

  public sample(box: Box): Point[] {
    const { maxLength } = this.options;

    const points = this.pointSampler.sample(box);
    const delaunay = new DelaunayTriangulation(points);

    const startPoint = this._getRandomPointWithinBox(points, box);
    const path = randomTraverse(delaunay, startPoint, box, { maxLength });
    return path;
  }

  private _getRandomPointWithinBox(points: Point[], box: Box): Point {
    const availablePoints = [...points];
    while (availablePoints.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePoints.length);
      const point = availablePoints[randomIndex]!;
      availablePoints.splice(randomIndex, 1);

      if (box.contains(point)) {
        return point;
      }
    }
    throw new Error('No points found within box');
  }
}
