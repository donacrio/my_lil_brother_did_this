import p5 from 'p5';

// Enum for different texture types
export enum TextureType {
  GEOMETRIC_LINES = 'geometric_lines',
  DOTS = 'dots',
  WAVES = 'waves',
  CROSSHATCH = 'crosshatch',
}

// Cache for storing created textures
const textureCache = new Map<string, p5.Graphics>();

// Function to get or create a texture
export const getTexture = (
  p5Instance: p5,
  textureType: TextureType,
  width: number,
  height: number
): p5.Graphics => {
  const cacheKey = `${textureType}_${width}_${height}`;

  // Check if texture already exists in cache
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // Create new texture based on type
  let texture: p5.Graphics;

  switch (textureType) {
    case TextureType.GEOMETRIC_LINES:
      texture = createGeometricLinesTexture(p5Instance, width, height);
      break;
    case TextureType.DOTS:
      texture = createDotsTexture(p5Instance, width, height);
      break;
    case TextureType.WAVES:
      texture = createWavesTexture(p5Instance, width, height);
      break;
    case TextureType.CROSSHATCH:
      texture = createCrosshatchTexture(p5Instance, width, height);
      break;
  }

  // Store in cache and return
  textureCache.set(cacheKey, texture);
  return texture;
};

// Geometric lines texture (original pattern)
const createGeometricLinesTexture = (
  p5Instance: p5,
  width: number,
  height: number
): p5.Graphics => {
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
          drawHorizontalLines(texture, p5Instance, cellSize);
          break;
        case 1:
          drawVerticalLines(texture, p5Instance, cellSize);
          break;
        case 2:
          drawDiagonalLines(texture, p5Instance, cellSize);
          break;
        case 3:
          drawArcs(texture, p5Instance, cellSize);
          break;
      }
      texture.pop();
    }
  }

  return texture;
};

const drawHorizontalLines = (texture: p5.Graphics, p5Instance: p5, cellSize: number) => {
  for (let k = 10; k < cellSize; k += 15) {
    texture.beginShape();
    for (let l = 0; l <= cellSize; l += 10) {
      const yWithJitter = k + p5Instance.random(-2, 2);
      texture.vertex(l, yWithJitter);
    }
    texture.endShape();
  }
};

const drawVerticalLines = (texture: p5.Graphics, p5Instance: p5, cellSize: number) => {
  for (let k = 10; k < cellSize; k += 15) {
    texture.beginShape();
    for (let l = 0; l <= cellSize; l += 10) {
      const xWithJitter = k + p5Instance.random(-2, 2);
      texture.vertex(xWithJitter, l);
    }
    texture.endShape();
  }
};

const drawDiagonalLines = (texture: p5.Graphics, p5Instance: p5, cellSize: number) => {
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

const drawArcs = (texture: p5.Graphics, p5Instance: p5, cellSize: number) => {
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

// Dots texture
const createDotsTexture = (p5Instance: p5, width: number, height: number): p5.Graphics => {
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
};

// Waves texture
const createWavesTexture = (p5Instance: p5, width: number, height: number): p5.Graphics => {
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
};

// Crosshatch texture
const createCrosshatchTexture = (p5Instance: p5, width: number, height: number): p5.Graphics => {
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
};

// Backward compatibility function
export const createTexture = (p5Instance: p5, width: number, height: number): p5.Graphics => {
  return createGeometricLinesTexture(p5Instance, width, height);
};
