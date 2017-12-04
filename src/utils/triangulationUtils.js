import { Point } from '../navmesh/graph';
import { gridInBounds } from './mapUtils';
import { getTileProperty, tileIsOneOf } from '../tiles';
import { assert } from '../utils/asserts';

export function isLeftEdgeT(map, p) {
  return gridInBounds(map, p.x, p.y) && (getTileProperty(map[p.x][p.y], 'traversable') ||
    tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_3', 'ANGLE_WALL_4']));
}


export function isRightEdgeT(map, p) {
  return gridInBounds(map, p.x, p.y) && (getTileProperty(map[p.x][p.y], 'traversable') ||
    tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_1', 'ANGLE_WALL_2']));
}


export function isTopEdgeT(map, p) {
  return gridInBounds(map, p.x, p.y) && (getTileProperty(map[p.x][p.y], 'traversable') ||
    tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_1', 'ANGLE_WALL_4']));
}


export function isBottomEdgeT(map, p) {
  return gridInBounds(map, p.x, p.y) && (getTileProperty(map[p.x][p.y], 'traversable') ||
    tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_2', 'ANGLE_WALL_3']));
}


export function isForwardDiag(map, p) {
  return gridInBounds(map, p.x, p.y) &&
    tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_2', 'ANGLE_WALL_4']);
}


export function isBackDiag(map, p) {
  return gridInBounds(map, p.x, p.y) &&
    tileIsOneOf(map[p.x][p.y], ['ANGLE_WALL_1', 'ANGLE_WALL_3']);
}

export function shouldHaveTriangulationVertex(map, xt, yt) {
  const topLeft = new Point(xt - 1, yt - 1);
  const topRight = new Point(xt, yt - 1);
  const bottomLeft = new Point(xt - 1, yt);
  const bottomRight = new Point(xt, yt);
  const edges = [
    isRightEdgeT(map, topLeft) !== isLeftEdgeT(map, topRight),
    isForwardDiag(map, topRight),
    isBottomEdgeT(map, topRight) !== isTopEdgeT(map, bottomRight),
    isBackDiag(map, bottomRight),
    isRightEdgeT(map, bottomLeft) !== isLeftEdgeT(map, bottomRight),
    isForwardDiag(map, bottomLeft),
    isBottomEdgeT(map, topLeft) !== isTopEdgeT(map, bottomLeft),
    isBackDiag(map, topLeft),
  ];
  const edgeIndices = [];
  for (let i = 0; i < edges.length; i += 1) {
    if (edges[i]) edgeIndices.push(i);
  }
  if (edgeIndices.length === 0) return false;
  assert(
    edgeIndices.length > 1,
    `Only one polygon edge found coming from vertex at ${xt}, ${yt}`,
  );
  if (edgeIndices.length === 2) return edgeIndices[1] - edgeIndices[0] !== 4;
  return true;
}
