import p5 from 'p5';
import { BaseTexture } from './base';

export class WavesTexture extends BaseTexture {
  protected static override _createTexture(
    p5Instance: p5,
    width: number,
    height: number
  ): p5.Graphics {
    const texture = p5Instance.createGraphics(width, height);
    texture.background(100, 150, 200);
    texture.stroke(255);
    texture.strokeWeight(2);
    texture.noFill();

    for (let y = 0; y < height; y += 20) {
      texture.beginShape();
      for (let x = 0; x <= width; x += 10) {
        const waveY = y + p5Instance.sin(x * 0.02) * 10;
        texture.vertex(x, waveY);
      }
      texture.endShape();
    }

    return texture;
  }
}
