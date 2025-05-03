import { Point, Vector } from '@flatten-js/core';
import * as d3 from 'd3';

export class DelaunayTriangulation {
  private points: Point[];
  delaunay: d3.Delaunay<Float64Array>;

  constructor(points: Point[]) {
    this.points = points;
    this.delaunay = d3.Delaunay.from(points.map((p) => [p.x, p.y]));
  }

  randomTraverse = (point: Point, maxLength: number = 100): Point[] => {
    const path: Point[] = [];
    const visitedPointIndices = new Set<number>();

    const startIndex = this.points.findIndex((p) => p === point);

    let currentPointIndex = startIndex;
    let previousPointIndex = -1;

    while (
      currentPointIndex !== -1 &&
      !visitedPointIndices.has(currentPointIndex) &&
      path.length < maxLength
    ) {
      // Add current point to path and mark as visited
      path.push(this.points[currentPointIndex]);
      visitedPointIndices.add(currentPointIndex);

      const neighbors = this.delaunay.neighbors(currentPointIndex);
      const validNeighbors = [...neighbors].filter((idx) => !visitedPointIndices.has(idx));

      if (validNeighbors.length === 0) {
        // No unvisited neighbors, path ends
        previousPointIndex = currentPointIndex;
        currentPointIndex = -1; // Mark end
        break;
      }

      let nextPointIndex = -1;

      if (path.length < 2) {
        // Not enough points for direction, pick random valid neighbor
        nextPointIndex = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
      } else {
        const currentPt = this.points[currentPointIndex];
        const prevPt = this.points[previousPointIndex];
        // Vector from prev to current
        const directionVec = new Vector(currentPt.x - prevPt.x, currentPt.y - prevPt.y);

        let bestNeighborIndex = -1;
        let maxDotProduct = -Infinity;

        for (const neighborIndex of validNeighbors) {
          const neighborPt = this.points[neighborIndex];
          // Vector from current to neighbor
          const toNeighborVec = new Vector(neighborPt.x - currentPt.x, neighborPt.y - currentPt.y);

          // Normalize vectors
          const dirNorm = directionVec.normalize();
          const toNeighborNorm = toNeighborVec.normalize();

          // Handle zero vectors
          if (dirNorm.length === 0 || toNeighborNorm.length === 0) {
            continue;
          }

          const dotProduct = dirNorm.dot(toNeighborNorm); // Use vector dot method

          if (dotProduct > maxDotProduct) {
            maxDotProduct = dotProduct;
            bestNeighborIndex = neighborIndex;
          }
        }
        nextPointIndex = bestNeighborIndex;
      }

      // Update indices for the next iteration
      previousPointIndex = currentPointIndex;
      currentPointIndex = nextPointIndex; // Will be -1 if no valid neighbor was chosen
    }
    return path;
  };
}
