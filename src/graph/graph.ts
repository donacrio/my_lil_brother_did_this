import { Point, Vector } from '@flatten-js/core';
import { randomChoice, weightedRandomChoice } from '../utils';

export interface Graph {
  getNeighbors(index: Point): Point[];
}

const isWithinBounds = (
  point: Point,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number }
): boolean => {
  return (
    point.x <= bounds.xMin ||
    point.x >= bounds.xMax ||
    point.y <= bounds.yMin ||
    point.y >= bounds.yMax
  );
};

const chooseNextPointProbabilistically = (
  currentPoint: Point,
  previousPoint: Point,
  validNeighbors: Point[]
): Point | null => {
  const directionVec = new Vector(
    currentPoint.x - previousPoint.x,
    currentPoint.y - previousPoint.y
  ).normalize();

  const neighborWeights: number[] = [];
  const weightedNeighbors: Point[] = [];

  for (const neighbor of validNeighbors) {
    const toNeighborVec = new Vector(
      neighbor.x - currentPoint.x,
      neighbor.y - currentPoint.y
    ).normalize();
    const dotProduct = directionVec.dot(toNeighborVec);
    const weight = Math.pow(dotProduct + 1, 2);
    const finalWeight = Math.max(weight, 0.01);

    weightedNeighbors.push(neighbor);
    neighborWeights.push(finalWeight);
  }

  return weightedRandomChoice(weightedNeighbors, neighborWeights) ?? null;
};

export const randomTraverse = (
  graph: Graph,
  start: Point,
  bounds: { xMin: number; xMax: number; yMin: number; yMax: number },
  options: {
    maxLength: number;
  }
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
    const validNeighbors = neighbors.filter((neighbor) => !visitedPoints.has(neighbor));

    if (validNeighbors.length === 0) {
      break;
    }

    let nextPoint = null;

    if (path.length < 2 || previousPoint === null) {
      nextPoint = randomChoice(validNeighbors);
    } else {
      nextPoint = chooseNextPointProbabilistically(currentPoint, previousPoint, validNeighbors);
    }

    if (nextPoint !== null && isWithinBounds(nextPoint, bounds)) {
      nextPoint = null;
    }

    previousPoint = currentPoint;
    currentPoint = nextPoint;
  }
  return path;
};
