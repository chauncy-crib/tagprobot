import _ from 'lodash';

import { assert } from '../global/utils';
import { Point, threePointsInLine, pointsOnSameSide } from './point';
import { Polypoint } from './polypoint';


export class Triangle {
  constructor(p1, p2, p3, checkEmpty = true) {
    assert(
      !(checkEmpty && threePointsInLine(p1, p2, p3)),
      'Tried to make a triangle with no area',
    );
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
  }


  /**
   * @returns {Polypoint} the center point of the triangle
   */
  getCenter() {
    return new Polypoint(
      Math.round((this.p1.x + this.p2.x + this.p3.x) / 3),
      Math.round((this.p1.y + this.p2.y + this.p3.y) / 3),
      this,
    );
  }


  getEdgeCenters() {
    return [
      new Point((this.p1.x + this.p2.x) / 2, (this.p1.y + this.p2.y) / 2),
      new Point((this.p2.x + this.p3.x) / 2, (this.p2.y + this.p3.y) / 2),
      new Point((this.p1.x + this.p3.x) / 2, (this.p1.y + this.p3.y) / 2),
    ];
  }


  getPoints() {
    return [this.p1, this.p2, this.p3];
  }


  /**
   * @param {Triangle} other
   * @returns {{shared: Point[], unique: Point[]}} shared contains all points which appear in both
   *   triangles, unique has all points contained in exactly one of the triangles
   */
  categorizePoints(other) {
    const shared = _.intersectionBy(this.getPoints(), other.getPoints(), p => p.toString());
    const allPoints = this.getPoints().concat(other.getPoints());
    const unique = _.reject(allPoints, p => _.some(shared, s => s.equals(p)));
    return { shared, unique };
  }


  equals(other) {
    const points1 = [this.p1, this.p2, this.p3];
    const points2 = [other.p1, other.p2, other.p3];
    // Return if p1 in points1 has some p2 in points2 where p2.equals(p1)
    return _.every(points1, p1 => _.some(points2, p2 => p2.equals(p1)));
  }


  hasPoint(p) {
    return p.equals(this.p1) || p.equals(this.p2) || p.equals(this.p3);
  }

  hasEdge(e) {
    return this.hasPoint(e.p1) && this.hasPoint(e.p2);
  }


  toString() {
    return JSON.stringify({ p1: this.p1, p2: this.p2, p3: this.p3 });
  }
}


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

    assert(!_.isNil(nextT), 'Could not find triangle containing both last upper and last lower');

    // Add points to upperPoints and lowerPoints
    if (upperPoints.length === 1) {
      // This is the first triangle, add one point to upper polygon and the other to lower
      const newPoints = _.reject(nextT.getPoints(), p => p.equals(lastUpperPoint));
      upperPoints.push(newPoints[0]);
      lowerPoints.push(newPoints[1]);
    } else {
      // Get the third point that's not in either pseudo-polygon
      const newPoint = _.find(nextT.getPoints(), p => (
        !p.equals(lastUpperPoint) && !p.equals(lastLowerPoint)
      ));

      if (newPoint.equals(e.p2)) {
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
 * @param {Triangle} t
 * @param {{p1: Point, p2: Point}} e - an edge
 * @returns {boolean} if the triangle intersects or touches the edge
 */
export function isTriangleIntersectingEdge(t, e) {
  const e1 = e.p1;
  const e2 = e.p2;
  const t1 = t.p1;
  const t2 = t.p2;
  const t3 = t.p3;

  // False if t1, t2, and t3 are all on same side of e
  if (pointsOnSameSide(t1, t2, e) && pointsOnSameSide(t2, t3, e)) return false;

  // False if e1 and e2 are both on other side of t1-t2 as t3
  const t12 = { p1: t1, p2: t2 }; // edge between t1 and t2
  if (!pointsOnSameSide(e1, t3, t12) && !pointsOnSameSide(e2, t3, t12)) return false;

  // False if e1 and e2 are both on other side of t2-t3 as t1
  const t23 = { p1: t2, p2: t3 }; // edge between t2 and t3
  if (!pointsOnSameSide(e1, t1, t23) && !pointsOnSameSide(e2, t1, t23)) return false;

  // False if e1 and e2 are both on other side of t3-t1 as t2
  const t31 = { p1: t3, p2: t1 }; // edge between t3 and t1
  if (!pointsOnSameSide(e1, t2, t31) && !pointsOnSameSide(e2, t2, t31)) return false;

  return true;
}
