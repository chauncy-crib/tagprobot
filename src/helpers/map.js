import { tileTypes, PPTL, CPTL } from '../constants';
import { amBlue, amRed } from './player';
import { assert, assertGridInBounds } from '../../src/utils/asserts';


/*
 * Initializes and returns a 2D array with the specified width, height, and
 * default value.
 *
 * @param {number} width - the width of the initialized 2D array
 * @param {number} height - the height of the initialized 2D array
 * @param {number} defaultVal - the value to give each element in the initialized 2D array
 */
export function init2dArray(width, height, defaultVal = 0) {
  const matrix = [];

  for (let x = 0; x < width; x++) {
    matrix[x] = new Array(height);
    for (let y = 0; y < height; y++) {
      matrix[x][y] = defaultVal;
    }
  }

  return matrix;
}


/*
 * Returns true if tileID is traversable without consequences.
 *
 * Traversable includes: regular floor, all flags, inactive speedpad,
 *   inactive gate, friendly gate, inactive bomb, teamtiles, inactive
 *   portal, endzones
 * Untraversable includes: empty space, walls, active speedpad, any
 *   powerup, spike, button, enemy/green gate, bomb, active portal
 */
export function isTraversable(tileID) {
  switch (tileID) {
    case tileTypes.REGULAR_FLOOR:
    case tileTypes.RED_FLAG:
    case tileTypes.RED_FLAG_TAKEN:
    case tileTypes.BLUE_FLAG:
    case tileTypes.BLUE_FLAG_TAKEN:
    case tileTypes.SPEEDPAD_INACTIVE:
    case tileTypes.INACTIVE_GATE:
    case tileTypes.INACTIVE_BOMB:
    case tileTypes.RED_TEAMTILE:
    case tileTypes.BLUE_TEAMTILE:
    case tileTypes.INACTIVE_PORTAL:
    case tileTypes.SPEEDPAD_RED_INACTIVE:
    case tileTypes.SPEEDPAD_BLUE_INACTIVE:
    case tileTypes.YELLOW_FLAG:
    case tileTypes.YELLOW_FLAG_TAKEN:
    case tileTypes.RED_ENDZONE:
    case tileTypes.BLUE_ENDZONE:
    case 'blueball':
    case 'redball':
      return true;
    case tileTypes.EMPTY_SPACE:
    case tileTypes.SQUARE_WALL:
    case tileTypes.ANGLE_WALL_1:
    case tileTypes.ANGLE_WALL_2:
    case tileTypes.ANGLE_WALL_3:
    case tileTypes.ANGLE_WALL_4:
    case tileTypes.SPEEDPAD_ACTIVE:
    case tileTypes.POWERUP_SUBGROUP:
    case tileTypes.JUKEJUICE:
    case tileTypes.ROLLING_BOMB:
    case tileTypes.TAGPRO:
    case tileTypes.MAX_SPEED:
    case tileTypes.SPIKE:
    case tileTypes.BUTTON:
    case tileTypes.GREEN_GATE:
    case tileTypes.BOMB:
    case tileTypes.ACTIVE_PORTAL:
    case tileTypes.SPEEDPAD_RED_ACTIVE:
    case tileTypes.SPEEDPAD_BLUE_ACTIVE:
      return false;
    case tileTypes.RED_GATE:
      return amRed();
    case tileTypes.BLUE_GATE:
      return amBlue();
    default:
      throw new Error(`Unknown tileID: ${tileID}`);
  }
}


/*
 * Returns the radius, in pixels, of the given circular nontraversable tile ID.
 *
 * Circular nontraversable tiles include: powerups, bombs, active portals,
 *   speed boosts, spikes, and buttons
 */
export function getNonTraversableObjectRadius(tileID) {
  switch (tileID) {
    case 'marsball':
      return 39;
    case tileTypes.EMPTY_SPACE:
    case tileTypes.SQUARE_WALL:
    case tileTypes.ANGLE_WALL_1:
    case tileTypes.ANGLE_WALL_2:
    case tileTypes.ANGLE_WALL_3:
    case tileTypes.ANGLE_WALL_4:
    case tileTypes.GREEN_GATE:
    case tileTypes.RED_GATE:
    case tileTypes.BLUE_GATE:
      return 29;
      // TODO: implement functionality for non-circular objects - for now, just
      // make them circles that fill a whole tile
    case tileTypes.POWERUP_SUBGROUP:
    case tileTypes.JUKEJUICE:
    case tileTypes.ROLLING_BOMB:
    case tileTypes.TAGPRO:
    case tileTypes.MAX_SPEED:
    case tileTypes.BOMB:
    case tileTypes.ACTIVE_PORTAL:
    case tileTypes.SPEEDPAD_ACTIVE:
    case tileTypes.SPEEDPAD_RED_ACTIVE:
    case tileTypes.SPEEDPAD_BLUE_ACTIVE:
      return 15;
    case tileTypes.SPIKE:
      return 14;
    case tileTypes.BUTTON:
      return 8;
    case tileTypes.REGULAR_FLOOR:
    case tileTypes.RED_FLAG:
    case tileTypes.RED_FLAG_TAKEN:
    case tileTypes.BLUE_FLAG:
    case tileTypes.BLUE_FLAG_TAKEN:
    case tileTypes.SPEEDPAD_INACTIVE:
    case tileTypes.INACTIVE_GATE:
    case tileTypes.INACTIVE_BOMB:
    case tileTypes.RED_TEAMTILE:
    case tileTypes.BLUE_TEAMTILE:
    case tileTypes.INACTIVE_PORTAL:
    case tileTypes.SPEEDPAD_RED_INACTIVE:
    case tileTypes.SPEEDPAD_BLUE_INACTIVE:
    case tileTypes.YELLOW_FLAG:
    case tileTypes.YELLOW_FLAG_TAKEN:
    case tileTypes.RED_ENDZONE:
    case tileTypes.BLUE_ENDZONE:
    case 'blueball':
    case 'redball':
      throw new Error(`A traversable tile was given: ${tileID}`);
    default:
      throw new Error(`Unknown tileID: ${tileID}`);
  }
}


/* eslint no-param-reassign: ["error", { "ignorePropertyModificationsFor": ["bigGrid"] }] */
/*
 * place all values from smallGrid into bigGrid. Align the upper left corner at x, y
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


/* Returns a 2d cell array of traversible (1) and blocked (0) cells inside a tile.
 *
 * @param {number} tileID - the ID of the tile that should be split into cells and
 *   parsed for traversability
 */
export function getTileTraversabilityInCells(tileID) {
  // Start with all cells being traversable
  const gridTile = init2dArray(CPTL, CPTL, 1);

  if (!isTraversable(tileID)) {
    const midCell = (CPTL - 1.0) / 2.0;
    for (let i = 0; i < CPTL; i++) {
      for (let j = 0; j < CPTL; j++) {
        const xDiff = Math.max(Math.abs(i - midCell) - 0.5, 0);
        const yDiff = Math.max(Math.abs(j - midCell) - 0.5, 0);
        const cellDist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
        const ppc = PPTL / CPTL; // number of pixels per cell length
        const pixelDist = cellDist * ppc;
        if (pixelDist <= getNonTraversableObjectRadius(tileID)) {
          // This cell touches the object, is not traversable
          gridTile[i][j] = 0;
        }
      }
    }
  }
  return gridTile;
}


/*
 * Returns a 2D array of traversable (1) and blocked (0) cells. Size of return grid is
 * map.length * CPTL
 *
 * The 2D array is an array of the columns in the game. empty_tiles[0] is
 * the left-most column. Each column array is an array of the tiles in
 * that column, with 1s and 0s.  empty_tiles[0][0] is the upper-left corner
 * tile.
 *
 * @param {number} map - 2D array representing the Tagpro map
 */
export function getMapTraversabilityInCells(map) {
  const xl = map.length;
  const yl = map[0].length;
  const emptyCells = [];
  let x;
  for (x = 0; x < xl * CPTL; x++) {
    emptyCells[x] = new Array(yl * CPTL);
  }
  for (x = 0; x < xl; x++) {
    for (let y = 0; y < yl; y++) {
      // TODO: Set radius to be correct value for each cell object. Currently
      // using 29 because it is > 20 * sqrt(2), the furthest distance from the
      // center of a tile to its corner, in pixels. This guarantees that if the
      // tile has anything non-tranversable in it (wall, ball, spike, corner
      // wall), the entire tile is marked as non-traversable
      fillGridWithSubgrid(
        emptyCells,
        getTileTraversabilityInCells(map[x][y]),
        x * CPTL,
        y * CPTL,
      );
    }
  }
  return emptyCells;
}


/*
 * Returns the position (in pixels x,y and grid positions xg, yg)
 * of first of the specified tile types to appear starting in the
 * top left corner and moving in a page-reading fashion.
 *
 * @param {(number | number[])} tiles - either a number representing a tileType,
 * or an array of such numbers
 */
export function findTile(tiles) {
  // Force an array if the input is just one tile
  const tileArray = [].concat(tiles);

  for (let x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
    for (let y = 0; y < yl; y++) {
      for (let i = 0; i < tileArray.length; i++) {
        const tile = tileArray[i];
        if (tagpro.map[x][y] === tile) {
          return { x: x * PPTL, y: y * PPTL, xg: x, yg: y };
        }
      }
    }
  }
  throw new Error(`Unable to find tile: ${tiles}`);
}


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
