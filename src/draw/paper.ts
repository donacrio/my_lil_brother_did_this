import { Polygon, Point } from '@flatten-js/core';
import p5 from 'p5';
import { getTexture, TextureType } from '../texture';
import { toPolygon } from '../utils/path';

export const createPaper = (path: Point[]): Paper => {
  return {
    shape: toPolygon(path),
  };
};

interface Paper {
  shape: Polygon;
}

export interface TornPaperPiece {
  shape: Polygon;
  originalPosition: Point;
}

export enum TearPattern {
  RANDOM = 'random',
  PARALLEL = 'parallel',
  CIRCULAR = 'circular',
}

const createRandomTears = (originalShape: Polygon, numberOfPieces: number): TornPaperPiece[] => {
  // For random tears, create Voronoi-like regions with random seed points
  const bounds = originalShape.box;
  const width = bounds.xmax - bounds.xmin;
  const height = bounds.ymax - bounds.ymin;

  // Generate random seed points within the shape
  const seedPoints: Point[] = [];
  let attempts = 0;
  while (seedPoints.length < numberOfPieces && attempts < numberOfPieces * 100) {
    const x = bounds.xmin + Math.random() * width;
    const y = bounds.ymin + Math.random() * height;
    const point = new Point(x, y);

    if (originalShape.contains(point)) {
      seedPoints.push(point);
    }
    attempts++;
  }

  // If we couldn't find enough points, use grid fallback
  while (seedPoints.length < numberOfPieces) {
    const cols = Math.ceil(Math.sqrt(numberOfPieces));
    const rows = Math.ceil(numberOfPieces / cols);
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    const col = seedPoints.length % cols;
    const row = Math.floor(seedPoints.length / cols);

    const x = bounds.xmin + (col + 0.5) * cellWidth;
    const y = bounds.ymin + (row + 0.5) * cellHeight;

    seedPoints.push(new Point(x, y));
  }

  // Create pieces using simple grid regions for now (we can improve this later)
  const pieces: TornPaperPiece[] = [];
  const cols = Math.ceil(Math.sqrt(numberOfPieces));
  const rows = Math.ceil(numberOfPieces / cols);
  const pieceWidth = width / cols;
  const pieceHeight = height / rows;

  for (let i = 0; i < numberOfPieces; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x1 = bounds.xmin + col * pieceWidth;
    const y1 = bounds.ymin + row * pieceHeight;
    const x2 = x1 + pieceWidth;
    const y2 = y1 + pieceHeight;

    // Create jagged rectangular piece
    const vertices: Point[] = [];
    const edgePoints = 8;

    // Top edge
    for (let j = 0; j <= edgePoints; j++) {
      const x = x1 + (x2 - x1) * (j / edgePoints);
      const y = y1 + (Math.random() - 0.5) * 20;
      vertices.push(new Point(x, y));
    }

    // Right edge
    for (let j = 1; j <= edgePoints; j++) {
      const x = x2 + (Math.random() - 0.5) * 20;
      const y = y1 + (y2 - y1) * (j / edgePoints);
      vertices.push(new Point(x, y));
    }

    // Bottom edge
    for (let j = edgePoints - 1; j >= 0; j--) {
      const x = x1 + (x2 - x1) * (j / edgePoints);
      const y = y2 + (Math.random() - 0.5) * 20;
      vertices.push(new Point(x, y));
    }

    // Left edge
    for (let j = edgePoints - 1; j >= 1; j--) {
      const x = x1 + (Math.random() - 0.5) * 20;
      const y = y1 + (y2 - y1) * (j / edgePoints);
      vertices.push(new Point(x, y));
    }

    const validVertices = vertices.filter((v) => originalShape.contains(v));

    if (validVertices.length >= 3) {
      const pieceShape = new Polygon(validVertices);
      pieces.push({
        shape: pieceShape,
        originalPosition: seedPoints[i] || new Point(x1 + pieceWidth / 2, y1 + pieceHeight / 2),
      });
    }
  }

  return pieces;
};

const createParallelTears = (
  originalShape: Polygon,
  tearDirection: number,
  numberOfPieces: number
): TornPaperPiece[] => {
  const bounds = originalShape.box;
  const width = bounds.xmax - bounds.xmin;
  const height = bounds.ymax - bounds.ymin;

  // Calculate perpendicular direction for tear lines
  const perpX = Math.cos(tearDirection + Math.PI / 2);
  const perpY = Math.sin(tearDirection + Math.PI / 2);

  // Find the actual extent of the shape in the perpendicular direction
  // by projecting all vertices onto the perpendicular axis
  const projections = originalShape.vertices.map((vertex) => {
    return vertex.x * perpX + vertex.y * perpY;
  });
  const minProjection = Math.min(...projections);
  const maxProjection = Math.max(...projections);
  const actualExtent = maxProjection - minProjection;

  // Calculate uniform strip width
  const tearWidth = actualExtent / numberOfPieces;

  const pieces: TornPaperPiece[] = [];
  const centerX = bounds.xmin + width / 2;
  const centerY = bounds.ymin + height / 2;

  // Calculate the center projection for positioning
  const centerProjection = centerX * perpX + centerY * perpY;

  for (let i = 0; i < numberOfPieces; i++) {
    // Position strips evenly across the actual extent
    const stripStart = minProjection + i * tearWidth;
    const stripEnd = minProjection + (i + 1) * tearWidth;
    const stripCenter = (stripStart + stripEnd) / 2;

    // Convert back to world coordinates
    const offset = stripCenter - centerProjection;

    // Create a strip between two parallel lines
    const stripVertices: Point[] = [];

    // Create the strip bounds
    const stripStartX = centerX + perpX * (offset - tearWidth / 2);
    const stripStartY = centerY + perpY * (offset - tearWidth / 2);
    const stripEndX = centerX + perpX * (offset + tearWidth / 2);
    const stripEndY = centerY + perpY * (offset + tearWidth / 2);

    // Create a rectangular strip with jagged edges
    const maxExtent = Math.max(width, height);
    const segments = 20;
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const dirX = Math.cos(tearDirection);
      const dirY = Math.sin(tearDirection);

      // First edge of strip
      const x1 = stripStartX + dirX * maxExtent * (t - 0.5) + (Math.random() - 0.5) * 10;
      const y1 = stripStartY + dirY * maxExtent * (t - 0.5) + (Math.random() - 0.5) * 10;
      stripVertices.push(new Point(x1, y1));
    }

    for (let j = segments; j >= 0; j--) {
      const t = j / segments;
      const dirX = Math.cos(tearDirection);
      const dirY = Math.sin(tearDirection);

      // Second edge of strip
      const x2 = stripEndX + dirX * maxExtent * (t - 0.5) + (Math.random() - 0.5) * 10;
      const y2 = stripEndY + dirY * maxExtent * (t - 0.5) + (Math.random() - 0.5) * 10;
      stripVertices.push(new Point(x2, y2));
    }

    const validVertices = stripVertices.filter((v) => originalShape.contains(v));

    if (validVertices.length >= 3) {
      const pieceShape = new Polygon(validVertices);
      pieces.push({
        shape: pieceShape,
        originalPosition: new Point(centerX + perpX * offset, centerY + perpY * offset),
      });
    }
  }

  return pieces;
};

const createCircularTears = (originalShape: Polygon, scatterAmount: number): TornPaperPiece[] => {
  const bounds = originalShape.box;
  const centerX = bounds.xmin + (bounds.xmax - bounds.xmin) / 2;
  const centerY = bounds.ymin + (bounds.ymax - bounds.ymin) / 2;
  const maxRadius = Math.max(bounds.xmax - bounds.xmin, bounds.ymax - bounds.ymin) / 2;

  const pieces: TornPaperPiece[] = [];
  const ringWidth = scatterAmount;
  const numberOfRings = Math.floor(maxRadius / ringWidth);

  // Create concentric ring pieces, returning only every 2nd one
  for (let i = 0; i < numberOfRings; i += 2) {
    const innerRadius = i * ringWidth;
    const outerRadius = (i + 1) * ringWidth;

    // Create ring shape
    const ringVertices: Point[] = [];
    const segments = 40;

    // Outer edge
    for (let j = 0; j <= segments; j++) {
      const angle = (j / segments) * Math.PI * 2;
      const radiusVariation = outerRadius + (Math.random() - 0.5) * 15;
      const x = centerX + Math.cos(angle) * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusVariation;
      ringVertices.push(new Point(x, y));
    }

    // Inner edge (reverse order for proper polygon)
    for (let j = segments; j >= 0; j--) {
      const angle = (j / segments) * Math.PI * 2;
      const radiusVariation = innerRadius + (Math.random() - 0.5) * 15;
      const x = centerX + Math.cos(angle) * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusVariation;

      // Only add inner edge if not the center ring
      if (innerRadius > 0) {
        ringVertices.push(new Point(x, y));
      }
    }

    const validVertices = ringVertices.filter((v) => originalShape.contains(v));

    if (validVertices.length >= 3) {
      const pieceShape = new Polygon(validVertices);
      pieces.push({
        shape: pieceShape,
        originalPosition: new Point(centerX, centerY),
      });
    }
  }

  return pieces;
};

export const createTornPaperPieces = (
  originalShape: Polygon,
  numberOfPieces: number,
  tearPattern: TearPattern = TearPattern.RANDOM,
  tearDirection: number = 0,
  tearWidth: number = 50
): TornPaperPiece[] => {
  if (numberOfPieces === 1) {
    return [
      {
        shape: originalShape,
        originalPosition: new Point(
          originalShape.box.xmin + (originalShape.box.xmax - originalShape.box.xmin) / 2,
          originalShape.box.ymin + (originalShape.box.ymax - originalShape.box.ymin) / 2
        ),
      },
    ];
  }

  switch (tearPattern) {
    case TearPattern.RANDOM:
      return createRandomTears(originalShape, numberOfPieces);
    case TearPattern.PARALLEL:
      return createParallelTears(originalShape, tearDirection, numberOfPieces);
    case TearPattern.CIRCULAR:
      return createCircularTears(originalShape, tearWidth);
    default:
      return createRandomTears(originalShape, numberOfPieces);
  }
};

export const scatterTornPieces = (
  pieces: TornPaperPiece[],
  canvasWidth: number,
  canvasHeight: number,
  scatterAmount: number = 50,
  tearPattern: TearPattern = TearPattern.RANDOM,
  tearDirection: number = 0
): TornPaperPiece[] => {
  if (scatterAmount === 0) {
    return pieces;
  }

  switch (tearPattern) {
    case TearPattern.RANDOM:
      // Use repulsion for random tears
      return applyRepulsionScatter(pieces, scatterAmount);

    case TearPattern.PARALLEL:
      // Scatter along perpendicular to tear direction
      return applyParallelScatter(pieces, scatterAmount, tearDirection);

    case TearPattern.CIRCULAR:
      // Already scattered in creation, no additional scatter needed
      return pieces;

    default:
      return applyRepulsionScatter(pieces, scatterAmount);
  }
};

const applyRepulsionScatter = (
  pieces: TornPaperPiece[],
  scatterAmount: number
): TornPaperPiece[] => {
  const scatteredPositions = pieces.map((piece) => ({
    x: piece.originalPosition.x + (Math.random() - 0.5) * scatterAmount * 0.5,
    y: piece.originalPosition.y + (Math.random() - 0.5) * scatterAmount * 0.5,
  }));

  // Apply simple repulsion
  const iterations = 20;
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < scatteredPositions.length; i++) {
      for (let j = i + 1; j < scatteredPositions.length; j++) {
        const dx = scatteredPositions[i].x - scatteredPositions[j].x;
        const dy = scatteredPositions[i].y - scatteredPositions[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < scatterAmount && distance > 0) {
          const force = (scatterAmount - distance) * 0.1;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          scatteredPositions[i].x += fx;
          scatteredPositions[i].y += fy;
          scatteredPositions[j].x -= fx;
          scatteredPositions[j].y -= fy;
        }
      }
    }
  }

  return pieces.map((piece, i) => {
    const offsetX = scatteredPositions[i].x - piece.originalPosition.x;
    const offsetY = scatteredPositions[i].y - piece.originalPosition.y;

    const scatteredVertices = piece.shape.vertices.map(
      (vertex) => new Point(vertex.x + offsetX, vertex.y + offsetY)
    );

    return {
      shape: new Polygon(scatteredVertices),
      originalPosition: piece.originalPosition,
    };
  });
};

const applyParallelScatter = (
  pieces: TornPaperPiece[],
  scatterAmount: number,
  tearDirection: number
): TornPaperPiece[] => {
  const perpX = Math.cos(tearDirection + Math.PI / 2);
  const perpY = Math.sin(tearDirection + Math.PI / 2);

  return pieces.map((piece, index) => {
    const offset = (index - (pieces.length - 1) / 2) * scatterAmount;
    const offsetX = perpX * offset;
    const offsetY = perpY * offset;

    const scatteredVertices = piece.shape.vertices.map(
      (vertex) => new Point(vertex.x + offsetX, vertex.y + offsetY)
    );

    return {
      shape: new Polygon(scatteredVertices),
      originalPosition: piece.originalPosition,
    };
  });
};

export const drawTornPaperPieces = (
  p5Instance: p5,
  pieces: TornPaperPiece[],
  textureType: TextureType
) => {
  const texture = getTexture(p5Instance, textureType, p5Instance.width, p5Instance.height);

  pieces.forEach((piece) => {
    p5Instance.push();

    const ctx = p5Instance.drawingContext as CanvasRenderingContext2D;

    ctx.save();
    ctx.beginPath();

    const firstVertex = piece.shape.vertices[0];
    ctx.moveTo(firstVertex.x, firstVertex.y);

    for (let i = 1; i < piece.shape.vertices.length; i++) {
      const vertex = piece.shape.vertices[i];
      ctx.lineTo(vertex.x, vertex.y);
    }

    ctx.closePath();
    ctx.clip();

    p5Instance.image(texture, 0, 0);

    ctx.restore();
    p5Instance.pop();
  });
};

export const drawPaper = (p5Instance: p5, shape: Polygon, textureType: TextureType) => {
  const texture = getTexture(p5Instance, textureType, p5Instance.width, p5Instance.height);

  p5Instance.push();

  const ctx = p5Instance.drawingContext as CanvasRenderingContext2D;

  ctx.save();
  ctx.beginPath();

  const firstVertex = shape.vertices[0];
  ctx.moveTo(firstVertex.x, firstVertex.y);

  for (let i = 1; i < shape.vertices.length; i++) {
    const vertex = shape.vertices[i];
    ctx.lineTo(vertex.x, vertex.y);
  }

  ctx.closePath();
  ctx.clip();

  p5Instance.image(texture, 0, 0);

  ctx.restore();
  p5Instance.pop();
};
