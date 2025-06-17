import { Box, Point } from '@flatten-js/core';
import p5 from 'p5';
import { drawPaper } from './draw';
import { RandomPointSampler } from './sample/point';
import { ConcaveHullPathSampler } from './sample/path';
import { closePath, smoothenOpenPathCatmullRom, toPolygon } from './utils/path';
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

  let path: Point[];

  p.setup = () => {
    p.createCanvas(width, height);

    const pathSampler = new ConcaveHullPathSampler(
      new RandomPointSampler({
        numberOfPoints: 1000,
      }),
      {
        concavity: 0.5,
        lengthThreshold: 75,
      }
    );

    path = pathSampler.sample(new Box(0, 0, width, height));
    path = closePath(path);
    path = smoothenOpenPathCatmullRom(path);

    p.noLoop();
  };

  p.draw = () => {
    p.background(240);
    p.stroke(0);
    p.noFill();

    drawPaper(p, toPolygon(path), TextureType.GEOMETRIC_LINES);
    // drawPencil(p, path, { width: 2, density: 5 });
  };

  p.windowResized = () => {
    const { width: newWidth, height: newHeight } = calculateCanvasSize(p);
    p.resizeCanvas(newWidth, newHeight);
  };
};
