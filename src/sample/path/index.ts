import { Box, Point } from '@flatten-js/core';

export interface PathSampler {
  sample(box: Box): Point[];
}

export { DelaunayPathSampler } from './delaunay';
export { ConcaveHullPathSampler } from './concaveHull';
