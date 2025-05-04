import { Point } from '@flatten-js/core';
import p5 from 'p5';

export const drawPencil = (p: p5, points: Point[], options: { width: number; density: number }) => {
  const { width, density } = options;

  if (points.length < 2) {
    return; // Need at least two points to form a line
  }

  // Consider setting p.stroke() and p.strokeWeight() before calling this function
  // for desired point color and size.

  for (let i = 0; i < points.length - 1; i++) {
    const startPt = p.createVector(points[i].x, points[i].y);
    const endPt = p.createVector(points[i + 1].x, points[i + 1].y);

    const segmentVec = p5.Vector.sub(endPt, startPt);
    const len = segmentVec.mag();

    if (len === 0) continue; // Skip zero-length segments

    const numDots = Math.ceil(len * density);
    const dir = segmentVec.copy().normalize();
    // Perpendicular vector
    const perp = p.createVector(-dir.y, dir.x);

    for (let j = 0; j < numDots; j++) {
      // Random distance along the current segment
      const distAlong = p.random(len);
      // Point on the segment line
      const onSegment = p5.Vector.add(startPt, dir.copy().mult(distAlong));

      // Gaussian offset perpendicular to the segment
      // Use strokeWidth / 2 as standard deviation for a nice spread
      const offsetMag = p.randomGaussian(0, width / 2);
      const offsetVec = perp.copy().mult(offsetMag);

      // Calculate final dot position
      const dotPos = p5.Vector.add(onSegment, offsetVec);

      // Draw the individual point
      p.point(dotPos.x, dotPos.y);
    }
  }
};
