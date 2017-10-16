import { init2dArray, fillGridWithSubgrid } from './map';
import { assert, assertGridInBounds } from '../utils/asserts';


/**
 * Returns the sum of all corresponding elements from two matrices being
 *   multiplied together. For example:
 *     a = 1 2   b = 4 1
 *         3 4       2 3
 *     multiplyCorrespondingElementsAndSum(a, b)
 *     (1*4) + (2*1) + (3*2) + (4*3) = 21
 * @param {number[][]} m1 - the first matrix
 * @param {number[][]} m2 - the second matrix (of the same dimensions as m1)
 */
export function multiplyCorrespondingElementsAndSum(m1, m2) {
  assert(
    m1.length === m2.length,
    `m1 and m2 are not the same width, ${m1.length} and ${m2.length}`,
  );
  assert(
    m1[0].length === m2[0].length,
    `m1 and m2 are not the same height, ${m1[0].length} and ${m2[0].length}`,
  );

  const mWidth = m1.length;
  const mHeight = m1[0].length;
  let sum = 0;

  for (let x = 0; x < mWidth; x++) {
    for (let y = 0; y < mHeight; y++) {
      sum += m1[x][y] * m2[x][y];
    }
  }
  return sum;
}


/* Returns a matrix with a buffer applied around its perimeter. Example:
 *   Take the element values of the matrix and apply a bufSize perimeter
 *   of value bufVal.
 *     mWithBuf = 1 2 3   bufSize = 2   mWithBuf = 1 1 1 1 1 1 1
 *                4 5 6                            1 1 1 1 1 1 1
 *                7 8 9   bufVal = 1               1 1 1 2 3 1 1
 *                                                 1 1 4 5 6 1 1
 *                                                 1 1 7 8 9 1 1
 *                                                 1 1 1 1 1 1 1
 *                                                 1 1 1 1 1 1 1
 * @param {number[][]} m - a 2D array, which will have a buffer added around its perimeter
 * @param {number} bufSize - the size of buffer to add around the matrix
 * @param {number} bufVal - the value to fill the buffer with
 */
export function addBufferTo2dArray(m, bufSize, bufVal) {
  const mWidth = m.length;
  const mHeight = m[0].length;
  const mWithBufWidth = mWidth + (bufSize * 2);
  const mWithBufHeight = mHeight + (bufSize * 2);

  // Create a grid with matrix's values and a bufSize perimeter of zeros
  const mWithBuf = init2dArray(mWithBufWidth, mWithBufHeight, bufVal);
  fillGridWithSubgrid(mWithBuf, m, bufSize, bufSize);

  return mWithBuf;
}


/**
 * Returns a specified section from a 2D array.
 * @param {number[][]} array - the 2D array to get the subarray from
 * @param {number} xMin - the left-most index of the desired subarray
 * @param {number} yMin - the top-most index of the desired subarray
 * @param {number} xMax - the right-most index of the desired subarray
 * @param {number} yMax - the bottom-most index of the desired subarray
 */
export function getSubarrayFrom2dArray(array, xMin, yMin, xMax, yMax) {
  assertGridInBounds(array, xMin, yMin);
  assertGridInBounds(array, xMax, yMax);

  const width = (xMax - xMin) + 1;
  const height = (yMax - yMin) + 1;
  const initVal = 0;
  const subarray = init2dArray(width, height, initVal);
  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      subarray[x - xMin][y - yMin] = array[x][y];
    }
  }
  return subarray;
}


/**
 * Returns a 2D array that is the result of the convolution of m and k.
 * @param {number[][]} m - the first 2D array in the convolution
 * @param {number[][]} k - the second 2D array in the convolution, also called
 *   the kernel (must have sides of equal length and the sides must have an odd
 *   length)
 */
export function convolve(m, k) {
  const kWidth = k.length;
  const kHeight = k[0].length;
  assert(kWidth === kHeight, 'kernel\'s width is not equal to its height');
  assert(kWidth % 2 === 1, 'kernel\'s width is not odd');

  const mWidth = m.length;
  const mHeight = m[0].length;
  const kSize = kWidth;
  assert(
    kSize <= mWidth && kSize <= mHeight,
    'kernel size is larger than either matrix width or matrix height',
  );
  const bufSize = (kSize - 1) / 2;
  const bufVal = 1;
  const mWithBuf = addBufferTo2dArray(m, bufSize, bufVal);

  let mSubarray;
  const halfKWidth = (kWidth - 1) / 2;
  const convolution = init2dArray(mWidth, mHeight, 0);
  for (let x = 0; x < mWidth; x++) {
    for (let y = 0; y < mHeight; y++) {
      mSubarray = getSubarrayFrom2dArray(
        mWithBuf,
        (x + bufSize) - halfKWidth,
        (y + bufSize) - halfKWidth,
        (x + bufSize) + halfKWidth,
        (y + bufSize) + halfKWidth,
      );
      convolution[x][y] = multiplyCorrespondingElementsAndSum(mSubarray, k);
    }
  }
  return convolution;
}


/**
 * @param {number[][]} m - a binary 2d array to be inverted
 * @returns {number[][]} the original m, but with 0 and 1 values switched
 */
export function invertBinary2dArray(m) {
  const width = m.length;
  const height = m[0].length;
  const invertedM = init2dArray(width, height, null);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const currVal = m[x][y];
      assert(currVal === 0 || currVal === 1, `a non binary value found in matrix: ${m[x][y]}`);
      invertedM[x][y] = 1 - currVal;
    }
  }
  return invertedM;
}


/**
 * Adds a buffer around all nontraversable cells in the given 2D array. The given parameters are
 *   inverted such that traversable is 0 and nontraversable is 1. This makes the math easier, then
 *   the resulting 2D array is inverted again to undo the original inversion.
 * @param {number[][]} m - the matrix that will have the kernel applied to it
 * @param {number[][]} k - the kernel that will be applied to the matrix
 * @returns {number[][]} the result of convolving m and k, then truncating
 *   any nontraversable values to 0
 */
export function addNTBuffer(m, k) {
  assert(k.length === k[0].length, 'the kernel is not square');

  const convolution = convolve(invertBinary2dArray(m), invertBinary2dArray(k));
  const width = convolution.length;
  const height = convolution[0].length;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (convolution[x][y] > 0) {
        convolution[x][y] = 1;
      }
    }
  }
  return invertBinary2dArray(convolution);
}
