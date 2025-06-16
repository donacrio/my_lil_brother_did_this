import { Polygon } from '@flatten-js/core';
import p5 from 'p5';

export const createTexture = (p5Instance: p5, width: number, height: number): p5.Graphics => {
  // Use a 2D buffer for drawing
  const texture = p5Instance.createGraphics(width, height);

  // Colors inspired by the photo
  const bgColor = p5Instance.color(24, 77, 71); // teal
  const lineColor = p5Instance.color(230, 230, 200); // cream

  texture.background(bgColor);
  texture.stroke(lineColor);
  texture.strokeWeight(4);
  texture.noFill();

  // Grid settings
  const cellSize = 100;
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * cellSize;
      const y = j * cellSize;
      texture.push();
      texture.translate(x, y);
      // Randomly pick a pattern for this cell
      const pattern = p5Instance.int(p5Instance.random(4));
      switch (pattern) {
        case 0: // Horizontal lines
          for (let k = 10; k < cellSize; k += 15) {
            texture.beginShape();
            for (let l = 0; l <= cellSize; l += 10) {
              // Add some hand-drawn jitter
              const yJitter = k + p5Instance.random(-2, 2);
              texture.vertex(l, yJitter);
            }
            texture.endShape();
          }
          break;
        case 1: // Vertical lines
          for (let k = 10; k < cellSize; k += 15) {
            texture.beginShape();
            for (let l = 0; l <= cellSize; l += 10) {
              const xJitter = k + p5Instance.random(-2, 2);
              texture.vertex(xJitter, l);
            }
            texture.endShape();
          }
          break;
        case 2: // Diagonal lines
          for (let k = -cellSize; k < cellSize * 2; k += 15) {
            texture.beginShape();
            for (let l = 0; l <= cellSize; l += 10) {
              const xJitter = l + p5Instance.random(-2, 2);
              const yJitter = l - k + p5Instance.random(-2, 2);
              texture.vertex(xJitter, yJitter);
            }
            texture.endShape();
          }
          break;
        case 3: // Arcs
          for (let k = 20; k < cellSize; k += 20) {
            const start = p5Instance.random([
              0,
              p5Instance.HALF_PI,
              p5Instance.PI,
              p5Instance.PI + p5Instance.HALF_PI,
            ]);
            texture.arc(cellSize / 2, cellSize / 2, k, k, start, start + p5Instance.HALF_PI);
          }
          break;
      }
      texture.pop();
    }
  }

  return texture;
};

export const drawPaper = (p5Instance: p5, shape: Polygon, texture: p5.Graphics) => {
  // Use canvas clipping to mask the texture to the polygon shape
  p5Instance.push();

  // Access the underlying canvas context
  const ctx = p5Instance.drawingContext as CanvasRenderingContext2D;

  // Create a clipping path from the polygon
  ctx.save();
  ctx.beginPath();

  // Move to the first vertex
  const firstVertex = shape.vertices[0];
  ctx.moveTo(firstVertex.x, firstVertex.y);

  // Draw lines to all other vertices
  for (let i = 1; i < shape.vertices.length; i++) {
    const vertex = shape.vertices[i];
    ctx.lineTo(vertex.x, vertex.y);
  }

  ctx.closePath();
  ctx.clip();

  // Draw the texture within the clipped area
  p5Instance.image(texture, 0, 0);

  // Restore the canvas context
  ctx.restore();
  p5Instance.pop();
};
