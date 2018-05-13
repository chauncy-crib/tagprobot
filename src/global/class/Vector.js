import _ from 'lodash';


export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }


  angle() {
    return Math.atan2(this.y, this.x);
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
}
