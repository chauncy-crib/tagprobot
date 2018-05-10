import _ from 'lodash';


const startTime = Date.now(); // time when script started, in milliseconds
const timings = {}; // stores timing information for calculating computational time of processes


/**
 * Throws a specified error message if a condition is not met. If no message
 *   is specified, then a default error message is thrown.
 * @param {boolean} condition - the condition, which, if false, will cause an error to be thrown
 * @param {string|undefined} errorMessage - the error message to throw if condition is not true
 */
export function assert(condition, errorMessage = 'Assertion failed') {
  if (!condition) {
    if (typeof Error !== 'undefined') {
      throw new Error(errorMessage);
    }
    throw errorMessage;
  }
}


export function assertGridInBounds(grid, x, y) {
  const width = grid.length;
  const height = grid[0].length;
  assert(x >= 0, `Grid out of bounds error: x<0. x=${x}, grid is ${width} by ${height}`);
  assert(y >= 0, `Grid out of bounds error: y<0. y=${y}, grid is ${width} by ${height}`);
  assert(
    x < width,
    `Grid out of bounds error: x>= width of input grid. x=${x}, width=${width}`,
  );
  assert(
    y < height,
    `Grid out of bounds error: y>= height of input grid. y=${y}, height=${height}`,
  );
}


/**
 * A less strict version of the assert function above. Sends the specified error message to the
 *   console if the condition is not true.
 * @param {boolean} condition - the condition, which, if false, will log an error message to the
 *   console
 * @param {string|undefined} errorMessage - the error message sent to the console if condition is
 *   not true
 */
export function prefer(condition, errorMessage = 'Preference not met') {
  if (!condition) console.error(errorMessage);
}


export function isRoughly(val, expected, threshold = 0.01) {
  return Math.abs(val - expected) <= threshold;
}


export function boundValue(value, lowerBound, upperBound) {
  return Math.max(lowerBound, Math.min(upperBound, value));
}


export function determinant(matrix) {
  const N = matrix.length;
  for (let i = 0; i < N; i += 1) {
    assert(matrix[i].length === N, 'input matrix should be NxN');
  }
  let sum = 0;
  // Recursive base-case, a single element
  if (N === 1) return matrix[0][0];
  for (let j = 0; j < N; j += 1) {
    // Create a sub-matrix which do not contain elements in the 0th row or the jth column
    const subMatrix = [];
    for (let k = 1; k < N; k += 1) {
      const row = [];
      for (let l = 0; l < N; l += 1) {
        if (l !== j) row.push(matrix[k][l]);
      }
      subMatrix.push(row);
    }
    // Alternate between +/- the determinant of the sub-matrix
    sum += ((j % 2) ? -1 : 1) * matrix[0][j] * determinant(subMatrix);
  }
  return sum;
}


/*
 * @param {number} millisTime - a time in milliseconds
 * @returns {string} the number of seconds since millisTime with 3 decimal places
 */
function secondsSince(millisTime) {
  return (Date.now() - millisTime) / 1000;
}


/*
 * Sends a time stamped message to the info stream of the console
 */
export function timeLog(message) {
  console.info(`${secondsSince(startTime).toFixed(3)}: ${message}`);
}


export function startTiming(processName) {
  if (_.isUndefined(timings[processName])) timings[processName] = {};
  assert(
    _.isNil(timings[processName].start),
    `tried to start timing a process that was already being timed: ${processName}`,
  );
  timings[processName].start = Date.now();
}


export function stopTiming(processName) {
  assert(
    !_.isNil(timings[processName].start),
    `tried to stop timing a process that is not being timed: ${processName}`,
  );
  if (_.isUndefined(timings[processName].times)) timings[processName].times = [];
  const runningAverageLength = 60;
  if (timings[processName].times.length === runningAverageLength) {
    timings[processName].times.shift();
  }
  timings[processName].times.push(secondsSince(timings[processName].start));
  timings[processName].start = null;
}


export function logTimingsReport() {
  let totalTime = 0;
  _.forEach(_.keys(timings), processName => {
    timings[processName].time = _.mean(timings[processName].times);
    totalTime += timings[processName].time;
  });
  console.info(`Timings Report: (${totalTime})`);
  _.forEach(_.sortBy(_.keys(timings), processName => -timings[processName].time), processName => {
    console.info(`  ${processName}: ${timings[processName].time.toFixed(6)}`);
  });
}
