import { Point, Polygon } from '@flatten-js/core';
import p5 from 'p5';
import { drawPencil } from './draw/pencil';
import { randomPoints } from './sample/point';
import { concaveHull } from './geometry/concave';
import { smoothClosedPathCatmullRom } from './geometry/smoothen';
import { createTexture, drawPaper } from './draw/paper';

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

  let pencilDraw: Point[] = [];
  let paperDraw: Polygon;

  let paperTexture: p5.Graphics;

  p.setup = () => {
    p.createCanvas(width, height);

    const nPoints = 10;
    const points = randomPoints(width, height, { numberOfPoints: nPoints });
    const hull = concaveHull(points, 0.5, 100);
    pencilDraw = smoothClosedPathCatmullRom(hull.vertices, 10);

    const pointsPaper = randomPoints(width, height, { numberOfPoints: 4 });
    paperDraw = concaveHull(pointsPaper, 0.5, 100);
    paperTexture = createTexture(p, width, height);

    p.noLoop();
  };

  p.draw = () => {
    p.background(240);

    // Draw hull
    p.stroke(0);
    p.noFill();

    drawPaper(p, paperDraw, paperTexture);

    drawPencil(p, pencilDraw, { width: 2, density: 3 });
  };

  p.windowResized = () => {
    const { width: newWidth, height: newHeight } = calculateCanvasSize(p);
    p.resizeCanvas(newWidth, newHeight);
  };
};
