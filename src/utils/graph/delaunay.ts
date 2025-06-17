import { Point } from '@flatten-js/core';
import * as d3 from 'd3';
import type { Graph } from '.';

export class DelaunayTriangulation implements Graph {
  public readonly points: Point[];
  private delaunay: d3.Delaunay<Float64Array>;

  constructor(points: Point[]) {
    this.points = points;
    this.delaunay = d3.Delaunay.from(points.map((p) => [p.x, p.y]));
  }

  public getNeighbors(point: Point): Point[] {
    const index = this.points.findIndex((p) => p === point);
    return Array.from(this.delaunay.neighbors(index)).map((i) => this.points[i]!);
  }
}
