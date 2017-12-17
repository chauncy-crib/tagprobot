import { threePointsInLine } from './graphUtils';
import { getTileProperty, tileIsOneOf, tileHasName } from '../tiles';
import { assert } from '../utils/asserts';


/**
 * @param {{p1: Point, p2: Point}} e1
 * @param {{p1: Point, p2: Point}} e2
 * @returns {boolean} true if the edges would lay on top of eachother if they were both extended
 *   infinitely in both directions
 */
export function edgesInALine(e1, e2) {
  return threePointsInLine(e1.p1, e1.p2, e2.p1) && threePointsInLine(e1.p1, e1.p2, e2.p2);
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on the left.
 */
export function wallOnLeft(map, x, y) {
  if (x === 0) {
    return true;
  }
  const id = map[x - 1][y];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_2'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on the right.
 */
export function wallOnRight(map, xt, yt) {
  if (xt === map.length - 1) {
    return true;
  }
  const id = map[xt + 1][yt];
  if (tileIsOneOf(id, ['ANGLE_WALL_3', 'ANGLE_WALL_4'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) on top.
 */
export function wallOnTop(map, xt, yt) {
  if (yt === 0) {
    return true;
  }
  const id = map[xt][yt - 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_2', 'ANGLE_WALL_3'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given the tagpro map and a traversable tile location, return if there is an NT wall (or the edge
 *   of the map) below it.
 */
export function wallOnBottom(map, xt, yt) {
  if (yt === map[0].length - 1) {
    return true;
  }
  const id = map[xt][yt + 1];
  if (tileIsOneOf(id, ['ANGLE_WALL_1', 'ANGLE_WALL_4'])) {
    return false;
  }
  return !getTileProperty(id, 'traversable');
}


/**
 * Given a cell location, return if the cell above/below/left/right of it is traversable
 */
export function traversableInDirection(map, x, y, direction) {
  switch (direction) {
    case 'UP':
      return y !== 0 && getTileProperty(map[x][y - 1], 'traversable');
    case 'DOWN':
      return y !== map[0].length - 1 && getTileProperty(map[x][y + 1], 'traversable');
    case 'LEFT':
      return x !== 0 && getTileProperty(map[x - 1][y], 'traversable');
    case 'RIGHT':
      return x !== map.length - 1 && getTileProperty(map[x + 1][y], 'traversable');
    default:
      assert(false, `${direction} not in UP, DOWN, LEFT, RIGHT`);
      return null;
  }
}


/**
 * Given an angle wall location, return true if it is traversable. (An NT angle wall has NT tiles
 * surrounding it).
 */
export function isAngleWallTraversable(map, x, y) {
  const id = map[x][y];
  if (tileHasName(id, 'ANGLE_WALL_1')) {
    return traversableInDirection(map, x, y, 'UP') || traversableInDirection(map, x, y, 'RIGHT');
  }
  if (tileHasName(id, 'ANGLE_WALL_2')) {
    return traversableInDirection(map, x, y, 'DOWN') || traversableInDirection(map, x, y, 'RIGHT');
  }
  if (tileHasName(id, 'ANGLE_WALL_3')) {
    return traversableInDirection(map, x, y, 'DOWN') || traversableInDirection(map, x, y, 'LEFT');
  }
  if (tileHasName(id, 'ANGLE_WALL_4')) {
    return traversableInDirection(map, x, y, 'UP') || traversableInDirection(map, x, y, 'LEFT');
  }
  assert(false, `Tile at ${x}, ${y} was not an angle wall`);
  return null;
}
