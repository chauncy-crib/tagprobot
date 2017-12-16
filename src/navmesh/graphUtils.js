import _ from 'lodash';
import { Point, pointsOnSameSide } from './graph';
import { assert } from '../utils/asserts';

const CLEARANCE = 19;


/**
 * @param {Triangle[]} intersectingTriangles - array of triangles that intersect the edge
 * @param {{p1: Point, p2: Point}} e - the edge
 * @returns {{upperPoints: Point[], lowerPoints: Point[]}} the ordered points of the upper and lower
 *   regions that share the edge
 */
export function findUpperAndLowerPoints(intersectingTriangles, e) {
  let triangles = intersectingTriangles;
  // Keep track of the points in order in the regions above and below the edge
  const upperPoints = [e.p1];
  const lowerPoints = [e.p1];

  while (!_.isEmpty(triangles)) {
    const lastUpperPoint = _.last(upperPoints);
    const lastLowerPoint = _.last(lowerPoints);

    // Find next triangle
    const nextT = _.find(triangles, t => (
      t.hasPoint(lastUpperPoint) && t.hasPoint(lastLowerPoint)
    ));

    // Add points to upperPoints and lowerPoints
    if (upperPoints.length === 1) {
      // This is the first triangle, add one point to upper polygon and the other to lower
      const newPoints = _.reject(nextT.getPoints(), p => p.equal(lastUpperPoint));
      upperPoints.push(newPoints[0]);
      lowerPoints.push(newPoints[1]);
    } else {
      // Get the third point that's not in either pseudo-polygon
      const newPoint = _.find(nextT.getPoints(), p => (
        !p.equal(lastUpperPoint) && !p.equal(lastLowerPoint)
      ));

      if (newPoint.equal(e.p2)) {
        // This is the last point, add it to both regions
        upperPoints.push(newPoint);
        lowerPoints.push(newPoint);
      } else {
        // Push point to either upper or lower region
        if (pointsOnSameSide(newPoint, lastUpperPoint, e)) upperPoints.push(newPoint);
        else lowerPoints.push(newPoint);
      }
    }

    // Remove triangle and edges from graph and from triangles
    triangles = _.reject(triangles, nextT);
  }
  return { upperPoints, lowerPoints };
}


/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 * @returns {boolean} true if all points are colinear
 */
export function threePointsInLine(p1, p2, p3) {
  if (p1.equal(p2) || p1.equal(p3) || p2.equal(p3)) return true;
  const x1 = p2.x - p1.x;
  const x2 = p2.x - p3.x;
  const y1 = p2.y - p1.y;
  const y2 = p2.y - p3.y;
  if (x1 === 0 || x2 === 0) {
    return x1 === x2;
  }
  // Use line slopes to calculate if all three points are in a line
  return y1 * x2 === y2 * x1;
}


/**
 * @param {Point} cornerPoint - the point on the corner that needs clearance
 * @param {Point} prevPoint - the previous point on the corner
 * @param {Point} nextPoint - the next point on the corner
 * @returns {Point} a point that is CLEARANCE away from the cornerPoint in the corner's normal
 *   direction
 */
export function getClearancePoint(cornerPoint, prevPoint, nextPoint) {
  const nextAngle = Math.atan2(
    nextPoint.y - cornerPoint.y,
    nextPoint.x - cornerPoint.x,
  );
  const prevAngle = Math.atan2(
    prevPoint.y - cornerPoint.y,
    prevPoint.x - cornerPoint.x,
  );

  // Minimum distance between angles
  let distance = nextAngle - prevAngle;
  if (Math.abs(distance) > Math.PI) distance -= Math.PI * (distance > 0 ? 2 : -2);

  // Calculate perpendicular to average angle
  const angle = prevAngle + (distance / 2) + (Math.PI);

  const normal = new Point(Math.cos(angle), Math.sin(angle));

  // Insert other point to path
  return cornerPoint.add(normal.times(CLEARANCE));
}


export function determinant(matrix) {
  const N = matrix.length;
  for (let i = 0; i < N; i += 1) {
    assert(matrix[i].length === N, 'input matrix should be NxN');
  }
  let sum = 0;
  // Recursive base-case, a single element
  if (N === 1) return matrix[0][0];
  for (let j = 0; j < N; j += 1) {
    // Create a sub-matrix which do not contain elements in the 0th row or the jth column
    const subMatrix = [];
    for (let k = 1; k < N; k += 1) {
      const row = [];
      for (let l = 0; l < N; l += 1) {
        if (l !== j) row.push(matrix[k][l]);
      }
      subMatrix.push(row);
    }
    // Alternate between +/- the determinant of the sub-matrix
    sum += ((j % 2) ? -1 : 1) * matrix[0][j] * determinant(subMatrix);
  }
  return sum;
}


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
