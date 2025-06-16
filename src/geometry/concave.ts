import { Point, Polygon } from '@flatten-js/core';
import concaveman from 'concaveman';

export const concaveHull = (
  points: Point[],
  concavity: number,
  lengthThreshold: number
): Polygon => {
  const hull = concaveman(
    points.map((p) => [p.x, p.y]),
    concavity,
    lengthThreshold
  );
  return new Polygon(hull.map((p) => new Point(p[0], p[1])));
};
