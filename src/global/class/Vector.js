import _ from 'lodash';

import { assert, wrapRadians } from '../utils';
import { Point } from './Point';
import { Edge } from './Edge';


export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }


  angle() {
    return Math.atan2(this.y, this.x);
  }


  /**
   * @returns {number|null} the slope of the vector, null if x is zero
   */
  slope() {
    assert(!this.magnitude === 0, 'Cannot calculate the slope of a vector with zero magnitude');
    if (this.x === 0) return null;
    if (this.y === 0) return 0; // return an unsigned 0
    return this.y / this.x;
  }


  magnitude() {
    return Math.sqrt((this.x ** 2) + (this.y ** 2));
  }


  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }


  subtract(other) {
    return new Vector(other.x - this.x, other.y - this.y);
  }


  scale(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }


  /**
   * @returns {Vector} where one of the two values is max and the ratios between x and y are the
   *   same as the initial ratio between x and y. Can be thought of as scaling a vector until its
   *   largest magnitude in one direction (x or y) is equal to max.
   */
  scaleToMax(max) {
    const ratioToScaleBy = max / _.max([Math.abs(this.x), Math.abs(this.y)]);
    return this.scale(ratioToScaleBy);
  }


  /**
   * @param {Point} [p=new Point(0, 0)] the point to project the vector from
   * @returns {Point} the end point of the vector when its base starts at p
   */
  getTip(p = new Point(0, 0)) {
    return new Point(p.x + this.x, p.y + this.y);
  }


  /**
   * @param {number} l - length that the returned Edge should be
   * @param {Point} [p=new Point(0, 0)] - point to place the base of the vector at
   */
  getPerpendicularEdgeBisectedByTip(l, p = new Point(0, 0)) {
    const mid = this.getTip(p);
    const angle = wrapRadians(this.angle() + (Math.PI / 2));
    const halfL = l / 2;
    const p1 = new Point(mid.x + (halfL * Math.cos(angle)), mid.y + (halfL * Math.sin(angle)));
    const p2 = new Point(mid.x - (halfL * Math.cos(angle)), mid.y - (halfL * Math.sin(angle)));
    return new Edge(p1, p2);
  }


  /**
   * @param {number} l - distance past the tip of the vector
   * @param {Point} [p=new Point(0, 0)] - point to place the base of the vector at
   * @returns {Point} point distance l past the tip of the vector
   */
  getExtensionPoint(l, p = new Point(0, 0)) {
    const tip = this.getTip(p);
    const angle = this.angle();
    return new Point(tip.x + (l * Math.cos(angle)), tip.y + (l * Math.sin(angle)));
  }
}
