import _ from 'lodash';
import { assertGridInBounds } from '../utils/asserts';


export function gridInBounds(grid, x, y) {
  if (x < 0 || x >= grid.length) return false;
  if (y < 0 || y >= grid[0].length) return false;
  return true;
}


export function oddNumberOfTrue(booleans) {
  return _.sumBy(booleans, b => (b ? 1 : 0)) % 2 === 1;
}


/**
 * Initializes and returns a 2D array with the specified width, height, and
 *   default value. Runtime: O(width * height)
 * @param {number} width - the width of the initialized 2D array
 * @param {number} height - the height of the initialized 2D array
 * @param {number} defaultVal - the value to give each element in the initialized 2D array
 */
export function init2dArray(width, height, defaultVal = 0, inputMatrix = undefined) {
  let matrix = inputMatrix;
  if (!matrix) {
    matrix = [];
  }
  for (let x = 0; x < width; x++) {
    matrix[x] = new Array(height);
    for (let y = 0; y < height; y++) {
      matrix[x][y] = defaultVal;
    }
  }
  return matrix;
}


/**
 * Place all values from smallGrid into bigGrid. Align the upper left corner at x, y.
 */
export function fillGridWithSubgrid(bigGrid, smallGrid, x, y) {
  const smallGridWidth = smallGrid.length;
  const smallGridHeight = smallGrid[0].length;
  assertGridInBounds(bigGrid, x, y);
  assertGridInBounds(bigGrid, (x + smallGridWidth) - 1, (y + smallGridHeight) - 1);

  for (let i = 0; i < smallGridWidth; i++) {
    for (let j = 0; j < smallGridHeight; j++) {
      bigGrid[i + x][j + y] = smallGrid[i][j];
    }
  }
}
