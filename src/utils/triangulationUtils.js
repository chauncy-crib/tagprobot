import { Point } from '../navmesh/graph';
import { gridInBounds } from './mapUtils';
import { getTileProperty, tileIsOneOf } from '../tiles';

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
  if (isRightEdgeT(map, topLeft)
    !== isRightEdgeT(map, bottomLeft)) return true;
  if (isLeftEdgeT(map, topRight)
    !== isLeftEdgeT(map, bottomRight)) return true;
  if (isTopEdgeT(map, bottomLeft)
    !== isTopEdgeT(map, bottomRight)) return true;
  if (isBottomEdgeT(map, topLeft)
    !== isBottomEdgeT(map, topRight)) return true;
  if (isForwardDiag(map, topLeft)
    !== isForwardDiag(map, bottomRight)) return true;
  if (isBackDiag(map, topRight)
    !== isBackDiag(map, bottomLeft)) return true;
  return false;
}
