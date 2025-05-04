import { Point } from '@flatten-js/core';
import p5 from 'p5';
import { DelaunayTriangulation } from './graph/delaunay';
import { drawPencil } from './draw/pencil';
import { randomTraverse } from './graph/graph';
import { poissonDiskSampler } from './sample/point';

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
  const paths: Point[][] = [];

  p.setup = () => {
    p.createCanvas(width, height);

    points = poissonDiskSampler(width, height, {
      minDistanceBetweenPoints: 25,
      maxDistanceBetweenPoints: 50,
      numberOfTries: 100,
    });

    delaunayTriangulation = new DelaunayTriangulation(points);

    // Pass canvas dimensions to createPaths
    const nPaths = 100;

    for (let i = 0; i < nPaths; i++) {
      paths.push(
        randomTraverse(
          delaunayTriangulation,
          points[i],
          {
            xMin: 0,
            xMax: width,
            yMin: 0,
            yMax: height,
          },
          {
            maxLength: 100,
          }
        )
      );
    }

    p.noLoop();
  };

  p.draw = () => {
    p.background(240);

    p.stroke(40); // Charcoal gray
    p.strokeWeight(1); // Small dots for pencil effect

    for (const path of paths) {
      drawPencil(p, path, { width: 4, density: 1 });
    }
  };

  p.windowResized = () => {
    const { width: newWidth, height: newHeight } = calculateCanvasSize(p);
    p.resizeCanvas(newWidth, newHeight);
  };
};
