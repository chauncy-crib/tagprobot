import _ from 'lodash';
import { CPTL, PPCL, NTKernel } from '../constants';
import { assert, assertGridInBounds } from '../utils/asserts';
import { tileHasName, getTileProperty, tileHasProperty, tileIsOneOf } from '../tiles';
import { updateNTSprites, generatePermanentNTSprites } from '../draw/drawings';
import { invertBinary2dArray, convolve } from './convolve';


// A 2D array of size tagpro.map.length*CPTL by tagpro.map[0].length*CPTL. Value
// in each entry is 1 if the cell is fully traversable or 0 if the cell is not
// fully traversable.
const mapTraversabilityCells = []; // before NT buffer
const mapTraversabilityCellsWithBuf = []; // after NT buffer
// A 2D array of size tagpro.map.length*CPTL by tagpro.map[0].length*CPTL. Value
// in each entry is the number of cells within the reach of the NTBuffer that are
// not fully traversable. Values of 0 can be traversed safely, values of 1 or
// more cannot be traversed safely.
let numNTOWithinBufCells = [];
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


/*
 * @param numNTO {number[][]} - a count of nontraversable objects in cells
 * @param traversability {number[][]} - a binary 2D array of traversability in cells
 * @param xMin {number} - the minimum x value to update
 * @param yMin {number} - the minimum y value to update
 * @param xMax {number} - the maximum x value to update
 * @param yMax {number} - the maximum y value to update
 * @return {number[][]} a traversability grid in cells
 */
export function getTraversabilityFromNumNTO(numNTO, traversability, xMin, yMin, xMax, yMax) {
  assertGridInBounds(numNTO, xMin, yMin);
  assertGridInBounds(numNTO, xMax, yMax);

  for (let xc = xMin; xc <= xMax; xc++) {
    for (let yc = yMin; yc <= yMax; yc++) {
      // if there are no NTO here, define it as traversable
      traversability[xc][yc] = numNTO[xc][yc] === 0 ? 1 : 0;
    }
  }
  return traversability;
}


/* Returns a 2d cell array of traversible (1) and blocked (0) cells inside a tile.
 * Runtime: O(CPTL^2)
 *
 * @param {number} tileId - the id of the tile that should be split into cells and
 * parsed for traversability
 */
export function getTileTraversabilityInCells(tileId) {
  // Start with all cells being traversable

  if (getTileProperty(tileId, 'traversable')) { // tile is fully traversable
    return init2dArray(CPTL, CPTL, 1);
  }

  // if tile has no radius and is not an angle wall, return full non-traversable tile
  if (
    !tileHasProperty(tileId, 'radius') &&
    !tileIsOneOf(tileId, ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4'])
  ) {
    return init2dArray(CPTL, CPTL, 0);
  }

  // tile is partially traversable
  const tile = init2dArray(CPTL, CPTL, 1);
  const midCell = (CPTL - 1.0) / 2.0;
  for (let xc = 0; xc < CPTL; xc++) {
    for (let yc = 0; yc < CPTL; yc++) {
      if (tileHasProperty(tileId, 'radius')) { // tile is circular
        const xDiff = Math.max(Math.abs(xc - midCell) - 0.5, 0);
        const yDiff = Math.max(Math.abs(yc - midCell) - 0.5, 0);
        const cellDist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
        const pixelDist = cellDist * PPCL;
        if (pixelDist <= getTileProperty(tileId, 'radius')) {
          tile[xc][yc] = 0;
        }
      } else { // tile is angled wall
        assert(
          tileIsOneOf(tileId, ['ANGLE_WALL_1', 'ANGLE_WALL_2', 'ANGLE_WALL_3', 'ANGLE_WALL_4']),
          'tile expected to be angle wall',
        );
        // eslint-disable-next-line no-lonely-if
        if (tileHasName(tileId, 'ANGLE_WALL_1') && yc - xc >= 0) {
          tile[xc][yc] = 0;
        } else if (tileHasName(tileId, 'ANGLE_WALL_2') && xc + yc <= CPTL - 1) {
          tile[xc][yc] = 0;
        } else if (tileHasName(tileId, 'ANGLE_WALL_3') && yc - xc <= 0) {
          tile[xc][yc] = 0;
        } else if (tileHasName(tileId, 'ANGLE_WALL_4') && xc + yc >= CPTL - 1) {
          tile[xc][yc] = 0;
        }
      }
    }
  }
  return tile;
}


/*
 * Updates the numNTO grid in the area affected by a single tile changing its traversability state
 *
 * @param {number[][]} numNTO - the count of NTO within the affected area of the NTKernel
 * @param xMin {number} - the minimum x value to update
 * @param yMin {number} - the minimum y value to update
 * @param xMax {number} - the maximum x value to update
 * @param yMax {number} - the maximum y value to update
 * @param {boolean} tileTraversability - the traversability for the tile that was updated and is
 * now affecting the numNTO grid
 */
export function updateNumNTO(numNTO, xMin, yMin, xMax, yMax, tileTraversability) {
  assertGridInBounds(numNTO, xMin, yMin);
  assertGridInBounds(numNTO, xMax, yMax);

  // Decrese numNTO if tile was NT and is now T, increase numNTO if tile was T and is now NT
  const numNTOChange = tileTraversability ? -1 : 1;
  for (let xc = xMin; xc <= xMax; xc++) {
    for (let yc = yMin; yc <= yMax; yc++) {
      const newNumNTO = numNTO[xc][yc] + numNTOChange;
      if (newNumNTO < 0) {
        throw new Error(`numNTO is below zero at cell: (${xc}, ${yc})`);
      }
      numNTO[xc][yc] = newNumNTO; // eslint-disable-line no-param-reassign
    }
  }
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
  assert(_.isEmpty(mapTraversabilityCells), 'map not empty when initializing');
  assert(_.isEmpty(numNTOWithinBufCells), 'numNTO map not empty when initializing');
  assert(_.isEmpty(mapTraversabilityCellsWithBuf), 'map with buf not empty when initializing');
  const xtl = map.length;
  const ytl = map[0].length;
  init2dArray(xtl * CPTL, ytl * CPTL, 0, mapTraversabilityCells);
  for (let xt = 0; xt < xtl; xt++) {
    for (let yt = 0; yt < ytl; yt++) {
      const tileId = map[xt][yt];
      fillGridWithSubgrid(
        mapTraversabilityCells,
        getTileTraversabilityInCells(tileId),
        xt * CPTL,
        yt * CPTL,
      );
      if (!getTileProperty(tileId, 'permanent')) {
        tilesToUpdate.push({ xt, yt });
        tilesToUpdateValues.push(tileId);
        if (!getTileProperty(tileId, 'traversable')) {
          updateNTSprites(xt, yt, mapTraversabilityCells);
        }
      } else if (!getTileProperty(tileId, 'traversable')) {
        generatePermanentNTSprites(xt, yt, mapTraversabilityCells);
      }
    }
  }
  numNTOWithinBufCells = convolve(
    invertBinary2dArray(mapTraversabilityCells),
    NTKernel,
  );
  init2dArray(xtl * CPTL, ytl * CPTL, 0, mapTraversabilityCellsWithBuf);
  getTraversabilityFromNumNTO(
    numNTOWithinBufCells,
    mapTraversabilityCellsWithBuf,
    0,
    0,
    numNTOWithinBufCells.length - 1,
    numNTOWithinBufCells[0].length - 1,
  );
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
  assert(
    tilesToUpdate.length === tilesToUpdateValues.length,
    'the number of tiles to update and the number of values stored for them are not equal',
  );
  for (let i = 0; i < tilesToUpdate.length; i++) {
    const xy = tilesToUpdate[i];
    const tileId = map[xy.xt][xy.yt];
    const tileTraversability = getTileProperty(tileId, 'traversable');
    // if the traversability of the tile in this location has changed since the last state
    if (tileTraversability !== getTileProperty(tilesToUpdateValues[i], 'traversable')) {
      tilesToUpdateValues[i] = tileId;
      // Index of the top-left cell in the tile that just updated
      const xFirstCell = xy.xt * CPTL;
      const yFirstCell = xy.yt * CPTL;

      // When a tile's traversability is changed, everything within the reach of the NTKernel will
      // be changed as well. Here, we define the affected area so that we know where to dynamically
      // update numNTOWithinBufCells and mapTraversabilityCellsWithBuf.
      const NTKernelReach = Math.floor(NTKernel.length / 2);
      const minXCell = xFirstCell - NTKernelReach;
      const minYCell = yFirstCell - NTKernelReach;
      const maxXCell = xFirstCell + (CPTL - 1) + NTKernelReach;
      const maxYCell = yFirstCell + (CPTL - 1) + NTKernelReach;

      updateNumNTO(
        numNTOWithinBufCells,
        minXCell,
        minYCell,
        maxXCell,
        maxYCell,
        tileTraversability,
      );
      getTraversabilityFromNumNTO(
        numNTOWithinBufCells,
        mapTraversabilityCellsWithBuf,
        minXCell,
        minYCell,
        maxXCell,
        maxYCell,
      );
    }
    // O(CTPL^2).
    // TODO: We can optimize this by only calling updateNTSprites when a cell changes.
    updateNTSprites(xy.xt, xy.yt, mapTraversabilityCellsWithBuf);
  }
  return mapTraversabilityCellsWithBuf;
}
