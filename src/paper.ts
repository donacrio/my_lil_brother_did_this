import { Polygon, BooleanOperations } from '@flatten-js/core';
import { RandomPointSampler } from './sample/point/random';
import * as d3 from 'd3';

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
  console.log('tearPaper called with:', { tearPattern, numberOfPieces, scatterAmount });
  let pieces: Paper[];
  switch (tearPattern) {
    case TearPattern.RANDOM: {
      pieces = _createRandomTears(paper, numberOfPieces);
      // const result = _applyRepulsionScatter(pieces, scatterAmount);
      return pieces;
    }
  }
};

const _createRandomTears = (paper: Paper, numberOfPieces: number): Paper[] => {
  // Get the bounding box of the paper shape
  const box = paper.shape.box;

  // Generate random points for Voronoi sites
  const pointSampler = new RandomPointSampler({ numberOfPoints: numberOfPieces });
  const points = pointSampler.sample(box);

  // Convert flatten-js Points to D3 format
  const d3Points = points.map((p) => [p.x, p.y] as [number, number]);

  // Create Delaunay triangulation and get Voronoi diagram
  const delaunay = d3.Delaunay.from(d3Points);
  const voronoi = delaunay.voronoi([box.xmin, box.ymin, box.xmax, box.ymax]);

  const paperPieces: Paper[] = [];

  // For each Voronoi cell, create a polygon and intersect with the paper
  for (let i = 0; i < points.length; i++) {
    const cell = voronoi.cellPolygon(i);
    if (cell) {
      try {
        // Convert D3 polygon to flatten-js Polygon
        const cellPolygon = new Polygon(cell.map(([x, y]) => [x, y]));

        // Intersect the Voronoi cell with the original paper using boolean operations
        const intersection = BooleanOperations.intersect(paper.shape, cellPolygon);

        // BooleanOperations.intersect returns a Polygon
        if (intersection && intersection.area() > 0) {
          paperPieces.push({ shape: intersection });
        }
      } catch (error) {
        // Skip invalid cells - sometimes Voronoi cells at boundaries can be problematic
        console.warn('Skipping invalid Voronoi cell:', error);
      }
    }
  }

  return paperPieces;
};

const _applyRepulsionScatter = (_pieces: Paper[], _scatterAmount: number): Paper[] => {
  return [];
};
