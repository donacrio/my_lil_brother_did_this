import p5 from 'p5';

export abstract class BaseTexture {
  private static _textures: Map<string, p5.Graphics> = new Map();

  public static getTexture(p5Instance: p5, width: number, height: number): p5.Graphics {
    const key = `${this.name}_${width}x${height}`;
    if (!BaseTexture._textures.has(key)) {
      BaseTexture._textures.set(key, this._createTexture(p5Instance, width, height));
    }
    return BaseTexture._textures.get(key)!;
  }

  protected static _createTexture(_p5Instance: p5, _width: number, _height: number): p5.Graphics {
    throw new Error('Not implemented');
  }
}
