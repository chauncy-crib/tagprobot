import { init2dArray, fillGridWithSubgrid } from './map';
import { assert } from '../../src/utils/asserts';

/*
 * Returns the sum of all corresponding elements from two matrices being
 * multiplied together. For example:
 *   a = 1 2   b = 4 1
 *       3 4       2 3
 *   multiplyCorrespondingElementsAndSum(a, b)
 *   (1*4) + (2*1) + (3*2) + (4*3) = 21
 *
 * @param {number[][]} m1 - the first matrix
 * @param {number[][]} m2 - the second matrix (of the same dimensions as m1)
 */
export function multiplyCorrespondingElementsAndSum(m1, m2) {
  assert(
    m1.length === m2.length,
    'multiplyCorrespondingElementsAndSum: m1 and m2 are not the same width',
  );
  assert(
    m1[0].length === m2[0].length,
    'multiplyCorrespondingElementsAndSum: m1 and m2 are not the same height',
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
 *
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


/*
 * Returns a specified section from a 2D array.
 *
 * @param {number[][]} array - the 2D array to get the subarray from
 * @param {number} xCenter - the x index of the center of the subarray
 * @param {number} yCenter - the y index of the center of the subarray
 * @param {number} width - the width of the subarray (must be an odd number)
 * @param {number} height - the height of the subarray (must be an odd number)
 */
export function getSubarrayFrom2dArray(array, xCenter, yCenter, width, height) {
  assert(width % 2 === 1, 'getSubarrayFrom2dArray: width is not odd');
  assert(height % 2 === 1, 'getSubarrayFrom2dArray: height is not odd');

  const halfWidth = (width - 1) / 2;
  const halfHeight = (height - 1) / 2;
  const leftEdge = xCenter - halfWidth;
  const rightEdge = xCenter + halfWidth;
  const topEdge = yCenter - halfHeight;
  const botEdge = yCenter + halfHeight;

  const initVal = 0;
  const subarray = init2dArray(width, height, initVal);
  for (let x = leftEdge; x <= rightEdge; x++) {
    for (let y = topEdge; y <= botEdge; y++) {
      subarray[x - leftEdge][y - topEdge] = array[x][y];
    }
  }

  return subarray;
}


/*
 * Returns a 2D array that is the result of the convolution of m and k.
 *
 * @param {number[][]} m - the first 2D array in the convolution
 * @param {number[][]} k - the second 2D array in the convolution, also called the kernel (must
 *   have sides of equal length and the sides must have an odd length)
 */
export function convolve(m, k) {
  const kWidth = k.length;
  const kHeight = k[0].length;
  assert(kWidth === kHeight, 'convolve: kernel\'s width is not equal to kernel\'s height');
  assert(kWidth % 2 === 1, 'convolve: kernel\'s width is not odd');

  const mWidth = m.length;
  const mHeight = m[0].length;
  const kSize = kWidth;
  assert(kSize <= mWidth && kSize <= mHeight,
    'kernal size is larger than either matrix width or matrix height');
  const bufSize = (kSize - 1) / 2;
  const bufVal = 1;
  const mWithBuf = addBufferTo2dArray(m, bufSize, bufVal);

  let mSubarray = init2dArray(kSize, kSize, 0);
  const convolution = init2dArray(mWidth, mHeight, 0);
  for (let x = 0; x < mWidth; x++) {
    for (let y = 0; y < mHeight; y++) {
      mSubarray = getSubarrayFrom2dArray(mWithBuf, x + bufSize, y + bufSize, kWidth, kWidth);
      convolution[x][y] = multiplyCorrespondingElementsAndSum(mSubarray, k);
    }
  }

  return convolution;
}
