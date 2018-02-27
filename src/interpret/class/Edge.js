import _ from 'lodash';

import { assert } from '../../global/utils';


export class Edge {
  constructor(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
  }


  equals(other) {
    return (this.p1.equals(other.p1) && this.p2.equals(other.p2)) ||
      (this.p1.equals(other.p2) && this.p2.equals(other.p1));
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
