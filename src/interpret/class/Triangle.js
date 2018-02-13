import _ from 'lodash';

import { assert } from '../../global/utils';
import { threePointsInLine } from '../utils';
import { Point } from './Point';
import { Polypoint } from './Polypoint';


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
