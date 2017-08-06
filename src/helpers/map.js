import { tileTypes, PPTL, CPTL } from '../constants';
import { amBlue, amRed } from './player';
import { assertGridInBounds } from '../../src/utils/asserts';


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
 * Nontraversable includes: empty space, walls, active speedpad, any
 *   powerup, spike, button, enemy/green gate, bomb, active portal
 *
 * @param {number} tileID - the ID of the tile that should be checked for
 * traversability
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
      return false;
    case tileTypes.RED_GATE:
    case tileTypes.SPEEDPAD_BLUE_ACTIVE:
      return amRed();
    case tileTypes.BLUE_GATE:
    case tileTypes.SPEEDPAD_RED_ACTIVE:
      return amBlue();
    default:
      throw new Error(`Unknown tileID: ${tileID}`);
  }
}


/*
 * Is circular nontraversable object? Returns a boolean stating whether or not
 * the given nontraversable object tile ID is a circular nontraversable object.
 *
 * Circular nontraversable objects include: boosts, powerups, spikes, buttons,
 * bombs, and active portals
 */
export function isCNTO(tileID) {
  switch (tileID) {
    case 'marsball':
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
    case tileTypes.SPIKE:
    case tileTypes.BUTTON:
      return true;
    case tileTypes.EMPTY_SPACE:
    case tileTypes.SQUARE_WALL:
    case tileTypes.ANGLE_WALL_1:
    case tileTypes.ANGLE_WALL_2:
    case tileTypes.ANGLE_WALL_3:
    case tileTypes.ANGLE_WALL_4:
    case tileTypes.GREEN_GATE:
    case tileTypes.RED_GATE:
    case tileTypes.BLUE_GATE:
      return false;
    case tileTypes.REGULAR_FLOOR:
    case tileTypes.RED_FLAG:
    case tileTypes.RED_FLAG_TAKEN:
    case tileTypes.BLUE_FLAG_TAKEN:
    case tileTypes.BLUE_FLAG:
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


/*
 * Get circular nontraversable object radius. Returns the radius, in pixels, of
 * the given circular nontraversable object tile ID.
 *
 * Circular nontraversable objects include: boosts, powerups, spikes, buttons,
 * bombs, and active portals
 *
 * @param {number} tileID - the ID of the circular nontraversable tile that you
 * wish to get the radius of
 */
export function getCNTORadius(tileID) {
  switch (tileID) {
    case 'blueball':
    case 'redball':
      return 19;
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
    case tileTypes.EMPTY_SPACE:
    case tileTypes.SQUARE_WALL:
    case tileTypes.ANGLE_WALL_1:
    case tileTypes.ANGLE_WALL_2:
    case tileTypes.ANGLE_WALL_3:
    case tileTypes.ANGLE_WALL_4:
    case tileTypes.GREEN_GATE:
    case tileTypes.RED_GATE:
    case tileTypes.BLUE_GATE:
      throw new Error(`A noncircular nontraversable tile was given: ${tileID}`);
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
      throw new Error(`A traversable tile was given: ${tileID}`);
    case 'marsball':
      throw new Error('Marsball was given. Case is not handled.');
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
  let gridTile = init2dArray(CPTL, CPTL, 1);

  if (!isTraversable(tileID)) {
    if (isCNTO(tileID)) {
      const midCell = (CPTL - 1.0) / 2.0;
      for (let i = 0; i < CPTL; i++) {
        for (let j = 0; j < CPTL; j++) {
          const xDiff = Math.max(Math.abs(i - midCell) - 0.5, 0);
          const yDiff = Math.max(Math.abs(j - midCell) - 0.5, 0);
          const cellDist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
          const ppc = PPTL / CPTL; // number of pixels per cell length
          const pixelDist = cellDist * ppc;
          if (pixelDist <= getCNTORadius(tileID)) {
            // This cell touches the object, is not traversable
            gridTile[i][j] = 0;
          }
        }
      } // tile is noncircular and nontraversable
    } else if (tileID === tileTypes.ANGLE_WALL_1) {
      for (let i = 0; i < CPTL; i++) {
        for (let j = 0; j < CPTL; j++) {
          if (j - i >= 0) {
            gridTile[i][j] = 0;
          }
        }
      }
    } else if (tileID === tileTypes.ANGLE_WALL_2) {
      for (let i = 0; i < CPTL; i++) {
        for (let j = 0; j < CPTL; j++) {
          if (i + j <= CPTL - 1) {
            gridTile[i][j] = 0;
          }
        }
      }
    } else if (tileID === tileTypes.ANGLE_WALL_3) {
      for (let i = 0; i < CPTL; i++) {
        for (let j = 0; j < CPTL; j++) {
          if (j - i <= 0) {
            gridTile[i][j] = 0;
          }
        }
      }
    } else if (tileID === tileTypes.ANGLE_WALL_4) {
      for (let i = 0; i < CPTL; i++) {
        for (let j = 0; j < CPTL; j++) {
          if (i + j >= CPTL - 1) {
            gridTile[i][j] = 0;
          }
        }
      }
    } else { // tile is entirely nontraversable
      gridTile = init2dArray(CPTL, CPTL, 0);
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
