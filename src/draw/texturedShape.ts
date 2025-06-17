import { Polygon } from '@flatten-js/core';
import p5 from 'p5';

interface CanvasRenderingContext2D {
  save: () => void;
  beginPath: () => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  closePath: () => void;
  clip: () => void;
  restore: () => void;
}

export const drawTexturedShape = (p5Instance: p5, shape: Polygon, texture: p5.Graphics) => {
  p5Instance.push();

  const ctx = p5Instance.drawingContext as CanvasRenderingContext2D;

  ctx.save();
  ctx.beginPath();

  const firstVertex = shape.vertices[0];
  ctx.moveTo(firstVertex!.x, firstVertex!.y);

  for (let i = 1; i < shape.vertices.length; i++) {
    const vertex = shape.vertices[i];
    ctx.lineTo(vertex!.x, vertex!.y);
  }

  ctx.closePath();
  ctx.clip();

  p5Instance.image(texture, 0, 0);

  ctx.restore();
  p5Instance.pop();
};
