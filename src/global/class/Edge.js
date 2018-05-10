import _ from 'lodash';

import { Point } from './Point';
import { assert } from '../utils';
import { detD, threePointsInLine } from '../../interpret/utils';


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
   * @param {Point} p
   * @returns {number} the distance from p to the closest point on this edge
   */
  distToPoint(p) {
    const projPoint = this.getProjectedPoint(p);
    if (projPoint.laysOnEdge(this)) return projPoint.distance(p);
    return Math.min(p.distance(this.p1), p.distance(this.p2));
  }

  /**
   * @param {Point} p
   * @returns {Point} a point, projPoint, which is collinear with this edge. The edge formed by
   *   projPoint and p is normal to this edge.
   */
  getProjectedPoint(p) {
    if (this.isCollinearWithPoint(p)) return p;
    const b = this.getSlope();
    if (b === 0) return new Point(p.x, this.p1.y);
    if (_.isNull(b)) return new Point(this.p1.x, p.y);
    const projY = ((b * (((b * p.y) + p.x) - this.p2.x)) + this.p2.y) / (1 + (b * b));
    const projX = (b * (p.y - projY)) + p.x;
    return new Point(projX, projY);
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
   * @param {Edge} e
   * @returns {boolean} true if the other edge is collinear with this edge, and if one of either
   *   this edge or e's points lays on top of the other edge
   */
  overlapsEdge(e) {
    return this.isCollinearWithEdge(e) && (
      e.p1.laysOnEdge(this) ||
      e.p2.laysOnEdge(this) ||
      this.p1.laysOnEdge(e) ||
      this.p2.laysOnEdge(e)
    );
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
