import math from 'mathjs';


/**
 * A wrapper around 2D javascript arrays which supports matrix math operations
 */
export class Matrix {
  /**
   * @param {number[][]} array - an array of arrays of numbers
   */
  constructor(array) {
    this.array = array;
  }

  get(index) {
    return this.array[index];
  }

  /**
   * Returns the dot product of this matrix and another matrix.  Equivalent to matrix multiplication
   *   for 2D arrays, and inner product of vectors for 1D arrays.
   */
  dot(other) {
    return math.multiply(this.array, other.array);
  }

  add(other) {
    return math.add(this.array, other.array);
  }

  subtract(other) {
    return math.subtract(this.array, other.array);
  }

  inverse() {
    return math.inv(this.array);
  }
}
