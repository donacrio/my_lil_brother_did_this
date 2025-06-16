import { Point, Vector } from '@flatten-js/core';

// Helper to convert Point to Vector
const pointToVector = (p: Point): Vector => new Vector(p.x, p.y);

// Helper to convert Vector to Point
const vectorToPoint = (v: Vector): Point => new Point(v.x, v.y);

/**
 * Calculates a point on a Catmull-Rom spline segment.
 * The segment is defined between p1 and p2, using p0 and p3 as control points.
 * @param p0 Control point before the segment start
 * @param p1 Start point of the segment
 * @param p2 End point of the segment
 * @param p3 Control point after the segment end
 * @param t Parameter value (0 to 1)
 * @returns The interpolated Vector
 */
const catmullRomInterpolate = (
  p0: Vector,
  p1: Vector,
  p2: Vector,
  p3: Vector,
  t: number
): Vector => {
  const t2 = t * t;
  const t3 = t2 * t;

  // Formula coefficients derived from the Catmull-Rom matrix (tension=0)
  const v0 = p1.multiply(2);
  const v1 = p2.subtract(p0).multiply(t);
  const v2 = p0.multiply(2).subtract(p1.multiply(5)).add(p2.multiply(4)).subtract(p3).multiply(t2);
  const v3 = p0.invert().add(p1.multiply(3)).subtract(p2.multiply(3)).add(p3).multiply(t3);

  // The final point is the sum of these weighted vectors, scaled by 0.5
  return v0.add(v1).add(v2).add(v3).multiply(0.5);
};

/**
 * Smooths an open path defined by an array of points using Catmull-Rom splines.
 *
 * @param points The array of Point objects defining the path.
 * @param numPointsPerSegment The number of points to generate for each segment of the spline. Higher values result in a smoother curve. Defaults to 10.
 * @returns A new array of Point objects representing the smoothed path.
 */
export const smoothPathCatmullRom = (
  points: Point[],
  numPointsPerSegment: number = 10
): Point[] => {
  if (points.length < 2) {
    return [...points]; // Return original points if not enough to form a segment
  }

  const resultPoints: Point[] = [];
  // Create a padded array to handle boundary conditions by duplicating endpoints
  const inputPoints = [points[0], ...points, points[points.length - 1]];

  // Add the very first point of the original path
  resultPoints.push(points[0]);

  // Iterate through the segments of the original path
  for (let i = 0; i < points.length - 1; i++) {
    // Define the four points for the Catmull-Rom calculation for the segment between points[i] and points[i+1]
    // Indices reference the padded inputPoints array
    const p0 = pointToVector(inputPoints[i]); // Control point before start (points[i-1] or points[0])
    const p1 = pointToVector(inputPoints[i + 1]); // Start point of segment (points[i])
    const p2 = pointToVector(inputPoints[i + 2]); // End point of segment (points[i+1])
    const p3 = pointToVector(inputPoints[i + 3]); // Control point after end (points[i+2] or points[n-1])

    // Generate intermediate points for the current segment
    // Start j=1 because t=0 corresponds to p1 (points[i]), which is added either
    // as the first point overall or as the end point (t=1) of the previous segment.
    for (let j = 1; j <= numPointsPerSegment; j++) {
      const t = j / numPointsPerSegment;
      const interpolatedVector = catmullRomInterpolate(p0, p1, p2, p3, t);
      resultPoints.push(vectorToPoint(interpolatedVector));
    }
  }

  return resultPoints;
};

/**
 * Smooths a closed path defined by an array of points using Catmull-Rom splines.
 * Treats the path as looping, connecting the last point back to the first smoothly.
 *
 * @param points The array of Point objects defining the closed path. Should not include a duplicate of the start point at the end.
 * @param numPointsPerSegment The number of points to generate for each segment of the spline. Higher values result in a smoother curve. Defaults to 10.
 * @returns A new array of Point objects representing the smoothed closed path.
 */
export const smoothClosedPathCatmullRom = (
  points: Point[],
  numPointsPerSegment: number = 10
): Point[] => {
  const n = points.length;
  if (n < 3) {
    // Cannot form a closed loop spline with less than 3 points.
    // Returning the original points, consider logging a warning or throwing an error.
    console.warn('smoothClosedPathCatmullRom requires at least 3 points.');
    return [...points];
  }

  const resultPoints: Point[] = [];

  // Iterate through each point in the original path, treating it as the start of a segment (p1)
  for (let i = 0; i < n; i++) {
    // Use modulo arithmetic to wrap around the indices for a closed loop
    const p0_idx = (i - 1 + n) % n; // Point before the start
    const p1_idx = i; // Start point of the segment
    const p2_idx = (i + 1) % n; // End point of the segment
    const p3_idx = (i + 2) % n; // Point after the end

    // Get the actual points as vectors
    const p0 = pointToVector(points[p0_idx]);
    const p1 = pointToVector(points[p1_idx]);
    const p2 = pointToVector(points[p2_idx]);
    const p3 = pointToVector(points[p3_idx]);

    // Add the starting point (p1) only for the very first segment (i=0)
    // Subsequent segment starts are implicitly added as the end point (t=1) of the previous segment.
    if (i === 0) {
      resultPoints.push(vectorToPoint(p1));
    }

    // Generate intermediate points for the current segment (from p1 to p2)
    // Start j=1 because t=0 corresponds to p1.
    for (let j = 1; j <= numPointsPerSegment; j++) {
      const t = j / numPointsPerSegment;
      const interpolatedVector = catmullRomInterpolate(p0, p1, p2, p3, t);
      resultPoints.push(vectorToPoint(interpolatedVector));
    }
  }

  // The last point generated (t=1 for the last segment) should be identical to the first point (p1 of the first segment).
  // Remove this duplicate point to avoid closing the loop with a repeated point.
  if (resultPoints.length > 1 && resultPoints[0].equalTo(resultPoints[resultPoints.length - 1])) {
    resultPoints.pop();
  }

  return resultPoints;
};
