import { Box, Point, Vector } from '@flatten-js/core';
import { randomChoice, weightedRandomChoice } from '../random';

export { DelaunayTriangulation } from './delaunay';

export interface Graph {
  getNeighbors(index: Point): Point[];
}

export const randomTraverse = (
  graph: Graph,
  start: Point,
  bounds: Box,
  options: { maxLength: number }
): Point[] => {
  const { maxLength } = options;

  const path: Point[] = [];
  const visitedPoints = new Set<Point>();

  let currentPoint: Point | null = start;
  let previousPoint: Point | null = null;

  while (currentPoint !== null && !visitedPoints.has(currentPoint) && path.length < maxLength) {
    path.push(currentPoint);
    visitedPoints.add(currentPoint);

    const neighbors = graph.getNeighbors(currentPoint);
    const unvisitedNeighbors = neighbors.filter((neighbor) => !visitedPoints.has(neighbor));

    if (unvisitedNeighbors.length === 0) {
      break;
    }

    let nextPoint = null;

    if (path.length < 2 || previousPoint === null) {
      nextPoint = randomChoice(unvisitedNeighbors);
    } else {
      nextPoint = _chooseNextPointByDirection(currentPoint, previousPoint, unvisitedNeighbors);
    }

    if (nextPoint !== null && _isOutOfBounds(nextPoint, bounds)) {
      nextPoint = null;
    }

    previousPoint = currentPoint;
    currentPoint = nextPoint;
  }
  return path;
};

const _isOutOfBounds = (point: Point, bounds: Box): boolean => {
  return (
    point.x <= bounds.xmin ||
    point.x >= bounds.xmax ||
    point.y <= bounds.ymin ||
    point.y >= bounds.ymax
  );
};

const _chooseNextPointByDirection = (
  currentPoint: Point,
  previousPoint: Point,
  validNeighbors: Point[]
): Point | null => {
  const currentDirection = new Vector(
    currentPoint.x - previousPoint.x,
    currentPoint.y - previousPoint.y
  ).normalize();

  const neighborWeights: number[] = [];
  const weightedNeighbors: Point[] = [];

  for (const neighbor of validNeighbors) {
    const neighborDirection = new Vector(
      neighbor.x - currentPoint.x,
      neighbor.y - currentPoint.y
    ).normalize();
    const alignment = currentDirection.dot(neighborDirection);
    const weight = Math.pow(alignment + 1, 2);
    const finalWeight = Math.max(weight, 0.01);

    weightedNeighbors.push(neighbor);
    neighborWeights.push(finalWeight);
  }

  return weightedRandomChoice(weightedNeighbors, neighborWeights) ?? null;
};
