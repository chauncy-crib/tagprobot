import _ from 'lodash';

import { assert } from '../../global/utils';
import { threePointsInLine } from '../utils';
import { Point } from './Point';
import { Polypoint } from './Polypoint';
import { Edge } from './Edge';


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


  /**
   * @param {Edge} e
   * @returns {boolean} if the triangle intersects or touches the edge
   */
  intersectsEdge(e) {
    // False if this.p1, this.p2, and this.p3 are all on same side of e
    if (!e.isBetweenPoints(this.p1, this.p2) && !e.isBetweenPoints(this.p2, this.p3)) {
      return false;
    }

    // False if e.p1 and e.p2 are both on other side of this.p1-this.p2 as this.p3
    const t12 = new Edge(this.p1, this.p2);
    if (t12.isBetweenPoints(e.p1, this.p3) && t12.isBetweenPoints(e.p2, this.p3)) {
      return false;
    }

    // False if e.p1 and e.p2 are both on other side of this.p2-this.p3 as this.p1
    const t23 = new Edge(this.p2, this.p3);
    if (t23.isBetweenPoints(e.p1, this.p1) && t23.isBetweenPoints(e.p2, this.p1)) {
      return false;
    }

    // False if e.p1 and e.p2 are both on other side of this.p3-this.p1 as this.p2
    const t31 = new Edge(this.p3, this.p1);
    if (t31.isBetweenPoints(e.p1, this.p2) && t31.isBetweenPoints(e.p2, this.p2)) {
      return false;
    }

    return true;
  }


  containsPoint(p) {
    // Compute vectors
    const v0 = this.p3.subtract(this.p1);
    const v1 = this.p2.subtract(this.p1);
    const v2 = p.subtract(this.p1);

    // Compute dot products
    const dot00 = v0.dot(v0);
    const dot01 = v0.dot(v1);
    const dot02 = v0.dot(v2);
    const dot11 = v1.dot(v1);
    const dot12 = v1.dot(v2);

    // Compute barycentric coordinates
    const invDenom = 1 / ((dot00 * dot11) - (dot01 * dot01));
    const u = ((dot11 * dot02) - (dot01 * dot12)) * invDenom;
    const v = ((dot00 * dot12) - (dot01 * dot02)) * invDenom;

    // Check if point is inside or on edge of triangle
    return (u >= 0) && (v >= 0) && (u + v <= 1);
  }


  toString() {
    return JSON.stringify({ p1: this.p1, p2: this.p2, p3: this.p3 });
  }
}
