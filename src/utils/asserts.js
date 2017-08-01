/*
 * Throws a specified error message if a condition is not met. If no message
 * is specified, then a default error message is thrown.
 *
 * condition: the condition, which, if false, will cause an error to be thrown
 * errorMessage: the error message to throw if condition is not true
 */
export default function assert(condition, errorMessage = 'Assertion failed') {
  if (!condition) {
    if (typeof Error !== 'undefined') {
      throw new Error(errorMessage);
    }
    throw errorMessage;
  }
}
