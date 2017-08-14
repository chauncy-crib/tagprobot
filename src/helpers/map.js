import { PPTL, CPTL, PPCL } from '../constants';
import { assertGridInBounds } from '../utils/asserts';
import { getTileProperty, isTileType } from '../tiles';


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

  if (!getTileProperty(tileID, 'traversable')) { // tile is not fully traversable
    const midCell = (CPTL - 1.0) / 2.0;
    for (let i = 0; i < CPTL; i++) {
      for (let j = 0; j < CPTL; j++) {
        if (getTileProperty(tileID, 'radius')) {
          const xDiff = Math.max(Math.abs(i - midCell) - 0.5, 0);
          const yDiff = Math.max(Math.abs(j - midCell) - 0.5, 0);
          const cellDist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
          const pixelDist = cellDist * PPCL;
          if (pixelDist <= getTileProperty(tileID, 'radius')) {
            gridTile[i][j] = 0;
          } // tile is noncircular and nontraversable
        } else if (isTileType(tileID, 'ANGLE_WALL_1')) {
          if (j - i >= 0) {
            gridTile[i][j] = 0;
          }
        } else if (isTileType(tileID, 'ANGLE_WALL_2')) {
          if (i + j <= CPTL - 1) {
            gridTile[i][j] = 0;
          }
        } else if (isTileType(tileID, 'ANGLE_WALL_3')) {
          if (j - i <= 0) {
            gridTile[i][j] = 0;
          }
        } else if (isTileType(tileID, 'ANGLE_WALL_4')) {
          if (i + j >= CPTL - 1) {
            gridTile[i][j] = 0;
          }
        } else { // tile is entirely nontraversable
          return init2dArray(CPTL, CPTL, 0);
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
