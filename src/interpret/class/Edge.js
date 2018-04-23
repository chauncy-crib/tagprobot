import _ from 'lodash';

import { assert } from '../../global/utils';
import { detD, threePointsInLine } from '../utils';


export class Edge {
  /**
   * Store p1 as the left-most point, unless they have the same x, in which case store p1 as the
   *   top-most point.
   */
  constructor(p1, p2) {
    if (p1.x > p2.x || (p1.x === p2.x && p1.y > p2.y)) {
      this.p1 = p2;
      this.p2 = p1;
      return;
    }
    this.p1 = p1;
    this.p2 = p2;
  }


  hasPoint(p) {
    return this.p1.equals(p) || this.p2.equals(p);
  }


  equals(other) {
    return this.p1.equals(other.p1) && this.p2.equals(other.p2);
  }


  toString() {
    return `p1: ${this.p1.toString()}, p2: ${this.p2.toString()}`;
  }


  /**
   * @param {Edge} other
   * @returns {boolean} true if the edges would lay on top of eachother if they were both extended
   *   infinitely in both directions
   */
  isCollinearWithEdge(other) {
    return this.isCollinearWithPoint(other.p1) && this.isCollinearWithPoint(other.p2);
  }


  /**
   * @param {Point} p
   * @returns {boolean} true if the point would lay on the infinite extension of this edge
   */
  isCollinearWithPoint(p) {
    return threePointsInLine(this.p1, this.p2, p);
  }


  /**
   * @param {Point} p1
   * @param {Point} p2
   * @param {boolean} strict - true if this function should return false if one (or both) of the
   *   points is collinear with the edge
   * @returns {boolean} true if an infinite extension of the edge is between the two points, or if
   *   strict=false and one (or both) of the points is collinear with the edge
   */
  isBetweenPoints(p1, p2, strict = true) {
    const res = detD(this.p1, this.p2, p1) * detD(this.p1, this.p2, p2);
    return strict ? res < 0 : res <= 0;
  }


  /**
   * @returns {number|null} the slope of the line between the edge's two points, null if the points
   *   have the same x coordinate
   */
  getSlope() {
    assert(!this.p1.equals(this.p2), 'Cannot calculate the slope between two equal points');
    if (this.p1.x === this.p2.x) return null;
    if (this.p1.y === this.p2.y) return 0; // return an unsigned 0
    return (this.p1.y - this.p2.y) / (this.p1.x - this.p2.x);
  }


  /**
   * @returns {number} the y-intercept of the edge's two points, unless they share an x-coordinate.
   *   In this case, return their x-coordinate
   */
  getIntercept() {
    const m = this.getSlope();
    if (_.isNull(m)) return this.p1.x;
    const b = this.p1.y - (m * this.p1.x);
    if (b === 0) return 0; // return an unsigned 0
    return b;
  }
}
