import { Point, Polygon } from '@flatten-js/core';
import p5 from 'p5';
import { drawPencil } from './draw/pencil';
import { randomPoints } from './sample/point';
import { concaveHull } from './geometry/concave';
import { smoothClosedPathCatmullRom } from './geometry/smoothen';

const ASPECT_RATIO = 1.414;

const calculateCanvasSize = (p: p5): { width: number; height: number } => {
  let w = p.windowWidth;
  let h = p.windowHeight;
  if (h / w > ASPECT_RATIO) {
    h = w * ASPECT_RATIO;
  } else {
    w = h / ASPECT_RATIO;
  }
  return { width: w, height: h };
};

export const sketch = (p: p5) => {
  const { width, height } = calculateCanvasSize(p);

  let points: Point[] = [];
  let hull: Polygon;
  let smoothedHull: Point[] = [];

  p.setup = () => {
    p.createCanvas(width, height);

    const nPoints = 10;
    points = randomPoints(width, height, { numberOfPoints: nPoints });
    hull = concaveHull(points, 0.5, 100);
    smoothedHull = smoothClosedPathCatmullRom(hull.vertices, 10);

    p.noLoop();
  };

  p.draw = () => {
    p.background(240);

    // Draw hull
    p.stroke(0);
    p.noFill();

    drawPencil(p, smoothedHull, { width: 1, density: 5 });
  };

  p.windowResized = () => {
    const { width: newWidth, height: newHeight } = calculateCanvasSize(p);
    p.resizeCanvas(newWidth, newHeight);
  };
};
