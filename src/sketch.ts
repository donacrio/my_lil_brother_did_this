import { Point, Polygon } from '@flatten-js/core';
import p5 from 'p5';
import { drawPencil } from './draw/pencil';
import { randomPoints } from './sample/point';
import { concaveHull } from './geometry/concave';
import { smoothClosedPathCatmullRom } from './geometry/smoothen';
import { drawPaper } from './draw/paper';
import { TextureType } from './texture';

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

  let pencilPath: Point[] = [];
  let paperShape: Polygon;

  p.setup = () => {
    p.createCanvas(width, height);

    const pencilPoints = randomPoints(width, height, { numberOfPoints: 10 });
    const pencilHull = concaveHull(pencilPoints, 0.5, 100);
    pencilPath = smoothClosedPathCatmullRom(pencilHull.vertices, 10);

    const paperPoints = randomPoints(width, height, { numberOfPoints: 4 });
    paperShape = concaveHull(paperPoints, 0.5, 100);

    p.noLoop();
  };

  p.draw = () => {
    p.background(240);
    p.stroke(0);
    p.noFill();

    drawPaper(p, paperShape, TextureType.WAVES);
    drawPencil(p, pencilPath, { width: 2, density: 3 });
  };

  p.windowResized = () => {
    const { width: newWidth, height: newHeight } = calculateCanvasSize(p);
    p.resizeCanvas(newWidth, newHeight);
  };
};
