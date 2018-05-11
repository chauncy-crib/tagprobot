import math from 'mathjs';
import _ from 'lodash';

import { assert } from '../../global/utils';
import { Serializable } from '../../global/class/Serializable';


/**
 * A wrapper around 1D, 2D, and 3D javascript arrays which supports matrix math operations
 */
export class Matrix extends Serializable {
  /**
   * @param {number|number[]|number[][]|number[][][]} array - an array of arrays of numbers
   */
  constructor(array) {
    super();
    if (_.isNumber(array)) array = [array];
    assert(_.isArray(array), 'input to Matrix is not an array');
    this.array = array;
  }

  serialize() {
    return JSON.stringify(this.array);
  }

  static deserialize(string) {
    return new Matrix(JSON.parse(string));
  }

  isValidIndex(index) {
    return _.inRange(index, 0, this.array.length);
  }

  get(index) {
    assert(this.isValidIndex(index), `Matrix.get called with index out of bounds: ${index}`);
    return new Matrix(this.array[index]);
  }

  set(index, other) {
    assert(this.isValidIndex(index), `Matrix.set called with index out of bounds: ${index}`);
    this.array[index] = other.array;
  }

  /**
   * @param {Matrix|Array} other - matrix to append to this matrix
   * @param {0|1} [axis=0] - 0 to append matrix as a row, 1 to append matrix as a column
   */
  append(other, axis = 0) {
    const array = other instanceof Matrix ? other.array : other;
    if (axis === 0) {
      assert(
        array.length === 1 && array[0].length === this.array[0].length,
        'Matrix.append called with bad sized array',
      );
      this.array.push(array[0]);
    } else if (axis === 1) {
      assert(array.length === this.array.length, 'Matrix.append called with bad sized array');
      assert(_.isArray(array[0]), 'Matrix.append axis=1 not called with a column vector');
      _.forEach(this.array, (row, i) => row.push(array[i][0]));
    } else assert(false, 'Matrix.append called with invalid axis');
  }

  /**
   * @returns {number[]} the number of rows and columns, and depth of the matrix according to how
   *   many dimensions it has.  Takes the format [rows, columns, depth]
   */
  shape() {
    return math.size(this.array);
  }

  scalarMultiply(scalar) {
    return new Matrix(math.multiply(this.array, scalar));
  }

  /**
   * Returns the dot product of this matrix and another matrix.  Equivalent to matrix multiplication
   *   for 2D arrays, and inner product of vectors for 1D arrays.
   */
  dot(other) {
    return new Matrix(math.multiply(this.array, other.array));
  }

  add(other) {
    return new Matrix(math.add(this.array, other.array));
  }

  subtract(other) {
    return new Matrix(math.subtract(this.array, other.array));
  }

  inverse() {
    return new Matrix(math.inv(this.array));
  }

  transpose() {
    return new Matrix(math.transpose(this.array));
  }

  equals(other) {
    if (!other) return false;
    return math.deepEqual(this.array, other.array);
  }
}
