import { Point } from '@flatten-js/core';
import p5 from 'p5';

const drawPencilSegment = (
  p5Instance: p5,
  startPoint: p5.Vector,
  endPoint: p5.Vector,
  width: number,
  density: number
) => {
  const segment = p5.Vector.sub(endPoint, startPoint);
  const segmentLen = segment.mag();

  if (segmentLen === 0) return; // Skip zero-length segments

  const numberOfDots = Math.ceil(segmentLen * density);
  const direction = segment.copy().normalize();
  const perpendicular = p5Instance.createVector(-direction.y, direction.x);

  for (let j = 0; j < numberOfDots; j++) {
    const distanceAlongSegment = p5Instance.random(segmentLen);
    const pointOnSegment = p5.Vector.add(startPoint, direction.copy().mult(distanceAlongSegment));
    const offsetMagnitude = p5Instance.randomGaussian(0, width / 2);
    const offset = perpendicular.copy().mult(offsetMagnitude);

    // Calculate final dot position
    const dotPosition = p5.Vector.add(pointOnSegment, offset);

    p5Instance.point(dotPosition.x, dotPosition.y);
  }
};

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
    drawPencilSegment(p5Instance, current, next, width, density);
  }
};
