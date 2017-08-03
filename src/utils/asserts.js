/*
 * Throws a specified error message if a condition is not met. If no message
 * is specified, then a default error message is thrown.
 *
 * condition: the condition, which, if false, will cause an error to be thrown
 * errorMessage: the error message to throw if condition is not true
 */
export function assert(condition, errorMessage = 'Assertion failed') {
  if (!condition) {
    if (typeof Error !== 'undefined') {
      throw new Error(errorMessage);
    }
    throw errorMessage;
  }
}

export function assertGridInBounds(array, x, y) {
  const width = array.length;
  const height = array[0].length;
  assert(x >= 0, `Grid out of bounds error: x<0. x=${x}`);
  assert(y >= 0, `Grid out of bounds error: y<0. y=${y}`);
  assert(x < width,
    `Grid out of bounds error: x>= width of input grid. x=${x}, width=${width}`);
  assert(y < height,
    `Grid out of bounds error: y>= height of input grid. y=${y}, height=${height}`);
}
