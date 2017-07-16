import { tileTypes, PIXELS_PER_TILE } from '../constants';
import { amBlue, amRed } from './player';


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
      return false;
  }
}


/* eslint no-param-reassign: ["error", { "ignorePropertyModificationsFor": ["bigGrid"] }] */
/*
 * place all values from smallGrid into bigGrid. Align the upper left corner at x, y
 */
export function fillGridWithSubgrid(bigGrid, smallGrid, x, y) {
  const smallGridWidth = smallGrid.length;
  const smallGridHeight = smallGrid[0].length;

  for (let i = 0; i < smallGridWidth; i++) {
    for (let j = 0; j < smallGridHeight; j++) {
      bigGrid[i + x][j + y] = smallGrid[i][j];
    }
  }
}


/* Returns a 2d cell array of traversible (1) and blocked (0) cells inside a tile.
 *
 * tileIsTraversable: if this tile is traversable
 * cpt: number of cells per tile
 * objRadius: radius of untraversable object in pixels
 */
export function traversableCellsInTile(tileIsTraversable, cpt, objRadius) {
  const gridTile = [];
  // Start with all traversable
  let i;
  let j;
  for (i = 0; i < cpt; i++) {
    gridTile[i] = new Array(cpt);
    for (j = 0; j < cpt; j++) {
      gridTile[i][j] = 1;
    }
  }

  if (!tileIsTraversable) {
    const midCell = (cpt - 1.0) / 2.0;
    for (i = 0; i < cpt; i++) {
      for (j = 0; j < cpt; j++) {
        const xDiff = Math.max(Math.abs(i - midCell) - 0.5, 0);
        const yDiff = Math.max(Math.abs(j - midCell) - 0.5, 0);
        const cellDist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
        const ppc = PIXELS_PER_TILE / cpt; // number of pixels per cell
        const pixelDist = cellDist * ppc;
        if (pixelDist <= objRadius) {
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
 * map.length * cpt
 *
 * The 2D array is an array of the columns in the game. empty_tiles[0] is
 * the left-most column. Each column array is an array of the tiles in
 * that column, with 1s and 0s.  empty_tiles[0][0] is the upper-left corner
 * tile.
 *
 * cpt: number of cells per tile
 * map: 2D array representing the Tagpro map
 */
export function getTraversableCells(cpt, map) {
  const xl = map.length;
  const yl = map[0].length;
  const emptyCells = [];
  let x;
  for (x = 0; x < xl * cpt; x++) {
    emptyCells[x] = new Array(yl * cpt);
  }
  for (x = 0; x < xl; x++) {
    for (let y = 0; y < yl; y++) {
      // TODO: Set radius to be correct value for each cell object. Currently using 29 because it
      // is > 20 * sqrt(2), the furthest distance from the center of a tile to its corner, in
      // pixels. This guarantees that if the tile has anything non-tranversable in it (wall, ball,
      // spike, corner wall), the entire tile is marked as non-traversable
      const objRadius = 29;
      fillGridWithSubgrid(
        emptyCells,
        traversableCellsInTile(
          isTraversable(map[x][y]),
          cpt,
          objRadius,
        ),
        x * cpt,
        y * cpt,
      );
    }
  }
  return emptyCells;
}


/*
 * Returns the position (in pixels x,y and grid positions xg, yg
 * of first of the specified tile types to appear starting in the
 * top left corner and moving in a page-reading fashion.
 *
 * tiles: either a number representing a tileType, or an array of such numbers
 */
export function findTile(tiles) {
  // Force an array if the input is just one tile
  const tileArray = [].concat(tiles);

  for (let x = 0, xl = tagpro.map.length, yl = tagpro.map[0].length; x < xl; x++) {
    for (let y = 0; y < yl; y++) {
      for (let i = 0; i < tileArray.length; i++) {
        const tile = tileArray[i];
        if (tagpro.map[x][y] === tile) {
          return { x: x * PIXELS_PER_TILE, y: y * PIXELS_PER_TILE, xg: x, yg: y };
        }
      }
    }
  }
  console.error(`Unable to find tile: ${tiles}`);
  return {};
}


/*
 * Initializes and returns a 2D array with the specified width, height, and
 * default value.
 *
 * width: the width of the initialized 2D array
 * height: the height of the initialized 2D array
 * defaultVal: the value to give each element in the initialized 2D array
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
 * Returns the sum of all corresponding elements from two matrices being
 * multiplied together. For example:
 *   a = 1 2   b = 4 1
 *       3 4       2 3
 *   multiplyCorrespondingElementsAndSum(a, b)
 *   (1*4) + (2*1) + (3*2) + (4*3) = 21
 *
 * m1: the first matrix
 * m2: the second matrix (of the same dimensions as m1)
 */
export function multiplyCorrespondingElementsAndSum(m1, m2) {
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
