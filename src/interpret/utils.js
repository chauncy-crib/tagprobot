import _ from 'lodash';

import { determinant } from '../global/utils';


/**
 * @param {Point} A
 * @param {Point} B
 * @param {Point} P
 * @returns {number} a number which is positive iff P is on the left of the edge AB
 */
export function detD(A, B, P) {
  return determinant([
    [A.x, A.y, 1],
    [B.x, B.y, 1],
    [P.x, P.y, 1],
  ]);
}


/**
 * @param {Point} A
 * @param {Point} B
 * @param {Point} C
 * @param {Point} E
 * @returns {number} a number which is positive iff D is inside the circumcircle of points A, B, C
 */
export function detH(A, B, C, D) {
  return determinant([
    [A.x, A.y, (A.x ** 2) + (A.y ** 2), 1],
    [B.x, B.y, (B.x ** 2) + (B.y ** 2), 1],
    [C.x, C.y, (C.x ** 2) + (C.y ** 2), 1],
    [D.x, D.y, (D.x ** 2) + (D.y ** 2), 1],
  ]);
}


/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @returns {boolean} true if all points are colinear
 */
export function threePointsInLine(p1, p2, p3) {
  if (p1.equals(p2) || p1.equals(p3) || p2.equals(p3)) return true;
  const x1 = p2.x - p1.x;
  const x2 = p2.x - p3.x;
  const y1 = p2.y - p1.y;
  const y2 = p2.y - p3.y;
  if (x1 === 0 || x2 === 0) return x1 === x2;
  // Use line slopes to calculate if all three points are in a line
  return y1 * x2 === y2 * x1;
}


/**
 * Adapted from: https://stackoverflow.com/questions/6989100/sort-points-in-clockwise-order
 * @param {Point[]} points
 * @param {Point} inputCenter - an optional input point to sort points around
 * @returns {Point[]} the points sorted in counter clockwise order around the center-of-mass of
 *   these points, or the specified input center, starting at 12 o'clock
 */
export function sortCounterClockwise(points, inputCenter) {
  const center = inputCenter || {
    x: _.sumBy(points, 'x') / points.length,
    y: _.sumBy(points, 'y') / points.length,
  };
  return points.sort((a, b) => {
    if (a.x - center.x >= 0 && b.x - center.x < 0) return true;
    if (a.x - center.x < 0 && b.x - center.x >= 0) return false;
    if (a.x - center.x === 0 && b.x - center.x === 0) {
      if (a.y - center.y >= 0 || b.y - center.y >= 0) return a.y > b.y;
      return b.y > a.y;
    }

    // Compute the cross product of vectors (center -> a) x (center -> b)
    const det = ((a.x - center.x) * (b.y - center.y)) - ((b.x - center.x) * (a.y - center.y));
    if (det < 0) return true;
    if (det > 0) return false;

    // Points a and b are on the same line from the center
    // Check which point is closer to the center
    const d1 = ((a.x - center.x) * (a.x - center.x)) + ((a.y - center.y) * (a.y - center.y));
    const d2 = ((b.x - center.x) * (b.x - center.x)) + ((b.y - center.y) * (b.y - center.y));
    return d1 > d2;
  });
}
