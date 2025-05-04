import { Point } from '@flatten-js/core';
import p5 from 'p5';
import { DelaunayTriangulation } from './delaunay';
import { samplePoissonDisk } from './poissonDisk';
import { drawPencil } from './draw';

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
  let delaunayTriangulation: DelaunayTriangulation;
  let paths: Point[][] = [];

  p.setup = () => {
    p.createCanvas(width, height);

    // Generate points using Poisson Disk Sampling
    points = samplePoissonDisk({
      width,
      height,
      minDistanceBetweenPoints: 10,
      maxDistanceBetweenPoints: 20,
      numberOfTries: 100,
    });

    delaunayTriangulation = new DelaunayTriangulation(points);
    paths = [delaunayTriangulation.randomTraverse(points[0])];
    console.log(paths);
    p.noLoop();
  };

  p.draw = () => {
    p.background(240);

    p.stroke(50, 50, 200, 50);
    p.strokeWeight(1);
    p.noFill();

    for (const path of paths) {
      drawPencil(p, path, { width: 2, density: 10 });
    }
  };

  p.windowResized = () => {
    const { width, height } = calculateCanvasSize(p);
    p.resizeCanvas(width, height);
  };
};
