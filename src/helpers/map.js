import _ from 'lodash';
import { CPTL, PPCL } from '../constants';
import { assert, assertGridInBounds } from '../utils/asserts';
import { tileHasName, getTileProperty, tileHasProperty } from '../tiles';
import { updateNTSprites, generatePermanentNTSprites } from '../draw/drawings';

const mapTraversabilityCells = [];
// A list of x, y pairs, which are the locations in the map that might change
const tilesToUpdate = [];
const tilesToUpdateValues = []; // the values stored in those locations


/*
 * Initializes and returns a 2D array with the specified width, height, and
 * default value.
 *
 * Runtime: O(width * height)
 *
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
 * Runtime: O(CPTL^2)
 *
 * @param {number} tileId - the id of the tile that should be split into cells and
 * parsed for traversability
 */
export function getTileTraversabilityInCells(tileId) {
  // Start with all cells being traversable
  const gridTile = init2dArray(CPTL, CPTL, 1);

  if (!getTileProperty(tileId, 'traversable')) { // tile is not fully traversable
    const midCell = (CPTL - 1.0) / 2.0;
    for (let i = 0; i < CPTL; i++) {
      for (let j = 0; j < CPTL; j++) {
        // tile is circular non-traversable object
        if (tileHasProperty(tileId, 'radius')) {
          const xDiff = Math.max(Math.abs(i - midCell) - 0.5, 0);
          const yDiff = Math.max(Math.abs(j - midCell) - 0.5, 0);
          const cellDist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
          const pixelDist = cellDist * PPCL;
          if (pixelDist <= getTileProperty(tileId, 'radius')) {
            gridTile[i][j] = 0;
          }
        // tile is noncircular and partially nontraversable (angled walls)
        } else if (tileHasName(tileId, 'ANGLE_WALL_1')) {
          if (j - i >= 0) {
            gridTile[i][j] = 0;
          }
        } else if (tileHasName(tileId, 'ANGLE_WALL_2')) {
          if (i + j <= CPTL - 1) {
            gridTile[i][j] = 0;
          }
        } else if (tileHasName(tileId, 'ANGLE_WALL_3')) {
          if (j - i <= 0) {
            gridTile[i][j] = 0;
          }
        } else if (tileHasName(tileId, 'ANGLE_WALL_4')) {
          if (i + j >= CPTL - 1) {
            gridTile[i][j] = 0;
          }
        // tile is entirely nontraversable
        } else {
          return init2dArray(CPTL, CPTL, 0);
        }
      }
    }
  }

  return gridTile;
}


/*
 * Initializes mapTraversabilityCells to a grid of size map.length * CPTL with
 * the correct values. Store all non-permanent locations in tilesToUpdate, and
 * their corresponding values in tilesToUpdateValues. Initialize permanent sprites
 * for all permanent NT sprites.
 * Runtime: O(N^2 * CPTL^2)
 *
 * @param {number} map - 2D array representing the Tagpro map
 */
export function initMapTraversabilityCells(map) {
  assert(_.isEmpty(mapTraversabilityCells), 'map already has values when initializing');
  const xl = map.length;
  const yl = map[0].length;
  init2dArray(xl * CPTL, yl * CPTL, 0, mapTraversabilityCells);
  for (let xt = 0; xt < xl; xt++) {
    for (let yt = 0; yt < yl; yt++) {
      const tileId = map[xt][yt];
      fillGridWithSubgrid(
        mapTraversabilityCells,
        getTileTraversabilityInCells(tileId),
        xt * CPTL,
        yt * CPTL,
      );
      if (!getTileProperty(tileId, 'permanent')) {
        tilesToUpdate.push({ x: xt, y: yt });
        tilesToUpdateValues.push(tileId);
        if (!getTileProperty(tileId, 'traversable')) {
          updateNTSprites(xt, yt, mapTraversabilityCells);
        }
      } else if (!getTileProperty(tileId, 'traversable')) {
        generatePermanentNTSprites(xt, yt, mapTraversabilityCells);
      }
    }
  }
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
 * Runtime: O(E*CPTL^2) with drawings on, O(E + S*CPTL^2) with drawings off
 *
 * @param {number} map - 2D array representing the Tagpro map
 */
export function getMapTraversabilityInCells(map) {
  assert(tilesToUpdate.length === tilesToUpdateValues.length,
    'the number of tiles to update and the number of values stored for them are not equal');
  for (let i = 0; i < tilesToUpdate.length; i++) {
    const xy = tilesToUpdate[i];
    if (map[xy.x][xy.y] !== tilesToUpdateValues[i]) {
      tilesToUpdateValues[i] = map[xy.x][xy.y];
      // O(CTPL^2)
      fillGridWithSubgrid(
        mapTraversabilityCells,
        getTileTraversabilityInCells(map[xy.x][xy.y]),
        xy.x * CPTL,
        xy.y * CPTL,
      );
    }
    // O(CTPL^2).
    // TODO: We can optimize this by only calling updateNTSprites when a cell changes.
    updateNTSprites(xy.x, xy.y, mapTraversabilityCells);
  }
  return mapTraversabilityCells;
}
