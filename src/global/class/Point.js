import _ from 'lodash';


/**
 * Represents an x, y location. Used as vertices to define polygons.
 */
export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.clearancePoint = null;
  }


  fromObject(o) {
    this.x = o.x;
    this.y = o.y;
    this.clearancePoint = o.clearancePoint ? (new Point().fromObject(o.clearancePoint)) : null;
    return this;
  }


  setClearancePoint(p) {
    this.clearancePoint = p;
  }


  equals(other) {
    return this.x === other.x && this.y === other.y;
  }


  subtract(other) {
    const x = this.x - other.x;
    const y = this.y - other.y;
    return new Point(x, y);
  }


  add(other) {
    const x = this.x + other.x;
    const y = this.y + other.y;
    return new Point(x, y);
  }


  times(scalar) {
    const x = this.x * scalar;
    const y = this.y * scalar;
    return new Point(x, y);
  }


  /**
   * @returns {Point} where one of the two values is max and the ratios between x and y are the same
   *   as the initial ratio between x and y. Can be thought of as scaling a vector until its largest
   *   magnitude in one direction (x or y) is equal to max.
   */
  scaleToMax(max) {
    const ratioToScaleBy = max / _.max([Math.abs(this.x), Math.abs(this.y)]);
    return this.times(ratioToScaleBy);
  }


  distance(other) {
    return Math.sqrt(this.distanceSquared(other));
  }


  distanceSquared(other) {
    const vector = this.subtract(other);
    return (vector.x ** 2) + (vector.y ** 2);
  }


  magnitude() {
    return Math.sqrt((this.x ** 2) + (this.y ** 2));
  }


  dot(other) {
    return (this.x * other.x) + (this.y * other.y);
  }


  toString() {
    return `x: ${this.x}, y: ${this.y}`;
  }


  copy() {
    return new Point(this.x, this.y);
  }


  /**
   * @param {Edge}
   * @returns {boolean} - true if the given point is coincident with the input edge
   */
  laysOnEdge(e) {
    if (!e.isCollinearWithPoint(this)) return false;
    const d1 = this.distanceSquared(e.p1);
    const d2 = this.distanceSquared(e.p2);
    const d3 = e.p1.distanceSquared(e.p2);
    return d1 <= d3 && d2 <= d3;
  }
}
