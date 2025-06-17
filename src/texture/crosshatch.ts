import type p5 from 'p5';
import { BaseTexture } from './base';

export class CrosshatchTexture extends BaseTexture {
  protected static override _createTexture(
    p5Instance: p5,
    width: number,
    height: number
  ): p5.Graphics {
    const texture = p5Instance.createGraphics(width, height);
    texture.background(150, 100, 150);
    texture.stroke(255);
    texture.strokeWeight(1);

    // Diagonal lines one way
    for (let i = -height; i < width; i += 15) {
      texture.line(i, 0, i + height, height);
    }

    // Diagonal lines the other way
    for (let i = 0; i < width + height; i += 15) {
      texture.line(i, 0, i - height, height);
    }

    return texture;
  }
}
