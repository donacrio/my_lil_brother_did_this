import type p5 from 'p5';
import { BaseTexture } from './base';

export class DotsTexture extends BaseTexture {
  protected static override _createTexture(
    p5Instance: p5,
    width: number,
    height: number
  ): p5.Graphics {
    const texture = p5Instance.createGraphics(width, height);
    texture.background(200, 100, 100);
    texture.fill(255);
    texture.noStroke();

    for (let i = 0; i < 200; i++) {
      const x = p5Instance.random(width);
      const y = p5Instance.random(height);
      const size = p5Instance.random(2, 8);
      texture.circle(x, y, size);
    }

    return texture;
  }
}
