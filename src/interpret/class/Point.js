/**
 * Represents an x, y location. Used as vertices to define polygons.
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
    return JSON.stringify({ x: this.x, y: this.y });
  }


  copy() {
    return new Point(this.x, this.y);
  }
}
