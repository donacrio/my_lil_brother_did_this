import { Point, Polygon, Vector } from '@flatten-js/core';

export const closePath = (points: Point[]): Point[] => {
  if (points.length < 2) {
    throw new Error('closePath requires at least 2 points.');
  }
  if (points[0] === points[points.length - 1]) {
    return points;
  }

  return [...points, points[0]!];
};

export const toPolygon = (points: Point[]): Polygon => {
  return new Polygon(points);
};

/**
 * Smooths an open path defined by an array of points using Catmull-Rom splines.
 *
 * @param points The array of Point objects defining the path.
 * @param pointsPerSegment The number of points to generate for each segment of the spline. Higher values result in a smoother curve. Defaults to 10.
 * @returns A new array of Point objects representing the smoothed path.
 */
export const smoothenOpenPathCatmullRom = (
  points: Point[],
  pointsPerSegment: number = 10
): Point[] => {
  if (points.length < 2) {
    throw new Error('smoothOpenPathCatmullRom requires at least 2 points.');
  }

  const resultPoints: Point[] = [];
  const paddedPoints = [points[0], ...points, points[points.length - 1]];

  resultPoints.push(points[0]!);

  // Iterate through the segments of the original path
  for (let i = 0; i < points.length - 1; i++) {
    // Define the four points for the Catmull-Rom calculation for the segment between points[i] and points[i+1]
    // Indices reference the padded inputPoints array
    const p0 = _pointToVector(paddedPoints[i]!); // Control point before start (points[i-1] or points[0])
    const p1 = _pointToVector(paddedPoints[i + 1]!); // Start point of segment (points[i])
    const p2 = _pointToVector(paddedPoints[i + 2]!); // End point of segment (points[i+1])
    const p3 = _pointToVector(paddedPoints[i + 3]!); // Control point after end (points[i+2] or points[n-1])

    // Start j=1 because t=0 corresponds to p1 (points[i]), which is added either
    // as the first point overall or as the end point (t=1) of the previous segment.
    for (let j = 1; j <= pointsPerSegment; j++) {
      const t = j / pointsPerSegment;
      const interpolatedVector = _catmullRomInterpolate(p0, p1, p2, p3, t);
      resultPoints.push(_vectorToPoint(interpolatedVector));
    }
  }

  return resultPoints;
};

/**
 * Smooths a closed path defined by an array of points using Catmull-Rom splines.
 * Treats the path as looping, connecting the last point back to the first smoothly.
 *
 * @param points The array of Point objects defining the closed path. Should not include a duplicate of the start point at the end.
 * @param pointsPerSegment The number of points to generate for each segment of the spline. Higher values result in a smoother curve. Defaults to 10.
 * @returns A new array of Point objects representing the smoothed closed path.
 */
export const smoothenClosedPathCatmullRom = (
  points: Point[],
  pointsPerSegment: number = 10
): Point[] => {
  if (points.length < 3) {
    throw new Error('smoothClosedPathCatmullRom requires at least 3 points.');
  }

  // Create an extended path that handles the wraparound for closed path smoothing
  // For a closed path [A, B, C, D], we create [D, A, B, C, D, A]
  // This provides proper control points for all segments including the wraparound
  const extendedPath = [points[points.length - 1]!, ...points, points[0]!];

  const smoothedExtended = smoothenOpenPathCatmullRom(extendedPath, pointsPerSegment);

  // Extract the relevant portion: skip the first segment (which was just for control)
  // and remove the last point (which would be a duplicate of the first)
  const startIndex = pointsPerSegment + 1; // Skip first point + first segment
  const endIndex = smoothedExtended.length - pointsPerSegment; // Remove last segment

  return smoothedExtended.slice(startIndex, endIndex);
};

/**
 * Calculates a point on a Catmull-Rom spline segment using the standard formula.
 * The segment is defined between p1 and p2, using p0 and p3 as control points.
 */
const _catmullRomInterpolate = (
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

const _pointToVector = (p: Point): Vector => new Vector(p.x, p.y);
const _vectorToPoint = (v: Vector): Point => new Point(v.x, v.y);
