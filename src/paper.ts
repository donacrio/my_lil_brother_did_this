import { Point, Polygon } from '@flatten-js/core';
import { RandomPointSampler } from './sample/point/random';

export interface Paper {
  shape: Polygon;
}

export enum TearPattern {
  RANDOM = 'random',
}

export const tearPaper = (
  paper: Paper,
  tearPattern: TearPattern,
  numberOfPieces: number,
  scatterAmount: number
): Paper[] => {
  let pieces: Paper[];
  switch (tearPattern) {
    case TearPattern.RANDOM:
      pieces = _createRandomTears(paper, numberOfPieces);
      return _applyRepulsionScatter(pieces, scatterAmount);
  }
};

const _createRandomTears = (
  paper: Paper,
  numberOfPieces: number,
  maxAttempts: number = 100
): Paper[] => {
  const bounds = paper.shape.box;
  const width = bounds.xmax - bounds.xmin;
  const height = bounds.ymax - bounds.ymin;

  let seedPoints: Point[] = [];
  let attempts = 0;
  while (seedPoints.length < numberOfPieces && attempts < maxAttempts) {
    const randomPointSampler = new RandomPointSampler({
      numberOfPoints: numberOfPieces - seedPoints.length,
    });
    const newSeedPoints = randomPointSampler.sample(bounds).filter((p) => paper.shape.contains(p));
    seedPoints = [...seedPoints, ...newSeedPoints];
    attempts++;
  }

  const cols = Math.ceil(Math.sqrt(numberOfPieces));
  const rows = Math.ceil(numberOfPieces / cols);
  const pieceWidth = width / cols;
  const pieceHeight = height / rows;

  // If we couldn't find enough points, use grid fallback
  while (seedPoints.length < numberOfPieces) {
    const col = seedPoints.length % cols;
    const row = Math.floor(seedPoints.length / cols);
    const x = bounds.xmin + (col + 0.5) * pieceWidth;
    const y = bounds.ymin + (row + 0.5) * pieceHeight;
    seedPoints.push(new Point(x, y));
  }

  const pieces: Paper[] = [];
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

    const validVertices = vertices.filter((v) => paper.shape.contains(v));

    if (validVertices.length >= 3) {
      const pieceShape = new Polygon(validVertices);
      pieces.push({ shape: pieceShape });
    }
  }

  return pieces;
};

const _applyRepulsionScatter = (pieces: Paper[], scatterAmount: number): Paper[] => {
  const scatteredPositions = pieces.map((piece) => ({
    x: piece.shape.box.center.x + (Math.random() - 0.5) * scatterAmount * 0.5,
    y: piece.shape.box.center.y + (Math.random() - 0.5) * scatterAmount * 0.5,
  }));

  // Apply simple repulsion
  const iterations = 20;
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < scatteredPositions.length; i++) {
      for (let j = i + 1; j < scatteredPositions.length; j++) {
        const dx = scatteredPositions[i]!.x - scatteredPositions[j]!.x;
        const dy = scatteredPositions[i]!.y - scatteredPositions[j]!.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < scatterAmount && distance > 0) {
          const force = (scatterAmount - distance) * 0.1;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          scatteredPositions[i]!.x += fx;
          scatteredPositions[i]!.y += fy;
          scatteredPositions[j]!.x -= fx;
          scatteredPositions[j]!.y -= fy;
        }
      }
    }
  }

  return pieces.map((piece, i) => {
    const offsetX = scatteredPositions[i]!.x - piece.shape.box.center.x;
    const offsetY = scatteredPositions[i]!.y - piece.shape.box.center.y;

    const scatteredVertices = piece.shape.vertices.map(
      (vertex) => new Point(vertex.x + offsetX, vertex.y + offsetY)
    );

    return {
      shape: new Polygon(scatteredVertices),
    };
  });
};
