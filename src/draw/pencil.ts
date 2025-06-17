import { Point } from '@flatten-js/core';
import p5 from 'p5';

export const drawPencil = (
  p5Instance: p5,
  points: Point[],
  options: { width: number; density: number }
) => {
  const { width, density } = options;

  if (points.length < 2) {
    return; // Need at least two points to form a line
  }

  for (let i = 0; i < points.length - 1; i++) {
    const current = p5Instance.createVector(points[i].x, points[i].y);
    const next = p5Instance.createVector(points[i + 1].x, points[i + 1].y);
    _drawPencilSegment(p5Instance, current, next, width, density);
  }
};

const _drawPencilSegment = (
  p5Instance: p5,
  startPoint: p5.Vector,
  endPoint: p5.Vector,
  width: number,
  density: number
) => {
  const segment = p5.Vector.sub(endPoint, startPoint);
  const segmentLength = segment.mag();

  if (segmentLength === 0) return;

  const numberOfDots = Math.ceil(segmentLength * density);
  const direction = segment.copy().normalize();
  const perpendicular = p5Instance.createVector(-direction.y, direction.x);

  for (let j = 0; j < numberOfDots; j++) {
    const distanceAlongSegment = p5Instance.random(segmentLength);
    const pointOnSegment = p5.Vector.add(startPoint, direction.copy().mult(distanceAlongSegment));
    const offsetMagnitude = p5Instance.randomGaussian(0, width / 2);
    const offset = perpendicular.copy().mult(offsetMagnitude);

    const dotPosition = p5.Vector.add(pointOnSegment, offset);

    p5Instance.point(dotPosition.x, dotPosition.y);
  }
};
