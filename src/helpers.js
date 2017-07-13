
export const tileTypes = {
  EMPTY_SPACE: 0,
  SQUARE_WALL: 1,
  ANGLE_WALL_1: 1.1,
  ANGLE_WALL_2: 1.2,
  ANGLE_WALL_3: 1.3,
  ANGLE_WALL_4: 1.4,
  REGULAR_FLOOR: 2,
  RED_FLAG: 3,
  RED_FLAG_TAKEN: 3.1,
  BLUE_FLAG: 4,
  BLUE_FLAG_TAKEN: 4.1,
  SPEEDPAD_ACTIVE: 5,
  SPEEDPAD_INACTIVE: 5.1,
  POWERUP_SUBGROUP: 6,
  JUKEJUICE: 6.1,
  ROLLING_BOMB: 6.2,
  TAGPRO: 6.3,
  MAX_SPEED: 6.4,
  SPIKE: 7,
  BUTTON: 8,
  INACTIVE_GATE: 9,
  GREEN_GATE: 9.1,
  RED_GATE: 9.2,
  BLUE_GATE: 9.3,
  BOMB: 10,
  INACTIVE_BOMB: 10.1,
  RED_TEAMTILE: 11,
  BLUE_TEAMTILE: 12,
  ACTIVE_PORTAL: 13,
  INACTIVE_PORTAL: 13.1,
  SPEEDPAD_RED_ACTIVE: 14,
  SPEEDPAD_RED_INACTIVE: 14.1,
  SPEEDPAD_BLUE_ACTIVE: 15,
  SPEEDPAD_BLUE_INACTIVE: 15.1,
  YELLOW_FLAG: 16,
  YELLOW_FLAG_TAKEN: 16.1,
  RED_ENDZONE: 17,
  BLUE_ENDZONE: 18,
};

/* eslint-disable one-var, no-unused-vars*/
export const EMPTY_TILE = 0,
  RED_TEAM = 1,
  BLUE_TEAM = 2,
  RED_FLAG = 3,
  TAKEN_RED_FLAG = 3.1,
  BLUE_FLAG = 4,
  TAKEN_BLUE_FLAG = 4.1,
  YELLOW_FLAG = 16,
  TAKEN_YELLOW_FLAG = 16.1,
  RED_ENDZONE = 17,
  BLUE_ENDZONE = 18,
  TAKEN_ENEMY_FLAG = null,
  TAKEN_ALLY_FLAG = null;
/* eslint-enable one-var, no-unused-vars*/


/*
 * Returns true if tileID is traversable without consequences.
 *
 * Traversable includes: regular floor, all flags, inactive speedpad,
 *   inactive gate, friendly gate, inactive bomb, teamtiles, inactive
 *   portal, endzones
 * Untraversable includes: empty space, walls, active speedpad, any
 *   powerup, spike, button, enemy/green gate, bomb, active portal
 */
export function isTraversable(tileID, me) {
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
      return me.team === RED_TEAM;
    case tileTypes.BLUE_GATE:
      return me.team === BLUE_TEAM;
    default:
      return false;
  }
}

/* eslint no-param-reassign: ["error", { "ignorePropertyModificationsFor": ["bigGrid"] }] */

/*
 * place all values from smallGrid into bigGrid. Align the upper left corner at x, y
 */
function fillGridWithSubgrid(bigGrid, smallGrid, x, y) {
  for (let i = 0; i < smallGrid.length; i++) {
    for (let j = 0; j < smallGrid[0].length; j++) {
      bigGrid[i + x][j + y] = smallGrid[i][j];
    }
  }
}


/* Returns a 2d cell array of traversible (1) and blocked (0) cells inside a tile.
 *
 * tileTraverse: if this tile is traversable
 * cpt: number of cells per tile
 * objRadius: radius of untraversable object in pixels
 */
export function traversableCellsInTile(tileTraverse, cpt, objRadius) {
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

  if (!tileTraverse) {
    const midCell = (cpt - 1.0) / 2.0;
    for (i = 0; i < cpt; i++) {
      for (j = 0; j < cpt; j++) {
        const xDiff = Math.max(Math.abs(i - midCell) - 0.5, 0);
        const yDiff = Math.max(Math.abs(j - midCell) - 0.5, 0);
        const cellDist = Math.sqrt((xDiff * xDiff) + (yDiff * yDiff));
        const pixelDist = cellDist * (40 / cpt);
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
 * Returns a 2D array of traversable (1) and blocked (0) tiles. Size of return grid is
 * map.length * cpt
 *
 * The 2D array is an array of the columns in the game. empty_tiles[0] is
 * the left-most column. Each column array is an array of the tiles in
 * that column, with 1s and 0s.  empty_tiles[0][0] is the upper-left corner
 * tile.
 *
 * cpt: number of cells per tile
 */
function getTraversableTiles(cpt) {
  const xl = tagpro.map.length;
  const yl = tagpro.map[0].length;
  const emptyTiles = [];
  let x;
  for (x = 0; x < xl * cpt; x++) {
    emptyTiles[x] = new Array(yl * cpt);
  }
  for (x = 0; x < xl; x++) {
    for (let y = 0; y < yl; y++) {
      const objRadius = 40; // TODO: Set radius to be correct value for each cell object
      fillGridWithSubgrid(emptyTiles, traversableCellsInTile(isTraversable(tagpro.map[x][y]), cpt,
        objRadius), x * cpt, y * cpt);
    }
  }
  // cells = emptyTiles; // TODO: not sure what this is for
  return emptyTiles;
}
