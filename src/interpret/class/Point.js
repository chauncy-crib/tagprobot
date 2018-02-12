import _ from 'lodash';

import { detD } from '../interpret';

/**
 * Represents an x, y pixel location on the tagpro map. Used as vertices to define polygons.
 */
export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
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


  distance(other) {
    return Math.sqrt(this.distanceSquared(other));
  }


  distanceSquared(other) {
    const vector = this.subtract(other);
    return (vector.x ** 2) + (vector.y ** 2);
  }


  dot(other) {
    return (this.x * other.x) + (this.y * other.y);
  }


  toString() {
    return `x: ${this.x}, y: ${this.y}`;
  }
}


/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {{p1: Point, p2: Point}} e - an edge
 * @returns {boolean} if the two points are on the same side of the edge
 */
export function pointsOnSameSide(p1, p2, e) {
  return detD(e.p1, e.p2, p1) * detD(e.p1, e.p2, p2) > 0;
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


/**
 * @param {{p1: Point, p2: Point}} e1
 * @param {{p1: Point, p2: Point}} e2
 * @returns {boolean} true if the edges would lay on top of eachother if they were both extended
 *   infinitely in both directions
 */
export function areEdgesCollinear(e1, e2) {
  return threePointsInLine(e1.p1, e1.p2, e2.p1) && threePointsInLine(e1.p1, e1.p2, e2.p2);
}
