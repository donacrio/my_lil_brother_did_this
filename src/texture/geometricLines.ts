import type p5 from 'p5';
import { BaseTexture } from './base';

export class GeometricLinesTexture extends BaseTexture {
  protected static override _createTexture(
    p5Instance: p5,
    width: number,
    height: number
  ): p5.Graphics {
    const texture = p5Instance.createGraphics(width, height);

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
        const pattern = p5Instance.int(p5Instance.random(4));
        switch (pattern) {
          case 0:
            GeometricLinesTexture._drawHorizontalLines(texture, p5Instance, cellSize);
            break;
          case 1:
            GeometricLinesTexture._drawVerticalLines(texture, p5Instance, cellSize);
            break;
          case 2:
            GeometricLinesTexture._drawDiagonalLines(texture, p5Instance, cellSize);
            break;
          case 3:
            GeometricLinesTexture._drawArcs(texture, p5Instance, cellSize);
            break;
        }
        texture.pop();
      }
    }

    return texture;
  }

  private static _drawHorizontalLines = (
    texture: p5.Graphics,
    p5Instance: p5,
    cellSize: number
  ) => {
    for (let k = 10; k < cellSize; k += 15) {
      texture.beginShape();
      for (let l = 0; l <= cellSize; l += 10) {
        const yWithJitter = k + p5Instance.random(-2, 2);
        texture.vertex(l, yWithJitter);
      }
      texture.endShape();
    }
  };

  private static _drawVerticalLines = (texture: p5.Graphics, p5Instance: p5, cellSize: number) => {
    for (let k = 10; k < cellSize; k += 15) {
      texture.beginShape();
      for (let l = 0; l <= cellSize; l += 10) {
        const xWithJitter = k + p5Instance.random(-2, 2);
        texture.vertex(xWithJitter, l);
      }
      texture.endShape();
    }
  };

  private static _drawDiagonalLines = (texture: p5.Graphics, p5Instance: p5, cellSize: number) => {
    for (let k = -cellSize; k < cellSize * 2; k += 15) {
      texture.beginShape();
      for (let l = 0; l <= cellSize; l += 10) {
        const xWithJitter = l + p5Instance.random(-2, 2);
        const yWithJitter = l - k + p5Instance.random(-2, 2);
        texture.vertex(xWithJitter, yWithJitter);
      }
      texture.endShape();
    }
  };

  private static _drawArcs = (texture: p5.Graphics, p5Instance: p5, cellSize: number) => {
    for (let k = 20; k < cellSize; k += 20) {
      const startAngle = p5Instance.random([
        0,
        p5Instance.HALF_PI,
        p5Instance.PI,
        p5Instance.PI + p5Instance.HALF_PI,
      ]);
      texture.arc(cellSize / 2, cellSize / 2, k, k, startAngle, startAngle + p5Instance.HALF_PI);
    }
  };
}
