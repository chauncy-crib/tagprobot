import { detD } from './determinant';


/**
 * Throws a specified error message if a condition is not met. If no message
 * is specified, then a default error message is thrown.
 *
 * condition: the condition, which, if false, will cause an error to be thrown
 * errorMessage: the error message to throw if condition is not true
 */
export function assert(condition, errorMessage = 'Assertion failed') {
  if (!condition) {
    if (typeof Error !== 'undefined') {
      throw new Error(errorMessage);
    }
    throw errorMessage;
  }
}


export function assertGridInBounds(grid, x, y) {
  const width = grid.length;
  const height = grid[0].length;
  assert(x >= 0, `Grid out of bounds error: x<0. x=${x}, grid is ${width} by ${height}`);
  assert(y >= 0, `Grid out of bounds error: y<0. y=${y}, grid is ${width} by ${height}`);
  assert(
    x < width,
    `Grid out of bounds error: x>= width of input grid. x=${x}, width=${width}`,
  );
  assert(
    y < height,
    `Grid out of bounds error: y>= height of input grid. y=${y}, height=${height}`,
  );
}


export function isRoughly(val, expected, threshold = 0.01) {
  return Math.abs(val - expected) <= threshold;
}


/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {{p1: Point, p2: Point}} e - an edge
 * @returns {boolean} if the two points are on the same side of the edge
 */
export function pointsOnSameSide(p1, p2, e) {
  return detD(e.p1, e.p2, p1) * detD(e.p1, e.p2, p2) > 0;
}


export function boundValue(value, lowerBound, upperBound) {
  return Math.max(lowerBound, Math.min(upperBound, value));
}
