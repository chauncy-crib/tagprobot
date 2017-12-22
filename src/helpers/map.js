import _ from 'lodash';
import { CPTL, PPCL, NT_KERNEL } from '../constants';
import { assert, assertGridInBounds } from '../utils/asserts';
import { isVisualMode } from '../utils/interface';
import { init2dArray, fillGridWithSubgrid } from '../utils/mapUtils';
import { tileHasName, getTileProperty, tileHasProperty, tileIsOneOf } from '../tiles';
// TODO(davidabrahams): remove these eslint disables once we actually do dynammic updates
/* eslint-disable no-unused-vars */
import {
  updateNTSprites,
  generatePermanentNTSprites,
  areTempNTSpritesDrawn,
  setNTSpritesDrawn,
  drawNavMesh,
} from '../draw/drawings';
import { invertBinary2dArray, convolve } from './convolve';
import { getDTGraph, getMergedGraph, getUnmergedGraph } from '../navmesh/triangulation';
import { updateMergedGraph, updateUnmergedGraph } from '../navmesh/polygon';
/* eslint-enable no-unused-vars */


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


/**
 * Updates the traversability grid in a selected area from the num NTO grid
 * @param numNTO {number[][]} - a count of nontraversable objects in cells
 * @param traversability {number[][]} - a binary 2D array of traversability in cells
 * @param xMin {number} - the minimum x value to update (inclusive)
 * @param yMin {number} - the minimum y value to update (inclusive)
 * @param xMax {number} - the maximum x value to update (exclusive)
 * @param yMax {number} - the maximum y value to update (exclusive)
 */
export function updateTraversabilityFromNumNTO(numNTO, traversability, xMin, yMin, xMax, yMax) {
  assertGridInBounds(numNTO, xMin, yMin);
  assertGridInBounds(numNTO, xMax - 1, yMax - 1);

  for (let xc = xMin; xc < xMax; xc++) {
    for (let yc = yMin; yc < yMax; yc++) {
      // if there are no NTO here, define it as traversable
      traversability[xc][yc] = numNTO[xc][yc] === 0 ? 1 : 0;
    }
  }
}


/**
 * Returns a 2d cell array of traversible (1) and blocked (0) cells inside a tile. Runtime:
 *   O(CPTL^2)
 * @param {number} tileId - the id of the tile that should be split into cells and
 *   parsed for traversability
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


/**
 * Updates the numNTO grid in the area affected by a single tile changing its traversability state
 * @param {number[][]} numNTO - the count of NTO within the affected area of the NT_KERNEL
 * @param xMin {number} - the minimum x value to update (inclusive)
 * @param yMin {number} - the minimum y value to update (inclusive)
 * @param xMax {number} - the maximum x value to update (exclusive)
 * @param yMax {number} - the maximum y value to update (exclusive)
 * @param {boolean} tileTraversability - the traversability for the tile that was updated and is
 *   now affecting the numNTO grid
 */
export function updateNumNTO(numNTO, xMin, yMin, xMax, yMax, tileTraversability) {
  assertGridInBounds(numNTO, xMin, yMin);
  assertGridInBounds(numNTO, xMax - 1, yMax - 1);

  // Decrease numNTO if tile was NT and is now T, increase numNTO if tile was T and is now NT
  const numNTOChange = tileTraversability ? -1 : 1;
  for (let xc = xMin; xc < xMax; xc++) {
    for (let yc = yMin; yc < yMax; yc++) {
      const newNumNTO = numNTO[xc][yc] + numNTOChange;
      assert(newNumNTO >= 0, `numNTO is below zero at cell: (${xc}, ${yc})`);
      numNTO[xc][yc] = newNumNTO;
    }
  }
}


/**
 * Initializes mapTraversabilityCells to a grid of size map.length * CPTL with the correct values.
 *   Store all non-permanent locations in tilesToUpdate, and their corresponding values in
 *   tilesToUpdateValues. Initialize permanent sprites for all permanent NT sprites. Runtime:
 *   O(N^2 * CPTL^2)
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
    invertBinary2dArray(mapTraversabilityCells), // invert so that NTOs are represented by 1s
    NT_KERNEL,
  );
  init2dArray(xtl * CPTL, ytl * CPTL, 0, mapTraversabilityCellsWithBuf);
  updateTraversabilityFromNumNTO(
    numNTOWithinBufCells, // numNTO
    mapTraversabilityCellsWithBuf, // traversability
    0, // xMin
    0, // yMin
    numNTOWithinBufCells.length - 1, // xMax
    numNTOWithinBufCells[0].length - 1, // yMax
  );
}

/**
 * Given the tagpro map and a tile location which has changed state, update the unmergedGraph,
 *   mergedGraph, polypointGraph, and redraw the navmesh
 */
export function updateAndRedrawNavmesh(map, xt, yt) { // eslint-disable-line no-unused-vars
  // TODO(davidabrahams): uncomment all of this and remove the eslint-disable once we actually do
  //   dynamic updates. Right now we don't, because redrawing the entire navmesh and recalculating
  //   all the polypoints is too slow.
  // updateUnmergedGraph(getUnmergedGraph(), map, xt, yt);
  // const { unfixEdges, constrainingEdges, removeVertices, addVertices } =
  //   updateMergedGraph(getMergedGraph(), getUnmergedGraph(), map, xt, yt);
  // getDTGraph().dynamicUpdate(unfixEdges, constrainingEdges, removeVertices, addVertices);
  // getDTGraph().calculatePolypointGraph();
  // drawNavMesh();
}

/**
 * Returns a 2D array of traversable (1) and blocked (0) cells. Size of return grid is map.length *
 *   CPTL. The 2D array is an array of the columns in the game. empty_tiles[0] is the left-most
 *   column. Each column array is an array of the tiles in that column, with 1s and 0s.
 *   empty_tiles[0][0] is the upper-left corner tile. Runtime: O(M*CPTL^2) with drawings on,
 *   O(M + S*CPTL^2) with drawings off
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
      // O(CTPL^2)
      fillGridWithSubgrid(
        mapTraversabilityCells,
        getTileTraversabilityInCells(map[xy.xt][xy.yt]),
        xy.xt * CPTL,
        xy.yt * CPTL,
      );
      // Index of the top-left cell in the tile that just updated
      const xFirstCell = xy.xt * CPTL;
      const yFirstCell = xy.yt * CPTL;

      // When a tile's traversability is changed, everything within the reach of the NT_KERNEL will
      //   be changed as well. Here, we define the affected area so that we know where to
      //   dynamically update numNTOWithinBufCells and mapTraversabilityCellsWithBuf.
      const ntKernelReach = Math.floor(NT_KERNEL.length / 2);
      const minXCell = xFirstCell - ntKernelReach;
      const minYCell = yFirstCell - ntKernelReach;
      const maxXCell = xFirstCell + CPTL + ntKernelReach;
      const maxYCell = yFirstCell + CPTL + ntKernelReach;

      updateNumNTO(
        numNTOWithinBufCells,
        minXCell,
        minYCell,
        maxXCell,
        maxYCell,
        tileTraversability,
      );
      updateTraversabilityFromNumNTO(
        numNTOWithinBufCells,
        mapTraversabilityCellsWithBuf,
        minXCell,
        minYCell,
        maxXCell,
        maxYCell,
      );
      // If the NT sprites are already on the screen, update the sprites for this tile, because
      //   the tile has changed state
      if (areTempNTSpritesDrawn()) updateNTSprites(xy.xt, xy.yt, mapTraversabilityCells);

      updateAndRedrawNavmesh(map, xy.xt, xy.yt);
    }

    // If the NT sprites are not already on the screen, then update the sprites for all tiles. This
    //   ensures that when visual mode is turned on, new sprites are generated for all temp-NT
    //   tiles. If visual mode is off, then the call to updateNTSprites does nothing.
    if (!areTempNTSpritesDrawn()) updateNTSprites(xy.xt, xy.yt, mapTraversabilityCells);
  }
  if (isVisualMode()) setNTSpritesDrawn(true);
  return mapTraversabilityCellsWithBuf;
}
