import { Box } from '@flatten-js/core';
import p5 from 'p5';
import { drawTexturedShape } from './draw/texturedShape';
import { RandomPointSampler } from './sample/point';
import { ConcaveHullPathSampler } from './sample/path';
import { closePath, smoothenClosedPathCatmullRom, toPolygon } from './utils/path';
import { DotsTexture } from './texture';
import { tearPaper, TearPattern, type Paper } from './paper';
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

  let paper: Paper;
  const paperTexture = DotsTexture;
  let papers: Paper[] = [];

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

    const box = new Box(width / 4, height / 4, (width * 3) / 4, (height * 3) / 4);
    const path = smoothenClosedPathCatmullRom(closePath(pathSampler.sample(box)));
    paper = {
      shape: toPolygon(path),
    };

    papers = tearPaper(paper, TearPattern.RANDOM, 6, 0);

    p.noLoop();
  };

  p.draw = () => {
    p.background(240);
    p.stroke(0);
    p.noFill();

    papers.forEach((paper) => {
      drawTexturedShape(p, paper.shape, paperTexture.getTexture(p, width, height));
    });

    drawPencil(p, paper.shape.vertices, { width: 2, density: 5 });
  };

  p.windowResized = () => {
    const { width: newWidth, height: newHeight } = calculateCanvasSize(p);
    p.resizeCanvas(newWidth, newHeight);
  };
};
